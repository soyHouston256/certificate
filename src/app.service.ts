import { Injectable } from '@nestjs/common';
import { Course } from './enums/enums';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  postHello(dto: Course): string {
    const students = dto.students;
    const studentsNames = students.map((student) => student.name);
    console.log(studentsNames);
    return studentsNames.join(', ');
  }
}
