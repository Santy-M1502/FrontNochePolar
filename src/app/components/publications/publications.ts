import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from "../side-nav/side-nav";
import { Chat } from "../chat/chat";

@Component({
  selector: 'app-post-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, Chat],
  templateUrl: './publications.html',
  styleUrls: ['./publications.css']
})
export class Publications {

  newPost: string = '';

  posts = [
    { user: "santi", avatar: "https://i.pravatar.cc/120?img=1", text: "holaaa esto es una publicación", time: "2m" },
    { user: "maria", avatar: "https://i.pravatar.cc/120?img=2", text: "amo la interfaz nueva 💙", time: "1h" }
  ];

  sendPost(){
    if(!this.newPost.trim()) return;

    this.posts.unshift({
      user: "tú",
      avatar: "https://i.pravatar.cc/120?img=5",
      text: this.newPost,
      time: "Ahora"
    });

    this.newPost = '';
  }
}
