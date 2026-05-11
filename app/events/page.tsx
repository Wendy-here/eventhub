import{getServerSupabase}from'@/app/lib/supabaseServer'
import{isAdmin}from'@/app/lib/roles'
import{Suspense}from'react'
import EventsFilterBar from'@/app/components/EventsFilterBar'
import{allZoneTimes}from'@/app/lib/timezones'

const PAGE_SIZE=10
const LIST_FIELDS='id,title,date,event_time,timezone,location,category,entity,office,tags,description,drive_link'

export default async function EventsPage({searchParams}:any){
const supabase=await getServerSupabase()
const sp=await searchParams
const page=Math.max(1,parseInt(sp?.page||'1'))
const search=sp?.search||''
const category=sp?.category||''
const entity=sp?.entity||''
const office=sp?.office||''
const sort=sp?.sort||'newest'
const admin=await isAdmin()

let countQuery=supabase.from('events').select('id',{count:'exact',head:true})
if(search)countQuery=countQuery.ilike('title','%'+search+'%')
if(category)countQuery=countQuery.eq('category',category)
if(entity)countQuery=countQuery.eq('entity',entity)
if(office)countQuery=countQuery.eq('office',office)

let dataQuery=supabase.from('events').select(LIST_FIELDS)
if(search)dataQuery=dataQuery.ilike('title','%'+search+'%')
if(category)dataQuery=dataQuery.eq('category',category)
if(entity)dataQuery=dataQuery.eq('entity',entity)
if(office)dataQuery=dataQuery.eq('office',office)
if(sort==='oldest')dataQuery=dataQuery.order('date',{ascending:true})
else if(sort==='az')dataQuery=dataQuery.order('title',{ascending:true})
else if(sort==='za')dataQuery=dataQuery.order('title',{ascending:false})
else dataQuery=dataQuery.order('date',{ascending:false})

const[countResult,dataResult]=await Promise.all([
countQuery,
dataQuery.range((Math.max(1,page)-1)*PAGE_SIZE,Math.max(1,page)*PAGE_SIZE-1)
])
if(countResult.error)console.error('[EventsPage] count query error:',countResult.error)
if(dataResult.error)console.error('[EventsPage] data query error:',dataResult.error)
const total=countResult.count||0
const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE))
const safePage=Math.min(Math.max(1,page),totalPages)
const events=dataResult.data||[]

// Fetch going counts — skip gracefully if attendances table doesn't exist
const eventIds=events.map((e:any)=>e.id)
const goingByEvent:Record<string,number>={}
if(eventIds.length>0){
const{data:goings,error:goingsError}=await supabase.from('attendances').select('event_id').eq('status','yes').in('event_id',eventIds)
if(goingsError)console.error('[EventsPage] goings query error:',goingsError)
goings?.forEach((a:any)=>{goingByEvent[a.event_id]=(goingByEvent[a.event_id]||0)+1})
}

const buildUrl=(params:Record<string,string>)=>{
const base:Record<string,string>={}
if(search)base.search=search
if(category)base.category=category
if(entity)base.entity=entity
if(office)base.office=office
if(sort&&sort!=='newest')base.sort=sort
if(safePage>1)base.page=String(safePage)
Object.assign(base,params)
Object.keys(base).forEach(k=>{if(!base[k])delete base[k]})
const qs=Object.entries(base).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')
return qs?'/events?'+qs:'/events'
}

const pageNums:number[]=[]
const delta=3
for(let p=Math.max(1,safePage-delta);p<=Math.min(totalPages,safePage+delta);p++)pageNums.push(p)

const from=(safePage-1)*PAGE_SIZE+1
const to=Math.min(safePage*PAGE_SIZE,total)

return(
<div>
<Suspense fallback={<div style={{height:'50px',background:'#ffffff',borderBottom:'1px solid #E5E7EB'}}/>}>
<EventsFilterBar/>
</Suspense>

<div className='page-padding' style={{padding:'24px 24px 0'}}>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',letterSpacing:'-.3px',margin:'0 0 4px'}}>All Events</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',margin:'0 0 20px'}}>
{total>0?`${total} events · showing ${from}–${to}`:'No events found'}
</p>
</div>

<div className='page-padding' style={{padding:'0 24px 32px'}}>

<div style={{display:'flex',flexDirection:'column',gap:'10px',maxWidth:'800px'}}>
{events&&events.length>0?events.map((ev:any)=>(
<a key={ev.id} href={'/events/'+ev.id} className='event-card'>
<div className='event-card-inner' style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:'16px',overflow:'hidden'}}>
<div style={{height:'4px',background:ev.category?['#FF6B00','#0F6E56','#534AB7','#C2410C','#15803D'][Math.abs([...(ev.category||'')].reduce((h:number,c:string)=>h*31+c.charCodeAt(0),0))%5]:'#E5E7EB'}}/>
<div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<div style={{flex:1,minWidth:0}}>
<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap' as const}}>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>{ev.title}</div>
{ev.drive_link&&<span style={{fontSize:'10px',background:'#F0FDF4',color:'#15803D',border:'1px solid #BBF7D0',padding:'1px 7px',borderRadius:'10px',flexShrink:0}}>Drive</span>}
</div>
<div style={{display:'flex',flexWrap:'wrap' as const,gap:'10px',fontSize:'12px',color:'#6B7280',marginBottom:'6px'}}>
<span>📅 {new Date(ev.date.slice(0,10)+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
{ev.location&&<span>📍 {ev.location}</span>}
</div>
<div style={{display:'flex',gap:'5px',flexWrap:'wrap' as const}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFF3EB',color:'#993C1D',padding:'2px 9px',borderRadius:'999px',fontWeight:600}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'2px 9px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'2px 9px',borderRadius:'999px'}}>{ev.office}</span>}
</div>
</div>
<div style={{color:'#FF6B00',fontSize:'18px',marginLeft:'12px',flexShrink:0}}>›</div>
</div>
</div>
</a>
)):(
<div style={{padding:'60px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'14px'}}>
No events found.
</div>
)}
</div>

{/* Pagination */}
{totalPages>1&&(
<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',flexWrap:'wrap' as const}}>
{safePage>1&&(
<a href={buildUrl({page:String(safePage-1)})} style={{width:'32px',height:'32px',border:'1px solid #E5E7EB',borderRadius:'8px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</a>
)}
{pageNums[0]>1&&<span style={{padding:'0 4px',color:'#9CA3AF',fontSize:'13px'}}>1 …</span>}
{pageNums.map(p=>(
<a key={p} href={buildUrl({page:String(p)})} style={{width:'32px',height:'32px',border:'1px solid',borderColor:p===safePage?'#FF6B00':'#E5E7EB',borderRadius:'8px',background:p===safePage?'#FF6B00':'#fff',fontSize:'13px',fontWeight:p===safePage?600:400,color:p===safePage?'#fff':'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>{p}</a>
))}
{pageNums[pageNums.length-1]<totalPages&&<span style={{padding:'0 4px',color:'#9CA3AF',fontSize:'13px'}}>… {totalPages}</span>}
{safePage<totalPages&&(
<a href={buildUrl({page:String(safePage+1)})} style={{width:'32px',height:'32px',border:'1px solid #E5E7EB',borderRadius:'8px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>›</a>
)}
</div>
)}

</div>
</div>
)
}
