import mongoose, { ObjectId } from "mongoose";
import AgencySubscriptionModel, {
  AgencySubscriptionResult,
} from "../schema/AgencySubscription.model";
import AgencyModel from "../schema/members/Agency.model";
import {
  AgencyPaymentInfoInputs,
  RequiredSubscribeInputs,
} from "../libs/types/agency";
import { MemberStatus } from "../libs/enums/member.enum";
import {
  AgencyStatus,
  PaymentProvider,
  SubscriptionStatus,
} from "../libs/enums/agency.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import TarrifModel, { Tarrif } from "../schema/Tarrif.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { BillingCycle, TarrifStatus } from "../libs/enums/payment.enum";
import UserModel from "../schema/members/User.model";
import { CommonUsers, T } from "../libs/types/common";

class AgencySubscribeService {
  public readonly agencySubscribeModel;
  private readonly agencyModel;
  private readonly tariffModel;
  private readonly userModel;

  constructor() {
    this.agencySubscribeModel = AgencySubscriptionModel;
    this.agencyModel = AgencyModel;
    this.tariffModel = TarrifModel;
    this.userModel = UserModel;
  }

  /////////////////////////////////////// CREATE SUNSCRIPTION ////////////////////////
  public async createSubscription(
    input: AgencyPaymentInfoInputs,
    userId: ObjectId,
  ) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const currentSession = { session };

      //1 - transaction
      const tariffPlan = await this.tariffModel.findOne(
        {
          _id: shapeIntoMongooseObjectId(input.billingTariffId!),
          status: TarrifStatus.ACTIVE,
        },
        null,
        currentSession,
      );
      if (!tariffPlan) {
        throw new Errors(HttpCode.NOT_FOUND, Message.TARIFF_NOT_ACTIVE);
      }

      // Transaction 2
      const agencyAvailable = await this.agencyModel.findOne(
        {
          userId,
          memberStatus: MemberStatus.ACTIVE,
          currentStatus: AgencyStatus.PAYMENT,
        },
        {
          _id: 1,
          userId: 1,
        },
        currentSession,
      );

      if (!agencyAvailable) {
        throw new Errors(HttpCode.FORBIDDEN, Message.PAYMENT_NOT_ALLOWED);
      }

      // 3 - transaction
      const entityFields = this.organiseSubscribeInputs(input, tariffPlan);
      await this.agencySubscribeModel.create(
        [
          {
            ...entityFields,
            agencyId: agencyAvailable._id,
            billingTariffId: tariffPlan._id,
          },
        ],
        currentSession,
      );

      // 4 - transaction
      const user = await this.userModel.findOneAndUpdate(
        { _id: userId, memberStatus: MemberStatus.ACTIVE },
        {
          $set: {
            agencyMode: true,
          },
        },
        {
          new: true,
          ...currentSession,
        },
      );

      if (!user) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_FOUND);
      }

      // 5 - tranaction
      const agency = await this.agencyModel.findOneAndUpdate(
        {
          _id: agencyAvailable._id,
          currentStatus: AgencyStatus.PAYMENT,
        },
        {
          $set: {
            currentStatus: AgencyStatus.AVAILABLE,
            isVerified: true,
          },
        },
        {
          new: true,
          ...currentSession,
        },
      );

      if (!agency) {
        throw new Errors(HttpCode.NOT_FOUND, Message.AGENCY_NOT_ACTIVE);
      }

      await session.commitTransaction();
      return agency;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Errors) {
        throw error;
      } else {
        console.log("⛔ERROR: ", error);
        throw new Errors(HttpCode.BAD_REQUEST, Message.PAYMENT_FAILED);
      }
    } finally {
      session.endSession();
    }
  }

  ///////////////////////////////////// GET SUBSCRIPTION ///////////////////////////////////
  public async getSubscriptionInfo(
    agencyMember: CommonUsers,
  ): Promise<AgencySubscriptionResult> {
    const agencyId = shapeIntoMongooseObjectId(agencyMember._id);
    const agencyValidMatch: T = {
      _id: agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
      isValid: true,
    };

    const isSubscribedMatch: T = {
      agencyId,
      subscriptionStatus: {
        $ne: SubscriptionStatus.INACTIVE,
      },
    };
    const isAgencyValid = await this.agencyModel
      .findOne(agencyValidMatch)
      .lean()
      .exec();

    if (!isAgencyValid) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    const isAgencySubscribed = await this.agencySubscribeModel
      .findOne(isSubscribedMatch)
      .lean()
      .exec();

    if (!isAgencySubscribed) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_ACTIVE_SUBSCRIPTION);
    }

    return isAgencySubscribed;
  }

  ///////////////////////////////////// RENEW SUBSCRIPTION ///////////////////////////////////
  public async renewSubscription() {}

  ///////////////////////////////////// CANCEL SUBSCRIPTION ///////////////////////////////////

  public async cancelSubscription() {}

  ////////////////////////////// HELPER FUNCTIONS ////////////////
  private addMonths(date: Date, month: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + month);
    return d;
  }

  /////////////////// ORGANIZE INPUTS //////////////
  private organiseSubscribeInputs(
    input: AgencyPaymentInfoInputs,
    tariffPlan: Tarrif,
  ) {
    const now = new Date();
    const tariffType: number =
      tariffPlan.billingCycle === BillingCycle.MONTHLY ? 1 : 12;
    const timeEnd = this.addMonths(now, tariffType);
    const entityInput: RequiredSubscribeInputs = {
      amount: Number(tariffPlan.price),
      billingCity: input.billingCity.trim(),
      billingCountry: input.billingCountry.trim(),
      billingEmail: input.billingEmail.trim(),
      billingName: input.billingName.trim(),
      billingPostalCode: input.billingPostalCode,
      billingCyle: tariffPlan.billingCycle,
      billingSnapshot: {
        features: tariffPlan.features,
        limit: tariffPlan.limits,
        name: tariffPlan.name,
      },

      cancelledAt: null,
      currency: tariffPlan.currency,
      currentPeriodEnd: timeEnd,
      currentPeriodStart: now,
      lastPaymentAt: now,
      nextPaymentAt: timeEnd,
      paymentProvider: PaymentProvider.MANUAL,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    };
    return entityInput;
  }
}
export default AgencySubscribeService;
