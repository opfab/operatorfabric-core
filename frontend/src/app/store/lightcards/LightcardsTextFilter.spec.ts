/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCardsTextFilter} from './LightcardsTextFilter';
import {Card} from 'app/model/Card';
import {getSeveralLightCards} from '@tests/helpers';

describe('LightCardsTextFilter', () => {
    let filter: LightCardsTextFilter;

    beforeEach(() => {
        filter = new LightCardsTextFilter();
    });

    describe('setSearchTerm', () => {
        it('should convert search term to uppercase', (done) => {
            filter.getSearchChanges().subscribe((searchTerm) => {
                expect(searchTerm).toBe('HELLO WORLD');
                done();
            });

            filter.setSearchTerm('hello world');
        });

        it('should emit search term changes', (done) => {
            filter.getSearchChanges().subscribe((searchTerm) => {
                expect(searchTerm).toBe('TEST');
                done();
            });

            filter.setSearchTerm('test');
        });

        it('should handle empty string', (done) => {
            filter.getSearchChanges().subscribe((searchTerm) => {
                expect(searchTerm).toBe('');
                done();
            });

            filter.setSearchTerm('');
        });

        it('should handle special characters', (done) => {
            filter.getSearchChanges().subscribe((searchTerm) => {
                expect(searchTerm).toBe('TEST-123_ABC');
                done();
            });

            filter.setSearchTerm('test-123_abc');
        });
    });

    describe('searchLightCards', () => {
        it('should return all cards when search term is empty', () => {
            const cards = getSeveralLightCards(3, {
                titleTranslated: 'Test Title',
                summaryTranslated: 'Test Summary'
            });

            filter.setSearchTerm('');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(3);
            expect(result).toEqual(cards);
        });

        it('should filter cards by title', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Important Alert',
                    summaryTranslated: 'Some description'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Regular Message',
                    summaryTranslated: 'Another description'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Another Alert',
                    summaryTranslated: 'Different description'
                })
            ];

            filter.setSearchTerm('alert');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(2);
            expect(result).toContain(cards[0]);
            expect(result).toContain(cards[2]);
        });

        it('should filter cards by summary', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Title One',
                    summaryTranslated: 'This contains urgent information'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Title Two',
                    summaryTranslated: 'Regular information'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Title Three',
                    summaryTranslated: 'Urgent update required'
                })
            ];

            filter.setSearchTerm('urgent');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(2);
            expect(result).toContain(cards[0]);
            expect(result).toContain(cards[2]);
        });

        it('should filter cards by both title and summary', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Critical System Alert',
                    summaryTranslated: 'Normal description'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Regular Message',
                    summaryTranslated: 'Critical system issue detected'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Info Message',
                    summaryTranslated: 'Some information'
                })
            ];

            filter.setSearchTerm('critical');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(2);
            expect(result).toContain(cards[0]);
            expect(result).toContain(cards[1]);
        });

        it('should remove duplicate cards when found in both title and summary', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Alert System',
                    summaryTranslated: 'System alert detected'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Regular Message',
                    summaryTranslated: 'Normal operation'
                })
            ];

            filter.setSearchTerm('alert');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(1);
            expect(result).toContain(cards[0]);
        });

        it('should be case insensitive', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Important Alert',
                    summaryTranslated: 'Description'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Message',
                    summaryTranslated: 'IMPORTANT update'
                })
            ];

            filter.setSearchTerm('ImPoRtAnT');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(2);
            expect(result).toContain(cards[0]);
            expect(result).toContain(cards[1]);
        });

        it('should return empty array when no cards match', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Title One',
                    summaryTranslated: 'Summary One'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Title Two',
                    summaryTranslated: 'Summary Two'
                })
            ];

            filter.setSearchTerm('nonexistent');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(0);
        });

        it('should handle cards with null or undefined title', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: null,
                    summaryTranslated: 'Search term here'
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: undefined,
                    summaryTranslated: 'Another summary'
                })
            ];

            filter.setSearchTerm('search');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(1);
            expect(result).toContain(cards[0]);
        });

        it('should handle cards with null or undefined summary', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Search term here',
                    summaryTranslated: null
                }),
                ...getSeveralLightCards(1, {
                    titleTranslated: 'Another title',
                    summaryTranslated: undefined
                })
            ];

            filter.setSearchTerm('search');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(1);
            expect(result).toContain(cards[0]);
        });

        it('should handle empty cards array', () => {
            const cards: Card[] = [];

            filter.setSearchTerm('test');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(0);
        });

        it('should handle partial word matching', () => {
            const cards: Card[] = [
                ...getSeveralLightCards(1, {
                    titleTranslated: 'System notification',
                    summaryTranslated: 'Description'
                })
            ];

            filter.setSearchTerm('notif');
            const result = filter.searchLightCards(cards);

            expect(result.length).toBe(1);
            expect(result).toContain(cards[0]);
        });
    });
});
