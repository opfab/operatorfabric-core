Feature: Create perimeter

  Scenario:
    Given url opfabUrl + 'users/perimeters'
    And form field perimeter = perimeter
    And form field token = token
    And header Content-Type = 'application/json'
    And header Authorization = 'Bearer ' + token
    And request perimeter
    When method post
    Then status 201