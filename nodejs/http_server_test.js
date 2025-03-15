
const express = require('express');
const app = express();

// 简单的计数器用于统计请求数
let requestCount = 0;

// 路由定义
app.get('/', (req, res) => {
    requestCount++;
    res.json({ message: "Hello World" });
});

app.get('/json', (req, res) => {
    requestCount++;
    res.json({
        id: Math.floor(Math.random() * 1000) + 1,
        name: "Test Item",
        timestamp: Date.now(),
        values: Array(10).fill().map(() => Math.random()),
        metadata: {
            server: "Node.js Express",
            version: "1.0",
            status: "active"
        }
    });
});

app.get('/stats', (req, res) => {
    res.json({
        total_requests: requestCount,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// 启动服务器
function startServer(host = '127.0.0.1', port = 8000) {
    return new Promise((resolve) => {
        const server = app.listen(port, host, () => {
            console.log(`启动Node.js Express HTTP服务器 http://${host}:${port}`);
            console.log("路径:");
            console.log("  / - 简单消息");
            console.log("  /json - JSON响应");
            console.log("  /stats - 服务器统计");
            console.log("\n使用 Ctrl+C 停止服务器");
            resolve(server);
        });
    });
}

// 主程序
async function main() {
    const host = process.argv.length > 2 ? process.argv[2] : '127.0.0.1';
    const port = process.argv.length > 3 ? parseInt(process.argv[3]) : 8000;
    
    try {
        await startServer(host, port);
    } catch (err) {
        console.error("无法启动服务器:", err);
        process.exit(1);
    }
}

// 执行主程序
main();