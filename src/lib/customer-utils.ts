import type { CustomerWithInsights } from "@/types"

/**
 * Generates the display name for a customer.
 * Format: "ParentCompany - Name" when parentCompany exists
 * Format: "Name" when standalone
 *
 * @example
 * getCustomerDisplayName({ name: "Crawfordsville", parentCompany: "Nucor" }) // "Nucor - Crawfordsville"
 * getCustomerDisplayName({ name: "Alta Steel", parentCompany: null }) // "Alta Steel"
 */
export function getCustomerDisplayName(
  customer: Pick<CustomerWithInsights, "name" | "parentCompany">
): string {
  if (customer.parentCompany) {
    return `${customer.parentCompany} - ${customer.name}`
  }
  return customer.name
}

/**
 * Common parent companies in the steel industry.
 * Used for autocomplete suggestions in the UI.
 */
export const COMMON_PARENT_COMPANIES = [
  "Nucor",
  "SDI",
  "Gerdau",
  "CMC",
  "SSAB",
  "ArcelorMittal",
  "Charter Steel",
  "AK Steel",
  "Evraz",
  "US Steel",
  "Cleveland-Cliffs",
] as const

export type CommonParentCompany = (typeof COMMON_PARENT_COMPANIES)[number]
