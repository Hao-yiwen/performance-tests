onst mathjs = require('mathjs');

/**
 * 使用mathjs库进行矩阵乘法测试
 */
function matrixMultiplyMathjs(size) {
    // 创建两个随机矩阵
    const matrixA = mathjs.random([size, size]);
    const matrixB = mathjs.random([size, size]);
    
    // 执行乘法并计时
    const start = process.hrtime.bigint();
    const result = mathjs.multiply(matrixA, matrixB);
    const end = process.hrtime.bigint();
    
    // 转换为秒
    return Number(end - start) / 1e9;
}

/**
 * 手动实现矩阵乘法
 */
function matrixMultiplyManual(size) {
    // 创建两个随机矩阵
    const matrixA = Array(size).fill().map(() => 
        Array(size).fill().map(() => Math.random()));
    const matrixB = Array(size).fill().map(() => 
        Array(size).fill().map(() => Math.random()));
    
    // 初始化结果矩阵
    const result = Array(size).fill().map(() => Array(size).fill(0));
    
    // 计时开始
    const start = process.hrtime.bigint();
    
    // 执行矩阵乘法
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }
    
    // 计时结束
    const end = process.hrtime.bigint();
    
    // 转换为秒
    return Number(end - start) / 1e9;
}

function main() {
    // 从命令行获取参数或使用默认值
    const size = process.argv.length > 2 ? parseInt(process.argv[2]) : 1000;
    
    console.log(`执行 ${size}x${size} 矩阵乘法测试`);
    
    // mathjs实现
    const mathjsTime = matrixMultiplyMathjs(size);
    console.log(`mathjs实现: 用时 = ${mathjsTime.toFixed(6)} 秒`);
    
    // 如果矩阵不太大，可以测试手动实现
    if (size <= 200) {
        const manualTime = matrixMultiplyManual(size);
        console.log(`手动实现: 用时 = ${manualTime.toFixed(6)} 秒`);
    } else {
        console.log("矩阵太大，跳过手动实现测试");
    }
}

main();