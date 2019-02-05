export class Third{
    constructor(
        readonly name:string,
        readonly version:string,
        readonly label: string,
        readonly templates?:string[],
        readonly csses?:string[],
        readonly locales?:string[],
        readonly entries?:ThirdMenuEntry[]
    ){}
}

export class ThirdMenuEntry{
    constructor(
        readonly id:string,
        readonly label: string,
        readonly link: string
    ){}
}

export class ThirdMenu{
    constructor(
        readonly label: string,
        readonly id: string,
        readonly entries: ThirdMenuEntry[]){}
}