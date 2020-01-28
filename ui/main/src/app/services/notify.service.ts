
import {Injectable} from '@angular/core';

@Injectable()
export class NotifyService {

    permission: string;
    constructor() {
    }

    isSupported(window): boolean {
        return 'Notification' in window;
    }
    requestPermission(): void {
        if (this.isSupported(window)) {
            Notification.requestPermission(status => {
                this.permission = status;
            });
        }
    }

    createNotification(title: string) {
        if (this.isSupported(window) && this.permission === 'granted') {
            return new Notification(title);
        }
    }
}
