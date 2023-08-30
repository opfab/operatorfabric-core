/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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

let cards = [];
const byweekdayValues = ["", "MO", "TU", "WE", "TH", "FR", "SA", "SU"];

fetch('cards').then(() => {
    update('cards', cards)
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
                    "timeSpans.recurrence": {$exists: true},
                    process: oldProcess,
                    state: oldState,
                }).toArray();
            break;
    }

    // close connection
    client.close();
}

async function update(collectionName, documents) {
    console.log('documents before update : ', JSON.stringify(documents));

    // connect to the DB
    const client = await mongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('operator-fabric');

    for (const card of documents) {
        const rRule = {
            freq: "DAILY",
            interval: 1,
            wkst: "MO",
            byhour: [card.timeSpans[0].recurrence.hoursAndMinutes.hours],
            byminute: [card.timeSpans[0].recurrence.hoursAndMinutes.minutes],
            byweekday: card.timeSpans[0].recurrence.daysOfWeek?.map(day => {return byweekdayValues[day]}),
            bymonth: card.timeSpans[0].recurrence.months?.map(month => {return month + 1}),
            durationInMinutes: card.timeSpans[0].recurrence.durationInMinutes,
            tzid: card.timeSpans[0].recurrence.timeZone,
            bysetpos: [],
            bymonthday: []
        };
        delete card.timeSpans;

        delete card.data.hours;
        delete card.data.minutes;
        delete card.data.daysOfWeek;
        delete card.data.months;
        card.data.freq = rRule.freq;
        card.data.byhour = rRule.byhour;
        card.data.byminute = rRule.byminute;
        card.data.byweekday = rRule.byweekday;
        card.data.bymonth = rRule.bymonth;
        card.data.bysetpos = rRule.bysetpos;
        card.data.bymonthday = rRule.bymonthday;

        const queryForUpdate = {_id: card._id};
        const newValuesForUpdate = {
            $set: {
                process: newProcess,
                state: newState,
                data: card.data,
                rRule: rRule
            },
            $unset: {
                timeSpans: ""
            }
        };
        // execute update query
        await db.collection(collectionName).updateOne(queryForUpdate, newValuesForUpdate);
    }
    // close connection
    client.close();
}