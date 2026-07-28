export type AppEnv = "production" | "staging"

export function getAppEnv(): AppEnv {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  if (env === "staging") return "staging"

  return "production"
}
