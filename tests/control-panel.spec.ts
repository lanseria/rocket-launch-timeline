import { expect, test } from '@playwright/test'

test.describe('控制面板功能验证', () => {
  test('控制面板页面加载并渲染', async ({ page }) => {
    await page.goto('/control')
    // 等待 Vue SPA hydration
    await page.waitForSelector('h1', { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('控制面板')

    // WebSocket 连接状态
    const status = page.locator('.rounded-full.h-2\\.5')
    await expect(status).toBeVisible()

    // 主要配置区域
    await expect(page.locator('text=主要配置')).toBeVisible()
    await expect(page.locator('#missionNameInput')).toBeVisible()
    await expect(page.locator('#vehicleNameInput')).toBeVisible()

    // 主题选择
    await expect(page.locator('text=UI 主题')).toBeVisible()

    // showVehicleName 切换
    await expect(page.locator('#showVehicleNameSwitch')).toBeAttached()

    // 事件管理按钮
    await expect(page.getByRole('button', { name: '管理事件节点' })).toBeVisible()

    // 导入导出
    await expect(page.getByRole('button', { name: '导入配置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导出配置' })).toBeVisible()
  })

  test('控制区域完整', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('text=开始倒计时', { timeout: 10000 })

    await expect(page.getByRole('button', { name: '开始倒计时' })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置计时器' })).toBeVisible()
    await expect(page.locator('text=当前时间')).toBeVisible()
    await expect(page.locator('text=快速跳转')).toBeVisible()
  })

  test('背景图配置区域', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('text=选择本地图片', { timeout: 10000 })

    await expect(page.getByRole('button', { name: '选择本地图片' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'OBS 直播透明背景' })).toBeVisible()
    await expect(page.getByRole('button', { name: '还原默认背景' })).toBeVisible()
  })

  test('展示页面加载', async ({ page }) => {
    await page.goto('/')
    // 等待 Vue hydration，检查 T 计时器
    await page.waitForSelector('.tabular-nums', { timeout: 10000 })
    const timerText = await page.locator('.tabular-nums').textContent()
    expect(timerText).toContain('T')
  })
})

test.describe('控制面板交互', () => {
  test('开始/暂停/继续倒计时', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('text=开始倒计时', { timeout: 10000 })

    await page.getByRole('button', { name: '开始倒计时' }).click()
    await expect(page.getByRole('button', { name: '暂停' })).toBeVisible()

    await page.getByRole('button', { name: '暂停' }).click()
    await expect(page.getByRole('button', { name: '继续' })).toBeVisible()

    await page.getByRole('button', { name: '继续' }).click()
    await expect(page.getByRole('button', { name: '暂停' })).toBeVisible()

    await page.getByRole('button', { name: '重置计时器' }).click()
    await expect(page.getByRole('button', { name: '开始倒计时' })).toBeVisible()
  })

  test('事件管理弹窗', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('text=管理事件节点', { timeout: 10000 })

    await page.getByRole('button', { name: '管理事件节点' }).click()
    await expect(page.locator('text=管理事件节点 (单位: 秒)')).toBeVisible()

    const eventInputs = page.locator('.node_list_scrollbar input[type="number"]')
    await expect(eventInputs).toHaveCount(12)

    await page.getByRole('button', { name: '关闭' }).click()
    await expect(page.locator('text=管理事件节点 (单位: 秒)')).not.toBeVisible()
  })

  test('showVehicleName 切换', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('#showVehicleNameSwitch', { timeout: 10000 })

    const toggle = page.locator('#showVehicleNameSwitch')
    const initialState = await toggle.isChecked()
    await toggle.click({ force: true })
    await page.waitForTimeout(300)
    const newState = await toggle.isChecked()
    expect(newState).toBe(!initialState)
  })
})
