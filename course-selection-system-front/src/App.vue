<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router';
const router = useRouter();
const handleSelect = (name) => {
  if(name == '1') {
    router.push('/');
  } else if (name == '2') {
    router.push('/about');
  } else {
    
  }
};
</script>

<template>
  <main>
  <RouterView />
  </main>
</template>

<style scoped>
</style>
