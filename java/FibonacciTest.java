public class FibonacciTest {
    /**
     * 递归方式计算斐波那契数列
     */
    public static long fibonacciRecursive(int n) {
        if (n <= 1) return n;
        return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
    }
    
    /**
     * 迭代方式计算斐波那契数列
     */
    public static long fibonacciIterative(int n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
    
    public static void main(String[] args) {
        // 从命令行获取参数或使用默认值
        int n = args.length > 0 ? Integer.parseInt(args[0]) : 40;
        
        System.out.printf("计算斐波那契数列第 %d 项\n", n);
        
        // 递归版本
        long startRecursive = System.nanoTime();
        long resultRecursive = fibonacciRecursive(n);
        long endRecursive = System.nanoTime();
        double timeRecursive = (endRecursive - startRecursive) / 1e9;
        
        System.out.printf("递归方法: 结果 = %d, 用时 = %.6f 秒\n", resultRecursive, timeRecursive);
        
        // 迭代版本
        long startIterative = System.nanoTime();
        long resultIterative = fibonacciIterative(n);
        long endIterative = System.nanoTime();
        double timeIterative = (endIterative - startIterative) / 1e9;
        
        System.out.printf("迭代方法: 结果 = %d, 用时 = %.6f 秒\n", resultIterative, timeIterative);
    }
}