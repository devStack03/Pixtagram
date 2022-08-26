import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatChatsSidenavComponentComponent } from './chat-chats-sidenav-component.component';

describe('ChatChatsSidenavComponentComponent', () => {
  let component: ChatChatsSidenavComponentComponent;
  let fixture: ComponentFixture<ChatChatsSidenavComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatChatsSidenavComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatChatsSidenavComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
