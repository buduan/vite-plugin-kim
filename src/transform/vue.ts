import MagicString from 'magic-string'
import { parse } from '@vue/compiler-sfc'
import type { ResolvedKimConfig } from '../types'
import { matchTexts } from '../utils'

export function transformVue(
  code: string,
  id: string,
  config: ResolvedKimConfig
): { code: string; map: any } | null {
  if (config.texts.length === 0) {
    return null
  }

  const s = new MagicString(code)
  let hasChanges = false

  // 使用 Vue SFC 编译器解析
  const { descriptor, errors } = parse(code, { filename: id })
  
  if (errors.length > 0 || !descriptor.template) {
    return null
  }

  const template = descriptor.template
  const templateContent = template.content
  const templateStart = template.loc.start.offset

  // process template content
  const transformed = transformTemplateText(templateContent, config, false)

  if (transformed !== templateContent) {
    s.overwrite(templateStart, templateStart + templateContent.length, transformed)
    hasChanges = true
  }

  if (!hasChanges) {
    return null
  }

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true }),
  }
}


function transformTemplateText(
  content: string,
  config: ResolvedKimConfig,
  isJsx: boolean
): string {
  const className = isJsx ? 'className' : 'class'

  // 改进的正则表达式：匹配标签之间的文本，但排除 Vue 插值
  // 匹配 >text< 之间的内容，但不在 {{ }} 内
  let result = content
  let hasChanges = false

  // 先处理纯文本节点（不在标签或插值内的文本）
  result = result.replace(
    />([^<{]+)</g,
    (match, textContent, offset) => {
      // 检查是否是纯空白
      if (/^\s*$/.test(textContent)) {
        return match
      }

      // 检查是否在插值内（检查前后是否有 {{ 或 }}）
      const before = content.slice(Math.max(0, offset - 10), offset)
      if (before.includes('{{')) {
        return match
      }

      const { matched, matches } = matchTexts(textContent, config.texts)

      if (!matched) {
        return match
      }

      hasChanges = true
      let newText = ''
      let lastIndex = 0

      for (const m of matches) {
        newText += textContent.slice(lastIndex, m.index)
        newText += `<span ${className}="kim-text">${m.text}</span>`
        lastIndex = m.index + m.text.length
      }

      newText += textContent.slice(lastIndex)

      return `>${newText}<`
    }
  )

  // 处理 Vue 插值内的文本 {{ text }}
  result = result.replace(
    /\{\{([^}]+)\}\}/g,
    (match, interpolation) => {
      const trimmed = interpolation.trim()
      
      // 只处理字符串字面量
      const stringMatch = trimmed.match(/^['"](.+)['"]$/)
      if (!stringMatch) {
        return match
      }

      const stringContent = stringMatch[1]
      const { matched, matches } = matchTexts(stringContent, config.texts)

      if (!matched) {
        return match
      }

      hasChanges = true
      // 在插值内，我们不能使用 HTML，需要保持为字符串
      // 或者转换为多个插值
      // 这里简单处理：保持原样，只在纯文本节点处理
      return match
    }
  )

  return result
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export { transformTemplateText }
