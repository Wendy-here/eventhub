'use client'
import{useState,useMemo,useRef}from'react'

const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS=Array.from({length:21},(_,i)=>2015+i)

function daysInMonth(month:number,year:number){
if(!month||!year)return 31
return new Date(year,month,0).getDate()
}

const SEL:React.CSSProperties={
width:'100%',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'7px 28px 7px 10px',
fontSize:'13px',fontFamily:'Noto Sans,sans-serif',outline:'none',
color:'#1A1A1A',background:'#ffffff',cursor:'pointer',
appearance:'none' as const,
backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239CA3AF' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center',
}

type Props={
defaultDate?:string
defaultTime?:string
defaultEndTime?:string
defaultTimezone?:string
timezoneOptions:readonly string[]
timezone?:string
onTimezoneChange?:(tz:string)=>void
}

export default function DateTimePicker({defaultDate='',defaultTime='',defaultEndTime='',defaultTimezone='',timezoneOptions,timezone:controlledTz,onTimezoneChange}:Props){
const[year,setYear]=useState(()=>{
if(defaultDate){const[y]=defaultDate.split('-');return Number(y)||0}
return 0
})
const[month,setMonth]=useState(()=>{
if(defaultDate){const[,m]=defaultDate.split('-');return Number(m)||0}
return 0
})
const[day,setDay]=useState(()=>{
if(defaultDate){const[,,d]=defaultDate.split('-');return Number(d)||0}
return 0
})
const[hour,setHour]=useState(()=>{
if(defaultTime){const[h]=defaultTime.split(':');return h||''}
return ''
})
const[minute,setMinute]=useState(()=>{
if(defaultTime){const[,m]=defaultTime.split(':');return m||''}
return ''
})
const minuteRef=useRef<HTMLInputElement>(null)

const[endHour,setEndHour]=useState(()=>{
if(defaultEndTime){const[h]=defaultEndTime.split(':');return h||''}
return ''
})
const[endMinute,setEndMinute]=useState(()=>{
if(defaultEndTime){const[,m]=defaultEndTime.split(':');return m||''}
return ''
})
const endMinuteRef=useRef<HTMLInputElement>(null)

const[internalTz,setInternalTz]=useState(defaultTimezone)
const timezone=controlledTz!==undefined?controlledTz:internalTz
const setTimezone=(v:string)=>{if(onTimezoneChange)onTimezoneChange(v);else setInternalTz(v)}

const maxDay=useMemo(()=>daysInMonth(month,year),[month,year])
const safeDay=day>maxDay?maxDay:day

const dateValue=year&&month&&safeDay
?`${year}-${String(month).padStart(2,'0')}-${String(safeDay).padStart(2,'0')}`
:''
const timeValue=hour?`${hour.padStart(2,'0')}:${(minute||'00').padStart(2,'0')}`:''
const endTimeValue=endHour?`${endHour.padStart(2,'0')}:${(endMinute||'00').padStart(2,'0')}`:''

const INP:React.CSSProperties={
width:'100%',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'7px 10px',
fontSize:'13px',fontFamily:'Noto Sans,sans-serif',outline:'none',
color:'#1A1A1A',background:'#ffffff',textAlign:'center' as const,
}

const handleHourChange=(v:string)=>{
const stripped=v.replace(/\D/g,'').slice(0,2)
setHour(stripped)
if(stripped.length===2){const n=Number(stripped);if(n>=0&&n<=23)minuteRef.current?.focus()}
}
const handleHourBlur=(v:string)=>{
const n=Number(v)
if(v===''||isNaN(n)||n<0||n>23){setHour('');setMinute('')}
else setHour(String(n).padStart(2,'0'))
}
const handleMinuteChange=(v:string)=>{setMinute(v.replace(/\D/g,'').slice(0,2))}
const handleMinuteBlur=(v:string)=>{
const n=Number(v)
if(v===''||isNaN(n)||n<0||n>59)setMinute(hour?'00':'')
else setMinute(String(n).padStart(2,'0'))
}

const handleEndHourChange=(v:string)=>{
const stripped=v.replace(/\D/g,'').slice(0,2)
setEndHour(stripped)
if(stripped.length===2){const n=Number(stripped);if(n>=0&&n<=23)endMinuteRef.current?.focus()}
}
const handleEndHourBlur=(v:string)=>{
const n=Number(v)
if(v===''||isNaN(n)||n<0||n>23){setEndHour('');setEndMinute('')}
else setEndHour(String(n).padStart(2,'0'))
}
const handleEndMinuteChange=(v:string)=>{setEndMinute(v.replace(/\D/g,'').slice(0,2))}
const handleEndMinuteBlur=(v:string)=>{
const n=Number(v)
if(v===''||isNaN(n)||n<0||n>59)setEndMinute(endHour?'00':'')
else setEndMinute(String(n).padStart(2,'0'))
}

return(
<>
<input type='hidden' name='date' value={dateValue}/>
<input type='hidden' name='event_time' value={timeValue}/>
<input type='hidden' name='event_end_time' value={endTimeValue}/>
<input type='hidden' name='timezone' value={timezone}/>

<div style={{display:'flex',flexDirection:'column' as const,gap:'14px'}}>
{/* DATE */}
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>
Date <span style={{color:'#DC2626'}}>*</span>
</label>
<div style={{display:'grid',gridTemplateColumns:'80px 1fr 90px',gap:'6px'}}>
<select value={safeDay||''} onChange={e=>setDay(Number(e.target.value))} style={SEL} aria-label='Day'>
<option value=''>Day</option>
{Array.from({length:maxDay},(_,i)=>i+1).map(d=>(
<option key={d} value={d}>{String(d).padStart(2,'0')}</option>
))}
</select>
<select value={month||''} onChange={e=>setMonth(Number(e.target.value))} style={SEL} aria-label='Month'>
<option value=''>Month</option>
{MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
</select>
<select value={year||''} onChange={e=>setYear(Number(e.target.value))} style={SEL} aria-label='Year'>
<option value=''>Year</option>
{YEARS.map(y=><option key={y} value={y}>{y}</option>)}
</select>
</div>
</div>

{/* TIME: Start → End + Timezone */}
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'8px'}}>
Time <span style={{fontWeight:400,color:'#9CA3AF'}}>(optional)</span>
</label>
<div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr 1fr',gap:'8px',alignItems:'center'}}>
{/* Start time */}
<div>
<div style={{fontSize:'11px',color:'#6B7280',marginBottom:'4px'}}>Start</div>
<div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'4px',alignItems:'center'}}>
<input
value={hour}
onChange={e=>handleHourChange(e.target.value)}
onBlur={e=>handleHourBlur(e.target.value)}
placeholder='HH'
inputMode='numeric'
maxLength={2}
style={INP}
aria-label='Start hour'
/>
<span style={{fontSize:'13px',color:'#6B7280',fontWeight:500,textAlign:'center' as const}}>:</span>
<input
ref={minuteRef}
value={minute}
onChange={e=>handleMinuteChange(e.target.value)}
onBlur={e=>handleMinuteBlur(e.target.value)}
placeholder='MM'
inputMode='numeric'
maxLength={2}
disabled={!hour}
style={{...INP,opacity:hour?1:.4}}
aria-label='Start minute'
/>
</div>
</div>

