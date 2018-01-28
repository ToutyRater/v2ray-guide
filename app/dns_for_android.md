# Android 直连问题及解决

目前，所有 V2Ray 的 Android 客户端的方案都是 tun2socks+V2Ray-core，也就是说所有流量都由 tun2socks 发给 V2Ray-core，再由发给 VPS 进行代理。由于 V2Ray 内置了路由功能，所以可以国内外分流。但是，为了解决 DNS 污染问题，DNS 查询的流量同样被 V2Ray 经 VPS 中转进行查询。这样带来了两个问题：
1. 响应慢。这里的响应慢应该说是感觉上像是响应慢。访问一个网页时，首先要把域名解析成 IP，然后才是发送访问请求。因为 DNS 被中转到了 VPS，再加上 vmess 是 TCP 协议，所以这里 DNS 查询的时间都在 1s 以上，对于绕路或者偏远的 VPS 时间更长。DNS 查询之后流量就直连了，所以说像是响应慢。
2. 访问到了海外版的网站。一些业务涉及海外或者体量比较大的企业，基本上都会有海外版的网站或 CDN。由于 DNS 查询经由 VPS 中转，DNS 服务器就以为你是在国外访问，所以给了你一个海外的 IP。后果同样是比较慢。

为了解决这个问题又要避免 DNS 污染，大伙真的是绞尽脑汁。目前比较流行的一个方案的是 DNS 国内外分流，简单说就是 DNS 查询前先判断要查询的域名是国内还是国外的，国内的就往国内查询，国外的就往国外查询，ss 用的就是这个方案。其实，V2Ray 用这个方案也是可以的，但是并没有这么做，实际上这种方案操作起来也比较麻烦。所以目前还存在这上面说的问题。当然了，既然我发此文，肯定有办法的嘛。只是又是一个要手动开启的功能(需要自己写配置文件)。

## 解决方法

以下是操作步骤：

1. 配置 domainOverride
2. 配置 DNS 为国内的 DNS 服务器地址
3. 添加路由规则为如果是 53 端口的 UDP 流量走 freedom
4. 导入配置文件到 Android 客户端

配置文件形如：
```javascript
{
  "inbound": {
  "domaiOverride": ["tls","http"],
  ...
  },
  "outbound": {
    "protocol": "vmess",
    ...
  },
  "outboundDetour": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    ...
  ],
  "dns": {
    "servers": [
      "223.5.5.5"
    ]
  },
  "routing": {
    "strategy": "rules",
    "settings": {
      "domainStrategy": "IPIfNonMatch",
      "rules": [
        {
          "type": "field",
          "port": 53,
          "network": "udp", 
          "outboundTag": "direct"
        },
        {
          "type": "chinasites",
          "outboundTag": "direct",
        },
        {
          "type": "chinaip",
          "outboundTag": "direct",
        }
        ...
      ]
    }
  }
}
``` 

## 注意事项

1. 以上操作仅在 V2RayNG 测试通过，另外的 Android 客户端理论上可行；
2. 步骤 2 要配置 `dns` 项，并且地址是国内的 DNS 服务器，是因为客户端实现问题；
3. 此方法是通过 domain override 解决污染，如果你访问了域名受到污染网站，结果也能正常访问，但实际上国内 DNS 也会收到你关于这域名的查询。

## 更新历史

* 2017-12-14 初版
* 2018-01-15 Fix typo
