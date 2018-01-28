# 日志文件

使用一个软件总是不可避免出现一些问题，比如说你用着某个软件突然间崩溃了，兴冲冲向开发者反馈说软件有崩溃现象。开发者问你日志，你没有；问你详细情况，你支支吾吾说不出来。比较和蔼的开发者可能会跟你说：好的，我知道了，这个问题会解决的。内心独白却是：mdzz，啥也说不出来，日志也没有还瞎 bb。

以上纯属杜撰，我非计算机软件的从业人员，不清楚里边的情况，诸位看官一看笑过便好不必当真。

但是，对于软件开发者来说使用查看日志是一种非常有效的调试手段。咱普通使用日志可以知道软件的运行状况，并且当软件出现异常时提供日志给开发者可以令开发者更加容易找到问题的根源，促进软件问题的修复。

## 配置

### 客户端配置

```javascript
{
  "log": {
    "loglevel": "warning", // 日志级别
    "access": "D:\\v2ray\\access.log",  // 这是 Windows 系统的路径
    "error": "D:\\v2ray\\error.log"
  },
  "inbound": {
    "port": 1080,
    "protocol": "socks",
    "settings": {
      "auth": "noauth"
    }
  },
  "outbound": {
    "protocol": "vmess",
    "settings": {
      "vnext": [
        {
          "address": "serveraddr.com",
          "port": 16823,  
          "users": [
            {
              "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
              "alterId": 64
            }
          ]
        }
      ]
    }
  }
}
```

### 服务器配置

```javascript
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log", // 这是 Linux 的路径
    "error": "/var/log/v2ray/error.log"
  },
  "inbound": {
    "port": 16823,
    "protocol": "vmess",   
    "settings": {
      "clients": [
        {
          "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
          "alterId": 64
        }
      ]
    }
  },
  "outbound": {
    "protocol": "freedom",  
    "settings": {}
  }
}
```

依次看 log 的选项：
* loglevel：日志级别，分别有5个
  - debug：最详细的日志信息，专用于软件调试
  - info：比较详细的日志信息，可以看到 V2Ray 详细的连接信息。
  - warning：警告信息。轻微的问题信息，经我观察 warning 级别的信息大多是网络错误。推荐使用 warning
  - error：错误信息。比较严重的错误信息。当出现 error 时该问题足以影响 V2Ray 的正常运行。
  - none：空。不记录任何信息
* access：将访问的记录保存到文件中，这个选项的值是要保存到的文件的路径
* error：将错误的记录保存到文件中，这个选项的值是要保存到的文件的路径
* error、access 字段留空，并且在手动执行 V2Ray 时，V2Ray 会将日志输出在 stdout 即命令行中（terminal、cmd 等），便于排错

**需要注意的一点是，在 json 中，反斜杠 \\ 有特殊意义，因此 Windows 操作系统目录的 \\ 符号在配置中要使用 \\\\ 来表示。**
