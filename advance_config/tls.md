# TLS
从 v1.19 起引入了 TLS，TLS 中文译名是传输层安全，如果你没听说过，请 Google 了解一下。以下给出些我认为介绍较好的文章链接：

 [阮一峰的网络日志：SSL/TLS协议运行机制的概述](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)

 [维基百科：传输层安全协议](https://zh.wikipedia.org/wiki/%E5%82%B3%E8%BC%B8%E5%B1%A4%E5%AE%89%E5%85%A8%E5%8D%94%E8%AD%B0)

 [编程随想的博客：扫盲 HTTPS 和 SSL/TLS 协议[1]：背景知识、协议的需求、设计的难点](https://program-think.blogspot.com/2014/11/https-ssl-tls-1.html)

 [编程随想的博客：扫盲 HTTPS 和 SSL/TLS 协议[2]：可靠密钥交换的难点，以及身份认证的必要性](https://program-think.blogspot.com/2014/11/https-ssl-tls-2.html)

 但是，Shadowsocks 的作者 clowwindy 却认为[翻墙不该用 SSL](https://gist.github.com/clowwindy/5947691)。那么到底该不该用？对此我不作评论，各位自行思考。这里我只教大家如何开启 TLS。

 ## 1. 注册一个域名

如果已经注册有域名了可以跳过。
域名有免费的有付费的，总体来说付费的会优于免费的，具体差别请 Google。如果你不舍得为一个域名每年花点钱，用个免费域名也可以。为了方便，这里我将以免费域名为例。

关于如何注册一个免费域名，我发现有个家伙写得很详细，就不多说了。请参考：

[教你申请.tk/.ml/.cf/.gq/.ga等免费域名](https://www.dou-bi.co/dbwz-3/)

至于注册其它付费的域名请 Google 吧，差不多都是大同小异的。

**注册好域名之后务必记得设置 DNS 解析到你的 VPS !**

以下假设注册的域名为 mydomain.tk，请将之替换成自己的域名。

## 2. 证书生成
使用 TLS 需要证书，证书也有免费付费的，同样的这里使用免费证书，证书认证机构为 [Let's Encrypt](https://letsencrypt.org/)。
证书的生成有许多方法，这里使用的是最简单的方法：使用 [acme.sh](https://github.com/Neilpang/acme.sh) 脚本生成，本部分说明节选自[acme.sh Wiki](https://github.com/Neilpang/acme.sh/wiki/%E8%AF%B4%E6%98%8E)。
需要更多关于 acme.sh 请参考该 wiki。

证书生成只需在服务器上操作，现在开始：

### 安装 acme.sh
执行以下命令，acme.sh 会安装到 ~/.acme.sh 目录下：
```
curl  https://get.acme.sh | sh
```
### 使用 acme.sh 生成证书

执行以下命令生成证书：
```
acme.sh  --issue -d mydomain.tk   --standalone
```
此命令会临时监听 80 端口，请确保执行该命令前 80 端口没有使用。

### 安装证书和密钥
将证书和密钥安装到 /etc/v2ray 中：
```
acme.sh --installcert -d mydomain.tk --fullchainpath /etc/v2ray.crt --keypath /etc/v2ray/v2ray.key
```
**无论什么情况，密钥(即上面的v2ray.key)都不能泄漏**
## 3. 配置 V2Ray

服务器配置：
```javascript
{
  "inbound": {
    "port": 443, // 建议使用 443 端口
    "protocol": "vmess",    
    "settings": {
      "clients": [
        {
          "id": "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297",  
          "alterId": 64
        }
      ]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "tls", // security 要设置为 tls 才会启用 TLS
      "tlsSettings": {
        "certificates": [
          {
            "certificateFile": "/etc/v2ray/v2ray.crt", //证书文件
            "keyFile": "/root/acmessl/v2ray.key" //密钥文件
          }
        ]
      }
    }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {}
  }
}
```

客户端配置：

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
          "address": "mydomain.tk",
          "port": 443,
          "users": [
            {
              "id": "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297",
              "alterId": 64
            }
          ]
        }
      ]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "tls" // 客户端的 security 也要设置为 tls
    }
  }
}
```
