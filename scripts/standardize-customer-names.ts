import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Known parent company patterns to detect in existing names.
 * Maps pattern -> parent company name
 */
const PARENT_COMPANY_PATTERNS: Record<string, string> = {
  "^Nucor": "Nucor",
  "^SDI\\b": "SDI",
  "^Steel Dynamics": "SDI",
  "^Gerdau": "Gerdau",
  "^CMC\\b": "CMC",
  "^Commercial Metals": "CMC",
  "^SSAB": "SSAB",
  "^ArcelorMittal": "ArcelorMittal",
  "^Arcelor Mittal": "ArcelorMittal",
  "^AM\\s": "ArcelorMittal",
  "^Charter Steel": "Charter Steel",
  "^AK Steel": "AK Steel",
  "^Evraz": "Evraz",
  "^USS\\s": "US Steel",
  "^U\\.?S\\.?\\s*Steel": "US Steel",
  "^Cleveland.Cliffs": "Cleveland-Cliffs",
  "^Cliffs": "Cleveland-Cliffs",
}

interface SuggestedChange {
  id: string
  currentName: string
  suggestedParentCompany: string
  suggestedName: string
  confidence: "high" | "medium" | "low"
}

async function analyzeCustomerNames() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      parentCompany: true,
    },
    orderBy: { name: "asc" },
  })

  console.log(`\nAnalyzing ${customers.length} customers...\n`)
  console.log("=".repeat(80))

  const suggestions: SuggestedChange[] = []
  const unchanged: string[] = []
  const alreadyMigrated: string[] = []

  for (const customer of customers) {
    // Skip if already has parentCompany
    if (customer.parentCompany) {
      alreadyMigrated.push(`${customer.parentCompany} - ${customer.name}`)
      continue
    }

    let matched = false

    for (const [pattern, parentCompany] of Object.entries(PARENT_COMPANY_PATTERNS)) {
      const regex = new RegExp(pattern, "i")
      if (regex.test(customer.name)) {
        // Extract the location/site portion
        let suggestedName = customer.name
          .replace(regex, "")
          .replace(/^[\s\-:]+/, "") // Remove leading separators
          .trim()

        // If nothing remains, use original name
        if (!suggestedName) {
          suggestedName = customer.name
        }

        suggestions.push({
          id: customer.id,
          currentName: customer.name,
          suggestedParentCompany: parentCompany,
          suggestedName: suggestedName,
          confidence: suggestedName !== customer.name ? "high" : "medium",
        })

        matched = true
        break
      }
    }

    if (!matched) {
      unchanged.push(customer.name)
    }
  }

  // Output results
  if (alreadyMigrated.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("ALREADY MIGRATED (have parentCompany set):")
    console.log("=".repeat(80) + "\n")
    alreadyMigrated.forEach((name) => console.log(`  - ${name}`))
  }

  if (suggestions.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("SUGGESTED CHANGES (for manual review):")
    console.log("=".repeat(80) + "\n")

    for (const suggestion of suggestions) {
      console.log(`ID: ${suggestion.id}`)
      console.log(`Current:    "${suggestion.currentName}"`)
      console.log(`Suggested:  Parent="${suggestion.suggestedParentCompany}", Name="${suggestion.suggestedName}"`)
      console.log(`Display:    "${suggestion.suggestedParentCompany} - ${suggestion.suggestedName}"`)
      console.log(`Confidence: ${suggestion.confidence}`)
      console.log("-".repeat(40))
    }
  }

  if (unchanged.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("UNCHANGED (standalone or unrecognized pattern):")
    console.log("=".repeat(80) + "\n")
    unchanged.forEach((name) => console.log(`  - ${name}`))
  }

  console.log("\n" + "=".repeat(80))
  console.log("SUMMARY:")
  console.log("=".repeat(80))
  console.log(`Total customers:     ${customers.length}`)
  console.log(`Suggested changes:   ${suggestions.length}`)
  console.log(`Unchanged:           ${unchanged.length}`)
  console.log(`Already migrated:    ${alreadyMigrated.length}`)

  // Generate SQL for review
  if (suggestions.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("SQL STATEMENTS (review before executing):")
    console.log("=".repeat(80) + "\n")

    for (const suggestion of suggestions) {
      const escapedName = suggestion.suggestedName.replace(/'/g, "''")
      const escapedParent = suggestion.suggestedParentCompany.replace(/'/g, "''")
      console.log(`-- ${suggestion.currentName}`)
      console.log(
        `UPDATE "Customer" SET "parentCompany" = '${escapedParent}', "name" = '${escapedName}' WHERE "id" = '${suggestion.id}';`
      )
      console.log()
    }
  }

  // Option to apply changes
  const args = process.argv.slice(2)
  if (args.includes("--apply") && suggestions.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("APPLYING CHANGES...")
    console.log("=".repeat(80) + "\n")

    for (const suggestion of suggestions) {
      await prisma.customer.update({
        where: { id: suggestion.id },
        data: {
          parentCompany: suggestion.suggestedParentCompany,
          name: suggestion.suggestedName,
        },
      })
      console.log(`Updated: ${suggestion.currentName} -> ${suggestion.suggestedParentCompany} - ${suggestion.suggestedName}`)
    }

    console.log("\nDone! Applied " + suggestions.length + " changes.")
  } else if (suggestions.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("To apply these changes, run:")
    console.log("  npx tsx scripts/standardize-customer-names.ts --apply")
    console.log("=".repeat(80))
  }
}

// Run analysis
analyzeCustomerNames()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
