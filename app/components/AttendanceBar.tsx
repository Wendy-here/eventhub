'use client'
import{useState,useMemo}from'react'
import{supabase}from'@/app/lib/supabase'
import{useToast,ToastContainer}from'@/app/components/Toast'

type Attendance={id:string,event_id:string,user_email:string,user_name:string,status:'yes'|'maybe'|'no',created_at:string,updated_at:string}
type Props={eventId:string,eventTitle:string,initialAttendances:Attendance[],isAdmin:boolean,userEmail:string,userName:string}

const STATUSES:[string,'yes'|'maybe'|'no',string,string][]=[
['✅','yes','Going','#16a34a'],
['❓','maybe','Maybe','#d97706'],
['❌','no',"Can't go",'#6b7280'],
]

export default function AttendanceBar({eventId,eventTitle,initialAttendances,isAdmin,userEmail,userName}:Props){
const[attendances,setAttendances]=useState<Attendance[]>(initialAttendances)
const[saving,setSaving]=useState(false)
const[error,setError]=useState('')
const[showList,setShowList]=useState(false)
const{toasts,show:showToast}=useToast()

const myStatus=useMemo(()=>attendances.find(a=>a.user_email===userEmail)?.status,[attendances,userEmail])
const countOf=(s:string)=>attendances.filter(a=>a.status===s).length

const respond=async(status:'yes'|'maybe'|'no')=>{
if(!userEmail||saving)return
setSaving(true)
setError('')
const existing=attendances.find(a=>a.user_email===userEmail)

try{
if(existing?.status===status){
// Same status clicked → toggle off (delete)
const{error:e}=await supabase.from('attendances').delete().eq('id',existing.id)
if(e)throw e
setAttendances(prev=>prev.filter(a=>a.id!==existing.id))
}else{
// New status or switching status → upsert (atomic, no race condition)
const{data,error:e}=await supabase
.from('attendances')
.upsert(
{event_id:eventId,user_email:userEmail,user_name:userName,status},
{onConflict:'event_id,user_email'}
)
.select()
.single()
if(e)throw e
if(data){
if(existing){
setAttendances(prev=>prev.map(a=>a.user_email===userEmail?data:a))
}else{
setAttendances(prev=>[...prev,data])
}
showToast('Response saved','success')
}
}
}catch(e:any){
const msg=e?.message||'Could not save. Please try again.'
setError(msg)
showToast(msg,'error')
}finally{
setSaving(false)
}
}

const exportCsv=()=>{
const rows=[
['Event','Name','Email','Status','Responded at'],
...attendances.map(a=>[
eventTitle,a.user_name,a.user_email,a.status,
new Date(a.updated_at||a.created_at).toLocaleString()
])
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
const noCount=countOf('no')
const grouped={
yes:attendances.filter(a=>a.status==='yes'),
maybe:attendances.filter(a=>a.status==='maybe'),
no:attendances.filter(a=>a.status==='no'),
}

return(
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
<ToastContainer toasts={toasts}/>

<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px',flexWrap:'wrap' as const,gap:'8px'}}>
<div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap' as const}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280'}}>Attendance</div>
{(yesCount>0||maybeCount>0||noCount>0)&&(
<span style={{fontSize:'12px',color:'#9CA3AF'}}>
{[yesCount>0&&`✅ ${yesCount}`,maybeCount>0&&`❓ ${maybeCount}`,noCount>0&&`❌ ${noCount}`].filter(Boolean).join(' · ')}
</span>
)}
</div>
<div style={{display:'flex',gap:'6px',alignItems:'center'}}>
{isAdmin&&attendances.length>0&&(
<>
<button onClick={()=>setShowList(v=>!v)} style={{fontSize:'11.5px',color:'#374151',background:'none',border:'1px solid #E5E7EB',borderRadius:'6px',padding:'3px 10px',cursor:'pointer',fontWeight:500}}>
{showList?'Hide list':'View list'}
</button>
<button onClick={exportCsv} style={{fontSize:'11.5px',color:'#FF6B00',background:'none',border:'1px solid #FFD4B8',borderRadius:'6px',padding:'3px 10px',cursor:'pointer',fontWeight:500}}>
↓ Export CSV
</button>
</>
)}
</div>
</div>

<div style={{display:'flex',gap:'8px',flexWrap:'wrap' as const,marginBottom:error?'10px':0}}>
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
padding:'7px 14px',borderRadius:'8px',
border:'1.5px solid '+(active?activeColor:'#E5E7EB'),
background:active?activeColor+'18':'#ffffff',
color:active?activeColor:'#374151',
fontSize:'13px',fontWeight:active?600:400,
cursor:saving||!userEmail?'not-allowed':'pointer',
transition:'all .15s',opacity:saving?.7:1,
}}
>
{saving&&active
?<span style={{width:'12px',height:'12px',border:'1.5px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'att-spin .6s linear infinite'}}/>
:<span style={{fontSize:'15px'}}>{icon}</span>
}
<span>{label}</span>
{count>0&&<span style={{fontSize:'11px',color:active?activeColor:'#9CA3AF',fontWeight:600}}>· {count}</span>}
</button>
)
})}
</div>

{error&&<div style={{fontSize:'12px',color:'#dc2626',marginTop:'8px',padding:'6px 10px',background:'#fef2f2',borderRadius:'6px',border:'1px solid #fecaca'}}>{error}</div>}
{!userEmail&&<div style={{fontSize:'12px',color:'#9CA3AF',marginTop:'10px'}}>Sign in to respond</div>}

{isAdmin&&showList&&attendances.length>0&&(
<div style={{marginTop:'14px',borderTop:'1px solid #F3F4F6',paddingTop:'14px'}}>
{(['yes','maybe','no'] as const).map(status=>{
const group=grouped[status]
if(group.length===0)return null
const[icon,,label,color]=STATUSES.find(s=>s[1]===status)!
return(
<div key={status} style={{marginBottom:'12px'}}>
<div style={{fontSize:'11px',fontWeight:600,color:color,marginBottom:'6px',display:'flex',alignItems:'center',gap:'5px'}}>
<span>{icon}</span><span>{label} ({group.length})</span>
</div>
<div style={{display:'flex',flexDirection:'column' as const,gap:'4px'}}>
{group.map(a=>(
<div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 10px',background:'#F9FAFB',borderRadius:'6px',gap:'8px'}}>
<div style={{display:'flex',alignItems:'center',gap:'8px',minWidth:0}}>
<div style={{width:'24px',height:'24px',borderRadius:'50%',background:'#FFE4D1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:700,color:'#E65C00',flexShrink:0}}>
{a.user_name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)}
</div>
<div style={{minWidth:0}}>
<div style={{fontSize:'12.5px',fontWeight:500,color:'#1A1A1A',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}>{a.user_name}</div>
<div style={{fontSize:'11px',color:'#9CA3AF',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}>{a.user_email}</div>
</div>
</div>
<div style={{fontSize:'10.5px',color:'#9CA3AF',whiteSpace:'nowrap' as const,flexShrink:0}}>
{new Date(a.updated_at||a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
</div>
</div>
))}
</div>
</div>
)
})}
</div>
)}

</div>
)
}
