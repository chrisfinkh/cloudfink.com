<template>
    <div>
        <h1>Home</h1>
        <PostList v-if="posts.length" :posts="posts"></PostList>
        <p v-else>Loading...</p>
        <p v-if="error">{{error}}</p>

    </div>
</template>
<script setup lang="ts">
    import PostList from "./components/PostList.vue"
import getPosts from "./composables/getPosts"

    const {posts, error, load} = getPosts()
    load()
</script>
<style lang="">

</style>
