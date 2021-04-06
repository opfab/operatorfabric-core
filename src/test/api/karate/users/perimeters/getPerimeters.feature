Feature: Get perimeters (endpoint tested : GET /perimeters)

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Get perimeters
    #  get /perimeters
    # Get all perimeters
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def perimeterId = response[0].id
    And def perimeterProcess = response[0].process
    And def perimeterStateRights = response[0].stateRights


    # Get the first perimeter
    Given url opfabUrl + 'users/perimeters/' +  perimeterId
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.id == perimeterId
    And match response.process == perimeterProcess
    And match response.stateRights == perimeterStateRights


  Scenario: get perimeters without authentication
    # Get all perimeters, authentication required response expected 401
    Given url opfabUrl + 'users/perimeters'
    When method get
    Then status 401


  Scenario: get perimeters with simple user
    #   Using TSO user,  expected response 403
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403