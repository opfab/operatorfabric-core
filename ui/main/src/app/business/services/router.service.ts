/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ApplicationRouter} from '../server/application-router';

export class RouterService {
    private static router: ApplicationRouter;

    public static setApplicationRouter(router: ApplicationRouter) {
        RouterService.router = router;
    }

    public static navigateTo(url: string) {
        RouterService.router.navigateTo(url);
    }

    public static getCurrentRoute(): string {
        return RouterService.router.getCurrentRoute();
    }

    public static redirectToBusinessMenu(menuId: string, urlExtension: string) {
        const urlSplit = document.location.href.split('#');
        // WARNING : HACK
        //
        // When user makes a reload (for example via F5) or use a bookmark link, the browser encodes what is after #
        // if user makes a second reload, the browser encodes again the encoded link
        // and after if user reload again, this time it is not encoded anymore by the browser
        // So it ends up with 3 possible links: a none encoded link, an encoded link or a twice encoding link
        // and we have no way to know which one it is when processing the url
        //
        // To solve the problem we encode two times the url before giving it to the browser
        // so we always have a unique case : a double encoded url
        let newUrl = urlSplit[0] + '#/businessconfigparty/' + encodeURIComponent(encodeURIComponent(menuId)) + '/';

        if (urlExtension) newUrl += encodeURIComponent(encodeURIComponent(urlExtension));
        document.location.href = newUrl;
    }
}
