export default function Loading(){
return(
<div style={{padding:'20px 24px',maxWidth:'860px',margin:'0 auto'}}>
<div style={{height:'12px',background:'#F3F4F6',borderRadius:'4px',width:'120px',marginBottom:'16px'}}/>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'24px',marginBottom:'16px',animation:'pulse 1.5s ease-in-out infinite'}}>
<div style={{height:'22px',background:'#F3F4F6',borderRadius:'4px',width:'55%',marginBottom:'12px'}}/>
<div style={{height:'12px',background:'#F3F4F6',borderRadius:'4px',width:'35%',marginBottom:'8px'}}/>
<div style={{height:'12px',background:'#F3F4F6',borderRadius:'4px',width:'30%',marginBottom:'16px'}}/>
<div style={{height:'13px',background:'#F3F4F6',borderRadius:'4px',width:'90%',marginBottom:'6px'}}/>
<div style={{height:'13px',background:'#F3F4F6',borderRadius:'4px',width:'80%',marginBottom:'6px'}}/>
<div style={{height:'13px',background:'#F3F4F6',borderRadius:'4px',width:'70%'}}/>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',marginBottom:'16px',animation:'pulse 1.5s ease-in-out infinite'}}>
<div style={{height:'11px',background:'#F3F4F6',borderRadius:'4px',width:'80px',marginBottom:'14px'}}/>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:'10px'}}>
{Array.from({length:4}).map((_,i)=>(
<div key={i} style={{aspectRatio:'4/3',background:'#F3F4F6',borderRadius:'8px'}}/>
))}
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',animation:'pulse 1.5s ease-in-out infinite'}}>
<div style={{height:'11px',background:'#F3F4F6',borderRadius:'4px',width:'70px',marginBottom:'12px'}}/>
<div style={{display:'flex',gap:'8px'}}>
{Array.from({length:3}).map((_,i)=>(
<div key={i} style={{height:'32px',width:'60px',background:'#F3F4F6',borderRadius:'999px'}}/>
))}
</div>
</div>

<style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
</div>
)
}
