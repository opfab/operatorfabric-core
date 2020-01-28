
import {Card} from "@ofModel/card.model";
import {UserContext} from "@ofModel/user-context.model";

export class DetailContext{
    constructor(readonly card:Card, readonly userContext: UserContext){}
}