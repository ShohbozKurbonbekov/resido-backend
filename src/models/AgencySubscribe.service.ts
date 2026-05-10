import mongoose, { ObjectId } from "mongoose";
import AgencySubscriptionModel, {
  AgencySubscriptionResult,
} from "../schema/AgencySubscription.model";
import AgencyModel, { Agency } from "../schema/members/Agency.model";
import {
  AgencyPaymentInfoInputs,
  AgencySubscriptionInfoType,
  RenewSubscriptionInput,
  RequiredSubscribeInputs,
  SubscriptionRenewType,
} from "../libs/types/agency";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import {
  AgencyStatus,
  PaymentProvider,
  SubscriptionStatus,
} from "../libs/enums/agency.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import {
  BillingCycle,
  SubscriptionMode,
  TariffStatus,
} from "../libs/enums/payment.enum";
import UserModel from "../schema/members/User.model";
import { CommonUsers, T } from "../libs/types/common";
import TariffModel, { Tariff } from "../schema/Tariff.model";

class AgencySubscribeService {
  public readonly agencySubscribeModel;
  private readonly agencyModel;
  private readonly tariffModel;
  private readonly userModel;

  constructor() {
    this.agencySubscribeModel = AgencySubscriptionModel;
    this.agencyModel = AgencyModel;
    this.tariffModel = TariffModel;
    this.userModel = UserModel;
  }

  // Check subscription status

  static async checkSubscriptionStatus() {
    try {
      const now = new Date();

      const expiredSubscriptions = await AgencySubscriptionModel.updateMany(
        {
          subscriptionStatus: SubscriptionStatus.ACTIVE,

          currentPeriodEnd: {
            $lt: now,
          },
        },
        {
          $set: {
            subscriptionStatus: SubscriptionStatus.EXPIRED,
          },
        },
      );

      console.log(
        `Expired subscription updated: , ${expiredSubscriptions.modifiedCount}`,
      );
    } catch (error) {
      console.log("Error in checkSubsriptionStatus: ", error);
    }
  }

  /////////////////////////////////////// CREATE SUBSCRIPTION ////////////////////////
  public async createSubscription(
    input: AgencyPaymentInfoInputs,
    userId: ObjectId,
    mode: SubscriptionMode,
  ): Promise<Agency | AgencySubscriptionResult> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const currentSession = { session };

      //1 - transaction
      const tariffPlan = await this.tariffModel.findOne(
        {
          _id: shapeIntoMongooseObjectId(input.billingTariffId!),
          status: TariffStatus.ACTIVE,
        },
        null,
        currentSession,
      );

      if (!tariffPlan) {
        throw new Errors(HttpCode.NOT_FOUND, Message.TARIFF_NOT_ACTIVE);
      }

      // Transaction 2
      let agencyAvailable;

      switch (mode) {
        case SubscriptionMode.FIRST_SUBSCRIBE:
          agencyAvailable = await this.agencyModel.findOne(
            {
              userId,
              memberStatus: MemberStatus.ACTIVE,
              currentStatus: AgencyStatus.PAYMENT,
            },
            null,
            currentSession,
          );
          break;

        default:
          agencyAvailable = await this.agencyModel.findOne(
            {
              _id: userId,
              memberStatus: MemberStatus.ACTIVE,
              currentStatus: AgencyStatus.AVAILABLE,
            },
            null,
            currentSession,
          );
          break;
      }

      if (!agencyAvailable) {
        throw new Errors(HttpCode.FORBIDDEN, Message.PAYMENT_NOT_ALLOWED);
      }

      // 3 - transaction
      const entityFields = this.organiseSubscribeInputs(input, tariffPlan);

