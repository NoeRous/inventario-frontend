import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductSaleService } from '../../../../service/ProductSaleService';

interface Order {
  id: number;
  date: string;
  customerName: string;
  total: number;
  status: string;
  itemsCount: number;
}

@Component({
  standalone: true,
  selector: 'app-order-list',
  templateUrl: './order.html',
  styleUrls: ['./order.scss'],
  imports: [CommonModule, TableModule, TagModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
})
export class OrderList implements OnInit {
  private saleService = inject(ProductSaleService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  orders = signal<Order[]>([]);
  loading = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  get orderList(): Order[] {
    return this.orders();
  }

  loadOrders(): void {
    this.loading = true;
    this.saleService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pedidos',
        });
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completado':
      case 'delivered':
      case 'entregado':
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

  confirmViewOrder(event: Event, order: Order) {
    event.stopPropagation();
    this.messageService.add({
      severity: 'info',
      summary: 'Pedido',
      detail: `Pedido #${order.id} seleccionado`,
    });
  }
}

