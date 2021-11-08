const fs = require('fs');
const mongoClient = require('mongodb').MongoClient;
const i18next = require('i18next');

const login = process.argv[4];
const pwd = process.argv[5];
const url = 'mongodb://' + login + ':' + pwd + '@' + process.argv[2] + ':' + process.argv[3] + '/';
const bundlesDirectory = process.argv[6];

// Open the bundles directory
let openedDir = fs.opendirSync(bundlesDirectory);

let directoriesLeft = true;
let i18nPerProcessAndVersion = new Map();
let cards = [];
let archivedCards = [];
while (directoriesLeft) {
    let currentBundleDir = openedDir.readSync();

    if (currentBundleDir != null) {
        if (fs.lstatSync(openedDir.path + '/' + currentBundleDir.name).isDirectory()) {

            let configFileData = fs.readFileSync(openedDir.path + '/' + currentBundleDir.name + '/config.json');
            let configFileJson = JSON.parse(configFileData);

            let i18nFileData = fs.readFileSync(openedDir.path + '/' + currentBundleDir.name + '/i18n.json');
            let i18nFileJson = JSON.parse(i18nFileData);
            loadI18n(i18nFileJson, '', configFileJson.id + '.' + configFileJson.version);
        }
    }
    else
        directoriesLeft = false;
}
openedDir.closeSync();

i18next.init({
    lng: 'en',
    debug: false,
    resources: {
        en: {
            translation: Object.fromEntries(i18nPerProcessAndVersion)
        }
    }
}).then(function(t) {
        fetch('cards').then(r => update('cards', cards));
        fetch('archivedCards').then(r => update('archivedCards', archivedCards));
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
            cards = await db.collection(collectionName).find({}, {projection:{ _id: 1, process: 1, processVersion: 1, title: 1, summary: 1}}).toArray();
            break;
        case 'archivedCards':
            archivedCards = await db.collection(collectionName).find({}, {projection:{ _id: 1, process: 1, processVersion: 1, title: 1, summary: 1}}).toArray();
            break;
    }

    // close connection
    client.close();
}

async function update(collectionName, documents) {
    // connect to the DB
    const client = await mongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('operator-fabric');

    for (const card of documents) {
        const titleI18nKey = '' + card.title.key;
        const titleI18nParameters = card.title.parameters;
        const titleKeyToFind = titleI18nKey + '.' + card.process + '.' + card.processVersion;
        const titleTranslated = i18next.t(titleKeyToFind, titleI18nParameters);
        if (titleTranslated.localeCompare(titleKeyToFind) === 0)
            console.log('WARNING: no translation for key=' + titleI18nKey + ' for card id=' + card._id +
                ' (process=' + card.process + ', processVersion=' + card.processVersion +')');

        const summaryI18nKey = '' + card.summary.key;
        const summaryI18nParameters = card.summary.parameters;
        const summaryKeyToFind = summaryI18nKey + '.' + card.process + '.' + card.processVersion;
        const summaryTranslated = i18next.t(summaryKeyToFind, summaryI18nParameters);
        if (summaryTranslated.localeCompare(summaryKeyToFind) === 0)
            console.log('WARNING: no translation for key=' + summaryI18nKey + ' for card id=' + card._id +
                ' (process=' + card.process + ', processVersion=' + card.processVersion +')');

        const queryForUpdate = {_id: card._id};
        const newValuesForUpdate = {
            $set: {
                titleTranslated: titleTranslated,
                summaryTranslated: summaryTranslated
            }
        };
        // execute update query
        await db.collection(collectionName).updateOne(queryForUpdate, newValuesForUpdate);
    }
    // close connection
    client.close();
}

//suffixe is "processId.processVersion"
function loadI18n(i18nFileJson, prefixe, suffixe) {
    for (var key in i18nFileJson) {
        if (i18nFileJson[key] instanceof Object) {
            (!!prefixe) ? loadI18n(i18nFileJson[key], prefixe + '.' + key, suffixe) :
                loadI18n(i18nFileJson[key], key, suffixe);
        }
        else {
            (!!prefixe) ? i18nPerProcessAndVersion.set(prefixe + '.' + key + '.' + suffixe, i18nFileJson[key]) :
                i18nPerProcessAndVersion.set(key + '.' + suffixe, i18nFileJson[key]);
        }
    }
}