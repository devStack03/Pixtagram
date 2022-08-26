import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUserSidenavComponentComponent } from './chat-user-sidenav-component.component';

describe('ChatUserSidenavComponentComponent', () => {
  let component: ChatUserSidenavComponentComponent;
  let fixture: ComponentFixture<ChatUserSidenavComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatUserSidenavComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUserSidenavComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
