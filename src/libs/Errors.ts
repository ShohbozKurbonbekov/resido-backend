export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIELD = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong",
  NO_DATA_FOUND = "No data is found",
  CREATING_FAILED = "Creating is failed!",
  UPDATING_FAILED = "Updating is failed!",
  TOKEN_CREATION_FAILED = "Token creation error!",
  NO_USERNAME = "No user found with that username",
  BLOCKED_USER = "You have been blocked, Please contact the admin",
  USED_USERNAME_PHONE_PASSWORD = "Oops, Something wrong with your either username or email, at least check you have strong password",
  WRONG_PASSWORD = "Wrong password, Please try again",
  NOT_AUTHENTICATED = "You are not authenticated, Please Login First",
  NO_MEMBER = "No member with that email",
  INVALID_ROLE = "you are not allowed to request this role",
  NO_MESSAGE_TO_MEMBER = "Sorry, you can not write a message to invalid member",
  ONLY_USERS = "Sorry, only common users are allowed to like it",
  ONLY_USERS_SAVE = "Sorry, only common users are allowed to save it",
  ONLY_USERS_SAVE_SEE = "Sorry, only common users are allowed to see saved ones",
  ONLY_USERS_FOLLOW = "Only common users are allowed to follow an agent",
  ONLY_AGENCY_ADMIN_AGENT = "Only Admin, Agency or Agent are authorized to post a blog",
  NO_MEMBER_FOUND = "No member is found",
  ALLOW_USER_COMMENT = "Only common users are allowed to write a comment",
  PROPERTY_CREATE_AGENTS = "Only agents are authorized to create a property",
  PROPERTY_UPDATE_AGENTS = "Only agents are authorized to update a property",
  NO_COMMENT_TYPE = "No such comment type registered",
  NO_PROPERTIES_DELETE = "No property found to delete!",
  ONLY_USER_SEE_COMMENTS = "Sorry, only users are allowed to see their comments",
  ONLY_USER_UPDATE_COMMENT = "Only common users are allowed  to update their comments",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;
  static standart: {
    code: HttpCode.INTERNAL_SERVER_ERROR;
    message: Message.SOMETHING_WENT_WRONG;
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    this.code = statusCode;
    this.message = statusMessage;
  }
}

export default Errors;
