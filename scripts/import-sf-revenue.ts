import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

// Manual mapping: Salesforce Account Name -> Database display name
const MANUAL_MAPPINGS: Record<string, string> = {
  'Steel Dynamics - Columbia City, IN': 'SDI - Columbia City',
  'Steel Dynamics - Pittsboro, IN': 'SDI - Pittsboro',
  'Steel Dynamics - Butler, IN': 'SDI - Butler',
  'Steel Dynamics - Roanoke, VA': 'SDI - Roanoke',
  'SSAB - Muscatine, IA': 'SSAB - Iowa',
  'SSAB - Axis, AL': 'SSAB - Alabama',
  'Arcelor Mittal - Canada West': 'ArcelorMittal - Canada West',
  'Arcelor Mittal - Canada East': 'ArcelorMittal - Canada East',
  'Nucor Steel - Auburn, NY': 'Nucor - Auburn',
  'Nucor Steel - Crawfordsville, IN': 'Nucor - Crawfordsville',
  'Nucor Steel - Decatur, AL': 'Nucor - Decatur',
  'Nucor Steel - Kankakee, IL': 'Nucor - Kankakee',
  'Nucor Steel - Marion, OH': 'Nucor - Marion, OH',
  'Nucor Steel - Gallatin, KY': 'Nucor - Gallatin',
  'Nucor Steel - Plymouth, UT': 'Nucor - Utah',
  'Nucor Steel - Norfolk, NE': 'Nucor - Nebraska',
  'Nucor Steel - Frostproof, FL': 'Nucor - Frostproof, FL',
  'Nucor Steel - Jackson, MS': 'Nucor - Jackson, MS',
  'Nucor Steel - Seattle, WA': 'Nucor - Seattle',
  'Nucor Steel - Sedalia, MO': 'Nucor - Sedalia',
  'Nucor Steel West Virginia': 'Nucor - WV',
  'Nucor Steel - Birmingham, AL': 'Nucor - Birmingham',
  'Nucor Steel - Hertford, NC': 'Nucor - Hertford',
  'Nucor Steel - Tuscaloosa, AL': 'Nucor - Tuscaloosa',
  'Nucor Steel - Memphis, TN': 'Nucor - Memphis',
  'Nucor Steel - Kingman, AZ': 'Nucor - Kingman Arizona',
  'Nucor Steel - Darlington, SC': 'Nucor - Darlington',
  'CMC Steel - Cayce, SC': 'CMC - Cayce',
  'CMC Steel - Knoxville, TN': 'Gerdau - Knoxville',
  'CMC Steel-New Jersey': 'CMC - WV',
  'CMC Steel - Durant, OK': 'CMC - OK',
  'North Star Blue Scope - Delta, OH': 'North Star Blue Scope',
  'Cascade Steel - McMinnville, OR': 'Cascade Steel',
  'Charter Steel - Cleveland, OH': 'Charter Steel - Cleveland',
  'Charter Steel - Saukville, WI': 'Charter Steel - Saukville',
  'Tenaris - Koppel, PA': 'Tenaris Koppel',
  'NLMK - Portage, IN': 'NLMK (Beta) Steel',
  'US Steel - Fairfield, AL': 'US Steel - Fairfield',
  'Metallus - Faircrest, OH': 'Timken-Faircrest',
  'Sterling Steel - Sterling, IL': 'Sterling Steel Company, LLC',
  'Mid American Steel & Wire - Madill, OK': 'Mid American Steel and Wire',
  'Finkl Steel - Chicago, IL': 'Finkl Steel',
  'Hoeganaes - Gallatin, TN': 'Hoeganaes Gallatin',
  'Cleveland Cliffs - Mansfield, OH': 'AK Steel - Mansfield',
  'Outokumpo - Calvert, AL': 'Outokumpu',
  'Gerdau - Wilton, IA': 'Gerdau - Wilton, IA',
  'Gerdau - Jackson, TN': 'Gerdau - Jackson, TN',
  'Gerdau - Charlotte, NC': 'Gerdau - Charlotte',
  'Gerdau - Monroe, MI': 'Gerdau - Monroe, MI',
  'North American Hoganas - Hollsopple, PA': 'NA Hoganas',
  'Iron Dynamics - Butler, IN': 'Iron Dynamics',
  'Ivaco Rolling Mills - Ontario, Canada': 'Ivaco Rolling Mills',
  'Arkansas Steel - Newport, AR': 'Arkansas Steel',
  'Steel of West Virginia - Huntington, WV': 'CMC - WV',
  'Ervin Industries - Adrian, MI': 'Ervin Amasteel',
  'Vallourec': 'Vallourec Star (V & M Star)',
  'North American Stainless - Ghent, KY': 'North American Stainless',
  'Tallman Technologies - Ontario, Canada': 'Tallman Bronze',
  'Cleveland Cliffs - Coatesville, PA': 'ArcelorMittal - Coatesville',
}