      const subscriptionAvailable = await this.agencySubscribeModel.findOne(
        {
          agencyId: agencyAvailable._id,
          subscriptionStatus: {
            $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.INACTIVE],
          },
        },
        null,
        currentSession,
      );

      if (subscriptionAvailable) {
        throw new Errors(HttpCode.CONFLICT, Message.SUBSCRIPTION_EXIST);
      }

      const subscription = await this.agencySubscribeModel.create(
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
      if (mode === SubscriptionMode.FIRST_SUBSCRIBE) {
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
      }

      let result;
      // 5 - tranaction
      if (mode === SubscriptionMode.FIRST_SUBSCRIBE) {
        const agency = await this.agencyModel.findOneAndUpdate(
          {
            _id: agencyAvailable._id,
            currentStatus: AgencyStatus.PAYMENT,
            memberStatus: MemberStatus.ACTIVE,
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

        result = agency;
      } else {
        result = subscription[0];
      }

      await session.commitTransaction();
      return result;
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
  ): Promise<AgencySubscriptionInfoType> {
    const agencyId = shapeIntoMongooseObjectId(agencyMember._id);

    // Match quries
    const agencyValidMatch: T = {
      _id: agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
      isVerified: true,
    };

    const isSubscribedMatch: T = {
      agencyId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      cancelledAt: null,
    };

    const isAgencyValid = await this.agencyModel
      .findOne(agencyValidMatch)
      .lean()
      .exec();

    if (!isAgencyValid) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    const isAgencySubscribed = await this.agencySubscribeModel
      .findOne(isSubscribedMatch, null, { new: true })
      .lean()
      .exec();

    if (!isAgencySubscribed) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_ACTIVE_SUBSCRIPTION);
    }

    const tariffPlans = await this.tariffModel.aggregate([
      {
        $match: {
          status: TariffStatus.ACTIVE,
        },
      },
      {
        $sort: { price: 1 },
      },
    ]);

    return { tariffPlans, agencySubscription: isAgencySubscribed };
  }

  ///////////////////////////////////// RENEW SUBSCRIPTION ///////////////////////////////////
  public async renewSubscription(agencyId: ObjectId, subId: ObjectId) {
    // AGENCY VALIDATION
    const agencyMatch: T = {
      _id: agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
    };

    const agency = await this.agencyModel.findOne(agencyMatch).lean().exec();
    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    const subMatch: T = {
      agencyId,
      subscriptionStatus: SubscriptionStatus.EXPIRED,
      billingTariffId: subId,
    };
    const now = new Date();
    const timeEnd = this.addMonths(now, 1);

    const subscription = await this.agencySubscribeModel.findOneAndUpdate(
      subMatch,
      {
        $set: {
          cancelledAt: null,
          currentPeriodEnd: timeEnd,
          currentPeriodStart: now,
          lastPaymentAt: now,
          nextPaymentAt: timeEnd,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          "billingSnapshot.usage": {
            agents: 0,
            properties: 0,
          },
        },
      },
      {
        new: true,
        sort: {
          createdAt: -1,
        },
      },
    );

    if (!subscription) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATING_FAILED);
    }
    return subscription;
  }

  ///////////////////////////////////// CANCEL SUBSCRIPTION ///////////////////////////////////

  public async subscriptionCancel(
    member: CommonUsers,
  ): Promise<AgencySubscriptionResult> {
    const now = new Date();
    const agencyId = shapeIntoMongooseObjectId(member._id);
    const match: T = {
      agencyId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      cancelledAt: null,
    };

    const subscription = await this.agencySubscribeModel.findOneAndUpdate(
      match,
      {
        $set: {
          subscriptionStatus: SubscriptionStatus.CANCELLED,
          cancelledAt: now,
        },
      },
      {
        new: true,
      },
    );

    if (!subscription) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_ACTIVE_SUBSCRIPTION);
    }
    return subscription;
  }

  ////////////////////////////// HELPER FUNCTIONS ////////////////
  private addMonths(date: Date, month: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + month);
    return d;
  }

  /////////////////// ORGANIZE INPUTS //////////////
  private organiseSubscribeInputs(
    input: AgencyPaymentInfoInputs,
    tariffPlan: Tariff,
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
        usage: {
          agents: 0,
          properties: 0,
        },
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

  public async getLatestSubscription(
    member: CommonUsers,
  ): Promise<SubscriptionMode> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    let mode: SubscriptionMode = SubscriptionMode.FIRST_SUBSCRIBE;

    if (member.role === MemberType.USER) {
      const agency = await this.agencyModel.findOne({
        userId: memberId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgencyStatus.PAYMENT,
      });

      if (!agency) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.PAYMENT_NOT_ALLOWED);
      }

      const subscription = await this.agencySubscribeModel.findOne({
        agencyId: agency._id,
      });

      if (subscription) {
        throw new Errors(HttpCode.CONFLICT, Message.SUBSCRIPTION_EXIST);
      }
    } else {
      const subscription = await this.agencySubscribeModel.findOne({
        agencyId: memberId,
      });

      if (subscription) {
        if (subscription.subscriptionStatus === SubscriptionStatus.CANCELLED) {
          mode = SubscriptionMode.RE_SUBSCRIBE;
        } else {
          throw new Errors(HttpCode.CONFLICT, Message.SUBSCRIPTION_EXIST);
        }
      }
    }
    return mode;
  }
}
export default AgencySubscribeService;
