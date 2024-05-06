Feature: ResetRateLimiter


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken



Scenario: ResetRateLimiter

  # Send request without ADMIN rights
    Given url opfabUrl + 'cardspub/cards/rateLimiter'
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 403

  # Send request with ADMIN rights
    Given url opfabUrl + 'cardspub/cards/rateLimiter'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method post
    Then status 200


    