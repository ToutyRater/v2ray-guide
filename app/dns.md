# 内置 DNS 

## 简介

仔细看过 V2Ray 手册的朋友应该都知道 V2Ray 内置有一个 DNS 的功能。这一节就来简单介绍一下 V2Ray 这个 DNS 是怎么回事。
这个 DNS 可以总结为：
1. 只为 V2Ray 内部的 routing 和 freedom 服务，routing 只负责匹配规则然后将数据包发往不同 outbound，freedom 只负责将数据包发到目标地址;
2. 只有当 routings / freedom 的 domainStrategy 不是 AsIs 才会工作;
3. 基于 1 推论，客户端的 DNS 不影响服务器的解析;
4. V2Ray 的 DNS 会受路由规则的影响而转发到不同的 outbound 进行查询。

其实就这么简单。再说多点就是只有你的 domainStrategy 设置成了 IPIfNonMatch，在你上网时 V2Ray 找不到对应的路由域名规则，V2Ray 才会通过设置的 DNS 服务器将域名解析成IP，然后匹配规则，其它的它可不管。freedom 同理。

还有，有的网友想利用 DNS 中的 host 做去广告，我没有这么试过，也不知道结果怎么样。我只想说，这是本末倒置了，要去广告使用 routing 就行，不必搞 DNS。

## 详解

还是有人纠结 DNS 的问题，那我就多说几句吧。

首先举个例子，假如我用 FireFox，设置了 Socks 代理，那么当访问 Google.com 时，FireFox 会将一系列与 Google.com 通信的数据包打包成 Socks 协议，发给 Socks 代理软件处理。这儿就有个问题，FireFox 怎么让代理软件知道要访问的是 Google.com，或者说代理怎么知道浏览器发过来的包最终要发给谁？要解答这个问题我们首先得了解 Socks 协议，Socks 协议有一个请求头，包含许多字段，其中 DST.ADDR 字段是告诉代理软件目标地址是什么。我们知道目标地址包括域名和 IP，但从 DST.ADDR 字段是不能知道到底是 IP 还是域名的，这个时候就有一个字段 ATYP 出来了，如果 ATYP 是 3，说明请求头的目标地址为域名，如果是 1 或 4 则为 IP。

继续原来的例子，如果 FireFox 没有勾选了代理 DNS，则 FireFox 直接在本机中进行 DNS 查询 Google.com 的 IP，假设为 32.172.73.25，请求头中 ATYP 填 1，DST.ADDR 填查询得到的 IP，然后代理软件越过万水千山在 VPS 与 32.172.73.25 通信，到了这一步能不能正常通信就取决于查到的 IP 是不是真的 Google 的 IP；而另外一种情况，FireFox 勾选了代理 DNS，那么 FireFox 就不进行 DNS 查询了，直接在请求头中 ATYP 填 3，DST.ADDR 填 googe.com，怎么获得这个 google.com 的 IP 你这代理就自个看着办吧，我不管了（FireFox 如是说）。

在这个例子的基础之上，我将详细解释 V2Ray 中的 DNS 机制。为了更具一般性，忽略某些特殊情况造成的影响，我将举各种不同的例子来进行说明，并限定：

- 两台可以运行 V2Ray 的设备，可以是 PC、服务器、手机等，可以全在墙内或墙外，也可以分别位于墙内外。为了便于说明，本文分别称为 PC1 和 PC2
- 为了能够明显区分 DNS 查询的来源，本文约定 PC1 的系统默认 DNS 为 223.5.5.5， PC1 的 V2Ray DNS 配置为 114.114.114.114，PC2 的系统默认 DNS 为 223.6.6.6， PC2 的 V2Ray DNS 配置为 114.114.115.115，互不相同并且设定的 DNS 都是可用的
- 只说明 V2Ray-core 的 DNS 机制，第三方客户端可能有所变化。

### 一、 FireFox 设定代理 DNS，不开启 domain overrride

由上文可知，在这种设定了代理 DNS 的情况下由代理解决 DNS 问题，有几种情况分别一一说明。(以下结果均经过抓包验证)

