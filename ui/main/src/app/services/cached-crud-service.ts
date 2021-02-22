/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {CrudService} from '@ofServices/crud-service';

/** This class further specifies `CrudServices` that maintain a cache of returned values and as such can synchronously provide a
 * cached version. It inheritance becomes an issue, it could be replaced by a mixin. */

@Injectable({
    providedIn: 'root'
})
export abstract class CachedCrudService extends CrudService {
  abstract getCachedValues(): Array<any>;
}
