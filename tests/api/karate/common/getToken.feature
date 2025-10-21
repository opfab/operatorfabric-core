Feature: Get Token

  Scenario:
    Given url opfabUrl + 'auth/token'
    And form field username = username
    And form field password = 'test'
    And form field grant_type = 'password'
    When method post
    Then status 200
    And def authToken = response.access_token