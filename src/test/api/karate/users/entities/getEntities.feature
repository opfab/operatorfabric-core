Feature: Get Entities

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Get Entities
    #  get /entities
    # Get all entities
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def entityId = response[0].id


    # Get the first entity
    Given url opfabUrl + 'users/entities/' +  entityId
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.id == entityId


  Scenario: get entities without authentication
    # Get all entities, authentication required response expected 401
    Given url opfabUrl + 'users/entities'
    When method get
    Then status 401


  Scenario: get entities with simple user
    #   Using TSO user,  expected response 200
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200