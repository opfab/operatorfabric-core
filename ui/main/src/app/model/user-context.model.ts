
export class UserContext{
    constructor(
        readonly login:string,
        readonly token:string,
        readonly firstName:string,
        readonly lastName:string,
    ){}
}