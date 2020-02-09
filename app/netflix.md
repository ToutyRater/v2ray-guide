# 利用 V2Ray 看 Netflix

## 说明

我发现，在中国的许多喜欢看美剧并具备科学上网能力的网友比较喜欢使用 Netflix。但是由于版权问题，Netflix 是没有中区的，并且几乎所有的 VPS IP 被 Netflix 加入了黑名单，也就是说一般的翻墙手段也无法解决观看 Netflix 的问题。

本文会提供多种利用 V2Ray 观看 Netflix 的方法。但是请注意，**这并不是说用了我说的这些方法就能够看 Netflix**，一个被加入黑名单的 IP 无论如何也看不了的，这是 Netflix 的原因，与墙无关，也与 VPS 供应商无关。我希望大家能够明确这一点，而不是一上来什么也不看，对照着配置文件一顿猛操作，最后发现不行就到群里骂骂咧咧，该提示的都提示了，自己不看怪我咯？

我们已经知道了为什么看不了 Netflix 的原因，那么要能够看 Netflix 的方法归根结底只有一个，找到没有被加入黑名单的 IP。那么怎么找到这些漏网的 IP？就个人来说，只有两种方法，一是一个一个 VPS 买然后一个一个试，二是买机场商家提供的现成的可以看 Netflix 的代理。但是，自己找的 IP 说不定是哪个小国家的，直连速度堪比当年的 ADSL；买机场的也有一些流量问题等。

啰嗦大半天，说白了本文是解决观看 Netflix 和一般情况下翻墙之间的速度及流量问题的冲突。在这之前，请确保你有能够观看 Netflix 的 IP，在说明各个方法时将介绍该方法的应用场景。

## 方法

### 指定出站 IP

有一些 VPS 会提供 IPv6 的地址，有可能提供的 IPv6 可以看 Netflix，所以我们可以指定 Netflix 的流量使用 IPv6,其余的使用 IPv4。

```javascript
{
  "inbounds": [
    {
      "port": 16823,
      "protocol": "vmess",    
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
            "alterId": 64
          }
        ]
      },
      "sniffing": {
        "enabled": true, //一定要开启 sniffing，V2Ray 才能识别 Netflix 的流量
        "destOverride": ["http", "tls"]
      },
    }
  ],
  "outbounds": [
    {
      "tag":"IP4_out",
      "protocol": "freedom",
      "settings": {}
    },
    {
      "tag":"IP6_out",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv6" // 指定使用 IPv6
      }
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "outboundTag": "IP6_out",
        "domain": ["geosite:netflix"] // netflix 走 IPv6
      },
      {
        "type": "field",
        "outboundTag": "IP4_out",
        "network": "udp,tcp"// 其余走 IPv4
      }
    ]
  }
}
```

### 中转

