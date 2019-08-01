import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Action, ActionStatus} from "@ofModel/thirds.model";
import {I18n} from "@ofModel/i18n.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {UpdateAnAction} from "@ofActions/light-card.actions";
import {map} from "rxjs/operators";

@Component({
    selector: 'of-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {

    @Input() readonly action: Action;
    @Input() readonly i18nPrefix: I18n;
    @Input() readonly actionUrlPath: string;
    private url: string;

    constructor(private httpClient: HttpClient, private store: Store<AppState>) {
    }

    ngOnInit() {
        const protocol = 'http://';
        const domain = 'localhost';
        const port = '8080';
        const actionId = this.action.key;
        const resource = `${this.actionUrlPath}/${actionId}`
        this.url = `${protocol}${domain}:${port}${resource}`;
    }

    submit() {
        const fireUpdateActionIfStatusDifferent = map(([hasChanged,currentStatus]:[ boolean,ActionStatus]) => {
            if (hasChanged) {
                this.store.dispatch(
                    new UpdateAnAction({
                        actionKey: this.action.key
                        , status: currentStatus
                    })
                );
            }
            return hasChanged
        });
        const status = this.action as ActionStatus;
        const checkIfReceivedStatusIsDifferentFromCurrentOne = map((currentStatus:ActionStatus)=>{
            const hasChanged = !(status === currentStatus);
            return [hasChanged,currentStatus];
        });

        if (this.action.updateState) {
            // extract a status from current action
            // if difference then send an action to update the action of the card, else nothing.
            // same behavior for the result of the post$
            this.httpClient.get(this.url).pipe(
                checkIfReceivedStatusIsDifferentFromCurrentOne,
                fireUpdateActionIfStatusDifferent).subscribe(
                (hasChanged:boolean)=>{
                    console.log(`For GET is the status different? '${hasChanged}'`, hasChanged)
                }
            );
        }

        this.httpClient.post(this.url, this.action).pipe(
            checkIfReceivedStatusIsDifferentFromCurrentOne
            ,fireUpdateActionIfStatusDifferent
        ).subscribe((hasChanged:boolean)=>{
            console.log(`For POST  is the status different? '${hasChanged}'`)
        });
    }


}
