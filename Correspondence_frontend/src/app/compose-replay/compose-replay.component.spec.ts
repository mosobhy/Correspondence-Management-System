import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposeReplayComponent } from './compose-replay.component';

describe('ComposeReplayComponent', () => {
  let component: ComposeReplayComponent;
  let fixture: ComponentFixture<ComposeReplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComposeReplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposeReplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
