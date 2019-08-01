import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizableComponent } from './resizable.component';

describe('ResizableComponent', () => {
  let component: ResizableComponent;
  let fixture: ComponentFixture<ResizableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResizableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // window.addEventListener('resize', spy);
    fixture = TestBed.createComponent(ResizableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shoud test if the height of the component is available', () => {
    const spyOnResize = spyOn(window, 'onresize');
    expect(spyOnResize).toHaveBeenCalled();
  })
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
