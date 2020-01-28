
package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Action Model, documented at {@link Action}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionData implements Action {
    @NotNull
    private ActionEnum type;
    private String url;
    @NotNull
    private I18n label;
    @Singular  private List<? extends Input> inputs;
    private String buttonStyle;
    private String contentStyle;
    private Boolean lockAction;
    private Boolean lockCard;
    private Boolean updateState;
    private Boolean updateStateBeforeAction;
    private Boolean called;
    private Boolean needsConfirm;
    private Boolean hidden;
}
