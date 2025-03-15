import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;

public class MemoryTest {
    /**
     * 获取当前内存使用情况（MB）
     */
    public static double getMemoryUsage() {
        MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
        return memoryMXBean.getHeapMemoryUsage().getUsed() / (1024.0 * 1024.0);
    }
    
    /**
     * 强制进行垃圾收集
     */
    public static void forceGC() {
        System.gc();
        System.runFinalization();
    }
    
    /**
     * 运行内存测试
     */
    public static void runMemoryTest(int arraySize) {
        // 强制垃圾收集以获得更一致的起始状态
        forceGC();
        
        try {
            Thread.sleep(100); // 给GC一些时间完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 初始内存使用
        double initialMemory = getMemoryUsage();
        System.out.printf("初始内存使用: %.2f MB\n", initialMemory);
        
        // 创建大数组
        System.out.printf("创建大小为 %d 的数组...\n", arraySize);
        long startTime = System.nanoTime();
        List<Integer> largeArray = new ArrayList<>(arraySize);
        for (int i = 0; i < arraySize; i++) {
            largeArray.add(i);
        }
        long endTime = System.nanoTime();
        double creationTime = (endTime - startTime) / 1e9;
        
        // 创建后内存使用
        double afterCreationMemory = getMemoryUsage();
        System.out.printf("数组创建后内存使用: %.2f MB (增加 %.2f MB)\n", 
                         afterCreationMemory, (afterCreationMemory - initialMemory));
        System.out.printf("数组创建时间: %.6f 秒\n", creationTime);
        
        // 对数组进行操作
        System.out.println("执行数组求和操作...");
        startTime = System.nanoTime();
        long sum = 0;
        for (int value : largeArray) {
            sum += value;
        }
        endTime = System.nanoTime();
        double operationTime = (endTime - startTime) / 1e9;
        
        // 操作后内存使用
        double afterOperationMemory = getMemoryUsage();
        System.out.printf("操作后内存使用: %.2f MB (增加 %.2f MB)\n", 
                         afterOperationMemory, (afterOperationMemory - afterCreationMemory));
        System.out.printf("数组求和结果: %s, 操作时间: %.6f 秒\n", 
                         NumberFormat.getInstance().format(sum), operationTime);
        
        // 清理
        largeArray = null;
        forceGC();
        
        try {
            Thread.sleep(100); // 给GC一些时间完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 最终内存使用
        double finalMemory = getMemoryUsage();
        System.out.printf("清理后内存使用: %.2f MB\n", finalMemory);
    }
    
    public static void main(String[] args) {
        // 从命令行获取参数或使用默认值
        int arraySize = args.length > 0 ? Integer.parseInt(args[0]) : 10000000;
        
        runMemoryTest(arraySize);
    }
}