import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, ProductAvailable, ProductDetail } from '../domain/product.model';
import { Client } from '../domain/client.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductSaleService {
    private apiUrl = `${environment.apiUrl}/sales`;
    private apiUrlCustomers = `${environment.apiUrl}/customers`;

    constructor(private http: HttpClient) {}

    // Listar ventas registradas
    getSales(): Observable<any[]> {
        const params = new HttpParams().set('type', 'direct_sale');
        return this.http.get<any[]>(this.apiUrl, { params });
    }

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

    // Listar pedidos registrados

    getOrders(): Observable<any[]> {
        const params = new HttpParams().set('type', 'order');

        return this.http.get<any[]>(this.apiUrl, { params });
    }

    //listar items
    getSaleItems(saleId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${saleId}/items`);
    }
    updateSaleDetail(id: string, payload: any) {
      return this.http.put<any>(`${this.apiUrl}/${id}/detail`, payload);
    }
}
