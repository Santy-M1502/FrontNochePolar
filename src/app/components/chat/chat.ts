import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal, computed, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements AfterViewChecked {
  @ViewChild('chatBox') chatBox!: ElementRef<HTMLDivElement>;

  chatOpen = signal(false);
  chats = signal<{ me: boolean; text: string; file?: string }[]>([]);
  newMessage = signal('');

  tieneChats = computed(() => this.chats().length > 0);

  exampleChat: { me: boolean; text: string }[] = [
    { me: false, text: "hey como vas?" },
    { me: true, text: "todo tranqui acá probando el layout" },
    { me: false, text: "se ve lindo 👀" }
  ];

  startExampleChat() {
    this.chats.set([...this.exampleChat]);
  }

  ngAfterViewChecked() {
    if (this.chatBox) {
      const box = this.chatBox.nativeElement;
      box.scrollTop = 0; // column-reverse mantiene último mensaje visible
    }
  }

  sendMessage() {
    const msg = this.newMessage().trim();
    if (!msg) return;
    this.chats.update(curr => [{ me: true, text: msg }, ...curr]);
    this.newMessage.set('');
  }

  addEmoji(emoji: string) {
    this.newMessage.update(curr => curr + emoji);
  }

  attachFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const url = URL.createObjectURL(file);
    this.chats.update(curr => [{ me: true, text: file.name, file: url }, ...curr]);
    input.value = '';
  }

  openCloseModal(){
    this.chatOpen.set(!this.chatOpen());
  }
}
