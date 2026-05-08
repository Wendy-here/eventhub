import{getServerSupabase}from'@/app/lib/supabaseServer'
import{isAdmin}from'@/app/lib/roles'
import{Suspense}from'react'
import EventsFilterBar from'@/app/components/EventsFilterBar'
import Image from'next/image'
import{getCoverGradient}from'@/app/lib/coverImage'

const PAGE_SIZE=10
const LIST_FIELDS='id,title,date,location,category,entity,office,tags,description,cover_image_url'

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

const[{count},{data:allEvents}]=await Promise.all([
countQuery,
dataQuery.range((Math.max(1,page)-1)*PAGE_SIZE,Math.max(1,page)*PAGE_SIZE-1)
])
const total=count||0
const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE))
const safePage=Math.min(Math.max(1,page),totalPages)
const events=allEvents

// Fetch going counts for this page of events
const eventIds=events?.map((e:any)=>e.id)||[]
const{data:goings}=eventIds.length>0
?await supabase.from('attendances').select('event_id').eq('status','yes').in('event_id',eventIds)
:{data:[]}
const goingByEvent:Record<string,number>={}
goings?.forEach((a:any)=>{goingByEvent[a.event_id]=(goingByEvent[a.event_id]||0)+1})

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

{/* 2-column card grid */}
<div className='events-grid' style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'14px',marginBottom:'28px'}}>
{events&&events.length>0?events.map((ev:any)=>(
<a key={ev.id} href={'/events/'+ev.id} className='event-card'>
<div className='event-card-inner' style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'16px',overflow:'hidden'}}>

{/* Cover area */}
<div style={{height:'120px',position:'relative',overflow:'hidden',background:getCoverGradient(ev.category,ev.id)}}>
{ev.cover_image_url&&<Image src={ev.cover_image_url} alt={ev.title} fill sizes='(max-width:640px) 100vw,(max-width:1024px) 50vw,500px' style={{objectFit:'cover'}}/>}
{ev.category&&(
<div style={{position:'absolute',top:'10px',left:'10px',zIndex:1}}>
<span style={{fontSize:'10px',background:'rgba(0,0,0,.35)',color:'#ffffff',padding:'2px 8px',borderRadius:'999px',fontWeight:600}}>{ev.category}</span>
</div>
)}
{goingByEvent[ev.id]>0&&(
<div style={{position:'absolute',top:'10px',right:'10px',zIndex:1}}>
<span style={{fontSize:'10px',background:'rgba(0,0,0,.35)',color:'#ffffff',padding:'2px 8px',borderRadius:'999px',fontWeight:600}}>{goingByEvent[ev.id]} going</span>
</div>
)}
</div>

{/* Card body */}
<div style={{padding:'14px'}}>
<div style={{fontSize:'11px',color:'#FF6B00',fontWeight:600,marginBottom:'4px'}}>{new Date(ev.date.slice(0,10)+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>
<div style={{fontSize:'14px',fontWeight:700,color:'#1A1A1A',marginBottom:'6px',lineHeight:1.3}}>{ev.title}</div>
{ev.location&&(
<div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'#6B7280',marginBottom:'6px'}}>
<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
{ev.location}
</div>
)}
{ev.description&&<div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>{ev.description}</div>}
<div style={{display:'flex',gap:'5px',marginTop:'10px',flexWrap:'wrap' as const}}>
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'2px 9px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'2px 9px',borderRadius:'999px'}}>{ev.office}</span>}
{ev.tags&&ev.tags.slice(0,2).map((tag:string)=>(
<span key={tag} style={{fontSize:'10px',background:'#F9FAFB',color:'#9CA3AF',padding:'2px 9px',borderRadius:'999px'}}>#{tag}</span>
))}
</div>
</div>
</div>
</a>
)):(
<div className='empty-state' style={{gridColumn:'1/-1',background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'16px'}}>
<svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
<span>No events found</span>
{admin&&!search&&!category&&!entity&&(
<a href='/admin/events/new' style={{color:'#FF6B00',textDecoration:'none',fontWeight:500,fontSize:'12px'}}>+ Create the first event</a>
)}
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
