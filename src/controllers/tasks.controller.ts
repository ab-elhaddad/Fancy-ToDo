import { NextFunction, Request, Response } from 'express';
import Tasks from '../models/tasks.model';

const tasks = new Tasks();

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const task = req.body;
		task.t_user_id = res.locals.user.id;
		if (task.t_due_date)
			task.t_due_date = new Date(new Date(task.t_due_date).setHours(12));

		const response = await tasks.create(task);
		res.json({
			message: 'Task created successfully',
			task: response
		});
	} catch (err) {
		res.locals.err = err;
		next();
	}
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { t_id } = req.body;
		await tasks.delete(t_id);
		res.json({ message: `Task deleted successfully` });
	} catch (err) {
		res.locals.err = err;
		next();
	}
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id: u_id } = res.locals.user;
		const t_status = req.query.t_status ? (req.query.t_status === 'true') : undefined;

		const userTasks = await tasks.getAll(u_id, t_status);
		res.json({ message: 'Tasks returned sucessfully.', tasks: userTasks });
	} catch (err) {
		res.locals.err = err;
		next();
	}
};

export const getDueToday = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id: u_id } = res.locals.user;
		const dueTodayTasks = await tasks.getDueToday(u_id);
		res.json({
			message: 'Tasks returned successfully.',
			tasks: dueTodayTasks
		});
	} catch (err) {
		res.locals.err = err;
		next();
	}
};

export const revStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { t_id } = req.body;
		await tasks.revStatus(t_id);

		res.json({ message: `Task's completeness reversed successfully.` });
	} catch (err) {
		res.locals.err = err;
		next();
	}
};

export const addToMyDay = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id: t_id } = req.body;
		await tasks.addToMyDay(t_id);
		res.json({ message: 'Task added to my day successfully' });
	} catch (err) {
		res.locals.err = err;
		next();
	}
};
