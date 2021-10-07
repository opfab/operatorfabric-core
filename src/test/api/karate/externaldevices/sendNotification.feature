Feature: Device Configuration Management

  Background:

    # Get operator1
    * def signInAsTSO1 = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO1 = signInAsTSO1.authToken

    # Get operator4 (no external device is configured for this user)
    * def signInAsTSO4 = callonce read('../common/getToken.feature') { username: 'operator4'}
    * def authTokenAsTSO4 = signInAsTSO4.authToken

    * def notificationEndpoint = 'externaldevices/notifications'

  Scenario: Push notification with ALARM signal

  * def notification = read("resources/notifications/ALARM_notification.json")

    # Push notification
    Given url opfabUrl + notificationEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO1
    And request notification
    When method post
    Then status 200

  Scenario: Push notification with unhandled signal

    * def notification = read("resources/notifications/unhandled_notification.json")

    # Push notification
    Given url opfabUrl + notificationEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO1
    And request notification
    When method post
    Then status 400


  Scenario: Push notification without authentication

    * def notification = read("resources/notifications/ALARM_notification.json")

    # Push notification
    Given url opfabUrl + notificationEndpoint
    And request notification
    When method post
    Then status 401


  Scenario: Push notification with user with no external device

    * def notification = read("resources/notifications/ALARM_notification.json")

    # Push notification
    Given url opfabUrl + notificationEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    And request notification
    When method post
    Then status 400



