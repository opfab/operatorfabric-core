Feature: CreateEntities

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
  "id" : "entityKarate1",
  "name" : "entityKarate1 name",
  "description" : "Karate is driving me crazy"
}
"""
    * def entityUpdated =
"""
{
  "id" : "entityKarate1",
  "name" : "entityKarate1 name",
  "description" : "I Love Karate"
}
"""
    * def wrongEntity =
"""
{
  "description" : "Karate is driving me crazy",
}
"""


  Scenario: Create entities

#Create new entity (check if the entity already exists otherwise it will return 200)
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request entity
    When method post
    Then status 201
    And match response.description == entity.description
    And match response.name == entity.name
    And match response.id == entity.id

  Scenario: Update my entity

#Expected response 200
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request entityUpdated
    When method post
    Then status 200
    And match response.description == entityUpdated.description
    And match response.name == entityUpdated.name
    And match response.id == entity.id

  Scenario: create without admin role
        #HForbiden without admin role, expected response 403
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request entity
    When method post
    Then status 403

     Scenario: Update without authentication token
     #Witout authentication
    Given url opfabUrl + 'users/entities'
    And request entity
    When method post
   Then status 401

  Scenario: error 400

#Create new entity (check if the entity already exists otherwise it will return 200)
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request wrongEntity
    When method post
    Then status 400