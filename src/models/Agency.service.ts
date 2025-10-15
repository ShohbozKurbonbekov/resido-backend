import { T } from "../libs/types/common";
import { MemberStatus } from "../libs/enums/member.enum";
import { AgencyLocation, AgencyResults } from "../libs/types/agency";
import ViewModel from "../schema/View.model";
import AgencyModel from "../schema/members/Agency.model";

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
      varified: -1,
    };

    const sort: T = {
      createdAt: -1,
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
    return {
      agents: result.agents,
      totalAgenciesNumber: result?.metaCounter?.total || 0,
    };
  }
}

export default AgencyService;
