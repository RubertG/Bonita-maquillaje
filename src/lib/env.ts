export type AppEnv = "staging" | "production"

export function getAppEnv(): AppEnv {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  if (env === "staging" || env === "production") {
    return env
  }

  return "production"
}
