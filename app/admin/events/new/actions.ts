'use server'
import{supabase}from'@/app/lib/supabase'
import{redirect}from'next/navigation'

export async function createEvent(formData:FormData){
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
const{data,error}=await supabase.from('events').insert({title,date,description,location,tags,drive_link:drive_link||null,category:category||null,entity:entity||null,office:office||null}).select().single()
if(error){console.error(error);return}
redirect('/events/'+data.id)
}