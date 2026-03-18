import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';
import { Client } from '../domain/client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrlCustomers = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrlCustomers);
  }

  createClient(clientData: { fullName: string; phone: string }): Observable<Client> {
    return this.http.post<Client>(this.apiUrlCustomers, clientData);
  }
}

