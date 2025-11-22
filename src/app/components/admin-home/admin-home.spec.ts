import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHome } from './admin-home';

describe('AdminHome', () => {
  let component: AdminHome;
  let fixture: ComponentFixture<AdminHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
