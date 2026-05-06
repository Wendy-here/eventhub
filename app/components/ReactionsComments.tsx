'use client'
import{useState,useEffect,useRef}from'react'
import{supabase}from'@/app/lib/supabase'

const QUICK_EMOJIS=['👍','❤️','🎉','😮','😂','🔥','🙌','💪','👏','😍']

type Reaction={id:string,event_id:string,user_email:string,emoji:string}
type Comment={id:string,event_id:string,user_email:string,user_name:string,content:string,created_at:string}

export default function ReactionsComments({eventId,initialReactions=[],initialComments=[]}:{eventId:string,initialReactions:Reaction[],initialComments:Comment[]}){
const[reactions,setReactions]=useState<Reaction[]>(initialReactions)
const[comments,setComments]=useState<Comment[]>(initialComments)
const[newComment,setNewComment]=useState('')
const[posting,setPosting]=useState(false)
const[userEmail,setUserEmail]=useState('')
const[userName,setUserName]=useState('')
const[showPicker,setShowPicker]=useState(false)
const[customEmoji,setCustomEmoji]=useState('')
const pickerRef=useRef<HTMLDivElement>(null)
const postingRef=useRef(false)

useEffect(()=>{
supabase.auth.getUser().then(({data:{user}})=>{
if(user){
setUserEmail(user.email||'')
setUserName(user.user_metadata?.full_name||user.email?.split('@')[0]||'User')
}
})
},[eventId])

useEffect(()=>{
const handler=(e:MouseEvent)=>{
if(pickerRef.current&&!pickerRef.current.contains(e.target as Node))setShowPicker(false)
}
document.addEventListener('mousedown',handler)
return()=>document.removeEventListener('mousedown',handler)
},[])

const loadData=async()=>{
const[{data:r},{data:c}]=await Promise.all([
supabase.from('reactions').select('*').eq('event_id',eventId),
supabase.from('comments').select('*').eq('event_id',eventId).order('created_at',{ascending:true})
])
setReactions(r||[])
setComments(c||[])
}

const toggleReaction=async(emoji:string)=>{
if(!userEmail)return
const existing=reactions.find(r=>r.user_email===userEmail&&r.emoji===emoji)
if(existing){
await supabase.from('reactions').delete().eq('id',existing.id)
setReactions(prev=>prev.filter(r=>r.id!==existing.id))
}else{
const{data}=await supabase.from('reactions').insert({event_id:eventId,user_email:userEmail,emoji}).select().single()
if(data)setReactions(prev=>[...prev,data])
}
setShowPicker(false)
setCustomEmoji('')
}

const postComment=async()=>{
if(!newComment.trim()||!userEmail||postingRef.current)return
postingRef.current=true
setPosting(true)
const{data}=await supabase.from('comments').insert({event_id:eventId,user_email:userEmail,user_name:userName,content:newComment.trim()}).select().single()
if(data){setComments(prev=>[...prev,data]);setNewComment('')}
setPosting(false)
postingRef.current=false
}

const deleteComment=async(commentId:string,commentEmail:string)=>{
if(commentEmail!==userEmail)return
await supabase.from('comments').delete().eq('id',commentId)
setComments(prev=>prev.filter(c=>c.id!==commentId))
}

const getReactionCount=(emoji:string)=>reactions.filter(r=>r.emoji===emoji).length
const hasReacted=(emoji:string)=>reactions.some(r=>r.user_email===userEmail&&r.emoji===emoji)

const allUniqueEmojis=Array.from(new Set(reactions.map(r=>r.emoji)))

const getInitials=(name:string)=>name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)

const timeAgo=(dateStr:string)=>{
const diff=Date.now()-new Date(dateStr).getTime()
const mins=Math.floor(diff/60000)
if(mins<1)return'just now'
if(mins<60)return mins+'m ago'
const hrs=Math.floor(mins/60)
if(hrs<24)return hrs+'h ago'
return Math.floor(hrs/24)+'d ago'
}

return(
<div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280',marginBottom:'12px'}}>Reactions</div>

<div style={{display:'flex',flexWrap:'wrap' as const,gap:'8px',alignItems:'center'}}>
{allUniqueEmojis.map(emoji=>{
const count=getReactionCount(emoji)
const reacted=hasReacted(emoji)
return(
<button key={emoji} onClick={()=>toggleReaction(emoji)} style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderRadius:'999px',border:'1px solid',borderColor:reacted?'#FF6B00':'#E5E7EB',background:reacted?'#FF6B00':'#ffffff',color:reacted?'#ffffff':'#1A1A1A',fontSize:'13px',cursor:'pointer',fontFamily:'Noto Sans,sans-serif',fontWeight:500}}>
<span style={{fontSize:'16px'}}>{emoji}</span>
<span>{count}</span>
</button>
)
})}

