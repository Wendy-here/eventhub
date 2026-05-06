'use client'
import{useState,useRef,useCallback}from'react'
import Image from'next/image'

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

export default function EventPill({ev,color}:{ev:EventData,color:string}){
const[show,setShow]=useState(false)
const[above,setAbove]=useState(false)
const timerRef=useRef<ReturnType<typeof setTimeout>|null>(null)
const pillRef=useRef<HTMLDivElement>(null)
const tappedRef=useRef(false) // mobile: first tap = preview, second = navigate

const open=useCallback(()=>{
// Position tooltip above or below based on space
if(pillRef.current){
const rect=pillRef.current.getBoundingClientRect()
setAbove(rect.bottom+220>window.innerHeight)
}
setShow(true)
},[])

const onMouseEnter=()=>{
timerRef.current=setTimeout(open,140)
}
const onMouseLeave=()=>{
if(timerRef.current)clearTimeout(timerRef.current)
setShow(false)
}

// Mobile tap: first tap shows preview, second navigates
const onTouchEnd=(e:React.TouchEvent)=>{
if(!tappedRef.current){
e.preventDefault()
tappedRef.current=true
open()
// Auto-close after 4 seconds if no second tap
setTimeout(()=>{tappedRef.current=false;setShow(false)},4000)
}
// second tap → follow link naturally (don't call preventDefault)
}

const date=new Date(ev.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})

return(
<div ref={pillRef} style={{position:'relative'}} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
<a
href={'/events/'+ev.id}
onTouchEnd={onTouchEnd}
style={{display:'block',padding:'2px 6px',borderRadius:'4px',fontSize:'10.5px',fontWeight:500,marginBottom:'2px',textDecoration:'none',background:color,color:'#ffffff',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}
>
{ev.title}
</a>

{show&&(
<div style={{
position:'absolute',
[above?'bottom':'top']:'calc(100% + 6px)',
left:'50%',transform:'translateX(-50%)',
zIndex:200,
width:'240px',
background:'#ffffff',
border:'1px solid #E5E7EB',
borderRadius:'12px',
boxShadow:'0 8px 32px rgba(0,0,0,.12)',
overflow:'hidden',
pointerEvents:'none',
}}>
{ev.firstImage&&(
<div style={{position:'relative',height:'90px',background:'#F3F4F6'}}>
<Image src={ev.firstImage} alt='' fill sizes='240px' style={{objectFit:'cover'}}/>
</div>
)}
<div style={{padding:'10px 12px'}}>
<div style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A',marginBottom:'6px',lineHeight:1.3}}>{ev.title}</div>
<div style={{fontSize:'11.5px',color:'#6B7280',lineHeight:1.6}}>
<div>📅 {date}</div>
{ev.event_time&&ev.timezone&&<div>🕐 {ev.event_time} · {ev.timezone}</div>}
{ev.location&&<div>📍 {ev.location}</div>}
</div>
{(ev.category||ev.entity||ev.office)&&(
<div style={{display:'flex',gap:'4px',flexWrap:'wrap' as const,marginTop:'8px'}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFE4D1',color:'#E65C00',padding:'1px 7px',borderRadius:'999px',fontWeight:500}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#374151',padding:'1px 7px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#374151',padding:'1px 7px',borderRadius:'999px'}}>{ev.office}</span>}
</div>
)}
{ev.description&&(
<div style={{fontSize:'11.5px',color:'#6B7280',marginTop:'8px',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>
{ev.description}
</div>
)}
<div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'8px',textAlign:'right' as const}}>Tap to open →</div>
</div>
</div>
)}
</div>
)
}
