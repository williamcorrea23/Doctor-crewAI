module.exports = {
  // Run Prettier on all supported files
  '*.{js,jsx,ts,tsx,json,css,md,html,yml,yaml}': ['prettier --write'],
  
  // Run ESLint on JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
}
