#!/usr/bin/env python3
import time
import sys

def fibonacci_recursive(n):
    """递归方式计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)

def fibonacci_iterative(n):
    """迭代方式计算斐波那契数列"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n+1):
        a, b = b, a + b
    return b

if __name__ == "__main__":
    n = 40
    if len(sys.argv) > 1:
        n = int(sys.argv[1])
    
    print(f"计算斐波那契数列第 {n} 项")
    
    # 递归版本
    start = time.time()
    result = fibonacci_recursive(n)
    end = time.time()
    print(f"递归方法: 结果 = {result}, 用时 = {end - start:.6f} 秒")
    
    # 迭代版本
    start = time.time()
    result = fibonacci_iterative(n)
    end = time.time()
    print(f"迭代方法: 结果 = {result}, 用时 = {end - start:.6f} 秒")