# 透明代理

透明代理是什么意思请自行 Google，在这儿指使用 V2Ray 做透明代理实现路由器翻墙。然而，我个人认为路由器翻墙的说法并不准确，应该叫网关翻墙。所以本例实际上是关于网关翻墙的内容。当然了，单纯使用路由器翻墙也是可以的，因为普通的家用路由器本就是一个网关。使用网关翻墙可以使局域网内的所有设备都具有直接翻墙的能力，并且能够全局代理，而不必每台设备都安装 V2Ray，配置更新时只需在网关修改配置，用一些网友的话说就是就感觉没有墙一样。但是，有意上透明代理的同学请评估一下透明代理是否合适自己，而不要盲目跟风。

透明代理适用于以下情况：
* 局域网设备较多，比如说办公室、实验室、大家庭等；
* 设备(的软件)无法/不方便设置代理，比如说 Chromecast、电视盒子等；
* 希望设备的所有软件都走代理。


## 优点

其实，V2Ray 早就可以作透明代理，当时我也研究了好一段时间，最终是折腾出来了。但是由于 DNS 的问题，我用着总感觉不太舒服。虽然有 ChinaDNS 这类的解决方案，但个人主观上并不喜欢。
不过嘛，现在就不一样了。就目前来说，使用 V2Ray 透明代理：
1. 解决了墙外 DNS 污染问题；
2. 在解决了 1 的情况下国内域名的即能够解析到国内 CDN；
3. 不需要外部软件或自建 DNS 就可决绝 1 和 2 的问题，只要系统支持 V2Ray 和 iptables；
4. 能够完美利用 V2Ray 强大而灵活的路由功能，而不必额外维护一个路由表；

## 准备
* 一个有能力根据实际情况解决遇到问题的人
* 一台已经搭建 V2Ray 并能正常使用的 VPS ，本文假设 IP 为 `110.231.43.65`；
* 一台带 iptables、有 root 权限并且系统为 Linux 的设备，假设地址为 `192.168.1.22`，已经配置好 V2Ray 作为客户端。这个设备可以是路由器、开发板、个人电脑、虚拟机和 Android 设备等，更具普适性地称之为网关。我个人不建议使用 MT7620 系路由器开透明代理，性能太差了，很多固件也没有开启 FPU 。要是真不愿意出这点钱，用电脑开个虚拟机吧(我就是这么干的)，VirtualBox、Hyper 之类的都可以，但是别忘了网络模式用网桥。

## 设置步骤

设置步骤如下，假设使用 root。

1. 网关设备开启 IP 转发。在 /etc/sysctl.conf 文件添加一行 `net.ipv4.ip_forward=1` ，执行下列命令生效：
```
sysctl -p
```
2. 网关设备设置静态 IP，与路由器 LAN 口同一个网段，默认网关为路由器的IP；进入路由器的管理后台，到 DHCP 设定将默认网关地址为网关设备的 IP，本例为 192.168.1.22，或者电脑手机等设备单独设置默认网关，然后电脑/手机重新连接到路由器测试是不是可以正常上网(这时还不能翻墙)，如果不能上网先去学习一个把这个搞定，否则接下来再怎么也同样上不了网。网关设备设定静态 IP 是为了避免重启后 IP 会发生变化导致其他设备无法联网；路由器设定 DHCP 默认网关地址是为了让接入到这个路由器的设备将上网的数据包发到网关设备，然后由网关设备转发。

3. 在服务器和网关安装最新版本的 V2Ray（如果不会就参照前面的教程，由于 GFW 会恶化 GitHub Releases 的流量，网关直接运行脚本几乎无法安装，建议先下载V2Ray 的压缩包，然后用安装脚本通过 --local 参数进行安装），并配置好配置文件。一定要确定搭建的 V2Ray 能够正常使用。在网关执行 `curl -x socks5://127.0.0.1:1080 google.com` 测试配置的 V2Ray 是否可以翻墙(命令中 `socks5` 指 inbound 协议为 socks，`1080` 指该 inbound 端口是 1080)。如果出现类似下面的输出则可以翻墙，如果没有出现就说明翻不了，你得仔细检查以下哪步操作不对或漏了。
```
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```

