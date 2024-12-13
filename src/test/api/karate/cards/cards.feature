Feature: Cards

Background:
  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
  * def authToken = signIn.authToken
  * def signInForOperator5 = callonce read('../common/getToken.feature') { username: 'operator5_fr'}
  * def authTokenForOperator5 = signInForOperator5.authToken
  * def signInUserWithNoGroupNoEntity = callonce read('../common/getToken.feature') { username: 'userwithnogroupnoentity'}
  * def authTokenUserWithNoGroupNoEntity = signInUserWithNoGroupNoEntity.authToken
  * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authTokenAdmin = signInAdmin.authToken
  * def perimeter =
    """
    {
      "id": "perimeter",
      "process": "api_test",
      "stateRights": [
        {
          "state": "messageState",
          "right": "ReceiveAndWrite"
        }
      ]
    }
    """

  * def perimeterArray =
    """
    [ "perimeter" ]
    """


Scenario: Post card
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title"},
      "data": {"message": "a message"}
    }
    """

  # Create new perimeter
  * callonce read('../common/createPerimeter.feature') { perimeter: '#(perimeter)', token: '#(authTokenAdmin)' }

  # Attach perimeter to group
  Given url opfabUrl + 'users/groups/Maintainer/perimeters'
  And header Authorization = 'Bearer ' + authTokenAdmin
  And request perimeterArray
  When method patch
  Then status 200

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 201
  And match response == {"id": '#notnull', uid: '#notnull'}

Scenario: Post a new version of the card
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title"},
      "data": {"message": "new message"}
    }
    """

    # Push card 

  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 201
  And def cardUid = response.uid
  And def cardId = response.id
  # Get card with user operator1_fr
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And match response.card.data.message == 'new message'
  And match response.card.publisherType == "EXTERNAL"
  And match response.card.id == cardId
  And match response.card.uid == cardUid
  And match response.card.titleTranslated == 'card Title'
  And match response.card.summaryTranslated == 'card summary'
  And match response.card.severity == 'INFORMATION'

  # Get card without authentication
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  When method get
  Then status 401

Scenario: Delete the card
  # Get card with user operator1_fr
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And def cardUid = response.card.uid

  # Delete card without authentication

  Given url opfabPublishCardUrl + 'cards/api_test.process1'
  When method delete
  Then status 401

  # Delete card
  Given url opfabPublishCardUrl + 'cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method delete
  Then status 200

  # Delete card
  Given url opfabPublishCardUrl + 'cards/not_existing_card_id'
  And header Authorization = 'Bearer ' + authToken
  When method delete
  Then status 404

Scenario: Post card with attribute externalRecipients
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "externalRecipients": ["api_test_externalRecipient1"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "endDate": 1553186999999,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 201

  # Get card with user operator1_fr and new attribute externalRecipients
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And match response.card.externalRecipients[0] == "api_test_externalRecipient1"
  And def cardUid = response.card.uid

  # Make sure externalRecipient received the card 
  # with correct startDate and endDate
  * configure retry = { count: 3, interval: 3000 }
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1_created'
  And header Authorization = 'Bearer ' + authTokenForOperator5
  And retry until responseStatus == 200 
  When method get
  And match response.card.startDate == 1553186770681
  And match response.card.endDate == 1553186999999

  # Delete the card
  Given url opfabPublishCardUrl + 'cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method delete
  Then status 200

  # Make sure externalRecipients are notified of card suppression
  * configure retry = { count: 3, interval: 3000 }
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1_deleted'
  And header Authorization = 'Bearer ' + authTokenForOperator5
  And retry until responseStatus == 200 
  When method get
  Then match response.card.data.message == "Card with id=api_test.process1 received by externalApp. Card sent for karate tests, addressed to : operator5_fr   "
  
  # Delete the confirmation card to clean the test environment
  Given url opfabPublishCardUrl + 'cards/api_test.process1_deleted'
  And header Authorization = 'Bearer ' + authToken
  When method delete
  Then status 200

Scenario: Post card with no recipient but entityRecipients
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process2",
      "state": "messageState",
      "entityRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title"},
      "data": {"message": "a message"}
    }
    """

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 201

Scenario: Post card with initialParentCardUid not correct
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"},
      "initialParentCardUid": "1"
    }
    """

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 400
  And match response.message contains "Constraint violation in the request"
  And match response.errors[0] contains "The initialParentCardUid 1 is not the uid of any card"

Scenario: Post card with parentCardId not correct
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"},
      "parentCardId": "1"
    }
    """

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 400
  And match response.message contains "Constraint violation in the request"
  And match response.errors[0] contains "The parentCardId 1 is not the id of any card"

Scenario: Post card with correct parentCardId but initialParentCardUid not correct
  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 201

  # Get parent card id
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And def cardId = response.card.id

  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"},
      "initialParentCardUid": "1"
    }
    """
  * card.parentCardId = cardId

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 400
  And match response.message contains "Constraint violation in the request"
  And match response.errors[0] contains "The initialParentCardUid 1 is not the uid of any card"

Scenario: Post card with correct parentCardId and initialParentCardUid
  # Get parent card id
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And def cardId = response.card.id
  And def cardUid = response.card.uid

  * def card =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """
  * card.parentCardId = cardId
  * card.initialParentCardUid = cardUid

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request card
  When method post
  Then status 201


  # Try to push child card for a child card and check if constraint violation is raised
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And def cardId = response.card.id
  And def cardUid = response.card.uid

  * def childCardOfChildCard =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "childCardOfChildCard",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """
  * childCardOfChildCard.parentCardId = cardId
  * childCardOfChildCard.initialParentCardUid = cardUid

  # Push card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request childCardOfChildCard
  When method post
  Then status 400
  And match response.message contains "Constraint violation in the request"
  And match response.errors[0] contains "The parentCardId " + cardId + " is a child card"


Scenario: Push card and its two child cards, then get the parent card
  * def parentCard =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """

  # Push parent card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request parentCard
  When method post
  Then status 201

  # Get parent card id
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And def parentCardId = response.card.id
  And def parentCardUid = response.card.uid

  # Push two child cards
  * def childCard1 =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "processChild1",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """
  * childCard1.parentCardId = parentCardId
  * childCard1.initialParentCardUid = parentCardUid

  * def childCard2 =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "processChild2",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """
  * childCard2.parentCardId = parentCardId
  * childCard2.initialParentCardUid = parentCardUid

  # Push the two child cards
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request childCard1
  When method post
  Then status 201

  # Push the two child cards
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request childCard2
  When method post
  Then status 201

  # Get the parent card with its two child cards

  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And assert response.childCards.length == 2

Scenario: Push card with null publisherType
  * def parentCard2 =
    """
    {
      "publisher": "operator1_fr",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "processPublisherTypeNull",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "publisherType": null,
      "summary": {"key": "defaultProcess.summary"},
      "title": {"key": "defaultProcess.title2"},
      "data": {"message": "test externalRecipients"}
    }
    """

  # Push parent card
  Given url opfabPublishCardUrl + 'cards'
  And header Authorization = 'Bearer ' + authToken
  And request parentCard2
  When method post
  Then status 201

  # Get parent card id
  Given url opfabUrl + 'cards-consultation/cards/api_test.processPublisherTypeNull'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And match response.card.publisherType == "EXTERNAL"

#delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') { perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)' }
