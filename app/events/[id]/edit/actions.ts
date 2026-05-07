'use server'
import{getServerSupabase}from'@/app/lib/supabaseServer'
import{redirect}from'next/navigation'
import{revalidatePath}from'next/cache'

export async function updateEvent(formData:FormData){
const supabase=await getServerSupabase()
const id=formData.get('id') as string
const title=formData.get('title') as string
const date=formData.get('date') as string
const description=formData.get('description') as string
const location=formData.get('location') as string
const drive_link=formData.get('drive_link') as string
const category=formData.get('category') as string
const entity=formData.get('entity') as string
const office=formData.get('office') as string
const tagsRaw=formData.get('tags') as string
const tags=tagsRaw?tagsRaw.split(',').map((t:string)=>t.trim()).filter(Boolean):[]
const{error}=await supabase.from('events').update({
title,date,description,location,tags,
drive_link:drive_link||null,
category:category||null,
entity:entity||null,
office:office||null,
}).eq('id',id)
if(error){console.error('update error:',error);return}
revalidatePath('/')
revalidatePath('/events')
revalidatePath('/events/'+id)
redirect('/events/'+id)
}

export async function deleteEvent(formData:FormData){
const supabase=await getServerSupabase()
const id=formData.get('id') as string
const{data:images}=await supabase.from('event_images').select('*').eq('event_id',id)
if(images&&images.length>0){
const paths=images.map((img:any)=>{const parts=img.image_url.split('/event-images/');return parts[1]||''}).filter(Boolean)
if(paths.length>0)await supabase.storage.from('event-images').remove(paths)
}
await supabase.from('event_images').delete().eq('event_id',id)
await supabase.from('events').delete().eq('id',id)
revalidatePath('/')
revalidatePath('/events')
redirect('/')
}

export async function deleteImage(formData:FormData){
const supabase=await getServerSupabase()
const imageId=formData.get('image_id') as string
const eventId=formData.get('event_id') as string
const imageUrl=formData.get('image_url') as string
const parts=(imageUrl||'').split('/event-images/')
if(parts[1])await supabase.storage.from('event-images').remove([parts[1]])
await supabase.from('event_images').delete().eq('id',imageId)
revalidatePath('/events/'+eventId)
redirect('/events/'+eventId+'/edit')
}
