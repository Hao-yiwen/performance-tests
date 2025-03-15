import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.lang.management.ManagementFactory;

public class HttpServerTest {
    private static final AtomicInteger requestCount = new AtomicInteger(0);
    private static final Random random = new Random();
    
    /**
     * 简单的Hello World处理器
     */
    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            requestCount.incrementAndGet();
            String response = "{\"message\":\"Hello World\"}";
            sendJsonResponse(exchange, response);
        }
    }
    
    /**
     * 复杂JSON响应处理器
     */
    static class JsonHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            requestCount.incrementAndGet();
            
            // 创建复杂JSON
            StringBuilder valuesJson = new StringBuilder("[");
            for (int i = 0; i < 10; i++) {
                if (i > 0) valuesJson.append(",");
                valuesJson.append(random.nextDouble());
            }
            valuesJson.append("]");
            
            String response = String.format(
                "{\"id\":%d,\"name\":\"Test Item\",\"timestamp\":%d,\"values\":%s,\"metadata\":{\"server\":\"Java HttpServer\",\"version\":\"1.0\",\"status\":\"active\"}}",
                random.nextInt(1000) + 1,
                System.currentTimeMillis(),
                valuesJson.toString()
            );
            
            sendJsonResponse(exchange, response);
        }
    }
    
    /**
     * 统计信息处理器
     */
    static class StatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = String.format(
                "{\"total_requests\":%d,\"uptime\":%.2f,\"java_version\":\"%s\"}",
                requestCount.get(),
                ManagementFactory.getRuntimeMXBean().getUptime() / 1000.0,
                System.getProperty("java.version")
            );
            
            sendJsonResponse(exchange, response);
        }
    }
    
    /**
     * 发送JSON响应
     */
    private static void sendJsonResponse(HttpExchange exchange, String responseText) throws IOException {
        byte[] responseBytes = responseText.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, responseBytes.length);
        
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }
    
    public static void main(String[] args) {
        String host = args.length > 0 ? args[0] : "127.0.0.1";
        int port = args.length > 1 ? Integer.parseInt(args[1]) : 8000;
        
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(host, port), 0);
            
            // 设置线程池
            server.setExecutor(Executors.newFixedThreadPool(10));
            
            // 添加处理器
            server.createContext("/", new RootHandler());
            server.createContext("/json", new JsonHandler());
            server.createContext("/stats", new StatsHandler());
            
            // 启动服务器
            server.start();
            
            System.out.printf("启动Java HTTP服务器 http://%s:%d\n", host, port);
            System.out.println("路径:");
            System.out.println("  / - 简单消息");
            System.out.println("  /json - JSON响应");
            System.out.println("  /stats - 服务器统计");
            System.out.println("\n按Enter键停止服务器");
            
            // 等待用户输入以停止
            System.in.read();
            server.stop(0);
            System.out.println("服务器已停止");
            
        } catch (IOException e) {
            System.err.println("服务器错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
}