import { LocalStorageManager } from "./LocalStorageManager";

export enum Font {
	OPENDYSLEXIC = "OpenDyslexic",
	DEFAULT = "default",
}

export class FontManager {
	private readonly localStorageManager = new LocalStorageManager();
	static readonly LOCAL_STORAGE_KEY: string = "font";
	static readonly FALLBACK_FONT: Font = Font.DEFAULT;
	static readonly DATA_NAME: string = "data-font";
	private font: Font;

	constructor() {
		this.font = this.determineInitialFont();
		this.applyFont();
	}

	/**
	 * Switches the font. If no font is provided, it retrieves the current setting from localStorage.
	 * If a valid font is provided, it sets it as the new font.
	 */
	public switch(font?: Font): this {
		let resolvedFont = font;

		if (!resolvedFont) {
			resolvedFont = this.localStorageManager.getItem<Font>(
				FontManager.LOCAL_STORAGE_KEY,
			);
		}

		this.font = resolvedFont ?? FontManager.FALLBACK_FONT;

		this.applyFont();
		return this;
	}

	/**
	 * Retrieves the current font setting.
	 */
	public getFont(): Font {
		return this.font;
	}

	/**
	 * Sets the default font value in localStorage.
	 * This method ensures the font preference is saved for future visits.
	 */
	private setDefault(font: Font): this {
		this.localStorageManager.setItem<Font>(FontManager.LOCAL_STORAGE_KEY, font);

		return this;
	}

	/**
	 * Applies the active font to the root element of the document.
	 * This updates the `data-font` attribute with the current font setting.
	 */
	private applyFont(): this {
		document.documentElement.setAttribute(FontManager.DATA_NAME, this.font);

		return this;
	}

	/**
	 * Determines the initial font setting.
	 * This method checks localStorage first, and if no value is found, defaults to the fallback font.
	 */
	private determineInitialFont(): Font {
		const storedFont = this.localStorageManager.getItem<Font>(
			FontManager.LOCAL_STORAGE_KEY,
		);
		if (storedFont) {
			return storedFont;
		}

		this.setDefault(Font.DEFAULT);

		return FontManager.FALLBACK_FONT;
	}
}
