#!/bin/bash
# Java性能测试脚本 - 运行所有Java性能测试并收集结果

# 测试配置参数
FIBONACCI_N=40
MATRIX_SIZE=1000
MEMORY_ARRAY_SIZE=10000000
FILE_IO_SIZE_MB=1000
OUTPUT_FILE="java_perf_results.json"

# 测试文件列表
TEST_FILES=(
    "./java/FibonacciTest.java"
    "./java/MatrixMultTest.java"
    "./java/MemoryTest.java"
    "./java/FileIOTest.java"
)

# 日志颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 检查测试前提条件
check_prerequisites() {
    echo "检查前提条件..."
    
    # 检查Java是否安装
    if ! command -v java &> /dev/null; then
        echo -e "${RED}错误: Java未安装${NC}"
        echo "请安装Java Development Kit (JDK)"
        exit 1
    fi
    
    # 检查javac是否安装
    if ! command -v javac &> /dev/null; then
        echo -e "${RED}错误: javac未安装${NC}"
        echo "请安装Java Development Kit (JDK)"
        exit 1
    fi
    
    # 输出Java版本信息
    echo "Java版本:"
    java -version
    
    # 检查测试文件是否存在
    missing_files=()
    for file in "${TEST_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo -e "${RED}错误: 以下测试文件不存在:${NC}"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        echo "请确保所有测试文件在当前目录中"
        exit 1
    fi
    
    echo -e "${GREEN}前提条件检查通过。${NC}"
}

# 编译Java文件
compile_java_files() {
    echo "编译Java测试文件..."
    
    for file in "${TEST_FILES[@]}"; do
        echo "编译 $file"
        if ! javac "$file"; then
            echo -e "${RED}错误: 编译 $file 失败${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}所有测试文件编译成功${NC}"
}

# 运行单个测试并返回结果
run_test() {
    local class_name="$1"
    shift
    local args="$@"
    local test_name="$class_name"
    
    echo -e "\n--- 运行测试: $test_name ---"
    echo "命令: java -cp java $class_name $args"
    
    local start_time=$(date +%s.%N)
    
    # 运行Java程序并捕获输出
    output=$(java -cp java "$class_name" $args 2>&1)
    local status=$?
    
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)
    
    if [ $status -eq 0 ]; then
        test_status="成功"
    else
        test_status="失败"
    fi
    
    echo -e "测试状态: ${test_status}"
    echo "总耗时: $(printf "%.2f" $duration) 秒"
    echo "输出:"
    echo "$output"
    
    # 保存结果到临时文件
    local result_file="${class_name}_result.tmp"
    echo "{" > "$result_file"
    echo "  \"status\": \"$test_status\"," >> "$result_file"
    echo "  \"duration\": $duration," >> "$result_file"
    # 处理输出中的特殊字符，将其转换为JSON安全格式
    echo "  \"output\": $(echo "$output" | perl -pe 's/\\/\\\\/g; s/"/\\"/g; s/\n/\\n/g; s/\r/\\r/g; s/\t/\\t/g;' | sed 's/^/"/' | sed 's/$/"/')" >> "$result_file"
    echo "}" >> "$result_file"
}

