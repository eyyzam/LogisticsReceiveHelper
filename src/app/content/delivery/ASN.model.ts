import { Pallet, TC } from './delivery.service';

export class ASN {
  constructor(
		public key: string,
		public ASN: string,
		public TCs: TC[],
		public Pallets: Pallet[],
		public userLogin: string,
		public Date: Date
	) {}
}