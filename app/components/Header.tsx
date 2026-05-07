'use client'
import{useState,useRef,useEffect}from'react'
import Image from'next/image'
import{signOut,setPreviewRole}from'@/app/lib/account-actions'

type Props={initials:string,name:string,email:string,isRealAdmin:boolean,isPreviewing:boolean}

export default function Header({initials,name,email,isRealAdmin,isPreviewing}:Props){
const[menuOpen,setMenuOpen]=useState(false)
const[dropOpen,setDropOpen]=useState(false)
const dropRef=useRef<HTMLDivElement>(null)

// Close dropdown on outside click
useEffect(()=>{
const h=(e:MouseEvent)=>{if(dropRef.current&&!dropRef.current.contains(e.target as Node))setDropOpen(false)}
document.addEventListener('mousedown',h)
return()=>document.removeEventListener('mousedown',h)
},[])

const navLink=(href:string,icon:React.ReactNode,label:string)=>(
<a href={href} onClick={()=>setMenuOpen(false)} style={{padding:'10px 12px',borderRadius:'8px',fontSize:'14px',fontWeight:500,color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',gap:'10px'}}>
{icon}<span>{label}</span>
</a>
)

return(
<>
<header style={{background:'#ffffff',borderBottom:'1px solid #E5E7EB',position:'sticky',top:0,zIndex:50}}>
<div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 16px',height:'52px',display:'flex',alignItems:'center',gap:'10px'}}>

<Image src='https://jkefwcttcszndeebgkch.supabase.co/storage/v1/object/public/assets/gradion-logo.png' alt='Gradion' width={90} height={28} style={{height:'28px',width:'auto',flexShrink:0}}/>
<div className='desktop-only' style={{width:'1px',height:'26px',background:'#E5E7EB',margin:'0 2px',flexShrink:0}}/>
<span className='desktop-only' style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A',marginRight:'4px',whiteSpace:'nowrap'}}>Wall</span>
<div className='desktop-only' style={{width:'1px',height:'26px',background:'#E5E7EB',margin:'0 2px',flexShrink:0}}/>

<nav className='desktop-only' style={{display:'flex',gap:'2px'}}>
<a href='/' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>Calendar</a>
<a href='/events' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>All Events</a>
<a href='/images' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>Images</a>
<a href='/admin/categories' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>Categories</a>
</nav>

<div style={{flex:1}}/>

<form className='desktop-only' method='GET' action='/' style={{display:'flex',alignItems:'center'}}>
<div style={{position:'relative',display:'flex',alignItems:'center'}}>
<svg style={{position:'absolute',left:'10px',color:'#9CA3AF'}} width='13' height='13' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'><circle cx='6.5' cy='6.5' r='5'/><path d='M11 11l3 3' strokeLinecap='round'/></svg>
<input name='search' placeholder='Search events...' style={{height:'32px',width:'200px',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'0 12px 0 30px',fontSize:'12.5px',outline:'none',background:'#F9FAFB',color:'#1A1A1A'}}/>
</div>
</form>

<a href='/admin/events/new' className='desktop-only' style={{background:'#FF6B00',color:'#fff',padding:'7px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:500,textDecoration:'none',whiteSpace:'nowrap'}}>+ New event</a>

{/* Avatar + dropdown */}
<div ref={dropRef} style={{position:'relative',flexShrink:0}}>
<button
onClick={()=>setDropOpen(!dropOpen)}
style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',cursor:'pointer',padding:'4px 6px',borderRadius:'8px'}}
>
<div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#FF6B00',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>{initials}</div>
<div className='desktop-only' style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
<span style={{fontSize:'12px',fontWeight:500,color:'#1A1A1A',lineHeight:1.2}}>{name.split(' ')[0]}</span>
<span style={{fontSize:'10px',color:'#9CA3AF',lineHeight:1.2}}>{isPreviewing?'Member (preview)':'Admin'}</span>
</div>
<svg className='desktop-only' width='10' height='10' viewBox='0 0 10 10' fill='none' stroke='#9CA3AF' strokeWidth='1.5'><path d='M2 4l3 3 3-3'/></svg>
</button>

{dropOpen&&(
<div style={{position:'absolute',top:'calc(100% + 6px)',right:0,width:'260px',background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',boxShadow:'0 8px 32px rgba(0,0,0,.1)',overflow:'hidden',zIndex:100}}>
{/* User info */}
<div style={{padding:'14px 16px',borderBottom:'1px solid #F3F4F6'}}>
<div style={{display:'flex',alignItems:'center',gap:'10px'}}>
<div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#FF6B00',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color:'#fff',flexShrink:0}}>{initials}</div>
<div>
<div style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A'}}>{name}</div>
<div style={{fontSize:'11.5px',color:'#9CA3AF'}}>{email}</div>
</div>
</div>
</div>

{/* Preview as member — admin only */}
{isRealAdmin&&(
<div style={{borderBottom:'1px solid #F3F4F6'}}>
{isPreviewing?(
<form action={setPreviewRole.bind(null,'off')}>
<button type='submit' style={{width:'100%',padding:'12px 16px',background:'#FFF3EB',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',fontSize:'13px',fontWeight:500,color:'#FF6B00',textAlign:'left' as const}}>
<span style={{fontSize:'16px'}}>👁</span>
<span>Exit member preview</span>
</button>
</form>
):(
<form action={setPreviewRole.bind(null,'member')}>
<button type='submit' style={{width:'100%',padding:'12px 16px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',fontSize:'13px',color:'#374151',textAlign:'left' as const}}>
<span style={{fontSize:'16px'}}>👁</span>
<span>Preview as Member</span>
</button>
</form>
)}
</div>
)}

{/* Sign out */}
<form action={signOut}>
<button type='submit' style={{width:'100%',padding:'12px 16px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',fontSize:'13px',color:'#374151',textAlign:'left' as const}}>
<span style={{fontSize:'16px'}}>🚪</span>
<span>Sign out</span>
</button>
</form>
</div>
)}
</div>

{/* Mobile hamburger */}
<button className='mobile-only' onClick={()=>setMenuOpen(!menuOpen)} aria-label='Menu' style={{width:'36px',height:'36px',border:'1px solid #E5E7EB',borderRadius:'8px',background:'#ffffff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,color:'#374151'}}>
{menuOpen
?<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>
:<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/></svg>
}
</button>

</div>

{/* Mobile menu */}
{menuOpen&&(
<div className='mobile-only' style={{background:'#ffffff',borderTop:'1px solid #F3F4F6',padding:'12px 16px 16px'}}>
<nav style={{display:'flex',flexDirection:'column' as const,gap:'2px',marginBottom:'12px'}}>
{navLink('/',<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>,'Calendar')}
{navLink('/events',<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><line x1='8' y1='6' x2='21' y2='6'/><line x1='8' y1='12' x2='21' y2='12'/><line x1='8' y1='18' x2='21' y2='18'/><line x1='3' y1='6' x2='3.01' y2='6'/><line x1='3' y1='12' x2='3.01' y2='12'/><line x1='3' y1='18' x2='3.01' y2='18'/></svg>,'All Events')}
{navLink('/images',<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>,'Images')}
{navLink('/admin/categories',<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'/><line x1='7' y1='7' x2='7.01' y2='7'/></svg>,'Categories')}
</nav>
<a href='/admin/events/new' style={{display:'block',background:'#FF6B00',color:'#fff',padding:'10px 16px',borderRadius:'8px',fontSize:'14px',fontWeight:500,textDecoration:'none',textAlign:'center' as const,marginBottom:'12px'}}>+ New event</a>
<form method='GET' action='/'>
<div style={{position:'relative',display:'flex',alignItems:'center'}}>
<svg style={{position:'absolute',left:'10px',color:'#9CA3AF'}} width='13' height='13' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'><circle cx='6.5' cy='6.5' r='5'/><path d='M11 11l3 3' strokeLinecap='round'/></svg>
<input name='search' placeholder='Search events...' style={{width:'100%',height:'38px',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'0 12px 0 30px',fontSize:'14px',outline:'none',background:'#F9FAFB',color:'#1A1A1A'}}/>
</div>
</form>
</div>
)}

</header>

{/* Preview mode banner */}
{isPreviewing&&(
<div style={{background:'#FFF3EB',borderBottom:'1px solid #FFD4B8',padding:'8px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',position:'sticky',top:'52px',zIndex:49}}>
<span style={{fontSize:'13px',color:'#C2410C',fontWeight:500}}>👁 Previewing as Member — admin features are hidden</span>
<form action={setPreviewRole.bind(null,'off')}>
<button type='submit' style={{fontSize:'12px',fontWeight:600,color:'#FF6B00',background:'none',border:'1px solid #FF6B00',borderRadius:'6px',padding:'3px 10px',cursor:'pointer'}}>Exit preview</button>
</form>
</div>
)}
</>
)
}
