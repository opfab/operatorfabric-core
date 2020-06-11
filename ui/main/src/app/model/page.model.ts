


export class Page<T> {
    /* istanbul ignore next */
    constructor(
        readonly totalPages: number,
        readonly totalElements: number,
        readonly content: T[]
    ) {
    }
}
