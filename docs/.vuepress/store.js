import Vue from 'vue';
import Vuex from 'vuex';
import Persist from 'vuex-persist';

// This is to allow jest tests to pass
const window = window || { localStorage: null };

const LocalPersist = new Persist({
    storage: window.localStorage,
});

export const state = {
    favorites: [],
};

export const mutations = {
    toggleFavorite({ favorites }, { title, path }) {
        const index = favorites.findIndex(it => it.path === path);
        if (index === -1) favorites.push({ title, path });
        else favorites.splice(index, 1);
    },
};

export const getters = {
    isFavorite: (state) => (it) => state.favorites.filter(t => t.title === it).length === 1,
};

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [LocalPersist.plugin],
    state,
    mutations,
    getters
});