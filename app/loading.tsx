const S=(w:string,h:string,r='4px',extra?:React.CSSProperties)=>(
<div style={{width:w,height:h,background:'#EBEBEB',borderRadius:r,...extra}}/>
)

export default function Loading(){
const cells=Array.from({length:35})

return(
<div style={{padding:'16px 24px',maxWidth:'1200px',margin:'0 auto'}}>

{/* FilterBar skeleton */}
<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px',flexWrap:'wrap' as const}}>
{[90,70,80,100,70].map((w,i)=>(
<div key={i} style={{height:'30px',width:w,background:'#EBEBEB',borderRadius:'6px',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.06+'s'}}/>
))}
<div style={{flex:1}}/>
{S('120px','30px','6px',{animation:'sk-pulse 1.4s ease-in-out infinite',marginLeft:'auto'})}
</div>

{/* Calendar block */}
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'20px'}}>

{/* Nav bar */}
<div style={{padding:'12px 16px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<div style={{display:'flex',gap:'8px',alignItems:'center'}}>
{S('28px','28px','6px',{animation:'sk-pulse 1.4s ease-in-out infinite'})}
{S('28px','28px','6px',{animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:'.07s'})}
{S('120px','18px','4px',{animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:'.14s'})}
</div>
{S('60px','12px','4px',{animation:'sk-pulse 1.4s ease-in-out infinite'})}
</div>

{/* Day-of-week headers */}
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #F3F4F6'}}>
{['M','T','W','T','F','S','S'].map((d,i)=>(
<div key={i} style={{padding:'8px',textAlign:'center' as const}}>
<div style={{height:'10px',background:'#EBEBEB',borderRadius:'3px',width:'50%',margin:'0 auto',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.05+'s'}}/>
</div>
))}
</div>

{/* Day cells */}
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
{cells.map((_,i)=>{
const col=i%7
const row=Math.floor(i/7)
const hasEvent1=((row*7+col)%5===0)
const hasEvent2=((row*7+col)%9===0)
return(
<div key={i} style={{
minHeight:'72px',
borderRight:col<6?'1px solid #F3F4F6':'none',
borderBottom:row<4?'1px solid #F3F4F6':'none',
padding:'5px',
animation:'sk-pulse 1.4s ease-in-out infinite',
animationDelay:(col*0.05)+'s',
}}>
<div style={{height:'10px',background:'#EBEBEB',borderRadius:'3px',width:'18px',marginBottom:'5px'}}/>
{hasEvent1&&<div style={{height:'13px',background:'#EBEBEB',borderRadius:'4px',width:'90%',marginBottom:'2px'}}/>}
{hasEvent2&&<div style={{height:'13px',background:'#EBEBEB',borderRadius:'4px',width:'75%'}}/>}
</div>
)
})}
</div>
</div>

{/* Recent events strip */}
<div style={{marginTop:'4px'}}>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
{S('110px','13px','3px',{animation:'sk-pulse 1.4s ease-in-out infinite'})}
{S('60px','11px','3px',{animation:'sk-pulse 1.4s ease-in-out infinite'})}
</div>
<div className='events-grid' style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
{Array.from({length:3}).map((_,i)=>(
<div key={i} style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'14px',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.08+'s'}}>
{S('100%','10px','3px',{marginBottom:'8px'})}
{S('60%','10px','3px',{marginBottom:'6px'})}
{S('45%','10px','3px')}
</div>
))}
</div>
</div>

</div>
)
}
