# 域名文件

## 内置的域名文件
在下载 V2Ray 的时候，下载的压缩包有一个 geosite.dat。这个文件是在路由功能里用到的，文件内置了许多[常见的国内网站域名](https://github.com/v2ray/ext/blob/master/tools/geosites/cn.go)。配置方式如下，geosite 指 geosite.dat 文件，后面的 cn 是一个标签，代表着使用 geosite.dat 文件里的cn 规则。
```
{
    "type": "field",
    "outboundTag": "direct",
    "domain": [
        "geosite:cn"
    ]
}
```
通过它可以设定这些国内域名走直连,这样就相当把规则的域名写到一个文件里，然后在配置中引用这个域名文件，其中有一个好处是配置比较简洁，看起来比较清爽。

## 外置的域名文件

很多时候，V2Ray 内置的国内域名不能满足使用。不过 V2Ray 可以使用外部自定义的像 geosite.dat 这样的域名文件，刚好我也制作了一个，可以供大家使用。

1. 到 https://github.com/ToutyRater/v2ray-SiteDAT/releases 下载 h2y.dat 文件放到 V2Ray 运行文件的目录下。
2. 按需要些路由规则，格式为 "ext:h2y.dat:tag"。ext 表示使用外部文件；h2y.dat 是具体的文件名；tag 泛指标签，有哪些标签由文件提供。下载的 h2y.dat 文件有 4 个标签，分别是 top500_direct、gfw、ad 和 mad，意思分别是前 500 可以直连的网站域名、gfw域名列表、广告列表和手动添加的广告域名，它们所包含的域名在[这里](https://github.com/ToutyRater/v2ray-SiteDAT/tree/master/h2y)可以看到。示例如下。
3. 运行 V2Ray。
```
"rules":[
    {
        "type": "field",
        "outboundTag": "block",
        "domain": [
            "ext:h2y.dat:mad",
            "ext:h2y.dat:ad"
        ]
    },
    {
        "type": "field",
        "outboundTag": "proxy",
        "domain": [
            "ext:h2y.dat:gfw"
        ]
        
    }
]
```

需要注意的是，目前所有第三方的 V2Ray GUI 客户端都不支持加载外置的域名文件。

## 更新历史

- 2018-06-07 初版
