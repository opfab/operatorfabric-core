export class Third{
    constructor(
        readonly name:string,
        readonly version:string,
        readonly i18nLabelKey: string,
        readonly templates?:string[],
        readonly csses?:string[],
        readonly locales?:string[],
        readonly menuEntries?:ThirdMenuEntry[]
    ){}
}

export class ThirdMenuEntry{
    constructor(
        readonly id:string,
        readonly label: string,
        readonly url: string
    ){}
}

export class ThirdMenu{
    constructor(
        readonly id: string,
        readonly version: string,
        readonly label: string,
        readonly entries: ThirdMenuEntry[]){}
}