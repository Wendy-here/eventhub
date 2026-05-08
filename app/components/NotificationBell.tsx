'use client'
import{useState,useEffect,useRef}from'react'
import{supabase}from'@/app/lib/supabase'

type DbNotif={
id:string
user_email:string|null
message:string
link:string|null
is_read:boolean
created_at:string
}

type ComputedReminder={
id:string
message:string
link:string
kind:'1d'|'1h'
}

function timeAgo(d:string){
const diff=Date.now()-new Date(d).getTime()
const m=Math.floor(diff/60000)
if(m<1)return'just now'
if(m<60)return m+'m ago'
const h=Math.floor(m/60)
if(h<24)return h+'h ago'
return Math.floor(h/24)+'d ago'
}

function computeReminders(events:{id:string,title:string,date:string,event_time:string|null}[]):ComputedReminder[]{
const now=Date.now()
const reminders:ComputedReminder[]=[]
for(const ev of events){
if(!ev.event_time)continue
const dt=new Date(ev.date.slice(0,10)+'T'+ev.event_time).getTime()
if(isNaN(dt)||dt<now)continue
const diff=dt-now
if(diff<3600000){
reminders.push({id:'r1h-'+ev.id,message:'Starting in under an hour: '+ev.title,link:'/events/'+ev.id,kind:'1h'})
}else if(diff<86400000){
reminders.push({id:'r1d-'+ev.id,message:'Tomorrow: '+ev.title,link:'/events/'+ev.id,kind:'1d'})
}
}
return reminders
}

export default function NotificationBell({userEmail}:{userEmail:string}){
const[notifs,setNotifs]=useState<DbNotif[]>([])
const[reminders,setReminders]=useState<ComputedReminder[]>([])
const[open,setOpen]=useState(false)
const[markedRead,setMarkedRead]=useState<Set<string>>(new Set())
const ref=useRef<HTMLDivElement>(null)

// Fetch DB notifications (user-specific + broadcast null)
useEffect(()=>{
if(!userEmail)return
const load=async()=>{
const{data}=await supabase
.from('notifications')
.select('*')
.or('user_email.eq.'+userEmail+',user_email.is.null')
.order('created_at',{ascending:false})
.limit(30)
if(data)setNotifs(data)
}
load()

// Realtime: re-fetch on any insert
const ch=supabase.channel('bell-'+userEmail)
.on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications'},()=>load())
.subscribe()
return()=>{supabase.removeChannel(ch)}
},[userEmail])

// Fetch upcoming events for frontend-computed reminders
useEffect(()=>{
if(!userEmail)return
const today=new Date().toISOString().slice(0,10)
const twoDaysOut=new Date(Date.now()+172800000).toISOString().slice(0,10)
supabase.from('events').select('id,title,date,event_time')
.gte('date',today).lte('date',twoDaysOut)
.then(({data})=>{
if(data)setReminders(computeReminders(data as any))
})
},[userEmail])

useEffect(()=>{
const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}
document.addEventListener('mousedown',h)
return()=>document.removeEventListener('mousedown',h)
},[])

const unreadDb=notifs.filter(n=>!n.is_read&&!markedRead.has(n.id)).length
const unreadCount=unreadDb+reminders.length

const markAllRead=async()=>{
const ids=notifs.filter(n=>!n.is_read&&!markedRead.has(n.id)).map(n=>n.id)
if(ids.length){
await supabase.from('notifications').update({is_read:true}).in('id',ids)
setMarkedRead(prev=>new Set([...prev,...ids]))
}
}

const handleOpen=()=>{
const next=!open
setOpen(next)
if(next&&unreadCount>0)markAllRead()
}

const BellIcon=(
<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
<path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/>
<path d='M13.73 21a2 2 0 0 1-3.46 0'/>
</svg>
)

return(
<div ref={ref} style={{position:'relative',flexShrink:0}}>
<button
onClick={handleOpen}
aria-label={`Notifications${unreadCount>0?` (${unreadCount} unread)`:''}`}
style={{width:'36px',height:'36px',border:'1px solid #E5E7EB',borderRadius:'10px',background:'#ffffff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',color:'#6B7280',flexShrink:0}}
>
{BellIcon}
{unreadCount>0&&(
<span style={{position:'absolute',top:'6px',right:'6px',minWidth:'8px',height:'8px',background:'#FF6B00',borderRadius:'50%',border:'1.5px solid #ffffff',display:'flex',alignItems:'center',justifyContent:'center'}}/>
)}
</button>

{open&&(
<div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:'320px',background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'16px',boxShadow:'0 8px 32px rgba(0,0,0,.12)',overflow:'hidden',zIndex:200}}>
<div style={{padding:'14px 16px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<span style={{fontSize:'13px',fontWeight:700,color:'#1A1A1A'}}>Notifications</span>
{unreadCount>0&&<span style={{fontSize:'11px',background:'#FFF3EB',color:'#FF6B00',padding:'2px 8px',borderRadius:'999px',fontWeight:600}}>{unreadCount} new</span>}
</div>

<div style={{maxHeight:'380px',overflowY:'auto'}}>

{/* Frontend-computed reminders shown first */}
{reminders.map(r=>(
<a key={r.id} href={r.link} style={{display:'flex',gap:'10px',padding:'12px 16px',borderBottom:'1px solid #F9FAFB',textDecoration:'none',background:'#FFFAF7'}}>
<div style={{width:'32px',height:'32px',borderRadius:'10px',background:'#FFF3EB',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#FF6B00'}}>
{r.kind==='1h'
?<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>
:<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg>
}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:'12px',fontWeight:600,color:'#FF6B00',marginBottom:'2px'}}>Reminder</div>
<div style={{fontSize:'12.5px',color:'#1A1A1A',lineHeight:1.35}}>{r.message}</div>
</div>
<div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#FF6B00',flexShrink:0,marginTop:'5px'}}/>
</a>
))}

{/* DB notifications */}
{notifs.length===0&&reminders.length===0?(
<div style={{padding:'36px 16px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px'}}>
<div style={{marginBottom:'10px',display:'flex',justifyContent:'center',opacity:.35}}>
<svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg>
</div>
You're all caught up!
</div>
):notifs.map(n=>{
const isNew=!n.is_read&&!markedRead.has(n.id)
return(
<a key={n.id} href={n.link||'#'} style={{display:'flex',gap:'10px',padding:'12px 16px',borderBottom:'1px solid #F9FAFB',textDecoration:'none',background:isNew?'#FFFAF7':'#ffffff'}}>
<div style={{width:'32px',height:'32px',borderRadius:'10px',background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#6B7280'}}>
<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:'12.5px',fontWeight:isNew?600:400,color:'#1A1A1A',lineHeight:1.35,marginBottom:'3px'}}>{n.message}</div>
<div style={{fontSize:'10.5px',color:'#9CA3AF'}}>{timeAgo(n.created_at)}</div>
</div>
{isNew&&<div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#FF6B00',flexShrink:0,marginTop:'5px'}}/>}
</a>
)
})}
</div>
</div>
)}
</div>
)
}
