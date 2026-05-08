'use client'
import{useState,useCallback,useEffect}from'react'
import{supabase}from'@/app/lib/supabase'
import{createEvent}from'./actions'
import{useRouter}from'next/navigation'
import DateTimePicker from'@/app/components/DateTimePicker'
import{TIMEZONE_KEYS}from'@/app/lib/timezones'

const ENTITIES=['Vietnam','Thailand','Egypt','Germany']
const OFFICES:Record<string,string[]>={
Vietnam:['Saigon','Hanoi','Can Tho'],
Thailand:['Bangkok'],
Egypt:['Cairo'],
Germany:['Berlin'],
}
const ENTITY_TIMEZONE:Record<string,string>={
Vietnam:'Vietnam / Thailand',
Thailand:'Vietnam / Thailand',
Egypt:'Egypt',
Germany:'Germany',
}

type FileItem={file:File,preview:string,caption:string}
type Category={id:string,name:string,color:string}

export default function NewEventForm(){
const router=useRouter()
const[files,setFiles]=useState<FileItem[]>([])
const[dragOver,setDragOver]=useState(false)
const[saving,setSaving]=useState(false)
const[driveLink,setDriveLink]=useState('')
const[selectedEntity,setSelectedEntity]=useState('')
const[selectedTimezone,setSelectedTimezone]=useState('')
const[tzManuallySet,setTzManuallySet]=useState(false)
const[coverFile,setCoverFile]=useState<File|null>(null)
const[coverPreview,setCoverPreview]=useState<string|null>(null)

const handleEntityChange=(e:string)=>{
setSelectedEntity(e)
if(!tzManuallySet&&e&&ENTITY_TIMEZONE[e])setSelectedTimezone(ENTITY_TIMEZONE[e])
else if(!tzManuallySet&&!e)setSelectedTimezone('')
}
const[categories,setCategories]=useState<Category[]>([])
const[loading,setLoading]=useState(true)

useEffect(()=>{
supabase.from('categories').select('id,name,color').order('name').then(({data,error})=>{
if(data&&!error)setCategories(data)
setLoading(false)
})
},[])

const handleFiles=(newFiles:FileList|null)=>{
if(!newFiles)return
const arr=Array.from(newFiles).filter((f:File)=>f.type.startsWith('image/'))
setFiles((prev:FileItem[])=>[...prev,...arr.map((f:File)=>({file:f,preview:URL.createObjectURL(f),caption:''}))])
}

const handleDrop=useCallback((e:React.DragEvent)=>{
e.preventDefault()
setDragOver(false)
handleFiles(e.dataTransfer.files)
},[])

const removeFile=(i:number)=>setFiles((prev:FileItem[])=>prev.filter((_,idx)=>idx!==i))

const handleCoverFile=(f:File|null)=>{
if(!f)return
setCoverFile(f)
setCoverPreview(URL.createObjectURL(f))
}

const[dateError,setDateError]=useState('')
const[formError,setFormError]=useState('')

const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
e.preventDefault()
const form=new FormData(e.currentTarget)
const date=form.get('date') as string
if(!date){setDateError('Please select a day, month, and year.');return}
setDateError('')
setFormError('')
setSaving(true)

// Upload cover image first if selected
let coverUrl=''
if(coverFile){
const ext=coverFile.name.split('.').pop()
const tmpPath='covers/tmp-'+Date.now()+'.'+ext
const{error:covErr}=await supabase.storage.from('event-images').upload(tmpPath,coverFile,{upsert:true})
if(!covErr){
const{data:covData}=supabase.storage.from('event-images').getPublicUrl(tmpPath)
coverUrl=covData.publicUrl
}
}
if(coverUrl)form.set('cover_image_url',coverUrl)

// Insert via server action — authenticated with user's session cookies
const result=await createEvent(form)
if('error' in result){
setFormError(result.error)
setSaving(false)
return
}
const event={id:result.id}

// Rename cover to proper path now that we have the event ID
if(coverUrl&&coverFile){
const ext=coverFile.name.split('.').pop()
const finalPath='covers/'+event.id+'.'+ext
// Move by re-uploading (storage doesn't support rename)
await supabase.storage.from('event-images').upload(finalPath,coverFile,{upsert:true})
const{data:finalData}=supabase.storage.from('event-images').getPublicUrl(finalPath)
await supabase.from('events').update({cover_image_url:finalData.publicUrl}).eq('id',event.id)
}

const rows:any[]=[]
for(let i=0;i<files.length;i++){
const{file,caption}=files[i]
const ext=file.name.split('.').pop()
const path=event.id+'/'+Date.now()+'-'+i+'.'+ext
const{error:uploadError}=await supabase.storage.from('event-images').upload(path,file,{upsert:true})
if(!uploadError){
const{data}=supabase.storage.from('event-images').getPublicUrl(path)
rows.push({event_id:event.id,image_url:data.publicUrl,caption,sort_order:i})
}
}
if(rows.length>0)await supabase.from('event_images').insert(rows)
router.push('/events/'+event.id)
}

