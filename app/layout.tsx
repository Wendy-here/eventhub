import type{Metadata}from'next'
import'./globals.css'
import{createServerClient}from'@supabase/ssr'
import{cookies}from'next/headers'
import{Noto_Sans}from'next/font/google'
import Header from'@/app/components/Header'
import{isRealAdmin}from'@/app/lib/roles'

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
const[user,realAdmin,cookieStore]=await Promise.all([getUser(),isRealAdmin(),cookies()])
const name=user?.user_metadata?.full_name||user?.email||'User'
const email=user?.email||''
const initials=name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)
const isPreviewing=cookieStore.get('previewRole')?.value==='member'

return(
<html lang='en' className={notoSans.variable}>
<body style={{margin:0,padding:0,background:'#FAFAFA'}}>

<Header initials={initials} name={name} email={email} isRealAdmin={realAdmin} isPreviewing={isPreviewing}/>

<main style={{maxWidth:'1200px',margin:'0 auto'}}>
{children}
</main>

</body>
</html>
)
}
