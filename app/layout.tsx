import type{Metadata}from'next'
import'./globals.css'
import{createServerClient}from'@supabase/ssr'
import{cookies}from'next/headers'
import Image from'next/image'
import{Noto_Sans}from'next/font/google'

const notoSans=Noto_Sans({subsets:['latin'],weight:['300','400','500','600','700'],variable:'--font-noto-sans',display:'swap'})

export const metadata:Metadata={
title:'Gradion Wall',
description:'The company activity hub',
}

async function getUser(){
try{
const cookieStore=await cookies()
const supabase=createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{cookies:{getAll(){return cookieStore.getAll()},setAll(c:any){c.forEach(({name,value,options}:any)=>cookieStore.set(name,value,options))}}}
)
const{data:{user}}=await supabase.auth.getUser()
return user
}catch{return null}
}

export default async function RootLayout({children}:{children:React.ReactNode}){
const user=await getUser()
const name=user?.user_metadata?.full_name||user?.email||'User'
const initials=name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)

return(
<html lang='en' className={notoSans.variable}>
<body style={{margin:0,padding:0,background:'#FAFAFA'}}>

<header style={{background:'#ffffff',borderBottom:'1px solid #E5E7EB',position:'sticky',top:0,zIndex:50}}>
<div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',height:'52px',display:'flex',alignItems:'center',gap:'12px'}}>

<Image src='https://jkefwcttcszndeebgkch.supabase.co/storage/v1/object/public/assets/gradion-logo.png' alt='Gradion' width={90} height={28} style={{height:'28px',width:'auto'}}/>
<div style={{width:'1px',height:'26px',background:'#E5E7EB',margin:'0 4px',flexShrink:0}}/>
<span style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A',marginRight:'4px'}}>Wall</span>
<div style={{width:'1px',height:'26px',background:'#E5E7EB',margin:'0 4px',flexShrink:0}}/>

<nav style={{display:'flex',gap:'2px'}}>
<a href='/' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>Calendar</a>
<a href='/events' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>All Events</a>
<a href='/images' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>Images</a>
<a href='/admin/categories' style={{padding:'5px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'#374151',textDecoration:'none'}}>Categories</a>
</nav>

<div style={{flex:1}}/>

<form method='GET' action='/' style={{display:'flex',alignItems:'center'}}>
<div style={{position:'relative',display:'flex',alignItems:'center'}}>
<svg style={{position:'absolute',left:'10px',color:'#9CA3AF'}} width='13' height='13' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'><circle cx='6.5' cy='6.5' r='5'/><path d='M11 11l3 3' strokeLinecap='round'/></svg>
<input name='search' placeholder='Search events...' style={{height:'32px',width:'200px',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'0 12px 0 30px',fontSize:'12.5px',outline:'none',background:'#F9FAFB',color:'#1A1A1A'}}/>
</div>
</form>

<a href='/admin/events/new' style={{background:'#FF6B00',color:'#fff',padding:'7px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:500,textDecoration:'none',whiteSpace:'nowrap'}}>+ New event</a>

<div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
<div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#FF6B00',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff'}}>{initials}</div>
<div style={{display:'flex',flexDirection:'column'}}>
<span style={{fontSize:'12px',fontWeight:500,color:'#1A1A1A',lineHeight:1.2}}>{name.split(' ')[0]}</span>
<span style={{fontSize:'10px',color:'#9CA3AF',lineHeight:1.2}}>Admin</span>
</div>
</div>

</div>
</header>

<main style={{maxWidth:'1200px',margin:'0 auto'}}>
{children}
</main>

</body>
</html>
)
}