import { state, mutations, getters } from '../docs/.vuepress/store';

describe('Store favorite articles', () => {

    const s  = {...state};
    it('Should support adding favorite articles', () => {

        mutations.toggleFavorite(s, {
            title: 'Some title',
            path: '/some-title'
        });

        mutations.toggleFavorite(s, {
            title: 'other',
            path: '/other'
        });

        expect(s.favorites.length).toBe(2);
    });

    it('Should support removing articles', () => {
        mutations.toggleFavorite(s, {
            title: 'Some title',
            path: '/some-title'
        });

        expect(s.favorites.length).toBe(1);
    });

    it('Should support saying if given title is favorite', () => {
        expect(getters.isFavorite(s)('other')).toBeTruthy();
        expect(getters.isFavorite(s)('Some title')).toBeFalsy();
    });
});