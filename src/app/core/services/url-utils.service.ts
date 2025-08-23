import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlUtilsService {
  cleanUrl(url: string): string {
    return url.split('?')[0];
  }
}
