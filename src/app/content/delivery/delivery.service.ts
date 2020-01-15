import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ASN } from './ASN.model';
import { Router } from '@angular/router';

export interface TC {
  TCValue: string;
  Width: number;
  Height: number;
  Inners: number;
  Limit: string;
}

export interface Pallet {
  TCValue: string;
  TCIN: number;
  TCK: number;
}

export interface ASNData {
  key: string;
  ASN: string;
  TCs: TC[];
  Pallets: Pallet[];
  userLogin: string;
  Date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private _deliveries = new BehaviorSubject<ASN[]>([]);

  get ASNs() {
    return this._deliveries.asObservable();
  }

  constructor(private httpClient: HttpClient, private authService: AuthService, private router: Router) { }

  newDelivery(userID: string, ASN_DATA: any) {
    let generatedId: string;
    let newASN: ASN;
    let fetchedToken: string;
    return this.authService.Token.pipe(
      take(1), 
      switchMap(token => { 
        newASN = new ASN(
          Math.random().toString(),
          ASN_DATA.ASN,
          ASN_DATA.TCs,
          ASN_DATA.Pallets,
          ASN_DATA.userLogin,
          ASN_DATA.Date
        );
        fetchedToken = token;
        return this.httpClient.post<{ name: string }>(
          `https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries.json?auth=${token}`,
          { ...newASN, id: null, userLogin: null }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.httpClient.patch(
          `https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${generatedId}.json?auth=${fetchedToken}`,
          { key: generatedId }
        );
      }),
      take(1),
      switchMap(patch => {
        return this.ASNs;
      }),
      take(1),
      tap(bookings => {
        newASN.key = generatedId;
        this._deliveries.next(bookings.concat(newASN));
        // Redirect to the newly created ASN
        this.router.navigate([`/delivery/display/${userID}/${generatedId}`]);
      })
    );
  }

  // TODO BECAUSE IT'S SHIT
  addPalletToASN(userId: string, ASNDatabaseID: string, P: Pallet) {
    return this.authService.Token.pipe(take(1), switchMap(token => { 
      return this.httpClient.post(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/Pallets.json?auth=${token}`, {});
    }));
  }

  // TODO BECAUSE IT'S SHIT
  pushPalletKey(userId: string, ASNDatabaseID: string, P_KEY: string, P: Pallet) {
    return this.authService.Token.pipe(take(1), switchMap(token => {
      return this.httpClient.put(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/Pallets/${P_KEY}.json?auth=${token}`, {
        key: P_KEY,
        TCValue: P.TCValue,
        TCIN: P.TCIN,
        TCK: P.TCK
      });
    }));
  }

  deletePalletFromASN(userId: string, ASNDatabaseID: string, PID: string) {
    return this.authService.Token.pipe(take(1), switchMap(token => {
      return this.httpClient.delete(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/Pallets/${PID}.json?auth=${token}`);
    }));
  }

  fetchDeliveries(userID: string) {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<{[key: string]: ASN}>(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries.json?auth=${token}`)
      }),
      map(resData => {
        const deliveries = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            deliveries.push(
              new ASN(
                resData[key].key,
                resData[key].ASN,
                resData[key].TCs,
                resData[key].Pallets,
                resData[key].userLogin,
                resData[key].Date
              )
            );
          }
        }
        return deliveries;
      }),
      tap(deliveries => {
        this._deliveries.next(deliveries);
      })
    )
  }

  fetchSingleDelivery(ASN_ID: string, userID: string) {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<ASN>(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${ASN_ID}.json?auth=${token}`);
      }),
      map(deliveryData => {
        return new ASN(
          deliveryData.key,
          deliveryData.ASN,
          deliveryData.TCs,
          deliveryData.Pallets,
          deliveryData.userLogin,
          deliveryData.Date
        );
      })
    );
  }

  deleteDelivery(userID: string, ASN_ID: string) {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.delete(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${ASN_ID}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this._deliveries;
      }),
      take(1),
      tap(deliveries => {
        this._deliveries.next(deliveries.filter(x => x.key !== ASN_ID));
      })
    );
  }
}