<div style={{position:'relative' as const}} ref={pickerRef}>
<button onClick={()=>setShowPicker(!showPicker)} style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderRadius:'999px',border:'1px dashed #E5E7EB',background:'#F9FAFB',color:'#6B7280',fontSize:'13px',cursor:'pointer',fontFamily:'Noto Sans,sans-serif'}}>
<span style={{fontSize:'16px'}}>+</span>
<span>React</span>
</button>

{showPicker&&(
<div style={{position:'absolute' as const,top:'calc(100% + 6px)',left:0,background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'12px',zIndex:100,boxShadow:'0 4px 20px rgba(0,0,0,.1)',width:'280px'}}>
<div style={{fontSize:'11px',fontWeight:600,color:'#6B7280',marginBottom:'8px',textTransform:'uppercase' as const,letterSpacing:'.05em'}}>Quick pick</div>
<div style={{display:'flex',flexWrap:'wrap' as const,gap:'4px',marginBottom:'10px'}}>
{QUICK_EMOJIS.map(emoji=>(
<button key={emoji} onClick={()=>toggleReaction(emoji)} style={{width:'36px',height:'36px',borderRadius:'8px',border:'1px solid',borderColor:hasReacted(emoji)?'#FF6B00':'#F3F4F6',background:hasReacted(emoji)?'#FFF3EB':'#F9FAFB',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
{emoji}
</button>
))}
</div>
<div style={{borderTop:'1px solid #F3F4F6',paddingTop:'10px'}}>
<div style={{fontSize:'11px',fontWeight:600,color:'#6B7280',marginBottom:'6px',textTransform:'uppercase' as const,letterSpacing:'.05em'}}>Custom emoji</div>
<div style={{display:'flex',gap:'6px'}}>
<input
value={customEmoji}
onChange={(e)=>setCustomEmoji(e.target.value)}
placeholder='Paste any emoji...'
style={{flex:1,height:'32px',border:'1px solid #E5E7EB',borderRadius:'6px',padding:'0 10px',fontSize:'16px',outline:'none',fontFamily:'Noto Sans,sans-serif'}}
/>
<button onClick={()=>{if(customEmoji.trim())toggleReaction(customEmoji.trim())}} disabled={!customEmoji.trim()} style={{height:'32px',padding:'0 12px',background:customEmoji.trim()?'#FF6B00':'#d1d5db',color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:500,cursor:customEmoji.trim()?'pointer':'not-allowed',fontFamily:'Noto Sans,sans-serif'}}>
Add
</button>
</div>
</div>
</div>
)}
</div>
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'16px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280',marginBottom:'14px'}}>Comments ({comments.length})</div>

{comments.length>0&&(
<div style={{display:'flex',flexDirection:'column' as const,gap:'14px',marginBottom:'16px'}}>
{comments.map(comment=>(
<div key={comment.id} style={{display:'flex',gap:'10px'}}>
<div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#FFE4D1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#E65C00',flexShrink:0}}>
{getInitials(comment.user_name)}
</div>
<div style={{flex:1}}>
<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px',flexWrap:'wrap' as const}}>
<span style={{fontSize:'13px',fontWeight:500,color:'#1A1A1A'}}>{comment.user_name}</span>
<span style={{fontSize:'11px',color:'#9CA3AF'}}>{timeAgo(comment.created_at)}</span>
{comment.user_email===userEmail&&(
<button onClick={()=>deleteComment(comment.id,comment.user_email)} style={{fontSize:'11px',color:'#9CA3AF',background:'none',border:'none',cursor:'pointer',marginLeft:'auto',fontFamily:'Noto Sans,sans-serif'}}>Delete</button>
)}
</div>
<div style={{fontSize:'13px',color:'#374151',lineHeight:1.6}}>{comment.content}</div>
</div>
</div>
))}
</div>
)}

{comments.length===0&&(
<div style={{padding:'20px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px',marginBottom:'12px'}}>No comments yet. Be the first!</div>
)}

<div style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
<div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#FF6B00',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
{getInitials(userName)}
</div>
<textarea
value={newComment}
onChange={(e)=>setNewComment(e.target.value)}
onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();postComment()}}}
placeholder='Write a comment... (Enter to post)'
rows={2}
disabled={posting}
style={{flex:1,border:'1px solid #E5E7EB',borderRadius:'8px',padding:'8px 12px',fontSize:'13px',fontFamily:'Noto Sans,sans-serif',outline:'none',resize:'none' as const,color:'#1A1A1A',opacity:posting?.6:1,transition:'opacity .15s'}}
/>
<button onClick={postComment} disabled={posting||!newComment.trim()} style={{background:posting||!newComment.trim()?'#d1d5db':'#FF6B00',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:500,cursor:posting||!newComment.trim()?'not-allowed':'pointer',fontFamily:'Noto Sans,sans-serif',flexShrink:0,minWidth:'52px'}}>
{posting?'...':'Post'}
</button>
</div>
</div>

</div>
)
}