import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLeftSidenavComponent } from './chat-left-sidenav.component';

describe('ChatLeftSidenavComponent', () => {
  let component: ChatLeftSidenavComponent;
  let fixture: ComponentFixture<ChatLeftSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatLeftSidenavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatLeftSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
