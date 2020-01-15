import { Component, OnInit } from '@angular/core';
import { Barcode } from '../barcode.model';
import { Subscription } from 'rxjs';
import { BarcodesService } from '../barcodes.service';
import { LoadingController, ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
})
export class PersonalPage implements OnInit {

  loadedBarcodes: Barcode[] = [];
  barcodesSub: Subscription;
  localStorageKeyData;

  constructor(
    private barcodeService: BarcodesService, 
    private loadingCtrl: LoadingController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.barcodesSub = this.barcodeService.savedBarcodes.subscribe(barcodes => {
      this.loadedBarcodes = barcodes;
    });
    this.getLocalStorageData();
    setTimeout(() => {
      this.barcodeService.fetchSavedBarcodes(this.localStorageKeyData.userId).subscribe(() => {})
    }, 200);
  }

  async getLocalStorageData() {
    const localStorageKey = await Plugins.Storage.get({key: 'authData'});
    this.localStorageKeyData = JSON.parse(localStorageKey.value);
  }

  async Options() {
    const optionsSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
        {
          text: 'New Barcode Assignment',
          icon: 'add',
          handler: () => {
            this.NewBarcodeAssignmentAlert();
          }
        },
        {
          text: 'Edit Selected Barcode',
          icon: 'create',
          handler: () => {
            
          }
        },
        {
          text: 'Delete Selected Barcode',
          icon: 'trash',
          handler: () => {
            
          }
        },
        {
          text: 'Delete Multiple Barcodes',
          icon: 'code-working',
          handler: () => {
            
          }
        }
      ]
    });
    await optionsSheet.present();
  }

  async NewBarcodeAssignmentAlert() {
    const alert = await this.alertController.create({
      header: 'New Barcode Assignment',
      inputs: [
        {
          name: 'barcodeValue',
          type: 'text',
          placeholder: 'Value',
          id: 'barcodeValue'
        },
        {
          name: 'barcodeDisplayValue',
          type: 'text',
          placeholder: 'Display Value',
          id: 'barcodeDisplayValue'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary'
        },
        {
          text: 'Confirm',
          handler: (data) => {
            try {
              this.loadingCtrl.create({
                keyboardClose: true,
                message: 'Processing Request...'
              }).then(loadingEl => {
                loadingEl.present();
                if (data === undefined || data === null || data === '') {
                  loadingEl.dismiss();
                  alert.dismiss();
                  console.log('Data not provided correctly!');
                  return;
                } else {
                  this.barcodeService.newMyBarcode(
                    data.barcodeValue,
                    data.barcodeDisplayValue,
                    this.localStorageKeyData.userId
                  ).subscribe(() => {
                    loadingEl.dismiss();
                  })
                }
              });
            } catch(e) {
              console.log(e);
            }
          } 
        }
      ]
    })
    await alert.present();
  }

}
