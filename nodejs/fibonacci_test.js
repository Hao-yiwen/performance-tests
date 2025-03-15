
/**
 * 递归方式计算斐波那契数列
 */
function fibonacciRecursive(n) {
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

/**
 * 迭代方式计算斐波那契数列
 */
function fibonacciIterative(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

function main() {
    // 从命令行获取参数或使用默认值
    const n = process.argv.length > 2 ? parseInt(process.argv[2]) : 40;
    
    console.log(`计算斐波那契数列第 ${n} 项`);
    
    // 递归版本
    const startRecursive = process.hrtime.bigint();
    const resultRecursive = fibonacciRecursive(n);
    const endRecursive = process.hrtime.bigint();
    const timeRecursive = Number(endRecursive - startRecursive) / 1e9;
    
    console.log(`递归方法: 结果 = ${resultRecursive}, 用时 = ${timeRecursive.toFixed(6)} 秒`);
    
    // 迭代版本
    const startIterative = process.hrtime.bigint();
    const resultIterative = fibonacciIterative(n);
    const endIterative = process.hrtime.bigint();
    const timeIterative = Number(endIterative - startIterative) / 1e9;
    
    console.log(`迭代方法: 结果 = ${resultIterative}, 用时 = ${timeIterative.toFixed(6)} 秒`);
}

main();