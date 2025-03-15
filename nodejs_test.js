#!/usr/bin/env node
/**
 * Node.js性能测试脚本 - 运行所有Node.js性能测试并收集结果
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 测试配置参数
const CONFIG = {
    "fibonacci_n": 40,             // 斐波那契数列项数
    "matrix_size": 1000,           // 矩阵大小
    "memory_array_size": 10000000, // 内存测试数组大小
    "file_io_size_mb": 1000,       // 文件I/O测试文件大小(MB)
    "output_file": "nodejs_perf_results.json"  // 结果输出文件
};

// 确保测试文件存在
const TEST_FILES = [
    "./nodejs/fibonacci_test.js",
    "./nodejs/matrix_mult_test.js",
    "./nodejs/memory_test.js",
    "./nodejs/file_io_test.js"
];

/**
 * 检查测试前提条件
 */
function checkPrerequisites() {
    console.log("检查前提条件...");
    
    // 检查测试文件是否存在
    const missingFiles = [];
    for (const file of TEST_FILES) {
        if (!fs.existsSync(path.join(__dirname, file))) {
            missingFiles.push(file);
        }
    }
    
    if (missingFiles.length > 0) {
        console.error("错误: 以下测试文件不存在:");
        for (const file of missingFiles) {
            console.error(`  - ${file}`);
        }
        console.error("请确保所有测试文件在当前目录中");
        process.exit(1);
    }
    
    // 检查必要的Node.js包是否安装
    try {
        // 检查mathjs包
        require.resolve('mathjs');
    } catch (e) {
        console.error("错误: 缺少必要的Node.js包: mathjs");
        console.error("请运行: npm install mathjs");
        process.exit(1);
    }
    
    console.log("前提条件检查通过。");
}

/**
 * 运行单个测试并返回结果
 */
function runTest(command, args, testName) {
    console.log(`\n--- 运行测试: ${testName} ---`);
    console.log(`命令: ${command} ${args.join(' ')}`);
    
    const startTime = Date.now();
    let output = '';
    let status = '成功';
    
    try {
        output = execSync(`${command} ${args.join(' ')}`, { encoding: 'utf8' });
    } catch (error) {
        output = error.stderr || error.message;
        status = '失败';
    }
    
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`测试状态: ${status}`);
    console.log(`总耗时: ${duration.toFixed(2)} 秒`);
    console.log("输出:");
    console.log(output);
    
    return {
        status,
        duration,
        output
    };
}

/**
 * 从测试输出中解析关键指标
 */
