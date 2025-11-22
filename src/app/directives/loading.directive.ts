import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({ selector: '[appLoading]' })
export class LoadingDirective {
  @Input() set appLoading(isLoading: boolean) {
    if (isLoading) {
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}
