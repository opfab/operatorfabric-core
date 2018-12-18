import {Guid} from "guid-typescript";

export interface AuthState {
    identifier: string;
    clientId: Guid;
    token: string;
    expirationDate: Date;
    denialReason: string;
}

export const authInitialState: AuthState = {
    identifier: null,
    clientId: null,
    token: null,
    expirationDate: new Date(0),
    denialReason: null
};