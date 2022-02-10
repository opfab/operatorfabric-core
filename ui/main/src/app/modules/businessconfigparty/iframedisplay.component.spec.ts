import {IframeDisplayComponent} from "./iframedisplay.component";
import {TestBed} from "@angular/core/testing";
import {ActivatedRoute, convertToParamMap, Router} from "@angular/router";
import {of} from "rxjs";
import {ConfigService} from "@ofServices/config.service";
import {provideMockStore} from "@ngrx/store/testing";
import {
  selectGlobalStyleStateStyle
} from "@ofSelectors/global-style.selectors";
import {GlobalStyleService} from "@ofServices/global-style.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";

export class ActivatedRouteMock {
  public paramMap = of(convertToParamMap({
        menu_id: 'menu',
        menu_entry_id: 'entry'
      }
  ))
  public queryParamMap = of();
}

fdescribe('IFrameDisplayComponent', () => {
  let component: IframeDisplayComponent;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockGlobalStyleService: jasmine.SpyObj<GlobalStyleService>;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;
  let router: Router;
  const fakeSafeIFrameUrl: SafeUrl = jasmine.createSpy();
  const mockDocument = { location: { href: "https://opfab-ui/menu/entry?customParam=param" } }
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { url: '/menu/entry' } },
        { provide: DOCUMENT, useValue: mockDocument },
          IframeDisplayComponent,
        { provide: ActivatedRoute, useValue: new ActivatedRouteMock() },
        { provide: ConfigService, useValue: jasmine.createSpyObj('ConfigService', ['queryMenuEntryURL']) },
        { provide: GlobalStyleService, useValue: jasmine.createSpyObj('GlobalStyleService', ['getStyle']) },
        provideMockStore({ selectors: [ {
            selector: selectGlobalStyleStateStyle,
            value: () => 'dark'
          }]}),
        { provide: DomSanitizer, useValue: jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl'])}
      ]
    })
    router = TestBed.inject(Router);
    mockConfigService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    mockGlobalStyleService = TestBed.inject(GlobalStyleService) as jasmine.SpyObj<GlobalStyleService>;
    mockDomSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

    mockConfigService.queryMenuEntryURL.and.returnValue(of('https://wikipedia.org'));
    mockGlobalStyleService.getStyle.and.returnValue('dark');
    mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(fakeSafeIFrameUrl);

    component = TestBed.inject(IframeDisplayComponent);
  });


  it("Should create the iFrameUrl onInit with the opfab theme", () => {
    component.ngOnInit();

    expect(mockConfigService.queryMenuEntryURL).toHaveBeenCalledOnceWith('menu', 'entry');
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledOnceWith("https://wikipedia.org?opfab_theme=dark&customParam=param");
    expect(component.iframeURL).toBe(fakeSafeIFrameUrl);
  })

  it("Should be able to deep link into the iFrame", () => {
    // @ts-ignore: force this private property value for testing.
    router.url = '/menu/entry/test-deep-link'
    component.ngOnInit();

    expect(mockConfigService.queryMenuEntryURL).toHaveBeenCalledOnceWith('menu', 'entry');
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledOnceWith("https://wikipedia.org/test-deep-link?opfab_theme=dark&customParam=param");
    expect(component.iframeURL).toBe(fakeSafeIFrameUrl);
  })
})
