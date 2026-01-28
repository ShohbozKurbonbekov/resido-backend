export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIELD = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  CONFLICT = 409,
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
  NO_MEMBER = "No member found",
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
  ONLY_USER_DELETE_COMMENT = "Only common users are allowed  to delete their comments",
  DELETING_FAILED = "Deleting failed",
  EXPIRED_TIME = "Given time expired!",
  USER_PAGE = "Sorry, Only common users are allowed to request to this page",
  INVALID_SOCIALS = "Invalid social networks data",
  AGENT_EXISTS = "Agent application already exists",
  AGENCY_EXISTS = "Agency application already exists",

  AGENT_NOT_ACTIVE = "Agent mode active but agent not available",
  AGENCY_NOT_ACTIVE = "Agency mode active but agency not available",
  INVALID_BLOG_TAGS = "Invalid blog tags",
  ONLY_AGENTS = "Only agents are allowed here",
  NO_ADDDRESS_GEO = "Address could not be geocoded",
  INVALID_GEO = "Invalid geocoding result",
  PAYMENT_NOT_ALLOWED = "Payment is not allowed for the current application state.",
  PAYMENT_FAILED = "Payment process failed!, Please try later",
  TARRIF_EXIST = "Tarrif already exists!",
  ADMIN_ONLY = "Admin page!",
  AGENCY_ONLY = "Private agency page!",
  INVALID_CURRENCY = "Invalid Currency Name!",

  NO_ACTIVE_SUBSCRIPTION = "No active subscription found!",
  SUBSCRIPTION_EXIST = "Subscription already exists!",

  TARIFF_NOT_ACTIVE = "No active tariff found!",
  INVALID_INPUT = "Invalid input provided!",

  APPLICATION_ALREADY_EXISTS = "Application already exists!",

  APPLICATION_NOT_FOUND = "Application not found!",
  NOTIFICATION_ALREADY_SENT = "Notification already sent, Please wait!",
  NOTIFICATION_NOT_FOUND = "Notification not found!",
  APPLICATION_APPROVE_FAILED = "Application approving failed",
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
