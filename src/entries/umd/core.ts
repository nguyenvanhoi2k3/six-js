// UMD-only entry: a single default export so Rollup's UMD wrapper assigns the global directly
// (`window.six = <the six object>`), not nested under a wrapper global the way the ESM entries'
// named exports would be. Kept separate from src/index.ts (the ESM core entry) specifically so
// the ESM entry's own export shape (named `six`, plus core types) never has to compromise for
// this - see CLAUDE.md's Public API section for the full UMD-vs-ESM story.
export { six as default } from "../../api/six";
