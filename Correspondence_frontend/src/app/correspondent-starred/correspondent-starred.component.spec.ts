import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondentStarredComponent } from './correspondent-starred.component';

describe('CorrespondentStarredComponent', () => {
  let component: CorrespondentStarredComponent;
  let fixture: ComponentFixture<CorrespondentStarredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrespondentStarredComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondentStarredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
