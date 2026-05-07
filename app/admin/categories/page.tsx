import{getServerSupabase}from'@/app/lib/supabaseServer'
import{isAdmin}from'@/app/lib/roles'
import{redirect}from'next/navigation'
import{revalidatePath}from'next/cache'

async function addCategory(formData:FormData){
'use server'
const supabase=await getServerSupabase()
const name=formData.get('name') as string
const color=formData.get('color') as string
if(!name.trim())return
await supabase.from('categories').insert({name:name.trim(),color:color||'#FF6B00'})
revalidatePath('/admin/categories')
}

async function deleteCategory(formData:FormData){
'use server'
const supabase=await getServerSupabase()
const id=formData.get('id') as string
await supabase.from('categories').delete().eq('id',id)
revalidatePath('/admin/categories')
}

export default async function CategoriesPage(){
const supabase=await getServerSupabase()
const admin=await isAdmin()
if(!admin)redirect('/')

const{data:categories}=await supabase.from('categories').select('*').order('name')

return(
<div style={{padding:'20px 24px',maxWidth:'600px'}}>
<div style={{marginBottom:'24px'}}>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',margin:0}}>Manage categories</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',marginTop:'4px',marginBottom:0}}>Add or remove event categories</p>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'20px'}}>
<div style={{background:'#1A1A1A',padding:'12px 18px'}}>
<div style={{fontSize:'12px',fontWeight:600,color:'#ffffff'}}>Add new category</div>
</div>
<form action={addCategory} style={{padding:'18px',display:'flex',gap:'10px',alignItems:'flex-end',flexWrap:'wrap' as const}}>
<div style={{flex:1,minWidth:'160px'}}>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Category name *</label>
<input name='name' required placeholder='e.g. Company Trip' style={{width:'100%',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'8px 12px',fontSize:'13px',fontFamily:'Noto Sans,sans-serif',outline:'none',color:'#1A1A1A'}}/>
</div>
<div>
<label style={{display:'block',fontSize:'12px',fontWeight:500,color:'#374151',marginBottom:'5px'}}>Color</label>
<input name='color' type='color' defaultValue='#FF6B00' style={{width:'48px',height:'36px',border:'1px solid #E5E7EB',borderRadius:'8px',cursor:'pointer',padding:'2px'}}/>
</div>
<button type='submit' style={{background:'#FF6B00',color:'#fff',border:'none',padding:'9px 18px',borderRadius:'8px',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'Noto Sans,sans-serif',height:'36px'}}>Add</button>
</form>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden'}}>
<div style={{background:'#1A1A1A',padding:'12px 18px'}}>
<div style={{fontSize:'12px',fontWeight:600,color:'#ffffff'}}>Current categories ({categories?.length||0})</div>
</div>
<div style={{padding:'8px'}}>
{categories&&categories.length>0?categories.map((cat:any)=>(
<div key={cat.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 12px',borderRadius:'8px',marginBottom:'2px',background:'#FAFAFA'}}>
<div style={{width:'12px',height:'12px',borderRadius:'50%',background:cat.color,flexShrink:0}}/>
<div style={{flex:1,fontSize:'13px',fontWeight:500,color:'#1A1A1A'}}>{cat.name}</div>
<form action={deleteCategory}>
<input type='hidden' name='id' value={cat.id}/>
<button type='submit' style={{background:'none',border:'none',color:'#9CA3AF',cursor:'pointer',fontSize:'12px',fontFamily:'Noto Sans,sans-serif',padding:'4px 8px',borderRadius:'6px'}}>Remove</button>
</form>
</div>
)):(
<div style={{padding:'24px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px'}}>No categories yet</div>
)}
</div>
</div>
</div>
)
}