import { Node, HealthMetrics } from '../models/Node';

// ============================================
// HEALTH CHECK SERVICE INTERFACE
// ============================================

export interface IHealthCheckService {
    performHealthCheck(nodeId: string, metrics: Partial<HealthMetrics>): Node | null;
    validateHealthMetrics(metrics: HealthMetrics): boolean;
    getHealthScore(metrics: HealthMetrics): number;
}
