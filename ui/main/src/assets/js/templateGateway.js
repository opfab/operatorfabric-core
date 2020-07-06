function ext_action(responseData){
    console.log(`opfab action called - ${responseData.lock} - ${responseData.state}`)
    // console.log('test')
}

let templateGateway = {
    validyForm: function(formData=null) {
        return this.isValid = undefined;
    },
    childCards: []
};