import type { ResolvedKimConfig } from './types'

/**
 * 生成全局 CSS 样式
 */
export function generateStyles(config: ResolvedKimConfig): string {
  return `
/* vite-plugin-kim - Global text enhancement styles */
:root {
  --kim-scale: ${config.scale};
  --kim-font-weight: ${config.fontWeight};
  --kim-enabled: 1;
}

/* Kim text enhancement */
.kim-text {
  font-size: calc(1em * var(--kim-scale));
  font-weight: var(--kim-font-weight);
  display: inline;
}

/* Disabled state - controlled via JS */
:root[data-kim-disabled] .kim-text {
  font-size: inherit;
  font-weight: inherit;
}

/* data-kim-ignore exclusion mechanism */
[data-kim-ignore] .kim-text,
[data-kim-ignore].kim-text {
  font-size: inherit;
  font-weight: inherit;
}
`.trim()
}

/**
 * 生成内联样式标签
 */
export function generateStyleTag(config: ResolvedKimConfig): string {
  return `<style data-kim-styles>${generateStyles(config)}</style>`
}
