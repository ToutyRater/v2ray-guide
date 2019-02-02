# 关于路由规则的注意事项

本节记录了一些新手朋友使用 V2Ray 使用路由功能时常范的错误，希望大家能够避免。

## 通配符

如果我想让淘宝和京东的域名直连，路由功能的规则写成下面这样的，你觉得这样的规则有问题吗？

```javascript
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "*.taobao.com",
            "*.jd.com"
        ]
    }
]
```
看起来没有什么问题，但事实上，有。如果使用了这样的规则，你会发现根本没有走 direct 直连。很奇怪？这并不奇怪。这是因为你的经验在作祟。在 V2Ray 中，星号 \* 不具备通配符的意义，只是一个普通的字符而已，是你以为星号 \* 是通配符，这是臆想。如果想要匹配所有子域名的话，可以这么写规则：

```javascript
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com",
            "domain:jd.com"
        ]
    }
]
```
`domain:` 代表子域名，如 "domain:taobao.com" 这样一条规则包含了所有 taobao.com 域名及其子域名。

## IP & domain

```javascript
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com"
        ],
        "ip": [
            "192.168.0.0/16"
        ]
    }
]
```

这样的一个规则的严格来说没有问题，真正的问题在与使用者不理解规则的配置。如果要匹配以上的规则，那么代表这有一个数据包的目标地址域名是 taobao.com 并且 IP 属于 192.168.0.0.1/16。通常情况下这是不可能的，所以你访问淘宝是不会匹配这个规则。如果你要满足域名和 IP 任一条件都能够匹配规则，那么应该这么写：

```javascript
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com"
        ]
    }，
    {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
            "192.168.0.0/16"
        ]
    }
]
```


## subdomain

## regexp

## private ip
