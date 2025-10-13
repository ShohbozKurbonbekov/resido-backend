import { User } from "../libs/types/user";
import jwt from "jsonwebtoken";
import { jwtTime } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Agency } from "../libs/types/agency";
import { Agent } from "../libs/types/agent";
import { CommonUsers } from "../libs/types/common";

class AuthService {
  private readonly secretToken;
  constructor() {
    this.secretToken = process.env.JWT_SECRET as string;
  }

  public async createToken(payload: CommonUsers): Promise<string> {
    return new Promise((resolve, reject) => {
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

  public async checkAuth(token: string): Promise<CommonUsers> {
    const decoded = await jwt.verify(token, this.secretToken);
    return decoded as CommonUsers;
  }
}

export default AuthService;
