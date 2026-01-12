import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/Dashboard"

export default async function HomePage() {
  const session = await auth()

  // Check for valid session with user data (not just truthy - could be error object)
  if (!session?.user?.email) {
    redirect("/login")
  }

  return <Dashboard session={session} />
}
