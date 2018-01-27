# 路由功能

本小节将介绍路由功能的使用。

## 路由简介

先简单举几个例子，都是客户端的。

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

像上面这个配置就是前面 VMess 的客户端配置文件，假如我改一下，改成下面这个

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
    }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {
    }
  }
}
```

如果按这个配置，你会发现这个时候浏览器设不设置代理其实是一样的，像 Google 原本不能上的设置代理还是不能上，taobao 这种一直能上的还是能上。因为 freedom 就是直连，从 inbound 接收到数据之后拆了包装然后直接发出去了，所以效果跟直接访问一个网站是一样的。

再来看下面这个:

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
    "protocol": "blackhole",
    "settings": {
    }
  }
}
```

这样的配置生效之后，你会发现无论什么网站都无法访问。这是为什么呢？blackhole 是黑洞的意思，在 V2Ray 这里也差不多相当于是一个黑洞（废话！不然叫什么黑洞），就是说 V2Ray 从 inbound 接收到数据之后发到 outbound，因为 outbound 是 blackhole，来什么吞掉什么，就相当于要访问什么就阻止访问什么。

来来来，开一下脑洞，咱都可以利用这些 outbound 做些什么呢？沉思 300s ~~~ 比如说 VMess 上 Google、Twitter（废话），freedom 可以不通过 VPS 直连（废话），blackhole 可以过滤广告 （废。。。好吧，不是废话）

等等。。。。。。。。。。。你这里有 VMess、freedom 和 blackhole 3个呢，可是 outbound 只有一个，这可怎么办呢？

好吧，真 tm 机智，幸亏留有一手。请看下面，这不是就有 3 个了吗。加一个 outboundDetour 数组，要多少个 outbound 都可以。

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
    }
  },
  "outbound": {
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
  "outboundDetour": [
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

好吧~~~ 但也没用啊，我怎么让 Google 走 VMess，taobao 走 freedom，还有阻止讨厌的广告。

既然如此，那本道只好释放大招了：路由，V2Ray 本身提供了一个路由功能。路由就是决定数据的传送方向。就拿 V2Ray 来说，我们可以通过设定路由来决定一个数据包会被发往哪个 outbound，就如前面说的 Google 走 VMess，taobao 走 freedom，过滤广告。

精彩内容，请继续住下看。
