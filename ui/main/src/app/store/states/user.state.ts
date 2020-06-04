

export interface UserState {
    registered : boolean,
    group : string[]
}

export const userInitialState : UserState = {
    registered : false,
    group : null
}
