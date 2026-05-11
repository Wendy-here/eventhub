'use client'
import{useState,useRef}from'react'
import Image from'next/image'
import Link from'next/link'

type EventData={
id:string
title:string
date:string
location?:string
category?:string
entity?:string
office?:string
event_time?:string
event_end_time?:string
timezone?:string
description?:string
firstImage?:string
}

export default function EventPill({ev,color}:{ev:EventData;color:string}){
const[show,setShow]=useState(false)
const[above,setAbove]=useState(false)
const pillRef=useRef<HTMLDivElement>(null)
const timerRef=useRef<ReturnType<typeof setTimeout>|null>(null)

const open=()=>{
if(!pillRef.current)return
const rect=pillRef.current.getBoundingClientRect()
setAbove(window.innerHeight-rect.bottom<200)
setShow(true)
}

const onMouseEnter=()=>{timerRef.current=setTimeout(open,120)}
const onMouseLeave=()=>{if(timerRef.current)clearTimeout(timerRef.current);setShow(false)}

const date=new Date(ev.date.slice(0,10)+'T00:00:00').toLocaleDateString('en-GB',{
weekday:'short',day:'numeric',month:'short',year:'numeric'
})

const timeLabel=ev.event_time
?ev.event_time.slice(0,5)+(ev.event_end_time?'→'+ev.event_end_time.slice(0,5):'')
:null

return(
<div ref={pillRef} style={{position:'relative'}} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
<Link
href={'/events/'+ev.id}
className='event-pill-link'
style={{
display:'block',padding:'2px 6px',borderRadius:'4px',
fontSize:'10.5px',fontWeight:600,marginBottom:'2px',
textDecoration:'none',background:color,color:'#ffffff',
whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.3,
}}
>
{ev.title}
{timeLabel&&(
<span style={{display:'block',fontSize:'9.5px',opacity:.85,fontWeight:400,marginTop:'1px'}}>
{timeLabel}
</span>
)}
</Link>

{show&&(
<div style={{
position:'absolute',
...(above?{bottom:'calc(100% + 4px)'}:{top:'calc(100% + 4px)'}),
left:'0',
width:'220px',
zIndex:9999,
background:'#ffffff',
border:'1px solid #E5E7EB',
borderRadius:'10px',
boxShadow:'0 4px 20px rgba(0,0,0,.12)',
overflow:'hidden',
pointerEvents:'none',
}}>
{ev.firstImage&&(
<div style={{position:'relative',height:'80px',background:'#F3F4F6'}}>
<Image src={ev.firstImage} alt='' fill sizes='220px' style={{objectFit:'cover'}}/>
</div>
)}
<div style={{padding:'9px 11px'}}>
<div style={{fontSize:'12.5px',fontWeight:600,color:'#1A1A1A',marginBottom:'5px',lineHeight:1.3}}>
{ev.title}
</div>
<div style={{fontSize:'11px',color:'#6B7280',lineHeight:1.7}}>
<div>📅 {date}</div>
{timeLabel&&<div>🕐 {timeLabel} · {ev.timezone}</div>}
{ev.location&&<div>📍 {ev.location}</div>}
</div>
{(ev.category||ev.entity||ev.office)&&(
<div style={{display:'flex',gap:'4px',flexWrap:'wrap' as const,marginTop:'6px'}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFF3EB',color:'#FF6B00',padding:'1px 7px',borderRadius:'999px',fontWeight:600}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#374151',padding:'1px 7px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#374151',padding:'1px 7px',borderRadius:'999px'}}>{ev.office}</span>}
</div>
)}
{ev.description&&(
<div style={{fontSize:'11px',color:'#6B7280',marginTop:'6px',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>
{ev.description}
</div>
)}
<div style={{fontSize:'10px',color:'#C4C9D4',marginTop:'6px',textAlign:'right' as const,fontStyle:'italic'}}>Click to open →</div>
</div>
</div>
)}
</div>
)
}
