# 透明代理

透明代理是什么意思请自行 Google，在这儿指使用 V2Ray 做透明代理实现路由器翻墙。然而，我个人认为路由器翻墙的说法并不准确，应该叫网关翻墙。所以本例实际上是关于网关翻墙的内容。当然了，单纯使用路由器翻墙也是可以的，因为普通的家用路由器本就是一个网关。使用网关翻墙可以使局域网内的所有设备都具有直接翻墙的能力，并且能够全局代理，而不必每台设备都安装 V2Ray，配置更新时只需在网关修改配置，用一些网友的话说就是就感觉没有墙一样。但是，有意上透明代理的同学请评估一下透明代理是否合适自己，而不要盲目跟风。

透明代理适用于以下情况：
* 局域网设备较多，比如说办公室、实验室、子孙满堂的家庭等；
* 设备(的软件)无法/不方便设置代理，比如说 chromecast、电视盒子等；
* 希望设备的所有软件都走代理。

不适用于：
* 随便拿个垃圾路由器就想上的

## 优点

其实，V2Ray 早就可以作透明代理，当时我也研究了好一段时间，最终是折腾出来了。但是由于 DNS 的问题，我用着总感觉不太舒服。虽然有 ChinaDNS 这类的解决方案，但个人主观上并不喜欢。
不过嘛，现在就不一样了。就目前来说，使用 V2Ray 透明代理：
1. 解决了墙外 DNS 污染问题；
2. 在解决了 1 的情况下国内域名的即能够解析到国内 CDN；
3. 不需要外部软件或自建 DNS 就可决绝 1 和 2 的问题，只要系统支持 V2Ray 和 iptables；
4. 能够完美利用 V2Ray 强大而灵活的路由功能，而不必额外维护一个路由表；

## 软硬件准备
* 一台已经搭建 V2Ray 并能正常使用的 VPS ，本文假设 IP 为 `110.231.43.65`；
* 一台带 iptables、有 root 权限并且系统为 Linux 的设备，假设地址为 `192.168.1.22`，已经配置好 V2Ray 作为客户端。这个设备可以是路由器、开发板、个人电脑、虚拟机和 Android 设备等，更具普适性地称之为网关。我个人非常不建议使用 MT7620 系路由器开透明代理，性能太差了，很多固件也没有开启 FPU 。要是真不愿意出这点钱，用电脑开个虚拟机吧(我就是这么干的)，VirtualBox、Hyper 之类的都可以，但是别忘了网络模式用网桥。

## 设置步骤
设置步骤如下，假设使用 root。

1. 网关开启 IP 转发。在 /etc/sysctl.conf 文件添加一行 `net.ipv4.ip_forward=1` ，执行下列命令生效：
```
sysctl -p
```
2. 路由器 DHCP 设定网关地址为网关设备的 IP，本例为 192.168.1.22，或者电脑手机等设备单独设置网关地址，但网关设备必须指定网关地址为路由器的IP，然后电脑/手机测试是不是可以正常上网(这时还不能翻墙)，如果不能上网先去学习一个把这个搞定，否则接下来再怎么也同样上不了网。

3. 在服务器和网关安装 V2Ray（如果不会就参照前面的教程，由于 GFW 会恶化 GitHub Releases 的流量，网关直接运行脚本几乎无法安装，建议从 https://v2ray.com/download 下载然后使用 --local 参数进行安装），并配置好配置文件。一定要确定搭建的 V2Ray 能够正常使用。在网关执行 `curl -x socks5://127.0.0.1:1080 google.com` 测试配置的 V2Ray 是否可以翻墙(命令中 `socks5` 指 inbound 为 socks，`1080` 指该 inbound 端口是 1080)。如果出现类似下面的输出则可以翻墙，如果没有出现就说明翻不了，你得仔细检查以下哪步操作不对或漏了。
```
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```

4. 在网关的配置，添加 dokodemo ，并开启 domain override（注意不要写错配置）。配置形如：
```javascript
{
	"inbound": {...},
	"outbound": {...},
	"inboundDetour": [
		{
			"domainOverride": ["tls","http"],
			"port": 12345,
			"protocol": "dokodemo-door",
			"settings": {
				"network": "tcp,udp",
				"followRedirect": true
			}
	    },
		...
	],
	"outboundDetour": [...],
	"routing": {...}
}
```

5. 设定 iptables 规则，命令如下
```
iptables -t nat -N V2RAY
iptables -t nat -A V2RAY -p tcp -j REDIRECT --to-ports 12345
iptables -t nat -A PREROUTING -p tcp -j V2RAY
```

UDP 流量透明代理的 iptables 规则，命令如下
```
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100
iptables -t mangle -N V2RAY_MASK
iptables -t mangle -A V2RAY_MASK  -d 0.0.0.0/8 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 169.254.0.0/16 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A V2RAY_MASK  -d 240.0.0.0/4 -j RETURN
iptables -t mangle -A V2RAY_MASK -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -p udp -j V2RAY_MASK
```

6. 使用电脑/手机直接访问被墙网站，这时应当可以访问的（如果不能，你可能得请教大神手把手指导了）。

7. 写脚本开机加载上述的 iptables，或者使用第三方软件(如 iptables-persistent)，否则网关重启后 iptables 会失效(即透明代理会失效)。


## 注意事项

* 在上面的设置中，假设访问了国外网站，如 Google 等，网关依然会使用的系统 DNS 进行查询，只不过返回的结果是污染过的，而 V2Ray 提供的 domain override 能够从流量中提取域名信息交由 VPS 解析。也就是说，每次打算访问被墙的网站，DNS 提供商都知道，鉴于国内企业尿性，也许 GFW 也都知道，会不会将这些数据收集喂 AI 也未可知。解决办法是建一个 DNS，不向上级查询，直接返回一个错误的 IP，反正 V2Ray 能够解决污染问题。如果有朋友知道有什么这样的软件，请告之。
* domain override 目前只能从 TLS 和 HTTP 流量中提取域名，如果上网流量有非这两种类型的慎用 domain override 解决 DNS 污染。
* 由于对 iptables 不熟，我省略掉了对 UDP 流量的透明代理的设置，请精通此道的朋友补充一下。
* V2Ray 只能代理 TCP/UDP 的流量，ICMP 不支持，即就算透明代理成功了之后 ping Google 这类网站也是不通的。
* 最好设定网关的地址为静态 IP，否则网关重启后换了 IP 上不了网会很尴尬
* 上述的 iptables 配置只能使局域网内的其它设备翻墙，网关本身是无法翻墙的，如果要网关也能翻墙，要使用 iptables 的 owener 模块直连 V2Ray 发出的流量，然后执行 `iptables -t nat -A OUTPUT -p tcp -j V2RAY`。
* 按照网上的透明代理教程，设置 iptables 肯定要 RETURN 192.168.0.0/16 这类私有地址，但我个人观点是放到 V2Ray 的路由里好一些。

-------

## 更新历史

* 2017-12-05 初版
* 2017-12-24 修复无法访问国内网站问题
* 2017-12-27 排版
* 2017-12-29 删除不必要的 iptables 规则
* 2018-01-16 优化操作步骤
* 2018-01-21 添加 UDP
