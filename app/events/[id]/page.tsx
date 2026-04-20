import{supabase}from'@/app/lib/supabase'
import{notFound}from'next/navigation'
import{isAdmin}from'@/app/lib/roles'
import ReactionsComments from'@/app/components/ReactionsComments'

export default async function EventPage(props:any){
const{id}=await props.params
const{data:event}=await supabase.from('events').select('*').eq('id',id).single()
if(!event)return notFound()
const{data:images}=await supabase.from('event_images').select('*').eq('event_id',id).order('sort_order')
const admin=await isAdmin()
const date=new Date(event.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})

return(
<div style={{padding:'20px 24px',maxWidth:'860px',margin:'0 auto'}}>

<a href='/' style={{fontSize:'12px',color:'#6B7280',textDecoration:'none',display:'inline-block',marginBottom:'16px'}}>← Back to calendar</a>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{padding:'24px'}}>
<div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px',flexWrap:'wrap' as const,marginBottom:'16px'}}>
<div>
<h1 style={{fontSize:'22px',fontWeight:700,color:'#1A1A1A',letterSpacing:'-.3px',margin:'0 0 8px'}}>{event.title}</h1>
<div style={{fontSize:'12.5px',color:'#6B7280',lineHeight:1.7}}>
<div>📅 {date}</div>
{event.location&&<div>📍 {event.location}</div>}
</div>
</div>
{admin&&(
<div style={{display:'flex',gap:'6px',flexShrink:0}}>
<a href={'/events/'+id+'/edit'} style={{background:'#ffffff',color:'#374151',border:'1px solid #E5E7EB',padding:'6px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>Edit</a>
<a href={'/events/'+id+'/upload'} style={{background:'#FF6B00',color:'#fff',padding:'6px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>+ Upload</a>
</div>
)}
</div>

{event.description&&<p style={{fontSize:'14px',color:'#374151',lineHeight:1.75,marginBottom:'16px'}}>{event.description}</p>}

<div style={{display:'flex',flexWrap:'wrap' as const,gap:'6px',marginBottom:'16px'}}>
{event.category&&<span style={{fontSize:'11px',background:'#FFE4D1',color:'#E65C00',padding:'2px 10px',borderRadius:'999px',fontWeight:600}}>{event.category}</span>}
{event.entity&&<span style={{fontSize:'11px',background:'#F3F4F6',color:'#374151',padding:'2px 10px',borderRadius:'999px'}}>{event.entity}</span>}
{event.office&&<span style={{fontSize:'11px',background:'#F3F4F6',color:'#374151',padding:'2px 10px',borderRadius:'999px'}}>{event.office}</span>}
{event.tags&&event.tags.map((tag:string)=><span key={tag} style={{fontSize:'11px',background:'#F3F4F6',color:'#6B7280',padding:'2px 10px',borderRadius:'999px'}}>#{tag}</span>)}
</div>
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280'}}>Media — {images?.length||0} photos</div>
<div style={{display:'flex',gap:'8px'}}>
{event.drive_link&&<a href={event.drive_link} target='_blank' rel='noopener noreferrer' style={{fontSize:'12px',color:'#15803D',fontWeight:500,textDecoration:'none',background:'#F0FDF4',border:'1px solid #BBF7D0',padding:'4px 12px',borderRadius:'6px'}}>View full album</a>}
{admin&&<a href={'/events/'+id+'/upload'} style={{fontSize:'12px',color:'#FF6B00',fontWeight:500,textDecoration:'none',background:'#FFF3EB',border:'1px solid #FFD4B8',padding:'4px 12px',borderRadius:'6px'}}>+ Add photos</a>}
</div>
</div>
{images&&images.length>0?(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:'10px'}}>
{images.map((img:any)=>(
<div key={img.id}>
<img src={img.image_url} alt={img.caption||''} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px',display:'block',border:'1px solid #F3F4F6'}}/>
{img.caption&&<div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'4px',textAlign:'center' as const}}>{img.caption}</div>}
</div>
))}
</div>
):(
<div style={{padding:'32px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px',background:'#F9FAFB',borderRadius:'8px',border:'1px dashed #E5E7EB'}}>
No preview images yet
{admin&&<><br/><a href={'/events/'+id+'/upload'} style={{color:'#FF6B00',textDecoration:'none',fontWeight:500,marginTop:'6px',display:'inline-block'}}>+ Upload images</a></>}
</div>
)}
</div>

<ReactionsComments eventId={id}/>

</div>
)
}