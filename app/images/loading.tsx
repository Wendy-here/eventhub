export default function Loading(){
return(
<div style={{padding:'20px 24px'}}>
<div style={{marginBottom:'20px'}}>
<div style={{height:'21px',background:'#EBEBEB',borderRadius:'4px',width:'130px',marginBottom:'6px',animation:'sk-pulse 1.4s ease-in-out infinite'}}/>
<div style={{height:'11px',background:'#EBEBEB',borderRadius:'3px',width:'160px',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:'.1s'}}/>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:'12px'}}>
{Array.from({length:12}).map((_,i)=>(
<div key={i} style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',overflow:'hidden',animation:'sk-pulse 1.4s ease-in-out infinite',animationDelay:i*0.04+'s'}}>
<div style={{aspectRatio:'4/3',background:'#EBEBEB'}}/>
<div style={{padding:'8px 10px'}}>
<div style={{height:'11px',background:'#EBEBEB',borderRadius:'3px',width:'75%',marginBottom:'5px'}}/>
<div style={{height:'10px',background:'#EBEBEB',borderRadius:'3px',width:'50%'}}/>
</div>
</div>
))}
</div>
</div>
)
}
