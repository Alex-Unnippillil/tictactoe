module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests/unit"],
  collectCoverageFrom: [
    "site/js/**/*.js",
    "!site/js/**/?(*.)+(spec|test).[jt]s",
    "!site/js/**/__tests__/**",
  ],
  passWithNoTests: true,
};
