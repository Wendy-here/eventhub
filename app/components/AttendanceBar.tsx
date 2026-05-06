'use client'
import{useState,useEffect}from'react'
import{supabase}from'@/app/lib/supabase'

type Attendance={id:string,event_id:string,user_email:string,user_name:string,status:'yes'|'maybe'|'no',created_at:string}
type Props={eventId:string,eventTitle:string,initialAttendances:Attendance[],isAdmin:boolean}

const STATUSES:[string,'yes'|'maybe'|'no',string,string][]=[
['✅','yes','Going','#16a34a'],
['❓','maybe','Maybe','#d97706'],
['❌','no','Can\'t go','#6b7280'],
]

export default function AttendanceBar({eventId,eventTitle,initialAttendances,isAdmin}:Props){
const[attendances,setAttendances]=useState<Attendance[]>(initialAttendances)
const[userEmail,setUserEmail]=useState('')
const[userName,setUserName]=useState('')
const[saving,setSaving]=useState(false)

useEffect(()=>{
supabase.auth.getUser().then(({data:{user}})=>{
if(user){
setUserEmail(user.email||'')
setUserName(user.user_metadata?.full_name||user.email?.split('@')[0]||'User')
}
})
},[])

const myStatus=attendances.find(a=>a.user_email===userEmail)?.status

const countOf=(s:string)=>attendances.filter(a=>a.status===s).length

const respond=async(status:'yes'|'maybe'|'no')=>{
if(!userEmail||saving)return
setSaving(true)
const existing=attendances.find(a=>a.user_email===userEmail)
if(existing){
if(existing.status===status){
// Toggle off
await supabase.from('attendances').delete().eq('id',existing.id)
setAttendances(prev=>prev.filter(a=>a.id!==existing.id))
}else{
const{data}=await supabase.from('attendances').update({status}).eq('id',existing.id).select().single()
if(data)setAttendances(prev=>prev.map(a=>a.id===existing.id?data:a))
}
}else{
const{data}=await supabase.from('attendances').insert({event_id:eventId,user_email:userEmail,user_name:userName,status}).select().single()
if(data)setAttendances(prev=>[...prev,data])
}
setSaving(false)
}

const exportCsv=()=>{
const rows=[
['Event','Name','Email','Status','Timestamp'],
...attendances.map(a=>[eventTitle,a.user_name,a.user_email,a.status,new Date(a.created_at).toLocaleString()])
]
const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')
const blob=new Blob([csv],{type:'text/csv'})
const url=URL.createObjectURL(blob)
const link=document.createElement('a')
link.href=url
link.download=eventTitle.replace(/[^a-z0-9]/gi,'_').toLowerCase()+'_attendees.csv'
link.click()
URL.revokeObjectURL(url)
}

const yesCount=countOf('yes')
const maybeCount=countOf('maybe')

return(
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px'}}>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px',flexWrap:'wrap' as const,gap:'8px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280'}}>
Attendance
{(yesCount>0||maybeCount>0)&&<span style={{marginLeft:'8px',fontSize:'11px',fontWeight:400,color:'#9CA3AF',textTransform:'none' as const}}>
{yesCount>0&&`✅ ${yesCount} going`}{yesCount>0&&maybeCount>0&&' · '}{maybeCount>0&&`❓ ${maybeCount} maybe`}
</span>}
</div>
{isAdmin&&attendances.length>0&&(
<button onClick={exportCsv} style={{fontSize:'11.5px',color:'#FF6B00',background:'none',border:'1px solid #FFD4B8',borderRadius:'6px',padding:'3px 10px',cursor:'pointer',fontWeight:500}}>
↓ Export CSV
</button>
)}
</div>

{/* Response buttons */}
<div style={{display:'flex',gap:'8px',flexWrap:'wrap' as const}}>
{STATUSES.map(([icon,value,label,activeColor])=>{
const active=myStatus===value
const count=countOf(value)
return(
<button
key={value}
onClick={()=>respond(value)}
disabled={saving||!userEmail}
style={{
display:'flex',alignItems:'center',gap:'6px',
padding:'7px 14px',
borderRadius:'8px',
border:'1.5px solid '+(active?activeColor:'#E5E7EB'),
background:active?activeColor+'18':'#ffffff',
color:active?activeColor:'#374151',
fontSize:'13px',fontWeight:active?600:400,
cursor:saving||!userEmail?'not-allowed':'pointer',
transition:'all .15s',
opacity:saving?.7:1,
}}
>
<span style={{fontSize:'15px'}}>{icon}</span>
<span>{label}</span>
{count>0&&<span style={{fontSize:'11px',color:active?activeColor:'#9CA3AF',fontWeight:600}}>· {count}</span>}
</button>
)
})}
</div>

{!userEmail&&(
<div style={{fontSize:'12px',color:'#9CA3AF',marginTop:'10px'}}>Sign in to respond</div>
)}
</div>
)
}
