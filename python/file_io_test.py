#!/usr/bin/env python3
import os
import time
import sys

def write_large_file(filename, size_mb, chunk_size_mb=1):
    """写入大文件测试"""
    chunk = b'a' * (chunk_size_mb * 1024 * 1024)  # 创建指定大小的数据块
    
    print(f"开始写入 {size_mb}MB 文件...")
    start = time.time()
    
    with open(filename, 'wb') as f:
        for _ in range(size_mb // chunk_size_mb):
            f.write(chunk)
    
    end = time.time()
    elapsed = end - start
    throughput = size_mb / elapsed
    
    print(f"写入完成, 用时: {elapsed:.3f} 秒")
    print(f"写入速度: {throughput:.2f} MB/秒")
    return elapsed

def read_large_file(filename, chunk_size_mb=1):
    """读取大文件测试"""
    chunk_size = chunk_size_mb * 1024 * 1024  # MB转换为字节
    file_size_mb = os.path.getsize(filename) / (1024 * 1024)
    
    print(f"开始读取 {file_size_mb:.2f}MB 文件...")
    start = time.time()
    
    total_read = 0
    with open(filename, 'rb') as f:
        while chunk := f.read(chunk_size):
            total_read += len(chunk)
    
    end = time.time()
    elapsed = end - start
    throughput = file_size_mb / elapsed
    
    print(f"读取完成, 读取了 {total_read / (1024 * 1024):.2f}MB, 用时: {elapsed:.3f} 秒")
    print(f"读取速度: {throughput:.2f} MB/秒")
    return elapsed

def run_file_io_test(size_mb=1000, chunk_size_mb=1):
    """运行文件I/O测试"""
    filename = "test_large_file.bin"
    
    # 写入测试
    write_time = write_large_file(filename, size_mb, chunk_size_mb)
    
    # 清除缓存以确保公平测试（仅在Linux上有效）
    if sys.platform.startswith('linux'):
        print("清除系统缓存...")
        os.system('sudo sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"')
    
    # 读取测试
    read_time = read_large_file(filename, chunk_size_mb)
    
    # 清理
    if os.path.exists(filename):
        os.remove(filename)
        print(f"已删除测试文件 {filename}")
    
    return write_time, read_time

if __name__ == "__main__":
    size_mb = 1000  # 默认1GB
    if len(sys.argv) > 1:
        size_mb = int(sys.argv[1])
    
    chunk_size_mb = 1  # 默认1MB
    if len(sys.argv) > 2:
        chunk_size_mb = int(sys.argv[2])
    
    print(f"运行文件I/O测试 (文件大小: {size_mb}MB, 块大小: {chunk_size_mb}MB)")
    write_time, read_time = run_file_io_test(size_mb, chunk_size_mb)