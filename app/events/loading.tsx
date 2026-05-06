export default function Loading(){
return(
<div style={{padding:'20px 24px',maxWidth:'1200px',margin:'0 auto'}}>

{/* Filter bar skeleton */}
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'10px 14px',marginBottom:'16px',display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap' as const}}>
{[160,80,100,90,90].map((w,i)=>(
<div key={i} style={{height:'30px',width:w,background:'#EBEBEB',borderRadius:'6px',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.06+'s'}}/>
))}
</div>

{/* Count line */}
<div style={{height:'11px',background:'#EBEBEB',borderRadius:'3px',width:'140px',marginBottom:'14px',animation:'sk-pulse 1.4s ease-in-out infinite'}}/>

{/* Event rows */}
{Array.from({length:8}).map((_,i)=>(
<div key={i} style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'14px 16px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'12px',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.05+'s'}}>
<div style={{width:'44px',height:'44px',borderRadius:'8px',background:'#EBEBEB',flexShrink:0}}/>
<div style={{flex:1,minWidth:0}}>
<div style={{height:'13px',background:'#EBEBEB',borderRadius:'3px',width:'55%',marginBottom:'7px'}}/>
<div style={{height:'10px',background:'#EBEBEB',borderRadius:'3px',width:'35%'}}/>
</div>
<div style={{display:'flex',gap:'6px'}}>
<div style={{height:'20px',width:'60px',background:'#EBEBEB',borderRadius:'999px'}}/>
<div style={{height:'20px',width:'50px',background:'#EBEBEB',borderRadius:'999px'}}/>
</div>
</div>
))}

{/* Pagination skeleton */}
<div style={{display:'flex',justifyContent:'center',gap:'6px',marginTop:'16px'}}>
{Array.from({length:5}).map((_,i)=>(
<div key={i} style={{width:'32px',height:'32px',background:'#EBEBEB',borderRadius:'6px',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.05+'s'}}/>
))}
</div>

</div>
)
}
