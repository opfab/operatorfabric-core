import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { EntitiesService } from '@ofServices/entities.service';
import { StoreModule } from '@ngrx/store';
import { appReducer } from '@ofStore/index';
import { Entity } from '../model/entity.model';

describe('EntitiesService', () => {
  let httpMock: HttpTestingController;
  let entitiesService: EntitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntitiesService],
      imports: [HttpClientTestingModule,
        StoreModule.forRoot(appReducer)
      ],
    });
    httpMock = TestBed.get(HttpTestingController);
    entitiesService = TestBed.get(EntitiesService);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(entitiesService).toBeTruthy();
  });
  describe('#getAllEntities', () => {
    it('should return an Observable<Entity[]>', () => {
      const listEntities: Entity[] = [];
      const entity1 = new Entity('ENTITY1', 'Entity 1 name', 'Entity 1 short description');
      const entity2 = new Entity('ENTITY2', 'Entity 2 name', 'Entity 2 short description');
      listEntities.push(entity1);
      listEntities.push(entity2);
      entitiesService.getAllEntities().subscribe(result => {
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('ENTITY1');
        expect(result[1].id).toBe('ENTITY2');
      });
      const req = httpMock.expectOne(`${environment.urls.entities}`);
      expect(req.request.method).toBe('GET');
      req.flush(listEntities);
    });
  });
})
