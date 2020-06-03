
import {Observable, of} from "rxjs";
import {ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";

export class ThirdsServiceMock {
    computeThirdsMenu(): Observable<ThirdMenu[]>{
        return of([new ThirdMenu('t1', '1', 'tLabel1', [
            new ThirdMenuEntry('id1', 'label1', 'link1'),
            new ThirdMenuEntry('id2', 'label2', 'link2'),
        ]),
            new ThirdMenu('t2', '1', 'tLabel2', [
                new ThirdMenuEntry('id3', 'label3', 'link3'),
            ])])
    }
    loadI18nForMenuEntries(){return of(true)}
}
