import{Resend}from'resend'

export const resend=new Resend(process.env.RESEND_API_KEY)

const FROM=process.env.NOTIFY_FROM_EMAIL||'Gradion Wall <noreply@gradion.com>'
const APP_URL=process.env.NEXT_PUBLIC_APP_URL||'https://eventhub.vercel.app'

export async function sendNewEventEmail(title:string,date:string,eventId:string){
if(!process.env.RESEND_API_KEY||!process.env.NOTIFY_EMAIL_LIST)return
const to=process.env.NOTIFY_EMAIL_LIST.split(',').map(e=>e.trim()).filter(Boolean)
if(!to.length)return
try{
await resend.emails.send({
from:FROM,
to,
subject:`New event: ${title}`,
html:`<p>A new event has been added to the Gradion Wall.</p>
<h2>${title}</h2>
<p>Date: ${date}</p>
<p><a href="${APP_URL}/events/${eventId}">View event →</a></p>`,
})
}catch(err){
console.error('[sendNewEventEmail]',err)
}
}

export async function sendReminderEmail(to:string[],title:string,eventTime:string,timezone:string,eventId:string){
if(!process.env.RESEND_API_KEY||!to.length)return
try{
await resend.emails.send({
from:FROM,
to,
subject:`Reminder: "${title}" starts in 1 hour`,
html:`<p>This is your 1-hour reminder.</p>
<h2>${title}</h2>
<p>Starting at ${eventTime} (${timezone}) today.</p>
<p><a href="${APP_URL}/events/${eventId}">View event →</a></p>`,
})
}catch(err){
console.error('[sendReminderEmail]',err)
}
}
