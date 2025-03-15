/**
 * 获取当前进程内存使用情况（MB）
 */
function getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
        rss: memoryUsage.rss / (1024 * 1024),
        heapTotal: memoryUsage.heapTotal / (1024 * 1024),
        heapUsed: memoryUsage.heapUsed / (1024 * 1024),
        external: memoryUsage.external / (1024 * 1024)
    };
}

/**
 * 内存使用测试
 */
async function runMemoryTest(arraySize) {
    // 强制垃圾回收（如果可能的话）
    if (global.gc) {
        global.gc();
    } else {
        console.log("提示: 运行时带上 --expose-gc 标志以启用垃圾回收");
    }
    
    // 等待100ms让可能的GC完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 初始内存使用
    const initialMemory = getMemoryUsage();
    console.log(`初始内存使用: RSS = ${initialMemory.rss.toFixed(2)} MB, 堆使用 = ${initialMemory.heapUsed.toFixed(2)} MB`);
    
    // 创建大数组
    console.log(`创建大小为 ${arraySize} 的数组...`);
    const startTime = process.hrtime.bigint();
    const largeArray = Array(arraySize).fill().map((_, i) => i);
    const creationTime = Number(process.hrtime.bigint() - startTime) / 1e9;
    
    const afterCreationMemory = getMemoryUsage();
    console.log(`数组创建后内存使用: RSS = ${afterCreationMemory.rss.toFixed(2)} MB (增加 ${(afterCreationMemory.rss - initialMemory.rss).toFixed(2)} MB)`);
    console.log(`堆使用 = ${afterCreationMemory.heapUsed.toFixed(2)} MB (增加 ${(afterCreationMemory.heapUsed - initialMemory.heapUsed).toFixed(2)} MB)`);
    console.log(`数组创建时间: ${creationTime.toFixed(6)} 秒`);
    
    // 对数组进行操作
    console.log("执行数组求和操作...");
    const startOpTime = process.hrtime.bigint();
    const sumResult = largeArray.reduce((acc, val) => acc + val, 0);
    const operationTime = Number(process.hrtime.bigint() - startOpTime) / 1e9;
    
    const afterOperationMemory = getMemoryUsage();
    console.log(`操作后内存使用: RSS = ${afterOperationMemory.rss.toFixed(2)} MB (增加 ${(afterOperationMemory.rss - afterCreationMemory.rss).toFixed(2)} MB)`);
    console.log(`堆使用 = ${afterOperationMemory.heapUsed.toFixed(2)} MB (增加 ${(afterOperationMemory.heapUsed - afterCreationMemory.heapUsed).toFixed(2)} MB)`);
    console.log(`数组求和结果: ${sumResult}, 操作时间: ${operationTime.toFixed(6)} 秒`);
    
    // 清理
    largeArray.length = 0;
    if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const finalMemory = getMemoryUsage();
    console.log(`清理后内存使用: RSS = ${finalMemory.rss.toFixed(2)} MB, 堆使用 = ${finalMemory.heapUsed.toFixed(2)} MB`);
}

async function main() {
    // 从命令行获取参数或使用默认值
    const arraySize = process.argv.length > 2 ? parseInt(process.argv[2]) : 10000000;
    
    await runMemoryTest(arraySize);
}

main().catch(console.error);