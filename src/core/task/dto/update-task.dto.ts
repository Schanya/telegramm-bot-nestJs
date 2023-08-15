export class UpdateTaskDto {
  id: number;
  title?: string;
  description?: string;
  time?: Date;
  notification?: boolean;
}
