import { TestBed } from '@angular/core/testing';

import { BarcodesService } from './barcodes.service';

describe('BarcodesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BarcodesService = TestBed.get(BarcodesService);
    expect(service).toBeTruthy();
  });
});
