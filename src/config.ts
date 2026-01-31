import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import type { KimConfig, ResolvedKimConfig } from './types'
import { defaultConfig } from './types'

/**
 * load kim.config file
 */
export async function loadKimConfig(
  root: string,
  configFile?: string
): Promise<ResolvedKimConfig> {
  const configName = configFile || 'kim.config'
  const extensions = ['.ts', '.mts', '.js', '.mjs']

  let configPath: string | undefined

  // Seek for existing config file with supported extensions
  for (const ext of extensions) {
    const fullPath = path.resolve(root, `${configName}${ext}`)
    if (fs.existsSync(fullPath)) {
      configPath = fullPath
      break
    }
  }

  if (!configPath) {
    console.warn('[vite-plugin-kim] No kim.config file found, using default config')
    return { ...defaultConfig }
  }

  try {
    // Dynamically import the config file
    const fileUrl = pathToFileURL(configPath).href
    const configModule = await import(fileUrl)
    const userConfig: KimConfig = configModule.default || configModule

    return resolveConfig(userConfig)
  } catch (error) {
    console.error('[vite-plugin-kim] Failed to load config file:', error)
    return { ...defaultConfig }
  }
}

/**
 * 解析用户配置，合并默认值
 */
export function resolveConfig(userConfig: KimConfig): ResolvedKimConfig {
  return {
    texts: userConfig.texts || [],
    scale: userConfig.scale ?? defaultConfig.scale,
    fontWeight: userConfig.fontWeight ?? defaultConfig.fontWeight,
    enabled: userConfig.enabled ?? defaultConfig.enabled,
    exclude: userConfig.exclude ?? defaultConfig.exclude,
    include: userConfig.include ?? defaultConfig.include,
    devOnly: userConfig.devOnly ?? defaultConfig.devOnly,
  }
}

/**
 * For
 */
export function getConfigFilePaths(root: string, configFile?: string): string[] {
  const configName = configFile || 'kim.config'
  const extensions = ['.ts', '.mts', '.js', '.mjs']

  return extensions.map(ext => path.resolve(root, `${configName}${ext}`))
}
