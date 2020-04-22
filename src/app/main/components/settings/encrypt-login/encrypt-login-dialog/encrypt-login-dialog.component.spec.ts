import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncryptLoginDialogComponent } from './encrypt-login-dialog.component';

describe('EncryptLoginDialogComponent', () => {
  let component: EncryptLoginDialogComponent;
  let fixture: ComponentFixture<EncryptLoginDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncryptLoginDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
