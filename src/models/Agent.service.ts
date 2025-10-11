import { AgentLocation, AgentResults } from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";
import { T } from "../libs/types/common";
import { MemberStatus } from "../libs/enums/member.enum";
import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";

class AgentService {
  private readonly agentModel;
  constructor() {
    this.agentModel = AgentModel;
  }

  public async getAgentByLocation(input: AgentLocation): Promise<AgentResults> {
    const filter: T = {
      memberStatus: MemberStatus.ACTIVE,
      address: { $regex: input.location, $options: "i" },
    };
    const sort: T = {
      featuredScore: -1,
      isVerified: -1,
    };

    const [result] = await this.agentModel.aggregate([
      {
        $match: filter,
      },
      { $sort: sort },
      {
        $facet: {
          agents: [
            {
              $skip: (input.page - 1) * input.limit,
            },
            { $limit: input.limit },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.agents.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    console.log("result", result);
    return {
      agents: result.agents,
      totalAgentsNumber: result.metaCounter[0].total || 0,
    };
  }
}
export default AgentService;