const inp={width:'100%',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'0 12px',height:'38px',fontSize:'13px',fontFamily:'Noto Sans,sans-serif',outline:'none',color:'#1A1A1A',background:'#ffffff'}

return(
<div style={{padding:'20px 24px',maxWidth:'680px',margin:'0 auto'}}>
<div style={{marginBottom:'20px'}}>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',margin:0}}>Create a new event</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',marginTop:'4px',marginBottom:0}}>Fill in the details below and save</p>
</div>

<form onSubmit={handleSubmit}>
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{padding:'12px 18px',borderBottom:'1px solid #F3F4F6'}}>
<div style={{fontSize:'11px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase' as const,letterSpacing:'.07em'}}>Event details</div>
</div>
<div style={{padding:'18px',display:'flex',flexDirection:'column',gap:'14px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Event title *</label>
<input name='title' required placeholder='e.g. Q2 Team Outing' style={inp}/>
</div>
<DateTimePicker timezoneOptions={TIMEZONE_KEYS} timezone={selectedTimezone} onTimezoneChange={tz=>{setSelectedTimezone(tz);setTzManuallySet(true)}}/>
{dateError&&<div style={{fontSize:'12px',color:'#dc2626',padding:'5px 10px',background:'#fef2f2',borderRadius:'6px',border:'1px solid #fecaca'}}>{dateError}</div>}
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Location</label>
<input name='location' placeholder='e.g. HCM Office' style={inp}/>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>
Category
<a href='/admin/categories' target='_blank' style={{fontSize:'10px',color:'#FF6B00',marginLeft:'6px',textDecoration:'none',fontWeight:400}}>Manage ›</a>
</label>
<select name='category' style={{...inp,cursor:'pointer'}} disabled={loading}>
<option value=''>{loading?'Loading...':'Select category'}</option>
{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
</select>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Entity</label>
<select name='entity' style={{...inp,cursor:'pointer'}} value={selectedEntity} onChange={(e)=>handleEntityChange(e.target.value)}>
<option value=''>Select entity</option>
{ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
</select>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Office</label>
<select name='office' style={{...inp,cursor:'pointer',opacity:selectedEntity?1:.5}} disabled={!selectedEntity}>
<option value=''>Select office</option>
{(selectedEntity?OFFICES[selectedEntity]||[]:Object.values(OFFICES).flat()).map(o=><option key={o} value={o}>{o}</option>)}
</select>
</div>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Tags <span style={{fontWeight:400,color:'#9CA3AF'}}>(comma separated)</span></label>
<input name='tags' placeholder='e.g. team-building, q2-2026' style={inp}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Description</label>
<textarea name='description' rows={3} placeholder='Describe what happened...' style={{...inp,height:'auto',minHeight:'80px',padding:'8px 12px',resize:'vertical' as const}}/>
</div>
</div>
</div>

{/* Cover image */}
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{padding:'12px 18px',borderBottom:'1px solid #F3F4F6'}}>
<div style={{fontSize:'11px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase' as const,letterSpacing:'.07em'}}>Cover image</div>
</div>
<div style={{padding:'18px'}}>
{coverPreview?(
<div style={{position:'relative',width:'100%',height:'160px',borderRadius:'10px',overflow:'hidden',border:'1px solid #E5E7EB'}}>
<img src={coverPreview} alt='' style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
<button type='button' onClick={()=>{setCoverFile(null);setCoverPreview(null)}} style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,.55)',color:'#fff',border:'none',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',cursor:'pointer',fontFamily:'Noto Sans,sans-serif'}}>Remove</button>
</div>
):(
<label style={{display:'block',cursor:'pointer'}}>
<div style={{border:'2px dashed #E5E7EB',borderRadius:'10px',padding:'32px',textAlign:'center' as const,background:'#FAFAFA',transition:'border-color .2s'}}>
<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' style={{margin:'0 auto 8px',display:'block'}}><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>
<div style={{fontSize:'13px',fontWeight:500,color:'#374151',marginBottom:'2px'}}>Click to upload a cover image</div>
<div style={{fontSize:'11px',color:'#9CA3AF'}}>Displayed as a hero banner on the event page</div>
</div>
<input type='file' accept='image/*' style={{display:'none'}} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>handleCoverFile(e.target.files?.[0]||null)}/>
</label>
)}
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{padding:'12px 18px',borderBottom:'1px solid #F3F4F6'}}>
<div style={{fontSize:'11px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase' as const,letterSpacing:'.07em'}}>Media and album</div>
</div>
<div style={{padding:'18px',display:'flex',flexDirection:'column',gap:'14px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'8px'}}>Preview images</label>
<div
onDrop={handleDrop}
onDragOver={(e:React.DragEvent)=>{e.preventDefault();setDragOver(true)}}
onDragLeave={()=>setDragOver(false)}
onClick={()=>(document.getElementById('fileInput') as HTMLInputElement)?.click()}
style={{border:'2px dashed '+(dragOver?'#FF6B00':'#E5E7EB'),borderRadius:'8px',padding:'24px',textAlign:'center' as const,background:dragOver?'#FFF3EB':'#FAFAFA',cursor:'pointer',transition:'all .2s'}}
>
<div style={{fontSize:'24px',marginBottom:'6px'}}>📸</div>
<div style={{fontSize:'13px',fontWeight:500,color:'#374151',marginBottom:'2px'}}>Drag and drop or click to select</div>
<div style={{fontSize:'11px',color:'#9CA3AF'}}>Select multiple images at once</div>
<input id='fileInput' type='file' multiple accept='image/*' style={{display:'none'}} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>handleFiles(e.target.files)}/>
</div>
{files.length>0&&(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))',gap:'8px',marginTop:'10px'}}>
{files.map((f:FileItem,i:number)=>(
<div key={i} style={{position:'relative' as const}}>
<img src={f.preview} alt='' style={{width:'100%',aspectRatio:'1',objectFit:'cover' as const,borderRadius:'6px',display:'block'}}/>
<button type='button' onClick={()=>removeFile(i)} style={{position:'absolute' as const,top:'3px',right:'3px',background:'rgba(0,0,0,.6)',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
</div>
))}
</div>
)}
</div>
<div style={{borderTop:'1px solid #F3F4F6',paddingTop:'14px'}}>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Google Drive full album link <span style={{fontWeight:400,color:'#9CA3AF'}}>(optional)</span></label>
<input name='drive_link' value={driveLink} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setDriveLink(e.target.value)} placeholder='https://drive.google.com/drive/folders/...' style={inp}/>
<div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'4px'}}>Viewers can access the full album from this link</div>
</div>
</div>
</div>

{formError&&<div style={{fontSize:'12px',color:'#dc2626',padding:'8px 12px',background:'#fef2f2',borderRadius:'8px',border:'1px solid #fecaca',marginBottom:'4px'}}><strong>Save failed:</strong> {formError}</div>}
<div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
<a href='/' style={{background:'#ffffff',color:'#374151',border:'1px solid #E5E7EB',padding:'9px 18px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>Cancel</a>
<button type='submit' disabled={saving} style={{background:saving?'#d1d5db':'#FF6B00',color:'#fff',border:'none',padding:'9px 18px',borderRadius:'8px',fontSize:'13px',fontWeight:500,cursor:saving?'not-allowed':'pointer',fontFamily:'Noto Sans,sans-serif'}}>
{saving?'Saving...':'Save event'}
</button>
</div>
</form>
</div>
)
}