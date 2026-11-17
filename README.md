# performance-tests

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Java](https://img.shields.io/badge/JDK-21-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)

用同一组题目，对比 **Python、Node.js、Java** 在 CPU、内存、文件读写上的耗时，并各带一个可手动启动的 HTTP 示例服务。这是一组可直接运行的基准脚本，用来观察三种运行时的数量级差异。

三种实现的算法和测量口径并不相同（例如矩阵乘法分别走 NumPy、mathjs、手写三重循环；内存分别读 RSS 或堆占用）。结果适合看趋势，不宜当成严格的同条件排名。

## 已有内容

每门语言各有 5 个脚本。前 4 项由根目录的汇总脚本依次调用，HTTP 服务需要单独启动。

| 测试 | 做什么 | 汇总脚本里的默认参数 |
| --- | --- | --- |
| 斐波那契 | 递归与迭代各算一次第 n 项，打印结果和秒数 | `n = 40` |
| 矩阵乘法 | 两个 n×n 随机矩阵相乘并计时 | `n = 1000` |
| 内存 | 创建长度为 n 的整数数组、求和、释放，打印内存和耗时 | `n = 10_000_000` |
| 文件 I/O | 按 1MB 块写入再读出临时文件 `test_large_file.bin`，结束后删除 | `1000` MB |
| HTTP 服务 | 监听 `/`、`/json`、`/stats`，默认 `127.0.0.1:8000` | 不在汇总脚本中 |

各语言的具体做法：

- **斐波那契**：三种语言都是朴素递归加循环迭代。
- **矩阵**：Python 用 NumPy `matmul`；边长 ≤ 200 时额外跑一次纯 Python 三重循环。Node.js 打算用 `mathjs.multiply`，边长 ≤ 200 时再跑手写循环。Java 只用 `double[][]` 三重循环。
- **内存**：Python 用 `psutil` 的 RSS；Node.js 打印 `process.memoryUsage()` 的 RSS 和堆；Java 打印堆已用量（`MemoryMXBean`），单位都是 MB。
- **文件**：Python、Node.js 写满 `'a'` 再整文件读回。Java 先走传统流，再走 NIO `FileChannel`，中间会删掉临时文件再写一遍。
- **HTTP**：Python 是 FastAPI + Uvicorn，Node.js 是 Express，Java 是 JDK 自带的 `com.sun.net.httpserver`（固定 10 个线程）。三条路径返回 JSON：`/` 为 `{"message":"Hello World"}`，`/json` 为带随机字段的对象，`/stats` 为请求计数等信息。仓库里没有压测客户端。

## 技术栈

| 部分 | 依赖 | 仓库中的版本 |
| --- | --- | --- |
| Node.js | `express`、`mathjs`（见 `package.json`） | express 4.21.2，mathjs 14.3.1 |
| Python 计算 | `numpy`、`psutil`（汇总脚本会检查这两项） | 未写入依赖文件。本环境的系统包是 NumPy 1.26.4 |
| Python HTTP | `fastapi`、`uvicorn` | 未写入依赖文件 |
| Java | JDK 自带类库，无第三方 jar | 已在 OpenJDK 21.0.13 上编译运行 |

`package.json` 的 `npm test` 只是占位脚本，不会跑这些基准。

## 目录

```text
.
├── python_test.py              # 依次跑 4 项 Python 测试，写出 python_perf_results.json
├── nodejs_test.js              # 依次跑 4 项 Node.js 测试，写出 nodejs_perf_results.json
├── java_test.sh                # 编译并跑 4 项 Java 测试，写出 java_perf_results.json
├── python/
│   ├── fibonacci_test.py
│   ├── matrix_mult_test.py
│   ├── memory_test.py
│   ├── file_io_test.py
│   └── http_server_test.py
├── nodejs/
│   ├── fibonacci_test.js
│   ├── matrix_mult_test.js
│   ├── memory_test.js
│   ├── file_io_test.js
│   └── http_server_test.js
├── java/
│   ├── FibonacciTest.java
│   ├── MatrixMultTest.java
│   ├── MemoryTest.java
│   ├── FileIOTest.java
│   └── HttpServerTest.java
├── python_perf_results.json    # 2025-03-15 的一次完整运行
├── nodejs_perf_results.json    # 同日运行；矩阵一项失败
└── java_perf_results.json      # 同日运行；文件内容不是合法 JSON
```

`java/` 里还提交了编译产物（`.class`）和上次汇总留下的 `*_result.tmp`。重新编译会覆盖 `.class`。`node_modules/` 也在版本库中，克隆后可以直接 `require`。

汇总脚本里的参数写死在各自的 `CONFIG` / 壳变量中，命令行不能改整套默认值。要换规模，直接把参数传给下面的单项脚本。请在仓库根目录执行，脚本使用相对路径。

## 环境

- Python 3.8 及以上（`python/file_io_test.py` 使用了海象运算符）。单项脚本用 `python3` 即可。两个汇总脚本内部调用的命令名是 `python`。
- Node.js。脚本只用内置模块外加 `mathjs` / `express`。历史结果由 Node.js 20.17.0 生成，下面的复核使用 Node.js 22.23.4。
- JDK：需要 `java` 和 `javac`。已在 OpenJDK 21 上验证。
- `java_test.sh` 额外需要 `bash`、`bc`、`perl`。
- 文件测试会在当前目录写 `test_large_file.bin`。默认 1000MB；Java 会写两遍（传统 I/O 与 NIO）。磁盘不足时请改小参数。
- 读之前会尝试 `sudo sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"`。没有 sudo 时测试继续，读速度可能含页缓存。

## 安装

```bash
# Node.js。仓库已带 node_modules 时可跳过
npm install

# Python 四项基准（numpy、psutil）
python3 -m pip install numpy psutil

# 只在要启动 Python HTTP 服务时需要
python3 -m pip install fastapi uvicorn

# 若系统没有 python 这个命令名，汇总脚本 python_test.py 会找不到解释器。
# Debian/Ubuntu 可用：sudo apt install python-is-python3
# java_test.sh 需要 bc：sudo apt install bc
```

## 运行单项测试

先用小参数确认环境，再考虑默认规模。斐波那契默认 `n=40` 的朴素递归在 Python 里大约十几秒；文件默认会写 1000MB。

```bash
# Python
python3 python/fibonacci_test.py 12
python3 python/matrix_mult_test.py 40
python3 python/memory_test.py 100000
python3 python/file_io_test.py 1          # 第二个参数是块大小 MB，默认 1

# Node.js
node nodejs/fibonacci_test.js 20
node --expose-gc nodejs/memory_test.js 100000
node nodejs/file_io_test.js 1

# Java（在 java/ 下编译，再用 -cp java 运行，与 java_test.sh 一致）
javac java/FibonacciTest.java java/MatrixMultTest.java java/MemoryTest.java java/FileIOTest.java
java -cp java FibonacciTest 20
java -cp java MatrixMultTest 40
java -cp java MemoryTest 100000
java -cp java FileIOTest 1 1              # 文件大小 MB，块大小 MB
```

Node.js 矩阵脚本当前无法执行。`nodejs/matrix_mult_test.js` 第 1 行是 `onst mathjs = require('mathjs');`，缺少 `const` 的首字母，Node 会报 `SyntaxError`。因此不要把下面的矩阵命令当成可用步骤；`nodejs_test.js` 仍会调用它，并把该条记为失败，其余三项继续。

```bash
node nodejs/matrix_mult_test.js 10
```

### 在本环境复核过的命令

操作系统为 Linux，解释器为 Python 3.12.3、Node.js 22.23.4、OpenJDK 21.0.13。下列命令已实际跑通，并得到预期的计时输出：

- `python3 python/fibonacci_test.py 12`
- `python3 python/matrix_mult_test.py 40`（NumPy 1.26.4；40≤200，所以同时打印了手写循环）
- `python3 python/memory_test.py 100000`（本次用 pip 安装了 psutil 7.2.2）
- `python3 python/file_io_test.py 1`（无 sudo，清缓存失败后仍完成读写并删除临时文件）
- `node nodejs/fibonacci_test.js 20`
- `node --expose-gc nodejs/memory_test.js 100000`
- `node nodejs/file_io_test.js 1`
- `javac` 后 `java -cp … FibonacciTest 20`、`MatrixMultTest 40`、`MemoryTest 100000`、`FileIOTest 1 1`

未跑默认规模的三个汇总脚本：它们会覆盖已提交的结果 JSON，文件项会写 1000MB，且本环境没有 `python` 命令和 `bc`。

## 一次跑完四项

在仓库根目录执行。成功后覆盖对应的 `*_perf_results.json`，结构为 `timestamp`、`config`、`raw_results`、`parsed_results`。

```bash
python python_test.py     # 需要命令名 python，以及 numpy、psutil
node nodejs_test.js       # 需要 mathjs；矩阵一项会因语法错误记为失败
./java_test.sh            # 需要 java、javac、bc、perl；会在 java/ 下重新编译
```

`java_test.sh` 用 `grep` 从整段输出里抠数字。内存输出里有两处「增加 … MB」，文件输出里传统 I/O 和 NIO 都有「读取=…秒」，抽到的字段会拼成非法 JSON。仓库里的 `java_perf_results.json` 因此无法被 `json.load` 解析。原始输出仍在 `raw_results.*.output` 里。

## HTTP 服务

三个进程默认都占用 `127.0.0.1:8000`，请分开端口启动。仓库不包含 wrk、ab 之类的压测工具。

```bash
python3 python/http_server_test.py --host 127.0.0.1 --port 8000
node nodejs/http_server_test.js 127.0.0.1 8000
javac java/HttpServerTest.java && java -cp java HttpServerTest 127.0.0.1 8000
```

- Python、Node.js 用 Ctrl+C 停止。
- Java 在前台终端里按 Enter 停止。标准输入一结束（被重定向、或后台运行时 stdin 已关闭），`System.in.read()` 会立刻返回，服务马上退出。
- `/` 与 `/json` 会计入 Python、Node.js、Java 的请求数；Python 的 `/json` 不计。`/stats` 只返回统计，不增加计数。Node.js 的 `/stats` 还带 uptime 和 `memoryUsage`，Java 的还带 uptime 和 `java.version`。

本环境已请求过这三条路径：Node.js（Express 4.21.2）在 18080，Java 在 stdin 保持打开时于 18081，Python（FastAPI 0.163.1 / Uvicorn 0.54.0，pip 安装）在 18082。三者的 `/`、`/json`、`/stats` 均返回 JSON。

## 仓库里已有的一次结果

时间为 2025-03-15，默认参数（斐波那契 40、矩阵 1000、数组 10⁷、文件 1000MB）。Node.js 那次用的是 v20.17.0。数字来自已提交的结果文件，只说明那一台机器上的一次运行。

| 指标 | Python | Node.js | Java |
| --- | --- | --- | --- |
| 递归斐波那契 | 17.353 秒 | 0.606 秒 | 0.249 秒 |
| 迭代斐波那契 | 约 0 秒 | 0.000238 秒 | 0.000001 秒 |
| 矩阵乘法 | NumPy 0.013 秒（整段含建矩阵约 3.08 秒） | 失败：`onst mathjs` 语法错误 | 三重循环 1.455 秒 |
| 数组创建后内存增量 | RSS +343.61 MB | RSS +156.72 MB | 堆 +199.91 MB |
| 文件写入 | 0.162 秒，6163 MB/秒 | 0.169 秒，5925 MB/秒 | 传统 I/O 0.187 秒，5362 MB/秒 |

Python 的 `parsed_results.memory.operation_time` 是 `null`：解析器用第一个 `: ` 切分，而该行以「数组求和结果:」开头。Java 的 NIO 读取在那次输出里只有 1.00MB。`FileIOTest.writeFileNIO` 在第一次 `flip` 写完后执行 `clear()`，下一轮 `flip()` 把 limit 设到 position 0，后续块不再写入。单块文件（例如 `FileIOTest 1 1`）看不出这个问题。

## 备注

- 临时文件名固定为当前目录下的 `test_large_file.bin`。中途失败时可能残留，可手动删除。
- 边长大于 200 时，Python 与 Node.js 会打印「矩阵太大，跳过手动实现测试」。
- Node.js 内存测试不加 `--expose-gc` 也能跑，只是不会在测量前主动 `gc()`。汇总脚本 `nodejs_test.js` 会带上该标志。
- Java 在 JDK 21 上编译 `MemoryTest` 时，会对已标记移除的 `System.runFinalization()` 给出警告，不影响运行。
