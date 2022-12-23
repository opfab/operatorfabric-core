Feature: Security

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def process = 'api_test'
    * def templateName = 'template'
    * def hackTemplateName = '..%2Fconfig.json'
    * def hackTemplateName2 = '../config.json'
    * def templateVersion = 2


Scenario: Check no path traversal vulnerability 

    # Check template v1 
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/template?version=1'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 200
And match response != ""

# Check template v2 
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/template?version=2'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 200
And match response != ""


# Try to access version 1 file from version 2 via path traversal
# actual spring implementation returns a code 200 with no content when inserting ../ in url
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/../../1/templates/template?version=2'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 200
And match response == ""

# Try to access version 1 file from version 2 via path traversal
# actual spring implementation returns a code 200 with no content when inserting encoding / (%2F)  in url
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/..%2F..%2F/1/templates/template?version=2'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 200
And match response == ""

# Try to access unexisting template
Given url opfabUrl + '/businessconfig/processes/'+ process +'/templates/dummyTemplate?version=1'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method GET
Then status 404

