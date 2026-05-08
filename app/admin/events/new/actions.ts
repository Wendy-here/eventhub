'use server'
import{getServerSupabase}from'@/app/lib/supabaseServer'
import{requireAdmin}from'@/app/lib/roles'
import{sendNewEventEmail}from'@/app/lib/email'

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
