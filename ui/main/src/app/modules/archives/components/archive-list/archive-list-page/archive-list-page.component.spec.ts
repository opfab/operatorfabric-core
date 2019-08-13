import { Store, StoreModule } from '@ngrx/store';
import { AppState, appReducer, storeConfig } from '@ofStore/index';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ArchiveListPageComponent } from './archive-list-page.component';


xdescribe('AtchiveListpageComponent', () => {
  let component: ArchiveListPageComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<ArchiveListPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(appReducer, storeConfig),
      ],
      providers: [Store]
    }).compileComponents();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    // avoid exceptions during construction and init of the component
    // spyOn(store, 'pipe').and.callFake(() => of('/test/url'));
    fixture = TestBed.createComponent(ArchiveListPageComponent);
    component = fixture.componentInstance;
  });

  it('sould create component', () => {
    expect(component).toBeTruthy();
  });
})
