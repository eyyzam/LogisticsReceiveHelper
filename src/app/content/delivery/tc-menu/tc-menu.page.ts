import { Component, OnInit } from '@angular/core';
import { Subscription, fromEventPattern } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { TcService } from './tc.service';
import { LoadingController, ToastController } from '@ionic/angular';

interface TC {
  key: string;
  TCValue: string;
  Width: number;
  Height: number;
  Inners: number;
}

@Component({
  selector: 'app-tc-menu',
  templateUrl: './tc-menu.page.html',
  styleUrls: ['./tc-menu.page.scss'],
})
export class TcMenuPage implements OnInit {

  routeSub: Subscription;
  ASNDatabaseID: string;
  userId: string;
  showTCs = [];
  private TCs;
  isLoading = false;

  constructor(private route: ActivatedRoute, 
              private tcService: TcService, 
              private router: Router, 
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.ASNDatabaseID = params.id;
      this.userId = params.user;
    });
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Loading Data...'
    }).then(loadingEl => {
      loadingEl.present();
      this.tcService.fetchTCs(this.userId, this.ASNDatabaseID).subscribe(resData => {
        this.TCs = resData;
        // This is for making TCs Array iterable
        // tslint:disable-next-line:forin
        for (const t in this.TCs) {
          this.showTCs.push(this.TCs[t]);
        }
        loadingEl.dismiss();
      });
    });
  }

  redirectBack() {
    this.router.navigateByUrl(`delivery/display/${this.userId}/${this.ASNDatabaseID}`);
  }

  addTCAssignment(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Processing Request...'
    }).then(loadingEl => {
      loadingEl.present();
      this.tcService.newTC(this.userId, this.ASNDatabaseID).subscribe(resData => {
        console.log(form.value.limitDisable);
        const data = {
          key: resData.name,
          TCValue: form.value.TCValue,
          Width: form.value.Width,
          Height: form.value.Height,
          Inners: form.value.Inners,
          Limit: form.value.limit
        };
        this.tcService.addKeyToNewTC(this.userId, this.ASNDatabaseID, data.key, data).subscribe(respData => {
          this.showTCs.push(data);
          loadingEl.dismiss();
        });
      });
    });
  }

  updateTC(TCID: string, V: string, W: number, H: number, IN: number) {
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Processing Request...'
    }).then(loadingEl => {
      loadingEl.present();
      const data = {
        key: TCID,
        TCValue: V,
        Width: W,
        Height: H,
        Inners: IN
      };
      this.tcService.updateTC(this.userId, this.ASNDatabaseID, data).subscribe(resData => {
        const index = this.showTCs.indexOf(this.showTCs.find(x => x.key === data.key));
        this.showTCs[index] = data;
        loadingEl.dismiss();
      });
    });
  }

  async presentTCDeletedToast() {
    const toast = await this.toastCtrl.create({
      message: 'TC Deleted Successfully',
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }

  onDelete(key: string) {
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Processing Request...'
    }).then(loadingEl => {
      loadingEl.present();
      this.tcService.deleteSingleTC(this.userId, key, this.ASNDatabaseID).subscribe(resData => {
        const index = this.showTCs.indexOf(this.showTCs.find(x => x.key === key));
        this.showTCs.splice(index, 1);
        loadingEl.dismiss();
        this.presentTCDeletedToast();
      })
    });
  }

  showVal(value) {
    console.log(value);
  }
}
