# 反向代理 2

上一节说了反向代理，我们利用反向代理访问不具备公网 IP 的内网服务（私有网盘）。但是这种反向代理有一个局限，那就是只能分配有限的端口映射。比如说，上一节我们映射了私有网盘的 80 端口，如果我家里有好多设备，运行了很多软件（比如私有网盘、NAS、个人博客、代码仓库等），上一节说的反向代理也可以用，但是有一一分配端口映射，很不优雅，配置写起来也烦。本节介绍另一种反向代理的配置方式，解决了刚刚所举例子的问题，也具有更强的普适性，对于广大网友来说更加实用。

上面所说的可能不太好理解，我用几个实际的使用场景举例就比较容易明白了。本节所说的反向代理可以实现：
- 对于留学生等海外华人，有时候想看中文的视频或听中文音乐等，因为版权原因，没法直接上大陆的网站观看，买大陆的 VPS 又太贵。如果在大陆家里搭建一个 V2Ray，再买一个海外的 VPS，利用反向代理就可以随便看大陆可以看的视频
- 对于大学生，可以利用反向代理在校外访问校园网的资源，无限制下载论文等
- 对于程序员，可以在家里查看公司的代码仓库
- 对于普通用户，可以在外面看家里的监控

## 原理

原理与上一节的反向代理大同小异，差别在于 B 的 dokodemo-door 改成 VMess，然后 C 需要安装 V2Ray 连接 B 的 VMess。最终的效果就是 C 通过 V2Ray 连接 B，B 反向代理给 A，就相当于 C 使用 V2Ray 通过 A 代理上网。

![](/resource/images/block_of_reverse-vmess.bmp)

（**勘误：图中 C 的 inbound 应为 Socks**）

## 配置

以下给出具体配置，请结合原理部分的描述进行理解。

### A 的配置

A 的配置与上一节无变化。

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
  "outbounds":[
    {  
      //A连接B的outbound  
      "tag":"tunnel", // A 连接 B的 outbound 的标签，在路由中会用到
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

B 的配置只有 inbound 部分发生了变化。

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
  "inbounds":[
    {  
      // 接受 C 的inbound
      "tag":"tunnel", // 标签，路由中用到
      "port":11872,
      "protocol":"vmess",
      "settings":{  
        "clients":[  
          {  
            "id":"a26efdb8-ef34-4278-a4e6-2af32cc010aa",
            "alterId":64
          }
        ]
      }
    },
    // 另一个 inbound，接受 A 主动发起的请求  
    {  
      "tag": "interconn",// 标签，路由中用到
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
      {  //路由规则，接收 C 的请求后发给 A
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

`Tips`： 在 B 的配置中，可以使用同一个 VMess inbound 来接受 A 和 C 的请求来简化配置。

### C 的配置

与普通客户端配置一样，连接的服务器是B，在此忽略。

## 访问

A、B、C 都运行 V2Ray，此时 C 访问的任何网络就相当于通过 A 访问一样(C 的路由不作特殊配置的情况下)。


## 更新历史

- 2018-11-01 初版
- 2018-01-13 V4.0+ 配置格式


