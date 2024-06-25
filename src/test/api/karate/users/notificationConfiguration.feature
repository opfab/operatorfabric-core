Feature: configure notification for  process/state
  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAsTSO2 = callonce read('../common/getToken.feature') { username: 'operator2_fr'}
    * def authTokenAsTSO2 = signInAsTSO2.authToken
    * def signInAsTSO3 = callonce read('../common/getToken.feature') { username: 'operator3_fr'}
    * def authTokenAsTSO3 = signInAsTSO3.authToken

    * def userSettings1 =
    """
    {
      "login" : "operator1_fr",
      "processesStatesNotNotified": {"processA": ["state1", "state2"], "processB": ["state3"]},
      "processesStatesNotifiedByEmail": {"processA": ["state1"], "processB": ["state3", "state4"]}
    }
    """

    * def userSettings2 =
    """
    {
      "login" : "operator2_fr",
      "processesStatesNotNotified": {"processA": ["state1", "state2"], "processB": ["state3"]},
      "processesStatesNotifiedByEmail": {"processA": ["state1"], "processB": ["state3", "state4"]}
    }
    """

    * def userSettings3 =
    """
    {
      "login" : "operator2_fr"
    }
    """

  Scenario: Post operator1_fr and operator2_fr user settings

    Given url opfabUrl + 'users/users/operator1_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userSettings1
    When method patch
    Then status 200

    Given url opfabUrl + 'users/users/operator2_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    And request userSettings2
    When method patch
    Then status 200

    Given url opfabUrl + 'users/users/operator3_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO3
    And request userSettings3
    When method patch
    Then status 200

  Scenario: Post notification configuration for process/state without authentication
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotified/processA/state1'
    When method post
    Then status 401

  Scenario: Post notification configuration for process/state without admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotified/processA/state1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 403

  Scenario: Post notification configuration for process/state with admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotified/processA/state1'
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 200

    Given url opfabUrl + 'users/users/operator1_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.login == "operator1_fr"
    And match response.processesStatesNotNotified == {"processA": ["state2"], "processB": ["state3"]}

    Given url opfabUrl + 'users/users/operator2_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    When method get
    Then status 200
    And match response.login == "operator2_fr"
    And match response.processesStatesNotNotified == {"processA": ["state2"], "processB": ["state3"]}

  Scenario: Delete notification configuration for process/state without authentication
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotified/processB/state4'
    When method delete
    Then status 401

  Scenario: Delete notification configuration for process/state without admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotified/processB/state4'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

  Scenario: Delete notification configuration for process/state with admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotified/processB/state4'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Given url opfabUrl + 'users/users/operator1_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.login == "operator1_fr"
    And match response.processesStatesNotNotified == {"processA": ["state2"], "processB": ["state3", "state4"]}

    Given url opfabUrl + 'users/users/operator2_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    When method get
    Then status 200
    And match response.login == "operator2_fr"
    And match response.processesStatesNotNotified == {"processA": ["state2"], "processB": ["state3", "state4"]}

    Given url opfabUrl + 'users/users/operator3_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO3
    When method get
    Then status 200
    And match response.login == "operator3_fr"
    And match response.processesStatesNotNotified == {"processB": ["state4"]}

  Scenario: Post mail notification configuration for process/state without authentication
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotifiedbymail/processA/state2'
    When method post
    Then status 401

  Scenario: Post mail notification configuration for process/state without admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotifiedbymail/processA/state2'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 403

  Scenario: Post mail notification configuration for process/state with admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotifiedbymail/processA/state2'
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 200

    Given url opfabUrl + 'users/users/operator1_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.login == "operator1_fr"
    And match response.processesStatesNotifiedByEmail == {"processA": ["state1", "state2"], "processB": ["state3", "state4"]}

    Given url opfabUrl + 'users/users/operator2_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    When method get
    Then status 200
    And match response.login == "operator2_fr"
    And match response.processesStatesNotifiedByEmail == {"processA": ["state1","state2"], "processB": ["state3", "state4"]}

    Given url opfabUrl + 'users/users/operator3_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO3
    When method get
    Then status 200
    And match response.login == "operator3_fr"
    And match response.processesStatesNotifiedByEmail == {"processA": ["state2"]}


  Scenario: Delete mail notification configuration for process/state without authentication
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotifiedbymail/processB/state4'
    When method delete
    Then status 401

  Scenario: Delete mail notification configuration for process/state without admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotifiedbymail/processB/state4'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

  Scenario: Delete delete notification configuration for process/state with admin role
    Given url opfabUrl + 'users/notificationconfiguration/processstatenotifiedbymail/processB/state4'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Given url opfabUrl + 'users/users/operator1_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.login == "operator1_fr"
    And match response.processesStatesNotifiedByEmail == {"processA": ["state1","state2"], "processB": ["state3"]}

    Given url opfabUrl + 'users/users/operator2_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    When method get
    Then status 200
    And match response.login == "operator2_fr"
    And match response.processesStatesNotifiedByEmail == {"processA": ["state1","state2"], "processB": ["state3"]}