#### 1
PC2 不运行，PC1 的 inbound 为 socks，默认 outbound 为 freedom，freedom 的 domainStrategy 为 AsIs，不配置任何路由规则(默认为 AsIs)。

假如访问了 z.cn，那么 z.cn 的 DNS 查询为由 PC1 系统向 223.5.5.5 查询。

#### 2

PC1 的 freedom 的 domainStrategy 设为 UseIP，其他设置不变。这种情况如果访问了 z.cn，则由 PC1 的 V2Ray 向 114.114.114.114 查询 z.cn 的 IP。

#### 3

PC2 设置默认 outbound 为 freedom，domainStrategy 为 AsIs，inbound 为 vmess；PC1 的默认 outbound 为能与 PC2 正常连接的 vmess，inbound 为 Socks；PC1 和 PC2 的 V2Ray 均不配置任何路由规则。假如访问了 z.cn，PC1 没有任何的 DNS 查询，PC2 由系统向 223.6.6.6 查询 z.cn 的 IP。

#### 4

PC2 的 freedom domainStrategy 为 UseIP，其他与 3 设置一致。假如访问了 z.cn，PC1 没有任何的 DNS 查询，由 PC2 的 V2Ray 向 114.114.115.115 查询 z.cn 的 IP。

#### 5

在 3 的基础上， PC1 的 routing domainStrategy 设为 IPIfNonMatch，没有任何基于 IP 的规则。DNS 查询情况与 3 相同。同理，如果在 4 的基础上修改 PC1 的 routing domainStrategy 设为 IPIfNonMatch，DNS 查询的结果则与 4 一样。

#### 6

在 5 的基础上，添加一条 IP 规则。假如访问了 z.cn，PC1 的 V2Ray 向 114.114.114.114 查询 z.cn 的IP，由于默认规则为oubound 发到 PC2，PC2 默认 oubound 为 freedom，所以向 114.114.114.114 查询的请求由 PC2 中转。由于 PC1 默认outbound，z.cn 数据包发往PC2，并且由 PC2 最终会再一次进行查询，由谁查询取决于 PC2 中的 freedom 设为 AsIs 还是 UseIP。两次查询目的不一样，PC1 上的查询用于路由规则的匹配，PC2 上的查询用于最终连接。

#### 7
在 6 的基础上，PC1 添加 freedom，路由规则添加 114.114.114.114 为直连（即转到 freedom）,其它不变。假如访问了 z.cn，PC1 的 V2Ray 在本机向 114.114.114.114 查询 z.cn 的 IP，而不是通过 PC2 中转。PC2 的查询情况与 6 一致。

#### ……

此处省略。

### 二、 FireFox 不设定代理 DNS，不开启 domain overrride

除由 FireFox 查询 DNS 外，均没有`一`中所说的 DNS 查询的情况，因为 V2Ray 接收到的请求目标地址是 IP 类型的，没有域名，何来 DNS？

### 三、FireFox 不设定代理 DNS，PC1 开启 domain overrride

FireFox 本身会进行 DNS 查询，其它的 DNS 查询情况与 `一` 一样，因为 V2Ray 接收到的请求目标地址虽然是 IP 类型的，但开启了 domain overrride 就从流量中嗅探出了域名，相当于把 ATYP 修改为 3，DST.ADD 修改成嗅探到的域名，但只适用于 TLS 和 HTTP 协议的流量。

## 我已经不想继续写了

其实我真的不太想写这么多的，虽然 V2Ray 的用法很简单，但是 V2Ray 的结构类似于节点，可以无限多个，再加上多节点和 routing 的搭配，然后就交织成了一张网，这样的组合想想有多少？要我每一个细节都说清楚是不可能的，稍稍有一点点变动就不一样了。其实 V2Ray 的文档说得已经足够好，不过得把 DNS 配置、路由配置和 freedom 这三部分内容结合起来看。而我所说的一切关于 V2Ray 的 DNS 都不过是基于文档进一步解释而已，而且我也认为本文中简介已经说清楚了。

-----
## 更新历史

- 2017-08-06 初版

- 2017-08-06 修改不当用词

- 2017-11-16 暂时删去

- 2017-12-31 Restore

- 2018-01-06 Details
