const fs = require('fs')

let c = fs.readFileSync('app/admin/events/new/page.tsx', 'utf8')

// Remove all broken console.log lines
c = c.replace(/console\.log\([^)]*\);?\n?/g, '')

fs.writeFileSync('app/admin/events/new/page.tsx', c)
console.log('cleaned:', fs.readFileSync('app/admin/events/new/page.tsx','utf8').slice(400,600))