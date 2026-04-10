/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {TableRowBuilder} from './TableRowBuilder';
import {FilterValues} from '../../../../services/customScreen/cardList/FilterValues';
import {CardFilter} from '../../../../services/customScreen/cardList/CardFilter';
import {ResultTableExport} from './ResultTableExport';
import {getColumnsDefinitionForAgGrid} from './ColumnDefinitions';
import {CardListScreenDefinition} from '@ofServices/customScreen/cardList/CardListScreenDefinition';

export class ResultTable {
    private readonly cardListScreenDefinition: CardListScreenDefinition;
    private readonly tableRowsBuilder: TableRowBuilder;
    private readonly cardFilter: CardFilter;

    private results: Array<any> = [];

    constructor(cardListScreenDefinition: CardListScreenDefinition) {
        this.cardListScreenDefinition = cardListScreenDefinition;
        this.tableRowsBuilder = new TableRowBuilder(cardListScreenDefinition);
        this.cardFilter = new CardFilter();
    }

    public setFilters(filtersValue: FilterValues) {
        this.cardFilter.setFilters(filtersValue, this.cardListScreenDefinition);
    }

    public getDataArrayFromCards(cards: Card[], childCards: Map<string, Array<Card>>): any[] {
        const dataArray = [];
        cards.forEach((card) => {
            if (!this.cardFilter.isCardFiltered(card, childCards)) {
                const data = this.tableRowsBuilder.getRowFromCard(
                    card,
                    childCards.get(card.id),
                    this.cardListScreenDefinition.results.columns
                );
                dataArray.push(data);
            }
        });
        this.results = dataArray;
        return dataArray;
    }

    public getDataForExport(): Array<any> {
        return new ResultTableExport(
            this.cardListScreenDefinition,
            getColumnsDefinitionForAgGrid(this.cardListScreenDefinition)
        ).getDataForExport(this.results);
    }
}
