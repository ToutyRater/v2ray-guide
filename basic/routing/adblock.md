# 广告过滤

## 配置

### 客户端

```javascript
{
  "log": {
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
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
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com",
            "port": 16823,
            "users": [
              {
                "id": "2b831381d-6324-4d53-ad4f-8cda48b30811",  
                "alterId": 64
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"//如果要使用路由，这个 tag 是一定要有的，在这里 direct 就是 freedom 的一个标号，在路由中说 direct V2Ray 就知道是这里的 freedom 了
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "adblock"//同样的，这个 tag 也是要有的，在路由中说 adblock 就知道是这里的 blackhole（黑洞） 了
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "domain": [
          "tanx.com",
          "googeadsserving.cn",
          "baidu.com"
        ],
        "type": "field",
        "outboundTag": "adblock"       
      },
      {
        "domain": [
          "amazon.com",
          "microsoft.com",
          "jd.com",
          "youku.com",
          "baidu.com"
        ],
        "type": "field",
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn",
          "geoip:private"
        ]
      }
    ]
  }
}
```

### 服务器

```javascript
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [
    {
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
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
```

## 说明

相对于上小节，在本小节的配置变化只在于客户端配置的 outbounds 和 routing 添加了新的内容，请大家自行比较。

在 routing 中，新添加了两个规则：

```javascript
{
  "domain": [
    "tanx.com",
    "googeadsserving.cn",
    "baidu.com"
  ],
  "type": "field",
  "outboundTag": "adblock"       
},
{
  "domain": [
    "amazon.com",
    "microsoft.com",
    "jd.com",
    "youku.com",
    "baidu.com"
  ],
  "type": "field",
  "outboundTag": "direct"
}
```

在第一个规则中，域名包含有 tanx.com 或 baidu.com 的就会被阻止连接，如果想拦截某些网站，往 adblock 的规则中写想要拦截的域名就可以了。在第二个规则当中，域名中包含有 amazon.com 或 microsoft.com 或 youku.com 或 baidu.com 的会直连。有一个问题大家发现没有，两个规则都有 baidu.com ，那么会执行哪个呢？答案是只会执行第一个（即adblock)，原因是：
1. 规则是放在 routing.rules 这个数组当中，数组的内容是有顺序的，也就是说在这里规则是有顺序的，匹配规则时是从上往下匹配；
2. 当路由匹配到一个规则时就会跳出匹配而不会对之后的规则进行匹配；

关于路由更多内容请参考 [V2Ray 用户手册](https://www.v2ray.com/chapter_02/03_routing.html)

## 更新历史

- 2018-11-09 跟进 v4.0+ 配置格式
- 2019-11-03 修正编辑错误
