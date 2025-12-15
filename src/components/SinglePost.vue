<template lang="">
    <div>
        {{post.title}}
        {{snippet}}
        <RouterLink :to="{ name: 'Detail', params: { id: post.id } }">Detail</RouterLink>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
    const props = defineProps(["post"])
    const snippet = computed(() => {
        return props.post.body.substring(0,100) + '...'
    })
</script>
