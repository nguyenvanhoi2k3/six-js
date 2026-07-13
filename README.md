# @six-js/core

A lightweight core library for Six JS components.

---

## 📦 Installation

```bash
npm install @six-js/core
```

```bash
yarn add @six-js/core
```

```bash
pnpm add @six-js/core
```

The package ships ESM (`import`) and UMD (`require`) builds plus type declarations — no extra setup needed for either bundlers or a plain `<script>` tag.

## 🚀 Usage

```js
import "@six-js/core/style.css";
import { six } from "@six-js/core";

six.initElements();

six.to(".box", { x: 100, duration: 1 });
```

### Plugins

Plugins live at their own subpath so bundlers only include them when you actually import them:

```js
import { splitText } from "@six-js/core/split-text";

splitText(".title", { type: "chars,words,lines" });
```
