Feature: Entities


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: Get Entities

    # Get all entities
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].id != null
    And def entityId = response[0].id

    # Get the first entity
    Given url opfabUrl + 'users/entities/' +  entityId
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.id == entityId