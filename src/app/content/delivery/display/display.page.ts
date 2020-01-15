import { Component, OnInit, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliveryService, ASNData, TC } from '../delivery.service';
import { ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { stringify } from 'querystring';
import { Plugins } from '@capacitor/core';
import { TcService, Limit } from '../tc-menu/tc.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.page.html',
  styleUrls: ['./display.page.scss'],
})
export class DisplayPage implements OnInit {

  ASNDatabaseID: string;
  userId: string;
  // Init ASN Object with these values so we can replace data later with subscription from the server
  ASN: ASNData = {
    key: '',
    ASN: '',
    TCs: [],
    Pallets: [],
    userLogin: '',
    Date: undefined
  };
  ASN_DATA;
  // Arrays initalizations
  radioInputs = [];
  TCSumArray = [];
  PalletsArray = [];
  LimitsArray = [];
  LimitsArrayRendered = [];
  // Boolean Initalizations
  PalletsAssignmentsVisible: boolean = false;
  PerformedSumCalculation: boolean = false;
  isLoading: boolean = true;
  footerVisible: boolean = false;

  ASNAbsoluteTotalK: number = 0;
  ASNAbsoluteTotalP: number = 0;
  customPalletTCK: number = 0;
  customPalletTC: string = undefined;

  localStorageKeyData;

  private routeSub: Subscription;
  private deliverySub: Subscription;

