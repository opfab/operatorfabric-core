Feature: Security

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def process = 'api_test'
    * def templateName = 'template'
    * def wrongTemplateName = '..%2Ftemplate'
    * def templateVersion = 2


Scenario: Check template name with forbidden characters

    # Check template
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/' + templateName + '?version='+ templateVersion
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 200

    # Check template
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/' + wrongTemplateName + '?version='+ templateVersion
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 401
