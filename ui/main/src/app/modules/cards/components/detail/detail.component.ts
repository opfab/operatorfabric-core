

import {Component, ElementRef, Input, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {Card, Detail} from '@ofModel/card.model';
import {ThirdsService} from '@ofServices/thirds.service';
import {HandlebarsService} from '../../services/handlebars.service';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {Action, Third, ThirdResponse} from '@ofModel/thirds.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {TranslateService} from '@ngx-translate/core';
import {I18n} from '@ofModel/i18n.model';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit, OnChanges {

    @Output() responseData = new EventEmitter<ThirdResponse>();

    public active = false;
    @Input() detail: Detail;
    @Input() card: Card;
    currentCard: Card;
    readonly hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _htmlContent: SafeHtml;
    private userContext: UserContext;

    constructor(private element: ElementRef,
                private thirds: ThirdsService,
                private handlebars: HandlebarsService,
                private sanitizer: DomSanitizer,
                private store: Store<AppState>,
                private translate: TranslateService ) {
    }

    ngOnInit() {
        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();
        this.store.select(selectAuthenticationState).subscribe(authState => {
            this.userContext = new UserContext(
                authState.identifier,
                authState.token,
                authState.firstName,
                authState.lastName
            );
        });
    }
    ngOnChanges(): void {
        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();
        this.store.select(selectAuthenticationState).subscribe(authState => {
            this.userContext = new UserContext(
                authState.identifier,
                authState.token,
                authState.firstName,
                authState.lastName
            );
        });
    }

    private initializeHrefsOfCssLink() {
        if (this.detail && this.detail.styles) {
            const publisher = this.card.publisher;
            const publisherVersion = this.card.publisherVersion;
            this.detail.styles.forEach(style => {
                const cssUrl = this.thirds.computeThirdCssUrl(publisher, style, publisherVersion);
                // needed to instantiate href of link for css in component rendering
                const safeCssUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cssUrl);
                this.hrefsOfCssLink.push(safeCssUrl);

                console.log(`this is the safe resource Url for css '${safeCssUrl.toString()}'
                and with local version '${safeCssUrl.toLocaleString()}'`);
            });
        }
    }

    private initializeHandlebarsTemplates() {

        let responseData: ThirdResponse;
        let third: Third;

        this.thirds.queryThirdFromCard(this.card).pipe(
            switchMap(thirdElt => {
                responseData = thirdElt.processes[this.card.process].states[this.card.state].response;
                this.responseData.emit(responseData);
                return this.handlebars.executeTemplate(this.detail.templateName, new DetailContext(this.card, this.userContext, responseData));
            })
        )
            .subscribe(
                html => {
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

        for (const button of buttons) {
            if (button.attributes['action-id']) {
                const actionId = button.attributes['action-id'].nodeValue;
                if (actionId) {
                    const state = third.extractState(this.card);
                    if (!!state && !!state.actions[actionId]) {
                        this.attachAction(button, state.actions[actionId], actionId);
                    }
                }
            }
        }
    }

    attachAction(button: HTMLButtonElement, action: Action, actionId: string) {
        button.classList.add('btn');
        if (action.buttonStyle) {
            for (const c of action.buttonStyle.split(' ')) {
                button.classList.add(c);
            }
        } else {
            button.classList.add('btn-light');
        }

        button.addEventListener('click', (event: Event) => {
            alert(`${actionId} was triggered.\nAction handling is not yet implemented`);
        });
    }

    private handelActionButtonText(label: I18n) {
        if (label) {
            if (this.card) {
                console.log('card exists!');
            } else {
                console.log(`card doesn't exist yet`);
            }
            return this.translate.instant(`${this.card.publisher}.${this.card.publisherVersion}.${label.key}`, label.parameters);
        }
        return 'Undefined';
    }
}
