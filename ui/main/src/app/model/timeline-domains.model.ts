export class TimelineModel {

    public static OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    public static getDomains(): Object {
        return {
            'J': {
                buttonTitle: 'timeline.buttonTitle.J',
                domainId: 'J',
                followClockTick: true,
                useOverlap: true
            },
            'TR': {
                buttonTitle: 'timeline.buttonTitle.TR',
                domainId: 'TR',
                followClockTick: true,
                useOverlap: false
            },
            '7D': {
                buttonTitle: 'timeline.buttonTitle.7D',
                domainId: '7D',
                followClockTick: true,
                useOverlap: false
            },
            'W': {
                buttonTitle: 'timeline.buttonTitle.W',
                domainId: 'W',
                followClockTick: true,
                useOverlap: true
            },
            'M': {
                buttonTitle: 'timeline.buttonTitle.M',
                domainId: 'M',
                followClockTick: true,
                useOverlap: true
            },
            'Y': {
                buttonTitle: 'timeline.buttonTitle.Y',
                domainId: 'Y',
                followClockTick: true,
                useOverlap: true
            }
        };
    }

}