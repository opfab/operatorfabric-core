import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Component} from "@angular/core";

@Component({
    selector:'confirm-modal-component',
    templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {
    constructor(public modal: NgbActiveModal) {}
    dismiss(){
        this.modal.dismiss(ThirdActionComporentModalReturn.DISMISS);
    }

    ok(){
        this.modal.close(ThirdActionComporentModalReturn.OK);
    }

    cancel(){
        this.modal.dismiss(ThirdActionComporentModalReturn.CANCEL);
    }
}

export enum ThirdActionComporentModalReturn{
    CANCEL,OK,DISMISS
}
