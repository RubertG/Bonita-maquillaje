import { Category } from "@/types/db/db"
import { AppEnv } from "./env"

export function filterPublicCategories(
  categories: Category[],
  env: AppEnv
): Category[] {
  if (env === "staging") return categories

  return categories.filter(category => category.isStagingOnly !== true)
}
