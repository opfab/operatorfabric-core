import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFilterComponent } from './multi-filter.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { translateConfig } from 'app/translate.config';
import { HttpClientModule } from '@angular/common/http';
import { zip } from 'rxjs';

describe('MultiFilterComponent', () => {
  let component: MultiFilterComponent;
  let fixture: ComponentFixture<MultiFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot(translateConfig)
      ],
      declarations: [ MultiFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiFilterComponent);
    component = fixture.componentInstance;
  });

  it('should create multi-filter component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
  it('should compute correct value/label list : string', (done) => {
    component.values = ['new-value', 'new-value2'];
    component.preparedList = [];
    fixture.detectChanges();
    expect(component.preparedList[0].value).toEqual('new-value');
    expect(component.preparedList[1].value).toEqual('new-value2');
    zip(component.preparedList[0].label, component.preparedList[1].label).subscribe(([l1, l2]) => {
            expect(l2).toEqual('new-value2');
            done();
        });
    });
    it('should compute correct value/label list : string ', (done) => {
        component.values = ['new-value', 'new-value2'];
        component.preparedList = [];
        fixture.detectChanges();
        expect(component.preparedList[0].value).toEqual('new-value');
        expect(component.preparedList[1].value).toEqual('new-value2');
        zip(component.preparedList[0].label, component.preparedList[1].label).subscribe(([l1, l2]) => {
                expect(l1).toEqual('new-value');
                done();
            });
        });
});
