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