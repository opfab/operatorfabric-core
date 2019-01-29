/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import reactor.core.publisher.Flux;

public interface CardOperationRepository {
    /**
     * Finds Card published earlier than <code>latestPublication</code> and either :
     * <ul>
     * <li>starting between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>ending between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and ending after <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and never ending</li>
     * </ul>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of search range
     * @param rangeEnd          end of search range
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
//    @Query("{'publishDate': { $lte: ?0 }, " +
//            "$or: [{'startDate': { $gte: ?1, $lte: ?2}}, " +
//            "{'endDate': { $gte: ?1, $lte: ?2}}, " +
//            "{ 'startDate': { $lt: ?1 }, $or: [{'endDate': null}, {'endDate': { $gt: ?2}}]}]}")
    Flux<String> findUrgentJSON(long latestPublication, long rangeStart, long rangeEnd, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and starting after <code>rangeStart</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of future
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
//    @Query("{'publishDate': { $lte: ?0 }, " +
//            "'startDate': { $gt: ?1}}")
    Flux<String> findFutureOnlyJSON(long latestPublication, long rangeStart, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and ending before <code>rangeEnd</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeEnd          end of past
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
//    @Query("{'publishDate': { $lte: ?0 }, " +
//            "'endDate': { $lt: ?1}}")
    Flux<String> findPastOnlyJSON(long latestPublication, long rangeEnd, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and either :
     * <ul>
     * <li>starting between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>ending between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and ending after <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and never ending</li>
     * </ul>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of search range
     * @param rangeEnd          end of search range
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
//    @Query("{'publishDate': { $lte: ?0 }, " +
//            "$or: [{'startDate': { $gte: ?1, $lte: ?2}}, " +
//            "{'endDate': { $gte: ?1, $lte: ?2}}, " +
//            "{ 'startDate': { $lt: ?1 }, $or: [{'endDate': null}, {'endDate': { $gt: ?2}}]}]}")
    Flux<CardOperation> findUrgent(long latestPublication, long rangeStart, long rangeEnd, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and starting after <code>rangeStart</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeStart        start of future
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
//    @Query("{'publishDate': { $lte: ?0 }, " +
//            "'startDate': { $gt: ?1}}")
    Flux<CardOperation> findFutureOnly(long latestPublication, long rangeStart, String login, String... groups);

    /**
     * Finds Card published earlier than <code>latestPublication</code> and ending before <code>rangeEnd</code>
     *
     * @param latestPublication only cards published earlier than this will be fetched
     * @param rangeEnd          end of past
     * @return projection to {@link CardOperationConsultationData} as a JSON String
     */
//    @Query("{'publishDate': { $lte: ?0 }, " +
//            "'endDate': { $lt: ?1}}")
    Flux<CardOperation> findPastOnly(long latestPublication, long rangeEnd, String login, String... groups);
}
