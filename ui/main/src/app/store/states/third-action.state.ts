import {Action as ThirdAction} from "@ofModel/thirds.model";

export interface ThirdActionState {

    thirdActions: ThirdAction[];
    error: string;

}

export const initialThirdActionState: ThirdActionState = {
    thirdActions: null,
    error: ''
}
