import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReceiveHelperPage } from './receive-helper.page';

const routes: Routes = [
  {
    path: '',
    component: ReceiveHelperPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReceiveHelperPage]
})
export class ReceiveHelperPageModule {}
