import{Resend}from'resend'
function getResend(){
  if(!process.env.RESEND_API_KEY)return null
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM=process.env.NOTIFY_FROM_EMAIL||'Gradion Wall <noreply@gradion.com>'
const APP_URL=process.env.NEXT_PUBLIC_APP_URL||'https://eventhub-ruddy.vercel.app'
export async function sendNewEventEmail(title:string,date:string,eventId:string){
  const r=getResend()
  if(!r)return
  try{await r.emails.send({from:FROM,to:[],subject:'New: '+title,html:'<h2>'+title+'</h2>'})}catch(e){console.error(e)}
}
export async function sendReminderEmail(to:string[],title:string,et:string,tz:string,eid:string){
  const r=getResend()
  if(!r||!to.length)return
  try{await r.emails.send({from:FROM,to,subject:'Reminder: '+title,html:'<h2>'+title+'</h2>'})}catch(e){console.error(e)}
}
