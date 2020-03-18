import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncryptLoginComponent } from './encrypt-login.component';

describe('EncryptLoginComponent', () => {
  let component: EncryptLoginComponent;
  let fixture: ComponentFixture<EncryptLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncryptLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
