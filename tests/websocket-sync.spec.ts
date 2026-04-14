import { expect, test } from '@playwright/test'

const BASE = 'http://localhost:3005'

test.describe('WebSocket 实时同步', () => {
  test('控制面板修改同步到展示页面', async ({ browser }) => {
    const controlCtx = await browser.newContext()
    const displayCtx = await browser.newContext()

    const controlPage = await controlCtx.newPage()
    const displayPage = await displayCtx.newPage()

    try {
      // 打开展示页面
      await displayPage.goto(`${BASE}/`)
      await displayPage.waitForTimeout(3000)

      // 打开控制面板
      await controlPage.goto(`${BASE}/control`)
      await controlPage.waitForSelector('#missionNameInput', { timeout: 10000 })

      // 等待 WebSocket 连接建立
      await controlPage.waitForTimeout(2000)

      // 修改任务名称
      await controlPage.locator('#missionNameInput').clear()
      await controlPage.locator('#missionNameInput').fill('SyncTest')

      // 等待同步传播
      await controlPage.waitForTimeout(2000)

      // 验证展示页面同步更新
      await expect(displayPage.locator('text=SyncTest')).toBeVisible({ timeout: 10000 })
    }
    finally {
      await controlCtx.close()
      await displayCtx.close()
    }
  })

  test('计时器控制同步', async ({ browser }) => {
    const controlCtx = await browser.newContext()
    const displayCtx = await browser.newContext()

    const controlPage = await controlCtx.newPage()
    const displayPage = await displayCtx.newPage()

    try {
      await displayPage.goto(`${BASE}/`)
      await displayPage.waitForTimeout(3000)

      await controlPage.goto(`${BASE}/control`)
      await controlPage.waitForSelector('text=开始倒计时', { timeout: 10000 })

      // 等待 WebSocket 连接
      await controlPage.waitForTimeout(2000)

      // 获取展示页面初始时间
      const initialTime = await displayPage.locator('.tabular-nums').textContent()

      // 开始倒计时
      await controlPage.getByRole('button', { name: '开始倒计时' }).click()
      await controlPage.waitForTimeout(3000)

      // 验证展示页面计时器在运行
      const newTime = await displayPage.locator('.tabular-nums').textContent()
      expect(newTime).not.toBe(initialTime)
    }
    finally {
      await controlCtx.close()
      await displayCtx.close()
    }
  })
})
