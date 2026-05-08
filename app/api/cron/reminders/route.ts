import{NextRequest,NextResponse}from'next/server'
import{createClient}from'@supabase/supabase-js'
import{sendReminderEmail}from'@/app/lib/email'
import{getOffset}from'@/app/lib/timezones'

// Protect this route: Vercel Cron sends CRON_SECRET as a Bearer token
export async function GET(req:NextRequest){
const auth=req.headers.get('authorization')
if(auth!==`Bearer ${process.env.CRON_SECRET}`){
return NextResponse.json({error:'Unauthorized'},{status:401})
}

const supabase=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const now=new Date()
const in60=new Date(now.getTime()+60*60*1000)

// Fetch events happening in roughly the next 60 minutes
// event_time is stored as HH:MM in the event's own timezone
const todayStr=in60.toISOString().slice(0,10)
const{data:events}=await supabase
.from('events')
.select('id,title,date,event_time,timezone')
.eq('date',todayStr)
.not('event_time','is',null)
.not('timezone','is',null)

const upcoming=[]
for(const ev of events||[]){
const{offset}=getOffset(ev.timezone,ev.date)
// Convert stored local time to UTC for comparison
const[h,m]=ev.event_time.split(':').map(Number)
const eventUtcMins=h*60+m-offset*60
const nowUtcMins=now.getUTCHours()*60+now.getUTCMinutes()
const diff=eventUtcMins-nowUtcMins
// Fire when event is 55–65 minutes away (cron runs every hour, 5-min slack)
if(diff>=55&&diff<=65)upcoming.push(ev)
}

if(!upcoming.length)return NextResponse.json({sent:0})

// Fetch all "going" attendees for upcoming events
const eventIds=upcoming.map((e:any)=>e.id)
const{data:attendances}=await supabase
.from('attendances')
.select('event_id,user_email')
.in('event_id',eventIds)
.in('status',['yes','maybe'])

const byEvent:Record<string,string[]>={}
for(const a of attendances||[]){
if(!byEvent[a.event_id])byEvent[a.event_id]=[]
byEvent[a.event_id].push(a.user_email)
}

let sent=0
for(const ev of upcoming){
const recipients=byEvent[ev.id]||[]
if(!recipients.length)continue
await sendReminderEmail(recipients,ev.title,ev.event_time,ev.timezone,ev.id)
sent+=recipients.length
}

return NextResponse.json({sent,events:upcoming.length})
}
