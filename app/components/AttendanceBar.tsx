'use client'
import{useState,useMemo}from'react'
import{supabase}from'@/app/lib/supabase'
import{useToast,ToastContainer}from'@/app/components/Toast'

type Attendance={id:string,event_id:string,user_email:string,user_name:string,status:'yes'|'maybe'|'no',created_at:string,updated_at:string}
type Props={eventId:string,eventTitle:string,initialAttendances:Attendance[],isAdmin:boolean,userEmail:string,userName:string}

const STATUS_META:{value:'yes'|'maybe'|'no',icon:string,label:string,color:string,bg:string,border:string}[]=[
{value:'yes', icon:'✅',label:'Going',      color:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0'},
{value:'maybe',icon:'❓',label:'Maybe',      color:'#d97706',bg:'#fffbeb',border:'#fde68a'},
{value:'no',  icon:'❌',label:"Can't go",   color:'#6b7280',bg:'#f9fafb',border:'#e5e7eb'},
]

function Avatar({name}:{name:string}){
const initials=name.split(' ').map((n:string)=>n[0]||'').join('').toUpperCase().slice(0,2)
return(
<div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#FFE4D1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:'#E65C00',flexShrink:0}}>
{initials}
</div>
)
}

export default function AttendanceBar({eventId,eventTitle,initialAttendances,isAdmin,userEmail,userName}:Props){
const[attendances,setAttendances]=useState<Attendance[]>(initialAttendances)
const[pendingStatus,setPendingStatus]=useState<'yes'|'maybe'|'no'|null>(null)
const[error,setError]=useState('')
const[expandedGroup,setExpandedGroup]=useState<'yes'|'maybe'|'no'|null>(null)
const{toasts,show:showToast}=useToast()

const isUpdating=pendingStatus!==null
const myStatus=useMemo(()=>attendances.find(a=>a.user_email===userEmail)?.status,[attendances,userEmail])
const countOf=(s:string)=>attendances.filter(a=>a.status===s).length
const grouped=useMemo(()=>({
yes:   attendances.filter(a=>a.status==='yes'),
maybe: attendances.filter(a=>a.status==='maybe'),
no:    attendances.filter(a=>a.status==='no'),
}),[attendances])

const respond=async(status:'yes'|'maybe'|'no')=>{
if(!userEmail||isUpdating)return
setPendingStatus(status)
setError('')
const existing=attendances.find(a=>a.user_email===userEmail)
try{
if(existing?.status===status){
const{error:e}=await supabase.from('attendances').delete().eq('id',existing.id)
if(e)throw e
setAttendances(prev=>prev.filter(a=>a.id!==existing.id))
}else{
const{data,error:e}=await supabase
.from('attendances')
.upsert({event_id:eventId,user_email:userEmail,user_name:userName,status},{onConflict:'event_id,user_email'})
.select().single()
if(e)throw e
if(data){
setAttendances(prev=>existing?prev.map(a=>a.user_email===userEmail?data:a):[...prev,data])
showToast('Response saved','success')
}
}
}catch(e:any){
const msg=e?.message||'Could not save. Please try again.'
setError(msg)
showToast(msg,'error')
}finally{
setPendingStatus(null)
}
}

const exportToSheets=async()=>{
const header=['Name','Email','Status','Event','Responded at']
const rows=attendances.map(a=>[
a.user_name,
a.user_email,
a.status==='yes'?'Going':a.status==='maybe'?'Maybe':"Can't go",
eventTitle,
new Date(a.updated_at||a.created_at).toLocaleString('en-GB'),
])
const tsv=[header,...rows].map(r=>r.join('\t')).join('\n')
try{
await navigator.clipboard.writeText(tsv)
window.open('https://sheet.new','_blank','noopener,noreferrer')
showToast('Data copied! Simply press Ctrl+V in the new tab.','success')
}catch{
showToast('Could not copy to clipboard. Try again.','error')
}
}

const toggleGroup=(g:'yes'|'maybe'|'no')=>{
setExpandedGroup((prev:'yes'|'maybe'|'no'|null)=>prev===g?null:g)
}

const yesCount=countOf('yes')
const maybeCount=countOf('maybe')
const noCount=countOf('no')
const totalCount=attendances.length

return(
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<ToastContainer toasts={toasts}/>

{/* ── Header ── */}
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:'1px solid #F3F4F6',flexWrap:'wrap' as const,gap:'8px'}}>
<div style={{display:'flex',alignItems:'center',gap:'10px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280'}}>Attendance</div>
{totalCount>0&&(
<span style={{fontSize:'12px',background:'#F3F4F6',color:'#374151',padding:'2px 8px',borderRadius:'999px',fontWeight:500}}>{totalCount} {totalCount===1?'response':'responses'}</span>
)}
</div>
{isAdmin&&totalCount>0&&(
<button
onClick={exportToSheets}
style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#16a34a',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'7px',padding:'5px 12px',cursor:'pointer',fontWeight:600,fontFamily:'Noto Sans,sans-serif'}}
>
<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='12' y1='18' x2='12' y2='12'/><line x1='9' y1='15' x2='15' y2='15'/></svg>
Export to Google Sheets
</button>
)}
</div>

{/* ── RSVP buttons ── */}
<div style={{padding:'14px 18px',borderBottom:isAdmin&&totalCount>0?'1px solid #F3F4F6':'none'}}>
<div style={{display:'flex',gap:'8px',flexWrap:'wrap' as const,marginBottom:error?'10px':0}}>
{STATUS_META.map(({value,icon,label,color,bg,border})=>{
const active=myStatus===value
const spinning=pendingStatus===value
const count=countOf(value)
return(
<button
key={value}
onClick={()=>respond(value)}
disabled={isUpdating||!userEmail}
style={{
display:'flex',alignItems:'center',gap:'6px',
padding:'8px 16px',borderRadius:'8px',
border:'1.5px solid '+(active?color:border),
background:active?bg:'#ffffff',
color:active?color:'#374151',
fontSize:'13px',fontWeight:active?600:400,
cursor:isUpdating||!userEmail?'not-allowed':'pointer',
transition:'all .15s',
opacity:isUpdating&&!spinning?.55:1,
fontFamily:'Noto Sans,sans-serif',
}}
>
{spinning
?<span style={{width:'13px',height:'13px',border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'att-spin .6s linear infinite',flexShrink:0}}/>
:<span style={{fontSize:'15px',lineHeight:1}}>{icon}</span>
}
<span>{spinning?'Saving…':label}</span>
{count>0&&!spinning&&(
<span style={{fontSize:'11px',background:active?color+'22':'#F3F4F6',color:active?color:'#9CA3AF',padding:'0 6px',borderRadius:'999px',fontWeight:600}}>
{count}
</span>
)}
</button>
)
})}
</div>
{error&&<div style={{fontSize:'12px',color:'#dc2626',marginTop:'8px',padding:'6px 10px',background:'#fef2f2',borderRadius:'6px',border:'1px solid #fecaca'}}>{error}</div>}
{!userEmail&&<div style={{fontSize:'12px',color:'#9CA3AF',marginTop:'6px'}}>Sign in to respond</div>}
</div>

{/* ── Admin dashboard ── */}
{isAdmin&&totalCount>0&&(
<div style={{padding:'14px 18px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#9CA3AF',marginBottom:'12px'}}>Quick check</div>

{/* Summary chips — clickable */}
<div style={{display:'flex',gap:'8px',flexWrap:'wrap' as const,marginBottom:expandedGroup?'16px':0}}>
{STATUS_META.map(({value,icon,label,color,bg,border})=>{
const count=grouped[value].length
if(count===0)return null
const open=expandedGroup===value
return(
<button
key={value}
onClick={()=>toggleGroup(value)}
style={{
display:'flex',alignItems:'center',gap:'7px',
padding:'8px 14px',borderRadius:'10px',
border:'1.5px solid '+(open?color:border),
background:open?bg:'#ffffff',
color:open?color:'#374151',
cursor:'pointer',fontSize:'13px',fontWeight:600,
transition:'all .15s',
fontFamily:'Noto Sans,sans-serif',
boxShadow:open?'0 0 0 3px '+color+'22':'none',
}}
>
<span style={{fontSize:'16px',lineHeight:1}}>{icon}</span>
<span>{count} {label}</span>
<svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' style={{transition:'transform .2s',transform:open?'rotate(180deg)':'rotate(0deg)',marginLeft:'2px',opacity:.6}}>
<path d='M2 4l4 4 4-4'/>
</svg>
</button>
)
})}
</div>

{/* Expanded group list */}
{expandedGroup&&grouped[expandedGroup]&&(
<div style={{background:'#F9FAFB',borderRadius:'10px',border:'1px solid #F3F4F6',overflow:'hidden'}}>
{grouped[expandedGroup].map((a,idx)=>(
<div
key={a.id}
style={{
display:'flex',alignItems:'center',justifyContent:'space-between',
padding:'10px 14px',gap:'10px',
borderTop:idx>0?'1px solid #F3F4F6':'none',
background:'#ffffff',
}}
>
<div style={{display:'flex',alignItems:'center',gap:'10px',minWidth:0}}>
<Avatar name={a.user_name}/>
<div style={{minWidth:0}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}>{a.user_name}</div>
<div style={{fontSize:'11.5px',color:'#9CA3AF',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}>{a.user_email}</div>
</div>
</div>
<div style={{fontSize:'10.5px',color:'#B0B7C3',whiteSpace:'nowrap' as const,flexShrink:0}}>
{new Date(a.updated_at||a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
</div>
</div>
))}
</div>
)}
</div>
)}

</div>
)
}
