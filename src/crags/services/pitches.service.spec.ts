/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PitchesService } from './pitches.service';

describe('Service: Pitches', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PitchesService]
    });
  });

  it('should ...', inject([PitchesService], (service: PitchesService) => {
    expect(service).toBeTruthy();
  }));
});
