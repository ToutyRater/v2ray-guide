# Shadowsocks

本节讲述 Shadowsocks 的配置。

什么！！！这不是 V2Ray 吗？怎么说配置 Shadowsocks 的配置呢？你喝多了吧！

骚年别紧张。V2Ray 集成有 Shadowsocks 模块的，用 V2Ray 配置成 Shadowsocks 服务器或者 Shadowsocks 客户端都是可以的。

原理与 VMess 大同小异，客户端服务器端都要有 inbound 和 outbound，只不过是 protocol 和 settings 不同，不作过多说明，直接给配置。

## 配置

### 客户端配置

```javascript
{
  "inbound": {
    "port": 1080, // 监听端口
    "protocol": "socks", // 入口协议为 SOCKS 5
    "settings": {
      "auth": "noauth"  // 不认证
    }
  },
  "outbound": {
    "protocol": "shadowsocks",
    "settings": {
      "servers": [
        {
          "address": "serveraddr.com", // Shadowsocks 的服务器地址
          "method": "aes-256-cfb", // Shadowsocks 的加密方式
          "ota": true, // 是否开启 OTA
          "password": "sspasswd", // Shadowsocks 的密码
          "port": 1024  
        }
      ]
    }
  }
}
```

### 服务器配置

```javascript
{
  "inbound": {
    "port": 1024, // 监听端口
    "protocol": "shadowsocks",
    "settings": {
      "method": "aes-256-cfb",
      "ota": true, // 是否开启 OTA，建议开启
      "password": "sspasswd"
    }
  },
  "outbound": {
    "protocol": "freedom",  
    "settings": {}
  }
}
```
