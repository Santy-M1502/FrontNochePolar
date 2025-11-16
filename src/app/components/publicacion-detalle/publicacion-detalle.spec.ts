import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicacionDetalleComponent } from './publicacion-detalle';

describe('PublicacionDetalle', () => {
  let component: PublicacionDetalleComponent;
  let fixture: ComponentFixture<PublicacionDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicacionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
