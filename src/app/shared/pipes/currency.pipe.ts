import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe as NgCurrencyPipe } from '@angular/common';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: true
})
export class AppCurrencyPipe implements PipeTransform {
  private readonly currencyPipe = new NgCurrencyPipe('en-US');

  transform(
    value: number,
    currencyCode: string = 'USD',
    display: 'symbol' | 'code' | 'name' = 'symbol',
    digits: string = '1.2-2'
  ): string | null {
    return this.currencyPipe.transform(value, currencyCode, display, digits);
  }
}
