<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';

</script>

<template>
  <NavBar/>
  <RouterView/>
</template>

<style>
body {
  text-align: center;
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
