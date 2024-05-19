import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondentInboxComponent } from './correspondent-inbox.component';

describe('CorrespondentInboxComponent', () => {
  let component: CorrespondentInboxComponent;
  let fixture: ComponentFixture<CorrespondentInboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrespondentInboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondentInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
