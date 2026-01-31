/**
 * Kim 配置类型定义
 */
export interface KimConfig {
  /**
   * 需要检测的文本字符数组
   * 支持字符串和正则表达式
   */
  texts: (string | RegExp)[]

  /**
   * 字体放大倍数
   * @default 1.2
   */
  scale?: number

  /**
   * 字体粗细
   * @default 'bold'
   */
  fontWeight?: 'bold'

  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean

  /**
   * 排除的文件模式
   * @default []
   */
  exclude?: (string | RegExp)[]

  /**
   * 包含的文件模式
   * @default ['**\/*.vue', '**\/*.jsx', '**\/*.tsx']
   */
  include?: (string | RegExp)[]

  /**
   * 仅在开发模式生效
   * @default false
   */
  devOnly?: boolean
}

/**
 * 插件内部使用的解析后配置
 */
export interface ResolvedKimConfig {
  texts: (string | RegExp)[]
  scale: number
  fontWeight: 'bold'
  enabled: boolean
  exclude: (string | RegExp)[]
  include: (string | RegExp)[]
  devOnly: boolean
}

/**
 * 插件选项（可在 vite.config 中传入）
 */
export interface KimPluginOptions {
  /**
   * 配置文件路径（相对于项目根目录）
   * @default 'kim.config'
   */
  configFile?: string
}

/**
 * 默认配置
 */
export const defaultConfig: ResolvedKimConfig = {
  texts: [],
  scale: 1.2,
  fontWeight: 'bold',
  enabled: true,
  exclude: [],
  include: [/\.(vue|jsx|tsx)$/],
  devOnly: false,
}

/**
 * 辅助函数：定义 kim 配置
 */
export function defineKimConfig(config: KimConfig): KimConfig {
  return config
}
