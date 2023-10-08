import Task from '../types/Task.type';
import getDates from './helpers/getDates';
import prisma from '../lib/database';
import Subtask from '../types/Subtask.type';

class Tasks {
	/** Creates a new task assigned to the passed user id.
	 * @param task {@link Task}
	 * @returns an object of {@link Task}.
	 */
	async create(task: Task): Promise<Task> {
		const insertedTask: Task = await prisma.task.create({
			data: task
		});
		return insertedTask;
	}

	/** Deletes the task with the given id.*/
	async delete(t_id: number): Promise<void> {
		await prisma.task.delete({
			where: { t_id: t_id }
		});
	}

	/**
	 * Gets all the tasks assigned by the user based on the status.
	 * @param u_id
	 * @param t_status Determines the status of returned tasks. *If not passed all tasks are returned.*
	 * @returns Tasks assigned by the user.
	 */
	async getAll(u_id: number, t_status?: boolean): Promise<Task[]> {
		const tasks: Task[] = await prisma.task.findMany({
			where: {
				t_user_id: u_id,
				t_status: t_status
			},
			include: {
				t_subtasks: true
			}
		});

		return tasks;
	}

	async getAll_SQLVersion(u_id: number): Promise<Task[]> {
		const mp = new Map<Partial<Task>, Partial<Subtask>[]>();
		type joinResult = Task & Subtask & { [key: string]: any };
		const tasks: joinResult[] = await prisma.$queryRaw`
		SELECT *
		FROM public."Task"
		LEFT JOIN public."Subtask"
		ON public."Task".t_id = public."Subtask"."s_task_id"
		WHERE public."Task"."t_user_id" = ${u_id};
		`

		tasks.forEach((el: joinResult) => {
			let task: Partial<Task> = {}, subtask: Partial<Subtask> = {};
			for (const key in el) {
				if (key.startsWith('s_'))
					subtask[key] = el[key]
				else
					task[key] = el[key];
			}
			let found = false;
			mp.forEach((v, k) => {
				if (k.t_id === task.t_id) {
					found = true;
					return;
				}
			});
			if (!found)
				mp.set(task, []);

			mp.get(task)?.push(subtask);
		});
		console.log(mp);
		let returnTasks: any = [];
		mp.forEach((v, k) => {
			let el = k;
			el.t_subtasks = v;
			returnTasks.push(el);
		})
		return returnTasks;
	}

	/** Gets all the tasks assigned to the passed user id and has due date today. */
	async getDueToday(u_id: number): Promise<Task[]> {
		const { startDate, endDate } = getDates();
		const tasks: Task[] = await prisma.task.findMany({
			where: {
				t_user_id: u_id,
				t_due_date: {
					gte: startDate,
					lte: endDate
				}
			}
		});
		return tasks;
	}

	/** Reverse the completed aolumn in the task's row. */
	async revStatus(t_id: number): Promise<void> {
		await prisma.$queryRaw`
        UPDATE public."Task"
        SET t_status = NOT (
            SELECT t_status
            FROM public."Task"
            WHERE t_id = ${t_id}
        )
        WHERE t_id = ${t_id}`;
	}

	async addToMyDay(t_id: number): Promise<void> {
		const now = new Date();
		await prisma.task.update({
			where: { t_id: t_id },
			data: { t_due_date: now }
		});
	}
}

export default Tasks;
