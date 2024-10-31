/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const mongoClient = require('mongodb').MongoClient;

const login = process.argv[4];
const pwd = process.argv[5];
const url = 'mongodb://' + login + ':' + pwd + '@' + process.argv[2] + ':' + process.argv[3] + '/';

const oldProcess = process.argv[6];
const newProcess = process.argv[7];
const oldState = process.argv[8];
const newState = process.argv[9];
const newProcessVersion = process.argv[10];

let cards = [];
let archivedCards = [];
const byweekdayValues = ["", "MO", "TU", "WE", "TH", "FR", "SA", "SU"];

fetch('cards').then(() => {
    update('cards', cards)
});

fetch('archivedCards').then(() => {
    update('archivedCards', archivedCards)
});


async function fetch(collectionName) {
    // connect to the DB
    const client = await mongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('operator-fabric');

    // execute find query
    switch (collectionName) {
        case 'cards':
            cards = await db.collection(collectionName).find(
                {
                    process: oldProcess,
                    state: oldState,
                }).toArray();
            break;
        case 'archivedCards':
            archivedCards = await db.collection(collectionName).find(
                {
                    process: oldProcess,
                    state: oldState,
                }).toArray();
            break;
    }

    // close connection
    client.close();
}

async function update(collectionName, documents) {
    if (collectionName == 'cards') {
        console.log('\n\nnumber of cards to update : ', documents.length);
    } else {
        console.log('\n\nnumber of archivedCards to update : ', documents.length);
    }

    // connect to the DB
    const client = await mongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('operator-fabric');

    for (const card of documents) {

        if (collectionName == 'cards') {
            console.log('card before update :', JSON.stringify(card));
        } else {
            console.log('archivedCard before update :', JSON.stringify(card));
        }

        let rRule = {};
        let isCardWithoutRecurrence = false;
        let timeSpansBackupForCardWithoutRecurrence;

        if (typeof card.timeSpans !== 'undefined' && card.timeSpans.length > 0) {
            let byhour, byminute;
            if (card.timeSpans[0].recurrence) {
                byhour = card.timeSpans[0].recurrence?.hoursAndMinutes?.hours;
                byminute = card.timeSpans[0].recurrence?.hoursAndMinutes?.minutes;
            } else {
                isCardWithoutRecurrence = true;
                timeSpansBackupForCardWithoutRecurrence = card.timeSpans;
                byhour = new Date(card.startDate).getHours();
                byminute = new Date(card.startDate).getMinutes();
            }

            rRule = {
                freq: "DAILY",
                interval: 1,
                wkst: "MO",
                byhour: [byhour],
                byminute: [byminute],
                byweekday: card.timeSpans[0].recurrence?.daysOfWeek?.map(day => {
                    return byweekdayValues[day]
                }),
                durationInMinutes: card.timeSpans[0].recurrence?.durationInMinutes ?? card.data.durationInMinutes,
                tzid: card.timeSpans[0].recurrence?.timeZone,
                bysetpos: [],
                bymonthday: []
            };

            if (card.timeSpans[0].recurrence) {
                if (card.timeSpans[0].recurrence.months) {
                    rRule.bymonth = card.timeSpans[0].recurrence.months.map(month => {
                        return month + 1
                    });
                } else {
                    rRule.bymonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                }
            } else {
                rRule.bymonth = [];
            }
        }

        const queryForDelete = {_id: card._id};
        let replacementCard = card;

        if (Object.keys(rRule).length) {
            delete replacementCard.timeSpans;
            delete replacementCard.data.hours;
            delete replacementCard.data.minutes;
            delete replacementCard.data.daysOfWeek;
            delete replacementCard.data.months;
            replacementCard.data.freq = rRule.freq;
            replacementCard.data.byhour = rRule.byhour;
            replacementCard.data.byminute = rRule.byminute;
            replacementCard.data.byweekday = rRule.byweekday;
            replacementCard.data.bymonth = rRule.bymonth;
            replacementCard.data.bysetpos = rRule.bysetpos;
            replacementCard.data.bymonthday = rRule.bymonthday;
        }

        if (collectionName == 'cards') {
            replacementCard._id = newProcess + '.' + card.processInstanceId;
        }

        replacementCard.processStateKey = newProcess + '.' + newState;
        replacementCard.process = newProcess;
        replacementCard.state = newState;
        replacementCard.processVersion = newProcessVersion;
        replacementCard.rRule = rRule;

        if (isCardWithoutRecurrence) {
            delete replacementCard.rRule;
            delete replacementCard.data.freq;
            delete replacementCard.data.byhour;
            delete replacementCard.data.byminute;
            delete replacementCard.data.byweekday;
            delete replacementCard.data.bymonth;
            delete replacementCard.data.bysetpos;
            delete replacementCard.data.bymonthday;
            replacementCard.timeSpans = timeSpansBackupForCardWithoutRecurrence;
        }

        await db.collection(collectionName).deleteOne(queryForDelete);
        await db.collection(collectionName).insertOne(replacementCard);
    }
    // close connection
    client.close();
}