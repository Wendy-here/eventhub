'use client'
import{useState}from'react'
import{supabase}from'@/app/lib/supabase'

export default function LoginPage(){
const[loading,setLoading]=useState(false)
const[error,setError]=useState('')

const handleLogin=async()=>{
setLoading(true)
setError('')
const redirectTo=window.location.origin+'/auth/callback'
const{error}=await supabase.auth.signInWithOAuth({
provider:'google',
options:{
redirectTo,
queryParams:{hd:'gradion.com'}
}
})
if(error){setError(error.message);setLoading(false)}
}

return(
<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAFAFA'}}>
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'40px',width:'100%',maxWidth:'360px',textAlign:'center'}}>
<div style={{marginBottom:'20px'}}>
<img src='https://jkefwcttcszndeebgkch.supabase.co/storage/v1/object/public/assets/gradion-logo.png' alt='Gradion' style={{height:'36px',width:'auto',display:'block',margin:'0 auto'}}/>
</div>
<div style={{width:'1px',height:'16px',background:'#E5E7EB',margin:'0 auto 16px'}}/>
<div style={{fontSize:'16px',fontWeight:600,color:'#1A1A1A',marginBottom:'4px'}}>Gradion Wall</div>
<div style={{fontSize:'12px',color:'#6B7280',marginBottom:'28px'}}>The company activity hub.</div>
{error&&(
<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'10px',marginBottom:'16px',fontSize:'12px',color:'#dc2626'}}>{error}</div>
)}
<button onClick={handleLogin} disabled={loading} style={{width:'100%',background:loading?'#d1d5db':'#FF6B00',color:'#fff',border:'none',borderRadius:'8px',padding:'11px',fontSize:'14px',fontWeight:500,cursor:loading?'not-allowed':'pointer',fontFamily:'Noto Sans,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
<svg width='18' height='18' viewBox='0 0 48 48'><path fill='#FFC107' d='M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z'/><path fill='#FF3D00' d='M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4c-7.4 0-13.8 4-17.7 10.7z'/><path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.1 35.2 26.7 36 24 36c-5.1 0-9.5-3.3-11.2-8l-6.5 5C10 40 16.5 44 24 44z'/><path fill='#1976D2' d='M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.9 35.3 44 30 44 24c0-1.2-.1-2.3-.4-3.5z'/></svg>
{loading?'Redirecting...':'Sign in with Google'}
</button>
<div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'14px'}}>For @gradion.com members only.</div>
</div>
</div>
)
}