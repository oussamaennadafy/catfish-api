import express from 'express';
import * as authController from "@/features/authentication/controllers/authController.ts";

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
userRouter.use(authController.protect);

userRouter.get("/protected", (req, res) => {
  res.json({ "this route": "protected" });
})

userRouter.patch('/updateMyPassword', authController.updatePassword);

export default userRouter;