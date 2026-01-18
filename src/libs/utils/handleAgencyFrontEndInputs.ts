import { AgencyAggregate, AgencyInputs } from "../types/agency";
import { T } from "../types/common";

export const handleAgencyFrontEndInput = (body: Partial<AgencyAggregate>) => {
  const queries: Partial<AgencyAggregate> = {};

  if (body.memberName) {
    queries.memberName = body.memberName;
  }

  if (body.memberEmail) {
    queries.memberEmail = body.memberEmail;
  }

  if (body.memberPhone) {
    queries.memberPhone = body.memberPhone;
  }

  if (body.yearOfExperience) {
    const exNum = Number(body.yearOfExperience);
    queries.yearOfExperience = Number.isFinite(exNum) ? exNum : 0;
  }

  if (body.address) {
    queries.address = body.address;
  }

  if (body.agencyOwner) {
    queries.agencyOwner = body.agencyOwner;
  }

  if (body.registrationNumber) {
    queries.registrationNumber = body.registrationNumber;
  }

  if (body.licenseNumber) {
    queries.licenseNumber = body.licenseNumber;
  }

  if (body.bioInfo) {
    queries.bioInfo = body.bioInfo;
  }

  return queries;
};
