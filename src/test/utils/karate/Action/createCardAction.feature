Feature: API - creatCardAction


  Background:

    * def signInAsTso = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTso = signInAsTso.authToken

  Scenario: Create a card



# Push an action card 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  endDate = new Date().valueOf() + 6*60*60*1000;

        var card =
        
        {
            "publisher": "api_test_externalRecipient1",
            "processVersion": "1",
            "process": "processAction",
            "processInstanceId": "processInstanceId1",
            "state": "response_full",
            "startDate": startDate,
            "lttd": 1596024957,
            "severity": "ACTION",
            "tags": [
                "tag1"
            ],
            "timeSpans": [
                {
                    "start": startDate
                }
            ],
            "title": {
                "key": "cardFeed.title",
                "parameters": {
                    "title": "Test action - with entity in entitiesAllowedToRespond"
                 }
            },
            "summary": {
                "key": "cardFeed.summary",
                "parameters": {
                "summary": "Test the action with entity in entitiesAllowedToRespond"
                }
            },
            "groupRecipients": ["Dispatcher"],
            "entityRecipients": ["ENTITY1"],
            "entitiesAllowedToRespond": ["Dispatcher","ENTITY1", "ENTITY2"],
            "data": {
                "data1": "data1 content"
            }
        }    

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 


# Push card - card response without entity in entity  in entitiesAllowedToRespond
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And header Content-Type = 'application/json'
    And request card
    When method post
    Then status 201
    And match response.count == 1
    * def statusCode = responseStatus
    * def body = $

  Scenario: Create a card - long format

# Push an action card

    * def getCard =
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  endDate = new Date().valueOf() + 6*60*60*1000;

        var card =

        {
            "publisher": "processAction",
            "processVersion": "1",
            "process": "processAction",
            "processInstanceId": "processInstanceId1",
            "state": "longFormat",
            "startDate": startDate,
            "lttd": 1596025857,

            "severity": "ACTION",
            "tags": [
                "tag1"
            ],
            "timeSpans": [
                {
                    "start": startDate
                }
            ],
            "title": {
                "key": "cardFeed.title",
                "parameters": {
                    "title": "Test action - Long format"
                 }
            },
            "summary": {
                "key": "cardFeed.summary",
                "parameters": {
                "summary": "Test the action with a long format"
                }
            },
            "groupRecipients": ["Dispatcher"],
            "entityRecipients": ["ENTITY1", "ENTITY2"],
            "entitiesAllowedToRespond": ["Dispatcher","ENTITY1", "ENTITY2"],
            "data": {
                "data1": "data1 content"
            }
        }

	return JSON.stringify(card);

      }
    """
    * def card = call getCard

    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And header Content-Type = 'application/json'
    And request card
    When method post
    Then status 201
    And match response.count == 1