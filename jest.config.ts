// // jest.config.js or jest.config.ts
// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "jsdom",
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Create this file for any setup
// };

import type {Config} from 'jest';

export default async (): Promise<Config> => {
  return {
    verbose: true,
  };
};
