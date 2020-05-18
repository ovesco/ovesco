<template>
    <div>
        <h2>Your watchlist</h2>
        <div>
            <p>You currently have {{ $store.state.favorites.length }} favorite article. You can add some
            by clicking the <i>&hearts;</i> button on an article</p>
        </div>
        <ul>
            <li v-for="item in $store.state.favorites" :key="item.name">
                <favorite-item :to="item" />
            </li>
        </ul>
    </div>
</template>