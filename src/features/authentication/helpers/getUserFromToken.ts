import { promisify } from "util";
import jwt from 'jsonwebtoken';
import { User, UserModel } from "../models/userModel.ts";

const verifyAsync = promisify<string, string, JwtPayload>(jwt.verify as any);

interface JwtPayload {
  id: number;
  iat: number;
}

const getUserFromToken = async (token: string): Promise<{ currentUser: User, iat: number }> => {
  // Then use it in your code:
  const decoded = await verifyAsync(token, process.env.JWT_SECRET!);

  // Check if user still exists
  const currentUser = await UserModel.findById(decoded.id);

  // return data
  return { currentUser, iat: decoded.iat };
}


export default getUserFromToken;