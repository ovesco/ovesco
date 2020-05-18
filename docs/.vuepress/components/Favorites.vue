<template>
    <div>
        <h2>Your watchlist</h2>
        <div v-if="$store.state.favorites.length === 0">
            <p>You currently have no favorite article. You can add some
            by clicking the <i>&hearts;</i> button on an article</p>
        </div>
        <ul>
            <li v-for="item in $store.state.favorites" :key="item.name">
                <favorite-item :to="item" />
            </li>
        </ul>
    </div>
</template>