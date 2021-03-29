Feature: get card Subscription

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken




* def getCard = 
    """
    function() {
        pastStartDate = new Date().valueOf() - 18*60*60*1000;
        pastEndDate = new Date().valueOf() - 14*60*60*1000;
        startDate = new Date().valueOf() + 4*60*60*1000;
        endDate = new Date().valueOf() + 8*60*60*1000;
        var card = {
          "publisher" : "api_test",
          "processVersion" : "1",
          "process"  :"api_test",
          "processInstanceId" : "process1",
          "state": "messageState",
          "groupRecipients": ["Dispatcher", "Planner"],
          "severity" : "ACTION",
          "startDate" : startDate,
          "endDate" : endDate,
          "summary" : {"key" : "message.summary"},
          "title" : {"key" : "question.title"},
          "data" : {"message":" Action Card"}
        }
        return JSON.stringify(card);
      }
    """
    * def card = call getCard 


    Scenario: get card subscription
      Given url opfabUrl + 'cards/cardSubscription' +'?clientId=abc0123456789def'
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then print response
      And status 200

    Scenario: Without authentication
      Given url opfabUrl + 'cards/cardSubscription'
      When method get
      Then print response
      And status 401

    Scenario: get card subscription with user operator1

    # Push card
      Given url opfabPublishCardUrl + 'cards'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      And header Content-Type = 'application/json'
      And request card
      When method post
      Then status 201
      And match response.count == 1

    # Get card uid
      Given url opfabUrl + 'cards/cards/api_test.process1'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And def cardUid = response.card.uid

    # Get subscription with past range and check that no card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&rangeStart='+ pastStartDate + '&rangeEnd=' + pastEndDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then print response
      And status 200
      And match response == ''

    # Get subscription and check that card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&rangeStart='+ startDate + '&rangeEnd=' + endDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then print response
      And status 200
      And match response contains '"card":{"uid":"' + cardUid + '"'

    # delete card
      Given url opfabPublishCardUrl + 'cards/api_test.process1'
      When method delete
      Then status 200

      
    # Get subscription and check that no card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&rangeStart='+ startDate + '&rangeEnd=' + endDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then print response
      And status 200
      And match response == ''
