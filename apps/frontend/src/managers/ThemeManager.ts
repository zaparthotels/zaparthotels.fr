import { LocalStorageManager } from "./LocalStorageManager";

export enum Theme {
	LIGHT = "light",
	DARK = "dark",
	SYSTEM = "system",
}

export class ThemeManager {
	private readonly localStorageManager = new LocalStorageManager();
	static readonly LOCAL_STORAGE_KEY: string = "theme";
	static readonly FALLBACK_THEME: Theme = Theme.LIGHT;
	static readonly DATA_NAME: string = "data-theme";
	private theme: Theme;

	constructor() {
		this.theme = this.determineInitialTheme();
		this.applyTheme();
	}

	/**
	 * Switches the theme. If no theme is provided, it retrieves the current setting from localStorage.
	 * If a valid theme is provided, it sets it as the new theme.
	 */
	public switch(theme?: Theme): this {
		let resolvedTheme = theme;

		if (!resolvedTheme) {
			resolvedTheme = this.localStorageManager.getItem<Theme>(
				ThemeManager.LOCAL_STORAGE_KEY,
			);
		}

		this.theme = resolvedTheme ?? ThemeManager.FALLBACK_THEME;

		this.applyTheme();
		return this;
	}

	/**
	 * Retrieves the current theme setting.
	 */
	public getTheme(): Theme {
		return this.theme;
	}

	/**
	 * Sets the default theme value in localStorage.
	 * This method ensures the theme preference is saved for future visits.
	 */
	private setDefault(theme: Theme): this {
		this.localStorageManager.setItem<Theme>(
			ThemeManager.LOCAL_STORAGE_KEY,
			theme,
		);

		return this;
	}

	/**
	 * Applies the active theme to the root element of the document.
	 * This updates the `data-theme` attribute with the current theme setting.
	 */
	private applyTheme(): this {
		const effectiveTheme = this.getEffectiveTheme();
		document.documentElement.setAttribute(
			ThemeManager.DATA_NAME,
			effectiveTheme,
		);

		return this;
	}

	/**
	 * Determines the initial theme setting.
	 * This method checks localStorage first, and if no value is found, defaults to the system theme.
	 */
	private getEffectiveTheme(): Theme {
		if (this.theme === Theme.SYSTEM) {
			const prefersDarkScheme = window.matchMedia?.(
				"(prefers-color-scheme: dark)",
			).matches;

			return prefersDarkScheme ? Theme.DARK : Theme.LIGHT;
		}

		return this.theme;
	}

	/**
	 * Retrieves the effective theme value.
	 * If the system is set to "system" mode, it checks for the system's preferred theme.
	 * It adjusts between "dark" or "light" based on the user's system preference.
	 */
	private determineInitialTheme(): Theme {
		const storedTheme = this.localStorageManager.getItem<Theme>(
			ThemeManager.LOCAL_STORAGE_KEY,
		);
		if (storedTheme) {
			return storedTheme;
		}

		this.setDefault(Theme.SYSTEM);

		return Theme.SYSTEM;
	}
}
