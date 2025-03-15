#!/usr/bin/env python3
"""
Python性能测试脚本 - 运行所有Python性能测试并收集结果
"""

import os
import sys
import time
import subprocess
import json
from datetime import datetime

# 测试配置参数
CONFIG = {
    "fibonacci_n": 40,             # 斐波那契数列项数
    "matrix_size": 1000,           # 矩阵大小
    "memory_array_size": 10000000, # 内存测试数组大小
    "file_io_size_mb": 1000,       # 文件I/O测试文件大小(MB)
    "output_file": "python_perf_results.json"  # 结果输出文件
}

# 确保测试文件存在
TEST_FILES = [
    "./python/fibonacci_test.py",
    "./python/matrix_mult_test.py",
    "./python/memory_test.py",
    "./python/file_io_test.py"
]

def check_prerequisites():
    """检查测试前提条件"""
    missing_files = []
    for file in TEST_FILES:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("错误: 以下测试文件不存在:")
        for file in missing_files:
            print(f"  - {file}")
        print("请确保所有测试文件在当前目录中")
        sys.exit(1)
    
    # 检查必要的Python包
    try:
        import numpy
        import psutil
    except ImportError as e:
        print(f"错误: 缺少必要的Python包: {e}")
        print("请运行: pip install numpy psutil")
        sys.exit(1)
    
    print("前提条件检查通过。")

def run_test(command, test_name):
    """运行单个测试并返回结果"""
    print(f"\n--- 运行测试: {test_name} ---")
    print(f"命令: {' '.join(command)}")
    
    start_time = time.time()
    try:
        process = subprocess.run(command, check=True, capture_output=True, text=True)
        output = process.stdout
        status = "成功"
    except subprocess.CalledProcessError as e:
        output = e.stderr
        status = "失败"
    except Exception as e:
        output = str(e)
        status = "错误"
    
    duration = time.time() - start_time
    
    print(f"测试状态: {status}")
    print(f"总耗时: {duration:.2f} 秒")
    print("输出:")
    print(output)
    
    return {
        "status": status,
        "duration": duration,
        "output": output
    }

def parse_results(results):
    """从测试输出中解析关键指标"""
    parsed = {}
    
    # 解析斐波那契测试结果
    if "fibonacci" in results and results["fibonacci"]["status"] == "成功":
        output = results["fibonacci"]["output"]
        recursive_time = None
        iterative_time = None
        
        for line in output.split("\n"):
            if "递归方法" in line and "用时" in line:
                try:
                    recursive_time = float(line.split("用时 = ")[1].split(" 秒")[0])
                except:
                    pass
            elif "迭代方法" in line and "用时" in line:
                try:
                    iterative_time = float(line.split("用时 = ")[1].split(" 秒")[0])
                except:
                    pass
        
        parsed["fibonacci"] = {
            "recursive_time": recursive_time,
            "iterative_time": iterative_time
        }
    
    # 解析矩阵乘法测试结果
    if "matrix_mult" in results and results["matrix_mult"]["status"] == "成功":
        output = results["matrix_mult"]["output"]
        numpy_time = None
        
        for line in output.split("\n"):
            if "NumPy实现" in line and "用时" in line:
                try:
                    numpy_time = float(line.split("用时 = ")[1].split(" 秒")[0])
                except:
                    pass
        
        parsed["matrix_mult"] = {
            "numpy_time": numpy_time
        }
    
    # 解析内存测试结果
    if "memory" in results and results["memory"]["status"] == "成功":
        output = results["memory"]["output"]
        initial_memory = None
        after_creation_memory = None
        memory_increase = None
        creation_time = None
        operation_time = None
        
        for line in output.split("\n"):
            if "初始内存使用" in line:
                try:
                    initial_memory = float(line.split(": ")[1].split(" MB")[0])
                except:
                    pass
            elif "数组创建后内存使用" in line:
                try:
                    after_creation_memory = float(line.split(": ")[1].split(" MB")[0])
                    memory_increase = float(line.split("增加 ")[1].split(" MB")[0])
                except:
                    pass
            elif "数组创建时间" in line:
                try:
                    creation_time = float(line.split(": ")[1].split(" 秒")[0])
                except:
                    pass
            elif "操作时间" in line:
                try:
                    operation_time = float(line.split(": ")[1].split(" 秒")[0])
                except:
                    pass
        
        parsed["memory"] = {
            "initial_memory": initial_memory,
            "after_creation_memory": after_creation_memory,
            "memory_increase": memory_increase,
            "creation_time": creation_time,
            "operation_time": operation_time
        }
    
    # 解析文件I/O测试结果
    if "file_io" in results and results["file_io"]["status"] == "成功":
        output = results["file_io"]["output"]
        write_time = None
        write_speed = None
        read_time = None
        read_speed = None
        
        for line in output.split("\n"):
            if "写入完成" in line and "用时" in line:
                try:
                    write_time = float(line.split("用时: ")[1].split(" 秒")[0])
                except:
                    pass
            elif "写入速度" in line:
                try:
                    write_speed = float(line.split(": ")[1].split(" MB/秒")[0])
                except:
                    pass
            elif "读取完成" in line and "用时" in line:
                try:
                    read_time = float(line.split("用时: ")[1].split(" 秒")[0])
                except:
                    pass
            elif "读取速度" in line:
                try:
                    read_speed = float(line.split(": ")[1].split(" MB/秒")[0])
                except:
                    pass
        
        parsed["file_io"] = {
            "write_time": write_time,
            "write_speed": write_speed,
            "read_time": read_time,
            "read_speed": read_speed
        }
    
    return parsed

def main():
    """主函数"""
    print("=" * 50)
    print("Python性能测试脚本")
    print("=" * 50)
    print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"当前工作目录: {os.getcwd()}")
    print("测试配置:")
    for key, value in CONFIG.items():
        print(f"  - {key}: {value}")
    
    # 检查前提条件
    check_prerequisites()
    
    # 运行测试
    results = {}
    
    # 1. 斐波那契测试
    results["fibonacci"] = run_test(
        ["python", TEST_FILES[0], str(CONFIG["fibonacci_n"])],
        "斐波那契数列计算"
    )
    
    # 2. 矩阵乘法测试
    results["matrix_mult"] = run_test(
        ["python", TEST_FILES[1], str(CONFIG["matrix_size"])],
        "矩阵乘法"
    )
    
    # 3. 内存测试
    results["memory"] = run_test(
        ["python", TEST_FILES[2], str(CONFIG["memory_array_size"])],
        "内存使用效率"
    )
    
    # 4. 文件I/O测试
    results["file_io"] = run_test(
        ["python", TEST_FILES[3], str(CONFIG["file_io_size_mb"])],
        "文件I/O"
    )
    
    # 解析结果
    parsed_results = parse_results(results)
    
    # 保存原始结果和解析后的结果
    output_data = {
        "timestamp": datetime.now().isoformat(),
        "config": CONFIG,
        "raw_results": results,
        "parsed_results": parsed_results
    }
    
    with open(CONFIG["output_file"], 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print("\n" + "=" * 50)
    print("测试完成。")
    print(f"结果已保存至: {CONFIG['output_file']}")
    print("=" * 50)

if __name__ == "__main__":
    main()