import type { ResolvedKimConfig } from '../types'
import { transformVue } from './vue'
import { transformJsx } from './jsx'

export interface TransformResult {
  code: string
  map: any
}


export function transform(
  code: string,
  id: string,
  config: ResolvedKimConfig
): TransformResult | null {
  if (id.endsWith('.vue')) {
    return transformVue(code, id, config)
  }

  if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
    return transformJsx(code, id, config)
  }

  return null
}

export { transformVue } from './vue'
export { transformJsx } from './jsx'
