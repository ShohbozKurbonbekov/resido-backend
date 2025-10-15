import { T } from "../libs/types/common";
import { MemberStatus } from "../libs/enums/member.enum";
import { AgencyLocation, AgencyResults } from "../libs/types/agency";
import ViewModel from "../schema/View.model";
import AgencyModel from "../schema/members/Agency.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";

class AgencyService {
  private readonly agencyModel;
  private readonly viewModel;

  constructor() {
    this.agencyModel = AgencyModel;
    this.viewModel = ViewModel;
  }
  public async getAgencyByLocation(
    input: AgencyLocation
  ): Promise<AgencyResults> {
    const { page, limit, location } = input;

    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      address: {
        $regex: location,
        $options: "i",
      },
    };

    const sort: T = {
      createdAt: -1,
      isVerified: -1,
    };

    const [result] = await this.agencyModel.aggregate([
      { $match: match },
      {
        $sort: sort,
      },
      {
        $facet: {
          agencies: [
            { $skip: (page - 1) * limit },
            {
              $limit: limit,
            },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    console.log("result", result);
    if (!result.agencies) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return {
      agencies: result.agencies,
      totalAgenciesNumber: result.metaCounter[0]?.total || 0,
    };
  }
}

export default AgencyService;
