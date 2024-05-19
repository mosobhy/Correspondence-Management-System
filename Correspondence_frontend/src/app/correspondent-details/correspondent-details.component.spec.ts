import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondentDetailsComponent } from './correspondent-details.component';

describe('CorrespondentDetailsComponent', () => {
  let component: CorrespondentDetailsComponent;
  let fixture: ComponentFixture<CorrespondentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrespondentDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
