export type AppEnv = "development" | "homologation" | "production"

export interface AppConfig {
  env: AppEnv
  isDev: boolean
  isHomolog: boolean
  isProd: boolean
  shouldIndex: boolean
  appName: string
  appUrl: string
}

function getAppEnv(): AppEnv {
  const env = process.env.NEXT_PUBLIC_APP_ENV
  if (env === "production") return "production"
  if (env === "homologation") return "homologation"
  return "development"
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

function shouldIndex(): boolean {
  const env = getAppEnv()
  return env === "production" || env === "homologation"
}

function getAppName(): string {
  const env = getAppEnv()
  if (env === "production") return "App Saúde"
  if (env === "homologation") return "App Saúde - Homologação"
  return "App Saúde - Dev"
}

export const appConfig: AppConfig = {
  env: getAppEnv(),
  isDev: getAppEnv() === "development",
  isHomolog: getAppEnv() === "homologation",
  isProd: getAppEnv() === "production",
  shouldIndex: shouldIndex(),
  appName: getAppName(),
  appUrl: getAppUrl(),
}

export const APP_ENV = appConfig.env
export const IS_DEV = appConfig.isDev
export const IS_HOMOLOG = appConfig.isHomolog
export const IS_PROD = appConfig.isProd
export const SHOULD_INDEX = appConfig.shouldIndex
