import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductSaleService } from '../../../../service/ProductSaleService';

interface Sale {
  id: number;
  date: string;
  customerName: string;
  total: number;
  status: string;
  itemsCount: number;
}

@Component({
  standalone: true,
  selector: 'app-sale-list',
  templateUrl: './sale.html',
  styleUrls: ['./sale.scss'],
  imports: [CommonModule, TableModule, TagModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
})
export class SaleList implements OnInit {
  private saleService = inject(ProductSaleService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  sales = signal<Sale[]>([]);
  loading = false;

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
      detail: `Venta #${sale.id} seleccionada`,
    });
  }
}

