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
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth",
        "udp": true
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
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
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
      "tag": "direct" //如果要使用路由，这个 tag 是一定要有的，在这里 direct 就是 freedom 的一个标号，在路由中说 direct V2Ray 就知道是这里的 freedom 了
    }    
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"] // 中国大陆主流网站的域名
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn", // 中国大陆的 IP
          "geoip:private" // 私有地址 IP，如路由器等
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
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
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

看客户端配置，注意 routing 有一个 domainStrategy， 跟着写就行，当然也可以设成其它的，这里我不说，想知道就看用户手册。重点在 rules，我们要设置的路由规则就放在这里，注意这是一个数组，也就是说可以设置多个路由规则，当访问一个网站，数据包进入 V2Ray 之后路由就会先看看有没有能够匹配的规则，然后执行规则。

在rules 数组中的每个规则由一组大括号`{ }`扩起来。规则中的 type 是固定的(也就是照抄就行)， 两个规则分别有 `"domain": ["geosite:cn"]` 和 `"ip": ["geoip:cn"]`，这两个分别包含了中国大陆主流网站大部分域名和几乎所有的 ip 。两个规则的 outboundTag 都是 direct （outbounds 中 tag 为 direct 的是 freedom）那么如果访问了国内的网站路由就会将这个数据包发往 freedom，也就是直连了。比如说我访问了 qq.com，qq.com 是国内网站包含在 chinasites 里，就会匹配路由规则发往 freedom。

也许有的朋友会觉得奇怪，在这个例子当中路由规则只有国内网站直连，没有关于走代理的规则，但仍然可以访问 google.com、twitter.com 这类等众多被墙的网站的。这因为 `outbounds` 中的第一个出口协议是作为默认的出口，当一个数据包没有匹配的规则时，路由就会把数据包发往默认出口，在本例中 VMess 位于 `outbounds` 中的第一个，即不是访问中国大陆网站的数据包将通过 VPS 代理。

服务器配置与前面 VMess 一样，不再赘述。

-----
到这里为止的配置已经可以满足基本的翻墙需求了。但是如果仅仅止步于此，那么也没什么使用 V2Ray 的必要，还不如用 Shadowsocks，毕竟 Shadowsocks 的配置不过 10 行，网上文章又多。

指南到这里还没完结，后面还有许多强大的功能等着我们来挖掘呢。少年，来吧！

## 更新历史

- 2018-11-09 跟进 v4.0+ 配置格式
