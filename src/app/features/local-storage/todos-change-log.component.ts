import {
  Component,
  inject,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import type { StorionChangeEvent } from 'storion';
import { TodoService } from '../../core/todo.service';

export interface LogEntry {
  message: string;
  response: StorionChangeEvent;
  time: string;
}

@Component({
  selector: 'app-todos-change-log',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './todos-change-log.component.html',
  styleUrl: './todos-change-log.component.css',
})
export class TodosChangeLogComponent implements OnDestroy {
  private todoService = inject(TodoService);
  private unsubscribe: (() => void) | null = null;

  protected readonly logEntries = signal<LogEntry[]>([]);

  constructor() {
    effect(() => {
      if (!this.todoService.isReady()) return;
      this.unsubscribe = this.todoService.subscribeToTodosTable((event) =>
        this.addEntry(event)
      );
      return () => {
        this.unsubscribe?.();
        this.unsubscribe = null;
      };
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  private addEntry(event: StorionChangeEvent): void {
    const message = `todos: ${event.type}${event.rowId != null ? ` (id=${event.rowId})` : ''}`;
    this.logEntries.update((entries) => [
      ...entries,
      {
        message,
        response: event,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }
}

