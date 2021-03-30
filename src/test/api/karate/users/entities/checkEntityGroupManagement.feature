Feature: CheckEntityGroupManagement

    Background:
    #Getting token for admin
    * def signIn = callonce read('../../common/getToken.feature') {username: 'admin' }
    * def adminAuthToken = signIn.authToken
    # entity definition
    * def entity0_With1UnknownParent =
"""
{
  "id" : "entity0-groupTest",
  "name" : "Entity number 0",
  "description" : "For group test purpose, have unknown entity as parents",
  "parents" : ["unknownEntity0-groupTest","unknownEntity1-groupTest"]
}
"""
    * def entity1_RefToEntity0 =
"""
{
"id" : "entity1-groupTest",
"name" : "Entity number 1",
"description" : "For group test purpose, references 'Entity number 0' as parent",
"parents" : ["entity0-groupTest"]
}
"""
    * def entity2_RefToEntity4 =
"""
{
"id" : "entity2-groupTest",
"name" : "Entity number 2",
"description" : "For group test purpose, references 'Entity number 4' as parent ",
"parents" : ["entity4-groupTest"]
}
"""
    * def entity3_RefToEntity2 =
"""
{
"id" : "entity3-groupTest",
"name" : "Entity number 3",
"description" : "For group test purpose",
"parents" : ["entity2-groupTest"]
}
"""
    * def entity4_Version_RefToItSelf =
"""
{
"id" : "entity4-groupTest",
"name" : "Entity number 4",
"description" : "For group test purpose",
"parents" : ["entity4-groupTest"]
}
"""
    * def entity4_Version_RefToEntity2 =
  """
{
"id" : "entity4-groupTest",
"name" : "Entity number 4",
"description" : "For group test purpose",
"parents" : ["entity2-groupTest"]
}
"""
    * def entity4_Version_RefToEntity3 =
"""
{
"id" : "entity4-groupTest",
"name" : "Entity number 4",
"description" : "For group test purpose",
"parents" : ["entity3-groupTest"]
}
"""
    * def entity4_Version_RefToEntity1 =
"""
{
"id" : "entity4-groupTest",
"name" : "Entity number 4",
"description" : "For group test purpose",
"parents" : ["entity1-groupTest"]
}
"""


    Scenario Outline: Handle entity groups

# Initialize Entity Collection before testing Cycle
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + adminAuthToken
    And request <entity>
    When method post
    Then status <expected>

    Examples:
    | entity                        | expected  |
    | entity0_With1UnknownParent    | 201       |
    | entity1_RefToEntity0          | 201       |
    | entity2_RefToEntity4          | 201       |
    | entity3_RefToEntity2          | 201       |

        # Chech the correct detection of cycle
    Scenario Outline: Adding entities with parents declaration results to a cycle detection

        Given url opfabUrl + 'users/entities'
        And header Authorization = 'Bearer ' + adminAuthToken
        And request <entity>
        When method post
        Then status 400
        Then match response.message == 'A cycle has been detected: ' + <expectedMessage>

    Examples:
        | entity                            | expectedMessage                                                               |
        | entity4_Version_RefToItSelf       | 'entity4-groupTest->entity4-groupTest'                                        |
        | entity4_Version_RefToEntity2      | 'entity4-groupTest->entity2-groupTest->entity4-groupTest'                     |
        | entity4_Version_RefToEntity3      | 'entity4-groupTest->entity3-groupTest->entity2-groupTest->entity4-groupTest'  |

    Scenario: Add entity with previous tested Id without any cycle in parents

        Given url opfabUrl + 'users/entities'
        And header Authorization = 'Bearer ' + adminAuthToken
        And request entity4_Version_RefToEntity1
        When method post
        Then status 201

    Scenario: Delte entity referenced by another entity

        Given url opfabUrl + 'users/entities/entity1-groupTest'
        And header Authorization = 'Bearer ' + adminAuthToken
        When method delete
        Then status 200

    # Chech that reference to parent entity is removed fron child
        Given url opfabUrl + 'users/entities/entity4-groupTest'
        And header Authorization = 'Bearer ' + adminAuthToken
        When method get
        Then status 200
        And match response.parents == []

    Scenario Outline: Clean entity test collection from the previous added entities in this feature

        Given url opfabUrl + 'users/entities/' + <entityId>
        And header Authorization = 'Bearer ' + adminAuthToken
        When method delete
        Then status <expectedStatus>

        Examples:
            | entityId            | expectedStatus  |
            | 'entity0-groupTest' |       200       |
            | 'entity2-groupTest' |       200       |
            | 'entity3-groupTest' |       200       |
            | 'entity4-groupTest' |       200       |
