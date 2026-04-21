export const revalidate=60
import{supabase}from'@/app/lib/supabase'

export default async function ImagesPage(){
const{data:images}=await supabase
.from('event_images')
.select('*,events(title,date)')
.order('created_at',{ascending:false})

return(
<div style={{padding:'20px 24px'}}>
<div style={{marginBottom:'20px'}}>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',letterSpacing:'-.3px',margin:0}}>Image library</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',marginTop:'3px',marginBottom:0}}>{images?.length||0} photos across all events</p>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:'12px'}}>
{images?.map((img:any)=>(
<a key={img.id} href={'/events/'+(img.events?.id||'')} style={{textDecoration:'none'}}>
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',overflow:'hidden'}}>
<img src={img.image_url} alt={img.caption||''} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block'}}/>
<div style={{padding:'8px 10px'}}>
<div style={{fontSize:'11px',fontWeight:500,color:'#1A1A1A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{img.events?.title||'Event'}</div>
{img.caption&&<div style={{fontSize:'10.5px',color:'#6B7280',marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{img.caption}</div>}
</div>
</div>
</a>
))}
{(!images||images.length===0)&&(
<div style={{gridColumn:'1/-1',padding:'60px',textAlign:'center',color:'#9CA3AF',fontSize:'14px'}}>
No images yet. Upload photos to events to see them here.
</div>
)}
</div>
</div>
)
}