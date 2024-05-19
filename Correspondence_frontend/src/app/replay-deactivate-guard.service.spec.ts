import { TestBed } from '@angular/core/testing';

import { ReplayDeactivateGuardService } from './replay-deactivate-guard.service';

describe('ReplayDeactivateGuardService', () => {
  let service: ReplayDeactivateGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplayDeactivateGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
