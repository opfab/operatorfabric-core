/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CanDeactivateFn, Routes} from '@angular/router';
import {SettingsComponent} from './components/settings/settings.component';

const canDeactivate: CanDeactivateFn<SettingsComponent> = (component: SettingsComponent) => {
    return component.canDeactivate ? component.canDeactivate() : true;
};

const routes: Routes = [
    {
        path: '',
        component: SettingsComponent,
        canDeactivate: [canDeactivate]
    }
];

export default routes;
