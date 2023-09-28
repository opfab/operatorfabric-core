/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


export default class CardsRoutingUtilities {

    public static shouldUserReceiveTheCard(userWithPerimeters: any, card: any): boolean {
        if (!this.checkUserReadPerimeter(userWithPerimeters, card)) {
            return false;
        }
        if (this.checkUserRecipients(userWithPerimeters, card)) {
            return true;
        }
        return this.isCardSentToUserGroupOrEntityOrBoth(userWithPerimeters.userData, card);
    }

    private static checkUserReadPerimeter(userWithPerimeters: any, card: any): boolean {
        const perimeters = userWithPerimeters.computedPerimeters;
        const processPerimeters = perimeters.filter((perim: any) => {
            return (perim.process === card.process && perim.state === card.state &&
                (perim.rights === 'Receive' || perim.rights === 'ReceiveAndWrite') &&
                    CardsRoutingUtilities.checkIfMailNotifForThisProcessStateIsActivated(userWithPerimeters, card.process, perim.state) &&
                    CardsRoutingUtilities.checkFilteringNotification(userWithPerimeters, card.process, perim)
                );
        })


        return processPerimeters.length > 0;
    }

    private static checkIfMailNotifForThisProcessStateIsActivated(userWithPerimeters: any, process: string, state: string): boolean {
        if (!userWithPerimeters.processesStatesNotifiedByEmail || userWithPerimeters.processesStatesNotifiedByEmail.length === 0) {
            return false;
        }
        return userWithPerimeters.processesStatesNotifiedByEmail[process]?.includes(state);
    }

    private static checkFilteringNotification(userWithPerimeters: any, process: string, perimeter: any): boolean {
        if (!perimeter.filteringNotificationAllowed
            || !userWithPerimeters.processesStatesNotNotified
            || userWithPerimeters.processesStatesNotNotified.length == 0) {
            return true;
        }
        return !userWithPerimeters.processesStatesNotNotified[process]?.includes(perimeter.state);
    }

    private static checkUserRecipients(user: any, card: any): boolean {
        return card.userRecipients && card.userRecipients.length > 0 && card.userRecipients.includes(user.userData.login);
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