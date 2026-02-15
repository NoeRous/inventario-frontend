import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, Signal } from '@angular/core';
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
        DividerModule
    ],
})

export class ProductSale implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    products_details = signal<ProductAvailable[]>([]);
    loading = false;

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


}
