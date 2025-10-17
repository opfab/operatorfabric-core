Feature: Create group

  Scenario:
    Given url opfabUrl + 'users/groups'
    And form field group = group
    And form field token = token
    And header Content-Type = 'application/json'
    And header Authorization = 'Bearer ' + token
    And request group
    When method post
    Then status 201