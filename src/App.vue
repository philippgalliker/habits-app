<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen justify-center bg-neutral-200">
    <div class="flex min-h-screen w-full max-w-md flex-col bg-white shadow-sm">
      <RouterView />
    </div>
  </div>
</template>
