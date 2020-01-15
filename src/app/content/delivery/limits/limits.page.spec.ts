import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitsPage } from './limits.page';

describe('LimitsPage', () => {
  let component: LimitsPage;
  let fixture: ComponentFixture<LimitsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LimitsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
