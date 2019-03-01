# WebSocket+TLS+Web

前文分别提到过 TLS 和 WebSocket 的配置方法，而本文搭配 Web 服务并同时实现 TLS 和 WebSocket。关于 Web 的软件本文给出了 Nginx，Caddy 和 Apache 三个例子，三选一即可，也可以选用其它的软件。

很多新手一接触 V2Ray 就想搞 WebSocket+TLS+Web 或 WebSocket+TLS+Web+CDN，我就想问 ssh 和 vim/nano 用利索了没，步子这么大不怕扯到蛋吗？使用 Nginx / Caddy / Apache 是因为 VPS 已经有 Nginx / Caddy / Apache 可以将 V2Ray 稍作隐藏，使用 WebSocket 是因为搭配 Nginx / Caddy / Apache 只能用 WebSocket，使用 TLS 是因为可以流量加密，看起来更像 HTTPS。 也许 WebSocket+TLS+Web 的配置组合相对较好，但不意味着这样的配置适合任何人。因为本节涉及 Nginx / Caddy / Apache，只给出了配置示例而不讲具体使用方法，也就是说你在阅读本节内容前得会使用这三个软件的其中之一，如果你还不会，请自行 Google。

注意: V2Ray 的 Websocket+TLS 配置组合并不依赖 Nginx / Caddy / Apache，只是能与其搭配使用而已，没有它们也可以正常使用。

## 配置

### 服务器配置

这次 TLS 的配置将写入 Nginx / Caddy / Apache 配置中，由这些软件来监听 443 端口（443 比较常用，并非 443 不可），然后将流量转发到 V2Ray 的 WebSocket 所监听的内网端口（本例是 10000），V2Ray 服务器端不需要配置 TLS。

#### 服务器 V2Ray 配置 

```javascript
{
  "inbounds": [
    {
      "port": 10000,
      "listen":"127.0.0.1",//只监听 127.0.0.1，避免除本机外的机器探测到开放了 10000 端口
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "alterId": 64
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
        "path": "/ray"
        }
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

#### Nginx 配置

配置中使用的是域名和证书使用 TLS 小节的举例，请替换成自己的。

```
server {
  listen  443 ssl;
  ssl on;
  ssl_certificate       /etc/v2ray/v2ray.crt;
  ssl_certificate_key   /etc/v2ray/v2ray.key;
  ssl_protocols         TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers           HIGH:!aNULL:!MD5;
  server_name           mydomain.me;
        location /ray { # 与 V2Ray 配置中的 path 保持一致
        proxy_redirect off;
        proxy_pass http://127.0.0.1:10000;#假设WebSocket监听在环回地址的10000端口上
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        
        # Show realip in v2ray access.log
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
}
```

#### Caddy 配置

因为 Caddy 会自动申请证书并自动更新，所以使用 Caddy 不用指定证书、密钥。  

```
mydomain.me
{
  log ./caddy.log
  proxy /ray localhost:10000 {
    websocket
    header_upstream -Origin
  }
}
```

#### Apache 配置

同样地，配置中使用的是域名和证书使用 TLS 小节的举例，请替换成自己的。
```
<VirtualHost *:443>
  ServerName mydomain.me
  SSLCertificateFile /etc/v2ray/v2ray.crt
  SSLCertificateKeyFile /etc/v2ray/v2ray.key
  
  SSLProtocol -All +TLSv1 +TLSv1.1 +TLSv1.2
  SSLCipherSuite HIGH:!aNULL
  
  <Location "/ray/">
    ProxyPass ws://127.0.0.1:10000/ray/ upgrade=WebSocket
    ProxyAddHeaders Off
    ProxyPreserveHost On
    RequestHeader append X-Forwarded-For %{REMOTE_ADDR}s
  </Location>
</VirtualHost>
```

### 客户端配置

```javascript
{
  "inbounds": [
    {
      "port": 1080,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth",
        "udp": false
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "mydomain.me",
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
        "wsSettings": {
          "path": "/ray"
        }
      }
    }
  ]
}
```
### 注意事项

- V2Ray 暂时不支持 TLS1.3，如果开启并强制 TLS1.3 会导致 V2Ray 无法连接
- 较低版本的nginx的location需要写为 /ray/ 才能正常工作
- 如果在设置完成之后不能成功使用，可能是由于 SElinux 机制(如果你是 CentOS 7 的用户请特别留意 SElinux 这一机制)阻止了 Nginx 转发向内网的数据。如果是这样的话，在 V2Ray 的日志里不会有访问信息，在 Nginx 的日志里会出现大量的 "Permission Denied" 字段，要解决这一问题需要在终端下键入以下命令：
  ```
  setsebool -P httpd_can_network_connect 1
  ```
- 请保持服务器和客户端的 wsSettings 严格一致，对于 V2Ray，`/ray` 和 `/ray/` 是不一样的

### 其他的话

1. 开启了 TLS 之后 path 参数是被加密的，GFW 看不到；
2. 主动探测一个 path 产生 Bad request 不能证明是 V2Ray；
3. 不安全的因素在于人，自己的问题就不要甩锅，哪怕我把示例中的 path 改成一个 UUID，依然有不少人原封不动地 COPY；
4. 使用 Header 分流并不比 path 安全， 不要迷信。

------

## 更新历史

- 2017-12-05 加一些提示
- 2018-01-03 Update
- 2018-08-19 Update
- 2018-08-30 Add configuration for Apache2
- 2018-11-17 V4.0+ 配置

