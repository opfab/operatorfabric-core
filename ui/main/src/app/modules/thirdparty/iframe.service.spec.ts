import { TestBed } from '@angular/core/testing';

import { IframeService } from './iframe.service';
import { DomSanitizer } from "@angular/platform-browser";

describe('IframeService', () => {

  let service: IframeService;
  let sanitizer: DomSanitizer;

  beforeEach(() => {

    TestBed.configureTestingModule({
    });
    service= TestBed.get(IframeService);
    sanitizer= TestBed.get(DomSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send an event with SafeUrl if new url is selected', () => {
    const newUrl = "http://www.myUrl.com";
    const safeNewUrl = sanitizer.bypassSecurityTrustResourceUrl(newUrl);
    service.urlUpdate.subscribe(selectedUrl => expect(selectedUrl).toEqual(safeNewUrl));
    service.selectURL(newUrl);
  });

  it('should return last selected URL before subscription ', () => {
    const newUrl = "http://www.myUrl.com";
    const safeNewUrl = sanitizer.bypassSecurityTrustResourceUrl(newUrl);
    service.selectURL(newUrl);
    service.urlUpdate.subscribe(selectedUrl => expect(selectedUrl).toEqual(safeNewUrl));
  });
});
