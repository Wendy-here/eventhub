import{isAdmin}from'@/app/lib/roles'
import{redirect}from'next/navigation'
import NewEventForm from'./NewEventForm'

export default async function NewEventPage(){
const admin=await isAdmin()
if(!admin)redirect('/')
return<NewEventForm/>
}
