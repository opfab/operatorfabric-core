/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.publication.model.*;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.ProcessRepository;
import org.opfab.businessconfig.model.Process;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
public class CardValidationService {

    private CardRepository cardRepository;
    private ProcessRepository processRepository;

    public static final String UNEXISTING_PROCESS_STATE = "Impossible to publish card because process and/or state does not exist (process=%1$s, state=%2$s, processVersion=%3$s, processInstanceId=%4$s)";
    protected static final char[] FORBIDDEN_CHARS = new char[] {'#','?','/'};

    public CardValidationService(
        CardRepository cardRepository,
        ProcessRepository processRepository
    ) {
        this.cardRepository = cardRepository;
        this.processRepository = processRepository;
    }


    public void setProcessRepository(ProcessRepository processRepository) {
        this.processRepository = processRepository;
    }
    /**
     * Apply bean validation to card
     *
     * @param c
     * @throws ConstraintViolationException if there is an error during validation
     *                                      based on object annotation configuration
     */
    void validate(Card c) throws ConstraintViolationException {
        String parentCardId = c.getParentCardId();

        if (Optional.ofNullable(parentCardId).isPresent()) {
            Card parentCard = cardRepository.findCardById(parentCardId, false);

            if (parentCard == null) {
                throw new ConstraintViolationException(
                        "The parentCardId " + c.getParentCardId() + " is not the id of any card", null);
            }
            checkIsCardAChildCard(parentCard);
        }

        if (!checkIsInitialParentCardUidExisting(c))
            throw new ConstraintViolationException(
                    "The initialParentCardUid " + c.getInitialParentCardUid() + " is not the uid of any card", null);

        checkNotNull(c.getPublisher(), "publisher");
        checkNotNull(c.getProcess(), "process");
        checkNotNull(c.getProcessVersion(), "processVersion");
        checkNotNull(c.getState(), "state");
        checkNotNull(c.getProcessInstanceId(), "processInstanceId");
        checkNotNull(c.getSeverity(), "severity");
        checkNotNull(c.getTitle(), "title");
        checkNotNull(c.getSummary(), "summary");
        checkNotNull(c.getStartDate(), "startDate");

        if (!checkIsEndDateAfterStartDate(c))
            throw new ConstraintViolationException("constraint violation : endDate must be after startDate", null);

        if (!checkIsExpirationDateAfterStartDate(c))
            throw new ConstraintViolationException("constraint violation : expirationDate must be after startDate",
                    null);

        if (!checkIsAllTimeSpanEndDateAfterStartDate(c))
            throw new ConstraintViolationException("constraint violation : TimeSpan.end must be after TimeSpan.start",
                    null);

        if (!checkRRuleDurationInMinutesIsNotNegative(c))
            throw new ConstraintViolationException(
                    "constraint violation : RRule.durationInMinutes: must be greater than or equal to 0", null);

        // constraint check : process and state must not contain "." (because we use it
        // as a separator)
        if (!checkIsDotCharacterNotInProcessAndState(c))
            throw new ConstraintViolationException(
                    "constraint violation : character '.' is forbidden in process and state", null);

        // constraint check : process and processInstanceId must not contain ('#','?','/') 
        if (!checkForbiddenChars(c))
            throw new ConstraintViolationException(
                    "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId", null);
    }

    void checkIsCardAChildCard(Card card) {
        if ((card != null) && (card.getParentCardId() != null) && (!card.getParentCardId().isEmpty())) {
            throw new ConstraintViolationException(
                    "The parentCardId " + card.getParentCardId() + " is a child card", null);
        }
    }

    void validateCardForPatch(Card cardForPatch, Card initialCard) throws ConstraintViolationException {
        if ((cardForPatch.getProcess() != null) && !cardForPatch.getProcess().equals(initialCard.getProcess()))
            throw new ConstraintViolationException("The current process field " + initialCard.getProcess()
                    + " can not be patched with new value " + cardForPatch.getProcess(), null);

        if ((cardForPatch.getProcessInstanceId() != null) &&
            !cardForPatch.getProcessInstanceId().equals(initialCard.getProcessInstanceId()))
            throw new ConstraintViolationException("The current processInstanceId field " + initialCard.getProcessInstanceId()
                    + " can not be patched with new value " + cardForPatch.getProcessInstanceId(), null);
    }

