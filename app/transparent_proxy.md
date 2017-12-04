# 透明代理

透明代理是什么意思请自行 Google，在这儿指使用 V2Ray 做透明代理实现路由器翻墙。然而，我个人认为路由器翻墙的说法并不准确，应该叫网关翻墙。所以本例实际上是关于网关翻墙的内容。当然了，单纯使用路由器翻墙也是可以的，因为普通的家用路由器本就是一个网关。

## 优点

其实，V2Ray 早就可以作透明代理，当时我也研究了好一段时间，最终是折腾出来了。但是由于 DNS 的问题，我用着总感觉不太舒服。虽然有 ChinaDNS 这类的解决方案，但个人主观上并不喜欢。
不过嘛，现在就不一样了。就目前来说，使用 V2Ray 透明代理：
1. 解决了墙外 DNS 污染问题
2. 在解决了 1 的情况下国内域名的即能够解析到国内 CDN
3. 不需要外部软件或自建 DNS 就可决绝 1 和 2 的问题，只要系统支持 V2Ray 和 iptables
4. 强大而灵活的路由功能

## 设置步骤

首先，本文假设： 
* VPS 的 IP 为 110.231.43.65，已经搭建 V2Ray 并能正常使用；
* 路由器内网 IP 为 192.168.1.1，能够正常使用；
* 一台Linux设备作为网关，这台设备下文称为网关，地址为 192.168.1.22，并且已经配置好 V2Ray 作为客户端。如果用的是路由器内建的网关，而非独立网关，下文操作步骤中涉及网关的即为路由器，网关地址 192.168.1.22 即为路由器地址 192.168.1.1。


1. 在服务器和网关安装 V2Ray，并配置好配置文件。一定要确定搭建的 V2Ray 能够正常使用

2. 在网关的配置，添加 dokodemo ，并开启 domain override。配置如下：
  ```javascript
{
	"inbound":{...},
	"outbound":{...},
	"inboundDetour":[
		{
			"domainOverride":["tls","http"],
			"port":12345,
			"protocol":"dokodemo-door",
			"settings":{
				"network": "tcp,udp",
				"followRedirect": true
			}
	    },
		...
	],
	"outboundDetour":[...],
	"routing":{...}
}
```

3. 设定 iptables 规则，确定网关能够透明代理
  ```
iptables -t nat -N V2RAY

iptables -t nat -A V2RAY -d 110.231.43.65 -j RETURN

iptables -t nat -A V2RAY -d 0.0.0.0/8 -j RETURN
iptables -t nat -A V2RAY -d 10.0.0.0/8 -j RETURN
iptables -t nat -A V2RAY -d 127.0.0.0/8 -j RETURN
iptables -t nat -A V2RAY -d 169.254.0.0/16 -j RETURN
iptables -t nat -A V2RAY -d 172.16.0.0/12 -j RETURN
iptables -t nat -A V2RAY -d 192.168.0.0/16 -j RETURN
iptables -t nat -A V2RAY -d 224.0.0.0/4 -j RETURN
iptables -t nat -A V2RAY -d 240.0.0.0/4 -j RETURN

iptables -t nat -A V2RAY -p tcp -j REDIRECT --to-ports 12345

iptables -t nat -A OUTPUT -p tcp -j V2RAY
iptables -t nat -A PREROUTING -p tcp -j V2RAY
```

4. 系统开启ip转发。在 /etc/sysctl.conf 文件添加一行 `net.ipv4.ip_forward=1` ，执行下列命令生效
```
sysctl -p /etc/sysctl.conf
```

5. 路由器设定网关地址为 192.168.1.22，或者电脑手机等设备单独设置网关地址。然后测试电脑是不是可以不开代理直接翻墙 
6. 如果 5 可以，就保存 iptables 设置，否则重启网关之后 iptables 规则会失效。如果不可以仔细检查上面的步骤出问题了然后重新操作。重新设置 iptables 的话请先清空原有的规则


## 注意事项

* 在上面的设置中，假设访问了国外网站，如 Google 等，网关依然会使用的系统 DNS 进行查询，只不过返回的结果是污染过的，而 V2Ray 提供的 domain override 能够从流量中提取域名信息交由VPS解析。也就是说，每次打算访问被墙的网站，DNS提供商都知道，鉴于国内企业尿性，也许GFW也都知道，会不会将这些数据收集喂ai也未可知。解决办法是建一个DNS，不向上级查询，直接返回一个错误的ip，反正 V2Ray  能够解决污染问题。如果有朋友知道有什么软件可以实现上述的返回错误ip，请告之。
* domain override 目前只能从 TLS 和 HTTP 流量中提取域名，如果上网流量有非这两种类型的慎用 domain override 解决 DNS 污染。
* 由于对 iptables不熟，我省略掉了对 UDP 流量的透明代理的设置，请精通此道的朋友补充一下
* V2Ray 只能代理 TCP 层的流量，ICMP 不支持，即就算透明代理成功了之后 ping Google 这类网站也是不行的。
* 最好绑定网关的地址为固定 IP，否则网关重启后换了 IP 上不了网会很尴尬
* 在没有交换机的情况下使用独立网关将会加大路由器的 IO 压力，如果路由器的性能比较差，可能会影响上网体验


-------

## 更新历史

* 2017-12-5 初版