  constructor(private route: ActivatedRoute,
              private deliveryService: DeliveryService,
              public actionSheetController: ActionSheetController,
              public alertController: AlertController,
              private router: Router,
              private loadingCtrl: LoadingController,
              private tcService: TcService
              ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.ASNDatabaseID = params.id;
      this.userId = params.user;
    });
    this.deliverySub = this.deliveryService.ASNs.subscribe(resData => {
      this.ASN_DATA = resData.filter(x => x.key === this.ASNDatabaseID);
    })
    this.deliveryService.fetchSingleDelivery(this.ASNDatabaseID, this.userId).subscribe(resData => {
      setTimeout(() => {
        // ASN of type ASNData later used by the most functions here
        this.ASN = {
          key: this.ASNDatabaseID,
          ASN: resData.ASN,
          TCs: resData.TCs,
          Pallets: resData.Pallets,
          userLogin: resData.userLogin,
          Date: resData.Date
        };
        this.assignCorrectPalletDisplay();
        this.AssignTotals();
        this.CountTotal();
      }, 200);
    });
    this.tcService.fetchLimits(this.userId, this.ASNDatabaseID).subscribe(resData => {
      this.LimitsArray = resData;
      this.isLoading = false;
    })
  }

  async getLocalStorageData() {
    const localStorageKey = await Plugins.Storage.get({key: 'authData'});
    this.localStorageKeyData = JSON.parse(localStorageKey.value);
  }

  assignCorrectPalletDisplay() {
    // Re-assign ASN.Pallets to the PalletsArray
    for (const i in this.ASN.Pallets) {
      this.PalletsArray.push(this.ASN.Pallets[i]);
    }
  }

  AssignTotals() {
    if (this.ASN.TCs) {
      if (this.TCSumArray.length === 0) {
        for (const x in this.ASN.TCs) {
          // Initalize TCSumArray
          this.TCSumArray.push({
            TCValue: this.ASN.TCs[x].TCValue,
            TCTotalIN: 0,
            TCTotalK: 0,
            TCPalletsTotal: 0,
            Limit: this.ASN.TCs[x].Limit === undefined ? 'unset' : this.ASN.TCs[x].Limit
          });
        }
      }
    }
  }

  CountTotal() {
    if (this.PalletsArray.length > 0) {
      for (const i of this.PalletsArray) {
        // For each TC sum is counted here
        const index = this.TCSumArray.indexOf(this.TCSumArray.find(x => x.TCValue === i.TCValue));
        this.addToCalculations(index, i.TCK, i.TCIN, 1, 1, i.TCK);
        this.PerformedSumCalculation = true;
      }
    }
  }

  TCRadios() {
    if (this.radioInputs.length === 0) {
      for (const x in this.ASN.TCs) {
        // Push TCs to the radio list displayed in 'Add Full Pallet Menu'
        this.radioInputs.push({
          name: 'radio_' + this.ASN.TCs[x].TCValue,
          type: 'radio',
          label: this.ASN.TCs[x].TCValue,
          value: this.ASN.TCs[x].TCValue
        });
      }
    }
  }

  progressBarValueCalculator(a , b) {
    let val = +(((a/b) * 100).toFixed(3));
    if (val > 100) {
      return 1;
    } else if (val === 100) {
      return 1
    } else {
      return '0.' + +(((a/b) * 100).toFixed());
    }
  }

  determineColor(a, b) {
    let val = +(((a/b) * 100).toFixed(3));
    if (val > 100) {
      return 'danger'
    } else if (val === 100) {
      return 'success'
    } else {
      return 'primary'
    }
  }

  redirectToTCManagmentPanel(userId: string, ASNDatabaseID: string) {
    this.router.navigate([`/delivery/display/${userId}/${ASNDatabaseID}/tc`]);
  }

  redirectToLimitsPanel(userId: string, ASNDatabaseID: string) {
    this.router.navigate([`/delivery/display/${userId}/${ASNDatabaseID}/limits`]);
  }
  
  addToCalculations(index: number, TCTotalKtoAdd: number, TCTotalINtoAdd: number, TCTotalPalletsToAdd: number, PAT?: number, KAT?: number) {
    try {
      this.TCSumArray[index].TCTotalK += TCTotalKtoAdd;
      this.TCSumArray[index].TCTotalIN += TCTotalINtoAdd;
      this.TCSumArray[index].TCPalletsTotal += TCTotalPalletsToAdd;
      if (PAT) {
        this.ASNAbsoluteTotalP += PAT;
      }
      if (KAT) {
        this.ASNAbsoluteTotalK += KAT;
      }
    } catch (e) {
      console.log(e);
    }
  }

  removeFromCalculations(index: number, TCTotalKToSubstract: number, TCTotalINtoSubstract: number, TCTotalPalletsToSubstract: number, PAT?: number, KAT?: number) {
    try {
      this.TCSumArray[index].TCTotalK -= TCTotalKToSubstract;
      this.TCSumArray[index].TCTotalIN -= TCTotalINtoSubstract;
      this.TCSumArray[index].TCPalletsTotal -= TCTotalPalletsToSubstract;
      if (PAT) {
        this.ASNAbsoluteTotalP -= PAT;
      }
      if (KAT) {
        this.ASNAbsoluteTotalK -= KAT;
      }
    } catch (e) {
      console.log(e);
    }
  }

  onPalletDelete(palletIndex: number, key: string) {
    const index = this.TCSumArray.indexOf(this.TCSumArray.find(x => x.TCValue === this.PalletsArray[palletIndex].TCValue));
    this.removeFromCalculations(index, this.PalletsArray[palletIndex].TCK, this.PalletsArray[palletIndex].TCIN, 1, 1, this.PalletsArray[palletIndex].TCK);
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Deleting Pallet Assignment...'
    }).then(loadingEl => {
      loadingEl.present();
      this.deliveryService.deletePalletFromASN(this.userId, this.ASNDatabaseID, key).subscribe(resData => {
        this.PalletsArray.splice(palletIndex, 1);
        loadingEl.dismiss();
      });
    });
  }

  async PalletAssignments() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Dodawanie Palety',
      buttons: [
        {
          text: 'Dodaj Pełną Palete',
          icon: 'add',
          handler: () => {
            this.TCRadios();
            this.FullPalletAssignment();
          }
        },
        {
          text: 'Dodaj Niekompletną Palete',
          icon: 'remove',
          handler: () => {
            this.TCRadios();
            this.IncompletePalletAssignment();
          }
        },
        {
          text: 'Dodaj Kilka Palet',
          icon: 'grid',
          handler: () => {
            this.TCRadios();
            this.MultiplePalletsAssignment();
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async Options() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
        {
          text: 'Ustaw Limity',
          icon: 'trending-up',
          handler: () => {
            this.redirectToLimitsPanel(this.userId, this.ASNDatabaseID);
          }
        },
        {
          text: 'Panel Zarządzania TC',
          icon: 'cube',
          handler: () => {
            this.redirectToTCManagmentPanel(this.userId, this.ASNDatabaseID);
          }
        },
        {
          text: 'Pokaż Przypisane Palety',
          icon: 'list',
          handler: () => {
            this.PalletsAssignmentsVisible = !this.PalletsAssignmentsVisible;
          }
        },
        {
          text: 'Pokaż Podsumowanie',
          icon: 'calculator',
          handler: () => {
            this.footerVisible = !this.footerVisible;
          }
        },
        {
          text: 'Odśwież Stronę',
          icon: 'refresh',
          handler: () => {
            window.location.reload();
          }
        },
        {
          text: 'Usuń Dostawę',
          icon: 'trash',
          handler: () => {
            this.loadingCtrl.create({
              keyboardClose: true,
              message: 'Processing Request...'
            }).then(loadingEl => {
              loadingEl.present();
              this.deliveryService.deleteDelivery(this.userId, this.ASNDatabaseID).subscribe(resData => {
                loadingEl.dismiss();
                this.router.navigate(['delivery/history']);
              })
            });
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async IncompletePalletAssignment() {
    const alert = await this.alertController.create({
      header: 'Select TC',
      inputs: this.radioInputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirm',
          handler: (TC: string) => {
            try {
              this.loadingCtrl.create({
                keyboardClose: true,
                message: 'Processing Request...'
              }).then(loadingEl => {
                loadingEl.present();
                if (TC === undefined || TC == null || TC === '') {
                  loadingEl.dismiss();
                  alert.dismiss();
                  return;
                } else {
                  this.customPalletTC = TC;
                  loadingEl.dismiss();
                  this.numOfCartons();
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

async numOfPallets(TC: string) {
  const alert = await this.alertController.create({
    header: 'Please provide number of pallets',
    inputs: [
      {
        name: 'numOfPallets',
        type: 'number',
        label: 'numberOfPallets',
        min: '1',
        max: '1000'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Confirm',
        handler: (numOfPallets: number) => {
          this.loadingCtrl.create({
            keyboardClose: true,
            message: 'Processing Request...'
          }).then(loadingEl => {
            loadingEl.present();
            // Logic after clicking 'Confirm'
            if (numOfPallets === undefined || numOfPallets === null || numOfPallets === 0) {
              loadingEl.dismiss();
              alert.dismiss();
              return;
            }
            const nOfPallets = +stringify(numOfPallets).slice(13);
            let TCInfo: TC;
            for (const x in this.ASN.TCs) {
              if (this.ASN.TCs[x].TCValue === TC) {
                TCInfo = {
                  TCValue: this.ASN.TCs[x].TCValue,
                  Height: this.ASN.TCs[x].Height,
                  Width: this.ASN.TCs[x].Width,
                  Inners: this.ASN.TCs[x].Inners,
                  Limit: this.ASN.TCs[x].Limit
                }
              }
            }
            const PALLET_DATA = {
              TCValue: TCInfo.TCValue,
              TCK: +TCInfo.Height * +TCInfo.Width,
              TCIN: +TCInfo.Height * +TCInfo.Width * +TCInfo.Inners
            }
            // Find numeric index in TCSumArray to push calculations
            const index = this.TCSumArray.indexOf(this.TCSumArray.find(x => x.TCValue === TC));
            this.addToCalculations(index, nOfPallets *  PALLET_DATA.TCK, nOfPallets * PALLET_DATA.TCIN, +nOfPallets, nOfPallets, nOfPallets * PALLET_DATA.TCK);
            for (let i = 0; i < nOfPallets; i++) {
              this.deliveryService.addPalletToASN(
                this.userId,
                this.ASNDatabaseID,
                PALLET_DATA
              ).subscribe(resData => {
                const key = stringify(resData).slice(5);
                this.deliveryService.pushPalletKey(
                  this.userId,
                  this.ASNDatabaseID,
                  key,
                  PALLET_DATA
                ).subscribe(() => {
                  this.PalletsArray.push({
                    key: key,
                    TCValue: PALLET_DATA.TCValue,
                    TCK: PALLET_DATA.TCK,
                    TCIN: PALLET_DATA.TCIN
                  });
                })
              })
            }
            loadingEl.dismiss();
          })
        }
      }
    ]
  })
  await alert.present();
}

async numOfCartons() {
  const alert = await this.alertController.create({
    header: 'Please provide number of cartons!',
    inputs: [
      {
        name: 'TCK',
        type: 'number',
        label: 'TCK',
        min: '1',
        max: '1000'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Confirm',
        handler: (TCK: number) => {
          this.loadingCtrl.create({
            keyboardClose: true,
            message: 'Processing Request...'
          }).then(loadingEl => {
            loadingEl.present();
            // Logic after clicking 'Confirm'
            if (TCK === undefined || TCK === null || TCK === 0) {
              loadingEl.dismiss();
              alert.dismiss();
              return;
            }
            this.customPalletTCK = TCK;
            const numofK = stringify(TCK).slice(4);
            let TCInfo: TC;
            for (const x in this.ASN.TCs) {
              // Find in ASN.TCs a TC that matches selection
              if (this.ASN.TCs[x].TCValue === this.customPalletTC) {
                // Assign values to TCInfo
                TCInfo = {
                  TCValue: this.ASN.TCs[x].TCValue,
                  Height: this.ASN.TCs[x].Height,
                  Width: this.ASN.TCs[x].Width,
                  Inners: this.ASN.TCs[x].Inners,
                  Limit: this.ASN.TCs[x].Limit
                }
              }
            }
            const PALLET_DATA = {
              TCValue: TCInfo.TCValue,
              TCK: +numofK,
              TCIN: +numofK * TCInfo.Inners
            }
            // Find numeric index in TCSumArray to push calculations
            const index = this.TCSumArray.indexOf(this.TCSumArray.find(x => x.TCValue === this.customPalletTC));
            // Adding calculations
            this.addToCalculations(index, PALLET_DATA.TCK, PALLET_DATA.TCIN, 1, 1, PALLET_DATA.TCK);
            // Sending HTTP request to DB
            this.deliveryService.addPalletToASN(
              this.userId,
              this.ASNDatabaseID,
              PALLET_DATA
            ).subscribe(resData => {
              const key = stringify(resData).slice(5);
              this.deliveryService.pushPalletKey(
                this.userId,
                this.ASNDatabaseID,
                key,
                PALLET_DATA
              ).subscribe(() => {
                this.PalletsArray.push({
                  key: key,
                  TCValue: PALLET_DATA.TCValue,
                  TCK: PALLET_DATA.TCK,
                  TCIN: PALLET_DATA.TCIN
                });
                loadingEl.dismiss();
              })
            });
          });
        }
      }
    ]
  })
  await alert.present();
}

  async FullPalletAssignment() {
    const alert = await this.alertController.create({
      header: 'Select TC',
      inputs: this.radioInputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Confirm',
          handler: (data: string) => {
            try {
              // Show Loading Controller
              this.loadingCtrl.create({
                keyboardClose: true,
                message: 'Creating Pallet Assignment...'
              }).then(loadingEl => {
                loadingEl.present();
                // Logic after clicking 'Confirm'
                if (data === undefined || data === null || data === '') {
                  loadingEl.dismiss();
                  alert.dismiss();
                  return;
                }
                let TCInfo: TC;
                for (const x in this.ASN.TCs) {
                  // Find in ASN.TCs a TC that matches selection
                  if (this.ASN.TCs[x].TCValue === data) {
                    // Assign values to TCInfo
                    TCInfo = {
                      TCValue: this.ASN.TCs[x].TCValue,
                      Height: this.ASN.TCs[x].Height,
                      Width: this.ASN.TCs[x].Width,
                      Inners: this.ASN.TCs[x].Inners,
                      Limit: this.ASN.TCs[x].Limit
                    }
                  }
                }
                // Calculations
                const PALLET_DATA = {
                  TCValue: TCInfo.TCValue,
                  TCK: TCInfo.Width * TCInfo.Height,
                  TCIN: TCInfo.Width * TCInfo.Height * TCInfo.Inners
                }
                // Find numeric index in TCSumArray to push calculations
                const index = this.TCSumArray.indexOf(this.TCSumArray.find(x => x.TCValue === data));
                // Adding calculations
                this.addToCalculations(index, PALLET_DATA.TCK, PALLET_DATA.TCIN, 1, 1, PALLET_DATA.TCK);
                // Sending HTTP request to DB
                this.deliveryService.addPalletToASN(
                  this.userId,
                  this.ASNDatabaseID,
                  PALLET_DATA
                ).subscribe(resData => {
                  const key = stringify(resData).slice(5);
                  this.deliveryService.pushPalletKey(
                    this.userId,
                    this.ASNDatabaseID,
                    key,
                    PALLET_DATA
                  ).subscribe(() => {
                    this.PalletsArray.push({
                      key: key,
                      TCValue: PALLET_DATA.TCValue,
                      TCK: PALLET_DATA.TCK,
                      TCIN: PALLET_DATA.TCIN
                    });
                    loadingEl.dismiss();
                  })
                })
              })
            } catch (e) {
              console.log(e);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async MultiplePalletsAssignment() {
    const alert = await this.alertController.create({
      header: 'Select TC',
      inputs: this.radioInputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, 
        {
          text: 'Confirm',
          handler: (TC: string) => {
            this.loadingCtrl.create({
              keyboardClose: true,
              message: 'Creating Pallet Assignment...'
            }).then(loadingEl => {
              loadingEl.present();
              if (TC === undefined || TC === null || TC === '') {
                loadingEl.dismiss();
                alert.dismiss();
                return;
              }
              loadingEl.dismiss();
              this.numOfPallets(TC);
            });
          }
        }
      ]
    })
    await alert.present();
  }
}
