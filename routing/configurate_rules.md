# 路由规则设定方法

在中国翻墙，其中有一个问题是很难绕开的，那就是分流。可能有人立马说这有什么难的，就代理被墙的网站就好了；当然也可能有人说，直接分应用代理就行了，简单粗暴。这两个说法都有道理，也都有各自不可取的地方。我们先从历史说起，介绍一下从古自今大能们都用过的分流方式(可能有错漏)。

VPN(Virtual Private Network)，中文译名虛拟私人网络，以在公共信道中建立一个虚拟的加密专用信道的方式来保证通信中的信息安全，起初多用于有保密需求的企业、公司等，但由于 VPN 这样的特点，后来被中国网友用于翻墙，甚至到后来在一些网友的认知里 VPN 与翻墙是等价的。忽略各种细节从翻墙的角度来说，只要你用 VPN(与 V2Ray、Shadowsocks 在手机上开启的 VPN 不完全是一个概念)，就相当于所有的网络活动通过架设 VPN 的服务器来完成的，比如说服务器在日本东京，访问任何网站无论是要美国的亚马逊、英国的 BBC 还是中国的百度，都要先兜一圈到东京的这台服务器。这样不管上什么网站都要经过服务器的叫做全局代理（还有另外一种也叫全局，后面再说）。因为中国极度奇葩的网络环境，跨运营商都有可能龟速一样，通过国外服务器跨国访问中国网速就更慢得不用说，所以这种全局代理也随着 VPN 被 GFW 逐渐识别后走下了舞台。

后来 Shadowsocks 横空出世，它的诸多优点网上分析的文章多如牛毛，这里只说分流，后来 Shadowsocks 的 Windows 版本可以利用 PAC (自动代理配置)有选择地代理指定的网站，因此产生了一个叫做 GFWList 的项目。GFWList 收集了已知的被中国墙了的网站。Shadowsocks 根据 GFWList，如果访问的网站被收录在 GFWList 里，那么访问这个网站会通过 Shadowsocks 代理，否则不会被代理。因为这种分流方式根据 GFWList 决定某个网站是否通过代理，而 GFWList 里收录的网站对于 GFW 来说是禁止访问的黑名单，故这种分流方式也称为`黑名单模式`。黑名单模式有两个缺点，一是我们无法知道所有被墙的网站，也就是说无法将所有被墙的网站都收录在 GFWList，总会有遗漏；二是 GFWList 只是收录被墙的网站，那么如果我访问一个国外但又没有被墙的网站，就会慢得令人怀疑是不是回到了 2G 时代。

与黑名单相对应分流方式的叫`白名单模式`。白名单模式则与黑名单模式相反，白名单收录了已知的中国大陆境内的网站，如果访问的网站在白名单内，该网站直连，反之如果不在白名单内，就会通过代理。同黑名单一样，我们也无法一一收录完全所有中国大陆的网站，一旦访问不在白名单内但又位于中国大陆的网站，就会通过代理，同样慢得令人怀疑。这里所指的白名单我暂且称为 ChinaList 吧。下图是我画的一个集合图，直观显示了 ChinaList 和 GFWList 的关系。
![](/resource/images/gfwlist&chinalist.png)
前面还提到一种分应用代理，这种分流方式主要存在于 Android 系统的手机中。也就是选择手机中的一部分 App 代理/不代理，那么其余的 App 不代理/代理。这种分应用代理的分流方式就很像黑名单或白名单模式，区别在于名单内的类型是 App 还是域名。因为一个应用有可能国内外网站都访问，设置不方便，各个设备之间无法导入导出，我觉得不好维护，几乎没用过。所以分应用代理只作介绍，后文不再涉及。

上面讲到的 GFWList 和 ChinaList 都是针对域名来说的，对于 IP 也有相应的名单（通常叫做库）。IP 库通常是一些统计机构在做，主要是为了知道某个 IP 所处的位置，精确的国别、省、市的都有。这些 IP 库有免费的也有收费的，不同机构的 IP 库也有区别，对于我们翻墙来说，知道 IP 的国别能够进行国内外分流即可。

说了这么多，下面开始实操了，我将会说明各种分流模式的配置及应用场景。

