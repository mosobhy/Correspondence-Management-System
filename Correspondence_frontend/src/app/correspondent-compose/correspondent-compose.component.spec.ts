import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondentComposeComponent } from './correspondent-compose.component';

describe('CorrespondentComposeComponent', () => {
  let component: CorrespondentComposeComponent;
  let fixture: ComponentFixture<CorrespondentComposeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrespondentComposeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondentComposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
