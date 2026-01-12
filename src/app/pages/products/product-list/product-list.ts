import { afterNextRender, Component, NO_ERRORS_SCHEMA, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../service/ProductService';
import { Product } from '../../../../domain/product.model';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { environment } from '../../../../environments/environment.prod';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, InputTextModule, SelectModule,IconFieldModule,InputIconModule,MultiSelectModule],
  
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  products = signal<Product[]>([]);
  loading = false;

  inventoryStates = ['DISPONIBLE', 'BAJO_STOCK', 'AGOTADO'];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.getProductsAll();
  
  }

  get productList(): Product[] {
    return this.products();
  }

  getProductsAll(): void {
    this.loading = true;
    this.productService.getProductsData().subscribe((data) => {
      this.products.set(data);
      this.loading = false;
    });
  }

  getSeverity(state: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (state) {
      case 'DISPONIBLE':
        return 'success';
      case 'BAJO_STOCK':
        return 'warn';
      case 'AGOTADO':
        return 'danger';
      default:
        return 'info';
    }
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath?.trim()) {
      return '/assets/no-image.png';
    }
    const url = `${environment.apiUrl}${imagePath}`;
    return url;
  }

  onFileSelected(event: Event, product: Product) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];

  // Crear FormData para enviar al backend
  const formData = new FormData();
  formData.append('image', file);

  // Llamada al servicio que actualiza la imagen
  this.productService.uploadProductImage(product.id, formData).subscribe({
    next: (updatedProduct) => {
      this.getProductsAll();
    },
    error: (err) => {
      console.error('Error subiendo imagen', err);
    }
  });
}

}
