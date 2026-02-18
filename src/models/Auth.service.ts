import jwt from "jsonwebtoken";
import { jwtTime } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { CommonUsers, T } from "../libs/types/common";

class AuthService {
  private readonly secretToken: string;
  constructor() {
    this.secretToken = process.env.JWT_SECRET as string;
  }

  public createToken(payload: T): Promise<string> {
    if (!this.secretToken) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.TOKEN_CREATION_FAILED);
    }
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
              new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED),
            );
          } else {
            resolve(token as string);
          }
        },
      );
    });
  }

  public async checkAuth(token: string): Promise<CommonUsers> {
    const decoded = await jwt.verify(token, this.secretToken);
    return decoded as CommonUsers;
  }
}

export default AuthService;
