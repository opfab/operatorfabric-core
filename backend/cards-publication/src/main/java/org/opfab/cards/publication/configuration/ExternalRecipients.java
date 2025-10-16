/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.configuration;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.ArrayList;

@ConfigurationProperties("operatorfabric.cards-publication.external-recipients")
@Component
public class ExternalRecipients {
    private List<ExternalRecipient> recipients = new ArrayList<>();

    public List<ExternalRecipient> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<ExternalRecipient> recipients) {
        this.recipients = recipients;
    }

    public static record ExternalRecipient(String id, String url, boolean propagateUserToken) {
    }

}
