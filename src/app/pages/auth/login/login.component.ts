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
  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit() {
    this.error = null;
    this.loading = true;

    try {
      const ok = this.authService.login(this.username, this.password);

      if (!ok) {
        this.error = 'Usuario o contraseña incorrectos.';
        return;
      }

      await this.router.navigateByUrl('/');
    } finally {
      this.loading = false;
    }
  }
}

