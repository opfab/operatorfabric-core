Feature: Perimeters


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: Get all perimeters - Get the first perimeter

    # Get all perimeters
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].id != null
    And def perimeterId = response[0].id
    And def perimeterProcess = response[0].process
    And def perimeterState = response[0].state
    And def perimeterRights = response[0].rights

    # Get the first perimeter
    Given url opfabUrl + 'users/perimeters/' +  perimeterId
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.id == perimeterId
    And match response.process == perimeterProcess
    And match response.state == perimeterState
    And match response.rights == perimeterRights