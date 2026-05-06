'use client'
import{useState,useRef,useCallback,useEffect}from'react'
import{createPortal}from'react-dom'
import Image from'next/image'

const TOOLTIP_W=248
const TOOLTIP_MAX_H=320
const MARGIN=8 // min distance from viewport edge

type EventData={
id:string
title:string
date:string
location?:string
category?:string
entity?:string
office?:string
event_time?:string
timezone?:string
description?:string
firstImage?:string
}

type Pos={top:number,left:number}

export default function EventPill({ev,color}:{ev:EventData,color:string}){
const[show,setShow]=useState(false)
const[pos,setPos]=useState<Pos>({top:0,left:0})
const[mounted,setMounted]=useState(false)
const timerRef=useRef<ReturnType<typeof setTimeout>|null>(null)
const pillRef=useRef<HTMLDivElement>(null)
const tappedRef=useRef(false)

// Ensure we're on the client before attempting portal
useEffect(()=>{setMounted(true)},[])

const open=useCallback(()=>{
if(!pillRef.current)return
const rect=pillRef.current.getBoundingClientRect()
const spaceBelow=window.innerHeight-rect.bottom
const spaceAbove=rect.top
const tooltipH=ev.firstImage?TOOLTIP_MAX_H:200

// Prefer below; flip above if not enough room
let top=spaceBelow>=tooltipH+MARGIN
?rect.bottom+6
:rect.top-tooltipH-6

// Clamp vertically
top=Math.max(MARGIN,Math.min(top,window.innerHeight-tooltipH-MARGIN))

// Center horizontally over pill, then clamp
const idealLeft=rect.left+rect.width/2-TOOLTIP_W/2
const left=Math.max(MARGIN,Math.min(idealLeft,window.innerWidth-TOOLTIP_W-MARGIN))

setPos({top,left})
setShow(true)
},[ev.firstImage])

const close=useCallback(()=>{
if(timerRef.current)clearTimeout(timerRef.current)
setShow(false)
},[])

const onMouseEnter=()=>{timerRef.current=setTimeout(open,130)}
const onMouseLeave=()=>close()

const onTouchEnd=(e:React.TouchEvent)=>{
if(!tappedRef.current){
e.preventDefault()
tappedRef.current=true
open()
setTimeout(()=>{tappedRef.current=false;setShow(false)},4000)
}
}

const date=new Date(ev.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})

const tooltip=(
<div
style={{
position:'fixed',
top:pos.top,
left:pos.left,
width:TOOLTIP_W,
zIndex:9999,
background:'#ffffff',
border:'1px solid #E5E7EB',
borderRadius:'12px',
boxShadow:'0 8px 40px rgba(0,0,0,.14)',
overflow:'hidden',
pointerEvents:'none',
}}
>
{ev.firstImage&&(
<div style={{position:'relative',height:'88px',background:'#F3F4F6',flexShrink:0}}>
<Image src={ev.firstImage} alt='' fill sizes='248px' style={{objectFit:'cover'}}/>
</div>
)}
<div style={{padding:'10px 12px'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A',marginBottom:'6px',lineHeight:1.3}}>{ev.title}</div>
<div style={{fontSize:'11.5px',color:'#6B7280',lineHeight:1.65}}>
<div>📅 {date}</div>
{ev.event_time&&ev.timezone&&<div>🕐 {ev.event_time} · {ev.timezone}</div>}
{ev.location&&<div>📍 {ev.location}</div>}
</div>
{(ev.category||ev.entity||ev.office)&&(
<div style={{display:'flex',gap:'4px',flexWrap:'wrap' as const,marginTop:'7px'}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFF3EB',color:'#FF6B00',padding:'1px 7px',borderRadius:'999px',fontWeight:600}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#374151',padding:'1px 7px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#374151',padding:'1px 7px',borderRadius:'999px'}}>{ev.office}</span>}
</div>
)}
{ev.description&&(
<div style={{
fontSize:'11.5px',color:'#6B7280',marginTop:'7px',lineHeight:1.5,
overflow:'hidden',display:'-webkit-box',
WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,
maxHeight:'36px',
}}>
{ev.description}
</div>
)}
<div style={{fontSize:'10.5px',color:'#C4C9D4',marginTop:'8px',textAlign:'right' as const,fontStyle:'italic'}}>Click to open →</div>
</div>
</div>
)

return(
<div ref={pillRef} style={{position:'relative'}} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
<a
href={'/events/'+ev.id}
onTouchEnd={onTouchEnd}
style={{display:'block',padding:'2px 6px',borderRadius:'4px',fontSize:'10.5px',fontWeight:500,marginBottom:'2px',textDecoration:'none',background:color,color:'#ffffff',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}
>
{ev.title}
</a>
{mounted&&show&&createPortal(tooltip,document.body)}
</div>
)
}
