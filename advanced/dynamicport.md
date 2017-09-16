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
  "outbound":{
    "protocol": "vmess",
    "settings":{
      "vnext":[
        {
          "address":"1.2.3.4",
          "port":37192,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
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
    },
    "streamSettings": {
      "network": "kcp"
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
  "outbound":{
    "protocol": "vmess",
    "settings":{
      "vnext":[
        {
          "address":"1.2.3.4",
          "port":37192,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
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

## 特殊的动态端口实现

V2Ray 可以添加多个服务器，V2Ray 会随机选择一个服务器。可以利用这一个特性实现另一种形式的动态端口。这种形式的动态端口同时利用了 V2Ray 的多用户功能，理论上相比于 V2Ray 提供的正常的动态端口会消耗更多的内存，如非特殊场景，不建议使用这种方法。


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
      ]
    }
  },
  "inboundDetour":[
    {
      "port": 37292,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ]
      }
    },
    {
      "port": 37392,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ]
      }
    },
    {
      "port": 37492,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ]
      }
    },
    {
      "port": 37592,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            // id 重复不重复无所谓，只要服务器和客户端的能对应上即可
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ]
      }
    }
  ]
}
```

### 客户端配置

```javascript
{
  "outbound":{
    "protocol": "vmess",
    "settings":{
      "vnext":[
        {
          "address":"1.2.3.4",
          "port":37192,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
              "alterId": 64
            }
          ]
        },
        {
          "address":"1.2.3.4",
          "port":37292,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
              "alterId": 64
            }
          ]
        },
        {
          "address":"1.2.3.4",
          "port":37392,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
              "alterId": 64
            }
          ]
        },
        {
          "address":"1.2.3.4",
          "port":37492,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
              "alterId": 64
            }
          ]
        },
        {
          "address":"1.2.3.4",
          "port":37592,
          "users":[
            {
              "id":"d17a1af7-efa5-42ca-b7e9-6a35282d737f",
              "alterId": 64
            }
          ]
        }
      ]
    }
  }
}
```
