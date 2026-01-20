import { TarrifInputType, TarrifOutputType } from "../libs/types/payment";
import TarrifModel, { Tarrif } from "../schema/Tarrif.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { TarrifCurrencyType, TarrifStatus } from "../libs/enums/payment.enum";
import { CommonPageInput, CommonUsers, T } from "../libs/types/common";
import MemberService from "./Member.service";
import { ObjectId } from "mongoose";
import AgencyModel from "../schema/members/Agency.model";
import { MemberStatus } from "../libs/enums/member.enum";
import { AgencyStatus } from "../libs/enums/agency.enum";

class TarrifService {
  private readonly tarrifModel;
  public readonly memberService;
  private readonly agencyModel;

  constructor() {
    this.tarrifModel = TarrifModel;
    this.memberService = new MemberService();
    this.agencyModel = AgencyModel;
  }

  public async adminInsertTarrif(input: TarrifInputType): Promise<Tarrif> {
    const match: T = {
      name: input.name,
      status: TarrifStatus.ACTIVE,
    };

    const allowedCurrencies = Object.keys(TarrifCurrencyType);
    if (!allowedCurrencies.includes(input.currency)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_CURRENCY);
    }
    const target = await this.tarrifModel.findOne(match).exec();
    if (target) {
      throw new Errors(HttpCode.CONFLICT, Message.TARRIF_EXIST);
    }

    try {
      const result = await this.tarrifModel.create(input);
      return result;
    } catch (error) {
      console.log("Error in AdminInsertTarrif: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  ///////////////////////////////////// GET PUBLIC TARIFF PLANS /////////////////////
  public async getPublicTariffs(
    queries: CommonPageInput,
  ): Promise<TarrifOutputType> {
    const { limit, page } = queries;
    const match: T = { status: TarrifStatus.ACTIVE };
    const sort: T = {
      price: 1,
    };

    const [result] = await this.tarrifModel.aggregate([
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

  ///////////////////////////////////// GET PUBLIC TARIFF ONE /////////////////////
  public async getPublicTariffOne(tariffId: ObjectId): Promise<Tarrif> {
    const tariffMatch: T = {
      status: TarrifStatus.ACTIVE,
      _id: tariffId,
    };

    const result = await this.tarrifModel.findOne(tariffMatch);

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.TARIFF_NOT_ACTIVE);
    }
    return result;
  }
}

export default TarrifService;
