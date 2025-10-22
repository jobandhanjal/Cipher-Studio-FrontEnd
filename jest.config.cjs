module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-resizable-panels|@react-hook/intersection-observer|@react-hook/passive-layout-effect)/)',
  ],
};