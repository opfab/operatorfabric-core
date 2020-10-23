Feature: Security

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def process = 'api_test'
    * def templateName = 'template'
    * def wrongTemplateName = '..%2Ftemplate'
    * def templateVersion = 2
    * def templateLanguage = 'en'


Scenario: Check template name with forbidden characters

    # Check template
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/' + templateName + '?locale=' + templateLanguage + '&version='+ templateVersion
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 200

    # Check template
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/' + wrongTemplateName + '?locale=' + templateLanguage + '&version='+ templateVersion
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 401
And print response
