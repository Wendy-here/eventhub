import{Resend}from"resend"
function getResend(){
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM=process.env.NOTIFY_FROM_EMAIL||"Gradion Wall <noreply@gradion.com>"
const APP_URL=process.env.NEXT_PUBLIC_APP_URL||"https://eventhub-ruddy.vercel.app"
export async function sendNewEventEmail(t:string,d:string,id:string){
  const r=getResend()
  if(rm app/lib/email.ts && touch app/lib/email.ts)return
  try{await r.emails.send({from:FROM,to:[],subject:"New: "+t,html:"<h2>"+t+"</h2>"})}catch(e){console.error(e)}
}
export async function sendReminderEmail(to:string[],t:string,et:string,tz:string,id:string){
  const r=getResend()
  try{await r.emails.send({from:FROM,to,subject:"Reminder: "+t,html:"<h2>"+t+"</h2>"})}catch(e){console.error(e)}
}
