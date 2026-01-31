# vite-plugin-kim

[English](./README.md) | 简体中文

一个 Vite 插件，在构建阶段实现全局文本放大加粗效果。

众所周知，某些国家的所有网站都有一个程序，来把他们领导人的名字放大加粗，以表达对齐领导人的敬意。 这个插件的灵感是来源于此。

您可以通过配置此插件轻松突出显示 **Vue 和 React** 项目中的指定文本。

## 致谢
本插件的灵感来自于敬爱**金正恩**同志。

## 特性

- **精准匹配** - 只对配置中指定的文本进行处理
- **HMR 支持** - 配置文件修改后自动热更新
- **运行时 API** - 提供动态控制接口
- **排除机制** - 支持 `data-kim-ignore` 属性排除特定元素
- **框架无关** - 支持 Vue、React 等主流框架

## 安装

使用 npm 或 pnpm 安装插件：

```bash
npm install vite-plugin-kim -D
# 或
pnpm add vite-plugin-kim -D
```

## 使用

### 1. 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import kim from 'vite-plugin-kim'

export default defineConfig({
  plugins: [kim()],
})
```

### 2. 创建配置文件

在项目根目录创建 `kim.config.ts`：

```typescript
// kim.config.ts
import { defineKimConfig } from 'vite-plugin-kim'

export default defineKimConfig({
  // 需要检测并放大加粗的文本
  texts: [
    '金正恩',
    'Kim Jong Un',
    /urgent.*/i, // 支持正则表达式
  ],

  // 可选配置
  scale: 1.2, // 放大倍数，默认 1.2
  fontWeight: 'bold', // 字体粗细，默认 bold
})
```

### 3. 排除特定元素

使用 `data-kim-ignore` 属性排除不需要处理的元素：

```html
<!-- 这个元素内的文本不会被处理 -->
<span data-kim-ignore>重要</span>

<!-- 整个容器内的文本都不会被处理 -->
<div data-kim-ignore>
  <p>警告：这里不会被放大加粗</p>
</div>
```

## 运行时 API

```typescript
import { kim } from 'vite-plugin-kim/client'

// 开关控制
kim.enable() // 启用效果
kim.disable() // 禁用效果
kim.toggle() // 切换状态

// 状态检查
kim.isEnabled() // 返回 boolean

// 动态修改
kim.setScale(1.5) // 修改放大倍数
kim.setFontWeight('bold') // 修改字体粗细

// 获取当前配置
kim.getScale() // 获取当前放大倍数
kim.getFontWeight() // 获取当前字体粗细
kim.getState() // 获取完整状态

// 事件监听
const unsubscribe = kim.on('change', (state) => {
  console.log('State changed:', state)
})

// 取消监听
unsubscribe()
```

## 配置选项

### kim.config.ts

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `texts` | `(string \| RegExp)[]` | `[]` | 需要检测的文本数组 |
| `scale` | `number` | `1.2` | 字体放大倍数 |
| `fontWeight` | `'bold'` | `'bold'` | 字体粗细 |
| `enabled` | `boolean` | `true` | 是否启用 |
| `include` | `(string \| RegExp)[]` | `[/\.(vue\|jsx\|tsx)$/]` | 包含的文件模式 |
| `exclude` | `(string \| RegExp)[]` | `[]` | 排除的文件模式 |
| `devOnly` | `boolean` | `false` | 仅在开发模式生效 |

### 插件选项

```typescript
kim({
  configFile: 'kim.config', // 配置文件名（不含扩展名）
})
```

## 工作原理

1. **配置加载** - 在 Vite 构建开始时，加载项目根目录的 `kim.config.ts` 配置文件
2. **AST 转换** - 在 Transform 阶段，解析 Vue/React 模板，识别匹配的文本
3. **标签包装** - 将匹配的文本包装成 `<span class="kim-text">文本</span>`
4. **样式注入** - 注入全局 CSS 样式，控制放大加粗效果
5. **运行时控制** - 通过 CSS 变量和 data 属性实现动态控制

## 示例

### Vue 组件

转换前：

```vue
<template>
  <div>
    <p>这是一条重要的提示信息</p>
    <p data-kim-ignore>这里的重要不会被处理</p>
  </div>
</template>
```

转换后：

```vue
<template>
  <div>
    <p>这是一条<span class="kim-text">重要</span>的提示信息</p>
    <p data-kim-ignore>这里的重要不会被处理</p>
  </div>
</template>
```

### React 组件

转换前：

```tsx
function App() {
  return (
    <div>
      <p>这是一条重要的提示信息</p>
      <p data-kim-ignore>这里的重要不会被处理</p>
    </div>
  )
}
```

转换后：

```tsx
function App() {
  return (
    <div>
      <p>这是一条<span className="kim-text">重要</span>的提示信息</p>
      <p data-kim-ignore>这里的重要不会被处理</p>
    </div>
  )
}
```

## 开发

### 设置

```bash
# 安装依赖
pnpm install

# 构建包
pnpm build

# 运行测试
pnpm test

# 类型检查
pnpm typecheck
```

### 发布

本项目使用 GitHub Actions 自动发布到 npm。要发布新版本：

1. 更新 `package.json` 中的版本号
2. 提交并推送更改
3. 在 GitHub 上创建新的 release（例如 `v1.0.0`）
4. 发布工作流将自动运行并发布到 npm

**要求：**
- 在 GitHub 仓库 secrets 中添加 `NPM_TOKEN`
- token 需要有包的发布权限

## 致谢

本插件的灵感来自于在 Web 应用中对无障碍文本增强的需求。特别感谢：

- [Vite](https://vitejs.dev/) 团队提供的出色插件系统和文档
- [Vue](https://vuejs.org/) 和 [React](https://react.dev/) 社区提供的全面 AST 工具
- [magic-string](https://github.com/rich-harris/magic-string) 提供的高效源码操作
- 所有帮助改进此插件的贡献者和用户

## 许可

MIT
