import{getServerSupabase}from'@/app/lib/supabaseServer'
import{notFound}from'next/navigation'
import{isAdmin,getCurrentUser}from'@/app/lib/roles'
import ReactionsComments from'@/app/components/ReactionsComments'
import AttendanceBar from'@/app/components/AttendanceBar'
import Image from'next/image'
import{allZoneTimes}from'@/app/lib/timezones'
import{getCoverGradient}from'@/app/lib/coverImage'

export default async function EventPage(props:any){
const supabase=await getServerSupabase()
const{id}=await props.params
const[{data:event},{data:images},{data:initialReactions},{data:initialComments},attendancesResult,admin,currentUser]=await Promise.all([
supabase.from('events').select('*').eq('id',id).single(),
supabase.from('event_images').select('*').eq('event_id',id).order('sort_order'),
supabase.from('reactions').select('*').eq('event_id',id),
supabase.from('comments').select('*').eq('event_id',id).order('created_at',{ascending:true}),
supabase.from('attendances').select('*').eq('event_id',id),
isAdmin(),
getCurrentUser(),
])
if(attendancesResult.error)console.warn('[attendances]',attendancesResult.error.message)
const initialAttendances=attendancesResult.data||[]
if(!event)return notFound()
const userEmail=currentUser?.email||''
const userName=currentUser?.user_metadata?.full_name||currentUser?.email?.split('@')[0]||'User'
const date=new Date(event.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})

return(
<div style={{padding:'20px 24px',maxWidth:'860px',margin:'0 auto'}}>

<a href='/' style={{fontSize:'12px',color:'#9CA3AF',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'4px',marginBottom:'16px',fontWeight:500}}>
<svg width='14' height='14' viewBox='0 0 14 14' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M9 2L4 7l5 5' strokeLinecap='round' strokeLinejoin='round'/></svg>
Back to calendar
</a>

{/* ── Hero cover image ── */}
<div style={{position:'relative',height:'220px',borderRadius:'16px',overflow:'hidden',marginBottom:'16px',background:event.cover_image_url?'transparent':getCoverGradient(event.category,event.id)}}>
{event.cover_image_url&&<Image src={event.cover_image_url} alt={event.title} fill sizes='(max-width:860px) 100vw, 860px' style={{objectFit:'cover'}} priority/>}

{/* Gradient overlay — dark at bottom for text legibility */}
<div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)'}}/>

