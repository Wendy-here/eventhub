import{supabase}from'@/app/lib/supabase'
import{notFound}from'next/navigation'
import{updateEvent,deleteEvent,deleteImage}from'./actions'
import DeleteButton from'./DeleteButton'

export default async function EditEventPage(props:any){
const{id}=await props.params
const{data:event}=await supabase.from('events').select('*').eq('id',id).single()
if(!event)return notFound()
const{data:images}=await supabase.from('event_images').select('*').eq('event_id',id).order('sort_order')
const tagsStr=event.tags?event.tags.join(', '):''

return(
<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>Edit Event</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>{event.title}</div>
</div>
<a href={'/events/'+id} style={{background:'#f3f4f6',color:'#374151',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none'}}>Cancel</a>
</div>
<div style={{flex:1,overflow:'auto',padding:'24px'}}>
<div style={{maxWidth:'640px',display:'flex',flexDirection:'column',gap:'16px'}}>

<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden'}}>
<div style={{background:'#1a1a1a',padding:'14px 20px'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#fff'}}>Event details</div>
</div>
<form action={updateEvent} style={{padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
<input type='hidden' name='id' value={id}/>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Event title *</label>
<input name='title' required defaultValue={event.title} style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Date *</label>
<input name='date' type='date' required defaultValue={event.date} style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Location</label>
<input name='location' defaultValue={event.location||''} style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Tags</label>
<input name='tags' defaultValue={tagsStr} placeholder='team-building, q2-2026' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Google Drive full album link</label>
<input name='drive_link' defaultValue={event.drive_link||''} placeholder='https://drive.google.com/drive/folders/...' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Description</label>
<textarea name='description' rows={4} defaultValue={event.description||''} style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none',resize:'vertical'}}/>
</div>
<div style={{display:'flex',justifyContent:'flex-end',paddingTop:'8px',borderTop:'1px solid #f3f4f6'}}>
<button type='submit' style={{background:'#ff6b00',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>Save changes</button>
</div>
</form>
</div>

<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden'}}>
<div style={{background:'#1a1a1a',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#fff'}}>Preview images</div>
<a href={'/events/'+id+'/upload'} style={{fontSize:'12px',background:'#ff6b00',color:'#fff',padding:'4px 12px',borderRadius:'5px',textDecoration:'none',fontWeight:500}}>+ Add more</a>
</div>
<div style={{padding:'20px'}}>
{images&&images.length>0?(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))',gap:'12px'}}>
{images.map((img:any)=>(
<div key={img.id} style={{position:'relative'}}>
<img src={img.image_url} alt={img.caption||''} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'6px',display:'block'}}/>
<form action={deleteImage} style={{position:'absolute',top:'4px',right:'4px'}}>
<input type='hidden' name='image_id' value={img.id}/>
<input type='hidden' name='event_id' value={id}/>
<input type='hidden' name='image_url' value={img.image_url}/>
<button type='submit' style={{background:'rgba(220,38,38,0.85)',color:'#fff',border:'none',borderRadius:'50%',width:'22px',height:'22px',cursor:'pointer',fontSize:'11px'}}>x</button>
</form>
</div>
))}
</div>
):(
<div style={{padding:'24px',textAlign:'center',color:'#9ca3af',fontSize:'13px'}}>No images yet</div>
)}
</div>
</div>

<div style={{background:'#fff',border:'1px solid #fee2e2',borderRadius:'10px',overflow:'hidden'}}>
<div style={{padding:'16px 20px',borderBottom:'1px solid #fee2e2'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#dc2626'}}>Danger zone</div>
<div style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>This cannot be undone</div>
</div>
<div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<div>
<div style={{fontSize:'13px',fontWeight:500,color:'#374151'}}>Delete this event</div>
<div style={{fontSize:'12px',color:'#9ca3af'}}>Removes the event and all images permanently</div>
</div>
<DeleteButton eventId={id}/>
</div>
</div>

</div>
</div>
</div>
)
}