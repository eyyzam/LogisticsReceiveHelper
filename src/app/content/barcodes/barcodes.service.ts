import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, take, switchMap, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Barcode } from './barcode.model';

interface BARCODE_KEY_ARRAY {
	key: string;
}

@Injectable({
  providedIn: 'root'
})

export class BarcodesService {

	private _savedBarcodes = new BehaviorSubject<Barcode[]>([]);
	
	get savedBarcodes() {
		return this._savedBarcodes.asObservable();
	}

  constructor(private httpClient: HttpClient, private authService: AuthService) { }

	newMyBarcode(
		barcodeValue: string,
		barcodeDisplayValue: string,
		userID: string
	) {
		let generatedId: string;
		let newBarcode: Barcode;
		let fetchedToken: string;
		return this.authService.Token.pipe(
			take(1),
			switchMap(token => {
				newBarcode = new Barcode(
					Math.random().toString(),
					barcodeValue,
					barcodeDisplayValue
				);
				fetchedToken = token;
				return this.httpClient.post<{name: string}>(`https://dhl-delivery-db.firebaseio.com/barcodes/${userID}/saved-barcodes.json?auth=${fetchedToken}`, 
					{ ...newBarcode, key: null }
				);
			}),
			switchMap(resData => {
				generatedId = resData.name;
				return this.httpClient.patch(`https://dhl-delivery-db.firebaseio.com/barcodes/${userID}/saved-barcodes/${generatedId}.json?auth=${fetchedToken}`,
					{ key: generatedId }
				);
			}),
			take(1),
			switchMap(patch => {
				return this._savedBarcodes;
			}),
			take(1),
			tap(barcodes => {
				newBarcode.key = generatedId;
				this._savedBarcodes.next(barcodes.concat(newBarcode));
			})
		)
	}

	fetchSavedBarcodes(userID: string) {
		let fetchedToken: string;
		return this.authService.Token.pipe(
			take(1),
			switchMap(token => {
				fetchedToken = token;
				return this.httpClient.get<{[key: string]: Barcode}>(`https://dhl-delivery-db.firebaseio.com/barcodes/${userID}/saved-barcodes.json?auth=${fetchedToken}`)
			}),
			map(resData => {
				const myBarcodes = [];
				for (const key in resData) {
					if (resData.hasOwnProperty(key)) {
						myBarcodes.push(
							new Barcode(
								resData[key].key,
								resData[key].barcodeValue,
								resData[key].barcodeDisplayValue
							)
						)
					}
				}
				return myBarcodes; 
			}),
			tap(barcodes => {
				this._savedBarcodes.next(barcodes);
			})
		)
	}

	fetchSavedBarcode(BARCODE_KEY: string, userID: string) {
		let fetchedToken: string;
		let savedBarcodeDBKey: string;
		return this.authService.Token.pipe(
			take(1),
			switchMap(token => {
				fetchedToken = token;
				savedBarcodeDBKey = BARCODE_KEY;
				return this.httpClient.get<Barcode>(`https://dhl-delivery-db.firebaseio.com/barcodes/${userID}/saved-barcodes/${savedBarcodeDBKey}.json?auth=${fetchedToken}`)
			}), 
			map(barcodeData => {
				return new Barcode(
					barcodeData.key,
					barcodeData.barcodeValue,
					barcodeData.barcodeDisplayValue
				);
			})
		);
	}

	deleteSingleSavedBarcode(userID: string, BARCODE_KEY: string) {
		let fetchedToken: string;
		let savedBarcodeDBKey: string;
		return this.authService.Token.pipe(
			take(1),
			switchMap(token => {
				fetchedToken = token;
				savedBarcodeDBKey = BARCODE_KEY;
				return this.httpClient.delete(`https://dhl-delivery-db.firebaseio.com/barcodes/${userID}/saved-barcodes/${savedBarcodeDBKey}.json?auth=${fetchedToken}`)
			}),
			switchMap(() => {
				return this._savedBarcodes;
			}),
			take(1),
			tap(barcodes => {
				this._savedBarcodes.next(barcodes.filter(x => x.key !== savedBarcodeDBKey));
			})
		);
	}

	deleteMultipleSavedBarcodes(userID: string, BARCODE_KEY_ARRAY: BARCODE_KEY_ARRAY[]) {
		let fetchedToken: string;
		let savedBarcodeDBKey: string;
		return this.authService.Token.pipe(
			take(1),
			switchMap(token => {
				fetchedToken = token;
				for (const x in BARCODE_KEY_ARRAY) {
					if (BARCODE_KEY_ARRAY[x].key !== undefined ) {
						savedBarcodeDBKey = BARCODE_KEY_ARRAY[x].key;
						return this.httpClient.delete(`https://dhl-delivery-db.firebaseio.com/barcodes/${userID}/saved-barcodes/${savedBarcodeDBKey}.json?auth=${fetchedToken}`)
					}
				}
			}),
			take(1),
			switchMap(() => {
				return this._savedBarcodes;
			}),
			take(1),
			tap(barcodes => {
				for (const x in BARCODE_KEY_ARRAY) {
					this._savedBarcodes.next(barcodes.filter(x => x.key !== x.key));
				}
			})
		);
	}
}
