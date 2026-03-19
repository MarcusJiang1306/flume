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

完整的 Vue + Vite 项目示例，可直接参考其代码结构。

**使用方法**：
```bash
# 1. 进入示例目录
cd examples\vue-example

# 2. 安装依赖（包括 flume）
npm install

# 3. 启动开发服务器
npm run dev
```

## 🚀 快速开始

### 方式 1：使用 npm 安装（推荐）

```bash
# 在你的项目中安装 flume
npm install @soulglad/flume
```

### 方式 2：使用本地构建的包（开发时）

```bash
# 1. 构建 flume
npm run build

# 2. 打包
npm pack

# 3. 在你的项目中安装
cd your-project
npm install ../soulglad-flume-0.0.1.tgz
```

### 方式 3：使用 npm link（开发时）

```bash
# 1. 在 flume 项目中
npm link

# 2. 在你的项目中
npm link @soulglad/flume
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