4. 在网关的配置，添加 dokodemo door 协议的入站配置 ，并开启 sniffing；还要在所有 outbound 的 streamSettins 添加 SO_MARK。配置形如（配置中的`...`代表原来客户端的通常配置）：
```javascript
{
  "routing": {...},
  "inbounds": [
    {
      ...
    },
    {
      "port": 12345, //开放的端口号
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true // 这里要为 true 才能接受来自 iptables 的流量
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "redirect" 
        }
      }
      
    }
  ],
  "outbounds": [
    {
      ...
      "streamSettings": {
        ...
        "sockopt": {
          "mark": 255  //这里是 SO_MARK，用于 iptables 识别，每个 outbound 都要配置；255可以改成其他数值，但要与下面的 iptables 规则对应；如果有多个 outbound，最好奖所有 outbound 的 SO_MARK 都设置成一样的数值
        }
      }
    }
    ...
  ]
}
```

5. 设定 TCP 透明代理的 iptables 规则，命令如下(`#`代表注释)：

  ```
  iptables -t nat -N V2RAY # 新建一个名为 V2RAY 的链
  iptables -t nat -A V2RAY -d 192.168.0.0/16 -j RETURN # 直连 192.168.0.0/16 
  iptables -t nat -A V2RAY -p tcp -j RETURN -m mark --mark 0xff # 直连 SO_MARK 为 0xff 的流量(0xff 是 16 进制数，数值上等同与上面配置的 255)，此规则目的是避免代理本机(网关)流量出现回环问题
  iptables -t nat -A V2RAY -p tcp -j REDIRECT --to-ports 12345 # 其余流量转发到 12345 端口（即 V2Ray）
  iptables -t nat -A PREROUTING -p tcp -j V2RAY # 对局域网其他设备进行透明代理
  iptables -t nat -A OUTPUT -p tcp -j V2RAY # 对本机进行透明代理
  ```

   然后设定 UDP 流量透明代理的 iptables 规则，命令如下
  ```
  ip rule add fwmark 1 table 100
  ip route add local 0.0.0.0/0 dev lo table 100
  iptables -t mangle -N V2RAY_MASK
  iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -j RETURN
  iptables -t mangle -A V2RAY_MASK -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
  iptables -t mangle -A PREROUTING -p udp -j V2RAY_MASK
  ```

6. 使用电脑/手机尝试直接访问被墙网站，这时应该是可以访问的（如果不能，你可能得请教大神手把手指导了）。

7. 写开机自动加载上述的 iptables 的脚本，或者使用第三方软件(如 iptables-persistent)，否则网关重启后 iptables 会失效(即透明代理会失效)。


## 注意事项

* 在上面的设置中，假设访问了国外网站，如 Google 等，网关依然会使用的系统 DNS 进行查询，只不过返回的结果是污染过的，而 V2Ray 提供的 sniffing 能够从流量中提取域名信息交由 VPS 解析。也就是说，每次打算访问被墙的网站，DNS 提供商都知道，鉴于国内企业尿性，也许 GFW 也都知道，会不会将这些数据收集喂 AI 也未可知。
* sniffing 目前只能从 TLS 和 HTTP 流量中提取域名，如果上网流量有非这两种类型的慎用 sniffing 解决 DNS 污染。
* 由于对 iptables 不熟，我总感觉上面对 UDP 流量的透明代理的设置使用上有点问题，知道为什么的朋友请反馈一下。如果你只是简单的上上网看看视频等，可以只代理 TCP 流量，不设 UDP 透明代理。
* 喜欢玩网游的朋友可能要失望了，使用 V2Ray 加速游戏效果不是很好。
* V2Ray 只能代理 TCP/UDP 的流量，ICMP 不支持，即就算透明代理成功了之后 ping Google 这类网站也是不通的。
* 按照网上其他的透明代理教程，设置 iptables 肯定要 RETURN 127.0.0.0/8 这类私有地址，但我个人观点是放到 V2Ray 的路由里好一些。

-------

## 更新历史

* 2017-12-05 初版
* 2017-12-24 修复无法访问国内网站问题
* 2017-12-27 排版
* 2017-12-29 删除不必要的 iptables 规则
* 2018-01-16 优化操作步骤
* 2018-01-21 添加 UDP
* 2018-04-05 Update
* 2018-08-30 设置步骤修正
* 2018-09-14 比较优雅地代理本机流量

