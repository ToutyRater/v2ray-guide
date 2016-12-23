# http伪装

V2Ray 自 2.5 版本开始提供[ HTTP 伪装功能](https://github.com/v2ray/v2ray-core/releases/tag/v2.5)，后经作者不断完善，现已相当成熟。这里给出一个 http 伪装的服务器端与客户端配置文件示例：

服务端配置文件：

```
{
  "log" : {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "info" //为调试V2Ray，建议使用Info
  },
  "inbound": {
    "port": 80, //推荐80端口，更好地迷惑防火墙（好吧实际上并没有什么卵用
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "_UUID_",
          "level": 1,
          "alterId": _AlterID_
        }
      ]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "none",
      "tlsSettings": {
        "allowInsecure": true, //如果为false，下行的certificates必须指定，linux路径指定方式为：”/path/to/certificate“，windows下为："C:\\CA\\"
        "certificates": [
          {
            "certificateFile": "/path/to/certificate.crt",
            "keyFile": "/path/to/key.key"
          }
        ]
      },
      "tcpSettings": {
        "connectionReuse": true, //拥塞控制
        "header": {
          "type": "http",
          "request": {
            "version": "1.1",
            "method": "GET",
            "path": ["/"],
            "headers": {
              "Host": ["mp.weixin.qq.com", "rj.baidu.com"], //可随意改变，但服务器与客户端必须一致，下行的User-Agent也是如此
              "User-Agent": [
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36",
                        "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
              ],
              "Accept-Encoding": ["gzip, deflate"],
              "Connection": ["keep-alive"],
              "Pragma": "no-cache"
            }
          },
          "response": {
            "version": "1.1",
            "status": "200",
            "reason": "OK",
            "headers": {
              "Content-Type": ["application/octet-stream", "application/x-msdownload", "text/html", "application/x-shockwave-flash"], //可随意改变，但服务器与客户端必须一致
              "Transfer-Encoding": ["chunked"],
              "Connection": ["keep-alive"],
              "Pragma": "no-cache"
            }
          }
        }
      }
    }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {}
  },
  "outboundDetour": [
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
  },
  "transport": {
    "kcpSettings": {
      "mtu": 1350,
      "tti": 20,
      "uplinkCapacity": 5,
      "downlinkCapacity": 20,
      "congestion": false,
      "readBufferSize": 1,
      "writeBufferSize": 1,
      "header": {
        "type": "none"
      }
    }
  }
}
```
客户端配置文件：

```
{
  "log": {
    "loglevel": "info"
  },
  "inbound": {
    "port": 1080,
    "listen": "127.0.0.1",
    "protocol": "socks",
    "settings": {
      "auth": "noauth",
      "udp": false,
      "ip": "127.0.0.1"
    }
  },
  "outbound": {
    "protocol": "vmess",
    "settings": {
      "vnext": [
        {
          "address": "_Server_IP_",
          "port": 80,
          "users": [
            {
              "id": "_UUID_",
              "alterId": _AlterID_
            }
          ]
        }
      ]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "none",
      "tlsSettings": {
        "allowInsecure": true,
        "certificates": [
          {
            "certificateFile": "C:\\path\\to\\certificate.crt",
            "keyFile": "C:\\path\\to\\key.key"
          }
        ]
      },
      "tcpSettings": {
        "connectionReuse": true,
        "header": {
          "type": "http",
          "request": {
            "version": "1.1",
            "method": "GET",
            "path": ["/"],
            "headers": {
              "Host": ["mp.weixin.qq.com", "rj.baidu.com"],
              "User-Agent": [
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36",
                        "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
              ],
              "Accept-Encoding": ["gzip, deflate"],
              "Connection": ["keep-alive"],
              "Pragma": "no-cache"
            }
          },
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
      },
      "kcpSettings": {
        "mtu": 1350,
        "tti": 20,
        "uplinkCapacity": 5,
        "downlinkCapacity": 20,
        "congestion": false,
        "readBufferSize": 1,
        "writeBufferSize": 1,
        "header": {
          "type": "none"
        }
      },
      "wsSettings": {
        "connectionReuse": true,
        "path": ""
      }
    }
  },
  "outboundDetour": [
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    }
  ],
  "dns": {
    "servers": [
      "8.8.8.8",
      "8.8.4.4",
      "localhost"
    ]
  },
  "routing": {
    "strategy": "rules",
    "settings": {
      "domainStrategy": "IPIfNonMatch",
      "rules": [
        {
          "type": "field",
          "port": "1-52",
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "port": "54-79",
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "port": "81-442",
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "port": "444-65535",
          "outboundTag": "direct"
        },
        {
          "type": "chinasites",
          "outboundTag": "direct"
        },
        {
          "type": "field",
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
          "outboundTag": "direct"
        },
        {
          "type": "chinaip",
          "outboundTag": "direct"
        }
      ]
    }
  },
  "transport": {
    "kcpSettings": {
      "mtu": 1350,
      "tti": 20,
      "uplinkCapacity": 5,
      "downlinkCapacity": 20,
      "congestion": false,
      "readBufferSize": 1,
      "writeBufferSize": 1,
      "header": {
        "type": "none"
      }
    }
  }
}
```
