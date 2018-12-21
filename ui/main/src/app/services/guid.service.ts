import {Inject} from "@angular/core";
import {Guid} from "guid-typescript";

@Inject({
    providedIn: 'root'
})
export class GuidService {

    private readonly guid: Guid;

    constructor() {
        this.guid = Guid.create();
    }

    getCurrentGuid(): Guid {
        return this.guid;
    }

    getCurrentGuidString():string{
        return this.getCurrentGuid().toString();
    }
}