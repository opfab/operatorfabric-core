
import {ThirdMenu} from "@ofModel/thirds.model";

export interface MenuState{
    menu: ThirdMenu[],
    loading: boolean,
    error:string,
    selected_iframe_url: string
}

export const menuInitialState: MenuState = {
    menu:[],
    loading: false,
    error:null,
    selected_iframe_url: null
}
