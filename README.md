# 轻待办 · 小清新待办应用

一个用 Expo + React Native 写的待办应用，薄荷绿 + 奶油白的「小清新」视觉，一套代码同时跑 iOS / Android / Web。

## 功能

- **新建 / 编辑**：标题、备注、分类（个人 / 工作 / 学习 / 生活）、优先级（重要 / 一般 / 随手）、截止日期（今天 / 明天 / 本周日 / 不设）
- **勾选完成**：圆形勾选动画，完成项自动沉到「已完成」分组
- **左滑删除**：滑出删除按钮，删除后底部弹出「撤销」提示（4 秒）
- **筛选**：全部 / 今天 / 本周 / 已完成，可叠加分类筛选与关键词搜索
- **数据概览**：今日进度环、待办与完成数量、逾期提醒
- **本地持久化**：AsyncStorage 存储，重启应用不丢数据
- **响应式**：手机全宽，大屏自动收成 540 宽的居中列

## 运行

```bash
npm install
npx expo start          # 扫码用 Expo Go，或按 i / a / w 打开模拟器与浏览器
npx expo start --web    # 只跑网页版
```

## 图标与 Logo

Logo 为「白色清单卡片 + 薄荷叶片」，取自应用内的待办卡片与空状态插画，配色沿用 `#7ED3B5 → #2E8C74` 渐变。

| 文件 | 用途 | 规格 |
| --- | --- | --- |
| `assets/images/icon.png` | iOS / 通用应用图标 | 1024×1024，无 alpha |
| `assets/images/android-icon-foreground.png` | Android 自适应图标前景 | 1024×1024，透明，缩至安全区 |
| `assets/images/android-icon-background.png` | Android 自适应图标背景 | 1024×1024 渐变 |
| `assets/images/android-icon-monochrome.png` | Android 13+ 主题图标 | 1024×1024，白色剪影 |
| `assets/images/splash-icon.png` | 启动页 | 512×512 |
| `assets/images/favicon.png` | Web 站点图标 | 128×128 |
| `assets/images/logo.png` | 应用内标题栏品牌标识 | 128×128 |
| `assets/logo.svg` | 矢量母版，改色/改形从这里改 | 1024 viewBox |

## 结构

```
src/
  app/                 # Expo Router 路由（index 为唯一页面）
  components/          # UI：任务卡片、编辑面板、进度环、空状态、图标
  constants/design.ts  # 配色、圆角、阴影、字号等设计变量
  store/use-todos.ts   # 待办状态 + AsyncStorage 持久化 + 排序
  types/todo.ts        # 数据模型
  utils/date.ts        # 本地日期键、今天 / 本周、友好日期文案
```

## 类型检查

```bash
npx tsc --noEmit
```
