import {
  Component,
  inject,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import type { StorionChangeEvent } from 'storion';
import { IndexedTodoService } from '../../core/indexed-todo.service';

export interface IndexedLogEntry {
  message: string;
  response: StorionChangeEvent;
  time: string;
}

@Component({
  selector: 'app-indexed-db-todos-change-log',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './indexed-db-todos-change-log.component.html',
  styleUrl: './todos-change-log.component.css',
})
export class IndexedDbTodosChangeLogComponent implements OnDestroy {
  private todoService = inject(IndexedTodoService);
  private unsubscribe: (() => void) | null = null;

  protected readonly logEntries = signal<IndexedLogEntry[]>([]);

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
    const message = `todos (IndexedDB): ${event.type}${
      event.rowId != null ? ` (id=${event.rowId})` : ''
    }`;
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

