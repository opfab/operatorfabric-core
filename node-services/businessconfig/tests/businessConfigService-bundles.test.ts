import exp from 'constants';
import {BusinessConfigService} from '../src/domain/client-side/businessConfigService';
import {loadAnotherTestBundle, loadInvalidBundle, loadTestBundle} from './helper';
import fs from 'fs';
import {ResponseReturnCode} from '../src/domain/client-side/serviceResponse';

describe('BusinessConfig', function () {
    let businessConfig: BusinessConfigService;
    const tempStoragePath = 'tmp/storage' + Math.random();
    beforeAll(async () => {
        if (!fs.existsSync(tempStoragePath)) {
            fs.mkdirSync(tempStoragePath);
        }
        businessConfig = new BusinessConfigService(tempStoragePath);
        const bundle = loadTestBundle(1);
        const bundle2 = loadTestBundle(2);
        const anotherBundle = loadAnotherTestBundle();
        await businessConfig.postResource('processes', bundle, ['ADMIN']);
        await businessConfig.postResource('processes', bundle2, ['ADMIN']);
        await businessConfig.postResource('processes', anotherBundle, ['ADMIN']);
    });

    afterAll(() => {
        fs.rmSync(tempStoragePath, {recursive: true, force: true});
    });

    describe('Get process config', function () {
        it('without version should return last version and return code 200', async function () {
            const result = businessConfig.getResource('processes/testProcess', undefined, ['']);

            const expectedObj = {
                id: 'testProcess',
                name: 'Process example ',
                version: '2',
                states: {
                    messageState: {
                        name: 'Message',
                        description: 'Message state',
                        templateName: 'template',
                        styles: ['style']
                    }
                }
            };
            expect(result.response).toEqual(expectedObj);
            expect(result.returnCode).toBe(200);
        });
        it('with version 1 and return code 200', async function () {
            const result = businessConfig.getResource('processes/testProcess', '1', ['']);

            const expectedObj = {
                id: 'testProcess',
                name: 'Process example ',
                version: '1',
                states: {
                    messageState: {
                        name: 'Message',
                        description: 'Message state',
                        templateName: 'template',
                        styles: ['style']
                    }
                }
            };
            expect(result.response).toEqual(expectedObj);
            expect(result.returnCode).toBe(200);
        });
        it('with version 2 and return code 200', async function () {
            const result = businessConfig.getResource('processes/testProcess', '2', ['']);

            const expectedObj = {
                id: 'testProcess',
                name: 'Process example ',
                version: '2',
                states: {
                    messageState: {
                        name: 'Message',
                        description: 'Message state',
                        templateName: 'template',
                        styles: ['style']
                    }
                }
            };
            expect(result.response).toEqual(expectedObj);
            expect(result.returnCode).toBe(200);
        });
        it('Should return 404 if process not found', async function () {
            const result = businessConfig.getResource('processes/unexistingProcess', undefined, ['']);
            expect(result.returnCode).toBe(404);
        });
    });
    describe('Get process config after reload', function () {
        let newBusinessConfig: BusinessConfigService;
        beforeAll(async () => {
            newBusinessConfig = new BusinessConfigService(tempStoragePath);
        });
        it('Should get process config without version should return last version and return code 200', async function () {
            const result = newBusinessConfig.getResource('processes/testProcess', undefined, ['']);

            const expectedObj = {
                id: 'testProcess',
                name: 'Process example ',
                version: '2',
                states: {
                    messageState: {
                        name: 'Message',
                        description: 'Message state',
                        templateName: 'template',
                        styles: ['style']
                    }
                }
            };
            expect(result.response).toEqual(expectedObj);
            expect(result.returnCode).toBe(200);
        });
        it('Should get process config with version 1 and return code 200', async function () {
            const result = newBusinessConfig.getResource('processes/testProcess', '1', ['']);

            const expectedObj = {
                id: 'testProcess',
                name: 'Process example ',
                version: '1',
                states: {
                    messageState: {
                        name: 'Message',
                        description: 'Message state',
                        templateName: 'template',
                        styles: ['style']
                    }
                }
            };
            expect(result.response).toEqual(expectedObj);
            expect(result.returnCode).toBe(200);
        });
    });

    describe('Get all processes config', function () {
        it('Should get all processes config with last process version and return 200', async function () {
            const result = businessConfig.getResource('processes', undefined, ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response[0].id).toBe('testProcess');
            expect(result.response[0].version).toBe('2');
            expect(result.response[0].states['messageState'].name).toBe('Message');
            expect(result.response[1].id).toBe('anotherProcess');
            expect(result.response[1].version).toBe('0.5');
            expect(result.response[1].states['actionState'].name).toBe('actionState');
        });
        it ('Should get all processes config with all version and return 200', async function () {
            const result = businessConfig.getResource('processes', 'all', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response[0].id).toBe('testProcess');
            expect(result.response[0].version).toBe('1');
            expect(result.response[0].states['messageState'].name).toBe('Message');
            expect(result.response[1].id).toBe('testProcess');
            expect(result.response[1].version).toBe('2');
            expect(result.response[1].states['messageState'].name).toBe('Message');
            expect(result.response[2].id).toBe('anotherProcess');
            expect(result.response[2].version).toBe('0.5');
            expect(result.response[2].states['actionState'].name).toBe('actionState');
        });
    });
    describe('Get process history', function () {
        it('Should get process history and return 200', async function () {
            const result = businessConfig.getResource('processhistory/testProcess', undefined, ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response[0].version).toBe('1');
            expect(result.response[0].id).toBe('testProcess');
            expect(result.response[1].version).toBe('2');
            expect(result.response[1].id).toBe('testProcess');
        });
        it ('Should return 404 if process not found', async function () {
            const result = businessConfig.getResource('processhistory/unexistingProcess', undefined, ['']);
            expect(result.returnCode).toBe(404);
        });
    });
    describe('Get resource', function () {
        beforeAll(async () => {});
        it('Should get css ressource and return 200', async function () {
            const result = businessConfig.getResource('processes/testProcess/css/style1', '1', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toContain('font-weight: bold;');
        });
        it('Should get css ressource and return 200 for version 2', async function () {
            const result = businessConfig.getResource('processes/testProcess/css/style2', '2', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toContain('font-weight: bold;');
        });
        it('Shoud get template ressource and return 200', async function () {
            const result = businessConfig.getResource('processes/testProcess/template/template1', '1', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toContain('Test template 1');
        });
        it('Shoud get template ressource and return 200 for version 2', async function () {
            const result = businessConfig.getResource('processes/testProcess/template/template2', '2', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toContain('Test template 2');
        });
        it('Shoud get i18n ressource and return 200', async function () {
            const result = businessConfig.getResource('processes/testProcess/i18n', '1', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toContain('"test": "test1"');
        });
        it('Shoud get i18n ressource and return 200 for version 2', async function () {
            const result = businessConfig.getResource('processes/testProcess/i18n', '2', ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toContain('"test": "test2"');
        });
        it('Shoud return 404 if resource not found', async function () {
            const result = businessConfig.getResource('processes/testProcess/css/unexistingstyle', '1', ['']);
            expect(result.returnCode).toBe(404);
        });
        it('Should return 404 if version not found', async function () {
            const result = businessConfig.getResource('processes/testProcess/css/dastyle', '3', ['']);
            expect(result.returnCode).toBe(404);
        });
        it('Shoud return 400 if resource type is no valid', async function () {
            const result = businessConfig.getResource('processes/testProcess/dummy/unexistingstyle', '1', ['']);
            expect(result.returnCode).toBe(400);
        });
    });

});

describe('Incorrect config.json', function () {
    let businessConfig: BusinessConfigService;
    const tempStoragePath = 'tmp/storage' + Math.random();
    beforeAll(async () => {
        if (!fs.existsSync(tempStoragePath)) {
            fs.mkdirSync(tempStoragePath);
        }
        businessConfig = new BusinessConfigService(tempStoragePath);
    });

    afterAll(() => {
        fs.rmSync(tempStoragePath, {recursive: true, force: true});
    });

    it('Should not be loaded if no process Id ', async function () {
        const invalidBundle = loadInvalidBundle();
        const result = await businessConfig.postResource('processes',invalidBundle, ['ADMIN']);
        expect(result.returnCode).toBe(400);
    });
    it('Should not be keep invalid field', async function () {
        const anotherBundle = loadAnotherTestBundle();
        const result = await businessConfig.postResource('processes',anotherBundle, ['ADMIN']);
        expect(result.returnCode).toBe(ResponseReturnCode.CREATED);
        const config = businessConfig.getResource('processes/anotherProcess', undefined, ['']);
        expect(config.returnCode).toBe(ResponseReturnCode.OK);
        expect(config.response.version).toBe('0.5');
        expect(config.response.invalidField).toBeUndefined();
    });
});

describe ('Security - Load bundle', function () {
    let businessConfig: BusinessConfigService;
    const tempStoragePath = 'tmp/storage' + Math.random();
    beforeAll(async () => {
        if (!fs.existsSync(tempStoragePath)) {
            fs.mkdirSync(tempStoragePath);
        }
        businessConfig = new BusinessConfigService(tempStoragePath);
    });

    afterAll(() => {
        fs.rmSync(tempStoragePath, {recursive: true, force: true});
    })
    it ('Should return 403 if user has not ADMIN or ADMIN_BUSINESS_PROCESS permission', async function () {
        const bundle = loadTestBundle(1);
        const result = await businessConfig.postResource('processes', bundle, ['READONLY']);
        expect(result.returnCode).toBe(ResponseReturnCode.FORBIDDEN);
    });
    it ('Should create if user has ADMIN_BUSINESS_PROCESS permission', async function () {
        const bundle = loadTestBundle(1);
        const result = await businessConfig.postResource('processes', bundle, ['ADMIN_BUSINESS_PROCESS']);
        expect(result.returnCode).toBe(ResponseReturnCode.CREATED);
    });
});