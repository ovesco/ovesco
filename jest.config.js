module.exports = {
    transform: {'^.+\\.js?$': 'babel-jest'},
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(js|jsx)$',
    moduleFileExtensions: ['js', 'jsx', 'json', 'node']
};