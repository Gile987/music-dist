import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  toInputValue(dateString: string): string {
    const date: Date = new Date(dateString);
    const y: number = date.getFullYear();
    const m: string = `${date.getMonth() + 1}`.padStart(2, '0');
    const day: string = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
