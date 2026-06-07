import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private Http: HttpClient) { }

  public get<K = any>(url: string) {
    return this.Http.get<K>(url);
  }
}
