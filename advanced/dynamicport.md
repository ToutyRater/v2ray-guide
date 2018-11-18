# 动态端口

V2Ray 提供了一个叫动态端口的功能。顾名思义，就是可以动态变化通信端口，该功能的初衷是为了应对电信服务运营商可能会对长时间大流量的单个端口进行限速。也许是用的人比较少，到目前为止没有证据可以动态端口对于科学上网是加分项还是减分项。

## 基本动态端口

服务器 inbound 的端口作为主端口，在 inboundDetour 开动态监听的端口，客户端不用额外设定，客户端会先与服务器的主端口通信协商下一个使用的端口号。

### 服务器配置

```javascript
{
  "inbounds":[
  { //主端口配置
      "port": 37192,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "alterId": 64
          }
        ],
        "detour": { //绕行配置，即指示客户端使用 dynamicPort 的配置通信
          "to": "dynamicPort"   
        }
      }
    },
    {
      "protocol": "vmess",
      "port": "10000-20000", // 端口范围
      "tag": "dynamicPort",  // 与上面的 detour to 相同
      "settings": {
        "default": {
          "alterId": 64
        }
      },
      "allocate": {            // 分配模式
        "strategy": "random",  // 随机开启
        "concurrency": 2,      // 同时开放两个端口,这个值最大不能超过端口范围的 1/3
        "refresh": 3           // 每三分钟刷新一次
      }
    }
  ]
}
```

### 客户端配置

```javascript
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "1.2.3.4",
            "port": 37192,
            "users": [
              {
                "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
                "alterId": 64
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## 动态端口使用 mKCP

在对应的 inbounds 和 outbounds 加入 streamSettings 并将 network 设置为 kcp 即可。

### 服务器配置

```javascript
{
  "inbounds": [
    {
      "port": 37192,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ],
        "detour": {        
          "to": "dynamicPort"   
        }
      },
      "streamSettings": {
        "network": "kcp"
      }
    },
    {
      "protocol": "vmess",
      "port": "10000-20000", // 端口范围
      "tag": "dynamicPort",       
      "settings": {
        "default": {
          "level": 1,
          "alterId": 32
        }
      },
      "allocate": {            // 分配模式
        "strategy": "random",  // 随机开启
        "concurrency": 2,      // 同时开放两个端口
        "refresh": 3           // 每三分钟刷新一次
      },
      "streamSettings": {
        "network": "kcp"
      }
    }
  ]
}
```

### 客户端配置

```javascript
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "1.2.3.4",
            "port": 37192,
            "users": [
              {
                "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
                "alterId": 64
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "kcp"
      }
    }
  ]
}
```

------
## 更新历史

- 2018-01-06 删除错误且不必要的部分
- 2018-11-17 V4.0+ 配置
