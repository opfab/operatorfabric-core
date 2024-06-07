Feature: Post translateCardField


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken

    * def fieldToTranslate =
"""
{
    "process" : "api_test",
    "processVersion" : "1",
    "i18nValue" : {
        "key" : "detail.title"
    }
}
"""

    * def fieldToTranslateWithParameter =
"""
{
    "process" : "APOGEESEA",
    "processVersion" : "1",
    "i18nValue" : {
        "key" : "apogeesea.card.summary",
        "parameters" : {
            "contingenciesSize" : "3"
        }
    }
}
"""

    * def fieldToTranslateWithParameterAndSpecialCharacters =
"""
{
    "process" : "APOGEESEA",
    "processVersion" : "1",
    "i18nValue" : {
        "key" : "apogeesea.card.summary",
        "parameters" : {
            "contingenciesSize" : "3 # $ % & * + - / = ? @ ^ _ \" {} ' []"
        }
    }
}
"""

    * def fieldToTranslateNotExisting =
"""
{
    "process" : "APOGEESEA",
    "processVersion" : "1",
    "i18nValue" : {
        "key" : "apogeesea.notexisting.summary"
    }
}
"""

  Scenario: Post request without authentication

    Given url opfabPublishCardUrl + 'cards/translateCardField'
    And request fieldToTranslate
    When method POST
    Then status 401

  Scenario: Post request for field with no parameter

    Given url opfabPublishCardUrl + 'cards/translateCardField'
    And header Authorization = 'Bearer ' + authToken
    And request fieldToTranslate
    When method POST
    Then status 200
    And match response == {"translatedField": "Message"}

  Scenario: Post request for field with a parameter

    Given url opfabPublishCardUrl + 'cards/translateCardField'
    And header Authorization = 'Bearer ' + authToken
    And request fieldToTranslateWithParameter
    When method POST
    Then status 200
    And match response == {"translatedField": "3 contingencies"}

  Scenario: Post request for field with a parameter with special characters

    Given url opfabPublishCardUrl + 'cards/translateCardField'
    And header Authorization = 'Bearer ' + authToken
    And request fieldToTranslateWithParameterAndSpecialCharacters
    When method POST
    Then status 200
    And match response == {"translatedField": "3 # $ % & * + - / = ? @ ^ _ \" {} ' [] contingencies"}

  Scenario: Post request for a non existing key

    Given url opfabPublishCardUrl + 'cards/translateCardField'
    And header Authorization = 'Bearer ' + authToken
    And request fieldToTranslateNotExisting
    When method POST
    Then status 200
    And match response == {"translatedField": "apogeesea.notexisting.summary"}