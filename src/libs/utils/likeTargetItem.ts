import { ObjectId } from "mongoose";
import { shapeIntoMongooseObjectId } from "../config";

const likeTargetItem = (id: undefined | ObjectId) => {
  return [
    {
      $lookup: {
        from: "likes",
        let: {
          targetId: "$_id",
          userId: shapeIntoMongooseObjectId(id),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$targetId", "$$targetId"],
                  },

                  {
                    $eq: ["$userId", "$$userId"],
                  },
                ],
              },
            },
          },
        ],
        as: "meLiked",
      },
    },
    {
      $addFields: {
        meLiked: {
          $cond: [{ $gt: [{ $size: "$meLiked" }, 0] }, true, false],
        },
      },
    },
  ];
};

export default likeTargetItem;