// New customers to create for unmatched accounts
const NEW_CUSTOMERS: Array<{
  sfName: string
  name: string
  parentCompany: string | null
  location: string | null
  notes: string | null
}> = [
  {
    sfName: 'Linde Inc.',
    name: 'Linde Inc.',
    parentCompany: null,
    location: null,
    notes: 'Imported from Salesforce 2025',
  },
  {
    sfName: 'Rio Tinto (QIT) - Sorel-Tracy, Quebec, CA',
    name: 'QIT Sorel-Tracy',
    parentCompany: 'Rio Tinto',
    location: 'Sorel-Tracy, Quebec, Canada',
    notes: 'Imported from Salesforce 2025',
  },
  {
    sfName: 'Ternium - Guerrero, Monterrey, MX',
    name: 'Monterrey',
    parentCompany: 'Ternium',
    location: 'Guerrero, Monterrey, Mexico',
    notes: 'Imported from Salesforce 2025',
  },
  {
    sfName: 'Blair Mechanical',
    name: 'Blair Mechanical',
    parentCompany: null,
    location: null,
    notes: 'Imported from Salesforce 2025',
  },
  {
    sfName: 'WHEMCO Steel Castings',
    name: 'WHEMCO Steel Castings',
    parentCompany: null,
    location: null,
    notes: 'Imported from Salesforce 2025',
  },
  {
    sfName: 'Liberty Steel - Peoria IDLED',
    name: 'Peoria',
    parentCompany: 'Liberty Steel',
    location: 'Peoria, IL',
    notes: 'IDLED FACILITY - Imported from Salesforce 2025',
  },
]

