package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lfenergy.operatorfabric.cards.model.TimeSpanDisplayModeEnum;

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

    private Long start;
    private Long end;
    private TimeSpanDisplayModeEnum display;

    public TimeSpanPublicationData(Long start, Long end, TimeSpanDisplayModeEnum display){
        if(display == null && end != null)
            display = TimeSpanDisplayModeEnum.LINE;
        else if(display == null)
            display = TimeSpanDisplayModeEnum.BUBBLE;
        this.start = start;
        this.end = end;
        this.display = display;
    }
}
