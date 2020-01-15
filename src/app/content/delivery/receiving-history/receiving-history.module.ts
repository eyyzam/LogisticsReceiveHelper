import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReceivingHistoryPage } from './receiving-history.page';

const routes: Routes = [
  {
    path: '',
    component: ReceivingHistoryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReceivingHistoryPage]
})
export class ReceivingHistoryPageModule {}