{/* Admin action buttons — top right */}
{admin&&(
<div style={{position:'absolute',top:'12px',right:'12px',display:'flex',gap:'8px',zIndex:2}}>
<a href={'/events/'+id+'/edit'} style={{background:'rgba(0,0,0,.45)',backdropFilter:'blur(6px)',color:'#ffffff',padding:'6px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>Edit</a>
<a href={'/events/'+id+'/upload'} style={{background:'rgba(0,0,0,.45)',backdropFilter:'blur(6px)',color:'#ffffff',padding:'6px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>+ Upload</a>
</div>
)}

{/* Title + meta overlaid at bottom */}
<div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px 24px',zIndex:1}}>
<h1 style={{fontSize:'26px',fontWeight:800,color:'#ffffff',letterSpacing:'-.4px',margin:'0 0 8px',lineHeight:1.25,textShadow:'0 1px 6px rgba(0,0,0,.35)'}}>{event.title}</h1>
<div style={{display:'flex',flexDirection:'column' as const,gap:'4px'}}>
<div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13.5px',color:'rgba(255,255,255,.9)',fontWeight:500}}>
<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.7)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' style={{flexShrink:0}}><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
<span>{date}</span>
</div>
{event.event_time&&event.timezone&&(
<div style={{display:'flex',flexWrap:'wrap' as const,gap:'8px',alignItems:'center',paddingLeft:'21px'}}>
{allZoneTimes(event.event_time,event.timezone,event.date).map(({tz,time,abbr})=>(
<span key={tz} style={{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12.5px'}}>
<span style={{fontWeight:600,color:'#ffffff'}}>{time}</span>
<span style={{fontSize:'10.5px',background:'rgba(255,107,0,.75)',color:'#ffffff',padding:'1px 6px',borderRadius:'4px',fontWeight:600}}>{abbr}</span>
<span style={{fontSize:'11.5px',color:'rgba(255,255,255,.7)'}}>{tz}</span>
</span>
))}
</div>
)}
{event.location&&(
<div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'rgba(255,255,255,.8)'}}>
<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.6)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' style={{flexShrink:0}}><path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
<span>{event.location}</span>
</div>
)}
</div>
<div style={{display:'flex',flexWrap:'wrap' as const,gap:'5px',marginTop:'10px'}}>
{event.category&&<span style={{fontSize:'10.5px',background:'rgba(255,107,0,.75)',color:'#ffffff',padding:'2px 9px',borderRadius:'999px',fontWeight:600,backdropFilter:'blur(4px)'}}>{event.category}</span>}
{event.entity&&<span style={{fontSize:'10.5px',background:'rgba(255,255,255,.2)',color:'#ffffff',padding:'2px 9px',borderRadius:'999px',backdropFilter:'blur(4px)'}}>{event.entity}</span>}
{event.office&&<span style={{fontSize:'10.5px',background:'rgba(255,255,255,.2)',color:'#ffffff',padding:'2px 9px',borderRadius:'999px',backdropFilter:'blur(4px)'}}>{event.office}</span>}
{event.tags&&event.tags.map((tag:string)=><span key={tag} style={{fontSize:'10.5px',background:'rgba(255,255,255,.15)',color:'rgba(255,255,255,.85)',padding:'2px 9px',borderRadius:'999px'}}>#{tag}</span>)}
</div>
</div>
</div>

{/* Description below hero */}
{event.description&&(
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px 20px',marginBottom:'16px'}}>
<p style={{fontSize:'14px',color:'#4B5563',lineHeight:1.8,margin:0}}>{event.description}</p>
</div>
)}

<AttendanceBar
eventId={id}
eventTitle={event.title}
initialAttendances={initialAttendances||[]}
isAdmin={admin}
userEmail={userEmail}
userName={userName}
/>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280'}}>Media — {images?.length||0} photos</div>
<div style={{display:'flex',gap:'8px'}}>
{event.drive_link&&<a href={event.drive_link} target='_blank' rel='noopener noreferrer' style={{fontSize:'12px',color:'#15803D',fontWeight:500,textDecoration:'none',background:'#F0FDF4',border:'1px solid #BBF7D0',padding:'4px 12px',borderRadius:'6px'}}>View full album</a>}
{admin&&<a href={'/events/'+id+'/upload'} style={{fontSize:'12px',color:'#FF6B00',fontWeight:500,textDecoration:'none',background:'#FFF3EB',border:'1px solid #FFD4B8',padding:'4px 12px',borderRadius:'6px'}}>+ Add photos</a>}
</div>
</div>
{images&&images.length>0?(
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:'10px'}}>
{images.map((img:any)=>(
<div key={img.id}>
<div style={{position:'relative',aspectRatio:'4/3',borderRadius:'8px',overflow:'hidden',border:'1px solid #F3F4F6'}}>
<Image src={img.image_url} alt={img.caption||''} fill sizes='(max-width:640px) 50vw, (max-width:1024px) 25vw, 200px' style={{objectFit:'cover'}}/>
</div>
{img.caption&&<div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'4px',textAlign:'center' as const}}>{img.caption}</div>}
</div>
))}
</div>
):(
<div className='empty-state' style={{background:'#F9FAFB',borderRadius:'8px',border:'1px dashed #E5E7EB'}}>
<svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>
<span>No preview images yet</span>
{admin&&<a href={'/events/'+id+'/upload'} style={{color:'#FF6B00',textDecoration:'none',fontWeight:500,fontSize:'12px'}}>+ Upload images</a>}
</div>
)}
</div>

<ReactionsComments eventId={id} initialReactions={initialReactions||[]} initialComments={initialComments||[]} userEmail={userEmail} userName={userName}/>

</div>
)
}
