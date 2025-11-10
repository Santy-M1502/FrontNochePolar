import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coments } from './coments';

describe('Coments', () => {
  let component: Coments;
  let fixture: ComponentFixture<Coments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
