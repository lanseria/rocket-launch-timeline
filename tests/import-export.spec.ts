import { expect, test } from '@playwright/test'

test.describe('配置导入导出', () => {
  test('导出配置下载 JSON', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('#missionNameInput', { timeout: 10000 })

    // 监听下载
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出配置' }).click()
    const download = await downloadPromise

    // 验证文件名包含日期
    const filename = download.suggestedFilename()
    expect(filename).toContain('rocket-timeline-config-')
    expect(filename).toContain('.json')

    // 验证内容是有效 JSON
    const content = await download.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of content)
      chunks.push(chunk as Buffer)
    const json = JSON.parse(Buffer.concat(chunks).toString())
    expect(json.version).toBe(1)
    expect(json.missionName).toBeTruthy()
    expect(json.timestamps).toBeInstanceOf(Array)
    expect(json.nodeNames).toBeInstanceOf(Array)
    expect(json.nodeVisibilities).toBeInstanceOf(Array)
  })

  test('导入配置修改 store 状态', async ({ page }) => {
    await page.goto('/control')
    await page.waitForSelector('#missionNameInput', { timeout: 10000 })

    // 创建一个测试配置文件并上传
    const testConfig = {
      version: 1,
      missionName: '导入测试任务',
      vehicleName: 'Test Rocket',
      activeThemeId: 'spacex-v4',
      showVehicleName: true,
      timestamps: [-120, 0, 120],
      nodeNames: ['T-2min', 'LIFTOFF', 'T+2min'],
      nodeVisibilities: [true, true, true],
      timeValueRaw: 120,
    }

    // 用 file chooser 处理文件上传
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: '导入配置' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testConfig)),
    })

    // 等待 alert 被处理
    page.on('dialog', dialog => dialog.accept())
    await page.waitForTimeout(1000)

    // 验证 store 已更新
    const missionValue = await page.locator('#missionNameInput').inputValue()
    expect(missionValue).toBe('导入测试任务')

    const vehicleValue = await page.locator('#vehicleNameInput').inputValue()
    expect(vehicleValue).toBe('Test Rocket')
  })
})
