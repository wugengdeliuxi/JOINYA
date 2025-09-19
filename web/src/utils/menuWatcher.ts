import { menusApi } from '@/services/menus'
import { reloadDynamicRoutes } from '@/router'
import type { Menu } from '@/services/menus'

// 菜单更新检测器
class MenuWatcher {
  private lastUpdateTime: string | null = null
  private checkInterval: number | null = null
  private callbacks: Array<() => void> = []

  // 开始监听菜单更新
  startWatching(intervalMs: number = 30000) { // 默认30秒检查一次
    if (this.checkInterval) {
      return
    }

    this.checkInterval = window.setInterval(async () => {
      await this.checkForUpdates()
    }, intervalMs)

    console.log('菜单更新监听已启动')
  }

  // 停止监听
  stopWatching() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      console.log('菜单更新监听已停止')
    }
  }

  // 检查菜单更新
  private async checkForUpdates() {
    try {
      const response = await menusApi.getMenus({ 
        limit: 1,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })

      if (response.success && response.data.length > 0) {
        const latestMenu = response.data[0]
        const latestUpdateTime = latestMenu.updatedAt

        if (this.lastUpdateTime && latestUpdateTime > this.lastUpdateTime) {
          console.log('检测到菜单更新，正在刷新...')
          await this.notifyUpdate()
        }

        this.lastUpdateTime = latestUpdateTime
      }
    } catch (error) {
      console.warn('检查菜单更新失败:', error)
    }
  }

  // 通知更新
  private async notifyUpdate() {
    try {
      // 重新加载动态路由
      await reloadDynamicRoutes()
      
      // 通知所有回调函数
      this.callbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error('菜单更新回调执行失败:', error)
        }
      })
    } catch (error) {
      console.error('菜单更新通知失败:', error)
    }
  }

  // 添加更新回调
  onUpdate(callback: () => void) {
    this.callbacks.push(callback)
  }

  // 移除更新回调
  offUpdate(callback: () => void) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  // 手动触发更新检查
  async forceUpdate() {
    await this.checkForUpdates()
  }
}

// 创建全局实例
export const menuWatcher = new MenuWatcher()

// 在开发环境下可以手动触发更新
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.menuWatcher = menuWatcher
}
