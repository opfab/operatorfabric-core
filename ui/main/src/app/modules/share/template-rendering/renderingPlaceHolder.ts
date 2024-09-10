import {Card} from '@ofModel/card.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {HandlebarsService} from 'app/business/services/card/handlebars.service';
import 'chartjs-adapter-date-fns'; // needed for chartjs to work with date-fns in web components

export class RenderingPlaceHolder extends HTMLElement {
    internalDoc: any;
    opfabRenderingComponent: any;
    constructor() {
        super();
    }

    connectedCallback() {
        /*eslint-disable-next-line*/
        console.log('RenderingPlaceHolder connected');
        this.internalDoc = this.attachShadow({mode: 'open'});
    }

    getInternalRenderingDocument() {
        return this.internalDoc;
    }

    setOpfabRenderingComponent(renderingComponentName: string, renderingComponent: any, detailContext: DetailContext) {
        this.opfabRenderingComponent = renderingComponent;

        const html = HandlebarsService.executeTemplateString(
            `process_${detailContext.card.process}_version_${detailContext.card.processVersion}_template_${renderingComponentName}`,
            this.opfabRenderingComponent.handlebarsTemplate,
            detailContext
        );
        this.internalDoc.innerHTML = "<link rel='stylesheet' href='shared/css/opfab-application.css'/>" + html;
        this.opfabRenderingComponent.init(this.shadowRoot, detailContext.card);
    }

    reset() {
        this.internalDoc.innerHTML = '';
    }
}
