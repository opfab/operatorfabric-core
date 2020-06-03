
import { NgModule } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faClock,
    faExternalLinkAlt,
    faSignOutAlt,
    faToggleOff,
    faToggleOn,
    faUser
} from '@fortawesome/free-solid-svg-icons';

/* This module is a wrapper module for the FontAwesome module. It became necessary after migrating to the FaIconLibrary
*  to be able to define icons globally both for the app and for tests.
*  See https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/guide/testing.md for more details.
*  See https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/upgrading/0.4.0-0.5.0.md about the migration.*/


@NgModule({
    imports: [FontAwesomeModule],
    exports: [FontAwesomeModule],
})
export class FontAwesomeIconsModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(faExternalLinkAlt);
        library.addIcons(faSignOutAlt);
        library.addIcons(faToggleOn);
        library.addIcons(faToggleOff);
        library.addIcons(faClock);

    }
}
