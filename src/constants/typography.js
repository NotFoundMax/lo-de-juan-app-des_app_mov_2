/**
 * @type {import('./typography').TypographyLevel}
 */

const typography = {
  display: ["32px", { lineHeight: "40px", fontWeight: "700" }],
  h1: ["28px", { lineHeight: "36px", fontWeight: "700" }],
  h2: ["24px", { lineHeight: "32px", fontWeight: "700" }],
  h3: ["20px", { lineHeight: "28px", fontWeight: "600" }],
  subtitle: ["18px", { lineHeight: "24px", fontWeight: "600" }],
  body: ["16px", { lineHeight: "22px", fontWeight: "400" }],
  "body-bold": ["16px", { lineHeight: "22px", fontWeight: "600" }],
  caption: ["14px", { lineHeight: "18px", fontWeight: "400" }],
  small: ["12px", { lineHeight: "16px", fontWeight: "400" }],
  label: ["14px", { lineHeight: "18px", fontWeight: "600" }],
};

module.exports = { typography };
