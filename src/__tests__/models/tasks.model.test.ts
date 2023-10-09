import { PrismaClient } from '@prisma/client';
import Task from '../../types/Task.type';
import Tasks from '../../models/tasks.model';
import User from '../../types/User.type';
import bcrypt from 'bcrypt';
import { config } from '../../configuration/config';

const prisma = new PrismaClient();

describe('Tasks model', () => {
	let user: User;

	beforeAll(async () => {
		user = await prisma.user.create({
			data: {
				u_email: 'test_tasks@example.com',
				u_name: 'Test',
				u_password: bcrypt.hashSync('password', config.saltRounds)
			}
		});
	});

	afterAll(async () => {
		await prisma.user.deleteMany({});
	});

	afterEach(async () => {
		await prisma.task.deleteMany({});
	});

	describe('create', () => {
		it('should create a new task', async () => {
			const task: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task',
				t_description: 'This is a test task',
				t_due_date: new Date(),
				t_status: false
			};
			const createdTask = await Tasks.create(task);
			expect(createdTask.t_id).toBeDefined();
			expect(createdTask.t_user_id).toEqual(task.t_user_id);
			expect(createdTask.t_title).toEqual(task.t_title);
			expect(createdTask.t_description).toEqual(task.t_description);
			expect(createdTask.t_due_date).toEqual(task.t_due_date);
			expect(createdTask.t_status).toEqual(task.t_status);
		});
	});

	describe('delete', () => {
		it('should delete a task', async () => {
			const task: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task',
				t_description: 'This is a test task',
				t_due_date: new Date(),
				t_status: false
			};
			const createdTask = await Tasks.create(task);
			await Tasks.delete(Number(createdTask.t_id));
			const deletedTask = await prisma.task.findUnique({
				where: { t_id: createdTask.t_id }
			});
			expect(deletedTask).toBeNull();
		});
	});

	describe('getAll', () => {
		it('should get all tasks for a user', async () => {
			const task1: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 1',
				t_description: 'This is a test task 1',
				t_due_date: new Date(),
				t_status: false
			};
			const task2: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 2',
				t_description: 'This is a test task 2',
				t_due_date: new Date(),
				t_status: false
			};
			await Tasks.create(task1);
			await Tasks.create(task2);
			const allTasks = await Tasks.getAll(Number(user.u_id));
			expect(allTasks.length).toBe(2);
		});

		it('should get all completed tasks for a user', async () => {
			const task1: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 1',
				t_description: 'This is a test task 1',
				t_due_date: new Date(),
				t_status: true
			};
			const task2: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 2',
				t_description: 'This is a test task 2',
				t_due_date: new Date(),
				t_status: false
			};
			await Tasks.create(task1);
			await Tasks.create(task2);
			const completedTasks = await Tasks.getAll(Number(user.u_id), true);
			expect(completedTasks.length).toBe(1);
		});
	});

	describe('getDueToday', () => {
		it('should get all tasks due today for a user', async () => {
			const task1: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 1',
				t_description: 'This is a test task 1',
				t_due_date: new Date(),
				t_status: false
			};
			const task2: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 2',
				t_description: 'This is a test task 2',
				t_due_date: new Date(),
				t_status: false
			};
			const task3: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task 2',
				t_description: 'This is a test task 2',
				t_due_date: new Date(new Date().setDate(new Date().getDate() + 2)),
				t_status: false
			};
			await Tasks.create(task1);
			await Tasks.create(task2);
			await Tasks.create(task3);
			const dueTodayTasks = await Tasks.getDueToday(Number(user.u_id));
			expect(dueTodayTasks.length).toBe(2);
			expect(dueTodayTasks[0].t_due_date).toEqual(task1.t_due_date);
			expect(dueTodayTasks[1].t_due_date).toEqual(task2.t_due_date);
		});
	});

	describe('revStatus', () => {
		it('should reverse the completed status of a task', async () => {
			const task: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task',
				t_description: 'This is a test task',
				t_due_date: new Date(),
				t_status: false
			};
			const createdTask = await Tasks.create(task);
			await Tasks.revStatus(Number(createdTask.t_id));
			const updatedTask = await prisma.task.findUnique({
				where: { t_id: createdTask.t_id }
			});
			expect(updatedTask?.t_status).toBe(true);
			await Tasks.revStatus(Number(createdTask.t_id));
			const revertedTask = await prisma.task.findUnique({
				where: { t_id: createdTask.t_id }
			});
			expect(revertedTask?.t_status).toBe(false);
		});
	});

	describe('addToMyDay', () => {
		it('should add a task to my day', async () => {
			const task: Task = {
				t_user_id: Number(user.u_id),
				t_title: 'Test task',
				t_description: 'This is a test task',
				t_due_date: new Date(),
				t_status: false
			};
			const createdTask = await Tasks.create(task);
			await Tasks.addToMyDay(Number(createdTask.t_id));
			const updatedTask = await prisma.task.findUnique({
				where: { t_id: createdTask.t_id }
			});
			expect(updatedTask?.t_due_date).toBeDefined();
		});
	});
});
