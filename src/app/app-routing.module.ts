import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    pathMatch: 'full',
    canLoad: [AuthGuard]
  },
  {
    path: 'delivery',
    children: [
      {
        path: 'new',
        loadChildren: './content/delivery/receive-helper/receive-helper.module#ReceiveHelperPageModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'history',
        loadChildren: './content/delivery/receiving-history/receiving-history.module#ReceivingHistoryPageModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'display/:user/:id',
        loadChildren: './content/delivery/display/display.module#DisplayPageModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'display/:user/:id/tc',
        loadChildren: './content/delivery/tc-menu/tc-menu.module#TcMenuPageModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'display/:user/:id/limits',
        loadChildren: './content/delivery/limits/limits.module#LimitsPageModule',
        canLoad: [AuthGuard] 
      }
    ]
  },
  {
    path: 'barcodes',
    children: [
      {
        path: '',
        redirectTo: '/barcodes/generator',
        pathMatch: 'full',
        canLoad: [AuthGuard]
      },
      {
        path: 'personal',
        loadChildren: './content/barcodes/personal/personal.module#PersonalPageModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'indirect',
        loadChildren: './content/barcodes/indirect/indirect.module#IndirectPageModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'generator',
        loadChildren: './content/barcodes/generator/generator.module#GeneratorPageModule',
        canLoad: [AuthGuard]
      }
    ]
  },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule' },
//   { path: 'limits', loadChildren: './content/delivery/limits/limits.module#LimitsPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
