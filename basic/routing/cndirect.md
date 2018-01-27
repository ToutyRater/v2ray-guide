# 国内直连

## 配置

### 客户端

```javascript
{
  "log": {
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbound": {
    "port": 1080,
    "protocol": "socks",
    "settings": {
      "auth": "noauth",
      "udp": true
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
  },
  "outboundDetour": [
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct" //如果要使用路由，这个 tag 是一定要有的，在这里 direct 就是 freedom 的一个标号，在路由中说 direct V2Ray 就知道是这里的 freedom 了
    }
  ],
  "routing": {
    "strategy": "rules",
    "settings": {
      "domainStrategy": "IPIfNonMatch",
      "rules": [
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
  "log": {
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
          "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
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

看客户端配置，注意 routing 那里有一个 "strategy": "rules"，这是固定格式，什么也别管照着写就好了。settings.domainStrategy 也跟着写，也可以设成其它的，这里我不说，想知道就看用户手册。重点在 settings.rules，这是一个数组，也就是说可以设置多个路由规则，当访问一个网站，数据包进入 V2Ray 之后路由就会先看看有没有能够匹配的规则，然后执行规则。本例中，type 有 chinasites 和 chinaip，这两个分别包含了中国的网站域名和 ip 。两个规则的 outboundTag 都是 direct （看 outboundDetour tag 为 direct 的是 freedom）那么如果访问了国内的网站路由就会将这个数据包发往 freedom，就是直连了。比如说我访问了 qq.com，qq.com 是国内网站包含在 chinasites 里，就会匹配路由规则发往 freedom。

另外需要说明的一点是，在这个例子当中尽管路由只有 direct(freedom)，但仍然是可以上 google.com、twitter.com 等众多网站的。因为 outbound 是作为默认的传出，当一个数据包没有匹配的规则时，路由就会把数据包发往 outbound，在本例中 outbound 设置成了 VMess，即不是 chinasites 和 chinaip 的数据包将通过 VPS 代理。

服务器配置与前面 VMess 一样，不再赘述。

-----
到这里为止的配置已经可以满足基本的翻墙需求了。但是如果仅仅止步于此，那么也没什么使用 V2Ray 的必要，还不如用 Shadowsocks，毕竟 Shadowsocks 的配置不过 10 行，网上文章又多。

指南到这里还没完结，后面还有许多强大的功能等着我们来挖掘呢。少年，来吧！
