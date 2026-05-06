'use server'
import{cookies}from'next/headers'
import{createServerClient}from'@supabase/ssr'
import{redirect}from'next/navigation'
import{revalidatePath}from'next/cache'

export async function signOut(){
const cookieStore=await cookies()
const supabase=createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{cookies:{getAll(){return cookieStore.getAll()},setAll(c:any){c.forEach(({name,value,options}:any)=>cookieStore.set(name,value,options))}}}
)
await supabase.auth.signOut()
redirect('/login')
}

export async function setPreviewRole(mode:'member'|'off'){
const cookieStore=await cookies()
if(mode==='member'){
cookieStore.set('previewRole','member',{path:'/',maxAge:60*60*8})
}else{
cookieStore.delete('previewRole')
}
revalidatePath('/',  'layout')
redirect('/')
}
