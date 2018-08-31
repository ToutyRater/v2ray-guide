# 路由规则之移动端

**由于使用 V2Ray Core 的移动客户端都能直接开启 domain override，本文基本没有了参考价值。**

**由于使用 V2Ray Core 的移动客户端都能直接开启 domain override，本文基本没有了参考价值。**

**由于使用 V2Ray Core 的移动客户端都能直接开启 domain override，本文基本没有了参考价值。**

在前面的内容当中，我从来没讲过移动端的配置，是因为 Android 的客户端是直接使用 V2Ray-core，配置文件是通用的。而 iOS 的只有那么几个框可以填的，没什么可说。但是在 Android 上用过 V2Ray 的朋友可能都遇过这个问题：

chinasites 或者路由规则是域名的话不起作用。

这是因为在 Android 中，V2Ray 只能接收到目标地址是 IP 的数据，因此 chinasites 和域名规则无效。不过好在 V2Ray 后来增加了一个功能——domain overrid，它可以从这些数据中探测出域名，然后匹配相应的域名规则。但这个功能默认关闭，因此要手动开启。

开启 domain override 有多种方式，以下一一介绍(方式一至方式三针对的是 Actinium)。

## 方式一

这种方式是在客户端上开启，方法是在`客户端`的 inbound(Detour) 中加入 `"domainOverride": ["http", "tls"]`，配置形如：
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

然而还有一个问题是 Actinium 在导入配置文件的时候会进行转换，然后 inbound 就被修改成没有 domainOverride 这一项了。也就是说如果你用 PC 上的配置直接导入到 Actinium 也是用不了 domain overrid 的。

不过有一个方法可以曲线救国：
 使用 [Actinium 的默认配置](https://raw.githubusercontent.com/V2Ray-Android/Actinium/master/app/src/main/assets/conf_default.json)，将里面所有的 inbound 和 inboundDetour 加入 `"domainOverride": ["http", "tls"]`，再将 outbound 和 routing 修改成你实际需要的配置，其它的不要动。修改完之后再导入 Actinium 中，Actinium 不会改你的文件了。

## 方式二

因为 domain override 是在 inbound 上设置的，因此也可以在服务器上开启。但要注意的是在服务器使用 domain overrid 比较适用的规则是 blackhole，因为如果是要直连的话，数据包已经发给了服务器，这个时候的服务直连对于客户端来说也是走代理了，除非你这个服务器是中转节点。

## 方式三

下载并启用全局复制（https://play.google.com/store/apps/details?id=com.camel.corp.universalcopy）
先在 Actinium 直接导入配置文件，并将其转化为 Actinium 格式。
然后在 Actinium 主界面点击此配置文件查看，使用全局复制将其复制出来，另存为另一个json文件。
在新保存的json文件里加入 Domain Override 并导入 Actinium，即可实现此功能。

## V2RayNG

V2RayNG 是另一个基于 V2Ray 内核的 Android 应用，从某个版本可以导入配置。我简单试了一下 0.2.6 版本，可以直接导入电脑上使用的配置，也不用手动开启 domain override 就可以使用域名的路由规则，操作比 Actinium 方便些，直接使用 PC 的配置也不会造成配置文件上的割裂。不过听说分应用代理有点小问题(我试用时间不长，并不确定，说不定也可能修复了，有网友确定修复了请告之)。另外**个人感觉** DNS 请求时间有点长，这同样有待验证。

--------
## 更新历史

- 2017-08-05 增加可以在服务器上使用 domain override 的内容

- 2017-11-16 增加Actinium和全局复制搭配使用 domain override 的内容，并修正部分拼写错误

- 2017-11-28 增加 V2RayNG

- 2017-12-11 本文相当失效
