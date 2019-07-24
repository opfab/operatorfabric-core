import {Action as ThirdAction, ThirdActionHolder} from "@ofModel/thirds.model";
import {createEntityAdapter, EntityAdapter, EntityState} from "@ngrx/entity";

export interface ThirdActionState extends  EntityState<ThirdAction>{
    selectedThirdActionId:string;
    thirdActions: ThirdAction[];
    error: string;
}

export const ThirdActionAdapter: EntityAdapter<ThirdAction> =
    createEntityAdapter<ThirdAction>({
    selectId: (taction:ThirdAction)=> `${taction.key}`
});

export const ThirdActionHolderAdapter : EntityAdapter<ThirdActionHolder>=
    createEntityAdapter<ThirdActionHolder>(
        {selectId: (holder:ThirdActionHolder)=> `${holder.publisher}_${holder.processName}_${holder.version}_${holder.stateName}`
});

export const initialThirdActionState: ThirdActionState = ThirdActionAdapter.getInitialState({
    selectedThirdActionId:null,
    thirdActions:[],
    error:''
});
