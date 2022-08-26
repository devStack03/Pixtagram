import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeProfilePopupComponent } from './change-profile-popup.component';

describe('ChangeProfilePopupComponent', () => {
  let component: ChangeProfilePopupComponent;
  let fixture: ComponentFixture<ChangeProfilePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeProfilePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeProfilePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
