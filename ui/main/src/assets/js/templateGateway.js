function ext_action(responseData){
    console.log(new Date().toISOString(),`opfab action called - ${responseData.lock} - ${responseData.state}`)
}

let templateGateway = {
    validyForm: function(formData=null) {
        return this.isValid = undefined;
    },
    childCards: []
};