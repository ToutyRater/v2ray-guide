# 国内 VPS 中转

为了维护方便，有时候在国内架设一台中转 VPS，在这台 VPS 上判断目标地址是国内还是国外的，只把国外的流量向国外 VPS 转发，而国内的流量使用直连。这样的配置，在用户的电脑只需要把所有流量发往这台 VPS，而不用为每一个用户都配置白名单，较为省力。

```javascript
{
  "log" : {                                 // [日志](../chapter_02/01_overview.md)
    "access": "/var/log/v2ray/access.log",  // 访问日志文件
    "error": "/var/log/v2ray/error.log",    // 错误日志文件
    "loglevel": "warning"                   // 错误日志等级
  },
  "inbound": {              // 主传入协议
    "port": 12345,          // 主端口
    "protocol": "vmess",    // 在这里使用 [VMess 协议](../chapter_02/protocols/vmess.md)
    "settings": {
      "clients": [
        {
          "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // UUID
          "level": 1,       // 用户等级
          "alterId": 64     // 额外ID
        }
        // 在这里添加更多用户，注意UUID不能重复
        ,{
          "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy", // UUID
          "level": 0,       // 用户等级
          "alterId": 32     // 额外ID
        }
      ]
    }
  },
  // ========== BEGIN STEP 1 ==========
  // 国内服务器当作国外服务器的“客户端”
  // 国际流量发往国外服务器上
  "outbound": {
    "protocol": "vmess",        // 出口协议
    "settings": {
      "vnext": [
        {
          "address": "1.2.3.4", // 国外服务器地址
          "port": 23456,        // 国外服务器端口
          "users": [
            {"id": "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz"} // 用户 ID，须与国外服务器端配置相同
          ]
        }
      ]
    }
  },
  // ========== END STEP 1 ==========
  "outboundDetour": [       // 额外传出协议
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "blocked"
    }
    // ========== BEGIN STEP 2 ==========
    // 增加freedom传出绕路，国内流量直接放行
    ,{
      "protocol": "freedom",
      "tag": "direct",
      "settings": {}
    }
    // ========== END STEP 2 ==========
  ],
  "routing": {                  // 路由设置
    "strategy": "rules",
    "settings": {
      "rules": [
          // ========== BEGIN STEP 3 ==========
          // 配置国内网站和IP直连规则
          {
            "type": "chinaip", // 对于所有国内的 IP，都采用直连模式
            "outboundTag": "direct"
          },
          {
            "type": "field",  // 对于一些常见的网站，也使用直连模式
            "domain": [
              "qq.com",
              "baidu.com"
            ],
            "outboundTag": "direct"
          },
          // ========== END STEP 3 ==========
          "type": "field",      // 不允许客户端访问服务端的局域网地址，以提升安全性
          "ip": [
            "0.0.0.0/8",
            "10.0.0.0/8",
            "100.64.0.0/10",
            "127.0.0.0/8",
            "169.254.0.0/16",
            "172.16.0.0/12",
            "192.0.0.0/24",
            "192.0.2.0/24",
            "192.168.0.0/16",
            "198.18.0.0/15",
            "198.51.100.0/24",
            "203.0.113.0/24",
            "::1/128",
            "fc00::/7",
            "fe80::/10"
          ],
          "outboundTag": "blocked"
        }
      ]
    }
  }
}
```
