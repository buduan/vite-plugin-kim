import { describe, it, expect } from 'vitest'
import { matchTexts } from '../src/utils'
import { transformVue } from '../src/transform/vue'
import { transformJsx } from '../src/transform/jsx'
import type { ResolvedKimConfig } from '../src/types'

const mockConfig: ResolvedKimConfig = {
  texts: ['重要', '警告', /紧急.*/],
  scale: 1.2,
  fontWeight: 'bold',
  enabled: true,
  exclude: [],
  include: [/\.(vue|jsx|tsx)$/],
  devOnly: false,
}

describe('matchTexts', () => {
  it('should match string patterns', () => {
    const result = matchTexts('这是一条重要的信息', ['重要'])
    expect(result.matched).toBe(true)
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].text).toBe('重要')
    expect(result.matches[0].index).toBe(4)
  })

  it('should match multiple occurrences', () => {
    const result = matchTexts('重要信息，非常重要', ['重要'])
    expect(result.matched).toBe(true)
    expect(result.matches).toHaveLength(2)
  })

  it('should match regex patterns', () => {
    const result = matchTexts('紧急情况发生了', [/紧急.*/])
    expect(result.matched).toBe(true)
    expect(result.matches[0].text).toBe('紧急情况发生了')
  })

  it('should return false for no matches', () => {
    const result = matchTexts('这是普通信息', ['重要'])
    expect(result.matched).toBe(false)
    expect(result.matches).toHaveLength(0)
  })
})

describe('transformVue', () => {
  it('should transform Vue template text', () => {
    const code = `
<template>
  <div>这是一条重要的信息</div>
</template>
<script setup>
</script>
`
    const result = transformVue(code, 'test.vue', mockConfig)
    expect(result).not.toBeNull()
    expect(result!.code).toContain('<span class="kim-text">重要</span>')
  })

  it('should not transform when no matches', () => {
    const code = `
<template>
  <div>这是普通信息</div>
</template>
`
    const result = transformVue(code, 'test.vue', mockConfig)
    expect(result).toBeNull()
  })

  it('should handle multiple text patterns', () => {
    const code = `
<template>
  <div>重要警告：请注意</div>
</template>
`
    const result = transformVue(code, 'test.vue', mockConfig)
    expect(result).not.toBeNull()
    expect(result!.code).toContain('<span class="kim-text">重要</span>')
    expect(result!.code).toContain('<span class="kim-text">警告</span>')
  })
})

describe('transformJsx', () => {
  it('should transform JSX text', () => {
    const code = `
function App() {
  return <div>这是一条重要的信息</div>
}
`
    const result = transformJsx(code, 'test.tsx', mockConfig)
    expect(result).not.toBeNull()
    expect(result!.code).toContain('<span className="kim-text">重要</span>')
  })

  it('should not transform when no matches', () => {
    const code = `
function App() {
  return <div>普通信息</div>
}
`
    const result = transformJsx(code, 'test.tsx', mockConfig)
    expect(result).toBeNull()
  })
})
