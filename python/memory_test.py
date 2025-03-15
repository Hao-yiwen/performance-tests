#!/usr/bin/env python3
import psutil
import os
import time
import sys
import gc

def memory_usage():
    """获取当前进程的内存使用量（MB）"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def run_memory_test(array_size):
    """测试创建和操作大数组的内存使用情况"""
    # 强制垃圾回收
    gc.collect()
    time.sleep(0.1)
    
    # 初始内存使用
    initial_memory = memory_usage()
    print(f"初始内存使用: {initial_memory:.2f} MB")
    
    # 创建大数组
    print(f"创建大小为 {array_size} 的数组...")
    start_time = time.time()
    large_array = [i for i in range(array_size)]
    creation_time = time.time() - start_time
    
    after_creation_memory = memory_usage()
    print(f"数组创建后内存使用: {after_creation_memory:.2f} MB (增加 {after_creation_memory - initial_memory:.2f} MB)")
    print(f"数组创建时间: {creation_time:.6f} 秒")
    
    # 对数组进行操作
    print("执行数组求和操作...")
    start_time = time.time()
    sum_result = sum(large_array)
    operation_time = time.time() - start_time
    
    after_operation_memory = memory_usage()
    print(f"操作后内存使用: {after_operation_memory:.2f} MB (增加 {after_operation_memory - after_creation_memory:.2f} MB)")
    print(f"数组求和结果: {sum_result}, 操作时间: {operation_time:.6f} 秒")
    
    # 清理
    del large_array
    gc.collect()
    time.sleep(0.1)
    
    final_memory = memory_usage()
    print(f"清理后内存使用: {final_memory:.2f} MB")

if __name__ == "__main__":
    array_size = 10000000  # 1千万元素
    if len(sys.argv) > 1:
        array_size = int(sys.argv[1])
    
    run_memory_test(array_size)