import { Injectable, signal, computed } from '@angular/core';
import { createDatabase } from 'storion';
import type { Database, StorionChangeEvent } from 'storion';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const TABLE_NAME = 'todos';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private db: Database | null = null;
  private todosSignal = signal<Todo[]>([]);
  private ready = signal(false);

  readonly todos = this.todosSignal.asReadonly();
  readonly isReady = this.ready.asReadonly();
  readonly completedCount = computed(() =>
    this.todosSignal().filter((t) => t.completed).length
  );
  readonly activeCount = computed(() =>
    this.todosSignal().filter((t) => !t.completed).length
  );

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const db = await createDatabase({
        name: 'angular-storion-todos',
        storage: 'localStorage',
      });
      this.db = db;

      const tables = await db.listTables();
      if (!tables.includes(TABLE_NAME)) {
        await db.createTable(TABLE_NAME, [
          { name: 'id', type: 'int' },
          { name: 'title', type: 'string' },
          { name: 'completed', type: 'boolean' },
        ]);
      }

      await this.refresh();
      // Subscribe so any component (or this one) that mutates todos triggers a refresh
      this.db.subscribe(TABLE_NAME, () => this.refresh());
    } catch (err) {
      console.error('Storion init failed', err);
    } finally {
      this.ready.set(true);
    }
  }

  private async refresh(): Promise<void> {
    if (!this.db) return;
    const { rows } = await this.db.query(TABLE_NAME, {
      orderBy: [{ field: 'id', direction: 'asc' }],
    });
    this.todosSignal.set((rows as unknown as Todo[]).slice());
  }

  async addTodo(title: string): Promise<void> {
    if (!this.db || !title.trim()) return;
    await this.db.insert(TABLE_NAME, {
      title: title.trim(),
      completed: false,
    });
    // refresh() is triggered by subscription
  }

  async updateTodo(
    id: number,
    patch: Partial<Pick<Todo, 'title' | 'completed'>>
  ): Promise<void> {
    if (!this.db) return;
    await this.db.update(TABLE_NAME, id, patch);
    // refresh() is triggered by subscription
  }

  async deleteTodo(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.delete(TABLE_NAME, id);
    // refresh() is triggered by subscription
  }

  async toggleCompleted(id: number): Promise<void> {
    const todo = this.todosSignal().find((t) => t.id === id);
    if (todo) await this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * Subscribe to todos table change events. Returns an unsubscribe function.
   * Call only when isReady() is true.
   */
  subscribeToTodosTable(callback: (event: StorionChangeEvent) => void): () => void {
    if (!this.db) return () => {};
    return this.db.subscribe(TABLE_NAME, callback);
  }
}

