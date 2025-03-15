import type { TLanguage } from '@zaparthotels/types';
import { DirectusService } from '../services/DirectusService';
import { LocalStorageManager } from './LocalStorageManager';

export class LocaleManager {
  private localStorageManager = new LocalStorageManager();
  private directusService = new DirectusService();

  static readonly LOCAL_STORAGE_KEY = 'locale';
  static readonly FALLBACK_LOCALE: TLanguage = {
    code: 'fr-FR',
    name: 'Français',
    direction: 'ltr',
  };

  private locale: TLanguage = LocaleManager.FALLBACK_LOCALE;
  private supportedLocales: TLanguage[] = [LocaleManager.FALLBACK_LOCALE];

  constructor() {
    this.init();
  }

  /**
   * Change the active language.
   * If `localeCode` is `system`, switch to system mode.
   * Otherwise, apply the specified language if supported.
   */
  public async switch(localeCode?: string): Promise<void> {
    if (localeCode === 'system') {
      this.setDefaultLocale('system');
      this.locale = this.getSystemLocale() || LocaleManager.FALLBACK_LOCALE;
    } else if (localeCode) {
      const newLocale = this.supportedLocales.find(
        (locale) => locale.code === localeCode,
      );
      if (newLocale) {
        this.setDefaultLocale(localeCode);
        this.locale = newLocale;
      } else {
        console.warn(`Locale "${localeCode}" not supported. Falling back.`);
        this.locale = LocaleManager.FALLBACK_LOCALE;
      }
    } else {
      console.warn('Locale not specified. Falling back to default.');
      this.locale = LocaleManager.FALLBACK_LOCALE;
    }

    this.applyLocale();
  }

  /**
   * Retrieves the currently active language.
   */
  public getLocale(): TLanguage {
    return this.locale;
  }

  /**
   * Initializes the active language based on localStorage or the system.
   * If the locale in localStorage is incompatible, it will be replaced by "system".
   */
  private async init(): Promise<void> {
    try {
      this.supportedLocales = await this.directusService.getLanguages();
    } catch {
      console.warn('Using fallback locale due to error fetching locales.');
    }

    const storedLocaleCode = this.localStorageManager.getItem<string>(
      LocaleManager.LOCAL_STORAGE_KEY,
    );

    if (storedLocaleCode) {
      if (storedLocaleCode === 'system') {
        this.locale = this.getSystemLocale() || LocaleManager.FALLBACK_LOCALE;
      } else {
        const storedLocale = this.supportedLocales.find(
          (locale) => locale.code === storedLocaleCode,
        );
        if (storedLocale) {
          this.locale = storedLocale;
        } else {
          console.warn(
            `Stored locale "${storedLocaleCode}" is not supported. Reverting to system locale.`,
          );
          this.setDefaultLocale('system');
          this.locale = this.getSystemLocale() || LocaleManager.FALLBACK_LOCALE;
        }
      }
    } else {
      this.setDefaultLocale('system');
      this.locale = this.getSystemLocale() || LocaleManager.FALLBACK_LOCALE;
    }

    this.applyLocale();
  }

  /**
   * Sets the default value in localStorage.
   * If the value is "system", it is applied automatically.
   */
  private setDefaultLocale(localeCode: string): void {
    this.localStorageManager.setItem(
      LocaleManager.LOCAL_STORAGE_KEY,
      localeCode,
    );
  }

  /**
   * Applies the active language to the root element of the document.
   */
  private applyLocale(): void {
    document.documentElement.lang = this.locale.code;
    document.documentElement.dir = this.locale.direction;
  }

  /**
   * Retrieves the system's language.
   */
  private getSystemLocale(): TLanguage | undefined {
    const navigatorLanguages = navigator.languages || [navigator.language];

    for (const lang of navigatorLanguages) {
      const baseLang = lang.split('-')[0];

      const exactMatch = this.supportedLocales.find((locale) =>
        locale.code.startsWith(baseLang),
      );
      if (exactMatch) return exactMatch;

      const closeMatch = this.supportedLocales.find(
        (locale) => locale.code.slice(0, 2) === baseLang.slice(0, 2),
      );
      if (closeMatch) return closeMatch;
    }

    return undefined;
  }
}
