Feature: API - creatCardAction


  Background:

    * def signInAsTso = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTso = signInAsTso.authToken

Scenario: Create a card with a valid lttd conditions

# Push an action card with :

    # one entity of enitiesAllowedToRepond  in the card match the entity of the user connected*
    # AND the card has no child card of the entity of the connected user*
    # AND the lttd is present in the card data
    # AND 0 < lttd - currenttime < secondsBeforeLttdForClockDisplay (Param in web-ui.json)

    * def getCard = 

    """
    function() {
     date = new Date();
      serveurCurrentDate = new Date(date.valueOf());

      startDate = new Date().valueOf();
	  endDate = new Date().valueOf() + 6*60*60*1000;

      lttd = new Date().valueOf() + 10*1000;

        var card =

        {
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_response_full",
    "processInstanceId": "processInstanceId1",
    "state": "response_full",
    "publishDate": startDate,
    "lttd": lttd,
    "startDate": startDate,
    "endDate": endDate,
    "severity": "ACTION",
    "media": null,
    "tags": [
        "tag1"
    ],
    "timeSpans": [
        {
            "start": 1589376144000,
            "end": 1590184800000,
            "display": null
        }
    ],
    "details": null,
    "title": {
        "key": "cardFeed.title",
        "parameters": {
            "title": "Card with valid lttd conditions"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "New test  the action processInstanceId1"
        }
    },
    "recipient": {
        "type": "UNION",
        "recipients": [
            {
                "type": "GROUP",
                "recipients": null,
                "identity": "TSO1",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["ENTITY1"],
    "entitiesAllowedToRespond": ["ENTITY1","ENTITY2"],
    "mainRecipient": null,
    "userRecipients": null,
    "groupRecipients": null,
    "data": {
        "data1": "data1 data1  content"
    }
}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard


# Push card

    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And header Content-Type = 'application/json'
    And request card
    When method post
    Then status 201
    And match response.count == 1
    * def statusCode = responseStatus
    * def body = $

Scenario: Create a card - entity of enitiesAllowedToRepond  in the card not matched the entity of the user connected

# Push an action card

    * def getCard2 =
    """
    function() {

    startDate = new Date().valueOf() + 4*60*60*1000;
	endDate = new Date().valueOf() + 6*60*60*1000;
    lttd = new Date().valueOf() + 4*60*1000;

        var card2 =

       {
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_btnColorMissing",
    "processInstanceId": "processInstanceId2",
    "state": "response_full",
    "publishDate": startDate,
    "lttd": lttd,
    "startDate": startDate,
    "endDate": endDate,
    "severity": "ACTION",
    "media": null,
    "tags": [
        "tag1"
    ],
    "timeSpans": [
        {
            "start": 1589376144000,
            "end": 1590184800000,
            "display": null
        }
    ],
    "details": null,
    "title": {
        "key": "cardFeed.title",
        "parameters": {
            "title": "Entity user not allowed to respond"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action processInstanceId2"
        }
    },
    "recipient": {
        "type": "UNION",
        "recipients": [
            {
                "type": "GROUP",
                "recipients": null,
                "identity": "TSO1",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["ENTITY1"],
    "entitiesAllowedToRespond": ["TSO","ENTITY2"],
    "mainRecipient": null,
    "userRecipients": null,
    "groupRecipients": null,
    "data": {
        "data1": "data1 content"
    }
}

	return JSON.stringify(card2);

      }
    """
    * def card2 = call getCard2


 # Push card

    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And header Content-Type = 'application/json'
    And request card2
    When method post
    Then status 201
    And match response.count == 1

Scenario: Create a card - with expired lttd

# Push an action card

    * def getCard3 =
    """
    function() {
        startDate = new Date().valueOf() + 4*60*60*1000;
	    endDate = new Date().valueOf() + 5*60*60*1000;
        lttd = new Date().valueOf();

        var card3 =

        {
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_btnTextMissing",
    "processInstanceId": "processInstanceId3",
    "state": "response_full",
    "publishDate": startDate,
    "lttd": lttd,
    "startDate": startDate,
    "endDate": endDate,
    "severity": "ACTION",
    "media": null,
    "tags": [
        "tag1"
    ],
    "timeSpans": [
        {
            "start": 1589376144000,
            "end": 1590184800000,
            "display": null
        }
    ],
    "details": null,
    "title": {
        "key": "cardFeed.title",
        "parameters": {
            "title": "Card - with expired lttd"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action processInstanceId3"
        }
    },
    "recipient": {
        "type": "UNION",
        "recipients": [
            {
                "type": "GROUP",
                "recipients": null,
                "identity": "TSO1",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["ENTITY1"],
    "entitiesAllowedToRespond": ["ENTITY1","ENTITY2"],
    "mainRecipient": null,
    "userRecipients": null,
    "groupRecipients": null,
    "data": {
        "data1": "data1 content"
    }
}

	return JSON.stringify(card3);

      }
    """
    * def card3 = call getCard3

 # Push card

    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And header Content-Type = 'application/json'
    And request card3
    When method post
    Then status 201
    And match response.count == 1


     Scenario: Create a card - with lttd null


# Push an action card

    * def getCard4 =
    """
    function() {
        startDate = new Date().valueOf() + 4*60*60*1000;
  	    endDate = new Date().valueOf() + 4*60*60*1000;


        var card4 =

        {
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_btnTextMissing",
    "processInstanceId": "processInstanceId4",
    "state": "response_full",
    "publishDate": startDate,
    "startDate": startDate,
    "endDate": endDate,
    "severity": "ACTION",
    "media": null,
    "tags": [
        "tag1"
    ],
    "timeSpans": [
        {
            "start": 1589376144000,
            "end": 1590184800000,
            "display": null
        }
    ],
    "details": null,
    "title": {
        "key": "cardFeed.title",
        "parameters": {
            "title": "Card - with lttd null"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action processInstanceId4"
        }
    },
    "recipient": {
        "type": "UNION",
        "recipients": [
            {
                "type": "GROUP",
                "recipients": null,
                "identity": "TSO1",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["ENTITY1"],
    "entitiesAllowedToRespond": ["ENTITY1","ENTITY2"],
    "mainRecipient": null,
    "userRecipients": null,
    "groupRecipients": null,
    "data": {
        "data1": "data1 content"
    }
}

	return JSON.stringify(card4);

      }
    """
    * def card4 = call getCard4

 # Push card

    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And header Content-Type = 'application/json'
    And request card4
    When method post
    Then status 201
    And match response.count == 1