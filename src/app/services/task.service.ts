import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskStatusRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  create(request: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, request);
  }

  updateStatus(taskId: number, request: UpdateTaskStatusRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/status`, request);
  }
}
