# 传出代理

V2Ray 提供了传出代理功能，利用它可以实现中转或者类似于 Tor 的多层代理。

关于传出代理的说明请参考[用户手册](https://www.v2ray.com/chapter_03/outboundproxy.html#传出代理)。

## 基本传出代理
使用传出代理可以实现由一个 Shadowsocks 服务器或者 V2Ray(VMess) 服务器来中转你的网络流量，中转服务器只能看到你加密的数据而不知道原始的数据是什么。

以下面的配置说明，它的工作原理是：
1. 你在 twitter 发了个帖子 f**k GFW，由 V2Ray 代理
2. V2Ray 客户端收到浏览器发出的 f**k GFW 的帖子后，首先由对其进行加密(VMess，id: b12614c5-5ca4-4eba-a215-c61d642116ce,目的服务器: 1.2.3.4:8888)
3. 加密后数据包将被转到 transit 这个 outbound 中，在这里数据包又会加密一次(Shadowsocks, password: password, 服务器: 2.2.2.2:1024)
4. 两次加密后的数据包被发送到了 Shadowsocks 服务器，该服务器收到后解包后得到仍是加密的数据包（步骤 2 中加密后的数据包），然后将数据包发到 VMess 服务器。即便这个 Shadowsocks 服务器的主人是个偷窥狂魔，他也没办法看到你的原始数据。
5. VMess 服务器收到 Shadowsocks 服务器发来的数据包，解密得到原始的数据包，然后把你这个帖子发到 twtter 的网站中。

只要第 5 步中的服务器是自己掌控的就不用担心别人看到你的上网的内容。

客户端：
```javascript
{
  "outbound": {
    "protocol": "vmess",
    "settings": { // settings 的根据实际情况修改
      "vnext": [
        {
          "address": "1.2.3.4",
          "port": 8888,
          "users": [
            {
              "alterId": 64,
              "id": "b12614c5-5ca4-4eba-a215-c61d642116ce"
            }
          ]
        }
      ]
    },
    "streamSettings": {
      "network": "tcp"  // 此处不能是 "kcp"，设成 "kcp" 将无法联网
    },
    "proxySettings": {
        "tag": "transit"  // 这里的 tag 必须跟作为中转 VPS 的 tag 一致，这里设定的是 "transit"
      }
  },
  "outboundDetour": [
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "2.2.2.2",
            "method": "aes-256-cfb",
            "ota": false,
            "password": "password",
            "port": 1024
          }
        ]
      },
      "tag": "transit"
    }
  ]
}
```
