'use server'
import{supabase}from'@/app/lib/supabase'
import{redirect}from'next/navigation'
export async function createEvent(formData){
const title=formData.get('title')
const date=formData.get('date')
const description=formData.get('description')
const location=formData.get('location')
const drive_link=formData.get('drive_link')
const tagsRaw=formData.get('tags')
const tags=tagsRaw?tagsRaw.split(',').map(t=>t.trim()).filter(Boolean):[]
const{data,error}=await supabase.from('events').insert({title,date,description,location,tags,drive_link}).select().single()
if(error){console.error(error);return}
redirect('/events/'+data.id)
}