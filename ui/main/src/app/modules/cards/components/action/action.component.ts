
import {Component, Input, OnInit} from '@angular/core';
import {Action} from "@ofModel/thirds.model";
import {I18n} from "@ofModel/i18n.model";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ThirdActionService} from "@ofServices/third-action.service";

@Component({
    selector: 'of-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {

    @Input()  action: Action;
    @Input()  i18nPrefix: I18n;
    @Input()  lightCardId: string;
    @Input()  actionUrlPath: string;
    private currentActionPath: string;
    /* istanbul ignore next */
    constructor(
        private _modalService: NgbModal
        , private actionService: ThirdActionService) {
    }

    ngOnInit(): void {
        this.currentActionPath = `${this.actionUrlPath}/${this.action.key}`;
    }

    submit() {
        this.actionService.submit(
            this.lightCardId
            , this.currentActionPath
            , this.action
            , this._modalService);
    }
}
