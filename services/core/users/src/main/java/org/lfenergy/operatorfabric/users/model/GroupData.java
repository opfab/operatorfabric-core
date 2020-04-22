/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Group Model, documented at {@link Group}
 *
 * {@inheritDoc}
 *
 */
@Document(collection = "group")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupData implements Group {
    @Id
    private String id;
    private String name;
    private String description;
}
