import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsDataComponent } from './accounts-data.component';

describe('AccountsDataComponent', () => {
  let component: AccountsDataComponent;
  let fixture: ComponentFixture<AccountsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
