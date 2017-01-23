# 广告过滤

## 配置

### 客户端

```javascript
{
  "log":{
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbound": {
    "port": 1080,
    "protocol": "socks",
    "settings": {
      "auth": "noauth",
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
              "id": "2b831381d-6324-4d53-ad4f-8cda48b30811",  
              "alterId": 64
            }
          ]
        }
      ]
    }
  },
  "outboundDetour": [
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "adblock"
    }
  ],
  "routing": {
    "strategy": "rules"，
    "settings": {
      "domainStrategy": "IPIfNonMatch",
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

### 服务器

```javascript
{
  "log":{
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
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

## 说明

在本小节的配置变化只在于客户端配置的 outboundDetour 和 routing 添加了新的内容，请大家自行比较。

在 routing.settings.rules 中，type 的值除了 chinasites 和 chinaip 之外只能是 field。

本例中，新添加了两个规则：

```javascript
{
  "domain": [
    "tanx.com",
    "baidu.com"
  ],
  "type": "field",
  "outboundTag": "adblock"       
},
{
  "domain": [
    "amazon.com",
    "microsoft.com",
    "youku.com",
    "baidu.com"
  ],
  "type": "field",
  "outboundTag": "direct"
}
```

在第一个规则中，域名包含有 tanx.com 或 baidu.com 的就会被阻止连接。在第二个规则当中，域名中包含有 amazon.com 或 microsoft.com 或 youku.com 或 baidu.com 的会直连。有一个问题大家发现没有，两个规则都有 baidu.com ，那么会执行哪个呢？答案是只会执行第一个，原因是：
1. 规则是放在 routing.settings.rules 这个数组当中，数组的内容是有顺序的，也就是说在这里规则是有顺序的，匹配规则时是从上往下匹配
2. 当路由匹配到一个规则时就会跳出匹配而不会对之后的规则进行匹配

关于路由更多内容请参考 [V2Ray 用户手册](https://www.v2ray.com/chapter_02/03_routing.html)
