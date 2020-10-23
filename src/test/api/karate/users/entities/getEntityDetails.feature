Feature: Get Entity details

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining entities
    * def entity =
"""
{
  "id" : "entityKarate3",
  "name" : "entityKarate3 name",
  "description" : "entity"
}
"""


    #First, create the entity
  Scenario: Create the entity
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request entity
    When method post
    Then status 201


  Scenario: get entity details
    #get /entities/{id}
    Given url opfabUrl + 'users/entities/' + entity.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then match response.id == entity.id
    Then match response.name == entity.name
    And match response.description == entity.description
    And status 200


  Scenario: get entity details without authentication
    Given url opfabUrl + 'users/entities/' + entity.id
    When method get
    Then status 401


  Scenario: get entity details with a simple user
    Given url opfabUrl + 'users/entities/' + entity.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: get nonexistent entity details
    Given url opfabUrl + 'users/entities/Random'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404