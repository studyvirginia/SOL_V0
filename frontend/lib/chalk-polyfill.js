// Chalk polyfill to prevent ESM/CJS require crashes in transitive dependencies (like E2B)
const chalk = {
  blue: (t) => t,
  red: (t) => t,
  green: (t) => t,
  yellow: (t) => t,
  cyan: (t) => t,
  magenta: (t) => t,
  white: (t) => t,
  gray: (t) => t,
  black: (t) => t,
  bold: (t) => t,
  italic: (t) => t,
  underline: (t) => t,
  hex: () => chalk,
  rgb: () => chalk,
  bgBlue: (t) => t,
  bgRed: (t) => t,
  bgGreen: (t) => t,
  level: 0,
};

// CommonJS export to satisfy 'require' calls
module.exports = chalk;
module.exports.default = chalk;
