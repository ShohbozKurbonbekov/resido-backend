import { Agency, User } from "../libs/types/member";
import jwt from "jsonwebtoken";
import { jwtTime } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";

class AuthService {
  private readonly secretToken;
  constructor() {
    this.secretToken = process.env.JWT_SECRET as string;
  }

  public async createToken(payload: User | Agency): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log("token", this.secretToken);
      jwt.sign(
        { ...payload },
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
}

export default AuthService;