# 解析结果并生成JSON
generate_results_json() {
    echo "生成结果JSON文件..."
    
    # 创建输出文件头部
    cat > "$OUTPUT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "config": {
    "fibonacci_n": $FIBONACCI_N,
    "matrix_size": $MATRIX_SIZE,
    "memory_array_size": $MEMORY_ARRAY_SIZE,
    "file_io_size_mb": $FILE_IO_SIZE_MB
  },
  "raw_results": {
EOF
    
    # 添加原始测试结果
    echo "    \"fibonacci\": $(cat FibonacciTest_result.tmp)," >> "$OUTPUT_FILE"
    echo "    \"matrix_mult\": $(cat MatrixMultTest_result.tmp)," >> "$OUTPUT_FILE"
    echo "    \"memory\": $(cat MemoryTest_result.tmp)," >> "$OUTPUT_FILE"
    echo "    \"file_io\": $(cat FileIOTest_result.tmp)" >> "$OUTPUT_FILE"
    
    # 解析和添加关键指标
    echo "  }," >> "$OUTPUT_FILE"
    echo "  \"parsed_results\": {" >> "$OUTPUT_FILE"
    
    # 解析斐波那契测试结果
    recursive_time=$(grep -o "递归方法: 结果 = [0-9]*, 用时 = [0-9.]\+ 秒" FibonacciTest_result.tmp | grep -o "[0-9.]\+ 秒" | grep -o "[0-9.]\+")
    iterative_time=$(grep -o "迭代方法: 结果 = [0-9]*, 用时 = [0-9.]\+ 秒" FibonacciTest_result.tmp | grep -o "[0-9.]\+ 秒" | grep -o "[0-9.]\+")
    
    echo "    \"fibonacci\": {" >> "$OUTPUT_FILE"
    echo "      \"recursive_time\": $recursive_time," >> "$OUTPUT_FILE"
    echo "      \"iterative_time\": $iterative_time" >> "$OUTPUT_FILE"
    echo "    }," >> "$OUTPUT_FILE"
    
    # 解析矩阵乘法测试结果
    matrix_time=$(grep -o "矩阵乘法完成，用时 = [0-9.]\+ 秒" MatrixMultTest_result.tmp | grep -o "[0-9.]\+ 秒" | grep -o "[0-9.]\+")
    
    echo "    \"matrix_mult\": {" >> "$OUTPUT_FILE"
    echo "      \"java_time\": $matrix_time" >> "$OUTPUT_FILE"
    echo "    }," >> "$OUTPUT_FILE"
    
    # 解析内存测试结果
    initial_memory=$(grep -o "初始内存使用: [0-9.]\+ MB" MemoryTest_result.tmp | grep -o "[0-9.]\+ MB" | grep -o "[0-9.]\+")
    after_creation_memory=$(grep -o "数组创建后内存使用: [0-9.]\+ MB" MemoryTest_result.tmp | grep -o "[0-9.]\+ MB" | grep -o "[0-9.]\+")
    memory_increase=$(grep -o "增加 [0-9.]\+ MB" MemoryTest_result.tmp | grep -o "[0-9.]\+ MB" | grep -o "[0-9.]\+")
    creation_time=$(grep -o "数组创建时间: [0-9.]\+ 秒" MemoryTest_result.tmp | grep -o "[0-9.]\+ 秒" | grep -o "[0-9.]\+")
    operation_time=$(grep -o "操作时间: [0-9.]\+ 秒" MemoryTest_result.tmp | grep -o "[0-9.]\+ 秒" | grep -o "[0-9.]\+")
    
    echo "    \"memory\": {" >> "$OUTPUT_FILE"
    echo "      \"initial_memory\": $initial_memory," >> "$OUTPUT_FILE"
    echo "      \"after_creation_memory\": $after_creation_memory," >> "$OUTPUT_FILE"
    echo "      \"memory_increase\": $memory_increase," >> "$OUTPUT_FILE"
    echo "      \"creation_time\": $creation_time," >> "$OUTPUT_FILE"
    echo "      \"operation_time\": $operation_time" >> "$OUTPUT_FILE"
    echo "    }," >> "$OUTPUT_FILE"
    
    # 解析文件I/O测试结果
    traditional_write_time=$(grep -o "传统I/O: 写入=[0-9.]\+秒" FileIOTest_result.tmp | grep -o "写入=[0-9.]\+秒" | grep -o "[0-9.]\+")
    traditional_read_time=$(grep -o "读取=[0-9.]\+秒" FileIOTest_result.tmp | grep -o "[0-9.]\+")
    nio_write_time=$(grep -o "NIO: 写入=[0-9.]\+秒" FileIOTest_result.tmp | grep -o "写入=[0-9.]\+秒" | grep -o "[0-9.]\+")
    nio_read_time=$(grep -o "读取=[0-9.]\+秒" FileIOTest_result.tmp | grep -o "[0-9.]\+" | tail -1)
    
    echo "    \"file_io\": {" >> "$OUTPUT_FILE"
    echo "      \"traditional_write_time\": $traditional_write_time," >> "$OUTPUT_FILE"
    echo "      \"traditional_read_time\": $traditional_read_time," >> "$OUTPUT_FILE"
    echo "      \"nio_write_time\": $nio_write_time," >> "$OUTPUT_FILE"
    echo "      \"nio_read_time\": $nio_read_time" >> "$OUTPUT_FILE"
    echo "    }" >> "$OUTPUT_FILE"
    
    # 结束JSON文件
    echo "  }" >> "$OUTPUT_FILE"
    echo "}" >> "$OUTPUT_FILE"
    
    # 清理临时文件
    rm -f *_result.tmp
}

# 主函数
main() {
    echo "=========================================="
    echo "Java性能测试脚本"
    echo "=========================================="
    echo "开始时间: $(date)"
    echo "当前工作目录: $(pwd)"
    echo "测试配置:"
    echo "  - fibonacci_n: $FIBONACCI_N"
    echo "  - matrix_size: $MATRIX_SIZE"
    echo "  - memory_array_size: $MEMORY_ARRAY_SIZE"
    echo "  - file_io_size_mb: $FILE_IO_SIZE_MB"
    
    # 检查前提条件
    check_prerequisites
    
    # 编译Java文件
    compile_java_files
    
    # 运行测试
    echo -e "\n${YELLOW}开始执行测试...${NC}"
    
    # 1. 斐波那契测试
    run_test "FibonacciTest" "$FIBONACCI_N"
    
    # 2. 矩阵乘法测试
    run_test "MatrixMultTest" "$MATRIX_SIZE"
    
    # 3. 内存测试
    run_test "MemoryTest" "$MEMORY_ARRAY_SIZE"
    
    # 4. 文件I/O测试
    run_test "FileIOTest" "$FILE_IO_SIZE_MB" "1"
    
    # 生成JSON结果
    generate_results_json
    
    echo -e "\n${GREEN}测试完成。${NC}"
    echo "结果已保存至: $OUTPUT_FILE"
    echo "=========================================="
}

# 运行主函数
main