import { TestBed } from '@angular/core/testing';

import { IframeService } from './iframe.service';

describe('IframeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IframeService = TestBed.get(IframeService);
    expect(service).toBeTruthy();
  });
});
