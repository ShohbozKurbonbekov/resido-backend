import { ObjectId } from "mongoose";

const generateMeSavedKey = (id: ObjectId) => {
  return [
    {
      $lookup: {
        from: "usersavings",
        let: {
          itemId: "$_id",
          userId: id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$targetId", "$$itemId"],
                  },
                  {
                    $eq: ["$userId", "$$userId"],
                  },
                ],
              },
            },
          },
        ],
        as: "savedArr",
      },
    },
    {
      $addFields: {
        meSaved: {
          $cond: [{ $gt: [{ $size: "$savedArr" }, 0] }, true, false],
        },
      },
    },
  ];
};

export default generateMeSavedKey;
