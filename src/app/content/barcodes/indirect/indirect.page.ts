import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-indirect',
  templateUrl: './indirect.page.html',
  styleUrls: ['./indirect.page.scss'],
})
export class IndirectPage implements OnInit {

  indirectBarcodes = [
    {
      barcodeValue: '121',
      barcodeDisplayValue: 'ROZMOWA Z PRZELOZONYM'
    },
    {
      barcodeValue: 'TRAINLR',
      barcodeDisplayValue: 'TRENING'
    },
    {
      barcodeValue: 'ADMIN',
      barcodeDisplayValue: 'DELEGACJA DO ADM/SK'
    },
    {
      barcodeValue: 'I-CLEAN',
      barcodeDisplayValue: 'SPRZATANIE'
    },
    {
      barcodeValue: 'BATTERY',
      barcodeDisplayValue: 'BATERIA'
    },
    {
      barcodeValue: 'IDLE',
      barcodeDisplayValue: 'BRAK PRACY'
    },
    {
      barcodeValue: 'MEETING',
      barcodeDisplayValue: 'SPOTKANIE'
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
