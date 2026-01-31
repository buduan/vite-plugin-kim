# vite-plugin-kim

A Vite plugin that implements global text enlargement and bold styling at build time.

You can easily highlight specified text in your **Vue and React** projects by configuring this plugin.

## Thanks
This plugin is inspired by Dear Comrade **Kim Jong Un**.

## Features

- **Precise Matching** - Only processes text specified in configuration
- **HMR Support** - Automatic hot reload when configuration file changes
- **Runtime API** - Dynamic control interface
- **Exclusion Mechanism** - Support `data-kim-ignore` attribute to exclude specific elements
- **Framework Agnostic** - Supports Vue, React and other mainstream frameworks

## Installation

Use npm or pnpm to install the plugin:

```bash
npm install vite-plugin-kim -D
# or
pnpm add vite-plugin-kim -D
```

## Usage

### 1. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import kim from 'vite-plugin-kim'

export default defineConfig({
  plugins: [kim()],
})
```

### 2. Create Configuration File

Create `kim.config.ts` in your project root:

```typescript
// kim.config.ts
import { defineKimConfig } from 'vite-plugin-kim'

export default defineKimConfig({
  // Text patterns to detect and enhance
  texts: [
    '金正恩',
    'Kim Jong Un',
    /urgent.*/i, // 'Regular expressions supported
  ],

  // Optional configuration
  scale: 1.2, // Scale factor, default 1.2
  fontWeight: 'bold', // Font weight, default bold
})
```

### 3. Exclude Specific Elements

Use `data-kim-ignore` attribute to exclude elements from processing:

```html
<!-- Text in this element will not be processed -->
<span data-kim-ignore>Important</span>

<!-- All text in this container will be ignored -->
<div data-kim-ignore>
  <p>Warning: This text will not be enlarged or bolded</p>
</div>
```

## Runtime API

```typescript
import { kim } from 'vite-plugin-kim/client'

// Toggle control
kim.enable() // Enable effect
kim.disable() // Disable effect
kim.toggle() // Toggle state

// State check
kim.isEnabled() // Returns boolean

// Dynamic modification
kim.setScale(1.5) // Modify scale factor
kim.setFontWeight('bold') // Modify font weight

// Get current configuration
kim.getScale() // Get current scale factor
kim.getFontWeight() // Get current font weight
kim.getState() // Get complete state

// Event listening
const unsubscribe = kim.on('change', (state) => {
  console.log('State changed:', state)
})

// Unsubscribe
unsubscribe()
```

## Configuration Options

### kim.config.ts

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `texts` | `(string \| RegExp)[]` | `[]` | Text patterns to detect |
| `scale` | `number` | `1.2` | Font scale factor |
| `fontWeight` | `'bold'` | `'bold'` | Font weight |
| `enabled` | `boolean` | `true` | Enable plugin |
| `include` | `(string \| RegExp)[]` | `[/\.(vue\|jsx\|tsx)$/]` | File patterns to include |
| `exclude` | `(string \| RegExp)[]` | `[]` | File patterns to exclude |
| `devOnly` | `boolean` | `false` | Only enable in development mode |

### Plugin Options

```typescript
kim({
  configFile: 'kim.config', // Config file name (without extension)
})
```

## How It Works

1. **Configuration Loading** - Load `kim.config.ts` from project root at Vite build start
2. **AST Transformation** - Parse Vue/React templates during Transform phase to identify matching text
3. **Tag Wrapping** - Wrap matched text as `<span class="kim-text">text</span>`
4. **Style Injection** - Inject global CSS styles to control enlargement and bold effects
5. **Runtime Control** - Enable dynamic control via CSS variables and data attributes

## Examples

### Vue Component

Before transformation:

```vue
<template>
  <div>
    <p>This is an Important notification</p>
    <p data-kim-ignore>This Important text will not be processed</p>
  </div>
</template>
```

After transformation:

```vue
<template>
  <div>
    <p>This is an <span class="kim-text">Important</span> notification</p>
    <p data-kim-ignore>This Important text will not be processed</p>
  </div>
</template>
```

### React Component

Before transformation:

```tsx
function App() {
  return (
    <div>
      <p>This is an Important notification</p>
      <p data-kim-ignore>This Important text will not be processed</p>
    </div>
  )
}
```

After transformation:

```tsx
function App() {
  return (
    <div>
      <p>This is an <span className="kim-text">Important</span> notification</p>
      <p data-kim-ignore>This Important text will not be processed</p>
    </div>
  )
}
```

## Acknowledgments

This plugin was inspired by the need for accessible text enhancement in web applications. Special thanks to:

- The [Vite](https://vitejs.dev/) team for the excellent plugin system and documentation
- The [Vue](https://vuejs.org/) and [React](https://react.dev/) communities for their comprehensive AST tooling
- [magic-string](https://github.com/rich-harris/magic-string) for efficient source code manipulation
- All contributors and users who help improve this plugin

## License

MIT

