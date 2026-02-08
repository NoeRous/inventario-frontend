import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Product, ProductDetail } from '../domain/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`;
  private categoryUrl = `${environment.apiUrl}/categories`;
  private apiUrlProductDetail = `${environment.apiUrl}/product-details`;

  constructor(private http: HttpClient) { }

  // Listar todos los productos
  getProductsData(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Crear un producto
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Actualizar producto
  updateProduct(productId: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, product);
  }

  // Eliminar producto
  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`);
  }

  // Subir imagen de producto
  uploadProductImage(productId: string, formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/upload/${productId}/image`, formData);
  }

  // Traer categorías (para dropdown)
  getCategories(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(this.categoryUrl);
  }

  // listar detalles de productos
  getProductDetails(productId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${productId}/details`);
  }

  createProductDetail(detail: ProductDetail) {
    return this.http.post<ProductDetail>(
      `${this.apiUrlProductDetail}`,
      detail
    );
  }

  updateProductDetail(detail: ProductDetail) {
    console.log('Updating detail:', detail);
    return this.http.put<ProductDetail>(
      `${this.apiUrlProductDetail}/${detail.id}`,
      detail
    );
  }

  deleteProductDetail(detailId: string) { 

    return this.http.delete<void>(`${this.apiUrlProductDetail}/${detailId}`);
  }
}
