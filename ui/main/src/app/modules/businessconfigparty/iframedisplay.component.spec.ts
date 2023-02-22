/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {IframeDisplayComponent} from './iframedisplay.component';
import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {ConfigService} from 'app/business/services/config.service';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';

export class ActivatedRouteMock {
    public paramMap = of(
        convertToParamMap({
            menu_id: 'menu',
            menu_entry_id: 'entry'
        })
    );
    public queryParamMap = of();
}

describe('IFrameDisplayComponent', () => {
    let component: IframeDisplayComponent;
    let mockConfigService: jasmine.SpyObj<ConfigService>;
    let mockGlobalStyleService: jasmine.SpyObj<GlobalStyleService>;
    let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;
    let router: Router;
    const fakeSafeIFrameUrl: SafeUrl = jasmine.createSpy();
    const mockDocument = {location: {href: 'https://opfab-ui/menu/entry?customParam=param'}};
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Router, useValue: {url: '/menu/entry'}},
                {provide: DOCUMENT, useValue: mockDocument},
                IframeDisplayComponent,
                {provide: ActivatedRoute, useValue: new ActivatedRouteMock()},
                {provide: ConfigService, useValue: jasmine.createSpyObj('ConfigService', ['queryMenuEntryURL'])},
                {provide: GlobalStyleService, useValue: jasmine.createSpyObj('GlobalStyleService', ['getStyle','getStyleChange'])},
                {
                    provide: DomSanitizer,
                    useValue: jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl'])
                }
            ]
        });
        router = TestBed.inject(Router);
        mockConfigService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
        mockGlobalStyleService = TestBed.inject(GlobalStyleService) as jasmine.SpyObj<GlobalStyleService>;
        mockDomSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

        mockConfigService.queryMenuEntryURL.and.returnValue(of('https://wikipedia.org'));
        mockGlobalStyleService.getStyle.and.returnValue('dark');
        mockGlobalStyleService.getStyleChange.and.returnValue(new Subject<string>().asObservable());
        mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(fakeSafeIFrameUrl);

        component = TestBed.inject(IframeDisplayComponent);
    });

    it('Should create the iFrameUrl onInit with the opfab theme', () => {
        component.ngOnInit();

        expect(mockConfigService.queryMenuEntryURL).toHaveBeenCalledOnceWith('menu', 'entry');
        expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledOnceWith(
            'https://wikipedia.org?opfab_theme=dark&customParam=param'
        );
        expect(component.iframeURL).toBe(fakeSafeIFrameUrl);
    });

    it('Should be able to deep link into the iFrame', () => {
        // @ts-ignore: force this private property value for testing.
        router.url = '/menu/entry/test-deep-link';
        component.ngOnInit();

        expect(mockConfigService.queryMenuEntryURL).toHaveBeenCalledOnceWith('menu', 'entry');
        expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledOnceWith(
            'https://wikipedia.org/test-deep-link?opfab_theme=dark&customParam=param'
        );
        expect(component.iframeURL).toBe(fakeSafeIFrameUrl);
    });
});
