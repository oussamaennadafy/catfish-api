import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { catchAsync } from '@/helpers/catchAsync.ts';
import AppError from '@/common/classes/AppError.ts';
import Email from '@/helpers/email.ts';
import { UserModel } from '../models/userModel.ts';
import Cookies from "js-cookie"

const verifyAsync = promisify<string, string, JwtPayload>(jwt.verify as any);

interface JwtPayload {
  id: number;
  iat: number;
}

// Create JWT token
const signToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as unknown as number,
  });
};

// Send token to client
const createSendToken = (user: any, statusCode: number, req: Request, res: Response) => {
  const token = signToken(user.id);
  const cookieExpires = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90;

  Cookies.set("jwt", token, {
    expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  })

  // Remove password from output
  const userResponse = { ...user };
  delete userResponse.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userResponse
    }
  });
};

// Sign up a new user
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo
  });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

// Log in a user
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if user exists
  const user = await UserModel.findByEmail(email, true);

  if (!user || !(await UserModel.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  
  // Send token to client
  createSendToken(user, 200, req, res);
});

// Log out a user
export const logout = (req: Request, res: Response) => {
  Cookies.remove("jwt");
  res.status(200).json({ status: 'success' });
};

// Protect routes - authentication middleware
export const protect = catchAsync(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  // Get token
  let token: string;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Then use it in your code:
  const decoded = await verifyAsync(token, process.env.JWT_SECRET!);

  // Check if user still exists
  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // Check if user changed password after the token was issued
  if (UserModel.changedPasswordAfter(currentUser, decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Check if user is logged in (for rendered pages)
export const isLoggedIn = async (req: Request, res: Response & { locals: { user?: any } }, next: NextFunction) => {
  if (req.cookies.jwt) {
    try {
      // Verify token
      const decoded = await verifyAsync(req.cookies.jwt, process.env.JWT_SECRET!);

      // Check if user still exists
      const currentUser = await UserModel.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // Check if user changed password after the token was issued
      if (UserModel.changedPasswordAfter(currentUser, decoded.iat)) {
        return next();
      }

      // User is logged in
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Forgot password functionality
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on email
  const user = await UserModel.findByEmail(req.body.email);
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate reset token
  const resetToken = await UserModel.createPasswordResetToken(user.id);

  // Send email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    // If error, reset token and expires
    await UserModel.updatePassword(user.id, user.password);

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

// Reset password functionality
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on token
  const user = await UserModel.findByResetToken(req.params.token);

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Validate new password
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords are not the same!', 400));
  }

  if (req.body.password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // Update password
  const updatedUser = await UserModel.updatePassword(user.id, req.body.password);

  // Log user in, send JWT
  createSendToken(updatedUser, 200, req, res);
});

// Update password for logged in user
export const updatePassword = catchAsync(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  // Get user from database
  const user = await UserModel.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if current password is correct
  if (!(await UserModel.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // Validate new password
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords are not the same!', 400));
  }

  if (req.body.password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // Update password
  const updatedUser = await UserModel.updatePassword(user.id, req.body.password);

  // Log user in, send JWT
  createSendToken(updatedUser, 200, req, res);
});