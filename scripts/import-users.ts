import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const users = [
  { email: "rspence@amerifabinc.com", name: "Ryan Spence", role: "ADMIN" },
  { email: "aakers@amerifabinc.com", name: "Andrew Akers", role: "REP" },
  { email: "tsoja@amerifabinc.com", name: "Todd Soja", role: "REP" },
  { email: "scollins@amerifabinc.com", name: "Sean Collins", role: "REP" },
  { email: "kroudebush@amerifabinc.com", name: "Kirby Roudebush", role: "REP" },
]

async function main() {
  console.log("Clearing old users (keeping sample data)...")

  // Delete all users except the original seed users
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ["admin@amerifab.com", "soja@amerifab.com", "collins@amerifab.com", "akers@amerifab.com", "roudebush@amerifab.com", "manager@amerifab.com"]
      }
    }
  })

  console.log(`Importing ${users.length} users...`)

  const defaultPassword = await bcrypt.hash("AmeriFab2026!", 10)

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: defaultPassword,
      },
    })
    console.log(`✓ ${user.name} (${user.email}) - ${user.role}`)
  }

  console.log(`\n✅ Import complete!`)
  console.log(`\n📧 Default password: AmeriFab2026!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
