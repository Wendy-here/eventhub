import{createServerClient}from'@supabase/ssr'
import{cookies}from'next/headers'

const ADMIN_EMAILS=['uyen.nguyen@gradion.com','lars@gradion.com','rich@gradion.com','tuyen.tong@gradion.com','gee.vo@gradion.com','nhu.truong@gradion.com']

export async function getCurrentUser(){
const cookieStore=await cookies()
const supabase=createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{cookies:{getAll(){return cookieStore.getAll()},setAll(c){c.forEach(({name,value,options})=>cookieStore.set(name,value,options))}}}
)
const{data:{user}}=await supabase.auth.getUser()
return user
}

export async function isAdmin(){
const user=await getCurrentUser()
if(!user?.email)return false
return ADMIN_EMAILS.includes(user.email)
}

export async function requireAdmin(){
const admin=await isAdmin()
if(!admin)throw new Error('Unauthorized')
}