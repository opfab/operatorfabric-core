/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Card, Detail} from '@ofModel/card.model';
import {ThirdsService} from "../../../../services/thirds.service";
import {HandlebarsService} from "../../services/handlebars.service";
import {DomSanitizer, SafeHtml, SafeResourceUrl} from "@angular/platform-browser";
import {Action, Third} from "@ofModel/thirds.model";
import {zip} from "rxjs";

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {
    public active = false;
    @Input() detail: Detail;
    @Input() card: Card;
    readonly hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _htmlContent: SafeHtml;

    constructor(private element: ElementRef,
                private thirds: ThirdsService,
                private handlebars: HandlebarsService,
                private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();
    }

    private initializeHrefsOfCssLink() {
        if (this.detail && this.detail.styles) {
            const publisher = this.card.publisher;
            const publisherVersion = this.card.publisherVersion;
            this.detail.styles.forEach(style => {
                const cssUrl = this.thirds.computeThirdCssUrl(publisher, style, publisherVersion);
                //needed to instantiate href of link for css in component rendering
                const safeCssUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cssUrl);
                this.hrefsOfCssLink.push(safeCssUrl);

                console.log(`this is the safe resource Url for css '${safeCssUrl.toString()}' and with local version '${safeCssUrl.toLocaleString()}'`)
            });
        }
    }

    private initializeHandlebarsTemplates() {

        zip(this.thirds.queryThird(this.card.publisher,this.card.publisherVersion),
        this.handlebars.executeTemplate(this.detail.templateName, this.card))
            .subscribe(
                ([third,html]) => {
                this._htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
                setTimeout(() => { // wait for DOM rendering
                    this.reinsertScripts();
                    this.bindActions(third);
                });
            }
        );
    }


    get htmlContent() {
        return this._htmlContent;
    }

    reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        const scriptsInitialLength = scripts.length;
        for (let i = 0; i < scriptsInitialLength; i++) {
            const script = scripts[i];
            const scriptCopy = document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        }
    }

    bindActions(third: Third): void {
        // lookup buttons
        const buttons = <HTMLButtonElement[]>this.element.nativeElement.getElementsByTagName('button');

        for (let button of buttons) {
            if (button.attributes['action-id']) {
                const actionId = button.attributes['action-id'].nodeValue;
                if (actionId) {
                    const state = third.extractState(this.card);
                    if(!!state && !!state.actions[actionId])
                        this.attachAction(button, state.actions[actionId], actionId);
                }
            }
        }
    }

    attachAction(button: HTMLButtonElement, action: Action, actionId: string) {
        button.classList.add('btn');
        if (action.buttonStyle) {
            for (let c of action.buttonStyle.split(' ')) {
                button.classList.add(c);
            }
        } else {
            button.classList.add('btn-light');
        }
        if (action.contentStyle) {
            for (let c of action.contentStyle.split(' ')) {
                button.children[0].classList.add(c);
            }
        } else {
            button.children[0].classList.add('fa', 'fa-warning', 'text-dark');
        }
        button.addEventListener('click', (event: Event) => {
            alert(`${actionId} was triggered.\nAction handling is not yet implemented`);
        });
    }

}
