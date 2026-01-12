import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create users
  const password = await bcrypt.hash("password123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@amerifab.com" },
    update: {},
    create: {
      email: "admin@amerifab.com",
      password,
      name: "Admin User",
      role: "ADMIN",
    },
  })

  const soja = await prisma.user.upsert({
    where: { email: "soja@amerifab.com" },
    update: {},
    create: {
      email: "soja@amerifab.com",
      password,
      name: "Soja",
      role: "REP",
    },
  })

  const collins = await prisma.user.upsert({
    where: { email: "collins@amerifab.com" },
    update: {},
    create: {
      email: "collins@amerifab.com",
      password,
      name: "Collins",
      role: "REP",
    },
  })

  const akers = await prisma.user.upsert({
    where: { email: "akers@amerifab.com" },
    update: {},
    create: {
      email: "akers@amerifab.com",
      password,
      name: "Akers",
      role: "REP",
    },
  })

  const roudebush = await prisma.user.upsert({
    where: { email: "roudebush@amerifab.com" },
    update: {},
    create: {
      email: "roudebush@amerifab.com",
      password,
      name: "Roudebush",
      role: "REP",
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@amerifab.com" },
    update: {},
    create: {
      email: "manager@amerifab.com",
      password,
      name: "Sales Manager",
      role: "MANAGER",
    },
  })

  console.log("Created users:", { admin, soja, collins, akers, roudebush, manager })

  // Create sample customers
  const nucor = await prisma.customer.upsert({
    where: { id: "nucor-steel" },
    update: {},
    create: {
      id: "nucor-steel",
      name: "Nucor Steel",
      location: "Charlotte, NC",
      contact: "Mike Thompson",
      rep: "Soja",
      type: "Key Account",
      notes: "Largest domestic steel producer. Multiple facilities.",
    },
  })

  const steelDynamics = await prisma.customer.upsert({
    where: { id: "steel-dynamics" },
    update: {},
    create: {
      id: "steel-dynamics",
      name: "Steel Dynamics",
      location: "Fort Wayne, IN",
      contact: "Sarah Chen",
      rep: "Collins",
      type: "Key Account",
      notes: "Fast-growing steel producer. Innovation-focused.",
    },
  })

  const charterSteel = await prisma.customer.upsert({
    where: { id: "charter-steel" },
    update: {},
    create: {
      id: "charter-steel",
      name: "Charter Steel",
      location: "Saukville, WI",
      contact: "Tom Williams",
      rep: "Akers",
      type: "Growth",
      notes: "Specialty bar steel producer. Family-owned.",
    },
  })

  console.log("Created customers:", { nucor, steelDynamics, charterSteel })

  // Create sample insights
  const insights = await prisma.insight.createMany({
    data: [
      {
        type: "context",
        content: "Nucor is ramping up their new micro-mill in Missouri. Heavy focus on EAF efficiency and reducing melt times.",
        rep: "Soja",
        customerId: nucor.id,
        createdBy: soja.id,
        date: new Date("2025-01-08"),
      },
      {
        type: "need",
        content: "Frustrated with current hood maintenance cycle times. Looking for solutions that reduce downtime without sacrificing capture efficiency.",
        rep: "Soja",
        customerId: nucor.id,
        createdBy: soja.id,
        date: new Date("2025-01-06"),
      },
      {
        type: "dossier",
        content: "Key decision maker is VP of Operations Jim Crawford. Prefers data-driven proposals with clear ROI timelines.",
        rep: "Soja",
        customerId: nucor.id,
        createdBy: soja.id,
        date: new Date("2025-01-03"),
      },
      {
        type: "context",
        content: "SDI is evaluating automation across all facilities. Major capital planning cycle happening Q1.",
        rep: "Collins",
        customerId: steelDynamics.id,
        createdBy: collins.id,
        date: new Date("2025-01-10"),
      },
      {
        type: "action",
        content: "Sent technical specs on AmeriAntiSlag system after Sarah mentioned slag buildup issues at Sinton facility.",
        rep: "Collins",
        customerId: steelDynamics.id,
        createdBy: collins.id,
        date: new Date("2025-01-07"),
      },
      {
        type: "dossier",
        content: "Kankakee facility team frustrated with hood maintenance cycle times. This is a recurring pain point.",
        rep: "Akers",
        customerId: charterSteel.id,
        createdBy: akers.id,
        date: new Date("2025-01-09"),
      },
    ],
  })

  console.log("Created insights:", insights)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
