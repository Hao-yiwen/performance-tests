import java.util.Random;

public class MatrixMultTest {
    private static final Random random = new Random();
    
    /**
     * 使用基本数组执行矩阵乘法
     */
    public static double[][] multiply(double[][] a, double[][] b) {
        int rowsA = a.length;
        int colsA = a[0].length;
        int colsB = b[0].length;
        
        double[][] result = new double[rowsA][colsB];
        
        for (int i = 0; i < rowsA; i++) {
            for (int j = 0; j < colsB; j++) {
                for (int k = 0; k < colsA; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        
        return result;
    }
    
    /**
     * 创建指定大小的随机矩阵
     */
    public static double[][] createRandomMatrix(int rows, int cols) {
        double[][] matrix = new double[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                matrix[i][j] = random.nextDouble();
            }
        }
        return matrix;
    }
    
    public static void main(String[] args) {
        // 从命令行获取参数或使用默认值
        int size = args.length > 0 ? Integer.parseInt(args[0]) : 1000;
        
        System.out.printf("执行 %dx%d 矩阵乘法测试\n", size, size);
        
        // 创建随机矩阵
        System.out.println("创建随机矩阵...");
        double[][] matrixA = createRandomMatrix(size, size);
        double[][] matrixB = createRandomMatrix(size, size);
        
        // 执行乘法并计时
        System.out.println("执行矩阵乘法...");
        long start = System.nanoTime();
        double[][] result = multiply(matrixA, matrixB);
        long end = System.nanoTime();
        
        double time = (end - start) / 1e9;
        System.out.printf("矩阵乘法完成，用时 = %.6f 秒\n", time);
        
        // 输出结果矩阵的一个元素以验证计算
        System.out.printf("结果矩阵示例元素 [0][0] = %.6f\n", result[0][0]);
    }
}