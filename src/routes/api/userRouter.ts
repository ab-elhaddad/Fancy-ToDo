import { Application } from 'express';
import { confirm, signIn, signUp } from '../../controllers/users.controller';
import { signInValidator, signUpValidator } from '../../middlewares/validators/users.validator';
import errorHandler from '../../middlewares/errorHandler.middleware';

const userRouter = (app: Application) => {
	app.post('/users/sign-in', signInValidator, signIn, errorHandler);
	app.post('/users/sign-up', signUpValidator, signUp, errorHandler);
	app.get('/confirm/:token', confirm, errorHandler);
};

export default userRouter;