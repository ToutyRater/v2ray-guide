# WebSocket

WebSocket 的配置其实很简单，就跟 mKCP 一样把 network 一改就行了。话不多说，直接上配置。

## 配置

### 服务器配置

```javascript
{
  "inbound": {
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
    "streamSettings":{
      "network":"ws"
    }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {}
  }
}
```

### 客户端配置

```javascript
{
  "inbound": {
    "port": 1080,
    "protocol": "socks",
    "settings": {
      "auth": "noauth"
    }
  },
  "outbound": {
    "protocol": "vmess",
    "settings": {
      "vnext": [
        {
          "address": "serveraddr.com",
          "port": 16823,
          "users": [
            {
              "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
              "alterId": 64
            }
          ]
        }
      ]
    },
    "streamSettings":{
      "network":"ws"
    }
  }
}
```
## 另类用法

之前提到过 TLS 的配置方法,而这里也会实现 TLS，唯一的不同是这次 TLS 的配置将写入 Nginx 或者 Caddy 等软件配置中，由这些软件来监听 443 端口，然后将其转发到 V2Ray的 WebSocket 所监听的内网端口，Nginx 和 Caddy 二选一即可，这样同样能够实现完整的 TLS。

### 服务器配置

```javascript
{
  "inbound": {
    "port": 10000,
    "listen":"127.0.0.1",
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
          "alterId": 64
        }
      ]
    },
    "streamSettings":{
      "network":"ws"
    }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {}
  }
}
```

### Nginx 配置

```
server {
  listen  443 ssl;
  ssl on;
  ssl_certificate       /etc/v2ray/v2ray.crt;
  ssl_certificate_key   /etc/v2ray/v2ray.key;
  ssl_protocols         TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers           HIGH:!aNULL:!MD5;
  server_name           serveraddr.com;
        location / {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:10000;#假设WebSocket监听在环回地址的10000端口上
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        }
}
```

### Caddy 配置

```
caddy serveraddr.com
{
  log ./caddy.log
  proxy / locaohost:10000{
    websocket
    header_upstream -Origin
  }
}
```

### 客户端配置

```javascipt
{
  "inbound": {
    "port": 1080,
    "listen": "127.0.0.1",
    "protocol": "socks",
    "settings": {
      "auth": "noauth",
      "udp": false
    }
  },
  "outbound": {
    "protocol": "vmess",
    "settings": {
      "vnext": [
        {
          "address": "serveraddr.com",
          "port": 443,
          "users": [
            {
              "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
              "alterId": 64
            }
          ]
        }
      ]
    },
    "streamSettings": {
      "network": "ws",
      "security": "tls",
      "tlsSettings": {
          "serverName": "serveraddr.com",
          "allowInsecure": false
      }
    }
}
```

- 如果在设置完成之后不能成功使用，可能是由于 SElinux 机制(如果你是 CentOS 7 的用户请特别留意 SElinux 这一机制)阻止了 Nginx 转发向内网的数据。如果是这样的话，在 V2Ray 的日志里不会有访问信息，在 Nginx 的日志里会出现大量的 "Permission Denied" 字段，要解决这一问题需要在终端下键入以下命令：
  ```
  setsebool -P httpd_can_network_connect 1
  ```
