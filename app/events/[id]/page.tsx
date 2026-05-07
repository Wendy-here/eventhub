import{getServerSupabase}from'@/app/lib/supabaseServer'
import{notFound}from'next/navigation'
import{isAdmin,getCurrentUser}from'@/app/lib/roles'
import ReactionsComments from'@/app/components/ReactionsComments'
import AttendanceBar from'@/app/components/AttendanceBar'
import Image from'next/image'
import{allZoneTimes}from'@/app/lib/timezones'

export default async function EventPage(props:any){
const supabase=await getServerSupabase()
const{id}=await props.params
const[{data:event},{data:images},{data:initialReactions},{data:initialComments},{data:initialAttendances},admin,currentUser]=await Promise.all([
supabase.from('events').select('*').eq('id',id).single(),
supabase.from('event_images').select('*').eq('event_id',id).order('sort_order'),
supabase.from('reactions').select('*').eq('event_id',id),
supabase.from('comments').select('*').eq('event_id',id).order('created_at',{ascending:true}),
supabase.from('attendances').select('*').eq('event_id',id),
isAdmin(),
getCurrentUser(),
])
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

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{padding:'24px 28px'}}>
<div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px',flexWrap:'wrap' as const,marginBottom:'16px'}}>
<div style={{flex:1,minWidth:0}}>
<h1 style={{fontSize:'24px',fontWeight:700,color:'#1A1A1A',letterSpacing:'-.4px',margin:'0 0 10px',lineHeight:1.25}}>{event.title}</h1>
<div style={{display:'flex',flexDirection:'column' as const,gap:'4px'}}>
<div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13.5px',color:'#374151',fontWeight:500}}>
<span style={{fontSize:'15px'}}>📅</span>
<span>{date}</span>
</div>
{event.event_time&&event.timezone&&(
<div style={{display:'flex',flexWrap:'wrap' as const,gap:'10px',alignItems:'center',paddingLeft:'21px'}}>
{allZoneTimes(event.event_time,event.timezone,event.date).map(({tz,time,abbr})=>(
<span key={tz} style={{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12.5px'}}>
<span style={{fontWeight:600,color:'#1A1A1A'}}>{time}</span>
<span style={{fontSize:'10.5px',background:'#FFF3EB',color:'#FF6B00',padding:'1px 6px',borderRadius:'4px',fontWeight:600}}>{abbr}</span>
<span style={{fontSize:'11.5px',color:'#9CA3AF'}}>{tz}</span>
</span>
))}
</div>
)}
{event.location&&(
<div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#6B7280'}}>
<span style={{fontSize:'15px'}}>📍</span>
<span>{event.location}</span>
</div>
)}
</div>
</div>
{admin&&(
<div style={{display:'flex',gap:'6px',flexShrink:0}}>
<a href={'/events/'+id+'/edit'} style={{background:'#F9FAFB',color:'#374151',border:'1px solid #E5E7EB',padding:'7px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>Edit</a>
<a href={'/events/'+id+'/upload'} style={{background:'#FF6B00',color:'#fff',padding:'7px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>+ Upload</a>
</div>
)}
</div>

{event.description&&<p style={{fontSize:'14px',color:'#4B5563',lineHeight:1.8,margin:'0 0 16px',borderLeft:'3px solid #FFE4D1',paddingLeft:'14px'}}>{event.description}</p>}

<div style={{display:'flex',flexWrap:'wrap' as const,gap:'6px'}}>
{event.category&&<span style={{fontSize:'11px',background:'#FFF3EB',color:'#FF6B00',padding:'3px 10px',borderRadius:'999px',fontWeight:600,border:'1px solid #FFE4D1'}}>{event.category}</span>}
{event.entity&&<span style={{fontSize:'11px',background:'#F3F4F6',color:'#374151',padding:'3px 10px',borderRadius:'999px',border:'1px solid #E5E7EB'}}>{event.entity}</span>}
{event.office&&<span style={{fontSize:'11px',background:'#F3F4F6',color:'#374151',padding:'3px 10px',borderRadius:'999px',border:'1px solid #E5E7EB'}}>{event.office}</span>}
{event.tags&&event.tags.map((tag:string)=><span key={tag} style={{fontSize:'11px',background:'#F9FAFB',color:'#9CA3AF',padding:'3px 10px',borderRadius:'999px',border:'1px solid #F3F4F6'}}>#{tag}</span>)}
</div>
</div>
</div>

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
<div style={{padding:'32px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px',background:'#F9FAFB',borderRadius:'8px',border:'1px dashed #E5E7EB'}}>
No preview images yet
{admin&&<><br/><a href={'/events/'+id+'/upload'} style={{color:'#FF6B00',textDecoration:'none',fontWeight:500,marginTop:'6px',display:'inline-block'}}>+ Upload images</a></>}
</div>
)}
</div>

<AttendanceBar
eventId={id}
eventTitle={event.title}
initialAttendances={initialAttendances||[]}
isAdmin={admin}
userEmail={userEmail}
userName={userName}
/>

<ReactionsComments eventId={id} initialReactions={initialReactions||[]} initialComments={initialComments||[]} userEmail={userEmail} userName={userName}/>

</div>
)
}
