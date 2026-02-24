Feature: getUIMenu

  Background:
    # Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin' }
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr' }
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Push a UIMenu file
    Given url opfabUrl + '/businessconfig/uimenu'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/uimenu.json' }
    When method post
    Then status 201

  Scenario: List existing UIMenu as admin user
    Given url opfabUrl + '/businessconfig/uimenu'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And assert response.navigationBar.length > 0
    Then match response.navigationBar[0].opfabCoreMenuId == 'feed'
    Then match response.navigationBar[1].opfabCoreMenuId == 'archives'
    Then match response.navigationBar[2].opfabCoreMenuId == 'dashboard'
    And assert response.topRightIconMenus.length > 0
    Then match response.topRightIconMenus[0].opfabCoreMenuId == 'usercard'
    Then match response.topRightIconMenus[0].visible == true
    And assert response.topRightMenus.length > 0
    Then match response.topRightMenus[0].opfabCoreMenuId == 'admin'
    Then match response.topRightMenus[0].visible == true
    And assert response.locales.length == 3
    Then match response.locales[0].language == 'en'
    Then match response.locales[0].localizedContent.title.single == 'First menu'
    Then match response.locales[0].localizedContent.entry.single == 'Single menu entry'
    Then match response.locales[1].language == 'fr'
    Then match response.locales[1].localizedContent.title.single == 'Premier menu'
    Then match response.locales[1].localizedContent.entry.single == 'Unique élément'
    Then match response.locales[2].language == 'nl'
    Then match response.locales[2].localizedContent.title.single == 'Eerste menu'
    Then match response.locales[2].localizedContent.entry.single == 'Enkel menu-item'


  Scenario: List existing UIMenu as non-admin user
    Given url opfabUrl + '/businessconfig/uimenu'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.navigationBar.length > 0
    And assert response.topRightIconMenus.length > 0
    And assert response.topRightMenus.length > 0
    And assert response.locales.length == 3

  Scenario: List existing UIMenu without authentication
    Given url opfabUrl + '/businessconfig/uimenu'
    When method GET
    Then status 401
