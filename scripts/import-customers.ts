import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Customer data extracted from Q1 Rep Assignments
const customers = [
  // Andy Akers - Tier 1 (Key Account)
  { name: "SDI Roanoke", rep: "Akers", type: "Key Account" },
  { name: "Cascade Steel", rep: "Akers", type: "Key Account" },
  { name: "Nucor Nebraska", rep: "Akers", type: "Key Account" },

  // Andy Akers - Tier 2 (Growth)
  { name: "Arkansas Steel", rep: "Akers", type: "Growth" },
  { name: "Gerdau - Jackson, TN", rep: "Akers", type: "Growth" },
  { name: "CMC Sequin, TX", rep: "Akers", type: "Growth" },
  { name: "Gerdau Knoxville", rep: "Akers", type: "Growth" },
  { name: "Nucor - Seattle", rep: "Akers", type: "Growth" },

  // Andy Akers - Tier 3 (Prospect)
  { name: "Nucor Hickman", rep: "Akers", type: "Prospect" },
  { name: "Nucor Memphis", rep: "Akers", type: "Prospect" },
  { name: "SDI Sinton", rep: "Akers", type: "Prospect" },
  { name: "Hoeganaes Gallatin", rep: "Akers", type: "Prospect" },
  { name: "Gerdau - Petersburg, VA", rep: "Akers", type: "Prospect" },
  { name: "Nucor Hertford", rep: "Akers", type: "Prospect" },

  // Andy Akers - Tier 4 (Prospect)
  { name: "Big River", rep: "Akers", type: "Prospect" },
  { name: "Nucor Yamato", rep: "Akers", type: "Prospect" },
  { name: "Gerdau Ft Smith", rep: "Akers", type: "Prospect" },

  // Todd Soja - Tier 1 (Key Account)
  { name: "SDI Butler", rep: "Soja", type: "Key Account" },
  { name: "SSAB Iowa", rep: "Soja", type: "Key Account" },
  { name: "Charter Steel Saukville", rep: "Soja", type: "Key Account" },
  { name: "Nucor - Crawfordsville", rep: "Soja", type: "Key Account" },
  { name: "Nucor - Kankakee", rep: "Soja", type: "Key Account" },
  { name: "SDI - Columbia City", rep: "Soja", type: "Key Account" },
  { name: "SDI - Pittsboro", rep: "Soja", type: "Key Account" },

  // Todd Soja - Tier 2 (Growth)
  { name: "Iron Dynamics", rep: "Soja", type: "Growth" },
  { name: "Ervin Amasteel", rep: "Soja", type: "Growth" },
  { name: "Nucor - Utah", rep: "Soja", type: "Growth" },
  { name: "Nucor Sedalia", rep: "Soja", type: "Growth" },

  // Todd Soja - Tier 3 (Prospect)
  { name: "Optimus Steel Beaumont", rep: "Soja", type: "Prospect" },
  { name: "Sterling Steel Company, LLC", rep: "Soja", type: "Prospect" },

  // Todd Soja - Tier 4 (Prospect)
  { name: "AM Riverdale", rep: "Soja", type: "Prospect" },
  { name: "Harrison Steel Castings", rep: "Soja", type: "Prospect" },
  { name: "Gerdau Wilton, IA", rep: "Soja", type: "Prospect" },

  // Sean Collins - Tier 1 (Key Account)
  { name: "Nucor Decatur", rep: "Collins", type: "Key Account" },
  { name: "Charter Steel - Cleveland", rep: "Collins", type: "Key Account" },
  { name: "North Star Blue Scope", rep: "Collins", type: "Key Account" },
  { name: "Timken-Faircrest", rep: "Collins", type: "Key Account" },
  { name: "Tenaris Koppel", rep: "Collins", type: "Key Account" },

  // Sean Collins - Tier 2 (Growth)
  { name: "Nucor Birmingham", rep: "Collins", type: "Growth" },
  { name: "Nucor Tuscaloosa", rep: "Collins", type: "Growth" },
  { name: "SSAB Alabama", rep: "Collins", type: "Growth" },
  { name: "Outokumpu", rep: "Collins", type: "Growth" },
  { name: "AK Steel - Mansfield", rep: "Collins", type: "Growth" },
  { name: "Mid American Steel and Wire", rep: "Collins", type: "Growth" },
  { name: "NA Hoganas", rep: "Collins", type: "Growth" },
  { name: "Nucor-Auburn", rep: "Collins", type: "Growth" },
  { name: "Vallourec Star (V & M Star)", rep: "Collins", type: "Growth" },
  { name: "USS Fairfield", rep: "Collins", type: "Growth" },
  { name: "Gerdau Monroe, MI", rep: "Collins", type: "Growth" },
  { name: "Universal Stainless", rep: "Collins", type: "Growth" },
  { name: "ArcelorMittal Canada East", rep: "Collins", type: "Growth" },
  { name: "ArcelorMittal Canada West", rep: "Collins", type: "Growth" },
  { name: "Ivaco Rolling Mills", rep: "Collins", type: "Growth" },

  // Sean Collins - Tier 3 (Prospect)
  { name: "CMC WV", rep: "Collins", type: "Prospect" },
  { name: "Arcelor Mittal Calvert", rep: "Collins", type: "Prospect" },
  { name: "AK Steel - Butler", rep: "Collins", type: "Prospect" },
  { name: "CMC Birmingham", rep: "Collins", type: "Prospect" },
  { name: "Gerdau Midlothian, TX", rep: "Collins", type: "Prospect" },
  { name: "AM Dofasco", rep: "Collins", type: "Prospect" },
  { name: "CMC OK", rep: "Collins", type: "Prospect" },
  { name: "Evraz Regina", rep: "Collins", type: "Prospect" },
  { name: "Standard Steel", rep: "Collins", type: "Prospect" },

  // Sean Collins - Tier 4 (Prospect)
  { name: "AM Coatesville", rep: "Collins", type: "Prospect" },
  { name: "SDI Columbus", rep: "Collins", type: "Prospect" },
  { name: "ATI Breckenridge", rep: "Collins", type: "Prospect" },
  { name: "Electraloy", rep: "Collins", type: "Prospect" },
  { name: "Elwood National", rep: "Collins", type: "Prospect" },
  { name: "Gerdau Cartersville", rep: "Collins", type: "Prospect" },
  { name: "Mingo Junction (JSW)", rep: "Collins", type: "Prospect" },
  { name: "Gas Cleaning Technology", rep: "Collins", type: "Prospect" },
  { name: "Nucor Jewett", rep: "Collins", type: "Prospect" },

  // Kirby Roudebush - Tier 1 (Key Account)
  { name: "Nucor - Frostproof, FL", rep: "Roudebush", type: "Key Account" },
  { name: "Nucor - Marion, OH", rep: "Roudebush", type: "Key Account" },
  { name: "Nucor - Brandenburg", rep: "Roudebush", type: "Key Account" },
  { name: "Nucor - Gallatin", rep: "Roudebush", type: "Key Account" },

  // Kirby Roudebush - Tier 2 (Growth)
  { name: "CMC Cayce", rep: "Roudebush", type: "Growth" },
  { name: "CMC Baldwin", rep: "Roudebush", type: "Growth" },
  { name: "Nucor Lexington, NC", rep: "Roudebush", type: "Growth" },
  { name: "Nucor Darlington", rep: "Roudebush", type: "Growth" },
  { name: "Finkl Steel", rep: "Roudebush", type: "Growth" },
  { name: "NLMK (Beta) Steel", rep: "Roudebush", type: "Growth" },
  { name: "Nucor - WV", rep: "Roudebush", type: "Growth" },

  // Kirby Roudebush - Tier 3 (Prospect)
  { name: "Vinton Steel", rep: "Roudebush", type: "Prospect" },
  { name: "CMC AZ", rep: "Roudebush", type: "Prospect" },
  { name: "Gerdau Charlotte", rep: "Roudebush", type: "Prospect" },
  { name: "Nucor Berkeley", rep: "Roudebush", type: "Prospect" },
  { name: "Haynes International, Inc.", rep: "Roudebush", type: "Prospect" },
  { name: "North American Stainless", rep: "Roudebush", type: "Prospect" },
  { name: "Nucor Kingman Arizona", rep: "Roudebush", type: "Prospect" },
  { name: "Nucor - Jackson, MS", rep: "Roudebush", type: "Prospect" },

  // Kirby Roudebush - Tier 4 (Prospect)
  { name: "CMC Charlotte", rep: "Roudebush", type: "Prospect" },
  { name: "Gerdau Manitoba Rolling", rep: "Roudebush", type: "Prospect" },
  { name: "Evraz RMS", rep: "Roudebush", type: "Prospect" },
  { name: "Alta Steel", rep: "Roudebush", type: "Prospect" },
  { name: "Alton Steel, Inc", rep: "Roudebush", type: "Prospect" },
  { name: "Tallman Bronze", rep: "Roudebush", type: "Prospect" },
]

async function main() {
  console.log(`Importing ${customers.length} customers...`)

  let created = 0
  let skipped = 0

  for (const customer of customers) {
    try {
      await prisma.customer.upsert({
        where: {
          id: customer.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
        },
        update: {
          rep: customer.rep,
          type: customer.type,
        },
        create: {
          id: customer.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
          name: customer.name,
          rep: customer.rep,
          type: customer.type,
        },
      })
      created++
      console.log(`✓ ${customer.name} (${customer.rep} - ${customer.type})`)
    } catch (error) {
      console.error(`✗ Failed to import ${customer.name}:`, error)
      skipped++
    }
  }

  console.log(`\nImport complete: ${created} customers imported, ${skipped} skipped`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
