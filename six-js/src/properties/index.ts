// src/properties/index.ts
// Import file này 1 lần ở entry (six.ts) để đảm bảo mọi property handler được đăng ký.
import "./transform";
import "./css-numeric";
import "./color-props";
import "./discrete-props";
import "./complex-props";

export * from "./registry";