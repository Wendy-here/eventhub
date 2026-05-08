import{NextResponse}from'next/server'
import type{NextRequest}from'next/server'

const ADMIN_EMAILS=['uyen.nguyen@gradion.com','lars@gradion.com','rich@gradion.com','tuyen.tong@gradion.com','gee.vo@gradion.com','nhu.truong@gradion.com']
const EDIT_PATTERN=/^\/events\/[^/]+\/edit/
const UPLOAD_PATTERN=/^\/events\/[^/]+\/upload/

function b64urlDecode(s:string):string{
return atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(s.length+((4-s.length%4)%4),'='))
}

function getEmailFromCookies(request:NextRequest):string|null{
// Supabase SSR stores session in sb-<ref>-auth-token cookie as base64url JSON
// or as chunked cookies sb-<ref>-auth-token.0, sb-<ref>-auth-token.1, ...
for(const[name,cookie]of request.cookies){
let raw:string|null=null
const val=typeof cookie==='string'?cookie:(cookie as any).value??cookie
if(/^sb-.+-auth-token$/.test(name)&&!name.endsWith('.0')&&!name.endsWith('.1')&&!name.endsWith('.2')){
raw=val
}else if(/^sb-.+-auth-token\.0$/.test(name)){
// chunked: reassemble from .0, .1, ...
const base=name.slice(0,-2)
let chunks=''
for(let i=0;;i++){
const c=request.cookies.get(base+'.'+i)
if(!c)break
chunks+=(c as any).value??c
}
raw=chunks
}
if(!raw)continue
try{
const decoded=b64urlDecode(raw.startsWith('base64-')?raw.slice(7):raw)
const session=JSON.parse(decoded)
const jwt=session?.access_token||session?.[0]?.access_token
if(!jwt)continue
const payload=JSON.parse(b64urlDecode(jwt.split('.')[1]))
if(payload?.email)return payload.email as string
}catch{continue}
}
return null
}

export async function proxy(request:NextRequest){
const{pathname}=request.nextUrl

if(
pathname.startsWith('/auth')||
pathname.startsWith('/_next')||
pathname.startsWith('/api')||
pathname.includes('.')
)return NextResponse.next({request})

const response=NextResponse.next({request})

const email=getEmailFromCookies(request)

if(pathname==='/login')return response
if(!email)return NextResponse.redirect(new URL('/login',request.url))
if(!email.endsWith('@gradion.com'))return NextResponse.redirect(new URL('/login?error=unauthorized',request.url))

const needsAdmin=
pathname.startsWith('/admin')||
EDIT_PATTERN.test(pathname)||
UPLOAD_PATTERN.test(pathname)

if(needsAdmin){
if(!ADMIN_EMAILS.includes(email)){
return NextResponse.redirect(new URL('/',request.url))
}
const previewRole=request.cookies.get('previewRole')?.value
if(previewRole==='member'){
return NextResponse.redirect(new URL('/',request.url))
}
}

return response
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']}
