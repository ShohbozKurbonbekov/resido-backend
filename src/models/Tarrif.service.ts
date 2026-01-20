import { TarrifInputType, TarrifOutputType } from "../libs/types/payment";
import TarrifModel, { Tarrif } from "../schema/Tarrif.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { TarrifCurrencyType, TarrifStatus } from "../libs/enums/payment.enum";
import { CommonPageInput, T } from "../libs/types/common";

class TarrifService {
  private readonly tarrifModel;
  constructor() {
    this.tarrifModel = TarrifModel;
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
}

export default TarrifService;
