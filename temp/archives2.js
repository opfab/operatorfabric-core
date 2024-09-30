var startTime = new Date();db.archivedCards.aggregate([
    {
        $match: {
            publishDate: {$gte: ISODate('2023-01-01T00:00:00Z')} // Filter documents with startDate greater than or equal to 2023-01-01
        }
    },
    {
        $project: {
            process: 1,
            processInstanceId: 1,
            publishDate: 1
        }
    },
    {
        $sort: {
            publishDate: -1
        }
    },
    {
        $group: {
            _id: {process: '$process', processInstanceId: '$processInstanceId'},
            documents: {
                $push: {
                    publishDate: '$publishDate',
                    id: '$_id'
                }
            },
            count: {$sum: 1} // Count the number of documents in each group
        }
    },
    {
        $project: {
            _id: 1,
            count: 1,
            documents: {$slice: ['$documents', 1]} // Limit to 1 document per group
        }
    },
    {
        $sort: {
            'documents.publishDate': -1
        }
    },
    {
        $facet: {
            cards: [
                {
                    $skip: 5000 // Skip the first 5 documents
                },
                {
                    $limit: 10 // Limit the result to the next 5 documents
                },
                {
                    $project: {
                        numberOfVersions: '$count',
                        publishDate: '$documents.publishDate',
                        _id: '$documents.id'
                    }
                },
                {
                    $unwind: '$_id'
                },
                {
                    $unwind: '$publishDate'
                },
                {
                    $lookup: {
                        from: 'archivedCards',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'firstCardDetails'
                    }
                },
                {
                    $unwind: '$firstCardDetails'
                },
                {
                    $project: {
                        _id: 0, //Exclude the id field
                        numberOfVersions: 1,
                        'firstCardDetails._id': 1,
                        'firstCardDetails.titleTranslated': 1,
                        'firstCardDetails.summaryTranslated': 1,
                        'firstCardDetails.publishDate': 1,
                        'firstCardDetails.process': 1,
                        'firstCardDetails.entityRecipients': 1
                    }
                }
            ],
            totalCount: [
                {
                    $count: 'count'
                }
            ]
        }
    },
    {
        $unwind: '$totalCount'
    },
    {
        $project: {
            pageNumber : '2',
            total: '$totalCount.count',
            cards: 1
        }
    }
]).toArray(); var endTime = new Date(); var executionTime = endTime - startTime;
print('Execution time: ' + executionTime + ' ms');