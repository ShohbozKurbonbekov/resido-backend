import CommentService from "../models/Comment.service";
import { T } from "../libs/types/common";
import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { CommentInput } from "../libs/types/comment";
import { ExtendedRequest, User } from "../libs/types/user";
import { CommentDocs } from "../schema/Comment.model";

const commentController: T = {};
const commentService = new CommentService();

commentController.createComment = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createComment process");
    const input: CommentInput = req.body;
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

export default commentController;
