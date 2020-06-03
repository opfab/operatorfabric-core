/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


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
 *
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
        if(display == null)
            display = TimeSpanDisplayModeEnum.BUBBLE;
    }
}
