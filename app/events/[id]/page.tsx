import{supabase}from'@/app/lib/supabase'
import{notFound}from'next/navigation'
import{isAdmin}from'@/app/lib/roles'

export default async function EventPage(props:any){
const{id}=await props.params
const{data:event}=await supabase.from('events').select('*').eq('id',id).single()
if(!event)return notFound()
const{data:images}=await supabase.from('event_images').select('*').eq('event_id',id).order('sort_order')
const date=new Date(event.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})
const admin=await isAdmin()

return(
<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>Event Detail</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>Home / Events / {event.title}</div>
</div>
<div style={{display:'flex',gap:'8px'}}>
{admin&&<a href={'/events/'+id+'/edit'} style={{background:'#fff',color:'#374151',border:'1px solid #e5e7eb',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>Edit</a>}
{admin&&<a href={'/events/'+id+'/upload'} style={{background:'#ff6b00',color:'#fff',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>+ Upload images</a>}
<a href='/' style={{background:'#f3f4f6',color:'#374151',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none'}}>Back</a>
</div>
</div>
<div style={{flex:1,overflow:'auto',padding:'24px'}}>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden',maxWidth:'800px'}}>
<div style={{padding:'24px'}}>
<div style={{display:'flex',gap:'16px',marginBottom:'10px',fontSize:'12px',color:'#6b7280',flexWrap:'wrap'}}>
<span>📅 {date}</span>
{event.location&&<span>📍 {event.location}</span>}
</div>
<h1 style={{fontSize:'22px',fontWeight:700,color:'#111827',marginBottom:'12px'}}>{event.title}</h1>
{event.description&&<p style={{fontSize:'14px',color:'#4b5563',lineHeight:1.75,marginBottom:'16px'}}>{event.description}</p>}
{event.tags&&event.tags.length>0&&(
<div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
{event.tags.map((tag:string)=>(<span key={tag} style={{fontSize:'11px',padding:'3px 10px',background:'#f3f4f6',color:'#4b5563',border:'1px solid #e5e7eb',borderRadius:'20px'}}>#{tag}</span>))}
</div>
)}
<div style={{borderTop:'1px solid #f3f4f6',paddingTop:'20px',marginTop:'4px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',color:'#9ca3af',marginBottom:'14px'}}>Media and album</div>
{event.drive_link&&(
<a href={event.drive_link} target='_blank' rel='noopener noreferrer' style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#15803d',padding:'10px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:500,textDecoration:'none',marginBottom:'16px'}}>
📁 View full album on Google Drive
</a>
)}
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
<div style={{fontSize:'12px',fontWeight:500,color:'#374151'}}>Preview images — {images?.length||0} photos</div>
{admin&&<a href={'/events/'+id+'/upload'} style={{fontSize:'12px',color:'#ff6b00',textDecoration:'none',fontWeight:500}}>+ Add photos</a>}
</div>
{images&&images.length>0?(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:'10px'}}>
{images.map((img:any)=>(
<div key={img.id}>
<img src={img.image_url} alt={img.caption||''} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'6px',display:'block',border:'1px solid #f3f4f6'}}/>
{img.caption&&<div style={{fontSize:'11px',color:'#9ca3af',marginTop:'4px',textAlign:'center'}}>{img.caption}</div>}
</div>
))}
</div>
):(
<div style={{padding:'32px',textAlign:'center',color:'#9ca3af',fontSize:'13px',background:'#f9fafb',borderRadius:'8px',border:'1px dashed #e5e7eb'}}>
No preview images yet
{admin&&<><br/><a href={'/events/'+id+'/upload'} style={{color:'#ff6b00',textDecoration:'none',fontWeight:500,marginTop:'6px',display:'inline-block'}}>+ Upload preview images</a></>}
</div>
)}
</div>
</div>
</div>
</div>
</div>
)
}