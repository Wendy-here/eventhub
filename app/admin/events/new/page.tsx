'use client'
import{useState,useCallback}from'react'
import{supabase}from'@/app/lib/supabase'
import{useRouter}from'next/navigation'

export default function NewEventPage(){
const router=useRouter()
const[files,setFiles]=useState<{file:File,preview:string,caption:string}[]>([])
const[dragOver,setDragOver]=useState(false)
const[saving,setSaving]=useState(false)
const[driveLink,setDriveLink]=useState('')

const handleFiles=(newFiles:FileList|null)=>{
if(!newFiles)return
const arr=Array.from(newFiles).filter((f:File)=>f.type.startsWith('image/'))
setFiles(prev=>[...prev,...arr.map((f:File)=>({file:f,preview:URL.createObjectURL(f),caption:''}))])
}

const handleDrop=useCallback((e:React.DragEvent)=>{
e.preventDefault()
setDragOver(false)
handleFiles(e.dataTransfer.files)
},[])

const removeFile=(i:number)=>setFiles(prev=>prev.filter((_,idx)=>idx!==i))

const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
e.preventDefault()
setSaving(true)
const form=new FormData(e.currentTarget)
const title=form.get('title') as string
const date=form.get('date') as string
const description=form.get('description') as string
const location=form.get('location') as string
const tagsRaw=form.get('tags') as string
const tags=tagsRaw?tagsRaw.split(',').map((t:string)=>t.trim()).filter(Boolean):[]

const{data:event,error}=await supabase.from('events').insert({title,date,description,location,tags,drive_link:driveLink||null}).select().single()
if(error){console.error(error);setSaving(false);return}

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

return(
<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>New Event</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>Home / Manage / New Event</div>
</div>
<a href='/' style={{background:'#f3f4f6',color:'#374151',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none'}}>Cancel</a>
</div>
<div style={{flex:1,overflow:'auto',padding:'24px'}}>
<form onSubmit={handleSubmit} style={{maxWidth:'640px'}}>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{background:'#1a1a1a',padding:'14px 20px'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#fff'}}>Event details</div>
</div>
<div style={{padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Event title *</label>
<input name='title' required placeholder='e.g. Q2 Team Outing' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Date *</label>
<input name='date' type='date' required style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Location</label>
<input name='location' placeholder='e.g. HCM Office' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Tags</label>
<input name='tags' placeholder='e.g. team-building, q2-2026' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Description</label>
<textarea name='description' rows={3} placeholder='Describe what happened...' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none',resize:'vertical'}}/>
</div>
</div>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{background:'#1a1a1a',padding:'14px 20px'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#fff'}}>Media and album</div>
<div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>Upload preview images and link full album</div>
</div>
<div style={{padding:'20px',display:'flex',flexDirection:'column',gap:'16px'}}>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'8px'}}>Preview images</label>
<div
onDrop={handleDrop}
onDragOver={(e:React.DragEvent)=>{e.preventDefault();setDragOver(true)}}
onDragLeave={()=>setDragOver(false)}
onClick={()=>(document.getElementById('fileInput') as HTMLInputElement)?.click()}
style={{border:'2px dashed '+(dragOver?'#ff6b00':'#e5e7eb'),borderRadius:'8px',padding:'24px',textAlign:'center',background:dragOver?'#fff8f3':'#fafafa',cursor:'pointer',transition:'all 0.2s'}}
>
<div style={{fontSize:'24px',marginBottom:'6px'}}>📸</div>
<div style={{fontSize:'13px',fontWeight:500,color:'#374151',marginBottom:'2px'}}>Drag and drop or click to select</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>Select multiple images at once</div>
<input id='fileInput' type='file' multiple accept='image/*' style={{display:'none'}} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>handleFiles(e.target.files)}/>
</div>
{files.length>0&&(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))',gap:'8px',marginTop:'10px'}}>
{files.map((f,i)=>(
<div key={i} style={{position:'relative'}}>
<img src={f.preview} alt='' style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:'6px',display:'block'}}/>
<button type='button' onClick={()=>removeFile(i)} style={{position:'absolute',top:'3px',right:'3px',background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',cursor:'pointer',fontSize:'11px'}}>x</button>
</div>
))}
</div>
)}
</div>
<div style={{borderTop:'1px solid #f3f4f6',paddingTop:'16px'}}>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Google Drive full album link</label>
<input value={driveLink} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setDriveLink(e.target.value)} placeholder='https://drive.google.com/drive/folders/...' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'8px 10px',fontSize:'13px',outline:'none'}}/>
<div style={{fontSize:'11px',color:'#9ca3af',marginTop:'4px'}}>Paste your Google Drive folder link here</div>
</div>
</div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
<a href='/' style={{background:'#fff',color:'#374151',border:'1px solid #e5e7eb',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',textDecoration:'none'}}>Cancel</a>
<button type='submit' disabled={saving} style={{background:saving?'#d1d5db':'#ff6b00',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:500,cursor:saving?'not-allowed':'pointer'}}>
{saving?'Saving...':'Save event'}
</button>
</div>
</form>
</div>
</div>
)
}