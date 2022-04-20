/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, HostListener, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Action, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {LoadConfigSuccess} from '@ofActions/config.actions';
import {selectIdentifier} from '@ofSelectors/authentication.selectors';
import {ConfigService} from '@ofServices/config.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, skip} from 'rxjs/operators';
import {merge, Observable, Subject} from 'rxjs';
import {I18nService} from '@ofServices/i18n.service';
import {CardService} from '@ofServices/card.service';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {ProcessesService} from '@ofServices/processes.service';
import {ReminderService} from '@ofServices/reminder/reminder.service';
import {selectSubscriptionOpen} from '@ofStore/selectors/cards-subscription.selectors';
import {Actions, ofType} from '@ngrx/effects';
import {AlertActions, AlertActionTypes} from '@ofStore/actions/alert.actions';
import {Message, MessageLevel} from '@ofModel/message.model';
import {GroupsService} from '@ofServices/groups.service';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationActionTypes, TryToLogOut} from '@ofStore/actions/authentication.actions';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {RemoteLoggerService} from '@ofServices/logs/remote-logger.service';


class Alert {
  alert: Message;
  display: boolean;
  className: string;
}

@Component({
  selector: 'of-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  readonly title = 'OperatorFabric';
  isAuthenticated = false;
  loaded = false;
  isDisconnectedByNewUser = false;
  useCodeOrImplicitFlow = true;
  connectionLost = false;
  connectionLostForMoreThanTenSeconds = false;
  modalForSessionAlreadyInUseIsActive = false;
  alertMessage: Alert = {alert: undefined, className: undefined, display: false};
  userLogin: string;


  private modalRef: NgbModalRef;
  @ViewChild('noSound') noSoundPopupRef: TemplateRef<any>;
  @ViewChild('sessionEnd') sessionEndPopupRef: TemplateRef<any>;
  @ViewChild('sessionAlreadyInUse') sessionAlreadyInUsePopupRef: TemplateRef<any>;
  
  /**
   * NB: I18nService is injected to trigger its constructor at application startup
   */
  constructor(private store: Store<AppState>,
              private titleService: Title
      , private authenticationService: AuthenticationService
      , private configService: ConfigService
      , private translateService: TranslateService
      , private i18nService: I18nService
      , private cardService: CardService
      , private userService: UserService
      , private entitiesService: EntitiesService
      , private groupsService: GroupsService
      , private processesService: ProcessesService
      , private reminderService: ReminderService
      , private soundNotificationService: SoundNotificationService
      , private actions$: Actions
      , private modalService: NgbModal
      , private logger: OpfabLoggerService
      , private remoteLogger: RemoteLoggerService) {
  }

  ngOnInit() {
    this.loadConfiguration();
    this.initApplicationWhenUserAuthenticated();
    this.detectConnectionLost();
    this.subscribeToAlerts();
  }

  @HostListener('document:click', ['$event.target'])
    public onPageClick() {
       this.soundNotificationService.clearOutstandingNotifications();
  }


  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.hidden) {
        this.logger.info('Application tab is not visible anymore', LogOption.REMOTE);
     } else {
      this.logger.info('Application tab is visible again', LogOption.REMOTE);
  }
    return null;
  }

  // On chrome or edge chromium, when exiting opfab via changing url in the browser tab
  // the long polling HTTP connection is not closed due to the back/forward mechanism (see https://web.dev/bfcache/)
  // this method force the closing of the HTTP connection when exiting opfab page
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.logger.info('Unload opfab', LogOption.REMOTE);
    this.cardService.closeSubscription();
    this.remoteLogger.flush(); // flush log before exiting opfab
    return null;
  }

  // Due to the previous method, when user use browser back function to return to opfab
  // if the back forward cache mechanism is activated, opfab is restored from browser memory but
  // the HTTP long polling connection is closed
  // so we need to reinitialize the application

  @HostListener('window:pageshow', ['$event'])
  pageShow(event) {
    if (event.persisted) {
      this.logger.info('This page was restored from the bfcache , force opfab restart ', LogOption.LOCAL);
      location.reload();
    }
  }


  private loadConfiguration() {

    this.configService.loadWebUIConfiguration().subscribe({  //This configuration needs to be loaded first as it defines the authentication mode
      next: config => {
        console.log(new Date().toISOString(), `Configuration loaded (web-ui.json)`);
        this.store.dispatch(new LoadConfigSuccess({ config: config }));
        this.setTitle();
        this.loadTranslationAndLaunchAuthenticationProcess(config);
      },
      error: catchError((err, caught) => {
        console.error('Impossible to load configuration file web-ui.json', err);
        return caught; })
    });

  }

  private setTitle() {
    const title = this.configService.getConfigValue('title');
    if (!!title) { this.titleService.setTitle(title); }
  }

  private loadTranslationForMenu() {
    this.configService.fetchMenuTranslations().subscribe(locales => locales.forEach(locale =>
        this.translateService.setTranslation(locale.language, locale.i18n, true)));
    catchError((err, caught) => {
      console.error('Impossible to load configuration file ui-menu.json', err);
      return caught;
    });
  }

  private loadTranslationAndLaunchAuthenticationProcess(config) {
    if (!!config.i18n.supported.locales) {
      const localeRequests$ = [];
      (config.i18n.supported.locales as string[]).forEach(locale => localeRequests$.push(this.i18nService.loadLocale(locale)));

      this.waitForAllObservables(localeRequests$).subscribe(() => {
        this.logger.info('opfab translation loaded for locales: ' + this.translateService.getLangs(), LogOption.LOCAL_AND_REMOTE);

        this.loadTranslationForMenu();
        this.launchAuthenticationProcess();
      });
    }
  }

  // Returns an observable that provides an array. Each item of the array represents even first value of Observable, or it's error
  private waitForAllObservables(args: Observable<any>[]): Observable<any[]> {
    const final = new Subject<any[]>();
    const flags = new Array(args.length);
    const result = new Array(args.length);
    let numberOfWaitedObservables = args.length;
    for (let i = 0; i < args.length; i++) {
      flags[i] = false;
      args[i].subscribe({
        next: res => {
          if (flags[i] === false) {
            flags[i] = true;
            result[i] = res;
            numberOfWaitedObservables--;
            if (numberOfWaitedObservables < 1)
              final.next(result);
          }
        },
        error: error => {
          if (flags[i] === false) {
            flags[i] = true;
            result[i] = error;
            numberOfWaitedObservables--;
            if (numberOfWaitedObservables < 1)
              final.next(result);
          }
        }
      });
    }
    return final.asObservable();
  }


  private launchAuthenticationProcess() {
    console.log(new Date().toISOString(), `Launch authentication process`);
    this.authenticationService.initializeAuthentication();
    this.useCodeOrImplicitFlow = this.authenticationService.isAuthModeCodeOrImplicitFlow();
  }

  login(): void {
    this.modalRef.close();
    this.modalForSessionAlreadyInUseIsActive = false;
    this.store
        .select(selectIdentifier)
        .subscribe(identifier => {
          if (identifier) {
            this.proceedLogin(identifier); 
          }
        });
  }

  private initApplicationWhenUserAuthenticated() {
    this.store
        .select(selectIdentifier)
        .subscribe(identifier => {
          if (identifier) {
            console.log(new Date().toISOString(), `User ${identifier} logged`);
            this.isAuthenticated = true;
            this.userLogin = identifier;

            this.userService.willNewSubscriptionDisconnectAnExistingSubscription().subscribe(isUserAlreadyConnected => {

              if (isUserAlreadyConnected) {
                this.modalRef = this.modalService.open(this.sessionAlreadyInUsePopupRef, {centered: true, backdrop: 'static'});
                this.modalForSessionAlreadyInUseIsActive = true;
              } else {
                this.proceedLogin(identifier);
              }
            });
            

          }
        });
  }

  private proceedLogin(identifier) {
    this.cardService.initCardSubscription();
    merge(
      this.configService.loadCoreMenuConfigurations(),
      this.userService.loadUserWithPerimetersData(),
      this.entitiesService.loadAllEntitiesData(),
      this.groupsService.loadAllGroupsData(),
      this.processesService.loadAllProcesses(),
      this.processesService.loadProcessGroups(),
      this.processesService.loadMonitoringConfig(),
      this.cardService.initSubscription)
    .pipe(skip(7)) // Need to wait for all initialization to complete before loading main components of the application
    .subscribe({
      next: () => {
        this.loaded = true;
        this.reminderService.startService(identifier);
        this.activateSoundIfNotActivated();
        this.subscribeToSessionEnd();
        this.subscribeToSessionClosedByNewUser();
      },
      error: catchError((err, caught) => {
        console.error('Error in application initialization', err);
        return caught; 
      })
    });
  }

  private detectConnectionLost() {
    this.store.select(selectSubscriptionOpen).subscribe(subscriptionOpen => {
      this.connectionLostForMoreThanTenSeconds = false;
      this.connectionLost = !subscriptionOpen;
      // Wait 10s before showing "connection lost" to the user to avoid alerting on short connection loss
      if (this.connectionLost) setTimeout(() => {
        if (this.connectionLost) this.connectionLostForMoreThanTenSeconds = true;
      }, 10000);
    });
  }


  // Due to auto-policy in chromium based browsers, if the user does not interact with the application
  // sound is not activated. This method open a modal and by clicking OK the user interacts with the application
  // and activate the sound
  //
  // See https://developer.chrome.com/blog/autoplay/#web-audio
  //
  private activateSoundIfNotActivated() {

    setTimeout(() => {
      let playSoundOnExternalDevice = this.soundNotificationService.getPlaySoundOnExternalDevice();
      if (this.isNavigatorChromiumBased() && !playSoundOnExternalDevice && this.soundNotificationService.isAtLeastOneSoundActivated()) {
        const context = new AudioContext();
        if (context.state !== 'running') {
          context.resume();
          this.logger.info('Sound not activated', LogOption.REMOTE);
          this.modalRef = this.modalService.open(this.noSoundPopupRef, {centered: true, backdrop: 'static'});
        }
      }
    }
      , 3000);
  }

  private isNavigatorChromiumBased() {
    return (navigator.userAgent.indexOf('Chrom') > -1);
  }

  public closeModal() {
    this.logger.info('Sound activated', LogOption.REMOTE);
    this.modalRef.close();
  }

  private subscribeToAlerts() {
    this.actions$.pipe(
        ofType<AlertActions>(AlertActionTypes.AlertMessage)).subscribe( alert => {
      this.displayAlert(alert.payload.alertMessage);
    });
  }

  private subscribeToSessionEnd() {
    this.actions$.pipe(
        ofType<Action>(AuthenticationActionTypes.SessionExpired)).subscribe(  () => {
          this.logger.info('Session expire ', LogOption.REMOTE);
          this.soundNotificationService.handleSessionEnd();
          this.cardService.closeSubscription();
          this.modalRef = this.modalService.open(this.sessionEndPopupRef, {centered: true, backdrop: 'static'});
        }
      );
  }

  private subscribeToSessionClosedByNewUser() {
    this.cardService.getReceivedDisconnectUser().subscribe(isDisconnected =>  {
      this.isDisconnectedByNewUser = isDisconnected;

      if (isDisconnected) {
        this.soundNotificationService.clearOutstandingNotifications();
      }
    })
  }


  public logout() {
    this.logger.info('Logout ', LogOption.REMOTE);
    this.modalRef.close();
    this.store.dispatch(new TryToLogOut());
  }

  private displayAlert(message: Message) {
    let className = 'opfab-alert-info';
    switch (message.level) {
      case MessageLevel.DEBUG:
        className = 'opfab-alert-debug';
        break;
      case MessageLevel.INFO:
        className = 'opfab-alert-info';
        break;
      case MessageLevel.ERROR:
        className = 'opfab-alert-error';
        break;
    }
    this.alertMessage = {
      alert: message,
      className: className,
      display: true
    };

    setTimeout(() => {
      this.alertMessage.display = false;
    }, 5000);

  }
}
