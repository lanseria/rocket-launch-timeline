# Rocket Launch Timeline

火箭发射时间轴可视化工具，支持实时 WebSocket 同步控制。适用于发射活动直播演示、航天科普活动等场景。

## 功能

- SpaceX 风格弧形时间轴（270° SVG 弧线）
- T- 倒计时 / T+ 正计时自动切换
- 自定义任务名称、运载工具、事件节点
- WebSocket 实时同步（控制端 → 展示端）
- 自定义背景图片
- Docker 一键部署

## 快速开始

### Docker 运行（推荐）

```bash
docker run -d \
  --name rocket-timeline \
  -p 3005:3005 \
  ghcr.io/lanseria/rocket-launch-timeline:latest
```

访问 `http://localhost:3005` 查看展示页面。

### 本地开发

需要 Node.js >= 22、pnpm >= 10。

```bash
pnpm install
pnpm dev
```

## 使用方式

项目分为两个页面，通过 WebSocket 实现同步：

| 页面 | 路径 | 用途 |
|------|------|------|
| 展示端 | `/` | 全屏时间轴，投屏或大屏显示 |
| 控制端 | `/control` | 管理任务信息、事件节点、计时控制 |

**典型工作流：**

1. 在一台设备打开 `/control` 配置任务信息和事件
2. 在另一台设备（大屏/投屏）打开 `/` 展示
3. 两端自动通过 WebSocket 同步状态
4. 在控制端操作开始/暂停/跳转，展示端实时响应

## Docker 部署

```bash
# 构建镜像
docker build -t rocket-launch-timeline .

# 运行
docker compose up -d
```

镜像也可从 GitHub Container Registry 拉取：

```bash
docker pull ghcr.io/lanseria/rocket-launch-timeline:latest
```

---

## 技术栈

- **框架**: Nuxt 4 + Vue 3 (`<script setup lang="ts">`)
- **样式**: UnoCSS 原子化 CSS
- **状态管理**: Pinia
- **工具库**: VueUse、es-toolkit
- **代码规范**: @antfu/eslint-config（无分号、单引号、尾随逗号）
- **容器**: Docker (Node 22 Alpine 多阶段构建)

## 项目结构

```
app/
├── pages/
│   ├── index.vue          # 展示端（全屏时间轴）
│   └── control.vue        # 控制端（管理面板）
├── components/
│   ├── ControlPanel/      # 控制面板子组件
│   ├── layout/            # 布局适配器
│   ├── modal/             # 事件管理弹窗
│   └── GradientBar.vue    # 底部渐变条
├── composables/
│   ├── timeline.ts        # Pinia store（核心状态逻辑）
│   └── useWebSocket.ts    # WebSocket 连接管理
├── constants/             # 默认配置
└── themes/
    └── spacex-v4/         # SpaceX V4 弧形时间轴主题
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 3005）
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

## License

MIT