function parseResults(results) {
    const parsed = {};
    
    // 解析斐波那契测试结果
    if (results.fibonacci && results.fibonacci.status === '成功') {
        const output = results.fibonacci.output;
        let recursiveTime = null;
        let iterativeTime = null;
        
        const recursiveMatch = output.match(/递归方法: 结果 = \d+, 用时 = ([\d.]+) 秒/);
        if (recursiveMatch) {
            recursiveTime = parseFloat(recursiveMatch[1]);
        }
        
        const iterativeMatch = output.match(/迭代方法: 结果 = \d+, 用时 = ([\d.]+) 秒/);
        if (iterativeMatch) {
            iterativeTime = parseFloat(iterativeMatch[1]);
        }
        
        parsed.fibonacci = {
            recursive_time: recursiveTime,
            iterative_time: iterativeTime
        };
    }
    
    // 解析矩阵乘法测试结果
    if (results.matrix_mult && results.matrix_mult.status === '成功') {
        const output = results.matrix_mult.output;
        let mathjsTime = null;
        
        const mathjsMatch = output.match(/mathjs实现: 用时 = ([\d.]+) 秒/);
        if (mathjsMatch) {
            mathjsTime = parseFloat(mathjsMatch[1]);
        }
        
        parsed.matrix_mult = {
            mathjs_time: mathjsTime
        };
    }
    
    // 解析内存测试结果
    if (results.memory && results.memory.status === '成功') {
        const output = results.memory.output;
        let initialMemory = null;
        let afterCreationMemory = null;
        let memoryIncrease = null;
        let creationTime = null;
        let operationTime = null;
        
        const initialMemoryMatch = output.match(/初始内存使用: RSS = ([\d.]+) MB/);
        if (initialMemoryMatch) {
            initialMemory = parseFloat(initialMemoryMatch[1]);
        }
        
        const afterCreationMatch = output.match(/数组创建后内存使用: RSS = ([\d.]+) MB \(增加 ([\d.]+) MB\)/);
        if (afterCreationMatch) {
            afterCreationMemory = parseFloat(afterCreationMatch[1]);
            memoryIncrease = parseFloat(afterCreationMatch[2]);
        }
        
        const creationTimeMatch = output.match(/数组创建时间: ([\d.]+) 秒/);
        if (creationTimeMatch) {
            creationTime = parseFloat(creationTimeMatch[1]);
        }
        
        const operationTimeMatch = output.match(/操作时间: ([\d.]+) 秒/);
        if (operationTimeMatch) {
            operationTime = parseFloat(operationTimeMatch[1]);
        }
        
        parsed.memory = {
            initial_memory: initialMemory,
            after_creation_memory: afterCreationMemory,
            memory_increase: memoryIncrease,
            creation_time: creationTime,
            operation_time: operationTime
        };
    }
    
    // 解析文件I/O测试结果
    if (results.file_io && results.file_io.status === '成功') {
        const output = results.file_io.output;
        let writeTime = null;
        let writeSpeed = null;
        let readTime = null;
        let readSpeed = null;
        
        const writeTimeMatch = output.match(/写入完成, 用时: ([\d.]+) 秒/);
        if (writeTimeMatch) {
            writeTime = parseFloat(writeTimeMatch[1]);
        }
        
        const writeSpeedMatch = output.match(/写入速度: ([\d.]+) MB\/秒/);
        if (writeSpeedMatch) {
            writeSpeed = parseFloat(writeSpeedMatch[1]);
        }
        
        const readTimeMatch = output.match(/读取完成, 读取了 [\d.]+MB, 用时: ([\d.]+) 秒/);
        if (readTimeMatch) {
            readTime = parseFloat(readTimeMatch[1]);
        }
        
        const readSpeedMatch = output.match(/读取速度: ([\d.]+) MB\/秒/);
        if (readSpeedMatch) {
            readSpeed = parseFloat(readSpeedMatch[1]);
        }
        
        parsed.file_io = {
            write_time: writeTime,
            write_speed: writeSpeed,
            read_time: readTime,
            read_speed: readSpeed
        };
    }
    
    return parsed;
}

/**
 * 主函数
 */
function main() {
    console.log("=".repeat(50));
    console.log("Node.js性能测试脚本");
    console.log("=".repeat(50));
    console.log(`开始时间: ${new Date().toISOString()}`);
    console.log(`当前工作目录: ${process.cwd()}`);
    console.log("测试配置:");
    for (const [key, value] of Object.entries(CONFIG)) {
        console.log(`  - ${key}: ${value}`);
    }
    
    // 检查前提条件
    checkPrerequisites();
    
    // 运行测试
    const results = {};
    
    // 1. 斐波那契测试
    results.fibonacci = runTest(
        'node',
        [path.join(__dirname, 'nodejs/fibonacci_test.js'), CONFIG.fibonacci_n.toString()],
        '斐波那契数列计算'
    );
    
    // 2. 矩阵乘法测试
    results.matrix_mult = runTest(
        'node',
        [path.join(__dirname, 'nodejs/matrix_mult_test.js'), CONFIG.matrix_size.toString()],
        '矩阵乘法'
    );
    
    // 3. 内存测试
    results.memory = runTest(
        'node',
        ['--expose-gc', path.join(__dirname, 'nodejs/memory_test.js'), CONFIG.memory_array_size.toString()],
        '内存使用效率'
    );
    
    // 4. 文件I/O测试
    results.file_io = runTest(
        'node',
        [path.join(__dirname, 'nodejs/file_io_test.js'), CONFIG.file_io_size_mb.toString()],
        '文件I/O'
    );
    
    // 解析结果
    const parsedResults = parseResults(results);
    
    // 保存原始结果和解析后的结果
    const outputData = {
        timestamp: new Date().toISOString(),
        config: CONFIG,
        raw_results: results,
        parsed_results: parsedResults
    };
    
    fs.writeFileSync(CONFIG.output_file, JSON.stringify(outputData, null, 2));
    
    console.log("\n" + "=".repeat(50));
    console.log("测试完成。");
    console.log(`结果已保存至: ${CONFIG.output_file}`);
    console.log("=".repeat(50));
}

// 运行主函数
main();