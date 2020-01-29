/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {ArchivesModule} from './archives.module';

describe('FeedModule', () => {
  let archivesModule: ArchivesModule;

  beforeEach(() => {
    archivesModule = new ArchivesModule();
  });

  it('should create an instance of archives module', () => {
    expect(archivesModule).toBeTruthy();
  });
});
