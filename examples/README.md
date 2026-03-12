# Flume 使用示例

这里提供了多种使用 Flume 的示例项目。

## 📁 示例列表

### 1. CDN 示例 (cdn-example.html)

最简单的使用方式，直接在浏览器中打开即可使用。

**前提条件**：
- 需要先在 flume 项目根目录运行 `npm run build`
- 将 `dist` 目录下的 `flume.es.js` 和 `flume.css` 复制到 `examples` 目录

**使用方法**：
```bash
# 1. 构建 flume 包
cd c:\workspace\flume
npm run build

# 2. 复制文件到 examples 目录
copy dist\flume.es.js examples\
copy dist\flume.css examples\

# 3. 在浏览器中打开
start examples\cdn-example.html
```

### 2. Vue 项目示例 (vue-example/)

完整的 Vue + Vite 项目示例。

**使用方法**：
```bash
# 1. 进入示例目录
cd examples\vue-example

# 2. 安装依赖
npm install

# 3. 安装 flume（使用本地包）
npm install ../../soulglad-flume-0.0.1.tgz

# 4. 启动开发服务器
npm run dev
```

## 🚀 快速开始

### 方式 1：使用本地构建的包

```bash
# 1. 构建 flume
npm run build

# 2. 打包
npm pack

# 3. 在你的项目中安装
cd your-project
npm install ../soulglad-flume-0.0.1.tgz
```

### 方式 2：使用 npm link（开发时）

```bash
# 1. 在 flume 项目中
npm link

# 2. 在你的项目中
npm link @soulglad/flume
```

## 📝 代码示例

### 最简单的用法

```vue
<template>
  <div style="width: 100vw; height: 100vh;">
    <FlumeProvider />
  </div>
</template>

<script setup>
import { FlumeProvider } from '@soulglad/flume'
import '@soulglad/flume/style.css'
</script>
```

### 自定义配置

```vue
<template>
  <div style="width: 800px; height: 600px;">
    <FlumeProvider
      :background="{
        pattern: 'dots',
        patternColor: '#b1b1b7',
        gap: 20,
        size: 1,
        color: '#ffffff'
      }"
      :show-controls="true"
      :show-background="true"
    />
  </div>
</template>

<script setup>
import { FlumeProvider } from '@soulglad/flume'
import '@soulglad/flume/style.css'
</script>
```

### 自定义样式

```vue
<template>
  <div style="width: 100vw; height: 100vh;">
    <FlumeProvider
      container-class="my-container"
      toolbar-class="my-toolbar"
      canvas-class="my-canvas"
      :style="{
        container: { backgroundColor: '#fff' },
        toolbar: { padding: '10px' },
        canvas: { border: '1px solid #ccc' }
      }"
    />
  </div>
</template>

<script setup>
import { FlumeProvider } from '@soulglad/flume'
import '@soulglad/flume/style.css'
</script>

<style>
.my-container {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.my-toolbar {
  background-color: #f8f9fa;
}

.my-canvas {
  background-color: #ffffff;
}
</style>
```

### 自定义组件

```vue
<template>
  <div style="width: 100vw; height: 100vh;">
    <FlumeProvider>
      <template #toolbar>
        <MyCustomToolbar />
      </template>
      <template #canvas>
        <MyCustomCanvas />
      </template>
    </FlumeProvider>
  </div>
</template>

<script setup>
import { FlumeProvider } from '@soulglad/flume'
import '@soulglad/flume/style.css'
</script>
```

## ⚠️ 重要提示

1. **必须设置父容器的宽高**
   ```vue
   <div style="width: 100vw; height: 100vh;">
     <FlumeProvider />
   </div>
   ```

2. **必须导入样式文件**
   ```javascript
   import '@soulglad/flume/style.css'
   ```

3. **必须安装 Pinia**
   ```bash
   npm install pinia
   ```

4. **必须在应用中使用 Pinia**
   ```javascript
   import { createPinia } from 'pinia'
   const pinia = createPinia()
   app.use(pinia)
   ```

## 🔧 故障排除

### 问题：警告 "The Vue Flow parent container needs a width and a height"

**解决方案**：确保父容器有明确的宽高
```vue
<div style="width: 100vw; height: 100vh;">
  <FlumeProvider />
</div>
```

### 问题：样式没有加载

**解决方案**：确保导入了样式文件
```javascript
import '@soulglad/flume/style.css'
```

## 📚 更多资源

- [Flume README](../README.md)
- [Vue Flow 文档](https://vueflow.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)