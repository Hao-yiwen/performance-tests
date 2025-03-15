import java.io.*;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class FileIOTest {
    /**
     * 使用传统I/O写入大文件
     */
    public static double writeFileTraditional(String filename, int sizeMB, int chunkSizeMB) throws IOException {
        byte[] chunk = new byte[chunkSizeMB * 1024 * 1024];
        // 填充'a'字符
        for (int i = 0; i < chunk.length; i++) {
            chunk[i] = (byte)'a';
        }
        
        System.out.printf("开始写入 %dMB 文件 (传统I/O)...\n", sizeMB);
        long start = System.nanoTime();
        
        try (FileOutputStream fos = new FileOutputStream(filename)) {
            for (int i = 0; i < sizeMB / chunkSizeMB; i++) {
                fos.write(chunk);
            }
            fos.flush();
        }
        
        long end = System.nanoTime();
        double elapsed = (end - start) / 1e9;
        double throughput = sizeMB / elapsed;
        
        System.out.printf("写入完成, 用时: %.3f 秒\n", elapsed);
        System.out.printf("写入速度: %.2f MB/秒\n", throughput);
        
        return elapsed;
    }
    
    /**
     * 使用NIO写入大文件
     */
    public static double writeFileNIO(String filename, int sizeMB, int chunkSizeMB) throws IOException {
        ByteBuffer buffer = ByteBuffer.allocateDirect(chunkSizeMB * 1024 * 1024);
        // 填充'a'字符
        for (int i = 0; i < buffer.capacity(); i++) {
            buffer.put((byte)'a');
        }
        
        System.out.printf("开始写入 %dMB 文件 (NIO)...\n", sizeMB);
        long start = System.nanoTime();
        
        try (FileChannel channel = FileChannel.open(Paths.get(filename),
                StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
            for (int i = 0; i < sizeMB / chunkSizeMB; i++) {
                buffer.flip();
                while (buffer.hasRemaining()) {
                    channel.write(buffer);
                }
                buffer.clear();
            }
            channel.force(true);
        }
        
        long end = System.nanoTime();
        double elapsed = (end - start) / 1e9;
        double throughput = sizeMB / elapsed;
        
        System.out.printf("写入完成, 用时: %.3f 秒\n", elapsed);
        System.out.printf("写入速度: %.2f MB/秒\n", throughput);
        
        return elapsed;
    }
    
    /**
     * 使用传统I/O读取大文件
     */
    public static double readFileTraditional(String filename, int chunkSizeMB) throws IOException {
        Path path = Paths.get(filename);
        long fileSize = Files.size(path);
        double fileSizeMB = fileSize / (1024.0 * 1024.0);
        
        System.out.printf("开始读取 %.2fMB 文件 (传统I/O)...\n", fileSizeMB);
        long start = System.nanoTime();
        
        byte[] buffer = new byte[chunkSizeMB * 1024 * 1024];
        long totalRead = 0;
        
        try (FileInputStream fis = new FileInputStream(filename)) {
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                totalRead += bytesRead;
            }
        }
        
        long end = System.nanoTime();
        double elapsed = (end - start) / 1e9;
        double throughput = fileSizeMB / elapsed;
        
        System.out.printf("读取完成, 读取了 %.2fMB, 用时: %.3f 秒\n", 
                         totalRead / (1024.0 * 1024.0), elapsed);
        System.out.printf("读取速度: %.2f MB/秒\n", throughput);
        
        return elapsed;
    }
    
    /**
     * 使用NIO读取大文件
     */
    public static double readFileNIO(String filename, int chunkSizeMB) throws IOException {
        Path path = Paths.get(filename);
        long fileSize = Files.size(path);
        double fileSizeMB = fileSize / (1024.0 * 1024.0);
        
        System.out.printf("开始读取 %.2fMB 文件 (NIO)...\n", fileSizeMB);
        long start = System.nanoTime();
        
        ByteBuffer buffer = ByteBuffer.allocateDirect(chunkSizeMB * 1024 * 1024);
        long totalRead = 0;
        
        try (FileChannel channel = FileChannel.open(path, StandardOpenOption.READ)) {
            int bytesRead;
            while ((bytesRead = channel.read(buffer)) != -1) {
                totalRead += bytesRead;
                buffer.clear();
            }
        }
        
        long end = System.nanoTime();
        double elapsed = (end - start) / 1e9;
        double throughput = fileSizeMB / elapsed;
        
        System.out.printf("读取完成, 读取了 %.2fMB, 用时: %.3f 秒\n", 
                         totalRead / (1024.0 * 1024.0), elapsed);
        System.out.printf("读取速度: %.2f MB/秒\n", throughput);
        
        return elapsed;
    }
    
    /**
     * 清除系统缓存（仅Linux）
     */
    public static void clearSystemCache() {
        if (System.getProperty("os.name").toLowerCase().contains("linux")) {
            try {
                System.out.println("尝试清除系统缓存...");
                Process process = Runtime.getRuntime().exec("sudo sh -c \"sync; echo 3 > /proc/sys/vm/drop_caches\"");
                int exitCode = process.waitFor();
                if (exitCode == 0) {
                    System.out.println("系统缓存已清除");
                } else {
                    System.out.println("无法清除系统缓存");
                }
            } catch (Exception e) {
                System.out.println("清除缓存失败: " + e.getMessage());
            }
        }
    }
    
    public static void main(String[] args) {
        int sizeMB = args.length > 0 ? Integer.parseInt(args[0]) : 1000;
        int chunkSizeMB = args.length > 1 ? Integer.parseInt(args[1]) : 1;
        String filename = "test_large_file.bin";
        
        System.out.printf("运行文件I/O测试 (文件大小: %dMB, 块大小: %dMB)\n", sizeMB, chunkSizeMB);
        
        try {
            // 传统I/O写入
            double traditionalWriteTime = writeFileTraditional(filename, sizeMB, chunkSizeMB);
            
            // 清除缓存
            clearSystemCache();
            
            // 传统I/O读取
            double traditionalReadTime = readFileTraditional(filename, chunkSizeMB);
            
            // 删除文件，准备NIO测试
            Files.deleteIfExists(Paths.get(filename));
            
            // NIO写入
            double nioWriteTime = writeFileNIO(filename, sizeMB, chunkSizeMB);
            
            // 清除缓存
            clearSystemCache();
            
            // NIO读取
            double nioReadTime = readFileNIO(filename, chunkSizeMB);
            
            // 清理文件
            Files.deleteIfExists(Paths.get(filename));
            System.out.println("已删除测试文件");
            
            // 输出结果摘要
            System.out.println("\n结果摘要:");
            System.out.printf("传统I/O: 写入=%.3f秒, 读取=%.3f秒\n", traditionalWriteTime, traditionalReadTime);
            System.out.printf("NIO: 写入=%.3f秒, 读取=%.3f秒\n", nioWriteTime, nioReadTime);
            
        } catch (IOException e) {
            System.err.println("I/O错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
}