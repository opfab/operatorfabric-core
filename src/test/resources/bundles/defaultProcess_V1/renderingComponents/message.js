(function () {
    return {
        handlebarsTemplate: /*html*/ `
        
        <style>
        .template-style{
	        font-size: 26px;
        	width:100%;
        }
        </style>


        <h4> Hello {{userContext.login}}, you received the following message </h4>   
        <br/>
        <div class="opfab-border-box" style="width:100%; display:inline-block">
            <div class="template-style">
            <span id="richMessage">{{card.data.richMessage}}</span>
            </div>
        </div>


        <br/>
        <br/>
        <br/>
        `,
        init: function (document) {
            console.log('Rendering component initialized');
            opfab.richTextEditor.showRichMessage(document.getElementById('richMessage'));
        }
    };
})();
