import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbededComponent } from './embeded.component';

describe('EmbededComponent', () => {
  let component: EmbededComponent;
  let fixture: ComponentFixture<EmbededComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmbededComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbededComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
