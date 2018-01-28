# 小结

现在对本章作个总结。

## 配置文件格式

V2Ray 的配置文件格式就像这样：

```javascript
  "log": {},
  "dns": {},
  "routing": {},
  "inbound": {},
  "outbound": {},
  "inboundDetour": [],
  "outboundDetour": [],
  "transport": {}
```

总的来说，V2Ray 的配置有 8 个项，每个项都可以展开成具体的配置。这 8 个配置项当中，除了 dns 和 transport 之外，其它的在本章都有涉及，关于 dns 和 transport 将在后文说明。

要深刻理解，V2Ray 只是一个转发数据的软件，无论是客户端还是服务器，只要它从 inbound / inboundDetour 当中接收到数据包，不管 V2Ray 对这些数据包做了什么（加密、解密、协议转换等），到最后肯定是要把这些数据包从 outbound / outboundDetour 发出去。

## inbound / outbound 和 inboundDetour / outboundDetour 的区别

配置当中有 inbound 和 inboundDetour  以及 outbound 和 outboundDetour，有部分网友对此可能比较迷惑，我这里说明一下。inbound 和 inboundDetour 都是传入，outbound 和 outboundDetour 都是传出。先来看传入，inbound 和 inboundDetour 的格式形如：

```javascript
"inbound": {
  "port": 1080,
  "listen": "127.0.0.1",
  "protocol": "协议名称",
  "settings": {},
  "streamSettings": {},
  "allowPassive": false,
  "tag": "标识"
},
"inboundDetour": [
  {
    "port": 2080,
    "listen": "127.0.0.1",
    "protocol": "协议名称",
    "settings": {},
    "streamSettings": {},
    "allowPassive": false,
    "tag": "标识",
    "allocate": {
      "strategy": "always",
      "refresh": 5,
      "concurrency": 3
    }
  },
  {
    "port": 3080,
    "listen": "127.0.0.1",
    "protocol": "协议名称",
    "settings": {},
    "streamSettings": {},
    "allowPassive": false,
    "tag": "标识",
    "allocate": {
      "strategy": "always",
      "refresh": 5,
      "concurrency": 3
    }
  }
]
```

可以很明显地看出来，inbound 和 inboundDetour 基本是一样的，只不过 inboundDetour 是 inbound 的集合。还有一点不同的是 inboundDetour 多了一个 allocate 参数，这是只有在动态端口才会用到的参数，如果不配置动态端口 inboundDetour 和 inbound 无异。

即有两点不同：
* **配置中 inbound 只能并且必须设置一个传入的配置，而 inboundDetour 可以设置任意多个传入配置**
* **inboundDetour 的传入配置多了一个给动态端口用的 allocate 参数**

接着是传出，outbound 和 outboundDetour 格式形如:

```javascript
"outbound": {
  "sendThrough": "0.0.0.0",
  "protocol": "协议名称",
  "settings": {},
  "tag": "标识",
  "streamSettings": {},
  "proxySettings": {
    "tag": "another-outbound-tag"
  }  
},
"outboundDetour": [
  {
    "sendThrough": "0.0.0.0",
    "protocol": "协议名称",
    "settings": {},
    "tag": "标识",
    "streamSettings": {},
    "proxySettings": {
      "tag": "another-outbound-tag"
    }
  },
  {
    "sendThrough": "0.0.0.0",
    "protocol": "协议名称",
    "settings": {},
    "tag": "标识",
    "streamSettings": {},
    "proxySettings": {
      "tag": "another-outbound-tag"
    }
  }
]
```

单纯从配置格式来看，outbound 和 outboundDetour 没有任何区别。但是实际上 outbound 和 outboundDetour 也有两点不同：
* **配置中 outbound 只能并且必须设置一个传出的配置，而 outboundDetour 可以设置任意多个传出配置**
* **当没有配置路由规则或者路由没有匹配的情况下，默认由 outbound 将数据包发出去**。

在上面给出的传入和传出配置格式当中，有一些参数不曾提到过，主要是因为：
* 一般情况下使用 V2Ray 默认设置即可
* 将会在后面的章节介绍

## 协议

V2Ray 的传入协议有 HTTP、SOCKS、VMess、Shadowsocks、Dokodemo-door；传出协议有 VMess、Shadowsocks、Blackhole、Freedom、SOCKS。

在 inbound / inboundDetour 和 outbound / outboundDetour 当中，无论使用了什么协议，inbound / inboundDetour 或者 outbound / outboundDetour 的配置格式都是一样的，区别只在于不同的协议对应的 settings 内容不一样。