function getDisplayName(name: string, parent: string | null): string {
  return parent ? parent + ' - ' + name : name
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const apply = args.includes('--apply')

  if (!dryRun && !apply) {
    console.log('Usage: npx tsx scripts/import-sf-revenue.ts [--dry-run | --apply]')
    console.log('  --dry-run  Preview changes without applying')
    console.log('  --apply    Apply changes to database')
    process.exit(1)
  }

  console.log(dryRun ? '=== DRY RUN MODE ===' : '=== APPLYING CHANGES ===')
  console.log('')

  // Load Salesforce data
  const workbook = XLSX.readFile('/Users/ryanspence/Downloads/Opportunities Won-2026-01-13-08-19-04.xlsx')
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const sfData = XLSX.utils.sheet_to_json<{
    'Account Name': string
    'Amount': number
  }>(sheet)

  // Aggregate SF revenue by account
  const sfRevenue = new Map<string, number>()
  sfData.forEach(row => {
    const account = row['Account Name']
    const amount = row['Amount'] || 0
    if (account) {
      sfRevenue.set(account, (sfRevenue.get(account) || 0) + amount)
    }
  })

  console.log('Salesforce accounts: ' + sfRevenue.size)
  console.log('Total revenue: $' + Array.from(sfRevenue.values()).reduce((a, b) => a + b, 0).toLocaleString())
  console.log('')

  // Load DB customers
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      parentCompany: true,
      revenue: true,
    }
  })

  const dbCustomers = new Map<string, { id: string; name: string; parentCompany: string | null; revenue: number | null }>()
  customers.forEach(c => {
    const displayName = getDisplayName(c.name, c.parentCompany)
    dbCustomers.set(displayName.toLowerCase(), c)
  })

  // Match and prepare updates
  const updates: Array<{ id: string; displayName: string; oldRevenue: number | null; newRevenue: number }> = []
  const unmatched: Array<{ sfAccount: string; revenue: number }> = []

  for (const [sfAccount, revenue] of sfRevenue.entries()) {
    // Try manual mapping first
    const manualMatch = MANUAL_MAPPINGS[sfAccount]
    if (manualMatch) {
      const dbMatch = dbCustomers.get(manualMatch.toLowerCase())
      if (dbMatch) {
        updates.push({
          id: dbMatch.id,
          displayName: getDisplayName(dbMatch.name, dbMatch.parentCompany),
          oldRevenue: dbMatch.revenue,
          newRevenue: revenue,
        })
        continue
      }
    }

    // Try direct match
    const directMatch = dbCustomers.get(sfAccount.toLowerCase())
    if (directMatch) {
      updates.push({
        id: directMatch.id,
        displayName: getDisplayName(directMatch.name, directMatch.parentCompany),
        oldRevenue: directMatch.revenue,
        newRevenue: revenue,
      })
      continue
    }

    unmatched.push({ sfAccount, revenue })
  }

  // Sort updates by revenue
  updates.sort((a, b) => b.newRevenue - a.newRevenue)

  console.log('=== UPDATES (' + updates.length + ' customers) ===')
  console.log('')
  updates.forEach(u => {
    const oldRev = u.oldRevenue ? '$' + u.oldRevenue.toLocaleString() : 'none'
    const newRev = '$' + u.newRevenue.toLocaleString()
    console.log('  ' + u.displayName + ': ' + oldRev + ' -> ' + newRev)
  })

  console.log('')
  console.log('=== NEW CUSTOMERS (' + unmatched.length + ') ===')
  console.log('')
  unmatched.forEach(u => {
    const newCust = NEW_CUSTOMERS.find(nc => nc.sfName === u.sfAccount)
    if (newCust) {
      const displayName = getDisplayName(newCust.name, newCust.parentCompany)
      console.log('  CREATE: ' + displayName + ' ($' + u.revenue.toLocaleString() + ')')
    } else {
      console.log('  SKIP (no mapping): ' + u.sfAccount + ' ($' + u.revenue.toLocaleString() + ')')
    }
  })

  if (apply) {
    console.log('')
    console.log('=== APPLYING CHANGES ===')
    console.log('')

    // Update existing customers
    let updateCount = 0
    for (const u of updates) {
      await prisma.customer.update({
        where: { id: u.id },
        data: { revenue: u.newRevenue },
      })
      updateCount++
      if (updateCount % 10 === 0) {
        console.log('  Updated ' + updateCount + '/' + updates.length + ' customers...')
      }
    }
    console.log('  Updated ' + updateCount + ' customers')

    // Create new customers
    let createCount = 0
    for (const u of unmatched) {
      const newCust = NEW_CUSTOMERS.find(nc => nc.sfName === u.sfAccount)
      if (newCust) {
        await prisma.customer.create({
          data: {
            name: newCust.name,
            parentCompany: newCust.parentCompany,
            location: newCust.location,
            notes: newCust.notes,
            revenue: u.revenue,
            type: 'Key Account',
          },
        })
        createCount++
        console.log('  Created: ' + getDisplayName(newCust.name, newCust.parentCompany))
      }
    }
    console.log('  Created ' + createCount + ' new customers')

    console.log('')
    console.log('=== COMPLETE ===')
  } else {
    console.log('')
    console.log('Dry run complete. Run with --apply to make changes.')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
