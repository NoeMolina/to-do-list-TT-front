import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { UserSummary } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Subtask } from '../../models/subtask.model';
import { SubtaskService } from '../../services/subtask.service';
import {
  BoardColumn,
  NEXT_STATUSES,
  STATUS_BUTTON_CLASSES,
  STATUS_LABELS,
  STATUS_SEVERITY,
} from './utils';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TagModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  readonly fb = inject(FormBuilder);
  readonly taskService = inject(TaskService);
  readonly subtaskService = inject(SubtaskService);
  readonly categoryService = inject(CategoryService);
  readonly messageService = inject(MessageService);
  readonly authService = inject(AuthService);
  readonly userService = inject(UserService);

  //for subtask handling
  readonly subtaskDialogVisible = signal(false);
  readonly selectedTask = signal<Task | null>(null);
  readonly subtasks = signal<Subtask[]>([]);
  readonly subtasksLoading = signal(false);
  readonly savingSubtask = signal(false);
  readonly tasks = signal<Task[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  readonly users = signal<UserSummary[]>([]);

  readonly columns = computed<BoardColumn[]>(() => {
    const all = this.tasks();
    return [
      {
        key: 'PENDIENTE',
        title: 'Pendientes',
        tasks: all.filter((t) => t.status.code === 'PENDIENTE'),
      },
      {
        key: 'EN_PROGRESO',
        title: 'En progreso',
        tasks: all.filter((t) => t.status.code === 'EN_PROGRESO'),
      },
      {
        key: 'FINALIZADAS',
        title: 'Finalizadas',
        tasks: all.filter((t) => t.status.code === 'COMPLETADO' || t.status.code === 'CANCELADO'),
      },
    ];
  });

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    dueDate: [null as Date | null],
    categoryId: [null as number | null, [Validators.required]],
    userId: [null as number | null],
  });

  readonly subtaskForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
  }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las tareas',
        });
      },
    });
  }

  loadCategories(): void {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadUsers(): void {
    this.userService.list().subscribe({
      next: (users) => this.users.set(users),
    });
  }

  openCreateDialog(): void {
    this.form.reset();
    this.dialogVisible.set(true);
  }

  submitCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const { title, description, dueDate, categoryId, userId } = this.form.getRawValue();

    this.taskService
      .create({
        title: title!,
        description: description ?? undefined,
        dueDate: dueDate ? this.toIsoDate(dueDate) : undefined,
        categoryId: categoryId!,
        userId: userId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.dialogVisible.set(false);
          this.loadTasks();
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea creada',
            detail: 'La tarea se creó correctamente',
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message ?? 'No se pudo crear la tarea',
          });
        },
      });
  }

  changeStatus(task: Task, newStatus: string): void {
    this.taskService.updateStatus(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.loadTasks();
        this.messageService.add({
          severity: 'success',
          summary: 'Estatus actualizado',
          detail: `La tarea ahora está en ${this.statusLabel(newStatus)}`,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'No se pudo actualizar el estatus',
        });
      },
    });
  }

  // subtask section
  openSubtasks(task: Task): void {
    this.selectedTask.set(task);
    this.subtaskForm.reset();
    this.subtaskDialogVisible.set(true);
    this.loadSubtasks(task.id);
  }

  loadSubtasks(taskId: number): void {
    this.subtasksLoading.set(true);
    this.subtaskService.listByTask(taskId).subscribe({
      next: (subtasks) => {
        this.subtasks.set(subtasks);
        this.subtasksLoading.set(false);
      },
      error: () => {
        this.subtasksLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las subtareas',
        });
      },
    });
  }

  submitCreateSubtask(): void {
    const task = this.selectedTask();
    if (!task || this.subtaskForm.invalid) {
      this.subtaskForm.markAllAsTouched();
      return;
    }

    this.savingSubtask.set(true);
    const { title, description } = this.subtaskForm.getRawValue();

    this.subtaskService
      .create({
        taskId: task.id,
        title: title!,
        description: description ?? undefined,
      })
      .subscribe({
        next: () => {
          this.savingSubtask.set(false);
          this.subtaskForm.reset();
          this.loadSubtasks(task.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Subtarea creada',
            detail: 'La subtarea se creó correctamente',
          });
        },
        error: (err) => {
          this.savingSubtask.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message ?? 'No se pudo crear la subtarea',
          });
        },
      });
  }

  changeSubtaskStatus(subtask: Subtask, newStatus: string): void {
    this.subtaskService.updateStatus(subtask.id, { status: newStatus }).subscribe({
      next: () => {
        const task = this.selectedTask();
        if (task) this.loadSubtasks(task.id);
        this.loadTasks(); // por si la tarea padre cambia de estatus por validación/cascada
        this.messageService.add({
          severity: 'success',
          summary: 'Estatus actualizado',
          detail: `Subtarea ahora en ${this.statusLabel(newStatus)}`,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'No se pudo actualizar el estatus',
        });
      },
    });
  }

  //util methods section
  nextStatuses(currentCode: string): string[] {
    return NEXT_STATUSES[currentCode] ?? [];
  }

  statusLabel(code: string): string {
    return STATUS_LABELS[code] ?? code;
  }

  statusSeverity(code: string): 'info' | 'warn' | 'success' | 'danger' {
    return STATUS_SEVERITY[code] ?? 'info';
  }

  statusButtonClass(code: string): string {
    const severity = this.statusSeverity(code);
    return STATUS_BUTTON_CLASSES[severity] ?? 'text-xs';
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  usernameFor(userId: number): string {
    return this.users().find((u) => u.id === userId)?.username ?? `Usuario #${userId}`;
  }

  isOwnTask(task: Task): boolean {
    return task.userId === this.authService.userId();
  }
}
