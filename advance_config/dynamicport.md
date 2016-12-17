# 动态端口

V2Ray 提供了一个叫动态端口的功能。顾名思义，就是可以动态变化端口，对于对抗封锁或许有效，请大家自行验证。

## 基本动态端口
服务器 inbound 的端口作为主端口，在 inboundDetour 开动态监听的端口，客户端不用额外设定。

服务器：

```javascript
{
  "inbound":{
    "port": 8888,
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
          "level": 1,
          "alterId": 10
        }
      ],
      "detour": {        
        "to": "dynamicPort"   
      }
    }
  },
  "inboundDetour":[
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
        "refresh": 3           // 每五分钟刷新一次
      }
    }
  ]
}
```

客户端：
```javascript
{
  "outbound":{
    "protocol": "vmess",
    "settings":{
      "vnext":[
        {
          "address":"1.2.3.4",
          "port":37192,
          "uses":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
              "alterId": 10
            }
          ]
        }
      ]
    }
  }
}
```

## 动态端口使用 mKCP

在 inbound 和 inboundDetour 加入 streamSettings 即可


## 特殊的动态端口实现

V2Ray 可以添加多个服务器，服务器的选择是随机。可以利用这一个特性实现另一种形式的动态端口。