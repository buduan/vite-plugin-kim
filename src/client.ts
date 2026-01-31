// src/client.ts
// Client-side API for controlling Kim effects

export interface KimState {
  enabled: boolean
  scale: number
  fontWeight: string
}

export interface KimEventMap {
  change: KimState
  enable: void
  disable: void
}

type EventCallback<T> = T extends void ? () => void : (data: T) => void

class KimClient {
  private listeners: Map<string, Set<Function>> = new Map()

  /**
   * 启用 Kim 效果
   */
  enable(): void {
    document.documentElement.removeAttribute('data-kim-disabled')
    this.emit('enable')
    this.emit('change', this.getState())
  }

  /**
   * 禁用 Kim 效果
   */
  disable(): void {
    document.documentElement.setAttribute('data-kim-disabled', '')
    this.emit('disable')
    this.emit('change', this.getState())
  }

  /**
   * 切换 Kim 效果
   */
  toggle(): void {
    if (this.isEnabled()) {
      this.disable()
    } else {
      this.enable()
    }
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return !document.documentElement.hasAttribute('data-kim-disabled')
  }

  /**
   * 设置放大倍数
   */
  setScale(scale: number): void {
    document.documentElement.style.setProperty('--kim-scale', String(scale))
    this.emit('change', this.getState())
  }

  /**
   * 获取当前放大倍数
   */
  getScale(): number {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--kim-scale')
      .trim()
    return parseFloat(value) || 1.2
  }

  /**
   * 设置字体粗细
   */
  setFontWeight(weight: 'bold' | 'normal'): void {
    document.documentElement.style.setProperty('--kim-font-weight', weight)
    this.emit('change', this.getState())
  }

  /**
   * 获取当前字体粗细
   */
  getFontWeight(): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--kim-font-weight')
      .trim() || 'bold'
  }

  /**
   * 获取当前状态
   */
  getState(): KimState {
    return {
      enabled: this.isEnabled(),
      scale: this.getScale(),
      fontWeight: this.getFontWeight(),
    }
  }

  /**
   * 刷新 DOM（用于动态内容）
   * 注意：由于 AST 转换发生在构建时，此方法仅触发样式重新计算
   */
  refresh(): void {
    // 触发样式重新计算
    document.documentElement.style.setProperty(
      '--kim-refresh',
      String(Date.now())
    )
  }

  /**
   * 监听事件
   */
  on<K extends keyof KimEventMap>(
    event: K,
    callback: EventCallback<KimEventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // 返回取消监听的函数
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof KimEventMap>(
    event: K,
    callback: EventCallback<KimEventMap[K]>
  ): void {
    this.listeners.get(event)?.delete(callback)
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof KimEventMap>(
    event: K,
    data?: KimEventMap[K]
  ): void {
    this.listeners.get(event)?.forEach((callback) => {
      callback(data)
    })
  }
}

// 创建单例
export const kim = new KimClient()

// 默认导出
export default kim
