# 反向代理

反向代理是一个呼声比较高的功能请求，从 v2.x 版本时就有不少人询问开发者能否加入这个功能，直至 v4.0 终于推出了。反向代理的主要是用来作内网穿透，其实就是利用 VPS 访问不具有公网 IP 的内网服务器。具体的例子是，家里有一台 NAS，因为没有公网 IP，正常情况下在外面（离开了家里的网络）没法直接访问这台 NAS，但是通过反向代理就可以。如果看到这样的举例还不明白有什么用，说明你没有相关的需求，不必再折腾了。

提到反向代理，就不得不提一下如今广为推崇的 FRP，我不欲比较两者在反向代理上孰优孰劣，我只是想提一句，V2Ray 的配置相较来说会难以理解一些，希望做好准备。

## 原理

为了易于理解，本节约定有 3 种设备，名为A, B, C。其中 A 为不具备公网 IP 的内网服务器，运行了 NAS 或个人网盘等；B 为具有公网 IP 的服务器，如平常我们购买的 VPS；C 为想要访问 NAS 或私有网盘的设备（本节假设你已经搭建好了私有网盘，监听的端口为 80）。这 3 种的每一种设备都可以是一台或多台，我们先以每种设备都是 1 台来说明。为了能够建立反向代理连接，A 和 B 都要运行 V2Ray，C 可以不运行 V2Ray 。在设置好配置文件并运行 V2Ray 之后，反向代理中连接建立的次序为：


1. A 会主动向 B 发起请求，建立起一个连接；
1. 用户在 C 上向 B 发起请求，欲访问 A 上的私有网盘；
1. B 接受 C 的请求，通过 A 向 B 建立的连接转发给 A(即 B 反向连接了 A)；

以上过程效果就相当于 C 向 A 发起请求，达到了访问 A 的私有网盘的目的。A 向 B 发起请求，A 需要一个 outbound ，B 需要一个 inbound（因为 A 的 outbound 是连接到 B 的 inbound，具备 inbound 和 outbound 的协议有 3 种：VMess, Shadowsocks 和 Socks。本节以 VMess为例）；C 向 B 发起请求，B 还需要一个 inbound，C 不运行V2（ B 的 inbound 要接受不是来自V2的流量，只能是任意门 dokodemo-door）；因为是 A 来访问最终的服务器(私有网盘)，所以 A 还需有一个 outbound，即 freedom。也就是说 A 需要两个 outbound（VMess 和 freedom），B 需要两个inbound(VMess 和 dokodemo-door)。然后为了让 A 能够主动连接 B，A 需要配置反向代理(reverse)；同样的，为了能够让 B 反向连接 A，B 也需要配置反向代理(reverse)。最后还要配置好路由。

![](/resource/images/block_of_ reverse-doko.bmp)

## 配置

以下给出具体配置，请结合原理部分的描述进行理解。

### A 的配置

```javascript
{  
  "reverse":{ 
    // 这是 A 的反向代理设置，必须有下面的 bridges 对象
    "bridges":[  
      {  
        "tag":"bridge", // 关于 A 的反向代理标签，在路由中会用到
        "domain":"private.cloud.com" // A 和 B 反向代理通信的域名，可以自己取一个，可以不是自己购买的域名，但必须跟下面 B 中的 reverse 配置的域名一致
      }
    ]
  },
  "outbounds": [
    {  
      //A连接B的outbound  
      "tag":"tunnel", // A 连接 B 的 outbound 的标签，在路由中会用到
      "protocol":"vmess",
      "settings":{  
        "vnext":[  
          {  
            "address":"serveraddr.com", // B 地址，IP 或 实际的域名
            "port":16823,
            "users":[  
              {  
                "id":"b831381d-6324-4d53-ad4f-8cda48b30811",
                "alterId":64
              }
            ]
          }
        ]
      }
    },
    // 另一个 outbound，最终连接私有网盘    
    {  
      "protocol":"freedom",
      "settings":{  
      },
      "tag":"out"
    }    
  ],
  "routing":{   
    "rules":[  
      {  
        // 配置 A 主动连接 B 的路由规则
        "type":"field",
        "inboundTag":[  
          "bridge"
        ],
        "domain":[  
          "full:private.cloud.com"
        ],
        "outboundTag":"tunnel"
      },
      {  
        // 反向连接访问私有网盘的规则
        "type":"field",
        "inboundTag":[  
          "bridge"
        ],
        "outboundTag":"out"
      }
    ]
  }
}
```

### B 的配置

```javascript
{  
  "reverse":{  //这是 B 的反向代理设置，必须有下面的 portals 对象
    "portals":[  
      {  
        "tag":"portal",
        "domain":"private.cloud.com"        // 必须和上面 A 设定的域名一样
      }
    ]
  },
  "inbounds": [
    {  
      // 接受 C 的inbound
      "tag":"external", // 标签，路由中用到
      "port":80,
      // 开放 80 端口，用于接收外部的 HTTP 访问 
      "protocol":"dokodemo-door",
        "settings":{  
          "address":"127.0.0.1",
          "port":80, //假设 NAS 监听的端口为 80
          "network":"tcp"
        }
    },
    // 另一个 inbound，接受 A 主动发起的请求  
    {  
      "tag": "tunnel",// 标签，路由中用到
      "port":16823,
      "protocol":"vmess",
      "settings":{  
        "clients":[  
          {  
            "id":"b831381d-6324-4d53-ad4f-8cda48b30811",
            "alterId":64
          }
        ]
      }
    }
  ],
  "routing":{  
    "rules":[  
      {  //路由规则，接收 C 请求后发给 A
        "type":"field",
        "inboundTag":[  
          "external"
        ],
        "outboundTag":"portal"
      },
      {  //路由规则，让 B 能够识别这是 A 主动发起的反向代理连接
        "type":"field",
        "inboundTag":[  
          "tunnel"
        ],
        "domain":[  
          "full:private.cloud.com"
        ],
        "outboundTag":"portal"
      }
    ]
  }
}
```

## 访问

配置好 A 和 B 的 V2Ray 配置后，先后运行 A 和 B 的 V2Ray，同时搭建在 A 私有网盘也要运行。然后 C 接入跟 A 不同的网络（比如说到邻居家蹭网），用浏览器访问 B 的 IP 或域名，这时就能内网穿透访问私有网盘了。


## 更新历史

- 2018-10-31 初版
- 2019-01-13 V4.0+ 配置格式

