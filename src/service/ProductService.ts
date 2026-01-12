import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Product } from '../domain/product.model';
    
@Injectable({
  providedIn: 'root', // <- esto asegura que el servicio exista globalmente
})
export class ProductService {

    private apiUrl =  `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getProductsData() {
        return this.http.get<Product[]>(this.apiUrl);
    }

    createProduct(product: Product) {
        return this.http.post<Product>(this.apiUrl, product);
    }

   /* getProductsMini() {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    }

    getProductsSmall() {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    }

    getProducts() {
        return Promise.resolve(this.getProductsData());
    }

    getProductsWithOrdersSmall() {
        return Promise.resolve(this.getProductsWithOrdersData().slice(0, 10));
    }

    getProductsWithOrders() {
        return Promise.resolve(this.getProductsWithOrdersData());
    }*/
};