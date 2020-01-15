import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DeliveryService, TC } from '../delivery.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { take, map, switchMap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { from } from 'rxjs';

@Component({
  selector: 'app-receive-helper',
  templateUrl: './receive-helper.page.html',
  styleUrls: ['./receive-helper.page.scss'],
})
export class ReceiveHelperPage implements OnInit {

  localStorageKeyData;

  constructor(private deliveryService: DeliveryService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.getLocalStorageData();
  }

  async getLocalStorageData() {
    const localStorageKey = await Plugins.Storage.get({key: 'authData'});
    this.localStorageKeyData = JSON.parse(localStorageKey.value);
  }

  createNewDeliveryAssignment(form: NgForm) {
    // Return in case that form does not match given requirements
    if (!form.valid) {
      return;
    }
    const data = {
      key: undefined,
      ASN: form.value.ASN,
      Date: new Date(),
      userLogin: this.localStorageKeyData.userId
    };
    this.deliveryService.newDelivery(this.localStorageKeyData.userId, data).subscribe(resData => {
    })
  }
}
