import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[estadoColor]'
})
export class EstadoColorDirective implements OnChanges {

  @Input('estadoColor') activo: boolean | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    if (!this.activo) {
      this.renderer.setStyle(this.el.nativeElement, 'background-color', '#aa3528ff');
      this.renderer.setStyle(this.el.nativeElement, 'color', 'white');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'background-color', '#3b82f6');
      this.renderer.setStyle(this.el.nativeElement, 'color', 'white');
    }
  }
}