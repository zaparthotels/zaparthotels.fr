import { LocalStorageManager } from "./LocalStorageManager";

export enum Contrast {
	SYSTEM = "system",
	MORE = "more",
	LESS = "less",
}

export class ContrastManager {
	private readonly localStorageManager = new LocalStorageManager();
	static readonly LOCAL_STORAGE_KEY: string = "contrast";
	static readonly FALLBACK_CONTRAST: Contrast = Contrast.SYSTEM;
	static readonly DATA_NAME: string = "data-contrast";
	private contrast: Contrast;

	constructor() {
		this.contrast = this.determineInitialContrast();
		this.applyContrast();
	}

	/**
	 * Switches the contrast mode. If no contrast is provided, it retrieves the current setting from localStorage.
	 * If a valid contrast is provided, it sets it as the new contrast mode.
	 */
	public switch(contrast?: Contrast): this {
		let resolvedContrast = contrast;

		if (!resolvedContrast) {
			resolvedContrast = this.localStorageManager.getItem<Contrast>(
				ContrastManager.LOCAL_STORAGE_KEY,
			);
		}

		this.contrast = resolvedContrast ?? ContrastManager.FALLBACK_CONTRAST;

		this.applyContrast();
		return this;
	}

	/**
	 * Retrieves the current contrast setting.
	 */
	public getContrast(): Contrast {
		return this.contrast;
	}

	/**
	 * Sets the default contrast value in localStorage.
	 * This method ensures the contrast preference is saved for future visits.
	 */
	private setDefault(contrast: Contrast): this {
		this.localStorageManager.setItem<Contrast>(
			ContrastManager.LOCAL_STORAGE_KEY,
			contrast,
		);

		return this;
	}

	/**
	 * Applies the active contrast to the root element of the document.
	 * This updates the `data-contrast` attribute with the current contrast setting.
	 */
	private applyContrast(): this {
		const effectiveContrast = this.getEffectiveContrast();
		document.documentElement.setAttribute(
			ContrastManager.DATA_NAME,
			effectiveContrast,
		);

		return this;
	}

	/**
	 * Determines the initial contrast setting.
	 * This method checks localStorage first, and if no value is found, defaults to the fallback contrast.
	 */
	private determineInitialContrast(): Contrast {
		const storedContrast = this.localStorageManager.getItem<Contrast>(
			ContrastManager.LOCAL_STORAGE_KEY,
		);
		if (storedContrast) {
			return storedContrast;
		}

		this.setDefault(ContrastManager.FALLBACK_CONTRAST);

		return ContrastManager.FALLBACK_CONTRAST;
	}

	/**
	 * Retrieves the effective contrast value.
	 * If the system is set to "system" mode, it checks for the system's preferred contrast.
	 * It adjusts between "more", "less", or keeps it at the default system setting.
	 */
	private getEffectiveContrast(): Contrast {
		if (this.contrast === Contrast.SYSTEM) {
			const prefersMoreContrast = window.matchMedia(
				"(prefers-contrast: more)",
			).matches;
			const prefersLessContrast = window.matchMedia(
				"(prefers-contrast: less)",
			).matches;

			if (prefersMoreContrast) {
				return Contrast.MORE;
			}

			if (prefersLessContrast) {
				return Contrast.LESS;
			}

			return Contrast.SYSTEM;
		}

		return this.contrast;
	}
}
