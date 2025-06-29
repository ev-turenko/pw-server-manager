import express from 'express';
import { chromium } from 'playwright';

const app = express();
const port = process.env.PORT || 3011;

app.use(express.json());

let browser = null;
let context = null;
let activeConnections = 0;
let activeWorkers = new Map();
let serverMetadata = {
    isRunning: false,
    startTime: null,
    url: `http://localhost:${port}`,
    browserVersion: null,
    totalWorkers: 0
};

app.use((req, res, next) => {
    activeConnections++;
    const workerId = req.headers['x-worker-id'] || 'unknown';
    
    if (req.path.startsWith('/api/chromium') && workerId !== 'unknown') {
        activeWorkers.set(workerId, {
            id: workerId,
            lastActivity: new Date(),
            endpoint: req.path,
            method: req.method
        });
    }

    res.on('finish', () => {
        activeConnections--;
        if (activeConnections === 0 && workerId !== 'unknown') {
            activeWorkers.delete(workerId);
        }
    });
    next();
});

app.post('/api/chromium/start', async (req, res) => {
    try {
        if (browser) {
            return res.status(400).json({ message: 'Browser is already running' });
        }

        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            webServer: {
                command: 'npm run start',
                url: `http://localhost:${port}`,
                reuseExistingServer: !process.env.CI,
            }
        });

        context = await browser.newContext();
        await context.newPage();

        serverMetadata = {
            isRunning: true,
            startTime: new Date(),
            url: `http://localhost:${port}`,
            browserVersion: await browser.version(),
            totalWorkers: activeWorkers.size
        };

        res.json({ 
            message: 'Playwright webserver started', 
            metadata: serverMetadata 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to start webserver', 
            details: error.message 
        });
    }
});

app.post('/api/chromium/stop', async (req, res) => {
    try {
        if (!browser) {
            return res.status(400).json({ message: 'No browser instance running' });
        }

        await browser.close();
        browser = null;
        context = null;
        serverMetadata = {
            isRunning: false,
            startTime: null,
            url: null,
            browserVersion: null,
            totalWorkers: 0
        };

        res.json({ message: 'Playwright webserver stopped' });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to stop webserver', 
            details: error.message 
        });
    }
});

app.get('/api/chromium/connections', (req, res) => {
    res.json({ 
        activeConnections,
        activeWorkers: activeWorkers.size
    });
});

app.get('/api/chromium/workers', (req, res) => {
    res.json({
        totalWorkers: activeWorkers.size,
        workers: Array.from(activeWorkers.values()).map(worker => ({
            ...worker,
            lastActivity: worker.lastActivity.toISOString(),
            active: (new Date() - worker.lastActivity) < 30000
        }))
    });
});

app.get('/api/chromium/metadata', (req, res) => {
    res.json({
        ...serverMetadata,
        totalWorkers: activeWorkers.size
    });
});

app.get('/api/chromium/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: serverMetadata.isRunning 
            ? (new Date() - serverMetadata.startTime) / 1000 + ' seconds' 
            : 'not running',
        connections: activeConnections,
        workers: activeWorkers.size
    });
});

app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
});