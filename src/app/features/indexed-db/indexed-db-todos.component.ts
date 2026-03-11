import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IndexedTodoService, type IndexedTodo } from '../../core/indexed-todo.service';
import { IndexedDbTodosChangeLogComponent } from './indexed-db-todos-change-log.component';

@Component({
  selector: 'app-indexed-db-todos',
  standalone: true,
  imports: [FormsModule, IndexedDbTodosChangeLogComponent],
  templateUrl: './indexed-db-todos.component.html',
  styleUrl: '../../app.css',
})
export class IndexedDbTodosComponent {
  private todoService = inject(IndexedTodoService);

  protected readonly newTitle = signal('');
  protected readonly editingId = signal<number | null>(null);
  protected readonly editTitle = signal('');

  protected get todos() {
    return this.todoService.todos();
  }
  protected get isReady() {
    return this.todoService.isReady();
  }
  protected get completedCount() {
    return this.todoService.completedCount();
  }
  protected get activeCount() {
    return this.todoService.activeCount();
  }

  protected async addTodo(): Promise<void> {
    const title = this.newTitle().trim();
    if (!title) return;
    await this.todoService.addTodo(title);
    this.newTitle.set('');
  }

  protected startEdit(todo: IndexedTodo): void {
    this.editingId.set(todo.id);
    this.editTitle.set(todo.title);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editTitle.set('');
  }

  protected async saveEdit(): Promise<void> {
    const id = this.editingId();
    if (id == null) return;
    const title = this.editTitle().trim();
    if (title) await this.todoService.updateTodo(id, { title });
    this.cancelEdit();
  }

  protected async toggle(todo: IndexedTodo): Promise<void> {
    await this.todoService.toggleCompleted(todo.id);
  }

  protected async remove(todo: IndexedTodo): Promise<void> {
    await this.todoService.deleteTodo(todo.id);
  }

  protected isEditing(id: number): boolean {
    return this.editingId() === id;
  }
}

