import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  ],
})
export class ProductSale implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  products_details = signal<ProductAvailable[]>([]);
  loading = false;
  cart = signal<any[]>([]);

  constructor(
    private productSaleService: ProductSaleService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.getProductsAvailables();
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
    const saleRequest = {
      total: this.total(),
      details: this.cart().map((item) => ({
        productDetailId: item.detailId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    console.log('Venta enviada:', saleRequest);

    // Aquí llamas a tu servicio
    // this.saleService.createSale(saleRequest).subscribe(...);

    this.cart.set([]);
  }

  isSelected(product: ProductAvailable): boolean {
    return this.cart().some((p) => p.productDetailId === product.productDetailId);
  }
}
