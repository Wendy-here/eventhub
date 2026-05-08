'use server'
import{getServerSupabase}from'@/app/lib/supabaseServer'
import{requireAdmin}from'@/app/lib/roles'
import{Resend}from'resend'

const resend=new Resend(process.env.RESEND_API_KEY)

async function sendNewEventEmail(title:string,date:string,eventId:string){
if(!process.env.RESEND_API_KEY||!process.env.NOTIFY_EMAIL_LIST)return
const to=process.env.NOTIFY_EMAIL_LIST.split(',').map(e=>e.trim()).filter(Boolean)
if(!to.length)return
try{
await resend.emails.send({
from:process.env.NOTIFY_FROM_EMAIL||'Gradion Wall <noreply@gradion.com>',
to,
subject:`New event: ${title}`,
html:`<p>A new event has been added to the Gradion Wall.</p>
<h2>${title}</h2>
<p>Date: ${date}</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL||'https://eventhub.vercel.app'}/events/${eventId}">View event →</a></p>`,
})
}catch(err){
console.error('[sendNewEventEmail]',err)
}
}

export async function createEvent(formData:FormData):Promise<{id:string}|{error:string}>{
await requireAdmin()
const supabase=await getServerSupabase()
const title=formData.get('title') as string
const date=formData.get('date') as string
const event_time=formData.get('event_time') as string
const timezone=formData.get('timezone') as string
const description=formData.get('description') as string
const location=formData.get('location') as string
const drive_link=formData.get('drive_link') as string
const category=formData.get('category') as string
const entity=formData.get('entity') as string
const office=formData.get('office') as string
const tagsRaw=formData.get('tags') as string
const tags=tagsRaw?tagsRaw.split(',').map((t:string)=>t.trim()).filter(Boolean):[]
const cover_image_url=formData.get('cover_image_url') as string
const{data,error}=await supabase.from('events').insert({
title,date,
event_time:event_time||null,
timezone:timezone||null,
description:description||null,
location:location||null,
tags,
drive_link:drive_link||null,
category:category||null,
entity:entity||null,
office:office||null,
cover_image_url:cover_image_url||null,
}).select('id').single()
if(error){
console.error('[createEvent]',JSON.stringify(error))
return{error:error.message||error.code||'Insert failed'}
}
// Broadcast in-app notification + email
await Promise.all([
supabase.from('notifications').insert({
user_email:null,
message:'New event added: '+title,
link:'/events/'+data.id,
is_read:false,
}),
sendNewEventEmail(title,date,data.id),
])
return{id:data.id}
}
