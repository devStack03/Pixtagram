import { TestBed, inject } from '@angular/core/testing';

import { S3UploaderService } from './s3-uploader.service';

describe('S3UploaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [S3UploaderService]
    });
  });

  it('should be created', inject([S3UploaderService], (service: S3UploaderService) => {
    expect(service).toBeTruthy();
  }));
});
