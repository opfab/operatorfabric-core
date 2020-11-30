Feature: getResponseBusinessconfig

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def process = 'processAction'
    * def state = 'response_full'
    * def version = 1

    Scenario: get businessconfig response

      Given url opfabUrl + '/businessconfig/processes/' + process + '/' + state + '/response?version=' + version
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then print response
      And status 200
      And match response == {"btnText":{"parameters":null,"key":"action.text"},"btnColor":"RED","lock":true,"state":"responseState","externalRecipients":["externalRecipient1","externalRecipient2"]}



  Scenario: get businessconfig response without authentication

    Given url opfabUrl + '/businessconfig/processes/' + process + '/' + state + '/response?version=' + version
    When method get
    Then print response
    And status 401


  Scenario: get businessconfig response without authentication

    Given url opfabUrl + '/businessconfig/unknownBusinessconfig/' + process + '/' + state + '/response?version=' + version
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then print response
    And status 404
