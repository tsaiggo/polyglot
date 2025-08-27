# Polyglot: SDK文档到MCP代码生成代理

构建一个AI代理Web应用，能够读取SDK技术文档URL，理解其内容，并将其翻译成功能完整的MCP（Model Context Protocol）代码。

**Experience Qualities**:
1. **简约专注** - 黑白极简设计，让用户专注于核心功能
2. **友好互动** - 大量emoji点缀，实时反馈让过程透明可见
3. **高效智能** - AI驱动的代码生成，自动验证和修复

**Complexity Level**: Light Application (多个功能与基础状态管理)
- 需要处理文档解析、AI生成、实时通信等多个功能模块，但整体复杂度适中

## Essential Features

### URL输入与解析
- **Functionality**: 接收SDK文档URL，获取并解析内容
- **Purpose**: 为AI分析提供结构化的文档数据
- **Trigger**: 用户粘贴URL并点击生成按钮
- **Progression**: 输入URL → 验证格式 → 获取内容 → 解析为纯文本 → 传递给AI
- **Success criteria**: 成功提取文档文本内容，支持HTML和Markdown格式

### AI代码生成
- **Functionality**: 使用LLM分析文档并生成MCP代码
- **Purpose**: 将技术文档自动转换为可用的代码实现
- **Trigger**: 文档解析完成后自动开始
- **Progression**: 文档文本 → LLM分析 → 生成IR结构 → 代码模板渲染 → 生成完整代码
- **Success criteria**: 生成符合MCP协议的TypeScript代码文件

### 实时状态反馈
- **Functionality**: 通过SSE显示任务执行的实时进度
- **Purpose**: 让用户了解处理状态，增强体验透明度
- **Trigger**: 任务开始时建立SSE连接
- **Progression**: 连接SSE → 接收状态更新 → 实时显示日志 → 完成时展示结果
- **Success criteria**: 流畅的实时日志显示，清晰的状态标识

### 代码验证与下载
- **Functionality**: TypeScript类型检查验证，打包下载生成的代码
- **Purpose**: 确保生成代码的正确性，提供便捷的获取方式
- **Trigger**: 代码生成完成后自动验证
- **Progression**: 代码生成 → TypeScript验证 → 错误修复（如需要） → 打包ZIP → 提供下载
- **Success criteria**: 通过类型检查的代码，可下载的ZIP文件

## Edge Case Handling
- **无效URL**: 显示友好错误提示，引导用户检查URL格式
- **文档获取失败**: 提供重试机制，显示具体错误原因
- **AI解析失败**: 降级处理，提示用户检查文档格式或内容
- **代码验证失败**: 自动修复循环，最多尝试3次修复
- **网络连接问题**: SSE重连机制，保证实时通信稳定性

## Design Direction
界面追求极致的黑白简约风格，营造干净、专注的视觉体验，同时使用可爱emoji点缀增添友好感。现代圆角设计语言，最小化界面元素，最大化功能效率。

## Color Selection
Monochromatic（单色调黑白灰方案）- 使用黑白灰渐变创造层次感，配合emoji色彩点缀来活跃界面氛围。

- **Primary Color**: 纯黑 oklch(0.15 0 0) - 传达专业、专注的品牌特质
- **Secondary Colors**: 中性灰 oklch(0.6 0 0) - 用于次要信息和分隔元素
- **Accent Color**: 纯白 oklch(0.95 0 0) - 用于CTA按钮和重要交互元素
- **Foreground/Background Pairings**: 
  - Background (纯白 oklch(0.98 0 0)): 深灰文字 oklch(0.2 0 0) - Ratio 15.8:1 ✓
  - Card (浅灰 oklch(0.96 0 0)): 深灰文字 oklch(0.2 0 0) - Ratio 14.1:1 ✓
  - Primary (纯黑 oklch(0.15 0 0)): 纯白文字 oklch(0.98 0 0) - Ratio 15.8:1 ✓

## Font Selection
使用Inter字体族传达现代、清晰、技术感，确保在各种屏幕尺寸下的优秀可读性。

- **Typographic Hierarchy**: 
  - H1 (应用标题): Inter Bold/32px/紧密字间距
  - H2 (区域标题): Inter SemiBold/24px/正常字间距
  - Body (正文内容): Inter Regular/16px/1.5倍行高
  - Code (代码显示): JetBrains Mono/14px/等宽显示
  - Caption (日志文字): Inter Medium/14px/1.4倍行高

## Animations
动画应该微妙而有功能性，增强交互反馈而不分散注意力。重点关注状态转换的流畅性和加载过程的视觉引导。

- **Purposeful Meaning**: 使用轻微的淡入淡出效果引导用户注意力流，按钮悬停的微妙缩放体现交互反馈
- **Hierarchy of Movement**: 日志区域的滚动动画最重要，按钮交互次之，装饰性动画最少

## Component Selection
- **Components**: 
  - Input组件用于URL输入，配置圆角和聚焦状态
  - Button组件作为主要CTA，使用Primary样式
  - Card组件包装日志区域和结果展示
  - ScrollArea用于日志区域的滚动显示
  - Badge组件显示日志级别标识
- **Customizations**: 
  - 自定义代码编辑器组件用于结果展示
  - 自定义SSE钩子管理实时通信
  - 自定义下载按钮组件处理ZIP文件
- **States**: 
  - 按钮禁用状态（处理中）
  - 输入框验证状态（错误/成功）
  - 日志条目的不同级别样式
- **Icon Selection**: 
  - 磷光图标库：Link（链接），Play（开始），Download（下载），CheckCircle（成功），XCircle（错误）
- **Spacing**: 使用Tailwind的8px网格系统，主要间距为space-4和space-6
- **Mobile**: 响应式单列布局，在小屏幕上堆叠显示，确保触摸目标大小满足44px最小标准