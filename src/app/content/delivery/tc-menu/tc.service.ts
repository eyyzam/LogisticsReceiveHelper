import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { take, switchMap, map, tap, switchMapTo } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TC } from './tc.model';
import { BehaviorSubject } from 'rxjs';

export interface Limit {
  TCValue: string,
  limit: number
}

@Injectable({
  providedIn: 'root'
})
export class TcService {

  private _tcs = new BehaviorSubject<TC[]>([]);
  private _limits = new BehaviorSubject<Limit[]>([]);

  private limitsArray = [];

  constructor(private authService: AuthService, private httpClient: HttpClient) {}

  newTC(userId: string, ASNDatabaseID: string) {
    return this.authService.Token.pipe(take(1), switchMap(token  => {
      return this.httpClient.post<{name: string}>(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/TCs.json?auth=${token}`, {});
    }));
  }

  addKeyToNewTC(userId: string, ASNDatabaseID: string, TCID: string, data: any) {
    return this.authService.Token.pipe(take(1), switchMap(token => {
      return this.httpClient.put(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/TCs/${TCID}.json?auth=${token}`, {
        key: TCID,
        TCValue: data.TCValue,
        Width: data.Width,
        Height: data.Height,
        Inners: data.Inners,
        Limit: data.Limit
      })
    }))
  }

  fetchTCs(userId: string, ASNDatabaseID: string) {
    return this.authService.Token.pipe(take(1), switchMap(token => {
      return this.httpClient.get(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/TCs.json?auth=${token}`);
    }));
  }

  fetchLimits(userID: string, ASNDatabaseID: string) {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<Limit[]>(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${ASNDatabaseID}/limits.json?auth=${token}`);
      }),
      map(resData => {
        for (const key in resData) {
          this.limitsArray.push({
            TCValue: resData[key].TCValue,
            limit: resData[key].limit
          })
        }
        return this.limitsArray;
      }),
      tap(limits => {
        this._limits.next(limits);
      })
    );
  }

  updateTC(userId: string, ASNDatabaseID: string, data: any) {
    return this.authService.Token.pipe(
      take(1), 
      switchMap(token => {
      return this.httpClient.put(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/TCs/${data.key}.json?auth=${token}`, {
        key: data.key,
        TCValue: data.TCValue,
        Width: data.Width,
        Height: data.Height,
        Inners: data.Inners
      });
    }));
  }

  setLimit(userID: string, ASNDatabaseID: string, TC_KEY: string, limit: number) {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        let fetchedToken = token;
        return this.httpClient.patch(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${ASNDatabaseID}/TCs/${TC_KEY}.json?auth=${fetchedToken}`, 
          { 
            Limit: limit
          }
        )
      })
    )
  }

  // fetchSingleTC(userId: string, ASNDatabaseID: string, PID: string) {
  //   return this.authService.Token.pipe(take(1), switchMap(token => {
  //     return this.httpClient.get
  //     <{key: string,  TCValue: string, TCIN: number, TCK: number}>
  //     (`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/Pallets/${PID}.json?auth=${token}`);
  //   }));
  // }

  fetchTC(TC_KEY: string ,userID: string, DeliveryID: string) {
    let fetchedToken: string;
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.httpClient.get<TC>(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${DeliveryID}/TCs/${TC_KEY}.json?auth=${fetchedToken}`)
      }),
      map(tcData => {
        return new TC(
          tcData.key,
          tcData.TCValue,
          tcData.Width,
          tcData.Height,
          tcData.Inners
        );
      })
    );
  }

  onPalletEdit(userId: string, ASNDatabaseID: string, PID: string, V: string, K: number, IN: number) {
    return this.authService.Token.pipe(take(1), switchMap(token => {
      return this.httpClient.put(`https://dhl-delivery-db.firebaseio.com/receive-history/${userId}/deliveries/${ASNDatabaseID}/Pallets/${PID}.json?auth=${token}`, {
        key: PID,
        TCValue: V,
        TCK: K,
        TCIN: IN
      });
    }))
  }

  deleteSingleTC(userID: string, TC_KEY: string, DeliveryID: string) {
    let fetchedToken: string;
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.httpClient.delete(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${DeliveryID}/TCs/${TC_KEY}.json?auth=${fetchedToken}`)
      }),
      switchMap(() => {
        return this._tcs;
      }),
      take(1),
      tap(tcs => {
        this._tcs.next(tcs.filter(x => x.key !== TC_KEY));
      })
    );
  }

  deleteLimit(userID: string, ASNDatabaseID: string, TC_KEY: string) {
    let fetchedToken: string;
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.httpClient.patch(`https://dhl-delivery-db.firebaseio.com/receive-history/${userID}/deliveries/${ASNDatabaseID}/TCs/${TC_KEY}.json?auth=${fetchedToken}`, {
          Limit: null
        })
      })
    )}
}
