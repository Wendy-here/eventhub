export default function Loading(){
const A='sk-pulse 1.4s ease-in-out infinite'
return(
<div style={{padding:'20px 24px',maxWidth:'860px',margin:'0 auto'}}>
<div style={{height:'12px',background:'#EBEBEB',borderRadius:'4px',width:'120px',marginBottom:'16px',animation:A}}/>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'24px 28px',marginBottom:'16px',animation:A}}>
<div style={{height:'24px',background:'#EBEBEB',borderRadius:'4px',width:'55%',marginBottom:'12px'}}/>
<div style={{height:'12px',background:'#EBEBEB',borderRadius:'4px',width:'38%',marginBottom:'7px'}}/>
<div style={{height:'12px',background:'#EBEBEB',borderRadius:'4px',width:'30%',marginBottom:'16px'}}/>
<div style={{height:'13px',background:'#EBEBEB',borderRadius:'4px',width:'92%',marginBottom:'6px'}}/>
<div style={{height:'13px',background:'#EBEBEB',borderRadius:'4px',width:'80%',marginBottom:'6px'}}/>
<div style={{height:'13px',background:'#EBEBEB',borderRadius:'4px',width:'65%',marginBottom:'14px'}}/>
<div style={{display:'flex',gap:'6px'}}>
{[70,55,55].map((w,i)=><div key={i} style={{height:'20px',width:w,background:'#EBEBEB',borderRadius:'999px'}}/>)}
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',marginBottom:'16px',animation:A}}>
<div style={{height:'11px',background:'#EBEBEB',borderRadius:'4px',width:'80px',marginBottom:'14px'}}/>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:'10px'}}>
{Array.from({length:4}).map((_,i)=>(
<div key={i} style={{aspectRatio:'4/3',background:'#EBEBEB',borderRadius:'8px'}}/>
))}
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',marginBottom:'16px',animation:A}}>
<div style={{height:'11px',background:'#EBEBEB',borderRadius:'4px',width:'80px',marginBottom:'14px'}}/>
<div style={{display:'flex',gap:'8px'}}>
{Array.from({length:3}).map((_,i)=>(
<div key={i} style={{height:'34px',width:'80px',background:'#EBEBEB',borderRadius:'8px'}}/>
))}
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',animation:A}}>
<div style={{height:'11px',background:'#EBEBEB',borderRadius:'4px',width:'70px',marginBottom:'12px'}}/>
<div style={{display:'flex',gap:'8px'}}>
{Array.from({length:4}).map((_,i)=>(
<div key={i} style={{height:'30px',width:'60px',background:'#EBEBEB',borderRadius:'999px'}}/>
))}
</div>
</div>
</div>
)
}
