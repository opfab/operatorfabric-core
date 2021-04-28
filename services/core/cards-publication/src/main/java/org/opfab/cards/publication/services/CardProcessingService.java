/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.opfab.aop.process.AopTraceType;
import org.opfab.aop.process.mongo.models.UserActionTraceData;
import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.cards.publication.model.ArchivedCardPublicationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.PublisherTypeEnum;
import org.opfab.cards.publication.services.clients.impl.ExternalAppClientImpl;
import org.opfab.cards.publication.services.processors.UserCardProcessor;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * <p>
 * Responsible of processing card : check format , save in repository and send
 * notification
 */
@Service
@Slf4j
public class CardProcessingService {


    @Autowired
    private RecipientProcessor recipientProcessor;
    @Autowired
    private LocalValidatorFactoryBean localValidatorFactoryBean;
    @Autowired
    private CardNotificationService cardNotificationService;
    @Autowired
    private CardRepositoryService cardRepositoryService;
    @Autowired
    private UserCardProcessor userCardProcessor;
    @Autowired
    private ExternalAppClientImpl externalAppClient;
    @Autowired
    private TraceRepository traceRepository;


    public void processCard(CardPublicationData card) {
        card.setPublisherType(PublisherTypeEnum.EXTERNAL);
        processOneCard(card, Optional.empty());
    }

    public void processUserCard(CardPublicationData card, CurrentUserWithPerimeters user) {
        card.setPublisherType(PublisherTypeEnum.ENTITY);
        processOneCard(card, Optional.of(user));
    }

