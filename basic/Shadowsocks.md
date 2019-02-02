# Shadowsocks

本节讲述 Shadowsocks 的配置。

什么？这不是 V2Ray 吗？怎么说配置 Shadowsocks 呢？

骚年别紧张。V2Ray 集成有 Shadowsocks 模块的，用 V2Ray 配置成 Shadowsocks 服务器或者 Shadowsocks 客户端都是可以的，兼容 Shadowsocks-libev。

配置与 VMess 大同小异，客户端服务器端都要有入口和出口，只不过是协议(protocol)和相关设置(settings)不同，不作过多说明，直接给配置，如果你配置过 Shadowsocks，对比之下就能够明白每个参数的意思(配置还有注释说明呢)。

## 配置

### 客户端配置

```javascript
{
  "inbounds": [
    {
      "port": 1080, // 监听端口
      "protocol": "socks", // 入口协议为 SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  // 不认证
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "serveraddr.com", // Shadowsocks 的服务器地址
            "method": "aes-128-gcm", // Shadowsocks 的加密方式
            "ota": true, // 是否开启 OTA，true 为开启
            "password": "sspasswd", // Shadowsocks 的密码
            "port": 1024  
          }
        ]
      }
    }
  ]
}
```

### 服务器配置

```javascript
{
  "inbounds": [
    {
      "port": 1024, // 监听端口
      "protocol": "shadowsocks",
      "settings": {
        "method": "aes-128-gcm",
        "ota": true, // 是否开启 OTA
        "password": "sspasswd"
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",  
      "settings": {}
    }
  ]
}
```

### 注意事项

- 因为协议漏洞，Shadowsocks 已放弃 OTA(一次认证) 转而使用 AEAD，V2Ray 的 Shadowsocks 协议已经跟进 AEAD，但是仍然兼容 OTA。建议使用 AEAD (method 为 aes-256-gcm、aes-128-gcm、chacha20-poly1305 即可开启 AEAD), 使用 AEAD 时 OTA 会失效；
- ~~可以搭配 simple-obfs 使用，具体我没试过，有这个需要的就自己研究吧~~(Shadowsocks 已经弃用 simple-obfs)；
- 可以使用 V2Ray 的传输层配置（详见[高级篇](/advanced/README.md)），~~但如果这么设置了将与原版 Shadowsocks 不兼容~~（兼容 Shadowsocks 新增的 [v2ray-plugin](https://github.com/shadowsocks/v2ray-plugin)插件)。

### 更新历史

- 2018-02-09 AEAD 更新
- 2018-09-03 描述更新
- 2018-11-09 跟进 v4.0+ 的配置格式
- 2019-01-19 v2ray-plugin 
