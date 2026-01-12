import { Routes } from '@angular/router';
import { AppComponent } from './layout/app.component';
import { HomeComponent } from './pages/home/home';
import { ProductList } from './pages/products/product-list/product-list';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'productos', component: ProductList },
      { path: 'categorias', component: ProductList },
    ],
  },
];
