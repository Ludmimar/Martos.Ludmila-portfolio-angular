import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetalAnimation } from './petal-animation';

describe('PetalAnimation', () => {
  let component: PetalAnimation;
  let fixture: ComponentFixture<PetalAnimation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetalAnimation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetalAnimation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
