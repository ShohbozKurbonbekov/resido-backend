import { User } from "../libs/types/member";
import jwt from "jsonwebtoken";
import { jwtTime } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Agency } from "../libs/types/agency";
import { Agent } from "../libs/types/agent";

class AuthService {
  private readonly secretToken;
  constructor() {
    this.secretToken = process.env.JWT_SECRET as string;
  }

  public async createToken(payload: User | Agency | Agent): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log("token", this.secretToken);
      jwt.sign(
        payload,
        this.secretToken,
        {
          expiresIn: `${jwtTime}h`,
        },
        (error, token) => {
          if (error) {
            reject(
              new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED)
            );
          } else {
            resolve(token as string);
          }
        }
      );
    });
  }

  public async checkAuth(token: string): Promise<Agent> {
    const decoded: Agent = (await jwt.verify(token, this.secretToken)) as Agent;
    return decoded;
  }
}

export default AuthService;
