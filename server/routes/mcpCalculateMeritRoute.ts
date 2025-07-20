import { Router } from 'express';
import { mcpCalculateMerit } from './mcpCalculateMerit';

export const mcpCalculateMeritRoute = Router();

mcpCalculateMeritRoute.post('/mcp/calculate-merit', mcpCalculateMerit);
