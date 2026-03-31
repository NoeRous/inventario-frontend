import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductSaleService } from '../../../../service/ProductSaleService';
import { DialogModule } from 'primeng/dialog';
import { environment } from '../../../../environments/environment.prod';

interface Sale {
  id: string;
  date: string;
  type: string;
  customer?: {
    id: string;
    fullName: string;
    phone: string;
    active: boolean;
  } | null;
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  active: boolean;
}

export interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productDetail: ProductDetail;
}

export interface ProductDetail {
  productId: string;
  id: string;
  size: string;
  color: string;
  warehouse: string;
  stock: number;
  product: Product;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  inventoryState: string;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
}

@Component({
  standalone: true,
  selector: 'app-sale-list',
  templateUrl: './sale.html',
  styleUrls: ['./sale.scss'],
  imports: [CommonModule, TableModule, TagModule, ButtonModule, ToastModule, ConfirmDialogModule,DialogModule],
  providers: [MessageService, ConfirmationService],
})
export class SaleList implements OnInit {
  private saleService = inject(ProductSaleService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  sales = signal<Sale[]>([]);
  loading = false;
  loadingItems = false;
  itemsDialog = false;

  selectedSale = signal<Sale | null>(null);
  saleItems = signal<SaleItem[]>([]);


  ngOnInit(): void {
    this.loadSales();
  }

  get saleList(): Sale[] {
    return this.sales();
  }

  loadSales(): void {
    this.loading = true;
    this.saleService.getSales().subscribe({
      next: (data) => {
        this.sales.set(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas',
        });
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'pagado':
        return 'success';
      case 'pending':
      case 'pendiente':
        return 'warn';
      case 'canceled':
      case 'cancelado':
        return 'danger';
      default:
        return 'info';
    }
  }

  confirmViewSale(event: Event, sale: Sale) {
    // placeholder para futura ampliación (ver detalle de venta, imprimir, etc.)
    event.stopPropagation();
    this.messageService.add({
      severity: 'info',
      summary: 'Venta',
      detail: `Venta #${sale.id.slice(0, 8)} seleccionada`,
    });
  }

  onSelectSale(event: any): void {
    const sale = event;
    this.selectedSale.set(sale);
    this.itemsDialog = true;
  
    if (sale?.id) {
      this.loadItems(sale.id);
    }
  }

  loadItems(saleId:string): void {
    this.loadingItems = true;
    this.saleService.getSaleItems(saleId).subscribe({
      next: (data) => {
        this.saleItems.set(data);
        this.loadingItems = false;
      },
      error: () => {
        this.loadingItems = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas',
        });
      },
    });
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath || !imagePath.trim()) {
      return '/assets/no-image.png';
    }
  
    //  Si ya es URL completa (Cloudinary)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
  
    // Si es ruta local (/uploads)
    return `${environment.apiUrl}${imagePath}`;
  }
}

