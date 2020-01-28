
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
