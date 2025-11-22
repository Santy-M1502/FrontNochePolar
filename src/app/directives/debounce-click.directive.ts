import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({ selector: '[appDebounceClick]' })
export class DebounceClickDirective {
  @Output() appDebounceClick = new EventEmitter<void>();
  private isCooldown = false;

  @HostListener('click', ['$event'])
  handleClick(event: Event) {
    if (this.isCooldown) return;
    this.isCooldown = true;
    this.appDebounceClick.emit();
    setTimeout(() => this.isCooldown = false, 500);
  }
}
