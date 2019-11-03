# 国内 VPS 中转

**(ToutyRater 注：本节原为 V2Ray 官网的配置案例中的一节，后来 V2Ray 将之删除，所以我稍作修改传到此处)。**

为了方便维护，或者从速度上的考虑，可以在国内架设一台中转 VPS，在这台 VPS 上判断目标地址是国内还是国外的，只需把国外的流量向国外 VPS 转发，而国内的流量使用直连。这样的配置，在用户的电脑只需要把所有流量发往这台 VPS，而不用为每一个用户都配置白名单，较为省力。

以下是中转服务的配置示例。

```javascript
{
  "log" : {                                 
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 1234,
      "protocol": "vmess",    // 入站协议为 VMess
      "settings": {
        "clients": [
          {
            "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // UUID
            "level": 1,       // 用户等级
            "alterId": 32     // 额外ID
          },
          // 在这里添加更多用户，注意UUID不能重复
          {
            "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy", // UUID
            "level": 0,       // 用户等级
            "alterId": 32     // 额外ID
          }
        ]
      }
    }
  ],
  // ========== BEGIN STEP 1 ==========
  // 国内中转服务器当作国外服务器的“客户端”
  // 国际流量发往国外服务器上
  "outbounds": [
    {
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
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "block"
    },
    // 增加 freedom 传出绕路，国内流量直接放行
    {
      "protocol": "freedom",
      "tag": "direct",
      "settings": {}
    }
  ],
  // ========== END STEP 1 ==========
  "routing": { // 路由设置
   "domainStrategy": "IPOnDemand",
    "strategy": "rules",
    "rules": [
      {
        "type": "field",      // 不允许客户端访问服务端的局域网地址，以提升安全性
        "ip": [
          "geoip:cn"
        ],
        "outboundTag": "block"
      },
      // 配置国内网站和IP直连规则
      {
        "type": "field",  // 对于一些常见的国内网站，也使用直连模式
        "domain": [
          "geosite:cn"
        ],
        "outboundTag": "direct"
      },
      {
        "type": "field", // 对于所有国内的 IP，都采用直连模式
        "ip": [
          "geoip:cn"
        ]
        "outboundTag": "direct"
      }
    ]
  }
}
```
