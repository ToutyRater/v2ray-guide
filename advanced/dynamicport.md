# 动态端口

V2Ray 提供了一个叫动态端口的功能。顾名思义，就是可以动态变化端口，对于对抗封锁或许有效，请大家自行验证。

## 基本动态端口

服务器 inbound 的端口作为主端口，在 inboundDetour 开动态监听的端口，客户端不用额外设定。

### 服务器配置

```javascript
{
  "inbound":{
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
        "refresh": 3           // 每三分钟刷新一次
      }
    }
  ]
}
```

### 客户端配置

```javascript
{
  "outbound": {
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
}
```

## 动态端口使用 mKCP

在 inbound 和 inboundDetour 加入 streamSettings 并将 network 设置为 kcp 即可。

### 服务器配置

```javascript
{
  "inbound": {
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
  "inboundDetour": [
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
  "outbound": {
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
}
```

------
## 更新历史

- 2018-01-06 删除错误且不必要的部分
