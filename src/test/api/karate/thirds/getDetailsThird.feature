Feature: getDetailsThird

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def thirdName = 'api_test'
    * def process = 'defaultProcess'
    * def state = 'messageState'
    * def version = 2

    Scenario: get third details

      Given url opfabUrl + '/thirds/' + thirdName + '/' + process + '/' + state + '/details?apiVersion=' + version
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then print response
      And status 200
      And print response.title.key



  Scenario: get third details without authentication

    Given url opfabUrl + '/thirds/' + thirdName + '/' + process + '/' + state + '/details?apiVersion=' + version
    When method get
    Then print response
    And status 401


  Scenario: get third details without authentication

    Given url opfabUrl + '/thirds/unknownThird/' + process + '/' + state + '/details?apiVersion=' + version
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then print response
    And status 404