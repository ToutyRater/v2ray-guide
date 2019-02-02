# 路由功能

本小节将介绍路由功能的使用。V2Ray 的一大特点就是内置了路由功能，用大白话说就是可以根据自己的实际情况制定一些规则来满足自己的上网需求，最简单最常见的就是直连国内网站、拦截特站点以及代理被墙网站。

## 路由简介

先简单举几个例子，都是客户端的。

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
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
                "alterId": 64
              }
            ]
          }
        ]
      }
    }
  ]
}
```

像上面这个配置就是前面 VMess 的客户端配置文件，假如改一下 outbound 的内容，变成这样：

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
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom", //原来是 VMess，现在改成 freedom
      "settings": {
      }
    }
  ]
}
```

如果修改成这个配置重启客户端之后，你会发现这个时候浏览器设不设置代理其实是一样的，像 Google 这类被墙的网站没法访问了，taobao 这种国内网站还是跟平常一样能上。如果是前面的介绍 VMess，数据包的流向是:
```
{浏览器} <--(socks)--> {V2Ray 客户端 inbound <-> V2Ray 客户端 outbound} <--(VMess)-->  {V2Ray 服务器 inbound <-> V2Ray 服务器 outbound} <--(Freedom)--> {目标网站}
```
但因为现在 V2Ray 客户端的 outbound 设成了 freedom，freedom 就是直连，所以呢修改后数据包流向变成了这样：
```
{浏览器} <--(socks)--> {V2Ray 客户端 inbound <-> V2Ray 客户端 outbound} <--(Freedom)--> {目标网站}
```
V2Ray 客户端从 inbound 接收到数据之后没有经过 VPS 中转，而是直接由 freedom 发出去了，所以效果跟直接访问一个网站是一样的。

再来看下面这个:

```javascript
{
  "log":{
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "blackhole",
      "settings": {
      }
    }
  ]
}
```

这样的配置生效之后，你会发现无论什么网站都无法访问。这是为什么呢？blackhole 是黑洞的意思，在 V2Ray 这里也差不多相当于是一个黑洞，就是说 V2Ray 从 inbound 接收到数据之后发到 outbound，因为 outbound 是 blackhole，来什么吞掉什么，就是不转发到服务器或者目标网站，相当于要访问什么就阻止访问什么。

到这儿为止，总共介绍了 4 种出口协议：用于代理的 VMess 和 Shadowsocks 协议，用于直连的 freedom 协议，以及用于阻止连接的 blackhole 协议。我们可以利用这几种协议再配合路由功能可以灵活地根据自己的需求针对不同网站进行代理、直连或者拦截。举个简单的例子，比较大众的需求是被墙网站走代理，国内网站直连，其他一些不喜欢的则拦截(比如说百度的高精度定位)。

等等！你这里有 VMess、freedom 和 blackhole 3 个出口，难道要运行 3 个 V2Ray 吗？

当然不是！在 V2Ray 的配置中，`outbounds` 是出口协议的集合，你可以在里面放任意多个出口协议，不仅 3 个，300 个都可以。下面给出放 3 个出口协议配置的例子。

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
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [ 
    {
      "protocol": "vmess", // 出口协议
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // 服务器 IP 地址
            "port": 16823,  // 服务器端口
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // 用户 ID，须与服务器端配置相同
                "alterId": 64
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      "protocol": "blackhole",
      "settings": {}
    }
  ]
}
```

当然这个配置只是包含了多个出口协议而已，在包含多个出口协议的情况下，只会以 outbounds 中的第一个出口作为默认的出口。要达到上面说的被墙网站走代理，国内网站直连，其他特殊网站拦截的效果，还得加入路由功能的配置。关于路由功能的配置见后面两小节。

## 更新历史

- 2018-11-09 跟进 v4.0+ 的配置格式