中转比较简单，可以解决速度慢的问题。比如说你有 VPS1 和 VPS2 这两个服务器，发现 VPS1 可以看 Netflix，但是速度慢，VPS2 速度不错，但是看不了 Netflix。再加上通常来说国外 VPS 之间的速度不会太差，所以我们可以在 VPS2 做中转，属于 Netflix 的流量就转发到 VPS1，其他流量就直连。这种方式在[国内中转](https://toutyrater.github.io/advanced/vps_relay.html)介绍过。以下是 VPS2 的配置示例，客户端连接 VPS2 即可。

```javascript
{
  "inbounds": [
    {
      "port": 16823,
      "protocol": "vmess",    
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
            "alterId": 64
          }
        ]
      },
      "sniffing": {
        "enabled": true, //一定要开启 sniffing，V2Ray 才能识别 Netflix 的流量
        "destOverride": ["http", "tls"]
      },
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      // VPS1 的配置
      "tag": "VPS1"
      "protocol": "vmess",
      "settings": {
        "vnext": [{
          "address": "1.2.3.4", 
          "port": 10086,
          "users": [{
            "id": "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297",
            "security": "auto",
            "alterId": 64
          }]
        }]
      }
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "outboundTag": "VPS1",
        "domain": ["geosite:netflix"] // netflix 走 VPS1
      }
    ]
  }
}
```

### 代理转发

[代理转发](https://toutyrater.github.io/advanced/outboundproxy.html)也在前文中介绍过，它与中转的方法其实是差别不大的。照搬上文提到的中转的例子，假如有 VPS1 和 VPS2 这两个服务器，发现 VPS1 可以看 Netflix，但是速度慢，VPS2 速度不错，但是看不了 Netflix。如果有这么一个情况，VPS2 是购买的代理（比如机场），这个时候就没法修改 VPS2 的配置实现中转了，因为没有 VPS2 的直接控制权限，顶多能修改端口、UUID 这些有限的东西。既然改不了服务器，那我就改客户端，直接在客户端上利用代理转发的功能，以 VPS2 为跳板，将 Netflix 的流量转发至 VPS1。具体配置如下。

```javascript
{
  "inbounds": [
    {
      "port": 1080, 
      "protocol": "socks", 
      "sniffing": {
        "enabled": true, //一定要开启 sniffing，V2Ray 才能识别 Netflix 的流量
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      // VPS1 的配置
      "tag": "VPS1"
      "protocol": "vmess",
      "settings": {
        "vnext": [{
          "address": "1.2.3.4", 
          "port": 10086,
          "users": [{
            "id": "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297",
            "security": "auto",
            "alterId": 64
          }]
        }]
      },
      "proxySettings": {
        "tag": "VPS2"  // VPS2 的 tag，表示 VPS1 的流量由 VPS2 转发
      }
    },
    {
      // VPS2 的配置
      "tag": "VPS2"
      "protocol": "vmess",
      "settings": {
        "vnext": [{
          "address": "2.2.3.5", 
          "port": 16823,
          "users": [{
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "security": "auto",
            "alterId": 64
          }]
        }]
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {}
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"] // 国内直连
      },    
      {
        "type": "field",
        "outboundTag": "VPS1",
        "domain": ["geosite:netflix"] // netflix 走 VPS1
      },
      {
        "type": "field",
        "outboundTag": "VPS2",
        "network": "udp,tcp" // 其余走 VPS2
      }  
    ]
  }
}
```
需要注意的是，代理转发的有一个缺点，就是streamSettings将会失效，也就是只能用 TCP 的传输层并且不能开启 TLS。不过这其实是有办法解决的，利用 V2Ray 自带的 dokodemo-door 再转发一次就行了，重点我已经提示了，如果有需要可以自己去研究一下。

### DNS 

网上还有一种所谓 DNS 解锁的办法看 Netflix，说得好流弊的样子，后来我看了一下其实就是 SNI Proxy 的马甲，再说简单点就是通过劫持 DNS 将 Netflix 解析到可以看 Netflix 的服务器 IP 上，这个服务器已经搭建了 SNI 代理，也就实现了上面说的 DNS 解锁。因此，网上也有一些生意人搭建了这类 DNS 解锁的服务器，然后提供一个 DNS 服务器 IP，把 DNS 设置的改成他提供的 IP 就可以看 Netflix 了。这样的 DNS 解锁我们可以直接用，但是有两个问题，一是隐私问题，用人家提供的 DNS，你上什么网站别人都知道，二是稳定问题，哪一天这个 DNS 崩了，不仅看不了 Netflix，其他的上网活动都会受影响。所以我们可以利用 V2Ray 进行 DNS 分流，netflix 的地址交给商家提供的服务器解析，其余的交给稳定可靠经得起时间考验的DNS服务器(如 Google 家的)。以下是示例配置。

```javascript
{
  "inbounds": [
    {
      "port": 16823,
      "protocol": "vmess",    
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
            "alterId": 64
          }
        ]
      },
      "sniffing": {
        "enabled": true, //一定要开启 sniffing，V2Ray 才能识别 Netflix 的流量
        "destOverride": ["http", "tls"]
      },
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP" // 必须设定 domainStrategy 为 UseIP 以使用内置的DNS
      }
    }
  ],
  "dns": {
    "servers": [
      "8.8.8.8", 
      {
        "address": "1.1.2.2", // 购买的 DNS 解锁提供的 IP
        "port": 53,
        "domains": [
          "geosite:netflix" 
        ]
      }
    ]
  }
}
```

这个 DNS 的方法我并没有用过，这个只是我根据资料而主观感觉可行。

## 小结

1. 以上方法都是通用方法，不是仅针对 Netflix，HBO 也可以，甚至是一些比较小众的网站，只提 Netflix 是因为大伙对 Netflix 的需求比较大；
2. 以上方法不限于 VMess 协议，示例使用 VMess 只是方便，你甚至可以用 V2Ray 搭配其他代理工具使用；
3. 其实写本文感觉没什么意思，只是秀一下 V2Ray 而已，不过对于有需要的朋友来说还是挺有用的；
4. 代理转发是配置在客户端的，鉴于目前 V2Ray 客户端的实现程度，需要自己写自定义配置才行；
5. 如果使用的是代理转发，并且是用 iOS 的 Kitsunebi，一定要把有 proxySettings 的出站协议放在 outbounds 的第一个，别问为什么，我也不知道。
