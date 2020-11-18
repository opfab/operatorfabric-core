Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post 6 Cards (2 INFORMATION, 1 COMPLIANT, 1 ACTION, 2 ALARM)


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;
	  endDate = new Date().valueOf() + 8*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process1",
			"state": "messageState",
			"tags":["tag1"],
			"groupRecipients": ["Dispatcher"],
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "message.title"},
			"data" : {"message":" Information card number 1"},
			"timeSpans" : [
				{"start" : startDate},
				{"start" : endDate}
				]
		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 



Given url opfabPublishCardUrl + 'cards' 

And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1





# Push a second information card 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

	  startDateTimeSpans = new Date().valueOf() + 2*60*60*1000;
	  endDateTimeSpans = new Date().valueOf() +   5*30*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process2",
			"state": "chartState",
			"tags" : ["tag2"],
			"groupRecipients": ["Dispatcher"],
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "chartDetail.title"},
			"data" : {"values":[12, 19, 3, 5, 2, 3]},
			"timeSpans" : [
				{"start" : startDateTimeSpans,"end" : endDateTimeSpans}
				]
		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 


Given url opfabPublishCardUrl + 'cards' 

And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1


# Push a compliant card 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  
	  startDateTimeSpans1 = new Date().valueOf() + 12*60*60*1000;
	  endDateTimeSpans1 = new Date().valueOf() + 13*60*60*1000;

	  startDateTimeSpans2 = new Date().valueOf() + 48*60*60*1000;
	  endDateTimeSpans2 = new Date().valueOf() + 49*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process3",
			"state": "processState",
			"tags":["tag1", "tag2"],
			"groupRecipients": ["Dispatcher"],
			"severity" : "COMPLIANT",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "processState.title"},
			"data" : {"state":"calcul1","stateName":"CALCUL1"},
			"timeSpans" : [
				{"start" : startDateTimeSpans1,"end" : endDateTimeSpans1},
				{"start" : startDateTimeSpans2,"end" : endDateTimeSpans2 }
				]
		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 


Given url opfabPublishCardUrl + 'cards' 
And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1


# Push a question card 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  lttdDate = new Date().valueOf() + 60*1000*3;
	  endDate = new Date().valueOf() + 8*60*60*1000;

		var card = {
			"publisher" : "processAction",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process4",
			"state": "questionState",
			"groupRecipients": ["Dispatcher", "Planner"],
			"entitiesAllowedToRespond": ["ENTITY1","ENTITY2"],
			"severity" : "ACTION",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "question.title"},
			"data" : {"message":" Action Card"},
			"lttd" : lttdDate,
			"timeSpans" : [
				{"start" : startDate ,"end" : endDate}
				]
		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 
 
Given url opfabPublishCardUrl + 'cards' 
And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1

# Push an alarm card

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 1*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process5",
			"state": "chartLineState",
			"groupRecipients": ["Dispatcher", "Planner"],
			"severity" : "ALARM",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "chartLine.title"},
			"data" : {"values":[10000, 11000, 30000, 45000, 30000, 35000,10000]}
		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 

Given url opfabPublishCardUrl + 'cards' 
And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1

