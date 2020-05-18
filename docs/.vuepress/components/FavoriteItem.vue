<template>
    <router-link :to="to.path">{{ to.title }}</router-link>
</template>

<script>
export default {
    props: ['to'],
}
</script>