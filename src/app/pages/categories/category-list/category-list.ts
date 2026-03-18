import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

import { Category } from '../../../../domain/category.model';
import { CategoryService } from '../../../../service/CategoryService';

@Component({
  standalone: true,
  selector: 'app-category-list',
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss'],
  imports: [CommonModule, TableModule, ToastModule, InputTextModule],
  providers: [MessageService],
})
export class CategoryList implements OnInit {
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);

  categories = signal<Category[]>([]);
  loading = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  get categoryList(): Category[] {
    return this.categories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las categorías',
        });
      },
    });
  }
}

