/* Copyright (c) 2024, RTE (http://www.rte-france.com)
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

const action = process.argv[6];

const databaseUrl = 'mongodb://' + login + ':' + pwd + '@' + process.argv[2] + ':' + process.argv[3] + '/';
const databaseName = 'operator-fabric';

async function updateEntityRoles(databaseUrl, databaseName) {

  console.log("Migration of entity roles is starting");

  const client = new mongoClient(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    console.log("Connection to the mongo database has been established");

    const db = client.db(databaseName);
    const entitiesCollection = db.collection('entity');

    await entitiesCollection.updateMany(
      { entityAllowedToSendCard: true },
      { $set: { roles: ["ACTIVITY_AREA", "CARD_SENDER", "CARD_RECEIVER"] } }
    );

    await entitiesCollection.updateMany(
      { entityAllowedToSendCard: false },
      { $set: { roles: ["CARD_RECEIVER"] } }
    );

    console.log("Entity roles have been successfully updated");

  } finally {
    await client.close();
    console.log("Connection to the mongo database has been terminated");
  }
}

async function clean(databaseUrl, databaseName) {

  console.log("Cleaning database");

  const client = new mongoClient(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    console.log("Connection to the mongo database has been established");

    const db = client.db(databaseName);
    const entitiesCollection = db.collection('entity');

    await entitiesCollection.updateMany(
      {},
      { $unset: {entityAllowedToSendCard:""} }
    );
    
    console.log("Entities have been successfully updated");

  } finally {
    await client.close();
    console.log("Connection to the mongo database has been terminated");
  }
}


if (action === 'start')
  updateEntityRoles(databaseUrl, databaseName);
else if (action === 'clean')
  clean(databaseUrl, databaseName);
else
  console.log("Invalid action : " + action);