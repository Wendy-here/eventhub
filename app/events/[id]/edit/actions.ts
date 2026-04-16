'use server'
import{supabase}from'@/app/lib/supabase'
import{redirect}from'next/navigation'

export async function updateEvent(formData){
const id=formData.get('id')
const title=formData.get('title')
const date=formData.get('date')
const description=formData.get('description')
const location=formData.get('location')
const drive_link=formData.get('drive_link')
const tagsRaw=formData.get('tags')
const tags=tagsRaw?tagsRaw.split(',').map(t=>t.trim()).filter(Boolean):[]
const{error}=await supabase.from('events').update({title,date,description,location,tags,drive_link:drive_link||null}).eq('id',id)
if(error)console.error(error)
redirect('/events/'+id)
}

export async function deleteEvent(formData){
const id=formData.get('id')
const{data:images}=await supabase.from('event_images').select('*').eq('event_id',id)
if(images&&images.length>0){
const paths=images.map(img=>{const url=img.image_url;const parts=url.split('/event-images/');return parts[1]||''}).filter(Boolean)
if(paths.length>0)await supabase.storage.from('event-images').remove(paths)
}
await supabase.from('event_images').delete().eq('event_id',id)
await supabase.from('events').delete().eq('id',id)
redirect('/')
}

export async function deleteImage(formData){
const imageId=formData.get('image_id')
const eventId=formData.get('event_id')
const imageUrl=formData.get('image_url')
const parts=(imageUrl||'').split('/event-images/')
if(parts[1])await supabase.storage.from('event-images').remove([parts[1]])
await supabase.from('event_images').delete().eq('id',imageId)
redirect('/events/'+eventId+'/edit')
}