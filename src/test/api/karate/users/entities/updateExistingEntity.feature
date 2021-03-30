Feature: Update existing entity

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

           #defining entities
    * def entityUpdated =
"""
{
  "id" : "entityKarate1",
  "name" : "entityKarate1 name",
  "description" : "entity description updated"
}
"""

    * def entityError =
"""
{
  "virtualField" : "virtual"
}
"""

  Scenario: Update the entity
    #Update the entity, expected response 200
    Given url opfabUrl + 'users/entities/' + entityUpdated.id
    And header Authorization = 'Bearer ' + authToken
    And request entityUpdated
    When method put
    Then status 200

  Scenario: Without authentication
    # authentication required, response expected 401
    Given url opfabUrl + 'users/entities/' + entityUpdated.id
    And request entityUpdated
    When method put
    Then status 401

  Scenario: With a simple user
    # update entity wrong user response expected 403
    Given url opfabUrl + 'users/entities/' + entityUpdated.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request entityUpdated
    When method put
    Then status 403

  Scenario: error 400
    Given url opfabUrl + 'users/entities/' + entityUpdated.id
    And header Authorization = 'Bearer ' + authToken
    And request entityError
    When method put
    Then status 400