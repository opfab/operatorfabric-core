import { TestBed } from '@angular/core/testing';
import { GroupsService } from './groups.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('GroupsService', () => {
  let service: GroupsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupsService],
      imports:[  HttpClientTestingModule],

  });
  httpMock = TestBed.get(HttpTestingController);
  service = TestBed.get(GroupsService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
