import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Client } from '../../../../domain/client.model';
import { ClientService } from '../../../../service/ClientService';

@Component({
  standalone: true,
  selector: 'app-client-list',
  templateUrl: './client-list.html',
  styleUrls: ['./client-list.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class ClientList implements OnInit {
  private clientService = inject(ClientService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  clients = signal<Client[]>([]);
  loading = false;

  clientDialog = false;
  submitted = false;

  clientForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadClients();
  }

  get clientList(): Client[] {
    return this.clients();
  }

  openNew() {
    this.submitted = false;
    this.clientForm.reset();
    this.clientDialog = true;
  }

  hideDialog() {
    this.clientDialog = false;
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });
  }

  saveClient() {
    this.submitted = true;
    if (this.clientForm.invalid) return;

    const payload = this.clientForm.value as { fullName: string; phone: string };
    this.clientService.createClient(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente agregado',
          detail: 'El cliente se ha agregado correctamente',
        });
        this.clientDialog = false;
        this.clientForm.reset();
        this.loadClients();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo agregar el cliente',
        });
      },
    });
  }
}

