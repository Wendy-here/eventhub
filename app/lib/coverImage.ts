const CATEGORY_GRADIENTS:Record<string,string>={
'Company Trip':'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
'Team Building':'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
'Training':'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
'Workshop':'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
'Conference':'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
'Party':'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
'Anniversary':'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)',
'Sports':'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)',
'CSR':'linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)',
'Townhall':'linear-gradient(135deg,#fd7a34 0%,#fc9d5f 100%)',
}

const DEFAULT_GRADIENTS=[
'linear-gradient(135deg,#FF6B00 0%,#FF9A4A 100%)',
'linear-gradient(135deg,#0F6E56 0%,#1A9B76 100%)',
'linear-gradient(135deg,#534AB7 0%,#7B72D6 100%)',
'linear-gradient(135deg,#C2410C 0%,#EA580C 100%)',
'linear-gradient(135deg,#15803D 0%,#22C55E 100%)',
]

export function getCoverGradient(category?:string|null,seed?:string):string{
if(category&&CATEGORY_GRADIENTS[category])return CATEGORY_GRADIENTS[category]
const s=seed||category||''
let hash=0
for(let i=0;i<s.length;i++)hash=(hash*31+s.charCodeAt(i))&0xfffffff
return DEFAULT_GRADIENTS[Math.abs(hash)%DEFAULT_GRADIENTS.length]
}
