/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('Test translations', function () {
    const ENGLISH = 'en';
    const FRENCH = 'fr';
    const DUTCH = 'nl';

    const ENGLISH_SETTINGS = 'SETTINGS';
    const FRENCH_SETTINGS = 'PARAMÈTRES';
    const DUTCH_SETTINGS = 'INSTELLINGEN';

    function changeLanguage(newLanguage, useClock) {
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();

        // Wait for the menu to open
        cy.get('.opfab-right-menu').should('exist');

        cy.get('#opfab-navbar-right-menu-settings').should('exist').click();
        cy.get('#opfab-setting-locale').select(newLanguage);

        // Wait for the language to be changed
        if (useClock) {
            cy.tick(5000);
        }

        if (newLanguage == ENGLISH) {
            cy.get('.opfab-settings-title').should('have.text', ENGLISH_SETTINGS);
        } else if (newLanguage == FRENCH) {
            cy.get('.opfab-settings-title').should('have.text', FRENCH_SETTINGS);
        } else if (newLanguage == DUTCH) {
            cy.get('.opfab-settings-title').should('have.text', DUTCH_SETTINGS);
        }
    }

    function setNightMode() {
        cy.get('.opfab-right-menu').should('exist').then(menu => {
            if (menu.find('#opfab-navbar-right-menu-night-mode').length > 0) {
                cy.get('#opfab-navbar-right-menu-night-mode').click();
            } else {
                // Close the dropdown user menu in order to always have it closed at the end of this function
                cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
            }
        });
    }

    function setDayMode() {
        cy.get('.opfab-right-menu').should('exist').then(menu => {
            if (menu.find('#opfab-navbar-right-menu-day-mode').length > 0) {
                cy.get('#opfab-navbar-right-menu-day-mode').click();
            } else {
                // Close the dropdown user menu in order to always have it closed at the end of this function
                cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
            }
        });
    }

    function checkMenuTitles(feedTitle, archivesTitle, monitoringTitle, loggingTitle, singleMenuTitle, secondMenuTitle, 
                             firstEntryTitle, secondEntryTitle) {
        cy.get('#opfab-navbar-menu-feed').should('have.text', feedTitle);
        cy.get('#opfab-navbar-menu-archives').should('have.text', archivesTitle);
        cy.get('#opfab-navbar-menu-monitoring').should('have.text', monitoringTitle);
        cy.get('#opfab-navbar-menu-logging').should('have.text', loggingTitle);
        cy.get('#opfab-navbar-menu-menu1').should('have.text', singleMenuTitle);
        cy.get('#opfab-navbar-menu-dropdown-menu2').should('have.text', secondMenuTitle);
        cy.get('#opfab-navbar-menu-dropdown-menu2').click();

        // Test dropdown menus titles
        cy.get('#opfab-navbar-menu-dropdown-menu2').click();
        cy.get('.dropdown-menu').find('.text-link').eq(0).should('have.text', firstEntryTitle);
        cy.get('.dropdown-menu').find('.text-link').eq(1).should('have.text', secondEntryTitle);
    }

    function checkRightMenuStaticEntries(realTimeTitle, settingsTitle, activityAreaTitle, feedConfigurationTitle, aboutTitle,
                                         changePasswordTitle, logoutTitle) {
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').should('have.text', realTimeTitle);
        cy.get('#opfab-navbar-right-menu-settings').should('have.text', settingsTitle);
        cy.get('#opfab-navbar-right-menu-activityarea').should('have.text', activityAreaTitle);
        cy.get('#opfab-navbar-right-menu-feedconfiguration').should('have.text', feedConfigurationTitle);
        cy.get('#opfab-navbar-right-menu-about').should('have.text', aboutTitle);
        cy.get('#opfab-navbar-right-menu-change-password').should('have.text', changePasswordTitle);
        cy.get('#opfab-navbar-right-menu-logout').should('have.text', logoutTitle);
    }

    function checkDayAndNightTitles(dayModeTitle, nightModeTitle) {
        
        // Check day mode text
        setNightMode();
        cy.get('.opfab-right-menu').should('not.exist');
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('.opfab-right-menu').should('exist');
        cy.get('#opfab-navbar-right-menu-day-mode').should('have.text', dayModeTitle);

        // Check night mode text
        setDayMode();
        cy.get('.opfab-right-menu').should('not.exist');
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('.opfab-right-menu').should('exist');
        cy.get('#opfab-navbar-right-menu-night-mode').should('have.text', nightModeTitle);

        // Close dropdown menu
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('.opfab-right-menu').should('not.exist');
    }



    function checkArchivesScreenLabels(serviceLabel, tagLabel, processLabel, stateLabel, publishFromLabel, publishToLabel,
                                      activeFromLabel, activeToLabel) {

        cy.get('#opfab-navbar-menu-archives').should('exist').click();
        checkLabel('#opfab-processGroup', serviceLabel);
        checkLabel('#opfab-tags', tagLabel);
        checkLabel('#opfab-process', processLabel);
        checkLabel('#opfab-state', stateLabel);
        checkLabel('#opfab-publish-date-from', publishFromLabel);
        checkLabel('#opfab-publish-date-to', publishToLabel);
        checkLabel('#opfab-active-from', activeFromLabel);
        checkLabel('#opfab-active-to', activeToLabel);
    }

    function checkArchivesScreenTexts(selectServiceText, selectTagText, selectProcessText, selectStateText, searchText, resetText) {
        checkPlaceholderText('#opfab-processGroup', selectServiceText);
        checkPlaceholderText('#opfab-tags', selectTagText);
        checkPlaceholderText('#opfab-process', selectProcessText);
        checkPlaceholderText('#opfab-state', selectStateText);

        cy.get('#opfab-archives-logging-btn-search').should('have.text', searchText);
        cy.get('#opfab-archives-logging-btn-reset').should('have.text', resetText);
    }

    function checkMonitoringFilterTexts(serviceLabel, servicePlaceholder, processLabel, processPlaceholder,
                                        processStatusLabel, processStatusPlaceholder, searchText, resetText) {

        cy.get('#opfab-navbar-menu-monitoring').should('exist').click();

        checkLabel('#opfab-processGroup', serviceLabel);
        checkPlaceholderText('#opfab-processGroup', servicePlaceholder);
        checkLabel('#opfab-process', processLabel);
        checkPlaceholderText('#opfab-process', processPlaceholder);
        checkLabel('#opfab-typeOfState', processStatusLabel);
        checkPlaceholderText('#opfab-typeOfState', processStatusPlaceholder);

        cy.get('#opfab-monitoring-btn-search').should('have.text', searchText);
        cy.get('#opfab-monitoring-btn-reset').should('have.text', resetText);
    }

    function checkMonitoringResultTexts(cardsWithResponseText) {
        cy.get('#opfab-show-cards-with-response').should('have.text', cardsWithResponseText);
    }

    function checkBusinessPeriodLinks(realTimeText, dayText, sevenDaysText, weekText, monthText, yearText) {
        cy.get('#opfab-timeline-link-period-TR').should('have.text', ' ' + realTimeText + ' ');
        cy.get('#opfab-timeline-link-period-J').should('have.text', ' ' + dayText + ' ');
        cy.get('#opfab-timeline-link-period-7D').should('have.text', ' ' + sevenDaysText + ' ');
        cy.get('#opfab-timeline-link-period-W').should('have.text', ' ' + weekText + ' ');
        cy.get('#opfab-timeline-link-period-M').should('have.text', ' ' + monthText + ' ');
        cy.get('#opfab-timeline-link-period-Y').should('have.text', ' ' + yearText + ' ');
    }

    function checkNotificationSeverityTexts(alarmSeverity, actionSeverity, compliantSeverity, informationSeverity) {
        cy.get('.popover-body').find('.label-sev-alarm').should('have.text', ' ' + alarmSeverity + ' ');
        cy.get('.popover-body').find('.label-sev-action').should('have.text', ' ' + actionSeverity + ' ');
        cy.get('.popover-body').find('.label-sev-compliant').should('have.text', ' ' + compliantSeverity + ' ');
        cy.get('.popover-body').find('.label-sev-information').should('have.text', ' ' + informationSeverity + ' ');
    }

    function checkAknowledgementTexts(acknowledgementHeader, allText, acknowledgedText, notAcknowledgedText) {
        cy.get('#opfab-filter-ack-title').should('have.text', acknowledgementHeader);
        cy.get('#opfab-feed-filter-ack-all-label').should('have.text', allText);
        cy.get('#opfab-feed-filter-ack-ack-label').should('have.text', acknowledgedText);
        cy.get('#opfab-feed-filter-ack-notack-label').should('have.text', notAcknowledgedText);
    }

    function checkDateFilterTexts(dateTitle, startText, endText, applyToTimelineText, resetText) {
        cy.get('#opfab-feed-filter-date-title').should('have.text', dateTitle);
        checkLabel('#opfab-feed-filter-dateTimeFrom', startText);
        checkLabel('#opfab-feed-filter-dateTimeTo', endText);

        cy.get('#opfab-timeline-filter-form').should('have.text', applyToTimelineText);
    }

    function checkLabel(labelId, labelText) {
        cy.get(labelId).find('label').then(($labels) => {
            const length = $labels.length;
            cy.get(labelId).find('label').eq(length-1).should('exist').should('have.text', labelText);
        })

    }

    function checkPlaceholderText(selectId, placeholderText) {
        cy.get(selectId).find('.vscomp-value').should('have.text', placeholderText);
    }

    function loadNonExistingCard() {
        cy.visit('#/feed/cards/thisCardDoesNotExist');
    }

    function checkFeedTexts(cardNotFoundText) {
        cy.get('#opfab-feed-card-not-found').should('exist').should('have.text', cardNotFoundText);
    }

    before('Set up configuration and cards', function () {
        cy.loadTestConf();
    });

    it('Check translations for menu titles', function () {
        cy.loginOpFab('operator1_fr','test');

        changeLanguage(ENGLISH);
        checkMenuTitles('Card Feed', 'Archives', 'Monitoring', 'Logging', 'Single menu entry', 'Second menu', 'First menu entry', 'Second menu entry');

        changeLanguage(FRENCH);
        checkMenuTitles('Flux de cartes', 'Archives', 'Monitoring', 'Logging', 'Unique élément', 'Deuxième menu', 'Premier élément', 'Deuxième élément');

        changeLanguage(DUTCH);
        checkMenuTitles('Kaart Feed', 'Archieven', 'Bewaking','Logboek', 'Enkel menu-item', 'Tweede menu', 'Eerste menu-item', 'Tweede menu-item');

    })


    it('Check translations for user dropdown menu', function () {
        cy.loginOpFab('operator1_fr','test');

        changeLanguage(ENGLISH);
        checkRightMenuStaticEntries('Real time users', 'Settings', 'Activity area', 'Notification reception configuration', 'About', 'Change password', 'Logout');
        checkDayAndNightTitles('Day mode', 'Night mode');

        changeLanguage(FRENCH);
        checkRightMenuStaticEntries('Utilisateurs temps réel', 'Paramètres', "Zone d'activité", 'Configuration des notifications', 'À propos', 'Modifier votre mot de passe', 'Déconnexion');
        checkDayAndNightTitles('Mode jour', 'Mode nuit');

        changeLanguage(DUTCH);
        checkRightMenuStaticEntries('Realtime gebruikers', 'Instellingen', 'Activiteitengebied', 'Notificatie configuratie', 'Over', 'Wachtwoord wijzigen', 'Uitloggen');
        checkDayAndNightTitles('Dag modus', 'Nacht modus');
    });

    it('Check archives screen translations', function () {
        cy.loginOpFab('operator1_fr','test');

        changeLanguage(ENGLISH);
        checkArchivesScreenLabels('SERVICE', 'TAGS', 'PROCESS', 'STATE', 'PUBLISH FROM', 'PUBLISH TO', 'ACTIVE FROM', 'ACTIVE TO');
        checkArchivesScreenTexts('Select a Service', 'Select a Tag', 'Select a Process', 'Select a State', 'SEARCH', 'RESET');

        changeLanguage(FRENCH);
        checkArchivesScreenLabels('SERVICE', 'ÉTIQUETTES', 'PROCESSUS', 'ÉTAT', 'PUBLIÉE À PARTIR DE', "PUBLIÉE JUSQU'À", 'ACTIVE À PARTIR DE', "ACTIVE JUSQU'À");
        checkArchivesScreenTexts('Sélectionner un Service', 'Sélectionner une Étiquette', 'Sélectionner un Processus', 'Sélectionner un État', 'RECHERCHER', 'RÉINITIALISER');

        changeLanguage(DUTCH);
        checkArchivesScreenLabels('DIENST', 'LABELS', 'PROCES', 'STATUS', 'PUBLICEREN VAN', 'PUBLICEREN TOT', 'ACTIEF VAN', 'ACTIEF TOT');
        checkArchivesScreenTexts('Selecteer een Dienst', 'Selecteer een Label', 'Selecteer een Proces', 'Selecteer een Status', 'ZOEK', 'HERSTEL');
    })

    it('Check Monitoring screen translations', function () {
        cy.loginOpFab('operator1_fr', 'test');

        changeLanguage(ENGLISH);
        checkMonitoringFilterTexts('SERVICE', 'Select a Service', 'PROCESS', 'Select a Process', 'PROCESS STATUS', 'Select a Process status', 'SEARCH', 'RESET');
        checkMonitoringResultTexts('Cards with response from my entity ');

        changeLanguage(FRENCH);
        checkMonitoringFilterTexts('SERVICE', 'Sélectionner un Service', 'PROCESSUS', 'Sélectionner un Processus', 'ÉTAT DU PROCESSUS', 'Sélectionner un État de processus', 'RECHERCHER', 'RÉINITIALISER');
        checkMonitoringResultTexts('Cartes avec réponse de mon entité ');

        changeLanguage(DUTCH);
        checkMonitoringFilterTexts('DIENST', 'Selecteer een Dienst', 'PROCES', 'Selecteer een Proces', 'PROCES STATUS', 'Selecteer een Proces status', 'ZOEK', 'HERSTEL');
        checkMonitoringResultTexts('Kaarten met reactie van mijn entiteit ');
    });

    it('Check Business period translations', function () {
        const currentDate = new Date(2030, 11, 31, 23, 46);
        cy.loginWithClock(currentDate);

        changeLanguage(ENGLISH, true);
        cy.tick(1000);
        cy.get('#opfab-navbar-menu-feed').click();
        cy.tick(5000);
        cy.get('#opfab-timeline-title').should('have.text', ' 31 December 2030 ');
        checkBusinessPeriodLinks('Real Time', 'Day', '7 Days', 'Week', 'Month', 'Year');

        cy.get('#opfab-navbar-menu-monitoring').should('exist').click();
        cy.get('.opfab-business-period').should('have.text', 'Business period : 21:30 31/12/2030 -- 09:00 01/01/2031 ');
        cy.tick(1000);

        changeLanguage(FRENCH, true);
        cy.tick(1000);
        cy.get('#opfab-navbar-menu-feed').click();
        cy.tick(5000);
        cy.get('#opfab-timeline-title').should('have.text', ' 31 décembre 2030 ');
        checkBusinessPeriodLinks('Temps réel', 'Jour', '7 Jours', 'Semaine', 'Mois', 'Année');

        cy.get('#opfab-navbar-menu-monitoring').should('exist').click();
        cy.get('.opfab-business-period').should('have.text', 'Période métier : 21:30 31/12/2030 -- 09:00 01/01/2031 ');
        cy.tick(1000);

        changeLanguage(DUTCH, true);
        cy.tick(1000);
        cy.get('#opfab-navbar-menu-feed').click();
        cy.tick(5000);
        cy.get('#opfab-timeline-title').should('have.text', ' 31 december 2030 ');
        checkBusinessPeriodLinks('Realtime', 'Dag', '7 Dagen', 'Week', 'Maand', 'Jaar');

        cy.get('#opfab-navbar-menu-monitoring').should('exist').click();
        cy.get('.opfab-business-period').should('have.text', 'Bedrijfsperiode : 21:30 31/12/2030 -- 09:00 01/01/2031 ');
    });

    it('Check Feed filter translations', function () {
        cy.loginOpFab('operator1_fr', 'test');

        changeLanguage(ENGLISH);
        cy.get('#opfab-navbar-menu-feed').click();
        cy.get('#opfab-feed-filter-btn-filter').click();
        checkNotificationSeverityTexts('Alarm', 'Action', 'Compliant', 'Information');
        checkAknowledgementTexts('Acknowledgement', 'All', 'Acknowledged', 'Not acknowledged');
        checkDateFilterTexts('Receipt date', 'START', 'END', 'Apply filters to timeline', 'Reset');

        changeLanguage(FRENCH);
        cy.get('#opfab-navbar-menu-feed').click();
        cy.get('#opfab-feed-filter-btn-filter').click()
        checkNotificationSeverityTexts('Alarme', 'Action', 'Conforme', 'Information');
        checkAknowledgementTexts('Acquittement', 'Toutes', 'Acquittées', 'Non acquittées');
        checkDateFilterTexts('Date de réception', 'DÉBUT', 'FIN', 'Appliquer les filtres à la timeline', 'Réinitialiser');

        changeLanguage(DUTCH);
        cy.get('#opfab-navbar-menu-feed').click();
        cy.get('#opfab-feed-filter-btn-filter').click()
        checkNotificationSeverityTexts('Alarm', 'Actie', 'Conform', 'Informatie');
        checkAknowledgementTexts('Bevestigen', 'Alles', 'Bevestigd', 'Niet bevestigd');
        checkDateFilterTexts('Ontvangstdatum', 'START', 'EIND', 'Filters toepassen op tijdlijn', 'Opnieuw installen');
    });

    it('Check translation for non-existent card', function () {
        cy.loginOpFab('operator1_fr', 'test');

        changeLanguage(ENGLISH);
        loadNonExistingCard();
        checkFeedTexts('The card you are looking for was not found');

        changeLanguage(FRENCH);
        loadNonExistingCard();
        checkFeedTexts("La carte que vous cherchez n'a pas été trouvée");

        changeLanguage(DUTCH);
        loadNonExistingCard();
        checkFeedTexts('De kaart die u zoekt werd niet gevonden');
    });
});
