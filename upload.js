const fs = require('fs')

const code = `import{supabase}from'@/app/lib/supabase'
import{isAdmin}from'@/app/lib/roles'

export default async function CalendarPage({searchParams}:any){
const sp=await searchParams
const today=new Date()
const year=sp?.year?parseInt(sp.year):today.getFullYear()
const month=sp?.month?parseInt(sp.month):today.getMonth()+1

const firstDay=new Date(year,month-1,1)
const lastDay=new Date(year,month,0)

const{data:events}=await supabase
.from('events')
.select('*')
.gte('date',firstDay.toISOString().split('T')[0])
.lte('date',lastDay.toISOString().split('T')[0])

const admin=await isAdmin()

const monthName=firstDay.toLocaleString('default',{month:'long'})

const eventsByDate:Record<string,any[]>={}
events?.forEach(event=>{
const d=event.date
if(!eventsByDate[d])eventsByDate[d]=[]
eventsByDate[d].push(event)
})

const startWday=firstDay.getDay()
const totalDays=lastDay.getDate()
const todayStr=today.toISOString().split('T')[0]

const days=[]
for(let i=0;i<startWday;i++)days.push({day:null,date:null})
for(let d=1;d<=totalDays;d++){
const dateStr=year+'-'+String(month).padStart(2,'0')+'-'+String(d).padStart(2,'0')
days.push({day:d,date:dateStr})
}

const prevMonth=month===1?12:month-1
const prevYear=month===1?year-1:year
const nextMonth=month===12?1:month+1
const nextYear=month===12?year+1:year

return(
<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
<div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
<div>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827'}}>Activity Calendar</div>
<div style={{fontSize:'11px',color:'#9ca3af'}}>Home / Calendar / {monthName} {year}</div>
</div>
{admin&&<a href='/admin/events/new' style={{background:'#ff6b00',color:'#fff',padding:'7px 14px',borderRadius:'6px',fontSize:'13px',textDecoration:'none',fontWeight:500}}>+ New event</a>}
</div>
<div style={{flex:1,overflow:'auto',padding:'24px'}}>
<div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
<a href={'/?year='+prevYear+'&month='+prevMonth} style={{width:'30px',height:'30px',border:'1px solid #e5e7eb',background:'#fff',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',color:'#6b7280',fontSize:'16px'}}>←</a>
<div style={{fontSize:'15px',fontWeight:600,color:'#111827',minWidth:'160px'}}>{monthName} {year}</div>
<a href={'/?year='+nextYear+'&month='+nextMonth} style={{width:'30px',height:'30px',border:'1px solid #e5e7eb',background:'#fff',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',color:'#6b7280',fontSize:'16px'}}>→</a>
<a href='/' style={{fontSize:'12px',padding:'4px 10px',border:'1px solid #e5e7eb',background:'#fff',borderRadius:'5px',color:'#6b7280',textDecoration:'none'}}>Today</a>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden'}}>
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>(
<div key={d} style={{textAlign:'center',padding:'10px 0',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:i===0||i===6?'#ff6b00':'#9ca3af'}}>{d}</div>
))}
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
{days.map((cell,i)=>(
<div key={i} style={{borderRight:'1px solid #f3f4f6',borderBottom:'1px solid #f3f4f6',padding:'8px 7px',minHeight:'100px',background:cell.date===todayStr?'#fff8f3':'#fff'}}>
{cell.day&&(
<>
<div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'24px',height:'24px',borderRadius:'50%',fontSize:'12px',fontWeight:500,marginBottom:'5px',background:cell.date===todayStr?'#ff6b00':'transparent',color:cell.date===todayStr?'#fff':'#6b7280'}}>{cell.day}</div>
{(eventsByDate[cell.date!]||[]).map((event:any)=>(
<a key={event.id} href={'/events/'+event.id} style={{display:'block',padding:'2px 7px',borderRadius:'4px',fontSize:'11px',fontWeight:500,marginBottom:'2px',textDecoration:'none',background:'#fff3eb',color:'#c2410c',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{event.title}</a>
))}
</>
)}
</div>
))}
</div>
</div>
</div>
</div>
)
}`

fs.writeFileSync('app/page.tsx', code)
console.log('Done!')