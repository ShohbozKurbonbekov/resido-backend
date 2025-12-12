import CommentService from "../models/Comment.service";
import { CommonPageInput, T } from "../libs/types/common";
import { Response, Request } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import {
  CommentInput,
  CommentUpdate,
  ItemComments,
} from "../libs/types/comment";
import { ExtendedRequest, User } from "../libs/types/user";
import { CommentDocs } from "../schema/Comment.model";
import { shapeIntoMongooseObjectId } from "../libs/config";

const commentController: T = {};
const commentService = new CommentService();

//////////////// ----------- CREATE A COMMENT ------------////////////////////////////
commentController.createComment = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createComment process");
    const input = <CommentInput>req.body;
    const user = req.member;
    const result: CommentDocs = await commentService.createComment(input, user);
    res.status(HttpCode.CREATED).json(result);
  } catch (error) {
    console.log("Error in creating comment process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// GET LATEST COMMENTS -------------////////////////
commentController.getLatestComments = async (req: Request, res: Response) => {
  try {
    console.log("getLatestComments");
    const result = await commentService.getLatestComments();
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getLatestComment: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////////--- GET COMMENTS ---///////////////////
commentController.getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemId = shapeIntoMongooseObjectId(id);
    const { page, limit, commentTarget } = req.body;
    const input: ItemComments = {
      page: Number(page),
      limit: Number(limit),
      commentTarget,
    };

    const result = await commentService.getComments(itemId, input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getComments", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////////--- GET USER ALL COMMENTS ---///////////////////
commentController.getUserComments = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    const input: CommonPageInput = req.body;
    const query = {
      page: Number(input.page) || 1,
      limit: Number(input.limit) || 4,
    };
    const userId = shapeIntoMongooseObjectId(req.member?._id);

    const result = await commentService.getUserComments(userId, query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getUserComments", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////////--- UPDATE USER  COMMENTS ---///////////////////
commentController.updateUserComments = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    const { targetId } = req.params;
    const input: CommentUpdate = req.body;
    const userId = shapeIntoMongooseObjectId(req.member?._id);
    const query: T = {
      userId,
      _id: shapeIntoMongooseObjectId(targetId),
    };
    const result = await commentService.updateUserComments(query, input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in updateUserComments", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default commentController;