{/* Arrow */}
<div style={{fontSize:'13px',color:'#9CA3AF',marginTop:'18px',textAlign:'center' as const}}>→</div>

{/* End time */}
<div>
<div style={{fontSize:'11px',color:'#6B7280',marginBottom:'4px'}}>End <span style={{color:'#9CA3AF'}}>(opt)</span></div>
<div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'4px',alignItems:'center'}}>
<input
value={endHour}
onChange={e=>handleEndHourChange(e.target.value)}
onBlur={e=>handleEndHourBlur(e.target.value)}
placeholder='HH'
inputMode='numeric'
maxLength={2}
disabled={!hour}
style={{...INP,opacity:hour?1:.4}}
aria-label='End hour'
/>
<span style={{fontSize:'13px',color:'#6B7280',fontWeight:500,textAlign:'center' as const}}>:</span>
<input
ref={endMinuteRef}
value={endMinute}
onChange={e=>handleEndMinuteChange(e.target.value)}
onBlur={e=>handleEndMinuteBlur(e.target.value)}
placeholder='MM'
inputMode='numeric'
maxLength={2}
disabled={!endHour}
style={{...INP,opacity:endHour?1:.4}}
aria-label='End minute'
/>
</div>
</div>

{/* Timezone */}
<div>
<div style={{fontSize:'11px',color:'#6B7280',marginBottom:'4px'}}>Timezone</div>
<select value={timezone} onChange={e=>setTimezone(e.target.value)} disabled={!hour} style={{...SEL,opacity:hour?1:.45,width:'100%'}}>
<option value=''>—</option>
{timezoneOptions.map(tz=><option key={tz} value={tz}>{tz}</option>)}
</select>
</div>
</div>
</div>
</div>
</>
)
}
