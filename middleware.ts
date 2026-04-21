import{createServerClient}from'@supabase/ssr'
import{NextResponse}from'next/server'

export const runtime='edge'

export async function middleware(request:any){
const{pathname}=request.nextUrl

if(
pathname.startsWith('/auth')||
pathname.startsWith('/_next')||
pathname.startsWith('/api')||
pathname.includes('.')
)return NextResponse.next({request})

const response=NextResponse.next({request})

const supabase=createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{cookies:{getAll(){return request.cookies.getAll()},setAll(c:any){c.forEach(({name,value,options}:any)=>response.cookies.set(name,value,options))}}}
)

const{data:{user}}=await supabase.auth.getUser()

if(pathname==='/login')return response
if(!user)return NextResponse.redirect(new URL('/login',request.url))
if(!user.email?.endsWith('@gradion.com'))return NextResponse.redirect(new URL('/login?error=unauthorized',request.url))

return response
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']}
