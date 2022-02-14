export class TimelineModel {

    public static OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    public static getDomains(): Object {
        return {
            'J': {
                buttonTitle: 'timeline.buttonTitle.J',
                domainId: 'J'
            },
            'TR': {
                buttonTitle: 'timeline.buttonTitle.TR',
                domainId: 'TR'
            },
            '7D': {
                buttonTitle: 'timeline.buttonTitle.7D',
                domainId: '7D'
            },
            'W': {
                buttonTitle: 'timeline.buttonTitle.W',
                domainId: 'W'
            },
            'M': {
                buttonTitle: 'timeline.buttonTitle.M',
                domainId: 'M'
            },
            'Y': {
                buttonTitle: 'timeline.buttonTitle.Y',
                domainId: 'Y'
            }
        };
    }

}