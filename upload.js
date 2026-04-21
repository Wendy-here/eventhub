const fs = require('fs')

// Add revalidate to calendar page
let calendar = fs.readFileSync('app/page.tsx', 'utf8')
if(!calendar.includes('revalidate')){
  calendar = `export const revalidate=60\n` + calendar
  fs.writeFileSync('app/page.tsx', calendar)
  console.log('Calendar cached!')
}

// Add revalidate to events page
let events = fs.readFileSync('app/events/page.tsx', 'utf8')
if(!events.includes('revalidate')){
  events = `export const revalidate=60\n` + events
  fs.writeFileSync('app/events/page.tsx', events)
  console.log('Events cached!')
}

// Add revalidate to images page
let images = fs.readFileSync('app/images/page.tsx', 'utf8')
if(!images.includes('revalidate')){
  images = `export const revalidate=60\n` + images
  fs.writeFileSync('app/images/page.tsx', images)
  console.log('Images cached!')
}

console.log('All pages cached!')