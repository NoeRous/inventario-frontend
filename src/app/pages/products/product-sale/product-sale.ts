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
import { Client } from '../../../../domain/client.model';
import { environment } from '../../../../environments/environment';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';

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
    CheckboxModule,
    TextareaModule
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
  saleDetailForm!: FormGroup;

  clients = signal<Client[]>([]);

  isDiscountDialogVisible = signal(false);
  discountMode = signal<'amount' | 'percent'>('amount');
  discountValue = signal<number>(0);
  discountModeOptions = [
    { label: 'Monto', value: 'amount' as const },
    { label: 'Porcentaje', value: 'percent' as const },
  ];

  isSaleDetailsVisible = signal(false);
  typeSaleDetails = signal<'sale' | 'order'>('sale');

  constructor(
    private productSaleService: ProductSaleService,
    private fb: FormBuilder,
  ) {
    this.newClientForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
    });

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

  ngOnInit() {
    this.getProductsAvailables();
    this.getClientsAll();
  }

  get saleDetail() {
    return this.saleDetailForm.getRawValue();
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
  subtotal = computed(() => this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0));

  discountAmount = computed(() => {
    const subtotal = this.subtotal();
    const value = Number(this.discountValue() ?? 0);
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;

    if (subtotal <= 0) return 0;

    if (this.discountMode() === 'percent') {
      const pct = Math.min(100, safeValue);
      return Math.min(subtotal, (subtotal * pct) / 100);
    }

    return Math.min(subtotal, safeValue);
  });

  total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));

  onOpenDiscountDialog() {
    this.isDiscountDialogVisible.set(true);
  }

  clearDiscount() {
    this.discountMode.set('amount');
    this.discountValue.set(0);
  }

  // 💾 Registrar venta
  registerSale(type: 'sale' | 'order') {
    if (!this.selectedClient) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cliente requerido',
        detail: `Selecciona un cliente para registrar la ${type === 'sale' ? 'venta' : 'pedido'}`,
      });
      return;
    }

    const subtotal = this.subtotal();
    const discount = this.discountAmount();
    const total = this.total();

    const saleRequest = {
      type: type === 'sale' ? 'direct_sale' : 'order',
      status: type === 'sale' ? 'paid' : 'pending',
      customerId: this.selectedClient?.id,
      subtotal: subtotal,
      discount: discount,
      total: total,
      amountPaid: total,
      paymentMethod: type === 'sale' ? 'cash' : 'qr',
      observation: this.saleDetail.observation?? null,

      soldBy: this.saleDetail.sold_by?? null,
      sellerProfit:  this.saleDetail.seller_profit?? 0,
      soldPaid: this.saleDetail.sold_paid?? false,
      deliveredBy: this.saleDetail.delivered_by?? null,
      deliveryProfit: this.saleDetail.delivery_profit?? 0,
      deliveryPaid: this.saleDetail.delivery_paid?? false,

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
        this.clearSaveDetailForm();

        this.messageService.add({
          severity: 'success',
          summary: `${type === 'sale' ? 'Venta' : 'Pedido'} registrada`,
          detail: `La ${type === 'sale' ? 'venta' : 'pedido'} se ha registrado correctamente`,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: `Error al registrar ${type === 'sale' ? 'venta' : 'pedido'}`,
          detail: error.error?.message ?? `Error al procesar la ${type === 'sale' ? 'venta' : 'pedido'}`,
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

  confirmSale(event: Event, type: 'sale' | 'order') {
    this.typeSaleDetails.set(type);
    if (!this.selectedClient) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cliente requerido',
        detail: `Selecciona un cliente para registrar la ${type === 'sale' ? 'venta' : 'pedido'}`,
      });
      this.isSelectedClient = true;
      return;
    }

    if (this.cart().length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: `Carrito vacío para ${type === 'sale' ? 'vender' : 'pedir'}`,
        detail: `Agrega al menos un producto para ${type === 'sale' ? 'vender' : 'pedir'} la ${type === 'sale' ? 'venta' : 'pedido'} correctamente`,
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Estás seguro de registrar esta ${type === 'sale' ? 'venta' : 'pedido'}?`,
      header: `Confirmar ${type === 'sale' ? 'Venta' : 'Pedido'}`,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: type === 'sale' ? 'Vender' : 'Pedir',
        severity: type === 'sale' ? 'danger' : 'success',
      },

      accept: () => {
        this.registerSale(type);
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: `Operación cancelada para ${type === 'sale' ? 'venta' : 'pedido'}`,
          detail: `La acción fue rechazada por el usuario para la ${type === 'sale' ? 'venta' : 'pedido'} correctamente para continuar`,
        });
      },
    });
  }

  onOpenDetailSaleDialog() {
    this.isSaleDetailsVisible.set(true);
  }

  clearSaveDetailForm() {
    this.saleDetailForm.reset({
      observation: '',
      sold_by: '',
      seller_profit: 0,
      sold_paid: false,
      delivered_by: '',
      delivery_profit: 0,
      delivery_paid: false
    });
  }


}
