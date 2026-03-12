

Based on the provided code map and README information, I can generate the README.md file directly. The project is already well-documented in the original README section, which provides comprehensive information about the project.

Here is the README.md content:

# Flume

<p align="center">
  <img src="./PRD.png" alt="Flume 产品界面" width="800"/>
</p>

*从灵感到产品，每一步都可以被画出来——包括这张图本身。*

---

## 简介

Flume 是一个可视化图形编辑工具——你拖拽节点、连接线条，它实时生成 Mermaid 代码。

画架构图，本应像你思考一样流畅。  
Flume 不关心你画的是什么系统，只关心你画得顺手：

- **从手绘的直觉出发**，而不是从工具的约束出发。拖拽、旋转、自动整理，每一步都回应你的操作惯性。
- **底层是文本，所见即所得**。你可以手动改代码，也可以直接在画布上调整，两者实时同步。
- **与 AI 协作，而不是被它替代**。Flume 生成的 Mermaid 代码可以直接喂给 AI 做进一步分析；AI 生成的草图也可以粘贴进来，你继续手动完善。

它不是又一个画图软件。它是你思考时的草稿纸，是你和 AI 讨论架构时的共同语言。  
你负责直觉，它负责呈现——仅此而已。

---

## 核心能力

- 🎯 **直观编辑**：拖拽式操作，所见即所得的图形编辑体验
- 🔄 **自动布局**：智能整理节点位置，支持多种布局方向
- 📝 **Mermaid 集成**：实时生成和同步 Mermaid 代码
- ⌨️ **键盘导航**：丰富的快捷键，提升编辑效率
- 💾 **本地存储**：数据持久化到本地，刷新页面不丢失
- 🤖 **AI 协作**：生成的 Mermaid 代码可直接与 AI 交互

---

## 架构概览

```mermaid
flowchart TB
    subgraph 表现层
        FlowCanvas["FlowCanvas.vue
画布组件"]
        CustomNode["CustomNode.vue
节点组件"]
        Toolbar["Toolbar.vue
工具栏组件"]
    end
    
    subgraph 事件系统
        Events["事件系统
useCanvasEvents/useNodeEvents/useKeyboard/useToolbarEvents"]
    end
    
    subgraph 状态管理层
        State["状态管理
flowStore"]
    end
    
    subgraph 业务与服务层
        GraphOps["图形操作
useGraphOperations"]
        Services["服务层
useLayout/useMermaid"]
        Storage["存储服务
useStorage"]
    end
    
    FlowCanvas --> Events
    CustomNode --> Events
    Toolbar --> Events
    
    Events --> State
    
    State --> GraphOps
    State --> Services
    State --> Storage
    
    GraphOps --> Services
    GraphOps --> Storage
```

Flume 采用四层架构设计：

1. **表现层**：包含画布、节点和工具栏等核心组件，负责界面渲染和用户交互
2. **事件系统**：处理用户交互事件，如点击、拖拽、键盘操作等
3. **状态管理层**：核心控制中心，管理应用状态，协调各模块工作
4. **业务与服务层**：包含图形操作、布局服务、Mermaid 生成和存储服务

**核心依赖关系**：
- 表现层组件通过事件系统与状态管理层交互
- 事件系统直接对接状态管理层，处理用户交互并触发状态更新
- 状态管理层管理和调用业务与服务层的功能
- 图形操作模块执行具体的图形操作逻辑，依赖服务层和存储服务

---

## 功能列表

- **拖拽节点**：自由拖拽节点到画布任意位置
- **连接节点**：通过拖拽创建节点间的连接
- **自动布局**：支持从上到下（TB）、从下到上（BT）、从左到右（LR）、从右到左（RL）四种布局方向
- **Mermaid 导入导出**：实时生成 Mermaid 代码，支持复制到剪贴板
- **键盘导航**：Tab 添加子节点，Ctrl+Enter 添加兄弟节点，Delete 删除选中元素，方向键导航
- **节点编辑**：双击节点进入编辑模式，支持多行文本
- **本地存储**：自动保存到本地存储，刷新页面数据不丢失
- **视口控制**：支持缩放、平移画布
- **选中状态管理**：清晰的选中状态视觉反馈

---

## 快速开始

### 安装

1. 克隆项目到本地

```bash
git clone <repository-url>
cd flume
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

### 基础使用

1. **创建节点**：点击画布空白处，然后按 Tab 键添加子节点
2. **连接节点**：从一个节点的连接点拖拽到另一个节点
3. **编辑节点**：双击节点进入编辑模式，输入文本后按 Enter 确认
4. **调整布局**：使用工具栏的布局方向按钮切换布局
5. **复制 Mermaid 代码**：点击工具栏的 "复制 Mermaid" 按钮
6. **添加兄弟节点**：选中节点后按 Ctrl+Enter
7. **删除元素**：选中节点或边后按 Delete 键

---

## 项目结构

```
flume/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── CustomEdge.vue   # 自定义边组件
│   │   ├── CustomNode.vue   # 自定义节点组件
│   │   ├── FlowCanvas.vue   # 画布组件
│   │   └── Toolbar.vue      # 工具栏组件
│   ├── composables/         # 组合式函数
│   │   ├── events/          # 事件处理
│   │   │   ├── useCanvasEvents.ts
│   │   │   ├── useEdgeEvents.ts
│   │   │   ├── useKeyboard.ts
│   │   │   ├── useNodeEvents.ts
│   │   │   └── useToolbarEvents.ts
│   │   ├── graph/           # 图形操作
│   │   │   └── useGraphOperations.ts
│   │   └── services/        # 服务层
│   │       ├── useLayout.ts
│   │       ├── useMermaid.ts
│   │       └── useStorage.ts
│   ├── stores/              # 状态管理
│   │   └── flowStore.ts
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   └── style.css            # 全局样式
├── tests/                   # 测试文件
├── public/                  # 静态资源
└── vite.config.ts           # Vite 配置
```

---

## 技术栈

- Vue 3 Composition API
- TypeScript
- Pinia (状态管理)
- Vue Flow (图形编辑)
- Dagre (自动布局)

---

## 许可证

MIT License