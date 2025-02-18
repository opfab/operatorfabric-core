/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process} from '@ofServices/processes/model/Processes';
import {Observable, catchError, forkJoin, of, take} from 'rxjs';
import {Severity} from 'app/model/Severity';

export class Utilities {
    public static cloneObj(obj: object) {
        return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
    }

    public static convertSpacesAndNewLinesInHTML(txt: string): string {
        return txt.replace(/\n/g, '<br/>').replace(/\s\s/g, '&nbsp;&nbsp;');
    }

    public static escapeHtml(html: string): string {
        if (!html) return html;
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    public static getI18nPrefixFromProcess(process: Process): string {
        return process.id + '.' + process.version + '.';
    }

    public static getSeverityColor(severity: Severity): string {
        if (severity) {
            switch (severity) {
                case 'ALARM':
                    return '#A71A1A'; // red
                case 'ACTION':
                    return '#FD9313'; // orange
                case 'COMPLIANT':
                    return '#00BB03'; // green
                case 'INFORMATION':
                    return '#1074AD'; // blue
                default:
                    return 'blue';
            }
        } else {
            return 'blue';
        }
    }

    public static compareObj(obj1, obj2): number {
        if (typeof obj1 === 'string' && typeof obj2 === 'string') {
            obj1 = this.removeEmojis(obj1);
            obj2 = this.removeEmojis(obj2);
        }
        if (obj1 > obj2) return 1;
        if (obj1 < obj2) return -1;
        return 0;
    }

    public static removeEmojis(str: string): string {
        // regex to find all emojis (see https://www.regextester.com/106421 )
        let temp = str.replace(
            /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/g,
            ''
        );
        // The ⚠️ emoji (\u26A0) has a base64 code of "4pqg77iP". This code is made up of 2 parts:
        //  -"4pqg" which is an alternate version of the emoji
        //  -"77iP" which is a variation selector, which left alone is an empty character
        // When using .replace() only the first part is removed and the empty character messes up the string comparison
        // The variation selector's UTF-8 code is "%EF%B8%8F"
        temp = temp.replaceAll(decodeURIComponent('%EF%B8%8F'), '').trim();
        return temp;
    }

    // Returns an observable that provides an array. Each item of the array represents either first value of Observable, or its error
    public static subscribeAndWaitForAllObservablesToEmitAnEvent(observables: Observable<any>[]): Observable<any[]> {
        return forkJoin(
            observables.map((observable, i) =>
                observable.pipe(
                    take(1),
                    catchError((error) => {
                        return of(error);
                    })
                )
            )
        );
    }

    public static isNavigatorChromiumBased() {
        return navigator.userAgent.indexOf('Chrom') > -1;
    }

    public static removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
        if (arrayToDelete?.length > 0) {
            const elementsToDeleteSet = new Set(arrayToDelete);
            const newArray = arrayToFilter.filter((name) => {
                return !elementsToDeleteSet.has(name);
            });
            return newArray;
        } else {
            return arrayToFilter;
        }
    }

    public static sliceForFormat(str: string, charactersToKeep: number) {
        return str.length <= charactersToKeep ? str : str.slice(0, charactersToKeep) + '...';
    }
}
