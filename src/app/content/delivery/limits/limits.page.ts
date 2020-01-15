import { Component, OnInit } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TcService } from '../tc-menu/tc.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-limits',
  templateUrl: './limits.page.html',
  styleUrls: ['./limits.page.scss'],
})
export class LimitsPage implements OnInit {

  routeSub: Subscription;
  ASNDatabaseID: string;
  userId: string;
  showTCs = [];
  showLimits = [];
  private TCs;
  private limits;

  isLoading = true;

  constructor(private route: ActivatedRoute, 
              private tcService: TcService, 
              private router: Router, 
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController) { }

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
      this.tcService.fetchLimits(this.userId, this.ASNDatabaseID).subscribe(resData => {
        this.limits = resData;
      })
      this.tcService.fetchTCs(this.userId, this.ASNDatabaseID).subscribe(resData => {
        this.TCs = resData;
        // This is for making TCs Array iterable
        // tslint:disable-next-line:forin
        for (const t in this.TCs) {
          this.showTCs.push(this.TCs[t]);
        }
        console.log(this.showTCs);
        this.isLoading = false;
        loadingEl.dismiss();
      });
    });
  }

  UpdateLimit(TC_DB_KEY: string, limit: number, TCValue: string) {
    this.loadingCtrl.create({
        keyboardClose: true,
        message: 'Przetwarzanie...'
      }).then(loadingEl => {
        loadingEl.present();
        const data = {
          TCValue,
          limit
        };
        this.tcService.setLimit(this.userId, this.ASNDatabaseID, TC_DB_KEY, data.limit).subscribe(resData => {
          try {
            if (this.limits.find(x => x.TCValue === data.TCValue)) {
              const index = this.limits.indexOf(this.limits.find(x => x.TCValue === data.TCValue));
              this.limits[index].limit = limit;
            } else {
              this.limits.push(data);
            }
          } catch(e) {
            console.log(e);
          }
          loadingEl.dismiss();
        });
      });
    }

  RemoveLimit(TC_DB_KEY: string, TCValue: string) {
    this.loadingCtrl.create({
      keyboardClose: true,
      message: `Usuwanie Limitu dla ${TCValue}...`
    }).then(loadingEl => {
      loadingEl.present();
      this.tcService.deleteLimit(this.userId, this.ASNDatabaseID, TC_DB_KEY).subscribe(resData => {
        try {
          const index = this.limits.indexOf(this.limits.find(x => x.TCValue === TCValue));
          this.limits[index].limit = 0;
        } catch(e) {
          
        }
        loadingEl.dismiss();
      });
    });
  }

  redirectBack() {
    this.router.navigate([`/delivery/display/${this.userId}/${this.ASNDatabaseID}`]);
  }
}
