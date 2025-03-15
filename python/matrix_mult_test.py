#!/usr/bin/env python3
import time
import numpy as np
import sys

def matrix_multiply_numpy(size):
    """使用NumPy执行矩阵乘法"""
    # 创建两个随机矩阵
    matrix_a = np.random.rand(size, size)
    matrix_b = np.random.rand(size, size)
    
    start = time.time()
    result = np.matmul(matrix_a, matrix_b)
    end = time.time()
    
    return end - start

def matrix_multiply_manual(size):
    """手动实现矩阵乘法（性能较差，仅作为比较）"""
    # 创建两个随机矩阵
    matrix_a = [[np.random.random() for _ in range(size)] for _ in range(size)]
    matrix_b = [[np.random.random() for _ in range(size)] for _ in range(size)]
    
    # 初始化结果矩阵
    result = [[0 for _ in range(size)] for _ in range(size)]
    
    start = time.time()
    # 执行矩阵乘法
    for i in range(size):
        for j in range(size):
            for k in range(size):
                result[i][j] += matrix_a[i][k] * matrix_b[k][j]
    end = time.time()
    
    return end - start

if __name__ == "__main__":
    size = 1000
    if len(sys.argv) > 1:
        size = int(sys.argv[1])
    
    print(f"执行 {size}x{size} 矩阵乘法测试")
    
    # NumPy实现
    numpy_time = matrix_multiply_numpy(size)
    print(f"NumPy实现: 用时 = {numpy_time:.6f} 秒")
    
    # 如果矩阵不太大，可以测试手动实现
    if size <= 200:
        manual_time = matrix_multiply_manual(size)
        print(f"手动实现: 用时 = {manual_time:.6f} 秒")
    else:
        print("矩阵太大，跳过手动实现测试")