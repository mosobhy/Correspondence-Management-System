import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondentSentComponent } from './correspondent-sent.component';

describe('CorrespondentSentComponent', () => {
  let component: CorrespondentSentComponent;
  let fixture: ComponentFixture<CorrespondentSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrespondentSentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondentSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
