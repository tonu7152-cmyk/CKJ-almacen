import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MaterialService } from './material';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('MaterialService', () => {
  let service: MaterialService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MaterialService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MaterialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
