import { TestBed } from '@angular/core/testing';

import { TcService } from './tc.service';

describe('TcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TcService = TestBed.get(TcService);
    expect(service).toBeTruthy();
  });
});
