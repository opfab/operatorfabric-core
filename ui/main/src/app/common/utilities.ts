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
import {Observable, Subject} from 'rxjs';

export class Utilities {
    private static readonly _stringPrefixToAddForTranslation: string = 'shared.severity.';

    public static getI18nPrefixFromProcess(process: Process): string {
        return process.id + '.' + process.version + '.';
    }

    public static translateSeverity(translateService: TranslateService, severity: string): string {
        const rawSeverityString: string = Utilities._stringPrefixToAddForTranslation + severity.toLowerCase();
        return translateService.instant(rawSeverityString);
    }

    public static compareObj(obj1, obj2) {
        if (obj1 > obj2) return 1;
        if (obj1 < obj2) return -1;
        return 0;
    }

    // Returns an observable that provides an array. Each item of the array represents either first value of Observable, or its error
    public static subscribeAndWaitForAllObservablesToEmitAnEvent(observables: Observable<any>[]): Observable<any[]> {
        const final = new Subject<any[]>();
        const flags = new Array(observables.length);
        const result = new Array(observables.length);
        let numberOfWaitedObservables = observables.length;
        for (let i = 0; i < observables.length; i++) {
            flags[i] = false;
            observables[i].subscribe({
                next: (res) => {
                    if (flags[i] === false) {
                        flags[i] = true;
                        result[i] = res;
                        numberOfWaitedObservables--;
                        if (numberOfWaitedObservables < 1) final.next(result);
                    }
                },
                error: (error) => {
                    if (flags[i] === false) {
                        flags[i] = true;
                        result[i] = error;
                        numberOfWaitedObservables--;
                        if (numberOfWaitedObservables < 1) final.next(result);
                    }
                }
            });
        }
        return final.asObservable();
    }

    public static isNavigatorChromiumBased() {
        return navigator.userAgent.indexOf('Chrom') > -1;
    }
}
