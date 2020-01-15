import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndirectPage } from './indirect.page';

describe('IndirectPage', () => {
  let component: IndirectPage;
  let fixture: ComponentFixture<IndirectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndirectPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndirectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
