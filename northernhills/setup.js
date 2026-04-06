const fs = require('fs')
const path = require('path')

const folders = [
  // public pages
  'app/(public)/about',
  'app/(public)/contact',
  'app/(public)/register',
  'app/(public)/chatbot/[token]',

  // customer pages
  'app/(customer)/dashboard',
  'app/(customer)/dashboard/pets',
  'app/(customer)/dashboard/events',
  'app/(customer)/dashboard/history',

  // staff pages
  'app/(staff)/staff',
  'app/(staff)/staff/dashboard',
  'app/(staff)/staff/events',
  'app/(staff)/staff/walkin',
  'app/(staff)/staff/checkin',
  'app/(staff)/staff/participant/[id]',
  'app/(staff)/staff/procedure/[id]',
  'app/(staff)/staff/messages',
  'app/(staff)/staff/chats',

  // admin pages
  'app/(admin)/admin',
  'app/(admin)/admin/events',
  'app/(admin)/admin/staff',
  'app/(admin)/admin/reports',
  'app/(admin)/admin/chats',

  // api routes
  'app/api/register',
  'app/api/auth',
  'app/api/events',
  'app/api/checkin',
  'app/api/examination',
  'app/api/procedure',
  'app/api/billing',
  'app/api/messages',
  'app/api/chatbot',
  'app/api/qr',
  'app/api/admin/summary',

  // components
  'components',

  // lib
  'lib',

  // public assets
  'public/images',
  'public/icons',
]

const pageFiles = [
  'app/(public)/about/page.tsx',
  'app/(public)/contact/page.tsx',
  'app/(public)/register/page.tsx',
  'app/(public)/chatbot/[token]/page.tsx',
  'app/(customer)/dashboard/page.tsx',
  'app/(customer)/dashboard/pets/page.tsx',
  'app/(customer)/dashboard/events/page.tsx',
  'app/(customer)/dashboard/history/page.tsx',
  'app/(staff)/staff/page.tsx',
  'app/(staff)/staff/dashboard/page.tsx',
  'app/(staff)/staff/events/page.tsx',
  'app/(staff)/staff/walkin/page.tsx',
  'app/(staff)/staff/checkin/page.tsx',
  'app/(staff)/staff/participant/[id]/page.tsx',
  'app/(staff)/staff/procedure/[id]/page.tsx',
  'app/(staff)/staff/messages/page.tsx',
  'app/(staff)/staff/chats/page.tsx',
  'app/(admin)/admin/page.tsx',
  'app/(admin)/admin/events/page.tsx',
  'app/(admin)/admin/staff/page.tsx',
  'app/(admin)/admin/reports/page.tsx',
  'app/(admin)/admin/chats/page.tsx',
]

const routeFiles = [
  'app/api/register/route.ts',
  'app/api/auth/route.ts',
  'app/api/events/route.ts',
  'app/api/checkin/route.ts',
  'app/api/examination/route.ts',
  'app/api/procedure/route.ts',
  'app/api/billing/route.ts',
  'app/api/messages/route.ts',
  'app/api/chatbot/route.ts',
  'app/api/qr/route.ts',
  'app/api/admin/summary/route.ts',
]

const componentFiles = [
  'components/Navbar.tsx',
  'components/PetCard.tsx',
  'components/ParticipantRow.tsx',
  'components/StatusBadge.tsx',
  'components/ChatBubble.tsx',
  'components/QRDisplay.tsx',
  'components/SummaryCard.tsx',
  'components/ExamForm.tsx',
  'components/BillingForm.tsx',
]

const libFiles = [
  'lib/supabase.ts',
  'lib/claude.ts',
  'lib/mailer.ts',
  'lib/qrgen.ts',
  'lib/roles.ts',
  'lib/templates.ts',
]

const pageTemplate = (name) => `export default function ${name}() {
  return (
    <div>
      <h1>${name}</h1>
    </div>
  )
}
`

const routeTemplate = `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'ok' })
}
`

const componentTemplate = (name) => `export default function ${name}() {
  return <div>{/* ${name} */}</div>
}
`

const libTemplate = `// add your code here
`

function getName(filePath) {
  const base = path.basename(filePath, '.tsx')
  return base.charAt(0).toUpperCase() + base.slice(1)
}

console.log('Creating folders...')
folders.forEach(folder => {
  fs.mkdirSync(folder, { recursive: true })
  console.log('  created:', folder)
})

console.log('\nCreating page files...')
pageFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    const name = getName(path.dirname(file))
    fs.writeFileSync(file, pageTemplate(name))
    console.log('  created:', file)
  } else {
    console.log('  skipped (exists):', file)
  }
})

console.log('\nCreating API route files...')
routeFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, routeTemplate)
    console.log('  created:', file)
  } else {
    console.log('  skipped (exists):', file)
  }
})

console.log('\nCreating component files...')
componentFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    const name = getName(file)
    fs.writeFileSync(file, componentTemplate(name))
    console.log('  created:', file)
  } else {
    console.log('  skipped (exists):', file)
  }
})

console.log('\nCreating lib files...')
libFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, libTemplate)
    console.log('  created:', file)
  } else {
    console.log('  skipped (exists):', file)
  }
})

console.log('\nDone! All folders and files created.')