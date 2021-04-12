/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import * as _ from 'lodash-es';


export class FieldPosition {
    public jsonField: string;
    public columnNumber: string;
    public isNested: boolean;

    constructor(jsonField: string, columnNumber: string, isNested: boolean) {
        this.jsonField = jsonField;
        this.columnNumber = columnNumber;
        this.isNested = isNested;
    }
}

export class JsonToArray {

    private resultingArray: string[][] = [[]];
    private fieldsPosition: FieldPosition[] = [];
    private columns = new Map();
    private nestedRules = new Map();

    constructor(rules: any) {
        rules.forEach(rule => this.processRule(rule, false));
    }


    private processRule(rule, innerRule: boolean) {
        if (!rule.jsonField) return;
        if (!!rule.fields) {
            this.fieldsPosition.push(new FieldPosition(rule.jsonField, "", true))
            rule.fields.forEach(rule => this.processRule(rule, true));
            this.nestedRules.set(rule.jsonField, new JsonToArray(rule.fields));
        }
        else {
            if (rule.columnName) {
                if (this.columns.get(rule.columnName) === undefined) {
                    this.resultingArray[0].push(rule.columnName);
                    this.columns.set(rule.columnName, this.resultingArray[0].length - 1);
                }
                if (!innerRule) this.fieldsPosition.push(new FieldPosition(rule.jsonField, this.columns.get(rule.columnName), false));
            }
        }
    }

    public add(jsonObject: any) {

        const linesToAppend: string[][] = new Array();
        linesToAppend.push(new Array(this.resultingArray[0].length));
        this.fillArrayWithEmptyStrings(linesToAppend[0]);
        this.fieldsPosition.forEach(field => {
            const fieldValue = _.get(jsonObject, field.jsonField);
            if (!!fieldValue) linesToAppend[0][field.columnNumber] = fieldValue;
        });

        for (let [jsonField, nestedRule] of this.nestedRules) {
            const nestedJsonObjects = _.get(jsonObject, jsonField);
            if (!!nestedJsonObjects) {
                nestedJsonObjects.forEach(nestedObject => {
                    nestedRule.add(nestedObject);
                });
                let nestedArray = nestedRule.getResultingArray();
                if (nestedArray.length > 1) {
    
                    const lineToDuplicate: string[] = Array.from(linesToAppend[0]);
                    for (let lineIndex = 1; lineIndex < nestedArray.length; lineIndex++) {
                        if (lineIndex>1) linesToAppend.push(Array.from(lineToDuplicate));
                        for (let columnIndex = 0; columnIndex < nestedArray[0].length; columnIndex++) {
                            const col = nestedArray[0][columnIndex];
                            const value = nestedArray[lineIndex][columnIndex];
                            const colNumber = this.columns.get(col);
                            linesToAppend[lineIndex-1][colNumber] = value;
                        }
                    }
                     
                     nestedRule.cleanResultingArray();
                     // We can process only one nested array , the first of the object 
                    break;
                }
            }
        }
        linesToAppend.forEach( line => this.resultingArray.push(line));
    }

    public getResultingArray(): string[][] {
        return this.resultingArray;
    }
    
    public cleanResultingArray()
    {
        const firstLine = this.resultingArray[0]
        this.resultingArray = [[]];
        this.resultingArray[0] = Array.from(firstLine);

    }
    private fillArrayWithEmptyStrings(array: string[]): void {
        for (let index = 0; index < array.length; index++) array[index] = "";
    }

}
