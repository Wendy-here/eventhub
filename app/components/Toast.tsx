'use client'
import{useState,useCallback,useRef}from'react'

type ToastItem={id:number,message:string,type:'success'|'error'}

export function useToast(){
const[toasts,setToasts]=useState<ToastItem[]>([])
const counter=useRef(0)

const show=useCallback((message:string,type:'success'|'error'='success')=>{
const id=++counter.current
setToasts(prev=>[...prev,{id,message,type}])
setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),3500)
},[])

return{toasts,show}
}

export function ToastContainer({toasts}:{toasts:ToastItem[]}){
if(toasts.length===0)return null
return(
<div style={{position:'fixed',bottom:'24px',right:'24px',display:'flex',flexDirection:'column' as const,gap:'8px',zIndex:9999,pointerEvents:'none'}}>
{toasts.map(t=>(
<div key={t.id} style={{
display:'flex',alignItems:'center',gap:'10px',
padding:'10px 16px',
borderRadius:'10px',
background:t.type==='error'?'#1f1f1f':'#1f1f1f',
boxShadow:'0 4px 20px rgba(0,0,0,.18)',
fontSize:'13px',fontWeight:500,color:'#ffffff',
minWidth:'220px',maxWidth:'340px',
animation:'toast-in .2s ease',
}}>
<span style={{fontSize:'15px'}}>{t.type==='success'?'✓':'⚠'}</span>
<span style={{color:t.type==='error'?'#fca5a5':'#86efac'}}>{t.message}</span>
</div>
))}
</div>
)
}
