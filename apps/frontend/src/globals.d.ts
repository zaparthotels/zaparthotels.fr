import type { ContrastManager } from "./managers/ContrastManager";
import type { FontManager } from "./managers/FontManager";
import type { ThemeManager } from "./managers/ThemeManager";

declare global {
	interface Window {
		themeManager: ThemeManager;
		fontManager: FontManager;
		contrastManager: ContrastManager;
	}
}
