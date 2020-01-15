import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { QRCodeModule } from 'angular2-qrcode';

import { IonicModule } from '@ionic/angular';

import { IndirectPage } from './indirect.page';

const routes: Routes = [
  {
    path: '',
    component: IndirectPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    QRCodeModule
  ],
  declarations: [IndirectPage]
})
export class IndirectPageModule {}
