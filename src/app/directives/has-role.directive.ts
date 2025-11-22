import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  @Input() set appHasRole(role: string) {
    const userRole = 'admin';
    this.vcRef.clear();
    if (userRole === role) this.vcRef.createEmbeddedView(this.tplRef);
  }

  constructor(private tplRef: TemplateRef<any>, private vcRef: ViewContainerRef) {}
}
