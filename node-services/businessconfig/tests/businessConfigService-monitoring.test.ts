import {BusinessConfigService} from '../src/domain/client-side/businessConfigService';
import fs from 'fs';

describe('BusinessConfig', function () {
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


    describe('Monitoring', function () {
        const monitoringConfig = {
            export: {
                fields: [
                    {
                        columnName: 'Creation Date',
                        jsonField: 'card.publishDate',
                        type: 'EPOCHDATE'
                    },
                    {
                        columnName: 'Service',
                        jsonField: 'card.processGroup'
                    },
                    {
                        jsonField: 'childCards',
                        fields: [{columnName: 'Response from', jsonField: 'publisherName'}]
                    }
                ]
            }
        };

        const monitoringConfig2 = {
            export: {
                fields: [
                    {
                        columnName: 'process',
                        jsonField: 'card.process'
                    },
                    {
                        columnName: 'Creation Date',
                        jsonField: 'card.publishDate',
                        type: 'EPOCHDATE'
                    },
                    {
                        columnName: 'Service',
                        jsonField: 'card.processGroup'
                    },
                    {
                        jsonField: 'childCards',
                        fields: [{columnName: 'Response from', jsonField: 'publisherName'}]
                    }
                ]
            }
        };
        beforeAll(async () => {
            await businessConfig.postResource('monitoring', monitoringConfig, ['ADMIN']);
        });
        it('Should store monitoring config on disk', async function () {
            expect(fs.existsSync(`${tempStoragePath}/monitoring.json`)).toBe(true);
            expect(fs.readFileSync(`${tempStoragePath}/monitoring.json`).toString()).toBe(JSON.stringify(monitoringConfig));
        });
        it('Should return monitoring config', async function () {
            const result = businessConfig.getResource('monitoring', undefined, ['']);
            expect(result.returnCode).toBe(200);
            expect(result.response).toEqual(JSON.stringify(monitoringConfig));
        });
        it ('Should update monitoring config', async function () {
            await businessConfig.postResource('monitoring', monitoringConfig2, ['ADMIN']);
            expect(fs.existsSync(`${tempStoragePath}/monitoring.json`)).toBe(true);
            expect(fs.readFileSync(`${tempStoragePath}/monitoring.json`).toString()).toBe(JSON.stringify(monitoringConfig2));
            expect(businessConfig.getResource('monitoring', undefined, ['']).response).toEqual(JSON.stringify(monitoringConfig2));
        });
        it ('Should ignore invalid field in monitoring config', async function () {
            const monitoringConfig3 = {
                export: {
                    fields: [
                        {
                            invalidField: 'dummy',
                            columnName: 'Creation Date',
                            jsonField: 'card.publishDate',
                            type: 'EPOCHDATE'
                        }
                    ]
                }
            };
            const monitoringConfigWithoutInvalidField = {
                export: {
                    fields: [
                        {
                            columnName: 'Creation Date',
                            jsonField: 'card.publishDate',
                            type: 'EPOCHDATE'
                        }
                    ]
                }
            };
            await businessConfig.postResource('monitoring', monitoringConfig3, ['ADMIN']);
            expect(businessConfig.getResource('monitoring', undefined, ['']).response).toEqual(JSON.stringify(monitoringConfigWithoutInvalidField));
        });
        it ('Should return 400 if monitoring config is invalid', async function () {
            const monitoringConfig4 = {
                export: {
                    fields: "dummy"
                }
            };
            const result = await businessConfig.postResource('monitoring', monitoringConfig4, ['ADMIN']);
            expect(result.returnCode).toBe(400);
            expect(result.response.length).toBeGreaterThan(0);
        });
        
    });
});
