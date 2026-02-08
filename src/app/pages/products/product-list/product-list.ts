import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ProductService } from '../../../../service/ProductService';
import { Product, ProductDetail } from '../../../../domain/product.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment.prod';
import { SelectModule } from 'primeng/select';
import { Popover, PopoverModule } from 'primeng/popover';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-product-list',
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
    PopoverModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
  providers: [ConfirmationService, MessageService],
})
export class ProductList implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  products = signal<Product[]>([]);
  loading = false;
  selectedProduct = signal<Product | null>(null);
  @ViewChild('op') op!: Popover;
  selectedProductDetails = signal<ProductDetail[]>([]);
  detailsDialog = false;
  clonedDetails: { [id: string]: ProductDetail } = {};

  detailForm: FormGroup;
  selectedDetail = signal<ProductDetail | null>(null);
  isEditDetail = false;

  inventoryStates = [
    { label: 'DISPONIBLE', value: 'DISPONIBLE' },
    { label: 'BAJO_STOCK', value: 'BAJO_STOCK' },
    { label: 'AGOTADO', value: 'AGOTADO' },
  ];

  categories: { id: string; name: string }[] = [];

  productForm: FormGroup;
  isEditMode = false;
  //selectedProduct: Product | null = null;

  productDialog = false; // controla visibilidad del dialog
  submitted = false;
  submittedDetail = false;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
  ) {
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      //category: [null, Validators.required],
      price: [0, Validators.required],
      stock: [{ value: 0, disabled: true }], 
      inventoryState: ['DISPONIBLE', Validators.required],
      image: [null],
    });

    this.detailForm = this.fb.group({
      id: [null],
      color: ['', Validators.required],
      size: ['', Validators.required],
      stock: [0, Validators.required],
      warehouse: ['', Validators.required],
      product: [''],
    });
  }

  ngOnInit() {
    this.getProductsAll();
    this.getCategories();
  }

  get productList(): Product[] {
    return this.products();
  }

  getProductsAll() {
    this.loading = true;
    this.productService.getProductsData().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getCategories() {
    this.productService.getCategories().subscribe((res) => (this.categories = res));
  }

  getSeverity(state: string): 'success' | 'warn' | 'danger' | 'info' {
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
    return imagePath?.trim() ? `${environment.apiUrl}${imagePath}` : '/assets/no-image.png';
  }

  // Abrir dialog para crear nuevo producto
  openNew() {
    this.productForm.reset({ inventoryState: 'DISPONIBLE', price: 0, stock: 0 });
    this.isEditMode = false;
    this.selectedProduct.set(null);
    this.productDialog = true;
    this.submitted = false;
  }

  // Abrir dialog para editar
  editProduct(product: Product) {
    this.isEditMode = true;
    this.selectedProduct.set(product);
    this.productForm.patchValue({
      code: product.code,
      name: product.name,
      description: product.description,
      categoryId: product.category.id,
      category: product.category,
      price: product.price,
      stock: product.stock,
      inventoryState: product.inventoryState,
      image: null,
    });
    this.productDialog = true;
    this.submitted = false;
  }

  hideDialog() {
    this.productDialog = false;
  }

  saveProduct() {
    this.submitted = true;
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;
    console.log('Creating product with data-----:', productData);

    if (this.isEditMode && this.selectedProduct()) {
      this.productService.updateProduct(this.selectedProduct()!.id, productData).subscribe(() => {
        this.getProductsAll();
        this.productDialog = false;
      });
    } else {
      console.log('Creating product with data:', productData);
      this.productService.createProduct(productData).subscribe(() => {
        this.getProductsAll();
        this.productDialog = false;
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Deseas eliminar "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe(() => this.getProductsAll());
    }
  }

  onFileSelected(event: Event, product: Product | null = null) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (product) {
      // Subir imagen al producto existente
      const formData = new FormData();
      formData.append('image', file);
      this.productService.uploadProductImage(product.id, formData).subscribe(() => {
        this.getProductsAll();
      });
    } else {
      // Guardar archivo en el formulario de creación
      this.productForm.patchValue({ image: file });
    }
  }

  displayProduct(event: any, product: Product) {
    this.productService.getProductDetails(product.id).subscribe({
      next: (details: ProductDetail[]) => {
        this.selectedProductDetails.set(details);
        this.selectedProduct.set(product);
        this.op.show(event);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  displayProductDetails(product: Product) {
    this.selectedProduct.set(product);

    this.productService.getProductDetails(product.id).subscribe((details) => {
      this.selectedProductDetails.set(details);
      this.detailsDialog = true;
    });
  }

  // detalle

  onSelectDetail(event: any) {
    this.selectedDetail.set(event.data);
    this.isEditDetail = true;

    this.detailForm.patchValue({
      id: event.data.id,
      color: event.data.color,
      size: event.data.size,
      stock: event.data.stock,
      warehouse: event.data.warehouse,
      product: this.selectedProduct()!,
    });
  }

  saveDetail() {
    this.submittedDetail = true;
    const payload: ProductDetail = {
      ...this.detailForm.value,
      product: this.selectedProduct()!,
    };

    if (this.detailForm.invalid ) return;

    if (this.isEditDetail) {
      // ACTUALIZAR
      this.productService.updateProductDetail(payload).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'El detalle fue actualizado correctamente',
        });

        this.reloadDetails();
        this.resetForm();
        this.getProductsAll();
      });
    } else {
      // CREAR
      console.log('Creating detail with payload ENTRA:', payload);
      this.productService.createProductDetail(payload).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Creado',
          detail: 'El detalle fue creado correctamente',
        });

        this.reloadDetails();
        this.resetForm();
        this.getProductsAll();
      });
    }
  }

  resetForm() {
    this.detailForm.reset({
      id: null,
      color: '',
      size: '',
      stock: 0,
      warehouse: '',
    });

    this.isEditDetail = false;
    this.selectedDetail.set(null);
    this.submittedDetail = false;
  }

  reloadDetails() {
    if (!this.selectedProduct()) return;

    this.productService.getProductDetails(this.selectedProduct()!.id).subscribe((details) => {
      this.selectedProductDetails.set(details);
    });
  }

  confirmDeleteDetail(event: Event, detail: ProductDetail) {
    event.stopPropagation();

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Eliminar este detalle?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProductDetail(detail.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Detalle eliminado correctamente',
          });

          this.reloadDetails();
          this.resetForm();
          this.getProductsAll();
        });
      },
    });
  }
}
