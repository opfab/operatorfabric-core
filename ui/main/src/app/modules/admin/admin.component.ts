import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from '@ofStore/index';
import { buildSettingsOrConfigSelector } from '@ofStore/selectors/settings.x.config.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'of-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  activeTab = 'users';
  usersLabel: string;
  entitiesLabel: string;
  groupsLabel: string;

  constructor( protected store: Store<AppState>, protected translate: TranslateService) {
     this.getLocale().subscribe(locale => {
      console.log(locale);
      this.translate.use(locale);
      this.translate.get(['admin.tabs.users', 'admin.tabs.entities', 'admin.tabs.groups'])
        .subscribe(translations => {
        this.usersLabel = translations['admin.tabs.users'];
        this.entitiesLabel = translations['admin.tabs.entities'];
        this.groupsLabel = translations['admin.tabs.groups'];
        });
     });
  }

  ngOnInit() {

  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

   private getLocale(): Observable<string> {
    return this.store.select(buildSettingsOrConfigSelector('locale'));
  }

}
