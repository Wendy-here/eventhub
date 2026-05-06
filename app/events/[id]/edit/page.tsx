import{supabase}from'@/app/lib/supabase'
import{notFound}from'next/navigation'
import{updateEvent,deleteEvent,deleteImage}from'./actions'
import DeleteButton from'./DeleteButton'
import DateTimePicker from'@/app/components/DateTimePicker'
import{TIMEZONE_KEYS}from'@/app/lib/timezones'

const ENTITIES=['Vietnam','Thailand','Egypt','Germany']
const OFFICES:Record<string,string[]>={
Vietnam:['Saigon','Hanoi','Can Tho'],
Thailand:['Bangkok'],
Egypt:['Cairo'],
Germany:['Berlin'],
}

export default async function EditEventPage(props:any){
const{id}=await props.params
const{data:event}=await supabase.from('events').select('*').eq('id',id).single()
if(!event)return notFound()
const{data:images}=await supabase.from('event_images').select('*').eq('event_id',id).order('sort_order')
const{data:categories}=await supabase.from('categories').select('id,name').order('name')
const tagsStr=event.tags?event.tags.join(', '):''
const inp={width:'100%',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'8px 12px',fontSize:'13px',fontFamily:'Noto Sans,sans-serif',outline:'none',color:'#1A1A1A',background:'#ffffff'}

return(
<div style={{padding:'20px 24px',maxWidth:'680px',margin:'0 auto'}}>
<div style={{marginBottom:'20px'}}>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',margin:0}}>Edit event</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',marginTop:'4px',marginBottom:0}}>{event.title}</p>
</div>

<form action={updateEvent}>
<input type='hidden' name='id' value={id}/>
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{background:'#1A1A1A',padding:'12px 18px'}}>
<div style={{fontSize:'12px',fontWeight:600,color:'#ffffff'}}>Event details</div>
</div>
<div style={{padding:'18px',display:'flex',flexDirection:'column',gap:'14px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Event title</label>
<input name='title' required defaultValue={event.title} style={inp}/>
</div>
<DateTimePicker
defaultDate={event.date||''}
defaultTime={event.event_time||''}
defaultTimezone={event.timezone||''}
timezoneOptions={TIMEZONE_KEYS}
/>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Location</label>
<input name='location' defaultValue={event.location||''} style={inp}/>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Category</label>
<select name='category' defaultValue={event.category||''} style={{...inp,cursor:'pointer'}}>
<option value=''>Select...</option>
{categories?.map((c:any)=>(
<option key={c.id} value={c.name}>{c.name}</option>
))}
</select>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Entity</label>
<select name='entity' defaultValue={event.entity||''} style={{...inp,cursor:'pointer'}}>
<option value=''>Select...</option>
{ENTITIES.map(e=>(
<option key={e} value={e}>{e}</option>
))}
</select>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Office</label>
<select name='office' defaultValue={event.office||''} style={{...inp,cursor:'pointer'}}>
<option value=''>Select...</option>
{Object.values(OFFICES).flat().map(o=>(
<option key={o} value={o}>{o}</option>
))}
</select>
</div>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Tags</label>
<input name='tags' defaultValue={tagsStr} placeholder='team-building, q2-2026' style={inp}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Google Drive album link</label>
<input name='drive_link' defaultValue={event.drive_link||''} placeholder='https://drive.google.com/drive/folders/...' style={inp}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Description</label>
<textarea name='description' rows={4} defaultValue={event.description||''} style={{...inp,resize:'vertical' as const}}/>
</div>
<div style={{display:'flex',justifyContent:'flex-end',paddingTop:'8px',borderTop:'1px solid #F3F4F6'}}>
<button type='submit' style={{background:'#FF6B00',color:'#fff',border:'none',padding:'9px 18px',borderRadius:'8px',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'Noto Sans,sans-serif'}}>Save changes</button>
</div>
</div>
</div>
</form>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{background:'#1A1A1A',padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<div style={{fontSize:'12px',fontWeight:600,color:'#ffffff'}}>Preview images</div>
<a href={'/events/'+id+'/upload'} style={{fontSize:'12px',background:'#FF6B00',color:'#fff',padding:'4px 12px',borderRadius:'5px',textDecoration:'none',fontWeight:500}}>+ Add more</a>
</div>
<div style={{padding:'16px'}}>
{images&&images.length>0?(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))',gap:'10px'}}>
{images.map((img:any)=>(
<div key={img.id} style={{position:'relative'}}>
<img src={img.image_url} alt={img.caption||''} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'6px',display:'block'}}/>
<form action={deleteImage} style={{position:'absolute',top:'4px',right:'4px'}}>
<input type='hidden' name='image_id' value={img.id}/>
<input type='hidden' name='event_id' value={id}/>
<input type='hidden' name='image_url' value={img.image_url}/>
<button type='submit' style={{background:'rgba(220,38,38,.85)',color:'#fff',border:'none',borderRadius:'50%',width:'22px',height:'22px',cursor:'pointer',fontSize:'11px'}}>x</button>
</form>
</div>
))}
</div>
):(
<div style={{padding:'24px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px'}}>No images yet</div>
)}
</div>
</div>

<div style={{background:'#fff',border:'1px solid #FEE2E2',borderRadius:'12px',overflow:'hidden'}}>
<div style={{padding:'14px 18px',borderBottom:'1px solid #FEE2E2'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#DC2626'}}>Danger zone</div>
<div style={{fontSize:'12px',color:'#9CA3AF',marginTop:'2px'}}>This cannot be undone</div>
</div>
<div style={{padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<div>
<div style={{fontSize:'13px',fontWeight:500,color:'#374151'}}>Delete this event</div>
<div style={{fontSize:'12px',color:'#9CA3AF'}}>Removes the event and all images permanently</div>
</div>
<DeleteButton eventId={id}/>
</div>
</div>

</div>
)
}