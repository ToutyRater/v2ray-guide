## 路由规则之移动端

在前面的内容当中，我从来没讲过移动端的配置，是因为 Android 的客户端是直接使用 V2Ray-core，配置文件是通用的。而 iOS 的只有那么几个框可以填的，没什么可说。但是在 Android 上用过 V2Ray 的朋友可能都遇过这个问题：

chinasites 或者路由规则是域名的话不起作用。

这是因为在 Android 中，V2Ray 只能接收到目标地址是 IP 的数据，因此 chinasites 和域名规则无效。不过好在 V2Ray 增加了一个功能——domain overrid 可以从这些数据中探测出域名，然后匹配相应的域名规则。但这个功能默认关闭，因此要手动开启。

开启的方法是在`客户端`的 inbound 和 inboundDetour 中加入 `"domainOverride": ["http", "tls"]`，如：
```javascript
{
  "routing": {},
  "inbound": {
    "domainOverride": ["http", "tls"],
    "port": 1080,
    ...
  },
  "outbound": {
  ...
  },
  "inboundDetour": [
    {
      "domainOverride": ["http", "tls"],
      "port": 2080,
      ...
    },
    {
      "domainOverride": ["http", "tls"],
      "port": 3080,
      ...
    }
  ],
  "outboundDetour": [
  ...
  ],
}

```

然而还有一个问题是 Actinium 在导入配置文件的时候会进行转换，然后 inbound 就被修改成没有 domainOverride 这一项了。也就是说如果你用 PC 上的配置直接导入到 Actinium 也是用不 domain overrid 的。

不过有一个方法可以曲线救国：
 使用 [Actinium 的默认配置](https://raw.githubusercontent.com/V2Ray-Android/Actinium/master/app/src/main/assets/conf_default.json)，将里面所有的 inbound 和 inboundDetour 加入 `"domainOverride": ["http", "tls"]`，再将 outbound 和 routing 修改成你实际需要的配置，其它的不要动。修改完之后再导入 Actinium 中，Actinium 不会改你的文件了。

 问：为什么用的是 Actinium？

因为 Actinium 是操作和使用上最均衡的。像 V2RayNG 只能手动输入配置，而且不能自定义路由规则，本节说的与它基本没关系，BUG 也不修。V2RayGo 使用上和操作上都不太方便，还是盼望一下新版吧。
