'use client'
import{useRouter,useSearchParams}from'next/navigation'
import{useCallback,useEffect,useState}from'react'
import{supabase}from'@/app/lib/supabase'

const ENTITIES=['Vietnam','Thailand','Egypt','Germany']

const SORT_OPTIONS=[
{value:'newest',label:'Newest first'},
{value:'oldest',label:'Oldest first'},
{value:'az',label:'A → Z'},
{value:'za',label:'Z → A'},
]

export default function EventsFilterBar(){
const router=useRouter()
const sp=useSearchParams()
const search=sp.get('search')||''
const category=sp.get('category')||''
const entity=sp.get('entity')||''
const sort=sp.get('sort')||'newest'
const[categories,setCategories]=useState<{id:string,name:string}[]>([])
const[searchVal,setSearchVal]=useState(search)

useEffect(()=>{
supabase.from('categories').select('id,name').order('name').then(({data})=>{
if(data)setCategories(data)
})
},[])

// Sync search input when URL changes
useEffect(()=>{setSearchVal(search)},[search])

const buildUrl=useCallback((params:Record<string,string>)=>{
const base:Record<string,string>={}
if(searchVal)base.search=searchVal
if(category)base.category=category
if(entity)base.entity=entity
if(sort&&sort!=='newest')base.sort=sort
Object.assign(base,params)
// Reset to page 1 on filter change
delete base.page
Object.keys(base).forEach(k=>{if(!base[k])delete base[k]})
const qs=Object.entries(base).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')
return qs?'/events?'+qs:'/events'
},[searchVal,category,entity,sort])

const hasFilters=!!(search||category||entity||sort!=='newest')

const sel=(active:boolean):React.CSSProperties=>({
height:'34px',padding:'0 12px',
border:'1px solid '+(active?'#FF6B00':'#E5E7EB'),
borderRadius:'8px',
background:active?'#FFF3EB':'#ffffff',
color:active?'#FF6B00':'#374151',
fontSize:'12px',cursor:'pointer',outline:'none',
fontWeight:active?600:400,
})

return(
<div className='filter-bar' style={{background:'#F3F4F6',borderBottom:'1px solid #E5E7EB',padding:'0 24px',minHeight:'50px',display:'flex',alignItems:'center',gap:'8px'}}>
<form onSubmit={(e)=>{e.preventDefault();router.push(buildUrl({search:searchVal}))}} style={{display:'flex',alignItems:'center',position:'relative'}}>
<svg style={{position:'absolute',left:'10px',color:'#9CA3AF',pointerEvents:'none'}} width='13' height='13' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5'><circle cx='6.5' cy='6.5' r='5'/><path d='M11 11l3 3' strokeLinecap='round'/></svg>
<input
value={searchVal}
onChange={(e)=>setSearchVal(e.target.value)}
onBlur={()=>router.push(buildUrl({search:searchVal}))}
placeholder='Search events…'
style={{height:'34px',width:'160px',border:'1px solid '+(search?'#FF6B00':'#E5E7EB'),borderRadius:'8px',padding:'0 12px 0 30px',fontSize:'12px',outline:'none',background:search?'#FFF3EB':'#ffffff',color:'#374151'}}
/>
</form>

<select value={category} style={sel(!!category)} onChange={(e)=>router.push(buildUrl({category:e.target.value}))}>
<option value=''>All categories</option>
{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
</select>

<select value={entity} style={sel(!!entity)} onChange={(e)=>router.push(buildUrl({entity:e.target.value}))}>
<option value=''>All entities</option>
{ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
</select>

<select value={sort} style={sel(sort!=='newest')} onChange={(e)=>router.push(buildUrl({sort:e.target.value}))}>
{SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
</select>

{hasFilters&&(
<button onClick={()=>router.push('/events')} style={{fontSize:'11.5px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',marginLeft:'4px',whiteSpace:'nowrap' as const}}>
Clear ×
</button>
)}
</div>
)
}
