db.archivedCards.aggregate([
  {
    $match: {
      publishDate: { $gte: ISODate("2023-01-01T00:00:00Z") } // Filter documents with startDate greater than or equal to 2023-01-01
    }
  },
  {
    $facet: {
      groupedData: [
        { $sort: { publishDate:-1 } }, 
        {
          $group: {
            _id: { process: "$process", processInstanceId: "$processInstanceId" }, 
            documents: {
              $push: {
                startDate: "$startDate",
                id: "$_id"
              }
            },
            count: { $sum: 1 } // Count the number of documents in each group
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            documents: { $slice: ["$documents", 1] } // Limit to 1 document per group
          }
        },
        { $limit: 5 }
      ],
      totalCount: [
        { $count: "count" } // Count the total number of groups
      ]
    }
  },
  {
    $addFields: {
      totalCount: { $arrayElemAt: ["$totalCount.count", 0] } // Extract the total count from the array
    }
  },
  { 
    $unwind: "$groupedData" // Unwind the groupedData array to process each group individually
  },
  { 
    $unwind: "$groupedData.documents" // Unwind the documents array to process each document individually
  },
  {
    $lookup: {
      from: "archivedCards", // Join with the same collection
      localField: "groupedData.documents.id", // Field from the input documents
      foreignField: "_id", // Field from the documents of the "joined" collection
      as: "documentDetails" // Output array field
    }
  },
  {
    $unwind: "$documentDetails" // Unwind the documentDetails array to get the document details
  },
  {
    $group: {
      _id: "$_id", // Group by the original _id
      totalCount: { $first: "$totalCount" }, // Preserve the totalCount
      groupedData: {
        $push: {
          _id: "$groupedData._id",
          count: "$groupedData.count",
          documents: {
            publishDate: "$documentDetails.publishDate",
            processInstanceId: "$documentDetails.processInstanceId",
            titleTranslated: "$documentDetails.titleTranslated",
            summaryTranslated: "$documentDetails.summaryTranslated",
            startDate: "$documentDetails.startDate",
            endDate: "$documentDetails.endDate"
          }
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      totalCount: 1,
      groupedData: 1
    }
  }
]).pretty()