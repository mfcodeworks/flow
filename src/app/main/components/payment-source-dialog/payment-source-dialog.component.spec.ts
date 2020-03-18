import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSourceDialogComponent } from './payment-source-dialog.component';

describe('PaymentSourceDialogComponent', () => {
  let component: PaymentSourceDialogComponent;
  let fixture: ComponentFixture<PaymentSourceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSourceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
