export enum AgentApplicationStatus {
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ApplicationStatusMessage {
  APPROVED_MESSAGE = "You got approved. Press OK to confirm and re-login to activate your agent account.",
  REJECTED_MESSAGE = "Sorry, you got the rejection, we found some incompetence in your data",
  AGENCY_APPROVED_MESSAGE = "Your application has been approved. To complete the verification process and activate your agency account, you will now be redirected to our secure payment system.Once the payment is successfully completed, your account will move to the next verification stage.",
}
