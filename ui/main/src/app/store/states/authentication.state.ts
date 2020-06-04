

import {Guid} from 'guid-typescript';
import {Message} from "@ofModel/message.model";

export interface AuthState {
    code: string;
    identifier: string;
    clientId: Guid;
    token: string;
    expirationDate: Date;
    message: Message;
    firstName: string;
    lastName: string;
    isImplicitlyAuthenticated: boolean;
}

export const authInitialState: AuthState = {
    code: null,
    identifier: null,
    clientId: null,
    token: null,
    expirationDate: new Date(0),
    message: null,
    firstName: null,
    lastName: null,
    isImplicitlyAuthenticated: false
};
