import { Component, OnInit } from '@angular/core';
import { DeliveryService} from '../delivery.service';
import { Plugins } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ASN } from '../ASN.model';

@Component({
  selector: 'app-receiving-history',
  templateUrl: './receiving-history.page.html',
  styleUrls: ['./receiving-history.page.scss'],
})
export class ReceivingHistoryPage implements OnInit {

  loadedASNs: ASN[] = [];

  localStorageKeyData;
  deliveries;
  noData;

  deliveriesSub: Subscription;

  constructor(private deliveryService: DeliveryService, private loadingCtrl: LoadingController) { }

  async getLocalStorageData() {
    const localStorageKey = await Plugins.Storage.get({key: 'authData'});
    this.localStorageKeyData = JSON.parse(localStorageKey.value);
  }

  ngOnInit() {
    this.deliveriesSub = this.deliveryService.ASNs.subscribe(ASNList => {
      this.loadedASNs = ASNList;
    });
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Loading Data...'
    }).then(loadingEl => {
      loadingEl.present();
      this.LoadStorageData();
      setTimeout(() => {
        this.LoadReceivingHistory();
        loadingEl.dismiss();
      }, 100);
    })
  }

  async LoadStorageData() {
    await this.getLocalStorageData();
  }

  async LoadReceivingHistory() {
    this.deliveryService.fetchDeliveries(this.localStorageKeyData.userId).subscribe(() => {
      if (!this.loadedASNs) {
        this.noData =  true;
      } else {
        this.noData = false;
      }
    })
  }
}
