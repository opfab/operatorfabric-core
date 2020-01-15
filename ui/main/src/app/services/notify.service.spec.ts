import { NotifyService } from './notify.service';
import { TestBed } from '@angular/core/testing';

fdescribe('NotifyService', () => {

    let mockWindow: any;
    let mockNotification: any;
    let notifyService: any;
    beforeEach(() => {

        mockNotification = function (title, options) {
            this.title = title;
            this.options = options;
            this.requestPermission = jasmine.createSpy();
        };
        TestBed.configureTestingModule({
            providers: [NotifyService]
        });
        mockWindow = {
            Notification: new mockNotification('test', {}),
            document: {hidden: true}
        };
        notifyService = TestBed.get(NotifyService);
    });
    it('should check if notification are supported', () => {
        expect(notifyService.isSupported(mockWindow)).toBeTruthy();
    });

});
