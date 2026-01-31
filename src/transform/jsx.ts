import MagicString from 'magic-string'
import type { ResolvedKimConfig } from '../types'
import { matchTexts } from '../utils'

/**
 * TSX / JSX transform
 */
export function transformJsx(
  code: string,
  id: string,
  config: ResolvedKimConfig
): { code: string; map: any } | null {
  if (config.texts.length === 0) {
    return null
  }

  const s = new MagicString(code)
  let hasChanges = false

  // Match text nodes in JSX
  const textPattern = />([^<>{]+)</g
  let match: RegExpExecArray | null

  while ((match = textPattern.exec(code)) !== null) {
    const textContent = match[1]
    const textStart = match.index + 1 // 跳过 >
    const textEnd = textStart + textContent.length

    // skip blank text
    if (/^\s*$/.test(textContent)) {
      continue
    }

    const { matched, matches } = matchTexts(textContent, config.texts)

    if (!matched) {
      continue
    }

    // Build the replaced text
    let newText = ''
    let lastIndex = 0

    for (const m of matches) {
      // Add text before the match
      newText += textContent.slice(lastIndex, m.index)
      // Add the wrapped matched text
      newText += `<span className="kim-text">${m.text}</span>`
      lastIndex = m.index + m.text.length
    }

    // Add the last part of the text
    newText += textContent.slice(lastIndex)

    s.overwrite(textStart, textEnd, newText)
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
