# WebSocket+TLS+Web

前文分别提到过 TLS 和 WebSocket 的配置方法，而本文搭配 Web 服务并同时实现 TLS 和 WebSocket。关于 Web 的软件本文给出了 Nginx 和 Caddy 两个例子，二选一即可。

很多新手一接触 V2Ray 就想搞 WebSocket+TLS+Web+CDN，我就想问 ssh 和 vim/nano 用利索了没，步子这么大不怕扯到蛋吗？使用 Nginx/Caddy 是因为 VPS 已经有 Nginx/Caddy 可以将 V2Ray 稍作隐藏，使用 WebSocket 是因为搭配 Nginx/Caddy 只能用 WebSocket，使用 TLS 是因为可以流量加密，看起来更像 HTTPS，这可甩搞 400 错误跳转几条街了。 
V2Ray 的不依赖其它软件，只是能与其搭配使用而已，没有它们也可以正常使用。

## 配置

这次 TLS 的配置将写入 Nginx 或者 Caddy 配置中，由这些软件来监听 443 端口，然后将其转发到 V2Ray 的 WebSocket 所监听的内网端口，V2Ray 服务器端不需要配置 TLS。

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
      "network":"ws",
      "wsSettings": {
      "path": "/ray"
      }
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
        location /ray {
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
serveraddr.com
{
  log ./caddy.log
  proxy /ray localhost:10000 {
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
          "serverName": "serveraddr.com"
      },
      "wsSettings":{
          "path":"/ray"
      }
    }
  }
}
```
### 注意：较低版本的nginx的location需要写为 /ray/ 才能正常工作

- 如果在设置完成之后不能成功使用，可能是由于 SElinux 机制(如果你是 CentOS 7 的用户请特别留意 SElinux 这一机制)阻止了 Nginx 转发向内网的数据。如果是这样的话，在 V2Ray 的日志里不会有访问信息，在 Nginx 的日志里会出现大量的 "Permission Denied" 字段，要解决这一问题需要在终端下键入以下命令：
  ```
  setsebool -P httpd_can_network_connect 1
  ```
