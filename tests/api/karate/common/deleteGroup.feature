Feature: Delete group

  Scenario:
    Given form field groupId = groupId
    And form field token = token
    And url opfabUrl + 'users/groups/' + groupId
    And header Authorization = 'Bearer ' + token
    When method delete
    Then status 200