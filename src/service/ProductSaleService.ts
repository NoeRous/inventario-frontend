import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Product, ProductAvailable, ProductDetail } from '../domain/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductSaleService {
    private apiUrl = `${environment.apiUrl}/sales`;
    private apiUrlCustomers = `${environment.apiUrl}/customers`;

    constructor(private http: HttpClient) {}

     // Listar todos los productos de venta disponibles
    getProductsAvailablesData(): Observable<ProductAvailable[]> {
    return this.http.get<ProductAvailable[]>(`${this.apiUrl}/available-products`);
    }

    getClientsData(): Observable<Client[]> {
        return this.http.get<Client[]>(`${this.apiUrlCustomers}`);
    }

    createClient(clientData: { fullName: string; phone: string }): Observable<Client> {
        return this.http.post<Client>(`${this.apiUrlCustomers}`, clientData);
    }

    createSale(saleData:any): Observable<Client> {
        return this.http.post<Client>(`${this.apiUrl}`, saleData);
    }
}
