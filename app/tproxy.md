# 透明代理(TPROXY)

原来出过一篇透明代理的教程，但过了许久，V2Ray 也已经迭代了好多个版本。原来的教程依旧可以正常使用，但随着 V2Ray 的更新，V2Ray 推出了新的透明代理方式--TPROXY，原来的叫 REDIRECT。最近测试了一下 TPROXY ，效果还不错，主观感觉比 REDIRECT 好。并且在本文的透明代理中，DNS 服务将由 V2Ray 提供。

普通家庭大多数是光纤入户接光猫调试解调，一个路由器的 WAN 口接光猫的 LAN 口，要上网的设备（如 PC 、电视盒子、手机）接路由器 LAN 口。本文的透明代理需要一台 Linux 主机接路由器 LAN 口，作为局域网中的网关，为其他接入局域网中的设备提供翻墙功能。这样的方式与我原来的透明代理教程是一样的，都是搭建在一个 Linux 主机上。这样可以透明代理的设备，有的人叫“透明网关”，也有的叫“旁路由”。我觉得这种不是很严肃的场合，叫什么都行，只要不妨碍理解。

很多设备都可以做透明网关，路由器、开发板、个人电脑、虚拟机和 Android 设备等。路由器可能比较特殊点，因为它本身就可以充当网关。上面可能说得太抽象，我就举些实际的，比如说树莓派、香橙派、用 PC 装的 Linux 虚拟机、淘宝的工控机（如j1900）、NAS、电视盒子（如翻车迅N1）、你刚配的牙膏厂或农厂的电脑，这些都没问题。至于到底用什么？这得看需求，我觉得网络 200M 以下搞个高性能的类树莓派的 SBC 就够了，200M 以上就得考虑 X86 主机了（如今甚火的软路由）。当然，到底怎么选择还是得看自己。

本文假设你已经有一个设备（就以树莓派举例），将用来作网关（或说旁路由），并且已经安装好 Linux。关于系统，我更推荐 Debian 或 Debian 衍生版。本文均以 root 权限账户执行命令。并且有一台 PC 以便于操作。

## 设置网关

1. 用网线将树莓派接入路由器 LAN 口，假设分给树莓派的 IP 是 192.168.1.22。
2. 树莓派开启 IP 转发（需要开启 IP 转发才能作为网关）。命令为 `echo net.ipv4.ip_forward=1 >> /etc/sysctl.conf && sysctl -p`。执行后将出现 net.ipv4.ip_forward=1 的提示。
3. 手动配置 PC 的网络，将默认网关指向树莓派的地址即 `192.168.1.22`。此时 PC 应当能正常上网（由于还没设置代理，“正常”是指可以上国内的网站）。

## 树莓派安装配置 V2Ray

1. 安装 V2Ray。可以使用 V2Ray 提供的 go.sh 脚本安装，由于 GFW 会恶化 GitHub，直接运行脚本几乎无法安装，建议先下载V2Ray 的压缩包，然后用安装脚本通过 --local 参数进行安装。
2. 配置 V2Ray。按照前文教程将 V2Ray 配置成客户端形式。然后执行 `curl -so /dev/null -w "%{http_code}" google.com -x socks5://127.0.0.1:1080` 确认 V2Ray 已经可以翻墙(命令中 socks5 指 inbound 协议为 socks，1080 指该 inbound 端口是 1080)。如果执行这个命令出现了 301 或 200 这类数字的话代表可以翻墙，如果长时间没反应或者是 000 的话说明不可以翻墙。

## 配置透明代理

### 为 V2Ray 配置透明代理的入站和 DNS 分流


```javascript
{
  "inbounds": [
    {
      "tag":"transparent",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy" // 透明代理使用 TPROXY 方式
        }
      }
    },
    ...
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vmess", // 代理服务器
      "settings": {
        "vnext": [
          ...
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      },
      "mux": {
        "enabled": mux
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }      
    },
    {
      "tag": "dns-out",
      "protocol": "dns"
    },
    ...
  ],
  "dns": {
    "servers": [
      "8.8.8.8", // 默认使用 Google 的 DNS
      {
        "address": "223.5.5.5", //中国大陆域名使用阿里的 DNS
        "port": 53,
        "domains": [
          "geosite:cn",
          "pool.ntp.org",   // NTP 服务器
          "$myserver.address" // 此处改为你 VPS 的域名
        ]
      }
    ]
  },
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "inboundTag": [
          "transparent"
        ],
        "port": 53,
        "network": "udp",
        "outboundTag": "dns-out" // 劫持 53 端口 UDP 流量，使用V2Ray 的 DNS， 
      },    
      {
        "type": "field",
        "inboundTag": [
          "transparent"
        ],
        "port": 123,
        "network": "udp",
        "outboundTag": "direct" // 直连 1233 端口 UDP 流量（NTP 协议）
      },    
      {
        "type": "field",
        "outboundTag": "direct", // 直连国内 DNS 服务器
        "ip": [
          "114.114.114.114",
          "223.5.5.5",
          "223.6.6.6"
        ]
      },
      {
        "type": "field",
        "outboundTag": "proxy", // 改为你自己 vmess 出站的 tag，国外域名通过代理查 8.8.8.8
        "ip": [
          "8.8.8.8",
          "8.8.4.4",
          "1.1.1.1"
        ]
      },
      {
        "type": "field",
        "outboundTag": "block", // 广告拦截
        "domain": [
          "geosite:category-ads-all"
        ]
      },
      {
        "type": "field",
        "protocol":["bittorrent"], // BT 流量直连
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "outboundTag": "direct", // 直连中国大陆主流网站 ip 和 保留 ip
        "ip": [
          "geoip:private",
          "geoip:cn"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct", // 直连中国大陆主流网站 ip
        "domain": [
          "geosite:cn"
        ]
      },
      ...
    ]
  }
}
```

