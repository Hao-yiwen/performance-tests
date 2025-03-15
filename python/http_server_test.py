#!/usr/bin/env python3
# 使用FastAPI实现的HTTP服务器性能测试

from fastapi import FastAPI
import uvicorn
import time
import random
import sys
import argparse

app = FastAPI()

# 简单的计数器用于统计请求数
request_count = 0

@app.get("/")
async def root():
    """返回简单的Hello World"""
    global request_count
    request_count += 1
    return {"message": "Hello World"}

@app.get("/json")
async def get_json():
    """返回稍微复杂的JSON数据"""
    return {
        "id": random.randint(1, 1000),
        "name": "Test Item",
        "timestamp": time.time(),
        "values": [random.random() for _ in range(10)],
        "metadata": {
            "server": "Python FastAPI",
            "version": "1.0",
            "status": "active"
        }
    }

@app.get("/stats")
async def get_stats():
    """返回服务器统计信息"""
    return {"total_requests": request_count}

def main():
    """启动HTTP服务器"""
    parser = argparse.ArgumentParser(description='Python FastAPI HTTP服务器性能测试')
    parser.add_argument('--host', default='127.0.0.1', help='服务器主机名')
    parser.add_argument('--port', type=int, default=8000, help='服务器端口')
    
    args = parser.parse_args()
    
    print(f"启动Python FastAPI HTTP服务器 http://{args.host}:{args.port}")
    print("路径:")
    print("  / - 简单消息")
    print("  /json - JSON响应")
    print("  /stats - 服务器统计")
    print("\n使用 Ctrl+C 停止服务器")
    
    uvicorn.run(app, host=args.host, port=args.port)

if __name__ == "__main__":
    main()