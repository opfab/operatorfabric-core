Feature: Cards


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken

  Scenario: Post card

    * def card_response_full =
"""
{
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_response_full",
    "processInstanceId": "processInstanceId1",
    "state": "response_full",
    "publishDate": 1589376144000,
    "deletionDate": null,
    "lttd": 1596042927,
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
            "title": "Test action - Response full"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action process"
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
        "data1": "data1 data1 testtttttttttt content"
    }
}
"""

    * def card_btnColorMissing =
"""
{
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_btnColorMissing",
    "processInstanceId": "processInstanceId2",
    "state": "btnColor_missing",
    "publishDate": 1589376144000,
    "deletionDate": null,
    "lttd": 1583733121994,
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
            "title": "Test action - btnColor missing"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action process"
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
"""

    * def card_btnTextMissing =
"""
{
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_btnTextMissing",
    "processInstanceId": "processInstanceId3",
    "state": "btnText_missing",
    "publishDate": 1589376144000,
    "deletionDate": null,
    "lttd": 1583733121997,
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
            "title": "Test action - btnText missing"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action process"
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
"""

    * def card_btnColorAndTextMissings =
"""
{
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_btnColorAndTextMissings",
    "processInstanceId": "processInstanceId4",
    "state": "btnColor_btnText_missings",
    "publishDate": 1589376144000,
    "deletionDate": null,
    "lttd": 1583733121998,
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
            "title": "Test action - btnColor & btnText missings"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action process"
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
"""
      * def card_response_without_entity_in_entitiesAllowedToRespond =
"""
{
    "uid": null,
    "id": null,
    "publisher": "processAction",
    "processVersion": "1",
    "process": "processAction",
    "processId": "processAction_1_without_entity_in_entitiesAllowedToRespond",
    "processInstanceId": "processInstanceId1",
    "state": "response_full",
    "publishDate": 1589376144000,
    "deletionDate": null,
    "lttd": 1583733121999,
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
            "title": "Test action - without entity in entitiesAllowedToRespond"
        }
    },
    "summary": {
        "key": "cardFeed.summary",
        "parameters": {
        "summary": "Test the action without entity in entitiesAllowedToRespond"
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

# Push card - response full
    Given url opfabPublishCardUrl + 'cards'

    And request card_response_full
    When method post
    Then status 201
    And match response.count == 1

# Push card - btnColor missing
    Given url opfabPublishCardUrl + 'cards'

    And request card_btnColorMissing
    When method post
    Then status 201
    And match response.count == 1

# Push card - btnText missing
    Given url opfabPublishCardUrl + 'cards'

    And request card_btnTextMissing
    When method post
    Then status 201
    And match response.count == 1

# Push card - btnColor & btnText missings
    Given url opfabPublishCardUrl + 'cards'

    And request card_btnColorAndTextMissings
    When method post
    Then status 201
    And match response.count == 1

# Push card - card response without entity in entity  in entitiesAllowedToRespond
      Given url opfabPublishCardUrl + 'cards'

      And request card_response_without_entity_in_entitiesAllowedToRespond
      When method post
      Then status 201
      And match response.count == 1
