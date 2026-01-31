import type { Plugin, ResolvedConfig, HmrContext } from 'vite'
import path from 'node:path'
import { loadKimConfig, getConfigFilePaths } from './config'
import { transform } from './transform'
import { generateStyles } from './styles'
import { createFilter } from './utils'
import type { KimPluginOptions, ResolvedKimConfig, KimConfig } from './types'
import { defaultConfig, defineKimConfig } from './types'

// 虚拟模块 ID
const VIRTUAL_STYLE_ID = 'virtual:kim-styles'
const RESOLVED_VIRTUAL_STYLE_ID = '\0' + VIRTUAL_STYLE_ID

/**
 * vite-plugin-kim
 *
 * 在 Vite 构建阶段实现全局文本放大加粗
 */
export default function kimPlugin(options: KimPluginOptions = {}): Plugin {
  let config: ResolvedKimConfig = { ...defaultConfig }
  let viteConfig: ResolvedConfig
  let filter: (id: string) => boolean

  return {
    name: 'vite-plugin-kim',
    enforce: 'pre', // 在其他插件之前执行

    async configResolved(resolvedConfig) {
      viteConfig = resolvedConfig

      // 加载用户配置
      config = await loadKimConfig(viteConfig.root, options.configFile)

      // 检查是否仅开发模式
      if (config.devOnly && viteConfig.command === 'build') {
        config.enabled = false
      }

      // 创建文件过滤器
      filter = createFilter(config.include, config.exclude)

      if (config.enabled && config.texts.length > 0) {
        console.log(
          `[vite-plugin-kim] Loaded config with ${config.texts.length} text patterns`
        )
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_STYLE_ID) {
        return RESOLVED_VIRTUAL_STYLE_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_STYLE_ID) {
        return generateStyles(config)
      }
    },

    transform(code, id) {
      // 检查是否启用
      if (!config.enabled || config.texts.length === 0) {
        return null
      }

      // 检查文件是否需要处理
      if (!filter(id)) {
        return null
      }

      // 排除 node_modules
      if (id.includes('node_modules')) {
        return null
      }

      return transform(code, id, config)
    },

    transformIndexHtml(html) {
      if (!config.enabled) {
        return html
      }

      // 注入样式到 head
      const styleTag = `<style data-kim-styles>${generateStyles(config)}</style>`

      return html.replace('</head>', `${styleTag}\n</head>`)
    },

    async handleHotUpdate(ctx: HmrContext) {
      const configPaths = getConfigFilePaths(viteConfig.root, options.configFile)

      // 检查是否是配置文件变更
      if (configPaths.some((p) => ctx.file === p)) {
        // 重新加载配置
        config = await loadKimConfig(viteConfig.root, options.configFile)
        filter = createFilter(config.include, config.exclude)

        console.log('[vite-plugin-kim] Config reloaded')

        // 触发全量刷新
        ctx.server.ws.send({
          type: 'full-reload',
          path: '*',
        })

        return []
      }
    },
  }
}

// 导出类型和辅助函数
export { defineKimConfig }
export type { KimConfig, KimPluginOptions, ResolvedKimConfig }
