import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyComponentComponent } from './notify-component.component';

describe('NotifyComponentComponent', () => {
  let component: NotifyComponentComponent;
  let fixture: ComponentFixture<NotifyComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotifyComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
