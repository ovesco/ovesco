<template>
    <div class="flex-container">
        <button @click="toggle" :class="{ active: isFavorite }">
            &hearts;
        </button>
    </div>
</template>

<script>
export default {
    methods: {
        toggle() {
            const { title, path } = this.$page;
            this.$store.commit('toggleFavorite', { title, path });
        }
    },
    computed: {
        isFavorite() {
            return this.$store.getters.isFavorite(this.$page.title);
        }
    }
}
</script>

<style>
    .flex-container {
        display: flex;
        justify-content: end;
    }

    .flex-container button {
        border-radius: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 2.4rem;
        height: 2.4rem;
        font-size: 2rem;
        background: #eee;
        border: none;
        cursor: pointer;
    }

    .flex-container button.active {
        background: #42b983;
        color: white;
    }
</style>