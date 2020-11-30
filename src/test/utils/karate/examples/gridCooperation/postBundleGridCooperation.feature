Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle


     # Push bundle
    Given url opfabUrl + 'businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('bundle_gridCooperation.tar.gz')
    When method post
    Then status 201

