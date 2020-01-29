/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import reactor.core.publisher.Flux;

import java.time.Instant;

public interface CardOperationRepository {
    /**
     * Finds Card published earlier than <code>latestPublication</code> and either :
     * <ul>
     * <li>starting between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>ending between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and ending after <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and never ending</li>
     * </ul>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of search range
     * @param rangeEnd          end of search range
     * @param login             only cards received by this login (OR groups)
     * @param groups            only cards received by at least one of these groups (OR login)
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
    Flux<String> findUrgentJSON(Instant latestPublication, Instant rangeStart, Instant rangeEnd, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and starting after <code>rangeStart</code>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of future
     * @param login             only cards received by this login (OR groups)
     * @param groups            only cards received by at least one of these groups (OR login)
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
    Flux<String> findFutureOnlyJSON(Instant latestPublication, Instant rangeStart, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and ending before <code>rangeEnd</code>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeEnd          end of past
     * @param login             only cards received by this login (OR groups)
     * @param groups            only cards received by at least one of these groups (OR login)
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
    Flux<String> findPastOnlyJSON(Instant latestPublication, Instant rangeEnd, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and either :
     * <ul>
     * <li>starting between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>ending between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and ending after <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and never ending</li>
     * </ul>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of search range
     * @param rangeEnd          end of search range
     * @param login             only cards received by this login (OR groups)
     * @param groups            only cards received by at least one of these groups (OR login)
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
    Flux<CardOperation> findUrgent(Instant latestPublication, Instant rangeStart, Instant rangeEnd, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and starting after <code>rangeStart</code>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of future
     * @param login             only cards received by this login (OR groups)
     * @param groups            only cards received by at least one of these groups (OR login)
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
    Flux<CardOperation> findFutureOnly(Instant latestPublication, Instant rangeStart, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and ending before <code>rangeEnd</code>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeEnd          end of past
     * @param login             only cards received by this login (OR groups)
     * @param groups            only cards received by at least one of these groups (OR login)
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
    Flux<CardOperation> findPastOnly(Instant latestPublication, Instant rangeEnd, String login, String... groups);
}
