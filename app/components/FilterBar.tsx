'use client'
import{useRouter,useSearchParams}from'next/navigation'
import{useCallback,useEffect,useState}from'react'
import{supabase}from'@/app/lib/supabase'

const ENTITIES=['Vietnam','Thailand','Egypt','Germany']
const OFFICES:Record<string,string[]>={
Vietnam:['Saigon','Hanoi','Can Tho'],
Thailand:['Bangkok'],
Egypt:['Cairo'],
Germany:['Berlin'],
}

export default function FilterBar(){
const router=useRouter()
const sp=useSearchParams()
const category=sp.get('category')||''
const entity=sp.get('entity')||''
const office=sp.get('office')||''
const search=sp.get('search')||''
const year=sp.get('year')||''
const month=sp.get('month')||''
const[categories,setCategories]=useState<{id:string,name:string}[]>([])

useEffect(()=>{
supabase.from('categories').select('id,name').order('name').then(({data})=>{
if(data)setCategories(data)
})
},[])

const buildUrl=useCallback((params:Record<string,string>)=>{
const base:Record<string,string>={}
if(year)base.year=year
if(month)base.month=month
if(search)base.search=search
if(category)base.category=category
if(entity)base.entity=entity
if(office)base.office=office
Object.assign(base,params)
Object.keys(base).forEach(k=>{if(!base[k])delete base[k]})
const qs=Object.entries(base).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')
return qs?'/?'+qs:'/'
},[year,month,search,category,entity,office])

const officesForEntity=entity?OFFICES[entity]||[]:[]
const hasFilters=!!(category||entity||office)

const sel=(active:boolean)=>({
height:'28px',padding:'0 8px',
border:'1px solid '+(active?'#FF6B00':'#E5E7EB'),
borderRadius:'6px',
background:active?'#FFF3EB':'#ffffff',
color:active?'#FF6B00':'#374151',
fontSize:'12px',fontFamily:'Noto Sans,sans-serif',
cursor:'pointer',outline:'none',
fontWeight:active?600:400
} as React.CSSProperties)

return(
<div style={{background:'#F3F4F6',borderBottom:'1px solid #E5E7EB',padding:'0 24px',height:'42px',display:'flex',alignItems:'center',gap:'8px'}}>
<span style={{fontSize:'11px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginRight:'4px'}}>Filter:</span>
<select value={category} style={sel(!!category)} onChange={(e)=>router.push(buildUrl({category:e.target.value,office:''}))}>
<option value=''>All categories</option>
{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
</select>
<select value={entity} style={sel(!!entity)} onChange={(e)=>router.push(buildUrl({entity:e.target.value,office:''}))}>
<option value=''>All entities</option>
{ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
</select>
{entity&&officesForEntity.length>0&&(
<select value={office} style={sel(!!office)} onChange={(e)=>router.push(buildUrl({office:e.target.value}))}>
<option value=''>All offices</option>
{officesForEntity.map(o=><option key={o} value={o}>{o}</option>)}
</select>
)}
{hasFilters&&(
<button onClick={()=>router.push(buildUrl({category:'',entity:'',office:''}))} style={{fontSize:'11.5px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontFamily:'Noto Sans,sans-serif',marginLeft:'4px'}}>
Clear filters ×
</button>
)}
</div>
)
}