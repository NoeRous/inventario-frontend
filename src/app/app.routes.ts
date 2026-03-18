import { Routes } from '@angular/router';
import { AppComponent } from './layout/app.component';
import { HomeComponent } from './pages/home/home';
import { ProductList } from './pages/products/product-list/product-list';
import { ProductSale } from './pages/products/product-sale/product-sale';
import { SaleList } from './pages/products/sale/sale';
import { LoginComponent } from './pages/auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { OrderList } from './pages/products/order/order';
import { ClientList } from './pages/clients/client-list/client-list';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AppComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [authGuard] },
      { path: 'home', component: HomeComponent, canActivate: [authGuard] },
      { path: 'productos', component: ProductList, canActivate: [authGuard] },
      {
        path: 'ventas',
        component: ProductSale,
        canActivate: [authGuard],
      },
      {
        path: 'ventas-listado',
        component: SaleList,
        canActivate: [authGuard],
      },
      {
        path: 'pedidos-listado',
        component: OrderList,
        canActivate: [authGuard],
      },
      {
        path: 'categorias',
        component: ProductList,
        canActivate: [authGuard],
      },
      { path: 'clientes', component: ClientList, canActivate: [authGuard] },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
