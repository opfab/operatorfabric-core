Feature: API - creatCardAction


  Background:

    * def signInAsTso = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTso = signInAsTso.authToken

  Scenario: Create a card


    * def card_response_with_allowedToRespond =
"""
{
    "uid": null,
    "id": null,
    "publisher": "api_test_externalRecipient1",
    "publisherVersion": "1",
    "process": "process",
    "processId": "processId1",
    "state": "responseState",
    "publishDate": 1589376144000,
    "deletionDate": null,
    "lttd": null,
    "startDate": 1589580000000,
    "endDate": 1590184800000,
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
            "title": "Test action - with entity in entitiesAllowedToRespond"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action with entity in entitiesAllowedToRespond"
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
    "entitiesAllowedToRespond": ["TSO1","ENTITY1"],
    "mainRecipient": null,
    "userRecipients": null,
    "groupRecipients": null,
    "data": {
        "data1": "data1 content"
    }
}
"""

# Push card - card response without entity in entity  in entitiesAllowedToRespond
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTso
    And request card_response_with_allowedToRespond
    When method post
    Then status 201
    And match response.count == 1
    * def statusCode = responseStatus
    * def body = $
