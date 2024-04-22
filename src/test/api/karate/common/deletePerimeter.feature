Feature: Delete perimeter

  Scenario:
    Given form field perimeterId = perimeterId
    And form field token = token
    And url opfabUrl + 'users/perimeters/' + perimeterId
    And header Authorization = 'Bearer ' + token
    When method delete
    Then status 200