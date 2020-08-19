Feature: deleteEntity

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


    # defining entity to create
    * def entityForEndpointDeleteEntity =
"""
{
   "id" : "entityForEndpointDeleteEntity",
   "name" : "entityForEndpointDeleteEntity name",
   "description" : "entityForEndpointDeleteEntity description"
}
"""


  Scenario: Delete entity for a non-existent entity, expected response 404
    Given url opfabUrl + 'users/entities/NonExistentEntity'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  # then we create a new entity who will be deleted
  Scenario: create a new entity
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request entityForEndpointDeleteEntity
    When method post
    Then status 201
    And match response.id == entityForEndpointDeleteEntity.id
    And match response.name == entityForEndpointDeleteEntity.name
    And match response.description == entityForEndpointDeleteEntity.description


  Scenario: we check that the entity created previously exists
    Given url opfabUrl + 'users/entities/' + entityForEndpointDeleteEntity.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: delete entity with no authentication, expected response 401
    Given url opfabUrl + 'users/entities/' + entityForEndpointDeleteEntity.id
    When method delete
    Then status 401


  Scenario: delete entity with no admin authentication (with tso1-operator authentication), expected response 403
    Given url opfabUrl + 'users/entities/' + entityForEndpointDeleteEntity.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete entity (with admin authentication), expected response 200
    Given url opfabUrl + 'users/entities/' + entityForEndpointDeleteEntity.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: we check that the entity doesn't exist anymore, expected response 404
    Given url opfabUrl + 'users/entities/' + entityForEndpointDeleteEntity.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404