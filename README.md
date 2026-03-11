## Angular + Storion

Integrate the `@storion/storion` client‑side database with an Angular application.

---

### Installation

```bash
npm install @storion/storion
```

---

### Basic usage in Angular

Create an injectable service that wraps Storion’s `createDatabase` and exposes database methods to your components.

```ts
// storion-db.service.ts
import { Injectable } from '@angular/core';
import { createDatabase } from '@storion/storion';

@Injectable({ providedIn: 'root' })
export class StorionDbService {
  private dbPromise = createDatabase({
    name: 'angular-demo',
    storage: 'localStorage',
  });

  async getDb() {
    return this.dbPromise;
  }
}
```

Use the service inside a component to create a table and query data:

```ts
// todos.component.ts
import { Component, OnInit } from '@angular/core';
import { StorionDbService } from './storion-db.service';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

@Component({
  selector: 'app-todos',
  template: `
    <h2>Todos</h2>
    <button (click)="addTodo()">Add todo</button>
    <ul>
      <li *ngFor="let t of todos">
        {{ t.title }} {{ t.done ? '✅' : '⬜️' }}
      </li>
    </ul>
  `,
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];

  constructor(private storion: StorionDbService) {}

  async ngOnInit() {
    const db = await this.storion.getDb();

    await db.createTable('todos', [
      { name: 'id', type: 'int' },
      { name: 'title', type: 'string' },
      { name: 'done', type: 'boolean' },
    ]);

    this.todos = await db.fetch('todos');
  }

  async addTodo() {
    const db = await this.storion.getDb();
    await db.insert('todos', { title: 'New todo', done: false });
    this.todos = await db.fetch('todos');
  }
}
```

---

### Angular + Storion patterns

- **Service per app**: wrap the `Database` instance in a singleton Angular service.
- **Change subscriptions**: use `db.subscribe('todos', handler)` inside the service and expose an RxJS `BehaviorSubject`/`Observable` to components.
- **Config‑driven schema**: load schema from a JSON config (for example via HTTP) and pass it to `createDatabase({ name, storage, config })`.

For full API details, see the main Storion docs.
