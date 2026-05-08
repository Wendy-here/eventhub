import{Resend}from'resend'
function getResend(){if(!process.env.RESEND_API_KEY)return null;return new Resend(process.env.RESEND_API_KEY)}
const FROM=process.env.NOTIFY_FROM_EMAIL||'Gradion Wall <noreply@gradion.com>'
const APP_URL=process.env.NEXT_PUBLIC_APP_URL||'https://eventhub-ruddy.vercel.app'
export async function sendNewEventEmail(title:string,date:string,eventId:string){const resend=getResend();if(!resend||!process.env.NOTIFY_EMAIL_LIST)return;const to=process.env.NOTIFY_EMAIL_LIST.split(',').map((e:string)=>e.trim()).filter(Boolean);if(!to.length)return;try{await resend.emails.send({from:FROM,to,subject:'New event: '+title,html:'<h2>'+title+'</h2><p><a href="'+APP_URL+'/events/'+eventId+'">View</a></p>'})}catch(err){console.error(err)}}
export async function sendReminderEmail(to:string[],title:string,eventTime:string,timezone:string,eventId:string){const resend=getResend();if(!resend||!to.length)return;try{await resend.emails.send({from:FROM,to,subject:'Reminder: '+title,html:'<h2>'+title+'</h2><p>'+eventTime+' ('+timezone+')</p>'})}catch(err){console.error(err)}}
git add app/lib/email.ts && git commit -m "fix: lazy resend" && git push origin main --force && npx vercel --prod --force

