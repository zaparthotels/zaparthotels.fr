import { Injectable, Logger } from '@nestjs/common';
import { Liquid } from 'liquidjs';

@Injectable()
export class LiquidService extends Liquid {
  private readonly logger = new Logger(LiquidService.name);

  setLocale(locale: string): this {
    this.registerFilter('date_locale', (date: Date) => {
      return date.toLocaleDateString(locale);
    });

    return this;
  }
}
