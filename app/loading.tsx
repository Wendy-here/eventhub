export default function Loading(){
return(
<div style={{padding:'20px 24px',maxWidth:'1200px',margin:'0 auto'}}>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'12px'}}>
{Array.from({length:6}).map((_,i)=>(
<div key={i} style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px',animation:'pulse 1.5s ease-in-out infinite'}}>
<div style={{height:'14px',background:'#F3F4F6',borderRadius:'4px',width:'60%',marginBottom:'10px'}}/>
<div style={{height:'11px',background:'#F3F4F6',borderRadius:'4px',width:'40%',marginBottom:'8px'}}/>
<div style={{height:'11px',background:'#F3F4F6',borderRadius:'4px',width:'50%'}}/>
</div>
))}
</div>
<style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
</div>
)
}
