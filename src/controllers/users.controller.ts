import Users from '../models/users.model';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { config } from '../configuration/config';
import jwt from 'jsonwebtoken';
import User from '../types/User.type';
import sendEmail from '../helpers/sendEmail';

export const signUp = {
	post: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user: User = req.body;
			user.u_password = bcrypt.hashSync(user.u_password as string, config.saltRounds);
			const userID = await Users.createUser(user);

			sendEmail.confirmation(userID, user.u_email);
			res.json({
				message: 'User created successfully. Check your email to confirm your account.'
			});
		} catch (err) {
			res.locals.err = err;
			next();
		}
	},
	get: async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.render('sign-up');
		} catch (err) {
			res.locals.err = err;
			next();
		}
	}
}

export const signIn = {
	post: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { u_email, u_password } = req.body;
			const userID = await Users.signIn(u_email, u_password);
			res.cookie('token', jwt.sign({ id: userID, email: u_email }, config.jwtSecretKey)).json({ message: `User logged in successfully` });
		} catch (err) {
			res.locals.err = err;
			next();
		}
	},
	get: async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.render('sign-in');
		} catch (err) {
			res.locals.err = err;
			next();
		}
	}
}

export const signOut = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.clearCookie('token').json({ message: 'User logged out successfully' });
	} catch (err) {
		res.locals.err = err;
		next();
	}
};

export const forgotPassword = {
	get: async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.render('forgot-password');
		} catch (err) {
			res.locals.err = err;
			next();
		}
	},
	post: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email: u_email } = req.body;
			const u_id = await Users.getIdByEmail(u_email);
			sendEmail.resetPassword(u_id, u_email);
			res.send('<h1>Check your email to reset your password</h1>');
		} catch (err) {
			res.locals.err = err;
			next();
		}
	}
};

export const resetPassword = {
	get: async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.render('reset-password');
		} catch (err) {
			res.locals.err = err;
			next();
		}
	},
	post: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { token } = req.params;
			const { password } = req.body;

			const { id } = jwt.verify(token, config.jwtSecretKey) as { id: number; email: string };
			const hashedPassword = bcrypt.hashSync(password, config.saltRounds);

			await Users.updatePassword(id, hashedPassword);

			res.send('<h1>Password changed successfully</h1>');
		} catch (err) {
			res.locals.err = err;
			next();
		}
	}
};

export const confirm = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { token } = req.params;
		const id = Number(jwt.verify(token, config.jwtSecretKey));
		await Users.confirm(id);
		res.json({ Message: 'Account confirmed :)' });
		//res.redirect('http://localhost:3000/users/login');
	} catch (err) {
		console.error('Error in confirm function in users.controller.');
		res.locals.err = err;
		next();
	}
};

export const profile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = res.locals.user;
		const user: User = await Users.getById(id);

		res.json({ message: 'User retrieved successfully.', user: { u_name: user.u_name, u_email: user.u_email } });
	} catch (err) {
		res.locals.err = err;
		next();
	}
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: User = req.body;
		user.u_id ||= res.locals.user.id;
		await Users.updateUser(user);
		res.json({ message: 'User updated successfully' });
	} catch (err) {
		res.locals.err = err;
		next();
	}
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await Users.deleteUserById(res.locals.user.id);
		res.json({ message: 'User deleted successfully' });
	} catch (err) {
		res.locals.err = err;
		next();
	}
}

/*
	- update account
	- delete account
	- see account (profile)
*/
