Feature: Device Configuration Management (Edit)

Background:
  # Get admin token
  * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authToken = signIn.authToken

  # Get TSO-operator
  * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
  * def authTokenAsTSO = signInAsTSO.authToken

  # Get operator1_fr
  * def signInAsTSO1 = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
  * def authTokenAsTSO1 = signInAsTSO1.authToken

  * def notificationEndpoint = 'externaldevices/notifications'
  * def devicesEndpoint = 'externaldevices/devices'


Scenario: Disable a device

    Given url opfabUrl + devicesEndpoint + "/CDS_1/disable"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 200

Scenario: Try to push notification to disabled device

    * def notification = read("resources/notifications/ALARM_notification.json")

    # Push notification
    Given url opfabUrl + notificationEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO1
    And request notification
    When method post
    Then status 400

Scenario: Try to enable a device without admin role

    Given url opfabUrl + devicesEndpoint + "/CDS_1/enable"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 403

Scenario: Try to enable a device without authentication

    Given url opfabUrl + devicesEndpoint + "/CDS_1/enable"
    When method post
    Then status 401

Scenario: Try to connect a disabled device

    Given url opfabUrl + devicesEndpoint + "/CDS_1/connect"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 400

Scenario: Enable a device

    Given url opfabUrl + devicesEndpoint + "/CDS_1/enable"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 200

Scenario: Push notification to enabled device

    * def notification = read("resources/notifications/ALARM_notification.json")

    # Push notification
    Given url opfabUrl + notificationEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO1
    And request notification
    When method post
    Then status 200


Scenario: Try to disable a device without admin role

    Given url opfabUrl + devicesEndpoint + "/CDS_1/disable"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 403

Scenario: Try to disable a device without authentication

    Given url opfabUrl + devicesEndpoint + "/CDS_1/disable"
    When method post
    Then status 401

Scenario: Try to disable a non existing device

    Given url opfabUrl + devicesEndpoint + "/device_that_doesnt_exist/disable"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 404

Scenario: Try to enable a non existing device

    Given url opfabUrl + devicesEndpoint + "/device_that_doesnt_exist/enable"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 404

Scenario: Disconnect a device

    Given url opfabUrl + devicesEndpoint + "/CDS_1/disconnect"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 200

Scenario: Try to connect a device without admin role

    Given url opfabUrl + devicesEndpoint + "/CDS_1/connect"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 403

Scenario: Try to connect a device without authentication

    Given url opfabUrl + devicesEndpoint + "/CDS_1/connect"
    When method post
    Then status 401

Scenario: Connect a device

    Given url opfabUrl + devicesEndpoint + "/CDS_1/connect"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 200

Scenario: Try to disconnect a device without admin role

    Given url opfabUrl + devicesEndpoint + "/CDS_1/disconnect"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 403

Scenario: Try to disconnect a device without authentication

    Given url opfabUrl + devicesEndpoint + "/CDS_1/disconnect"
    When method post
    Then status 401

Scenario: Try to connect a non existing device

    Given url opfabUrl + devicesEndpoint + "/device_that_doesnt_exist/connect"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 404

Scenario: Try to disconnect a non existing device

    Given url opfabUrl + devicesEndpoint + "/device_that_doesnt_exist/disconnect"
    And header Authorization = 'Bearer ' + authToken
    When method post
    Then status 404
