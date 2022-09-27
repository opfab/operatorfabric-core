Feature: CreateEntities

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
      #defining entities
    * def entity =
"""
{
  "id" : "entityKarate1",
  "name" : "entityKarate1 name",
  "description" : "Karate is driving me crazy",
  "labels" : ["Label1"]
}
"""
    * def entityUpdated =
"""
{
  "id" : "entityKarate1",
  "name" : "entityKarate1 name",
  "description" : "I Love Karate",
  "labels" : ["Label2", "Label3"],
  "entityAllowedToSendCard" : false
}
"""
    * def wrongEntity =
"""
{
  "description" : "Karate is driving me crazy",
}
"""

    * def entityToTestBadRequest0 =
"""
{
   "id" : "",
   "name" : "entity name",
   "description" : "entity description"
}
"""
    * def entityToTestBadRequest1 =
"""
{
   "id" : "a",
   "name" : "entity name",
   "description" : "entity description"
}
"""
    * def entityToTestBadRequest2 =
"""
{
   "id" : "aé",
   "name" : "entity name",
   "description" : "entity description"
}
"""
    * def entityToTestBadRequest3 =
"""
{
   "id" : "é",
   "name" : "entity name",
   "description" : "entity description"
}
"""

    * def entityWithValidIdFormat0 =
"""
{
   "id" : "validId",
   "name" : "entity name",
   "description" : "entity description"
}
"""
    * def entityWithValidIdFormat1 =
"""
{
   "id" : "valid_id",
   "name" : "entity name",
   "description" : "entity description"
}
"""

    * def entityWithValidIdFormat2 =
"""
{
   "id" : "valid-id",
   "name" : "entity name",
   "description" : "entity description"
}
"""

    * def entityWithValidIdFormat3 =
"""
{
   "id" : "validId_with-digit_0",
   "name" : "entity name",
   "description" : "entity description"
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
    And match response.entityAllowedToSendCard == true
    And assert response.labels.length == 1
    And match response.labels[0] == 'Label1'

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
    And match response.entityAllowedToSendCard == false
    And assert response.labels.length == 2
    And match response.labels contains ['Label2', 'Label3'] 

  Scenario: create without admin role
    #Forbidden without admin role, expected response 403
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request entity
    When method post
    Then status 403

  Scenario: Update without authentication token
    #Without authentication
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


  Scenario Outline: Bad request
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request <entityToTestBadRequest>
    When method post
    Then status 400
    And match response.status == "BAD_REQUEST"
    And match response.message == <expectedMessage>

    Examples:
      | entityToTestBadRequest  | expectedMessage                                                                                                             |
      | entityToTestBadRequest0 | "Id is required."                                                                                                           |
      | entityToTestBadRequest1 | "Id should be minimum 2 characters (id=a)."                                                                                 |
      | entityToTestBadRequest2 | "Id should only contain the following characters: letters, _, - or digits (id=aé)."                                         |
      | entityToTestBadRequest3 | "Id should be minimum 2 characters (id=é).Id should only contain the following characters: letters, _, - or digits (id=é)." |


  Scenario Outline: Create entity with valid id format
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request <entityWithValidIdFormat>
    When method post
    Then status 201
    And match response.id == <expectedEntityId>

    Examples:
      | entityWithValidIdFormat  | expectedEntityId            |
      | entityWithValidIdFormat0 | entityWithValidIdFormat0.id |
      | entityWithValidIdFormat1 | entityWithValidIdFormat1.id |
      | entityWithValidIdFormat2 | entityWithValidIdFormat2.id |
      | entityWithValidIdFormat3 | entityWithValidIdFormat3.id |


  Scenario Outline: we delete the entities previously created
    Given url opfabUrl + 'users/entities/' + <entityId>
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Examples:
      | entityId  |
      | entityWithValidIdFormat0.id |
      | entityWithValidIdFormat1.id |
      | entityWithValidIdFormat2.id |
      | entityWithValidIdFormat3.id |