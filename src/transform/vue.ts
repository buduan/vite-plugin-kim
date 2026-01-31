import MagicString from 'magic-string'
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

  // 提取 template
  const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  if (!templateMatch) {
    return null
  }

  const templateContent = templateMatch[1]
  const templateStart = templateMatch.index! + templateMatch[0].indexOf('>') + 1

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

  // 使用正则匹配标签之间的文本内容
  // 排除 data-kim-ignore 属性的元素
  const result = content.replace(
    />([^<]+)</g,
    (match, textContent) => {
      if (/^\s*$/.test(textContent)) {
        return match
      }

      const { matched, matches } = matchTexts(textContent, config.texts)

      if (!matched) {
        return match
      }

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

  return result
}

export { transformTemplateText }
