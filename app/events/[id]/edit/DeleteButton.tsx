'use client'
import{useTransition}from'react'
import{deleteEvent}from'./actions'

export default function DeleteButton({eventId}:{eventId:string}){
const[pending,startTransition]=useTransition()

const handleClick=()=>{
if(!confirm('Delete this event? This cannot be undone.'))return
const formData=new FormData()
formData.append('id',eventId)
startTransition(()=>deleteEvent(formData))
}

return(
<button onClick={handleClick} disabled={pending} style={{background:pending?'#9ca3af':'#dc2626',color:'#fff',border:'none',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',fontWeight:500,cursor:pending?'not-allowed':'pointer'}}>
{pending?'Deleting...':'Delete event'}
</button>
)
}