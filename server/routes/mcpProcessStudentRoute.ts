import { Router } from 'express';
import { mcpProcessStudent } from './mcpProcessStudent';

export const mcpProcessStudentRoute = Router();

mcpProcessStudentRoute.post('/mcp/process-student', mcpProcessStudent);
