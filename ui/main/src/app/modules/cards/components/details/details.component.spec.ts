
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DetailsComponent} from './details.component';
import {TranslateModule} from "@ngx-translate/core";
import {translateConfig} from "../../../../translate.config";

describe('DetailsComponent', () => {
    let component: DetailsComponent;
    let fixture: ComponentFixture<DetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(translateConfig)],
            declarations: [DetailsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
