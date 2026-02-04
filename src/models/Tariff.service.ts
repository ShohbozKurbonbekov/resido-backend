import AgencyModel from "../schema/members/Agency.model";
import { TariffInputType, TariffOutputType } from "../libs/types/payment";
import TariffModel, { Tariff } from "../schema/Tariff.model";
import MemberService from "./Member.service";
import { TariffCurrencyType, TariffStatus } from "../libs/enums/payment.enum";
import { CommonPageInput, T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { AdminGetTariffsInput } from "../libs/types/admin";
import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import UserModel from "../schema/members/User.model";
import { OrderRender } from "../libs/enums/common.enum";

class TariffService {
  private readonly tariffModel;
  public readonly memberService;
  private readonly agencyModel;
  private readonly userModel;

  constructor() {
    this.tariffModel = TariffModel;
    this.memberService = new MemberService();
    this.agencyModel = AgencyModel;
    this.userModel = UserModel;
  }
  //////////////////////// INSERT TARRIF ///////////////////
  public async addTarrif(input: TariffInputType): Promise<Tariff> {
    // Check valid currency
    const allowedCurrencies = Object.keys(TariffCurrencyType);

    if (!allowedCurrencies.includes(input.currency)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_CURRENCY);
    }

    // Check tariff existance
    const match: T = {
      name: input.name,
      status: TariffStatus.ACTIVE,
    };

    const target = await this.tariffModel.findOne(match).lean().exec();

    if (target) {
      throw new Errors(HttpCode.CONFLICT, Message.TARRIF_EXIST);
    }

    // Compact fields
    const { agents, properties } = input.limits;
    const agentsNum = Number(agents);
    const propertiesNum = Number(properties);

    const entityInput: TariffInputType = {
      billingCycle: input.billingCycle,
      currency: input.currency,
      features: input.features.map((feature) => feature.trim()),
      limits: {
        agents: Number.isFinite(agentsNum) ? agentsNum : 0,
        properties: Number.isFinite(propertiesNum) ? propertiesNum : 0,
      },
      name: input.name,
      price: Number.isFinite(Number(input.price)) ? Number(input.price) : 0,
    };

    try {
      const result = await this.tariffModel.create(entityInput);
      return result;
    } catch (error) {
      console.log("Error in addTariff service : ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  ///////////////////////////////////// GET PUBLIC TARIFF PLANS /////////////////////
  public async getPublicTariffs(
    queries: CommonPageInput,
  ): Promise<TariffOutputType> {
    const { limit, page } = queries;
    const match: T = { status: TariffStatus.ACTIVE };
    const sort: T = {
      price: 1,
    };

    const [result] = await this.tariffModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          paymentTariffs: [
            {
              $skip: (page - 1) * limit,
            },
            { $limit: limit },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.paymentTariffs.length) {
      return {
        paymentTariffs: [],
        metaCounter: [{ total: 0 }],
      };
    }
    return result;
  }

  ///////////////////////////////////// GET ADMIN TARIFF PLANS /////////////////////
  public async getAdminTariffs(
    adminId: ObjectId,
    queries: AdminGetTariffsInput,
  ): Promise<TariffOutputType> {
    const { limit, page, status, sort } = queries;

    // Check admin existances
    const adminMatch: T = {
      _id: adminId,
      memberStatus: MemberStatus.ACTIVE,
      role: MemberType.REAL_ESTATE_ADMIN,
    };

    const admin = await this.userModel.findOne(adminMatch).lean().exec();

    if (!admin) {
      throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
    }

    // Fetch tariffs
    const tariffOrder: T = {
      createdAt: sort === OrderRender.DESC ? -1 : 1,
    };
    const [result] = await this.tariffModel.aggregate([
      {
        $match: {
          status,
        },
      },
      {
        $sort: tariffOrder,
      },
      {
        $facet: {
          paymentTariffs: [
            {
              $skip: (page - 1) * limit,
            },
            { $limit: limit },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.paymentTariffs.length) {
      return {
        paymentTariffs: [],
        metaCounter: [{ total: 0 }],
      };
    }
    return result;
  }
}

export default TariffService;
