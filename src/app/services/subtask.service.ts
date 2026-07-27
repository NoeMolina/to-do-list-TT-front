import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Subtask, CreateSubtaskRequest } from '../models/subtask.model';
import { UpdateTaskStatusRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class SubtaskService {
  private readonly apiUrl = `${environment.apiUrl}/subtasks`;

  constructor(private http: HttpClient) {}

  listByTask(taskId: number): Observable<Subtask[]> {
    return this.http.get<Subtask[]>(`${this.apiUrl}/task/${taskId}`);
  }

  create(request: CreateSubtaskRequest): Observable<Subtask> {
    return this.http.post<Subtask>(this.apiUrl, request);
  }

  updateStatus(subtaskId: number, request: UpdateTaskStatusRequest): Observable<Subtask> {
    return this.http.patch<Subtask>(`${this.apiUrl}/${subtaskId}/status`, request);
  }
}