## GFWList 黑名单模式
```javascript
{
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      // 第一条规则
      {
        "type": "field",
        "outboundTag": "proxy", // 代理的 tag
        "domain": ["ext:h2y.dat:gfw"] // 中国大陆网站
      },
      // 第二条规则
      {
        "type": "field",
        "outboundTag": "direct", // freedom 的 tag
        "network": "udp,tcp"
      }  
    ]
  }
}
```
如上面的配置，就是简单的白名单模式。规则从上往下一次匹配，首先是 ext:h2y.dat:gfw，这可以认为是 GWFList 的另一种形式，使用方式见[域名文件](https://toutyrater.github.io/routing/sitedata.html)小节。第一条规则中，outboundTag 是 proxy，则表明中国大陆网站直连。在第二条规则中，netwrok 为 udp,tcp，而且没有指定 domain 和 IP，这条规则本身表示所有流量，但是它位于第一条规则之后，也就是代表着除 GFWList 之外的所有域名都会匹配第二条规则，这样只指定了"network": "udp,tcp"，并且指定"outboundTag": "direct"，我们可以理解为上面所有规则都不匹配的情况下则默认为 direct。这正是前面说的黑名单模式：如果访问的网站被收录在 GFWList 里，那么访问这个网站会走代理，否则直连。这种黑名单模式我认为比较适合于主要上国内网站，只是偶尔上一下国外且是知名大公司的网站，这种情况下遇到不收录在 GFWList 的国外域名概率比较低。

这里解释一句，从 V2Ray 项目发起至今，有许多网友请求集成 GFWList，但 V2Ray 始终没有做，这是有原因的。一是因为 GFWList 是 GPL 许可，没法直接用；二是因为 Raymond 认为 GFWList 项目形式不利于维护（大致意思，不是原话）。

## ChinaList 白名单模式
```javascript
{
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      // 第一条规则
      {
        "type": "field",
        "outboundTag": "direct", // freedom 的 tag
        "domain": ["geosite:cn"] // 中国大陆网站
      },
      // 第二条规则
      {
        "type": "field",
        "outboundTag": "proxy",
        "network": "udp,tcp"
      }  
    ]
  }
}
```

如上面的配置，就是简单的白名单模式。规则从上往下一次匹配，首先是 geosite:cn，geosite 是 Project V 下 domain list community 项目生成的域名列表文件，收录了许多主要网站的域名，此处的 geosite:cn 表示其中收录的中国大陆网站的域名。第一条规则中，outboundTag 是 direct，则表明中国大陆网站直连。在第二条规则中，"network": "udp,tcp"，并且指定"outboundTag": "direct"，即不匹配 ChinaList 时走代理。这正是前面说的白名单模式。这种白名单模式我认为比较适合于主要上国外网站的，国内的几乎是上大公司的网站，这种情况下遇到不收录在 geosite:cn 的国内域名概率比较低。

## ChinaList + ChinaIP 白名单模式

```javascript
{
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      // 第一条规则
      {
        "type": "field",
        "outboundTag": "direct", // freedom 的 tag
        "domain": ["geosite:cn"] // 中国大陆网站
      },
      // 第二条规则
      {
        "type": "field",
        "outboundTag": "direct", // freedom 的 tag
        "ip": ["geoip:cn"] // 中国大陆 IP
      },
      // 第三条规则
      {
        "type": "field",
        "outboundTag": "proxy",
        "network": "udp,tcp"
      }  
    ]
  }
}
```
这个路由规则配置与 ChinaList 白名单模式相比区别在于第一条规则之后插入了一条 geoip:cn 直连的规则，代表着 IP 只要是收录在 geoip:cn 的都会直连。geoip 是使用 MaxMind 的 GeoLite2 IP 库，非常全面，因此极大的扩充了白名单，几乎没有遗漏中国网站，更具有普适性。我认为无论是大多上国外网还是大多上国内网的都适用。尽管这样，还是有点小缺点：域名与 IP 是两种类型的，我们需要通过 DNS 将域名转为 IP，代理应用中，为了避免 DNS 受污染问题导致一些网站翻不了，通常连 DNS 也代理。因为 DNS 也代理了，就会可能出现这样的情况：一个中国大陆网站的域名通过代理 DNS 查询到一个国外的 IP，根据上面的规则，这个网站则会通过代理访问，一样会出现慢的问题。

不过好消息是这个问题有解决办法，我再多测试一段时间，后续发出。

## 更新历史

- 2020-02-13 初版
