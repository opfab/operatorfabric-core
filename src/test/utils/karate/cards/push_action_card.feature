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
    "publisher": "api_test_externalRecipient1",
    "publisherVersion": "1",
    "process": "process",
    "processId": "processId1",
    "state": "response_full",
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
                "identity": "RTE",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["RTE"],
    "mainRecipient": null,
    "userRecipients": null,
    "groupRecipients": null,
    "data": {
        "data1": "data1 content"
    }
}
"""

    * def card_btnColorMissing =
"""
{
    "uid": null,
    "id": null,
    "publisher": "api_test_externalRecipient1",
    "publisherVersion": "1",
    "process": "process",
    "processId": "processId2",
    "state": "btnColor_missing",
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
                "identity": "RTE",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["RTE"],
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
    "publisher": "api_test_externalRecipient1",
    "publisherVersion": "1",
    "process": "process",
    "processId": "processId3",
    "state": "btnText_missing",
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
                "identity": "RTE",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["RTE"],
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
    "publisher": "api_test_externalRecipient1",
    "publisherVersion": "1",
    "process": "process",
    "processId": "processId4",
    "state": "btnColor_btnText_missings",
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
                "identity": "RTE",
                "preserveMain": null
            }
        ],
        "identity": null,
        "preserveMain": null
    },
    "entityRecipients": ["RTE"],
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