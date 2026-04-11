import jwt from "jsonwebtoken";
import { jwt_secret } from "../config/index.js";
import { authClient } from "../grpc/auth.client.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token required" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, jwt_secret);
    console.log(payload);
    // {
    //   sub: '69da86b542c25a3df42faa6a',
    //   email: 'auth4@gail9.com',
    //   type: 'author',
    //   iat: 1775930570,
    //   exp: 1775934170
    // }

    // gRPC call to verify UserId and Role to User Service
    authClient.ValidateUser(
      {
        userId: payload.sub, // in our case sub is ID
        role: payload.type,
      },
      (err, result) => {
        console.log(`gRPC Error Is ::`, err);
        console.log(`Result :: `, result);
        if (err || !result.valid) {
          return res.status(401).json({
            message: result.message,
          });
        }

        req.user = {
          userId: payload.sub,
          role: payload.type,
          name: payload.email,
        };

        next();
      },
    );
  } catch {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
