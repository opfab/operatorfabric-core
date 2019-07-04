package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lfenergy.operatorfabric.cards.model.TimeSpanDisplayModeEnum;

import java.time.Instant;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>TimeSpan Model, documented at {@link TimeSpan}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@Builder
public class TimeSpanPublicationData implements TimeSpan{

    private Instant start;
    private Instant end;
    private TimeSpanDisplayModeEnum display;

    public TimeSpanPublicationData(Instant start, Instant end, TimeSpanDisplayModeEnum display){
        this.start = start;
        this.end = end;
        this.display = display;
        init();
    }

    void init(){
        if(display == null && end != null)
            display = TimeSpanDisplayModeEnum.BUBBLE;
        else if(display == null)
            display = TimeSpanDisplayModeEnum.BUBBLE;
    }
}
