/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Card, CardDetail} from '@ofModel/card.model';
import {ThirdsService} from "../../services/thirds.service";
import {HandlebarsService} from "../../services/handlebars.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
    public active = false;
    @Input() detail: CardDetail;
    @Input() card: Card;
    private _htmlContent: SafeHtml;

    constructor(private element: ElementRef,
                private thirds: ThirdsService,
                private handlebars: HandlebarsService,
                private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.thirds.init();
        this.handlebars.executeTemplate(this.detail.templateName, this.card).subscribe(
            html => {
                this._htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
                setTimeout(() => { // wait for DOM rendering
                    this.reinsertScripts();
                });
            }
        )
    }

    get htmlContent() {
        return this._htmlContent;
    }

    reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        const scriptsInitialLength = scripts.length;
        for (let i = 0; i < scriptsInitialLength; i++) {
            const script = scripts[i];
            const scriptCopy = <HTMLScriptElement>document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        }
    }

}
