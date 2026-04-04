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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

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

  observation: string;
  soldBy: string;
  deliveredBy: string;
  sellerProfit: number;
  deliveryProfit: number;
  divinaProfit: number | null;
  soldPaid: boolean;
  deliveryPaid: boolean;
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
  imports: [CommonModule,InputTextModule,InputNumberModule,ReactiveFormsModule,CheckboxModule, TextareaModule, TableModule, TagModule, ButtonModule, ToastModule, ConfirmDialogModule,DialogModule],
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
  saleDetailForm!: FormGroup;
  isSaleDetailsVisible = signal(false);

  ngOnInit(): void {
    this.loadSales();
  }

  constructor(
    private fb: FormBuilder,
  ) {
      this.saleDetailForm = this.fb.group({
      observation: [''],
      sold_by: [''],
      seller_profit: [0],
      sold_paid: [false],
      delivered_by: [''],
      delivery_profit: [0],
      delivery_paid: [false]
    });
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

  editSaleDetail(sale: Sale) {
    this.saleDetailForm.patchValue({
      observation: sale.observation,
      sold_by: sale.soldBy,
      seller_profit: sale.sellerProfit,
      sold_paid: sale.soldPaid,
      delivered_by: sale.deliveredBy,
      delivery_profit: sale.deliveryProfit,
      delivery_paid: sale.deliveryPaid
    });

    this.selectedSale.set(sale);
    this.isSaleDetailsVisible.set(true);
  }

  saveSaleDetailEdit() {
   const selectedSale = this.selectedSale();

  if (!selectedSale) return;


  const detail = this.saleDetailForm.getRawValue();

  const payload = {
    observation: detail.observation,
    soldBy: detail.sold_by,
    sellerProfit: detail.seller_profit,
    soldPaid: detail.sold_paid,
    deliveredBy: detail.delivered_by,
    deliveryProfit: detail.delivery_profit,
    deliveryPaid: detail.delivery_paid
  };

  this.saleService.updateSaleDetail(selectedSale.id, payload).subscribe({
    next: (updatedSale) => {
      this.isSaleDetailsVisible.set(false);
      this.saleDetailForm.reset();
      this.selectedSale.set(null);
      this.loadSales();

      this.messageService.add({
          severity: 'success',
          summary: `Detalles actualizados`,
          detail: `La venta se ha actualizado correctamente`,
      });

    },
    error: (error) => {
       this.messageService.add({
          severity: 'error',
          summary: `Error al actualizar detalles`,
          detail: error.error?.message ?? `Error al procesar la la actualizacion`,
        });
    }
  });
}
}

