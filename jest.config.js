module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tp-types/(.*)$': '<rootDir>/src/types/$1',
    '^@validators/(.*)$': '<rootDir>/src/validators/$1',
    '^@parser/(.*)$': '<rootDir>/src/parser/$1',
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
    '^@banks/(.*)$': '<rootDir>/src/banks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
}
