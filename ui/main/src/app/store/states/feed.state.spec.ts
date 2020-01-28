
import {Severity} from "@ofModel/light-card.model";
import {getOneRandomLigthCard} from "@tests/helpers";
import {
    compareByLttd,
    compareByPublishDate,
    compareBySeverity,
    compareBySeverityLttdPublishDate,
    compareByStartDate
} from "@ofStates/feed.state";

describe('FeedState', () => {
    const card1 = getOneRandomLigthCard({startDate:5000, severity:Severity.INFORMATION, lttd:10000, publishDate:5000});
    const card2 = getOneRandomLigthCard({startDate:10000, severity: Severity.ALARM, lttd:5000, publishDate:10000});
    const card3 = getOneRandomLigthCard({startDate:10000, severity: Severity.INFORMATION, lttd:10000, publishDate:10000});
    const card4 = getOneRandomLigthCard({startDate:10000, severity: Severity.ALARM, lttd:10000, publishDate:10000});

    describe('#compareByStartDate', () => {
        it('should sort', () => {
            expect(compareByStartDate(card1,card2)).toBeLessThan(0);
        });
    });
    describe('#compareBySeverity', () => {
        it('should sort', () => {
            expect(compareBySeverity(card1,card2)).toBeGreaterThan(0);
        });
    });
    describe('#compareByLttd', () => {
        it('should sort', () => {
            expect(compareByLttd(card1,card2)).toBeGreaterThan(0);
        });
    });
    describe('#compareByPublishDate', () => {
        it('should sort', () => {
            expect(compareByPublishDate(card1,card2)).toBeGreaterThan(0);
        });
    });
    describe('#compareBySeverityLttdPublishDate', () => {
        it('should sort', () => {
            expect(compareBySeverityLttdPublishDate(card1,card3)).toBeGreaterThan(0);
            expect(compareBySeverityLttdPublishDate(card2,card4)).toBeLessThan(0);
            expect([card1,card2,card3,card4].sort(compareBySeverityLttdPublishDate)).toEqual([card2,card4,card3,card1])
        });
    });
});