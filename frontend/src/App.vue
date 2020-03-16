<template>
  <div id="app">
    <Grid />
    <DensityTool />
  </div>
</template>

<script>
import Grid from './components/Grid.vue';
import DensityTool from './components/DensityTool.vue';

export default {
  name: 'App',
  components: {
    Grid,
    DensityTool
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
