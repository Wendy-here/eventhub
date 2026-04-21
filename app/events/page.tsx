export const revalidate=60
import{supabase}from'@/app/lib/supabase'
import{isAdmin}from'@/app/lib/roles'

export default async function EventsPage(){
const{data:events}=await supabase.from('events').select('*').order('date',{ascending:false})
const admin=await isAdmin()

return(
<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>All Events</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>{events?.length||0} events total</div>
</div>
{admin&&<a href='/admin/events/new' style={{background:'#ff6b00',color:'#fff',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>+ New event</a>}
</div>
<div style={{flex:1,overflow:'auto',padding:'24px'}}>
<div style={{display:'flex',flexDirection:'column',gap:'10px',maxWidth:'800px'}}>
{events&&events.length>0?events.map((event:any)=>(
<a key={event.id} href={'/events/'+event.id} style={{display:'block',textDecoration:'none'}}>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'border-color 0.15s'}}>
<div style={{flex:1}}>
<div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>{event.title}</div>
{event.drive_link&&<span style={{fontSize:'10px',background:'#f0fdf4',color:'#15803d',border:'1px solid #bbf7d0',padding:'1px 7px',borderRadius:'10px'}}>Drive</span>}
</div>
<div style={{display:'flex',gap:'12px',fontSize:'12px',color:'#6b7280'}}>
<span>📅 {new Date(event.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
{event.location&&<span>📍 {event.location}</span>}
</div>
{event.tags&&event.tags.length>0&&(
<div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'8px'}}>
{event.tags.slice(0,4).map((tag:string)=>(<span key={tag} style={{fontSize:'10px',padding:'2px 8px',background:'#f3f4f6',color:'#6b7280',borderRadius:'10px'}}>#{tag}</span>))}
</div>
)}
</div>
<div style={{color:'#9ca3af',fontSize:'18px',marginLeft:'12px'}}>›</div>
</div>
</a>
)):(
<div style={{padding:'60px',textAlign:'center',color:'#9ca3af',fontSize:'14px'}}>
No events yet
{admin&&<><br/><a href='/admin/events/new' style={{color:'#ff6b00',textDecoration:'none',fontWeight:500,marginTop:'8px',display:'inline-block'}}>+ Create your first event</a></>}
</div>
)}
</div>
</div>
</div>
)
}