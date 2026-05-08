'use client'
import{useState}from'react'
import{supabase}from'@/app/lib/supabase'

type Props={eventId:string,currentUrl:string|null}

export default function CoverImageUploader({eventId,currentUrl}:Props){
const[preview,setPreview]=useState<string|null>(currentUrl||null)
const[uploading,setUploading]=useState(false)
const[error,setError]=useState('')

const handleFile=async(file:File|null)=>{
if(!file)return
setError('')
setUploading(true)
const ext=file.name.split('.').pop()
const path='covers/'+eventId+'.'+ext
const{error:uploadErr}=await supabase.storage.from('event-images').upload(path,file,{upsert:true})
if(uploadErr){setError(uploadErr.message);setUploading(false);return}
const{data}=supabase.storage.from('event-images').getPublicUrl(path)
const url=data.publicUrl+'?t='+Date.now() // cache-bust
const{error:updateErr}=await supabase.from('events').update({cover_image_url:data.publicUrl}).eq('id',eventId)
if(updateErr){setError(updateErr.message);setUploading(false);return}
setPreview(url)
setUploading(false)
}

const handleRemove=async()=>{
setError('')
setUploading(true)
await supabase.from('events').update({cover_image_url:null}).eq('id',eventId)
setPreview(null)
setUploading(false)
}

const inp={border:'1px solid #E5E7EB',borderRadius:'8px',background:'#ffffff'}

return(
<div>
{preview?(
<div style={{position:'relative',width:'100%',height:'160px',borderRadius:'10px',overflow:'hidden',border:'1px solid #E5E7EB',background:'#ffffff'}}>
<img src={preview} alt='' style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
<div style={{position:'absolute',top:'8px',right:'8px',display:'flex',gap:'6px'}}>
<label style={{background:'rgba(255,255,255,.88)',backdropFilter:'blur(6px)',color:'#374151',border:'1px solid rgba(0,0,0,.1)',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',cursor:'pointer',fontFamily:'Noto Sans,sans-serif',fontWeight:500}}>
{uploading?'Uploading…':'Change'}
<input type='file' accept='image/*' style={{display:'none'}} disabled={uploading} onChange={(e)=>handleFile(e.target.files?.[0]||null)}/>
</label>
<button type='button' onClick={handleRemove} disabled={uploading} style={{background:'rgba(220,38,38,.8)',color:'#fff',border:'none',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',cursor:'pointer',fontFamily:'Noto Sans,sans-serif'}}>Remove</button>
</div>
</div>
):(
<label style={{display:'block',cursor:'pointer',opacity:uploading?.6:1}}>
<div style={{border:'2px dashed #E5E7EB',borderRadius:'10px',padding:'32px',textAlign:'center' as const,background:'#FAFAFA'}}>
{uploading?(
<div style={{display:'flex',flexDirection:'column' as const,alignItems:'center',gap:'8px'}}>
<span style={{width:'20px',height:'20px',border:'2px solid #FF6B00',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'att-spin .6s linear infinite'}}/>
<span style={{fontSize:'13px',color:'#6B7280'}}>Uploading…</span>
</div>
):(
<>
<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' style={{margin:'0 auto 8px',display:'block'}}><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>
<div style={{fontSize:'13px',fontWeight:500,color:'#374151',marginBottom:'2px'}}>Click to upload a cover image</div>
<div style={{fontSize:'11px',color:'#9CA3AF'}}>Displayed as a hero banner on the event page</div>
</>
)}
</div>
<input type='file' accept='image/*' style={{display:'none'}} disabled={uploading} onChange={(e)=>handleFile(e.target.files?.[0]||null)}/>
</label>
)}
{error&&<div style={{fontSize:'12px',color:'#dc2626',marginTop:'6px'}}>{error}</div>}
</div>
)
}
