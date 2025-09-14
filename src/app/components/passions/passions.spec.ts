import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Passions } from './passions';

describe('Passions', () => {
  let component: Passions;
  let fixture: ComponentFixture<Passions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Passions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Passions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