    private void processOneCard(CardPublicationData card, Optional<CurrentUserWithPerimeters> user) {
        validate(card);
        recipientProcessor.processAll(card);
        card.prepare(Instant.ofEpochMilli(Math.round(Instant.now().toEpochMilli() / 1000d) * 1000));
        if (user.isPresent()) {
            userCardProcessor.processPublisher(card, user.get());
            externalAppClient.sendCardToExternalApplication(card);
        }
        deleteChildCardsProcess(card);
        cardRepositoryService.saveCard(card);
        cardRepositoryService.saveCardToArchive(new ArchivedCardPublicationData(card));
        cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.ADD);
        log.debug("Card persisted (process = {} , processInstanceId= {} , state = {} ", card.getProcess(),card.getProcessInstanceId(),card.getState());
    }

    private Void deleteChildCardsProcess(CardPublicationData card) {
        if (! card.getKeepChildCards()) {
            String idCard = card.getProcess() + "." + card.getProcessInstanceId();
            Optional<List<CardPublicationData>> childCard = cardRepositoryService.findChildCard(cardRepositoryService.findCardById(idCard));
            if (childCard.isPresent()) {
                deleteCards(childCard.get());
            }
        }
        return null;
    }


    /**
     * Apply bean validation to card
     *
     * @param c
     * @throws ConstraintViolationException if there is an error during validation
     *                                      based on object annotation configuration
     */
    void validate(CardPublicationData c) throws ConstraintViolationException {

        // constraint check : parentCardId must exist
        if (!checkIsParentCardIdExisting(c))
            throw new ConstraintViolationException("The parentCardId " + c.getParentCardId() + " is not the id of any card", null);

        // constraint check : initialParentCardUid must exist
        if (!checkIsInitialParentCardUidExisting(c))
            throw new ConstraintViolationException("The initialParentCardUid " + c.getInitialParentCardUid() + " is not the uid of any card", null);

        Set<ConstraintViolation<CardPublicationData>> results = localValidatorFactoryBean.validate(c);
        if (!results.isEmpty())
            throw new ConstraintViolationException(results);

        // constraint check : endDate must be after startDate
        if (!checkIsEndDateAfterStartDate(c))
            throw new ConstraintViolationException("constraint violation : endDate must be after startDate", null);

        // constraint check : timeSpans list : each end date must be after his start date
        if (!checkIsAllTimeSpanEndDateAfterStartDate(c))
            throw new ConstraintViolationException("constraint violation : TimeSpan.end must be after TimeSpan.start", null);

        // constraint check : process and state must not contain "." (because we use it as a separator)
        if (!checkIsDotCharacterNotInProcessAndState(c))
            throw new ConstraintViolationException("constraint violation : character '.' is forbidden in process and state", null);
    }

    boolean checkIsParentCardIdExisting(CardPublicationData c){
        String parentCardId = c.getParentCardId();

        return ! ((Optional.ofNullable(parentCardId).isPresent()) && (cardRepositoryService.findCardById(parentCardId) == null));
    }

    //The check of existence of uid is done in archivedCards collection
    boolean checkIsInitialParentCardUidExisting(CardPublicationData c){
        String initialParentCardUid = c.getInitialParentCardUid();

        return ! ((Optional.ofNullable(initialParentCardUid).isPresent()) &&
                  (! cardRepositoryService.findArchivedCardByUid(initialParentCardUid).isPresent()));
    }

    boolean checkIsEndDateAfterStartDate(CardPublicationData c) {
        Instant endDateInstant = c.getEndDate();
        Instant startDateInstant = c.getStartDate();
        return ! ((endDateInstant != null) && (startDateInstant != null) && (endDateInstant.compareTo(startDateInstant) < 0));
    }

    boolean checkIsDotCharacterNotInProcessAndState(CardPublicationData c) {
        return ! ((c.getProcess() != null && c.getProcess().contains(Character.toString('.'))) ||
                  (c.getState() != null && c.getState().contains(Character.toString('.'))));
    }

    boolean checkIsAllTimeSpanEndDateAfterStartDate(CardPublicationData c) {
        if (c.getTimeSpans() != null) {
            for (int i = 0; i < c.getTimeSpans().size(); i++) {
                if (c.getTimeSpans().get(i) != null) {
                    Instant endInstant = c.getTimeSpans().get(i).getEnd();
                    Instant startInstant = c.getTimeSpans().get(i).getStart();
                    if ((endInstant != null) && (startInstant != null) && (endInstant.compareTo(startInstant) < 0))
                        return false;
                }
            }
        }
        return true;
    }


    public void deleteCards(Instant endDateBefore) {
        cardRepositoryService.deleteCardsByEndDateBefore(endDateBefore);
    }

    public void deleteCards(List<CardPublicationData> cardPublicationData) {
        cardPublicationData.forEach(x->deleteCard(x.getId()));
    }

    public Optional<CardPublicationData> deleteCard(String id) {
        CardPublicationData cardToDelete = cardRepositoryService.findCardById(id);
        return deleteCard0(cardToDelete);
    }

    public Optional<CardPublicationData> deleteCard(CardPublicationData card) {
        if (StringUtils.isEmpty(card.getId())) {
            card.prepare(card.getPublishDate());
        }
        return deleteCard0(card);
    }

    public Optional<CardPublicationData> deleteUserCard(String id, CurrentUserWithPerimeters user) {
        CardPublicationData cardToDelete = cardRepositoryService.findCardById(id);
        if (cardToDelete == null)
            return Optional.empty();
        if (isUserAllowedToDeleteThisCard(cardToDelete, user)){
            return deleteCard0(cardToDelete);
        }
        else {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .message("User not allowed to delete this card")
                    .build());
        }
    }

    public Optional<CardPublicationData> deleteCard0(CardPublicationData cardToDelete) {
        Optional<CardPublicationData> deletedCard = Optional.ofNullable(cardToDelete);
        if (null != cardToDelete) {
            cardNotificationService.notifyOneCard(cardToDelete, CardOperationTypeEnum.DELETE);
            cardRepositoryService.deleteCard(cardToDelete);
            Optional<List<CardPublicationData>> childCard=cardRepositoryService.findChildCard(cardToDelete);
            if(childCard.isPresent()){
                childCard.get().forEach(x->deleteCard(x.getId()));
            }
        }
        return deletedCard;
    }

    /* 1st check : card.publisherType == ENTITY
       2nd check : the card has been sent by an entity of the user connected
       3rd check : the user has the Write access to the process/state of the card */
    public boolean isUserAllowedToDeleteThisCard(CardPublicationData card, CurrentUserWithPerimeters user) {
        List<ComputedPerimeter> perimetersOfTheUserList = user.getComputedPerimeters();
        List<String>            entitiesOfTheUserList   = user.getUserData().getEntities();

        if ((card.getPublisherType() == PublisherTypeEnum.ENTITY) &&
            (entitiesOfTheUserList.contains(card.getPublisher()))){

            for (ComputedPerimeter perimeter : perimetersOfTheUserList) {
                if ((perimeter.getProcess().equals(card.getProcess())) &&
                    (perimeter.getState().equals(card.getState())) &&
                    ((perimeter.getRights() == RightsEnum.WRITE) || (perimeter.getRights() == RightsEnum.RECEIVEANDWRITE)))
                    return true;
            }
        }
        return false;
    }
    
	public UserBasedOperationResult processUserAcknowledgement(String cardUid, User user) {
		return cardRepositoryService.addUserAck(user, cardUid);
	}


	public UserBasedOperationResult processUserRead(String cardUid, String userName) {
		return cardRepositoryService.addUserRead(userName, cardUid);
    }

    public UserBasedOperationResult deleteUserRead(String cardUid, String userName) {
		return cardRepositoryService.deleteUserRead(userName,cardUid);
	}

	public UserBasedOperationResult deleteUserAcknowledgement(String cardUid, String userName) {
		return cardRepositoryService.deleteUserAck(userName, cardUid);
	}

    public UserActionTraceData findTraceByCardUid(String name, String cardUid) {
        return traceRepository.findByCardUidAndActionAndUserName(cardUid, AopTraceType.ACK.getAction(),name);
    }

    
}
