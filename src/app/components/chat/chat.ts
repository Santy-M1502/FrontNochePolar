import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal, computed, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ChatHttpService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements AfterViewChecked {

  @ViewChild('chatBox') chatBox!: ElementRef<HTMLDivElement>;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private userService: UserService,
    private chatHttp: ChatHttpService,
  ) {}

  chatOpen = signal(false);

  amigos = signal<{ id: string; nombre: string }[]>([]);

  destinatarioId = signal<string | null>(null);

  chats = signal<{ me: boolean; text: string }[]>([]);
  newMessage = signal('');

  tieneChatAbierto = computed(() => this.destinatarioId() !== null);

  ngOnInit() {
    const token = this.authService.getToken() || '';
    this.socketService.connect(token);

    this.userService.getFriends().subscribe((res: any) => {
      this.amigos.set(res.map((u: any) => ({
        id: u._id,
        nombre: u.username
      })));
    });

    this.socketService.onMessage((data) => {
      if (data.from === this.destinatarioId()) {
        this.chats.update(curr => [...curr, { me: false, text: data.msg }]);
      }
    });
  }

  ngAfterViewChecked() {
    if (this.chatBox) {
      this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
    }
  }

  abrirChatCon(id: string) {
    this.destinatarioId.set(id);

    this.chatHttp.getConversation(id).subscribe((conv: any) => {
      const msgs = conv?.messages?.map((m: any) => ({
        me: m.sender._id === this.authService.getUserId(),
        text: m.text,
      })) || [];
      this.chats.set(msgs);
    });
  }

  sendMessage() {
    const msg = this.newMessage().trim();
    if (!msg || !this.destinatarioId()) return;

    this.socketService.sendMessage(this.destinatarioId()!, msg);

    this.chats.update(curr => [...curr, { me: true, text: msg }]);

    this.chatHttp.sendMessage(this.destinatarioId()!, msg).subscribe();

    this.newMessage.set('');
  }

  openCloseModal() {
    this.chatOpen.set(!this.chatOpen());
  }
}
