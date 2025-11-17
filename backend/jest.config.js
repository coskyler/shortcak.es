// jest.config.js
module.exports = {
    // Use the ts-jest preset
    preset: 'ts-jest',

    // Set the test environment to node
    testEnvironment: 'node',

    // Explicitly tell Jest to use ts-jest for ts/tsx files
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },

    // (The rest of your config)
    clearMocks: true,
    moduleNameMapper: {
        '^firebase-admin$': '<rootDir>/__mocks__/firebase-admin.js',
        '^./serviceAccountKey.json$': '<rootDir>/__mocks__/serviceAccountKey.json',
    },
};