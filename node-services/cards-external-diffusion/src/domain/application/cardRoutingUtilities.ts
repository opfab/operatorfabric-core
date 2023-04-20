/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


export default class CardsRoutingUtilities {

    public static shouldUserReceiveTheCard(user: any, perimeters: any[], userSettings: any, card: any): boolean {
        if (!this.checkUserReadPerimeter(perimeters, userSettings, card)) {
            return false;
        }
        if (this.checkUserRecipients(user, card)) {
            return true;
        } 
        return this.isCardSentToUserGroupOrEntityOrBoth(user, card);
    }

    private static checkUserReadPerimeter(perimeters: any[], userSettings: any, card: any): boolean {

        const processPerimeters = perimeters.filter((perim) => {
            if (perim.process === card.process) {
                const stateRigth = perim.stateRights.find((st: any) => st.state === card.state);
                if (
                    stateRigth &&
                    (stateRigth.right === 'Receive' || stateRigth.right === 'ReceiveAndWrite') &&
                    CardsRoutingUtilities.checkFilteringNotification(userSettings, card.process, stateRigth )
                ) {
                    return true;
                }
            }
            return false;
        
        });
        return processPerimeters.length > 0;
    }

    private static checkFilteringNotification(settings: any ,process: string, stateRigth: any) {
        if (!stateRigth.filteringNotificationAllowed || !settings.processesStatesNotNotified || settings.processesStatesNotNotified.length == 0) return true;
        return !settings.processesStatesNotNotified[process]?.includes(stateRigth.state);
    }

    private static checkUserRecipients(user: any, card: any): boolean {
        return card.userRecipients && card.userRecipients.length > 0 && card.userRecipients.includes(user.login);
    }

    private static isCardSentToUserGroupOrEntityOrBoth(user: any, card: any): boolean {
        if (
            card.groupRecipients &&
            card.groupRecipients.length > 0 &&
            this.getArraysIntersection(card.groupRecipients, user.groups).length == 0
        )
            return false;

        if (
            card.entityRecipients &&
            card.entityRecipients.length > 0 &&
            this.getArraysIntersection(card.entityRecipients, user.entities).length == 0
        )
            return false;

        return !(
            (!card.groupRecipients || card.groupRecipients.length == 0) &&
            (!card.entityRecipients || card.entityRecipients.length == 0)
        );
    }

    private static getArraysIntersection(array1: string[], array2: string[]): string[] {
        return array1.filter((x) => array2.includes(x));
    }
}