# HTTP 伪装

（**2018-03-16 注：个人建议不要使用 HTTP 伪装**）
V2Ray 自 v2.5 版本开始提供 HTTP 伪装功能，后经作者不断完善，到现在已经非常成熟稳定了。V2Ray 的 HTTP 伪装功能可以可以将 V2Ray 的流量伪装成正常的 HTTP 协议的。这里给出一个 HTTP 伪装的服务器端与客户端配置文件示例。

配置中关于 HTTP 头字段的内容及含义，[Wikipedia](https://zh.wikipedia.org/wiki/HTTP%E5%A4%B4%E5%AD%97%E6%AE%B5%E5%88%97%E8%A1%A8) 有简要的说明，可参阅。

## 配置

从 V2Ray 的实现角度来说，使用 HTTP 伪装的同时完全可以使用动态端口。但我个人并不建议这么做，因为从实际情况来看，基本上不会有人在一个服务器上开使用多个端口的 Web 服务。如果你觉得 HTTP 伪装的配置过于复杂不懂得如何修改，那请直接使用下面的配置即可。

### 服务器

```javascript
{
  "log" : {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 80, //推荐80端口，更好地迷惑防火墙（好吧实际上并没有什么卵用
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "level": 1,
            "alterId": 64
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "tcpSettings": {
          "header": { // header 这一项是关于数据包伪装的设置，可自定义合理的内容，但要确保服务器与客户端一致
            "type": "http",
            "response": {
              "version": "1.1",
              "status": "200",
              "reason": "OK",
              "headers": {
                "Content-Type": ["application/octet-stream", "application/x-msdownload", "text/html", "application/x-shockwave-flash"],
                "Transfer-Encoding": ["chunked"],
                "Connection": ["keep-alive"],
                "Pragma": "no-cache"
              }
            }
          }
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "blocked"
    }
  ],
  "routing": {
    "strategy": "rules",
    "settings": {
      "rules": [
        {
          "type": "field",
          "ip": [
            "geoip:private"
          ],
          "outboundTag": "blocked"
        }
      ]
    }
  }
}
```

### 客户端

```javascript
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"
      }
    }
  ],
  "outbound": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com",
            "port": 80,
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
                "alterId": 64
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "tcpSettings": {
          "header": {  //这里的 header 要与服务器保持一致
            "type": "http",
            "request": {
              "version": "1.1",
              "method": "GET",
              "path": ["/"],
              "headers": {
                "Host": ["www.cloudflare.com", "www.amazon.com"],
                "User-Agent": [
                  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36",
                          "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
                ],
                "Accept-Encoding": ["gzip, deflate"],
                "Connection": ["keep-alive"],
                "Pragma": "no-cache"
              }
            }
          }
        }
      }
    },
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    }
  ],
  "routing": {
    "strategy": "rules",
    "settings": {
      "domainStrategy": "IPIfNonMatch",
      "rules": [
        {
          "type": "field",
          "ip": [
            "geoip:private"
          ],
          "outboundTag": "direct"
        },
        {
          "type": "chinasites",
          "outboundTag": "direct"
        },
        {
          "type": "chinaip",
          "outboundTag": "direct"
        }
      ]
    }
  }
}
```


----------------

## 更新历史

- 2017-08-05 删掉部分不必要的配置
- 2018-03-16 Update
- 2019-01-13 V4.0+配置格式
