import{supabase}from'@/app/lib/supabase'
import{isAdmin}from'@/app/lib/roles'
import{Suspense}from'react'
import EventsFilterBar from'@/app/components/EventsFilterBar'

const PAGE_SIZE=10

export default async function EventsPage({searchParams}:any){
const sp=await searchParams
const page=Math.max(1,parseInt(sp?.page||'1'))
const search=sp?.search||''
const category=sp?.category||''
const entity=sp?.entity||''
const sort=sp?.sort||'newest'
const admin=await isAdmin()

// Count query for pagination
let countQuery=supabase.from('events').select('*',{count:'exact',head:true})
if(search)countQuery=countQuery.ilike('title','%'+search+'%')
if(category)countQuery=countQuery.eq('category',category)
if(entity)countQuery=countQuery.eq('entity',entity)
const{count}=await countQuery
const total=count||0
const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE))
const safePage=Math.min(page,totalPages)

// Data query
let dataQuery=supabase.from('events').select('*')
if(search)dataQuery=dataQuery.ilike('title','%'+search+'%')
if(category)dataQuery=dataQuery.eq('category',category)
if(entity)dataQuery=dataQuery.eq('entity',entity)
if(sort==='oldest')dataQuery=dataQuery.order('date',{ascending:true})
else if(sort==='az')dataQuery=dataQuery.order('title',{ascending:true})
else if(sort==='za')dataQuery=dataQuery.order('title',{ascending:false})
else dataQuery=dataQuery.order('date',{ascending:false})
dataQuery=dataQuery.range((safePage-1)*PAGE_SIZE,safePage*PAGE_SIZE-1)

const{data:events}=await dataQuery

const buildUrl=(params:Record<string,string>)=>{
const base:Record<string,string>={}
if(search)base.search=search
if(category)base.category=category
if(entity)base.entity=entity
if(sort&&sort!=='newest')base.sort=sort
if(safePage>1)base.page=String(safePage)
Object.assign(base,params)
Object.keys(base).forEach(k=>{if(!base[k])delete base[k]})
const qs=Object.entries(base).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')
return qs?'/events?'+qs:'/events'
}

// Pagination window — show up to 7 page buttons
const pageNums:number[]=[]
const delta=3
for(let p=Math.max(1,safePage-delta);p<=Math.min(totalPages,safePage+delta);p++)pageNums.push(p)

const from=(safePage-1)*PAGE_SIZE+1
const to=Math.min(safePage*PAGE_SIZE,total)

return(
<div>
{/* Toolbar */}
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,gap:'12px'}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>All Events</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>{total>0?`Showing ${from}–${to} of ${total}`:'No events found'}</div>
</div>
{admin&&<a href='/admin/events/new' style={{background:'#ff6b00',color:'#fff',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none',fontWeight:500,whiteSpace:'nowrap' as const}}>+ New event</a>}
</div>

{/* Filters */}
<Suspense fallback={<div style={{height:'42px',background:'#F3F4F6',borderBottom:'1px solid #E5E7EB'}}/>}>
<EventsFilterBar/>
</Suspense>

<div style={{padding:'20px 24px',maxWidth:'860px'}}>

{/* Event list */}
<div style={{display:'flex',flexDirection:'column' as const,gap:'8px',marginBottom:'24px'}}>
{events&&events.length>0?events.map((event:any)=>(
<a key={event.id} href={'/events/'+event.id} style={{display:'block',textDecoration:'none'}}>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
<div style={{flex:1,minWidth:0}}>
<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px',flexWrap:'wrap' as const}}>
<div style={{fontSize:'14px',fontWeight:600,color:'#111827'}}>{event.title}</div>
{event.drive_link&&<span style={{fontSize:'10px',background:'#f0fdf4',color:'#15803d',border:'1px solid #bbf7d0',padding:'1px 7px',borderRadius:'10px',flexShrink:0}}>Drive</span>}
</div>
<div style={{display:'flex',gap:'10px',fontSize:'12px',color:'#6b7280',flexWrap:'wrap' as const,marginBottom:'5px'}}>
<span>📅 {new Date(event.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
{event.location&&<span>📍 {event.location}</span>}
</div>
<div style={{display:'flex',gap:'5px',flexWrap:'wrap' as const}}>
{event.category&&<span style={{fontSize:'10px',background:'#FFE4D1',color:'#E65C00',padding:'1px 8px',borderRadius:'999px',fontWeight:500}}>{event.category}</span>}
{event.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6b7280',padding:'1px 8px',borderRadius:'999px'}}>{event.entity}</span>}
{event.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6b7280',padding:'1px 8px',borderRadius:'999px'}}>{event.office}</span>}
{event.tags&&event.tags.slice(0,3).map((tag:string)=>(<span key={tag} style={{fontSize:'10px',padding:'1px 8px',background:'#f3f4f6',color:'#6b7280',borderRadius:'10px'}}>#{tag}</span>))}
</div>
</div>
<div style={{color:'#9ca3af',fontSize:'18px',flexShrink:0}}>›</div>
</div>
</a>
)):(
<div style={{padding:'60px',textAlign:'center' as const,color:'#9ca3af',fontSize:'14px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px'}}>
No events found
{admin&&!search&&!category&&!entity&&<><br/><a href='/admin/events/new' style={{color:'#ff6b00',textDecoration:'none',fontWeight:500,marginTop:'8px',display:'inline-block'}}>+ Create the first event</a></>}
</div>
)}
</div>

{/* Pagination */}
{totalPages>1&&(
<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',flexWrap:'wrap' as const}}>
{safePage>1&&(
<a href={buildUrl({page:String(safePage-1)})} style={{width:'32px',height:'32px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</a>
)}
{pageNums[0]>1&&<span style={{padding:'0 4px',color:'#9CA3AF',fontSize:'13px'}}>1 …</span>}
{pageNums.map(p=>(
<a key={p} href={buildUrl({page:String(p)})} style={{width:'32px',height:'32px',border:'1px solid',borderColor:p===safePage?'#FF6B00':'#E5E7EB',borderRadius:'6px',background:p===safePage?'#FF6B00':'#fff',fontSize:'13px',fontWeight:p===safePage?600:400,color:p===safePage?'#fff':'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>
{p}
</a>
))}
{pageNums[pageNums.length-1]<totalPages&&<span style={{padding:'0 4px',color:'#9CA3AF',fontSize:'13px'}}>… {totalPages}</span>}
{safePage<totalPages&&(
<a href={buildUrl({page:String(safePage+1)})} style={{width:'32px',height:'32px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>›</a>
)}
</div>
)}

</div>
</div>
)
}
