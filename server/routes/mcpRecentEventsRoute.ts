import { Router } from 'express';
import { mcpRecentEvents } from './mcpRecentEvents';

export const mcpRecentEventsRoute = Router();

mcpRecentEventsRoute.get('/mcp/recent-events', mcpRecentEvents);
