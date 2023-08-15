import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './task.model';
import { TaskOptions } from './dto/find-task.options';
import { ReadAllTaskDto } from './dto/read-all-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task) private taskRepository: typeof Task) {}

  public async findOne(options: TaskOptions): Promise<Task> {
    const suitableTask = await this.findBy({ ...options });

    if (!suitableTask) {
      throw new BadRequestException("There isn't suitable task");
    }

    return suitableTask;
  }

  public async findAll(options: ReadAllTaskDto): Promise<Task[]> {
    const suitableTasks = await this.taskRepository.findAll({
      where: { ...options },
    });

    return suitableTasks;
  }

  public async findBy(options: TaskOptions): Promise<Task> {
    const suitableTask = await this.taskRepository.findOne({
      where: { ...options },
    });

    return suitableTask;
  }

  public async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = await this.taskRepository.create(createTaskDto);

    return createdTask;
  }

  public async update(updateTaskDto: UpdateTaskDto) {
    await this.taskRepository.update(updateTaskDto, {
      where: { id: updateTaskDto.id },
    });
  }

  public async delete(id: number): Promise<void> {
    const numberDeletedRows = await this.taskRepository.destroy({
      where: { id },
    });

    if (!numberDeletedRows)
      throw new BadRequestException('There is no suitable task');
  }
}
