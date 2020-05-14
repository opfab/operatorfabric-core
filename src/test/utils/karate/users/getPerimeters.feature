Feature: Perimeters


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: Get all perimeters

    # Get all perimeters
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200