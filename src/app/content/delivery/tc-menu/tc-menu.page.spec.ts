import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TcMenuPage } from './tc-menu.page';

describe('TcMenuPage', () => {
  let component: TcMenuPage;
  let fixture: ComponentFixture<TcMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TcMenuPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TcMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
