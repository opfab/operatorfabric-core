import {ThirdActionHolder} from "@ofModel/thirds.model";
import {createEntityAdapter, EntityAdapter, EntityState} from "@ngrx/entity";

export interface ThirdActionState extends  EntityState<ThirdActionHolder>{
    selectedThirdActionId:string;
    thirdActionHolder: ThirdActionHolder[];
    error: string;

}

export const ThirdActionAdapter: EntityAdapter<ThirdActionHolder> =
    createEntityAdapter<ThirdActionHolder>({
    selectId: (holder:ThirdActionHolder)=> `${holder.publisher}_${holder.processInstanceId}_${holder.stateName}`
});

export const initialThirdActionState: ThirdActionState = ThirdActionAdapter.getInitialState({
    selectedThirdActionId:null,
    thirdActionHolder:[],
    error:''
});