# Push an second  alarm card later 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;
	  lttdDate = new Date().valueOf() + 60*1000*61;
	  startDateTimeSpans = new Date().valueOf() + 24*60*60*1000;
	  endDateTimeSpans = new Date().valueOf() + 26*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process6",
			"state": "contingenciesState",
			"userRecipients": ["operator1"],
			"severity" : "ALARM",
			"startDate" : startDate,
			"lttd" : lttdDate,
			"timeSpans" : [
				{"start" : startDateTimeSpans ,"end" : endDateTimeSpans}
				],
			"summary" : {"key" : "contingencies.summary"},
			"title" : {"key" : "contingencies.title"},
			"data" : 
		{
            "detail": null,
            "networkContingencies": [
                {
                    "detail": null,"name": ".ASPHL71SIERE",
                    "networkLimitViolations": [
                        {
							"detail":{"acceptableDuration":"60","cDisplayExists":"true","constraintDisplayLabel":"Surcharge1'","limitType":"CURRENT"},
                            "name": ".EICHL71MUHLB",
                            "networkContexts": [
								{"date":1580167800000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580171400000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580175000000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580178600000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580182200000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580185800000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580189400000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}}
                            ],
                            "values": [
								{},{},{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2850.0","preValue":"2483.967041015625","preValueMw":"1736.8333740234375","sideValue":"TWO","value":"2943.1044921875","valueMw":"2064.444580078125"},"value":"103%20'"},
								{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge1'","limit":"3000.0","preValue":"2755.424560546875","preValueMw":"1924.5638427734375","sideValue":"TWO","value":"3264.133544921875","valueMw":"2280.184814453125"},"value":"109%1'"},
								{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge1'","limit":"3000.0","preValue":"2876.2236328125","preValueMw":"1991.7191162109375","sideValue":"TWO","value":"3404.917236328125","valueMw":"2357.58154296875"},"value":"113%1'"},
								{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge1'","limit":"3000.0","preValue":"2603.79296875","preValueMw":"1820.97509765625","sideValue":"TWO","value":"3082.24169921875","valueMw":"2155.914794921875"},"value":"103%1'"},
								{}
                            ]
                        },
                        {
							"detail":{"acceptableDuration":"60","cDisplayExists":"true","constraintDisplayLabel":"Surcharge1'","limitType":"CURRENT"},
                            "name": ".LAUFL71SIERE",
                            "values": [
								{},{},{},{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge1'","limit":"2105.0","preValue":"1487.165771484375","preValueMw":"1030.4757080078125","sideValue":"TWO","value":"2138.459228515625","valueMw":"1478.4754638671875"},"value":"102%1'"},
								{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge1'","limit":"2105.0","preValue":"1540.552978515625","preValueMw":"1057.718017578125","sideValue":"TWO","value":"2215.884033203125","valueMw":"1517.965087890625"},"value":"105%1'"},
								{"detail":{"acceptableDurationValue":"60","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2000.00048828125","preValue":"1396.576171875","preValueMw":"967.2131958007812","sideValue":"TWO","value":"2010.927001953125","valueMw":"1391.023193359375"},"value":"101%20'"},
								{}
                            ]
                        },
                        {
							"detail":{"acceptableDuration":"1200","cDisplayExists":"true","constraintDisplayLabel":"Surcharge20'","limitType":"CURRENT"},
                            "name": ".RODPL71ALBER",
                            "values": [
								{},{},{},{"detail":{"acceptableDurationValue":"1200","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2370.0","preValue":"2352.67236328125","preValueMw":"1490.8565673828125","sideValue":"TWO","value":"2376.933349609375","valueMw":"1501.7509765625"},"value":"100%"},
								{},{},{}
                            ]
                        },
                        {
							"detail":{"acceptableDuration":"1200","cDisplayExists":"true","constraintDisplayLabel":"Surcharge20'","limitType":"CURRENT"},
                            "name": ".RODPL72ALBER",
                            "values": [
                                {}, {},{},{"detail":{"acceptableDurationValue":"1200","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2370.0","preValue":"2353.75927734375","preValueMw":"1491.551513671875","sideValue":"TWO","value":"2378.0302734375","valueMw":"1502.4510498046875"},"value":"100%"},
                                {},{}, {}
                            ]
                        }
                    ], "networkRemedials": []
                },
                {
                    "detail": null,"name": ".AVEL 7 .HORT 2",
                    "networkLimitViolations": [
                        {
							"detail":{"acceptableDuration":"1200","cDisplayExists":"true","constraintDisplayLabel":"Surcharge20'","limitType":"CURRENT"},
                            "name": ".AVELL72AVELI",
                            "networkContexts": [
								{"date":1580167800000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580171400000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580175000000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580178600000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580182200000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580185800000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580189400000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}}
                            ],
                            "values": [
                                {},{},{},{"detail":{"acceptableDurationValue":"1200","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2652.0","preValue":"2165.0419921875","preValueMw":"1512.98095703125","sideValue":"TWO","value":"2691.4501953125","valueMw":"1876.2672119140625"},"value":"101%"},
                                {},{},{}
                            ]
                        }
                    ], "networkRemedials": []
                },
                {
                    "detail": null, "name": ".AVELL71MASTA",
                    "networkLimitViolations": [
                        {
							"detail":{"acceptableDuration":"1200","cDisplayExists":"true","constraintDisplayLabel":"Surcharge20'","limitType":"CURRENT"},
                            "name": ".AVELL72AVELI",
                            "networkContexts": [
								{"date":1580167800000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580171400000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580175000000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580178600000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580182200000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580185800000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}},
								{"date":1580189400000,"detail":{"computationDate":1580116500000,"type":"srj-jm1"}}
                            ],
                            "values": [
								{},{},{"detail":{"acceptableDurationValue":"1200","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2652.0","preValue":"1875.450439453125","preValueMw":"1312.4620361328125","sideValue":"TWO","value":"2745.7265625","valueMw":"1912.616455078125"},"value":"104%"},
								{"detail":{"acceptableDurationValue":"1200","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2652.0","preValue":"2165.0419921875","preValueMw":"1512.98095703125","sideValue":"TWO","value":"3160.505859375","valueMw":"2191.774658203125"},"value":"119%"},
								{"detail":{"acceptableDurationValue":"1200","cDisplayExistsValue":"true","displayLabelValue":"Surcharge20'","limit":"2652.0","preValue":"1993.36279296875","preValueMw":"1394.3531494140625","sideValue":"TWO","value":"2898.87744140625","valueMw":"2016.7802734375"},"value":"109%"},
								{},{}
                            ]
                        }
                    ],
                    "networkRemedials": []
                }
				
				
				]
			}

		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 



Given url opfabPublishCardUrl + 'cards' 
And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1

