import { TestBed } from '@angular/core/testing';

import { CountsServiceService } from './counts-service.service';

describe('CountsServiceService', () => {
  let service: CountsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
