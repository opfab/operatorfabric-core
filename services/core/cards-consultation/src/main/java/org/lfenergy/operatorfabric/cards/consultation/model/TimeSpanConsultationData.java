package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.AllArgsConstructor;
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
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimeSpanConsultationData implements TimeSpan{
    private Instant start;
    private Instant end;
    private TimeSpanDisplayModeEnum display = TimeSpanDisplayModeEnum.BUBBLE;
}
