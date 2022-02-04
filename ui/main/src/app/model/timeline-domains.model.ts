export class TimelineModel {


    public getDomains(): Object {
        return {
            J: {
                buttonTitle: 'timeline.buttonTitle.J',
                domainId:'J',
                useOverlap: true,
                overlapDurationInMs: 15*60*1000
            }, TR: {
                buttonTitle: 'timeline.buttonTitle.TR',
                domainId : 'TR',
                followClockTick: true,
                useOverlap: false
            }, '7D': {
                buttonTitle: 'timeline.buttonTitle.7D',
                domainId:'7D',
                followClockTick: true,
                useOverlap: false
            }, 'W': {
                buttonTitle: 'timeline.buttonTitle.W',
                domainId : 'W',
                followClockTick: false,
                useOverlap: true,
                overlapDurationInMs: 2*60*60*1000
            }, M: {
                buttonTitle: 'timeline.buttonTitle.M',
                domainId : 'M',
                followClockTick: false,
                useOverlap: true,
                overlapDurationInMs: 4*60*60*1000
            }, Y: {
                buttonTitle: 'timeline.buttonTitle.Y',
                domainId: 'Y',
                followClockTick: false,
                useOverlap: true,
                overlapDurationInMs: 6*60*60*1000
            }
        };        
    }

}