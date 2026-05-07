'use client'
import{useRouter,useSearchParams}from'next/navigation'
import{useCallback,useEffect,useState,useTransition}from'react'
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
const[searchInput,setSearchInput]=useState(search)
const[isPending,startTransition]=useTransition()

useEffect(()=>{
supabase.from('categories').select('id,name').order('name').then(({data})=>{
if(data)setCategories(data)
})
},[])

// Keep local input in sync when URL changes (e.g. browser back/forward)
useEffect(()=>{setSearchInput(search)},[search])

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

const navigate=(url:string)=>startTransition(()=>router.push(url))

// Debounced search — fires 300ms after user stops typing
useEffect(()=>{
if(searchInput===search)return
const t=setTimeout(()=>{
startTransition(()=>router.push(buildUrl({search:searchInput})))
},300)
return()=>clearTimeout(t)
},[searchInput]) // intentionally omits buildUrl/search to avoid re-triggering on URL change

const officesForEntity=entity?OFFICES[entity]||[]:[]
const hasFilters=!!(category||entity||office||search)

const sel=(active:boolean)=>({
height:'28px',padding:'0 8px',
border:'1px solid '+(active?'#FF6B00':'#E5E7EB'),
borderRadius:'6px',
background:active?'#FFF3EB':'#ffffff',
color:active?'#FF6B00':'#374151',
fontSize:'12px',fontFamily:'Noto Sans,sans-serif',
cursor:'pointer',outline:'none',
fontWeight:active?600:400,
transition:'opacity .15s',
opacity:isPending?.6:1,
} as React.CSSProperties)

return(
<div className='filter-bar' style={{background:'#F3F4F6',borderBottom:'1px solid #E5E7EB',padding:'0 16px',minHeight:'42px',display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap' as const,paddingTop:'6px',paddingBottom:'6px',transition:'opacity .2s',opacity:isPending?.75:1}}>
<span style={{fontSize:'11px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginRight:'4px'}}>Filter:</span>

{/* Search input with debounce */}
<div style={{position:'relative' as const,display:'flex',alignItems:'center'}}>
<input
value={searchInput}
onChange={e=>setSearchInput(e.target.value)}
placeholder='Search events…'
style={{height:'28px',padding:'0 28px 0 8px',border:'1px solid '+(search?'#FF6B00':'#E5E7EB'),borderRadius:'6px',background:search?'#FFF3EB':'#ffffff',color:search?'#FF6B00':'#374151',fontSize:'12px',fontFamily:'Noto Sans,sans-serif',outline:'none',width:'140px',fontWeight:search?600:400,opacity:isPending?.6:1,transition:'opacity .15s'}}
/>
{searchInput&&(
<button
onClick={()=>{setSearchInput('');startTransition(()=>router.push(buildUrl({search:''})))}}
style={{position:'absolute' as const,right:'5px',background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:'14px',lineHeight:1,padding:0,display:'flex',alignItems:'center'}}
>×</button>
)}
</div>

<select value={category} style={sel(!!category)} onChange={(e)=>navigate(buildUrl({category:e.target.value,office:''}))}>
<option value=''>All categories</option>
{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
</select>

<select value={entity} style={sel(!!entity)} onChange={(e)=>navigate(buildUrl({entity:e.target.value,office:''}))}>
<option value=''>All entities</option>
{ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
</select>

{entity&&officesForEntity.length>0&&(
<select value={office} style={sel(!!office)} onChange={(e)=>navigate(buildUrl({office:e.target.value}))}>
<option value=''>All offices</option>
{officesForEntity.map(o=><option key={o} value={o}>{o}</option>)}
</select>
)}

{hasFilters&&(
<button onClick={()=>{setSearchInput('');navigate(buildUrl({category:'',entity:'',office:'',search:''}))}} style={{fontSize:'11.5px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontFamily:'Noto Sans,sans-serif',marginLeft:'4px',opacity:isPending?.6:1,transition:'opacity .15s'}}>
Clear filters ×
</button>
)}

{isPending&&<span style={{width:'14px',height:'14px',border:'2px solid #FF6B00',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'att-spin .6s linear infinite',marginLeft:'4px',flexShrink:0}}/>}
</div>
)
}
