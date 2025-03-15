const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * 写入大文件测试
 */
async function writeLargeFile(filename, sizeMB, chunkSizeMB = 1) {
    const chunkSize = chunkSizeMB * 1024 * 1024;
    const iterations = sizeMB / chunkSizeMB;
    
    // 创建一个充满'a'的buffer
    const chunk = Buffer.alloc(chunkSize, 'a');
    
    console.log(`开始写入 ${sizeMB}MB 文件...`);
    const startTime = process.hrtime.bigint();
    
    try {
        // 创建文件句柄
        const fileHandle = await fs.open(filename, 'w');
        
        // 循环写入块
        for (let i = 0; i < iterations; i++) {
            await fileHandle.write(chunk, 0, chunk.length);
        }
        
        // 关闭文件
        await fileHandle.close();
        
        const endTime = process.hrtime.bigint();
        const elapsed = Number(endTime - startTime) / 1e9;
        const throughput = sizeMB / elapsed;
        
        console.log(`写入完成, 用时: ${elapsed.toFixed(3)} 秒`);
        console.log(`写入速度: ${throughput.toFixed(2)} MB/秒`);
        
        return elapsed;
    } catch (err) {
        console.error('写入文件时出错:', err);
        throw err;
    }
}

/**
 * 读取大文件测试
 */
async function readLargeFile(filename, chunkSizeMB = 1) {
    try {
        const stats = await fs.stat(filename);
        const fileSizeMB = stats.size / (1024 * 1024);
        const chunkSize = chunkSizeMB * 1024 * 1024;
        
        console.log(`开始读取 ${fileSizeMB.toFixed(2)}MB 文件...`);
        const startTime = process.hrtime.bigint();
        
        // 创建文件句柄
        const fileHandle = await fs.open(filename, 'r');
        let totalRead = 0;
        let bytesRead = 1; // 初始值以进入循环
        
        // 分配缓冲区
        const buffer = Buffer.alloc(chunkSize);
        
        // 循环读取
        while (bytesRead > 0) {
            const readResult = await fileHandle.read(buffer, 0, buffer.length, null);
            bytesRead = readResult.bytesRead;
            totalRead += bytesRead;
        }
        
        // 关闭文件
        await fileHandle.close();
        
        const endTime = process.hrtime.bigint();
        const elapsed = Number(endTime - startTime) / 1e9;
        const throughput = fileSizeMB / elapsed;
        
        console.log(`读取完成, 读取了 ${(totalRead / (1024 * 1024)).toFixed(2)}MB, 用时: ${elapsed.toFixed(3)} 秒`);
        console.log(`读取速度: ${throughput.toFixed(2)} MB/秒`);
        
        return elapsed;
    } catch (err) {
        console.error('读取文件时出错:', err);
        throw err;
    }
}

/**
 * 清除系统缓存（仅限Linux）
 */
async function clearSystemCache() {
    if (process.platform === 'linux') {
        try {
            console.log("清除系统缓存...");
            await execPromise('sudo sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"');
        } catch (err) {
            console.warn("无法清除系统缓存:", err.message);
        }
    }
}

/**
 * 运行文件I/O测试
 */
async function runFileIOTest(sizeMB = 1000, chunkSizeMB = 1) {
    const filename = "test_large_file.bin";
    
    try {
        // 写入测试
        const writeTime = await writeLargeFile(filename, sizeMB, chunkSizeMB);
        
        // 清除缓存以确保公平测试
        await clearSystemCache();
        
        // 读取测试
        const readTime = await readLargeFile(filename, chunkSizeMB);
        
        // 清理
        try {
            await fs.unlink(filename);
            console.log(`已删除测试文件 ${filename}`);
        } catch (err) {
            console.warn(`无法删除测试文件: ${err.message}`);
        }
        
        return { writeTime, readTime };
    } catch (err) {
        console.error("测试失败:", err);
        throw err;
    }
}

async function main() {
    // 从命令行获取参数或使用默认值
    const sizeMB = process.argv.length > 2 ? parseInt(process.argv[2]) : 1000;
    const chunkSizeMB = process.argv.length > 3 ? parseInt(process.argv[3]) : 1;
    
    console.log(`运行文件I/O测试 (文件大小: ${sizeMB}MB, 块大小: ${chunkSizeMB}MB)`);
    
    try {
        const { writeTime, readTime } = await runFileIOTest(sizeMB, chunkSizeMB);
        console.log(`摘要: 写入用时=${writeTime.toFixed(3)}秒, 读取用时=${readTime.toFixed(3)}秒`);
    } catch (err) {
        console.error("测试执行失败:", err);
        process.exit(1);
    }
}

main();