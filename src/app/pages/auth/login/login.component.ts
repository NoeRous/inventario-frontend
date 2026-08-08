import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit() {
    this.error = null;
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.error = err?.error?.message || 'Usuario o contraseña incorrectos.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
