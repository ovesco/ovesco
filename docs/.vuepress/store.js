import Vue from 'vue';
import Vuex from 'vuex';
import Persist from 'vuex-persist';

const plugins = [];

if (typeof process === 'undefined') {
    const LocalPersist = new Persist({
        storage: window.localStorage,
    });
    plugins.push(LocalPersist.plugin);
}

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
    plugins,
    state,
    mutations,
    getters
});