### 配置透明代理规则

执行下面的命令开启透明代理。由于使用了 TPROXY 方式的透明代理，所以 TCP 流量也是使用 mangle 表。

```
# 以下为代理局域网设备的规则
ip rule add fwmark 1 table 100 
ip route add local 0.0.0.0/0 dev lo table 100

iptables -t mangle -N V2RAY
iptables -t mangle -I V2RAY -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A V2RAY -p udp -j TPROXY --on-port 12345 --on-ip 127.0.0.1 --tproxy-mark 1
iptables -t mangle -A V2RAY -p tcp -j TPROXY --on-port 12345 --on-ip 127.0.0.1 --tproxy-mark 1

iptables -t mangle -A PREROUTING -j V2RAY


# 以下为代理网关本机的规则

iptables -t mangle -N V2RAY_MASK

iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -j RETURN 
iptables -t mangle -A V2RAY_MASK -d 223.5.5.5 -j RETURN    # important, dns for resolve vps domain
iptables -t mangle -A V2RAY_MASK -j RETURN -m mark --mark 0xff    # return the V2Ray traffic, it be marked at 0xff
iptables -t mangle -A V2RAY_MASK -p udp -j MARK --set-mark 1   # udp reroute check
iptables -t mangle -A V2RAY_MASK -p tcp -j MARK --set-mark 1   # tcp reroute check

iptables -t mangle -A OUTPUT -j V2RAY_MASK 
```

执行了以上 IP 和 iptables 命令后，就可以翻墙了。

## 开机运行透明代理规则

### 将 iptables 规则保存到 /etc/iptables/rules.v4
```
mkdir -p /etc/iptables && iptables-save > /etc/iptables/rules.v4
```

### 开机运行设定 IP 路由及加载 iptables 规则

1. 在 /etc/systemd/system/ 目录下创建一个文件 tproxyrule.service，然后添加以下内容并保存。

```
[Unit]
Description=Tproxy rule
After=network.target
Wants=network.target

[Service]

Type=oneshot
ExecStart=/sbin/ip rule add fwmark 1 table 100 ; /sbin/ip route add local 0.0.0.0/0 dev lo table 100 ; /sbin/iptables-restore /etc/iptables/rules.v4

[Install]
WantedBy=multi-user.target
```
2. 执行 `systemctl enable tproxyrule` 使 tproxyrule.service 开机运行。

## 其他

### 解决 too many file to open 问题

1. 修改 /etc/systemd/system/v2ray.service 文件，在 [Service] 下加入 `LimitMEMLOCK=infinity` 和 `LimitNOFILE=1000000`，最终如下。

```
[Unit]
Description=V2Ray Service
After=network.target
Wants=network.target

[Service]
# This service runs as root. You may consider to run it as another user for security concerns.
# By uncommenting the following two lines, this service will run as user v2ray/v2ray.
# More discussion at https://github.com/v2ray/v2ray-core/issues/1011
# User=v2ray
# Group=v2ray
Type=simple
PIDFile=/run/v2ray.pid
ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json
Restart=on-failure
# Don't restart in the case of configuration error
RestartPreventExitStatus=23
LimitMEMLOCK=infinity
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
```
2. 执行 `systemctl daemon-reload && systemctl restart v2ray` 生效。

### 设定网关为静态 IP

请自行探究。

### 设定 DHCP

在路由器上设定 DHCP，将网关地址指向网关设备，在本文的举例中即为树莓派的IP 192.168.1.22；将 DNS 设为不是局域网（如 192.168.x.x）的地址，否则将会因为 iptables 规则导致 DNS 流量没有发给V2Ray。

## 备注

1. TPROXY 与 REDIRECT 是针对 TCP 而言的两种透明代理模式，两者的差异主要在于 TPROXY 可以透明代理 IPV6，而 REDIRECT 不行，本文主要是将透明代理模式改为 TPROXY 并且使用了 V2Ray 的 DNS。但我没有 IPV6 环境，无法进行测试，所以本文只适用于 IPV4。
2. 据我了解，到目前（2019.10）为止，在我所知的具备透明代理功能的翻墙工具中，TCP 透明代理方式可以使用的 TPROXY 的只有 V2Ray。所以你要找其他资料参考的话，基本上都是 REDIRECT 模式的。
3. 如果你用了透明代理，就不要用 V2Ray 开放 53 端口做 DNS 服务器。如果这么做了，DNS 会出问题，这应该是个 BUG。等我整理好之后再反馈到 V2Ray 项目。
4. 本文的透明代理有一个问题：无法代理 SSH 流量。这个问题我头疼了很久，目前还找不到原因。因为这个问题我还特意扒了一个路由器固件，测试是可以代理 SSH 的，但里边的东西太乱我现在还没整明白。
5. 我测试过 NAT 类型，结果是 NAT1，但也看到有反馈说玩游戏依然是 NAT3。这点需要玩游戏的朋友来确认了。不过目前测试发现代理 QUIC 的效果还不不错的。
6. 本文的说明内容还不够完善，后续还要针对配置进行详细说明，大约改 3~5 个版本，然后再提交到新教程上。


## 更新历史

- 2019-10-19 初版 
