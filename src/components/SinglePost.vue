<template lang="">
    <div>
        hello {{post.title}}
        {{snippet}}
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
    const props = defineProps(["post"])
    const snippet = computed(() => {
        return props.post.body.substring(0,100) + '...'
    })
</script>
<style lang="">

</style>
