import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Publication } from './publication';

describe('Publication', () => {
  let component: Publication;
  let fixture: ComponentFixture<Publication>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Publication]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Publication);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
