# How to use style-dictionary?

First, go to your Design System in Figma.
Then, open the plugin [TokensBrücke](https://www.figma.com/community/plugin/1254538877056388290/tokensbrucke).

There is now a window with some configs to do :
- Set color mode to `HEX`
- ❌ Disable all styles
- ❌ Disable `variable scopes`
- ✅ Enable `Use DTCG`
- ❌ Disable `.value`

Then, you can export a JSON file. Rename it `design-tokens.tokens.json`, and place it inside `/tools/style-dictionary/tokens` (override the exisiting one).

Then, open your terminal, and go to the `style-dictionary` folder.
Run `pnpm run build`.