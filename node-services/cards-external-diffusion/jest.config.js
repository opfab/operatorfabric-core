module.exports = {
    preset: 'ts-jest',
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts}',
        '!src/tests/**/*.{js,ts}', // Exclude test directory
        '!src/domain/server-side/**/*.{js,ts}', // Exclude server-side directory that is tested via integration tests
        '!src/cardsExternalDiffusion.ts' // Exclude cards external diffusion entry point that is tested via integration tests
    ],
    testEnvironment: 'node'
};
