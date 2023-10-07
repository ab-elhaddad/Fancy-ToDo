type Task = {
	t_id?: number;
	t_title: string;
	t_description?: string;
	t_status?: boolean;
	t_due_date?: Date;
	t_created_at?: Date;
	t_user_id: number;
} & { [key: string]: any };

export default Task;
