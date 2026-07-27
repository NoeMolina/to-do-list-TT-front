import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Status } from '../models/status.model';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly apiUrl = `${environment.apiUrl}/statuses`;

  constructor(private http: HttpClient) {}

  list(): Observable<Status[]> {
    return this.http.get<Status[]>(this.apiUrl);
  }
}
