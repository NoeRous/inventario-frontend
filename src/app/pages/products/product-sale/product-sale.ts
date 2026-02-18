import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';
import { ProductSaleService } from '../../../../service/ProductSaleService';
import { ProductAvailable } from '../../../../domain/product.model';
import { environment } from '../../../../environments/environment';
import { DrawerModule } from 'primeng/drawer';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

@Component({
  standalone: true,
  selector: 'app-product-sale',
  templateUrl: './product-sale.html',
  styleUrls: ['./product-sale.scss'],
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    DataViewModule,
    ImageModule,
    DividerModule,
    DrawerModule,
    ButtonModule,
  ],
})
export class ProductSale implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  products_details = signal<ProductAvailable[]>([]);
  loading = false;
  cart = signal<any[]>([]);
  isSelectedClient: boolean = false;

  selectedClient: Client | undefined;

  isAddClient = signal(false);
  newClientForm: FormGroup;

  clients = signal<Client[]>([]);

  constructor(
    private productSaleService: ProductSaleService,
    private fb: FormBuilder,
  ) {
    this.newClientForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getProductsAvailables();
    this.getClientsAll();
  }

  getImageUrl(imagePath: string | null | undefined): string {
    return imagePath?.trim() ? `${environment.apiUrl}${imagePath}` : '/assets/no-image.png';
  }
  getProductsAvailables() {
    this.loading = true;
    this.productSaleService.getProductsAvailablesData().subscribe({
      next: (data) => {
        this.products_details.set(data);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  //venta de productos
  // ➕ Agregar producto
  addProduct(product: ProductAvailable) {
    const cart = this.cart();
    const existing = cart.find((p) => p.productDetailId === product.productDetailId);

    if (existing) {
      // 🚨 Validar que no supere el stock
      if (existing.quantity >= product.stock) {
        this.messageService.add({
          severity: 'info',
          summary: 'Stock insuficiente',
          detail: 'La cantidad supera el stock disponible',
        });
        return;
      }

      existing.quantity += 1;
    } else {
      if (product.stock <= 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Stock insuficiente',
          detail: 'La cantidad supera el stock disponible',
        });
        return;
      }

      cart.push({
        ...product,
        quantity: 1,
      });
    }

    this.cart.set([...cart]);
  }

  // ❌ Quitar producto
  removeProduct(productDetailId: number) {
    this.cart.update((items) => items.filter((i) => i.productDetailId !== productDetailId));
  }

  // 🔢 Cambiar cantidad
  updateQuantity(item: any, value: number) {
    const quantity = Number(value);

    if (quantity <= 0) {
      this.removeProduct(item.productDetailId);
      return;
    }

    if (quantity > item.stock) {
      this.messageService.add({
        severity: 'info',
        summary: 'Stock insuficiente',
        detail: 'La cantidad supera el stock disponible',
      });
      //item.quantity = item.stock;
    } else {
      item.quantity = quantity;
    }

    this.cart.set([...this.cart()]);
  }

  // 💰 Total dinámico
  total = computed(() => this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0));

  // 💾 Registrar venta
  registerSale() {
    const subtotal = this.total(); // o calcula sin descuento si manejas separado
    const discount = 0;
    const total = subtotal - discount;

    const saleRequest = {
      type: 'direct_sale',
      status: 'paid',
      customerId: this.selectedClient?.id,
      subtotal: subtotal,
      discount: discount,
      total: total,
      amountPaid: total,
      paymentMethod: 'cash',

      saleItems: this.cart().map((item) => ({
        productDetailId: item.productDetailId,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.quantity * item.price,
      })),
    };

    console.log('Venta enviada:', saleRequest);

    this.productSaleService.createSale(saleRequest).subscribe({
      next: (response) => {
        console.log('Venta registrada:', response);

        this.cart.set([]);
        this.getProductsAvailables();
        this.selectedClient = undefined;

        this.messageService.add({
          severity: 'success',
          summary: 'Venta registrada',
          detail: 'La venta se ha registrado correctamente',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al registrar venta',
          detail: error.error?.message ?? 'Error al procesar la venta',
        });
      },
    });
  }

  isSelected(product: ProductAvailable): boolean {
    return this.cart().some((p) => p.productDetailId === product.productDetailId);
  }

  addClient() {
    if (this.newClientForm.invalid) {
      this.newClientForm.markAllAsTouched();
      return;
    }

    this.productSaleService.createClient(this.newClientForm.value).subscribe(() => {
      this.getClientsAll();
      this.isAddClient.set(false);
      this.newClientForm.reset();
    });
    // Aquí llamarías a tu servicio para guardar el cliente
    this.messageService.add({
      severity: 'success',
      summary: 'Cliente agregado',
      detail: 'El cliente se ha agregado correctamente',
    });
  }

  getClientsAll() {
    this.productSaleService.getClientsData().subscribe({
      next: (data) => {
        this.clients.set(data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });
  }

  confirmSale(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de registrar esta venta?',
      header: 'Confirmar Venta',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Vender',
        severity: 'danger',
      },

      accept: () => {
        this.registerSale();
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Operación cancelada',
          detail: 'La acción fue rechazada por el usuario',
        });
      },
    });
  }
}
