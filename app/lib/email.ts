import{Resend}from"resend"
function getResend(){
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM=process.env.NOTIFY_FROM_EMAIL||"Gradion Wall <noreply@gradion.com>"
const APP_URL=process.env.NEXT_PUBLIC_APP_URL||"https://eventhub-ruddy.vercel.app"
export async function sendNewEventEmail(title:string,date:string,eventId:string){
  const resend=getResend()
  const to=process.env.NOTIFY_EMAIL_LIST.split(",").map((e:string)=>e.trim()).filter(Boolean)
  try{await resend.emails.send({from:FROM,to,subject:"New event: "+title,html:"<h2>"+title+"</h2>"})}catch(e){console.error(e)}
}
export async function sendReminderEmail(to:string[],title:string,eventTime:string,timezone:string,eventId:string){
  const resend=getResend()
  try{await resend.emails.send({from:FROM,to,subject:"Reminder: "+title,html:"<h2>"+title+"</h2>"})}catch(e){console.error(e)}
}
