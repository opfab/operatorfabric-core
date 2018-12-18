
/*
* following configuration initialize the state of router in order to enable the currentUrl in app.component.ts
* source: https://github.com/ngrx/platform/issues/835
*/
export const initialState = {
    state: {
        url: window.location.pathname,
        params: {},
        queryParams: {}
    },
    navigationId: 0
}