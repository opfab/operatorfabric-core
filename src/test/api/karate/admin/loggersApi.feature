Feature: Log Level Access

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'user_test_api_1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def businessConfigLoggersUrl = opfabBusinessConfigUrl + 'actuator/loggers/org.opfab'
    * def userLoggersUrl = opfabUserUrl + 'actuator/loggers/org.opfab'
    * def cardsPublicationLoggersUrl = opfabCardsPublicationUrl + 'actuator/loggers/org.opfab'
    * def cardsConsultationLoggersUrl = opfabCardsConsultationUrl + 'actuator/loggers/org.opfab'
    * def externalDevicesLoggersUrl = opfabExternalDevicesUrl + 'actuator/loggers/org.opfab'
    


    * def info_level =
    """
    {
      "configuredLevel": "INFO"
    }
    """

    * def debug_level =
    """
    {
      "configuredLevel": "DEBUG"
    }
    """  

  Scenario Outline: get logging level is restricted to admin user

    Given url <url>
    And header Authorization = 'Bearer ' + <token>
    When method <method>
    Then status <expected>

    Examples:
    | url                          | method | token          | expected  |
    | businessConfigLoggersUrl     | get    | authTokenAsTSO | 403       |
    | businessConfigLoggersUrl     | get    | authToken      | 200       |
    | userLoggersUrl               | get    | authTokenAsTSO | 403       |
    | userLoggersUrl               | get    | authToken      | 200       |
    | cardsPublicationLoggersUrl   | get    | authTokenAsTSO | 403       |
    | cardsPublicationLoggersUrl   | get    | authToken      | 200       |
    | cardsConsultationLoggersUrl  | get    | authTokenAsTSO | 403       |
    | cardsConsultationLoggersUrl  | get    | authToken      | 200       |
    | externalDevicesLoggersUrl    | get    | authTokenAsTSO | 403       |
    | externalDevicesLoggersUrl    | get    | authToken      | 200       |
    


  Scenario Outline: set logging level to DEBUG is restricted to admin user

    Given url <url>
    And header Authorization = 'Bearer ' + <token>
    And request debug_level
    When method <method>
    Then status <expected>

    Examples:
    | url                          | method | token          | expected  |
    | businessConfigLoggersUrl     | post   | authTokenAsTSO | 403       |
    | businessConfigLoggersUrl     | post   | authToken      | 204       |
    | userLoggersUrl               | post   | authTokenAsTSO | 403       |
    | userLoggersUrl               | post   | authToken      | 204       |
    | cardsPublicationLoggersUrl   | post   | authTokenAsTSO | 403       |
    | cardsPublicationLoggersUrl   | post   | authToken      | 204       |
    | cardsConsultationLoggersUrl  | post   | authTokenAsTSO | 403       |
    | cardsConsultationLoggersUrl  | post   | authToken      | 204       |
    | externalDevicesLoggersUrl    | post   | authTokenAsTSO | 403       |
    | externalDevicesLoggersUrl    | post   | authToken      | 204       |

  Scenario Outline: check logging level is 'DEBUG' as admin

    Given url <url>
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status <expected>
    And match response.configuredLevel == 'DEBUG'

    Examples:
    | url                          | expected  |
    | businessConfigLoggersUrl     | 200       |
    | userLoggersUrl               | 200       |
    | cardsPublicationLoggersUrl   | 200       |
    | cardsConsultationLoggersUrl  | 200       |
    | externalDevicesLoggersUrl    | 200       |



  Scenario Outline: set logging level to INFO as admin

    Given url <url>
    And header Authorization = 'Bearer ' + authToken
    And request info_level
    When method post
    Then status <expected>

    Examples:
    | url                          | expected  |
    | businessConfigLoggersUrl     | 204       |
    | userLoggersUrl               | 204       |
    | cardsPublicationLoggersUrl   | 204       |
    | cardsConsultationLoggersUrl  | 204       |
    | externalDevicesLoggersUrl    | 204       |

  Scenario Outline: get logging level is 'INFO' as admin 

    Given url <url>
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status <expected>
    And match response.configuredLevel == 'INFO'

    Examples:
    | url                          | expected  |
    | businessConfigLoggersUrl     | 200       |
    | userLoggersUrl               | 200       |
    | cardsPublicationLoggersUrl   | 200       |
    | cardsConsultationLoggersUrl  | 200       |
    | externalDevicesLoggersUrl    | 200       |

