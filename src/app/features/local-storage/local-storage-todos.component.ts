import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService, type Todo } from '../../core/todo.service';
import { TodosChangeLogComponent } from './todos-change-log.component';

@Component({
  selector: 'app-local-storage-todos',
  standalone: true,
  imports: [FormsModule, TodosChangeLogComponent],
  templateUrl: './local-storage-todos.component.html',
  styleUrl: '../../app.css',
})
export class LocalStorageTodosComponent {
  private todoService = inject(TodoService);

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

  protected startEdit(todo: Todo): void {
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

  protected async toggle(todo: Todo): Promise<void> {
    await this.todoService.toggleCompleted(todo.id);
  }

  protected async remove(todo: Todo): Promise<void> {
    await this.todoService.deleteTodo(todo.id);
  }

  protected isEditing(id: number): boolean {
    return this.editingId() === id;
  }
}

