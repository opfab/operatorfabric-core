/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { AuthenticationService } from '@ofServices/authentication/authentication.service';
import { LoadConfigSuccess } from '@ofActions/config.actions';
import { LoadProcessesTranslation } from '@ofActions/translate.actions';
import { selectIdentifier } from '@ofSelectors/authentication.selectors';
import { ConfigService} from '@ofServices/config.service';
import {TranslateService} from '@ngx-translate/core';
import { catchError, skip} from 'rxjs/operators';
import {merge} from 'rxjs';
import { I18nService } from '@ofServices/i18n.service';
import { CardService } from '@ofServices/card.service';
import { UserService } from '@ofServices/user.service';
import { EntitiesService } from '@ofServices/entities.service';
import { ProcessesService } from '@ofServices/processes.service';


@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    readonly title = 'OperatorFabric';
    isAuthenticated = false;
    loaded = false;
    useCodeOrImplicitFlow = true;

    /**
     * NB: I18nService is injected to trigger its constructor at application startup
     */
    constructor(private store: Store<AppState>,
        private titleService: Title
        , private authenticationService: AuthenticationService
        ,private  configService: ConfigService
        , private translateService: TranslateService
        , private i18nService: I18nService
        , private cardService: CardService
        , private userService: UserService
        , private entitiesService: EntitiesService
        , private processesService: ProcessesService) {
    }

    ngOnInit() {
        this.loadConfiguration();
        this.initApplicationWhenUserAuthenticated();
    }

    private loadConfiguration() {

          this.configService.fetchConfiguration().subscribe(config => {
            console.log(new Date().toISOString(), `Configuration loaded (web-ui.json)`);
            if (config.i18n.supported.locales) this.translateService.addLangs(config.i18n.supported.locales);
            this.setTitle();
            this.store.dispatch(new LoadConfigSuccess({config: config}));
            this.launchAuthenticationProcess();
        })
            catchError((err, caught) => {
                console.error('Impossible to load configuration file web-ui.json', err);
                return caught;
            });
    }

    private setTitle() {
        const title = this.configService.getConfigValue('title');
        if (!!title) { this.titleService.setTitle(title); }
    }

    private launchAuthenticationProcess() {
        console.log(new Date().toISOString(), `Launch authentication process`);
        this.authenticationService.initializeAuthentication();
        this.useCodeOrImplicitFlow = this.authenticationService.isAuthModeCodeOrImplicitFlow();
    }

    private initApplicationWhenUserAuthenticated() {
        this.store
            .select(selectIdentifier)
            .subscribe(identifier => {
                if (identifier) {
                    console.log(new Date().toISOString(), `User ${identifier} logged`);
                    this.isAuthenticated = true;
                    this.cardService.initCardSubscription();
                    merge(
                        this.userService.loadUserWithPerimetersData(),
                        this.entitiesService.loadAllEntitiesData(),
                        this.processesService.loadAllProcesses(),
                        this.cardService.initSubscription)
                    .pipe(skip(3))
                    .subscribe( () => {
                        this.store.dispatch(new LoadProcessesTranslation());
                        this.loaded = true;
                    });
                }
            });
    }

}
