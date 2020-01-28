
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {PatchSettings} from "@ofActions/settings.actions";
import {buildSettingsSelector} from "@ofSelectors/settings.selectors";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {Subject, timer} from "rxjs";
import {debounce, distinctUntilChanged, filter, first, map, takeUntil} from "rxjs/operators";
import {FormGroup} from "@angular/forms";
import * as _ from "lodash";
import {selectIdentifier} from "@ofSelectors/authentication.selectors";

@Component({
    selector: 'of-base-setting',
    templateUrl: './base-setting.component.html'
})
export class BaseSettingComponent implements OnInit, OnDestroy {

    @Input() public settingPath: string;
    @Input() public messagePlaceholder: string;
    @Input() public requiredField: boolean;
    private ngUnsubscribe$ = new Subject<void>();
    protected setting$;
    protected placeholder$;
    form: FormGroup;
    private baseSettings = {};

    constructor(protected store: Store<AppState>) {

    }

    ngOnInit() {
        this.form = this.initFormGroup();
        if(!this.form){
            throw 'Trying to instanciate component without form';
        }
        this.setting$ = this.store.select(buildSettingsSelector(this.settingPath))
            .pipe(takeUntil(this.ngUnsubscribe$));
            this.setting$.subscribe(next => this.updateValue(next));
        this.setting$
            .pipe(first())
            .subscribe(()=>
                this.form.valueChanges
                    .pipe(
                        takeUntil(this.ngUnsubscribe$),
                        filter(()=>this.form.valid),
                        distinctUntilChanged((formA, formB) => this.isEqual(formA, formB)),
                        debounce(() => timer(500))
                    )
                    .subscribe(next=>this.dispatch(this.convert(next)))
            );
        this.placeholder$ = this.store.select(buildConfigSelector(`settings.${this.settingPath}`))
            .pipe(takeUntil(this.ngUnsubscribe$));
        this.store.select(selectIdentifier)
            .pipe(
                takeUntil(this.ngUnsubscribe$),
                map(id=>{return {login:id}}))
            .subscribe(next=>this.baseSettings = next);

    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    protected updateValue(value:any){

    }

    protected initFormGroup():FormGroup{
        return null
    }

    protected convert(value:any):any{
        return value;
    }


    private dispatch(value:any) {
        const settings = {...this.baseSettings};
        settings[this.settingPath] = value.setting;
        this.store.dispatch(new PatchSettings({settings: settings}));
    }

    protected isEqual(formA, formB):boolean{
        return _.isEqual(formA, formB);
    }

    protected submitValue(){
        alert('submitted');
    }

}
