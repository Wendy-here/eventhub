'use client'
import{useState,useCallback}from'react'
import{supabase}from'@/app/lib/supabase'
import{useRouter,useParams}from'next/navigation'

type FileItem={file:File,preview:string,caption:string}

export default function UploadPage(){
const params=useParams()
const id=params.id as string
const router=useRouter()
const[files,setFiles]=useState<FileItem[]>([])
const[uploading,setUploading]=useState(false)
const[progress,setProgress]=useState(0)
const[dragOver,setDragOver]=useState(false)

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
const updateCaption=(i:number,val:string)=>setFiles((prev:FileItem[])=>prev.map((f,idx)=>idx===i?{...f,caption:val}:f))

const uploadAll=async()=>{
if(files.length===0||!id)return
setUploading(true)
setProgress(0)
const rows:any[]=[]
for(let i=0;i<files.length;i++){
const{file,caption}=files[i]
const ext=file.name.split('.').pop()
const path=id+'/'+Date.now()+'-'+i+'.'+ext
const{error}=await supabase.storage.from('event-images').upload(path,file,{upsert:true})
if(!error){
const{data}=supabase.storage.from('event-images').getPublicUrl(path)
rows.push({event_id:id,image_url:data.publicUrl,caption,sort_order:i})
}
setProgress(Math.round(((i+1)/files.length)*100))
}
if(rows.length>0)await supabase.from('event_images').insert(rows)
setUploading(false)
router.push('/events/'+id)
}

return(
<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>Upload Images</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>{files.length} images selected</div>
</div>
<div style={{display:'flex',gap:'8px'}}>
{!uploading&&<a href={'/events/'+id} style={{background:'#f3f4f6',color:'#374151',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none'}}>Cancel</a>}
<button onClick={uploadAll} disabled={uploading||files.length===0} style={{background:files.length===0?'#d1d5db':'#ff6b00',color:'#fff',border:'none',padding:'7px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:500,cursor:files.length===0?'not-allowed':'pointer'}}>
{uploading?'Uploading '+progress+'%':'Upload '+files.length+' images'}
</button>
</div>
</div>
<div style={{flex:1,overflow:'auto',padding:'24px'}}>
<div style={{maxWidth:'800px'}}>
<div
onDrop={handleDrop}
onDragOver={(e:React.DragEvent)=>{e.preventDefault();setDragOver(true)}}
onDragLeave={()=>setDragOver(false)}
style={{border:'2px dashed '+(dragOver?'#ff6b00':'#e5e7eb'),borderRadius:'10px',padding:'40px',textAlign:'center',marginBottom:'24px',background:dragOver?'#fff8f3':'#fafafa',cursor:'pointer'}}
onClick={()=>(document.getElementById('fileInput') as HTMLInputElement)?.click()}
>
<div style={{fontSize:'32px',marginBottom:'8px'}}>📸</div>
<div style={{fontSize:'15px',fontWeight:500,color:'#374151',marginBottom:'4px'}}>Drag and drop images here</div>
<div style={{fontSize:'13px',color:'#9ca3af',marginBottom:'16px'}}>or click to select files</div>
<div style={{fontSize:'12px',color:'#ff6b00',fontWeight:500}}>Select multiple images at once</div>
<input id='fileInput' type='file' multiple accept='image/*' style={{display:'none'}} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>handleFiles(e.target.files)}/>
</div>
{uploading&&(
<div style={{marginBottom:'24px'}}>
<div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#6b7280',marginBottom:'6px'}}>
<span>Uploading...</span><span>{progress}%</span>
</div>
<div style={{background:'#f3f4f6',borderRadius:'99px',height:'8px',overflow:'hidden'}}>
<div style={{background:'#ff6b00',height:'100%',width:progress+'%',borderRadius:'99px',transition:'width 0.3s'}}/>
</div>
</div>
)}
{files.length>0&&(
<div>
<div style={{fontSize:'13px',fontWeight:600,color:'#374151',marginBottom:'12px'}}>{files.length} images ready</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:'12px'}}>
{files.map((f:FileItem,i:number)=>(
<div key={i} style={{position:'relative'}}>
<img src={f.preview} alt='' style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px',display:'block'}}/>
<button onClick={()=>removeFile(i)} style={{position:'absolute',top:'4px',right:'4px',background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:'50%',width:'22px',height:'22px',cursor:'pointer',fontSize:'12px'}}>x</button>
<input value={f.caption} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>updateCaption(i,e.target.value)} placeholder='Caption...' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:'4px',padding:'4px 6px',fontSize:'11px',marginTop:'4px',outline:'none'}}/>
</div>
))}
</div>
</div>
)}
</div>
</div>
</div>
)
}