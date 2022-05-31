/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process} from '@ofModel/processes.model';
import {TranslateService} from '@ngx-translate/core';

export abstract class Utilities {
    private static readonly _stringPrefixToAddForTranslation: string = 'shared.severity.';

    public static getI18nPrefixFromProcess(process: Process): string {
        return process.id + '.' + process.version + '.';
    }

    public static translateSeverity(translateService: TranslateService, severity: string): string {
        let severityTranslated: string;
        const rawSeverityString: string = Utilities._stringPrefixToAddForTranslation + severity.toLowerCase();

        severityTranslated = translateService.instant(rawSeverityString);

        return severityTranslated;
    }

    public static compareObj(obj1, obj2) {
        if (obj1 > obj2) return 1;
        if (obj1 < obj2) return -1;
        return 0;
    }
}
