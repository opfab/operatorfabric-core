

export class User {

    public constructor(
    readonly login:string,
    readonly firstName:string,
    readonly lastName:string,
    readonly groups?: Array<string>,
    readonly entities?: Array<string>
){}

}
