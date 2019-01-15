import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsService} from './thirds.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthenticationService} from '@ofServices/authentication.service';
import {GuidService} from '@ofServices/guid.service';
import {environment} from '@env/environment';

describe('Thirds Services & Components', () => {
    let injector: TestBed;
    let service: ThirdsService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthenticationService, GuidService, ThirdsService]
        });
        injector = getTestBed();
        service = TestBed.get(ThirdsService);
        httpMock = injector.get(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('#fetchI18nJson', () => {
        it('should return json object with single en language', () => {
            service.fetchI18nJson('testPublisher', '0', ['en'])
                .subscribe(result => {
                    expect(result.en.testPublisher["0"].menu.feed).toEqual('Feed')
                    expect(result.en.testPublisher["0"].menu.archives).toEqual('Archives')
                });

            let calls = httpMock.match(req=>req.url == `${environment.urls.thirds}/thirds/testPublisher/i18n`)
            expect(calls.length).toEqual(1);
            expect(calls[0].request.method).toBe('GET');
            calls[0].flush({
                menu: {
                    feed: 'Feed',
                    archives: 'Archives'
                }
            });
        });
        it('should return json object with multiple languages', () => {
            service.fetchI18nJson('testPublisher', '0', ['en','fr'])
                .subscribe(result => {
                    expect(result.en.testPublisher["0"].menu.feed).toEqual('Feed')
                    expect(result.en.testPublisher["0"].menu.archives).toEqual('Archives')
                    expect(result.fr.testPublisher["0"].menu.feed).toEqual('Flux de Cartes')
                    expect(result.fr.testPublisher["0"].menu.archives).toEqual('Archives')
                });

            let calls = httpMock.match(req=>req.url == `${environment.urls.thirds}/thirds/testPublisher/i18n`)
            expect(calls.length).toEqual(2);

            expect(calls[0].request.method).toBe('GET');
            expect(calls[0].request.params.get('locale')).toEqual('en');
            calls[0].flush({
                menu: {
                    feed: 'Feed',
                    archives: 'Archives'
                }
            });
            // req = httpMock.expectOne(`${environment.urls.thirds}/thirds/testPublisher/i18n`)
            expect(calls[1].request.method).toBe('GET');
            expect(calls[1].request.params.get('locale')).toEqual('fr');
            calls[1].flush({
                menu: {
                    feed: 'Flux de Cartes',
                    archives: 'Archives'
                }
            });
        });
    });
});
