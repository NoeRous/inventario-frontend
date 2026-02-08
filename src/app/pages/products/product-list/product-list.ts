import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
  ],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
})
export class ProductList implements OnInit {
  products = signal<Product[]>([]);
  loading = false;
  selectedProduct = signal<Product | null>(null);
  @ViewChild('op') op!: Popover;
  selectedProductDetails = signal<ProductDetail[]>([]);
  detailsDialog = false;
  clonedDetails: { [id: string]: ProductDetail } = {};

  detailForm: any = {
    id: null,
    color: '',
    size: '',
    stock: 0,
    warehouse: '',
    product: null,
  };

  selectedDetail: any = null;
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

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      category: [null, Validators.required],
      price: [0, Validators.required],
      stock: [0, Validators.required],
      inventoryState: ['DISPONIBLE', Validators.required],
      image: [null],
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

    if (this.isEditMode && this.selectedProduct()) {
      this.productService.updateProduct(this.selectedProduct()!.id, productData).subscribe(() => {
        this.getProductsAll();
        this.productDialog = false;
      });
    } else {
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

  addNewDetail() {
    const newDetail: ProductDetail = {
      id: null as any,
      color: '',
      size: '',
      stock: 0,
      warehouse: '',
      product: this.selectedProduct(),
    };

    this.selectedProductDetails.update((list) => [...list, newDetail]);
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
    this.detailForm = { ...event.data, product: this.selectedProduct() };
    this.isEditDetail = true;
  }

  saveDetail() {
    if (this.isEditDetail) {
      // actualizar
      this.productService.updateProductDetail(this.detailForm).subscribe(() => {
        console.log('Actualizado');
      });
    } else {
      // agregar
      this.detailForm = { ...this.detailForm, product: this.selectedProduct() };
      this.productService.createProductDetail(this.detailForm).subscribe((saved) => {
        console.log('Creado', saved);
      });
      return;
    }

    this.resetForm();
  }

  resetForm() {
    this.detailForm = {
      id: null,
      color: '',
      size: '',
      stock: 0,
      warehouse: '',
      product: null,
    };
    this.isEditDetail = false;
    this.selectedDetail = null;
  }
}
