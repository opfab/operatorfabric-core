
package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.mongodb.core.index.Indexed;

import javax.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Light Card Model, documented at {@link LightCard}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class LightCardPublicationData implements LightCard {

    @NotNull
    private String uid ;
    @NotNull
    private String id ;
    private String publisher;
    private String publisherVersion;
    private String process;
    @NotNull
    private String processId;
    private String state;
    private Instant lttd;
    private Instant publishDate;
    @NotNull
    @Indexed
    private Instant startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    //@Singular not used because lead to a NPE when built from Card
    private List<String> tags;
    private I18n title;
    private I18n summary;
    private String mainRecipient;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular("timeSpan")
    private Set<TimeSpanPublicationData> timeSpansSet;

    /**
     * return timespans, may be null
     * @return
     */
    @Override
    public List<TimeSpan> getTimeSpans() {
        if(this.timeSpansSet!=null)
            return new ArrayList<>(this.timeSpansSet);
        return null;
    }

    @Override
    public void setTimeSpans(List<? extends TimeSpan> timeSpans) {
        if(timeSpans != null)
            this.timeSpansSet = new HashSet(timeSpans);

    }

}
