<template>
  <div class="app">
    <FlowCanvasProvider />
  </div>
</template>

<script setup>
import { FlowCanvasProvider } from '@soulglad/flume'
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>