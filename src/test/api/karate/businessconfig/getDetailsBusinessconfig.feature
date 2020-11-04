Feature: getDetailsBusinessconfig

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    
    * def process = 'api_test'
    * def state = 'messageState'
    * def version = 2

    Scenario: get businessconfig details

      Given url opfabUrl + '/businessconfig/processes/' + process + '/' + state + '/details?version=' + version
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then print response
      And status 200
      And print response.title.key



  Scenario: get businessconfig details without authentication

    Given url opfabUrl + '/businessconfig/processes/' + process + '/' + state + '/details?version=' + version
    When method get
    Then print response
    And status 401


  Scenario: get businessconfig details without authentication

    Given url opfabUrl + '/businessconfig/unknownBusinessconfig/' + process + '/' + state + '/details?version=' + version
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then print response
    And status 404
