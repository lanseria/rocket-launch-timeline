// app/constants/defaults.ts

export const defaultConfigEN = {
  missionName: 'Starlink',
  vehicle: 'Falcon 9 Block 5',
  backgroundImageUrl: '/assets/images/falcon9_16_9.jpg',
  events: [
    { time: -300, name: 'ENGINE CHILL', show: true },
    { time: -45, name: 'STARTUP', show: true },
    { time: -1, name: 'IGNITION', show: false },
    { time: 0, name: 'LIFTOFF', show: true },
    { time: 72, name: 'MAX-Q', show: true },
    { time: 145, name: 'STAGE SEP', show: true },
    { time: 146, name: 'SES-1', show: false },
    { time: 195, name: 'FAIRING', show: true },
    { time: 380, name: 'ENTRY BURN', show: true },
    { time: 490, name: 'LANDING BURN', show: true },
    { time: 520, name: 'STAGE 1 LANDING', show: false },
    { time: 530, name: 'SECO-1', show: true },
  ],
}

export const defaultConfigZH = {
  missionName: '星链',
  vehicle: '猎鹰9号 Block 5',
  backgroundImageUrl: '/assets/images/falcon9_16_9.jpg',
  events: [
    { time: -300, name: '引擎预冷', show: true },
    { time: -45, name: '引擎启动', show: true },
    { time: -1, name: '点火', show: false },
    { time: 0, name: '起飞', show: true },
    { time: 72, name: '最大动压点', show: true },
    { time: 145, name: '一级分离', show: true },
    { time: 146, name: '二级第一次点火', show: false },
    { time: 195, name: '整流罩分离', show: true },
    { time: 380, name: '再入点火', show: true },
    { time: 490, name: '着陆点火', show: true },
    { time: 520, name: '一级着陆', show: false },
    { time: 530, name: '二级引擎关闭', show: true },
  ],
}
