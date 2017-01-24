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

总的来说，V2Ray 的配置有 8 个项，每个项都可以展开成具体的配置。这 8 个配置项当中，除了 dns 和 transport 之外，其它的在本章都有涉及，关于 dns 和 transport 将在高级应用章节做说明。

大家要深刻理解一点，V2Ray 只是一个转发数据的软件，无论是客户端还是服务器，只要它从 inbound 或者 inboundDetour 当中接收到数据包，不管 V2Ray 对这些数据包做了什么（加密、解密、协议转换等），到最后肯定是要把这些数据包从 outbound 或者 outboundDetour 发出去。

配置当中有 inbound 和 inboundDetour  以及 outbound 和 outboundDetour，有部分网友可能比较迷惑，我这里说明一下。inbound 和 inboundDetour 只有一点区别：inbound 只能并且必须设置一个传入的配置，而 inboundDetour 可以设置任意多个传入配置，其它都一样。同样的道理，outbound 只能并且必须设置一个传出配置，而 outboundDetour 有任意多个传出。但是 outbound 还有一个特殊的地方：当没有配置路由规则或者路由没有匹配的情况下，默认由 outbound 将数据包发出去。
