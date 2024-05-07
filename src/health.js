import express from 'express';
import { HealthChecker, LivenessEndpoint, ReadinessEndpoint, PingCheck, HealthEndpoint } from '@cloudnative/health-connect';

const router = express.Router();

const healthCheck = new HealthChecker();
const pingCheck = new PingCheck('google.com');
healthCheck.registerLivenessCheck(pingCheck);


router.get('/health/live', (req, res) => {
    // Crear un nuevo objeto LivenessEndpoint y manejar la solicitud
    const endpoint = new LivenessEndpoint(healthCheck);
    endpoint(req, res);
});

router.get('/health/ready', (req, res) => {
    // Crear un nuevo objeto ReadinessEndpoint y manejar la solicitud
    const endpoint = new ReadinessEndpoint(healthCheck);
    endpoint(req, res);
});

router.get('/health', (req, res) => {
    // Crear un nuevo objeto HealthEndpoint y manejar la solicitud
    const endpoint = new HealthEndpoint(healthCheck);
    endpoint(req, res);
});

export default router;