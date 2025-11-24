import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="scroll-top-btn" 
      [class.show]="showBtn()"
      (click)="scrollToTop()"
      type="button">
      ↑
    </button>
  `,
  styles: [`
    .scroll-top-btn {
      position: fixed;
      left: 24px;
      bottom: 24px;
      background: linear-gradient(135deg, #4a7cea 0%, #2b4a8a 100%);
      color: white;
      border: none;
      padding: 16px 22px;
      border-radius: 50%;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(74, 126, 234, 0.4);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
      transform: scale(0.8);
    }

    .scroll-top-btn.show {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }

    .scroll-top-btn:hover {
      filter: brightness(1.15);
      box-shadow: 0 6px 16px rgba(74, 126, 234, 0.6);
    }

    .scroll-top-btn:active {
      transform: scale(0.95);
    }
  `]
})
export class ScrollToTopComponent {
  showBtn = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.showBtn.set(scrollTop > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