    private void checkNotNull(Object field, String fieldName) throws ConstraintViolationException {
        if (field == null) {
            throw new ConstraintViolationException(String.format("Impossible to publish card because there is no %s", fieldName), null);
        }
    }

    // The check of existence of uid is done in archivedCards collection
    boolean checkIsInitialParentCardUidExisting(Card c) {
        String initialParentCardUid = c.getInitialParentCardUid();

        return !((Optional.ofNullable(initialParentCardUid).isPresent()) &&
                (!cardRepository.findArchivedCardByUid(initialParentCardUid).isPresent()));
    }

    boolean checkForbiddenChars(Card card) {
        for (char ch : FORBIDDEN_CHARS)
        {
            if (card.getProcess().contains(Character.toString(ch)) || card.getProcessInstanceId().contains(Character.toString(ch)))
                return false;
        }
        return true;
    }

    boolean checkIsDotCharacterNotInProcessAndState(Card c) {
        return !((c.getProcess().contains(Character.toString('.'))) ||
                (c.getState() != null && c.getState().contains(Character.toString('.'))));
    }

    public boolean doesProcessStateExistInBundles(String processId, String processVersion, String stateId) {
        if (processRepository != null) {
            try {
                Process process = processRepository.getProcess(processId, processVersion);
                if ((process != null) && (process.getStates() != null) && (process.getStates().containsKey(stateId)))
                    return true;
            } catch (InterruptedException ex) {
                log.error("Error getting process information for process={} and processVersion={} (Interrupted Exception)", processId,
                        processVersion, ex);
                Thread.currentThread().interrupt();
            } catch (IOException ex) {
                log.error("Error getting process information for process={} and processVersion={}", processId,
                        processVersion, ex);
            }
        }
        return false;
    }

    public void checkProcessStateExistsInBundles(Card card) {
        if (!doesProcessStateExistInBundles(card.getProcess(), card.getProcessVersion(), card.getState())) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(String.format(UNEXISTING_PROCESS_STATE, card.getProcess(), card.getState(),
                                    card.getProcessVersion(), card.getProcessInstanceId()))
                            .build());
        }
    }

    boolean checkIsEndDateAfterStartDate(Card c) {
        Instant endDateInstant = c.getEndDate();
        Instant startDateInstant = c.getStartDate();
        return !((endDateInstant != null) && (startDateInstant != null)
                && (endDateInstant.compareTo(startDateInstant) < 0));
    }

    boolean checkIsExpirationDateAfterStartDate(Card c) {
        Instant expirationDateInstant = c.getExpirationDate();
        Instant startDateInstant = c.getStartDate();
        return !((expirationDateInstant != null) && (startDateInstant != null)
                && (expirationDateInstant.compareTo(startDateInstant) < 0));
    }

    boolean checkIsAllTimeSpanEndDateAfterStartDate(Card c) {
        if (c.getTimeSpans() != null) {
            for (int i = 0; i < c.getTimeSpans().size(); i++) {
                if (c.getTimeSpans().get(i) != null) {
                    Instant endInstant = c.getTimeSpans().get(i).end();
                    Instant startInstant = c.getTimeSpans().get(i).start();
                    if ((endInstant != null) && (endInstant.compareTo(startInstant) < 0))
                        return false;
                }
            }
        }
        return true;
    }

    boolean checkRRuleDurationInMinutesIsNotNegative(Card c) {
        if (c.getRRule() != null) {
            Integer durationInMinutes = c.getRRule().durationInMinutes();
            if (durationInMinutes != null && durationInMinutes<0)
                return false;
        }
        return true;
    }
}
