# DNS

如果你还不清楚什么是 DNS，建议你 google 一下相关资料。
为了对抗墙的 [DNS 污染](https://zh.wikipedia.org/wiki/%E5%9F%9F%E5%90%8D%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%BC%93%E5%AD%98%E6%B1%A1%E6%9F%93) V2Ray 提供一 DNS 功能。

客户端配置：
```javascript
{
  "dns": {
    "servers": [
      "8.8.8.8",
      "8.8.4.4",
      "localhost"
    ]
  },
  "inbound": {
    "port": 1080,
    "protocol": "socks",
    "settings": {
      "auth": "noauth",
    }
  },
  "outbound": {
    "protocol": "vmess",
    "settings": {
      "vnext": [
        {
          "address": "v2ray.cool",
          "port": 10086,
          "users": [
            {
              "id": "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297",  
              "alterId": 64
            }
          ]
        }
      ]
    }
  },
  "outboundDetour": [
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "adblock"
    }
  ],
  "routing": {
    "strategy": "rules"，
    "settings": {
      "domainStrategy": "AsIs",
      "rules": [
        {
          "domain": [
            "tanx.com",
            "googeadsserving.cn",
            "baidu.com"
          ],
          "type": "field",
          "outboundTag": "adblock"       
        },
        {
          "domain": [
            "amazon.com",
            "microsoft.com",
            "jd.com",
            "youku.com",
            "baidu.com"
          ],
          "type": "field",
          "outboundTag": "direct"
        },
        {
          "type": "chinasites",
          "outboundTag": "direct"
        },
        {
          "type": "chinaip",
          "outboundTag": "direct"
        }
      ]
    }
  }
}
```
服务器配置：
```javascript
{
  "inbound": {
    "port": 10086,
    "protocol": "vmess",    
    "settings": {
      "clients": [
        {
          "id": "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297",
          "alterId": 64
        }
      ]
    }
  },
  "outbound": {
    "protocol": "freedom",
    "settings": {}
  }
}
```
相较于上一节，在客户端配置当中添加了 DNS 的配置项
```javascript
  "dns": {
    "servers": [
      "8.8.8.8",
      "8.8.4.4",
      "localhost"
    ]
  }
```
当 dns.servers 有多个服务器，那么 DNS 查询会从上到下进行。

什么叫从上到下进行查询？

举个粟子吧，当访问 google.com 时，浏览器需要知道 google.com 对应的 IP 是什么，就要进行 DNS 查询。还记得前面讲客户端安装时说要在 firefox 勾选远程 DNS 吗？勾选了这个选项就是使用代理进行 DNS 查询。在这里代理是 V2Ray 也就是使用 V2Ray 查询。 在本例中，进行 DNS 查询时会先向 8.8.8.8 查询，查询到了 google.com 的 IP 之后 V2Ray 就会告诉 firefox 说 google.com 的 IP 是 xxx.xxx.xxx.xxx 你去访问吧。当然有时候 8.8.8.8 会抽一下风，这个时候就不能死吊在一棵树上了，dns 配置还有 8.8.4.4 呢，V2Ray 就会向 8.8.4.4 查询，要是 8.8.4.4 也抽风又会继续向下一个服务器查询。
