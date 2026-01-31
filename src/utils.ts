import type { ResolvedKimConfig } from './types'

/**
 * 检查文件是否应该被处理
 */
export function shouldTransform(
  id: string,
  config: ResolvedKimConfig
): boolean {
  // 检查是否在排除列表中
  for (const pattern of config.exclude) {
    if (typeof pattern === 'string') {
      if (id.includes(pattern)) return false
    } else if (pattern.test(id)) {
      return false
    }
  }

  // 检查是否在包含列表中
  for (const pattern of config.include) {
    if (typeof pattern === 'string') {
      if (id.includes(pattern)) return true
    } else if (pattern.test(id)) {
      return true
    }
  }

  return false
}

/**
 * 检查文本是否匹配配置中的任一规则
 */
export function matchTexts(
  text: string,
  patterns: (string | RegExp)[]
): { matched: boolean; matches: Array<{ text: string; index: number }> } {
  const matches: Array<{ text: string; index: number }> = []

  for (const pattern of patterns) {
    if (typeof pattern === 'string') {
      let index = 0
      while ((index = text.indexOf(pattern, index)) !== -1) {
        matches.push({ text: pattern, index })
        index += pattern.length
      }
    } else {
      // 正则表达式
      const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        matches.push({ text: match[0], index: match.index })
      }
    }
  }

  // 按索引排序
  matches.sort((a, b) => a.index - b.index)

  // 去除重叠的匹配
  const filtered: Array<{ text: string; index: number }> = []
  let lastEnd = 0
  for (const m of matches) {
    if (m.index >= lastEnd) {
      filtered.push(m)
      lastEnd = m.index + m.text.length
    }
  }

  return { matched: filtered.length > 0, matches: filtered }
}

/**
 * 将文本中的匹配部分包装成 <span class="kim-text">
 */
export function wrapMatchedText(
  text: string,
  matches: Array<{ text: string; index: number }>,
  isJsx: boolean = false
): string {
  if (matches.length === 0) return text

  const className = isJsx ? 'className' : 'class'
  let result = ''
  let lastIndex = 0

  for (const match of matches) {
    // 添加匹配之前的文本
    result += text.slice(lastIndex, match.index)
    // 添加包装后的匹配文本
    result += `<span ${className}="kim-text">${escapeHtml(match.text)}</span>`
    lastIndex = match.index + match.text.length
  }

  // 添加最后一部分文本
  result += text.slice(lastIndex)

  return result
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 创建过滤器函数
 */
export function createFilter(
  include: (string | RegExp)[],
  exclude: (string | RegExp)[]
): (id: string) => boolean {
  return (id: string) => {
    const cleanId = id.split('?')[0].split('#')[0]
    
    for (const pattern of exclude) {
      if (typeof pattern === 'string') {
        if (cleanId.includes(pattern)) return false
      } else if (pattern.test(cleanId)) {
        return false
      }
    }

    // 包含检查
    for (const pattern of include) {
      if (typeof pattern === 'string') {
        if (cleanId.includes(pattern)) return true
      } else if (pattern.test(cleanId)) {
        return true
      }
    }

    return false
  }
}
