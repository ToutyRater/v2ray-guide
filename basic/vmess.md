# VMess

VMess 协议是由 V2Ray 原创并使用于 V2Ray 的加密传输协议，如同 Shadowsocks 一样为了对抗墙的[深度包检测](https://zh.wikipedia.org/wiki/%E6%B7%B1%E5%BA%A6%E5%8C%85%E6%A3%80%E6%B5%8B)而研发的。在 V2Ray 上客户端与服务器的通信主要是通过 VMess 协议通信。

本小节给出了 VMess 的配置文件，其实也就是服务器和客户端的基本配置文件，这是 V2Ray 能够运行的最简单的配置。

V2Ray 使用 inbound(传入) 和 outbound(传出) 的结构，这样的结构非常清晰地体现了数据包的流动方向，同时也使得 V2Ray 功能强大复杂的同时而不混乱，清晰明了。形象地说，我们可以把 V2Ray 当作一个盒子，这个盒子有入口和出口(即 inbound 和 outbound)，我们将数据包通过某个入口放进这个盒子里，然后这个盒子以某种机制（这个机制其实就是路由，后面会讲到）决定这个数据包从哪个出口吐出来。以这样的角度理解的话，V2Ray 做客户端，则 inbound 接收来自浏览器数据，由 outbound 发出去(通常是发到 V2Ray 服务器)；V2Ray 做服务器，则 inbound 接收来自 V2Ray 客户端的数据，由 outbound 发出去(通常是如 Google 等想要访问的目标网站)。

-------

## 配置前的准备

实际上，根本不用准备什么，只要有一个文本编辑器(text editor)就可以修改配置了。但我还是打算啰嗦一些，因为我发现新手容易犯语法（格式）不正确的错误，这个很正常新手上路对路况总会不是很熟悉；另外一个就是不会使用工具，用了很多年电脑文本编辑还是 Windows 自带的记事本（在我身边有不少敲代码的，平常看某个代码文件很少打开 IDE 或者使用好点的文本编辑器，而是直接用记事本看），用水果刀切菜可以吗？当然可以，建议你亲自体验一下。如果你会用工具，会非常高效的而且装有一些插件可以语法检查，将代码格式化。

文本编辑器有许多，比如说 Sublime Text、VS code、atom、notepad++，上面这些都是跨平台的，具体如何使用请自行 Google 吧。这些软件都可以做到高亮显示、折叠、格式化等，建议使用，如果你不想安装软件，网上也有一些在线的 json 编辑器，还自动检查语法。如果你非要用 Windows 的记事本我也无话可说。

下面是一张 Windows 自带的记事本对比 Sublime Text 查看同一个 json 文件的图片，孰优孰劣大家心中自有判断。
![](/resource/images/notepad_vs_ST.png)

又比如格式化功能：
![](/resource/images/formatdemo.gif)

对于 Linux 有一个软件叫 jq，可以执行这样的指令检查配置文件的语法是否正确：
```
$ jq . config.json
```
这里的 config.json 是当前目录下的 config.json。特别注意命令中的点 . 不能省去。

![](/resource/images/jqdemo.png)
当我把 "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297" 后的逗号 , 删去时：

![](/resource/images/jqerror.png)

（从 v2.11 起新增了一个注释功能，配置文件允许 `//` 和 `/**/` 注释。但是 JSON 的标准格式的没有注释的，也就是说如果你给配置文件加了注释，再使用上文我说的格式化功能会报错说你的 JSON 语法（格式）不对。）

不过，最好还是使用 V2Ray 提供的配置检查功能（test 选项），因为可以检查 JSON 语法错误外的问题，比如说突然间手抖把 vmess 写成了 vmss，一下子就检查出来了。
```
$ /usr/bin/v2ray/v2ray -test -config /etc/v2ray/config.json
failed to parse json config: Ext|Tools|Conf|Serial: failed to parse json config > Ext|Tools|Conf: failed to load inbound detour config. > Ext|Tools|Conf: unknown config id: vmss
Main: failed to read config file: /etc/v2ray/config.json > Main|Json: failed to execute v2ctl to convert config file. > exit status 255
```

如果是配置文件没问题，则是这样的：

```
$ /usr/bin/v2ray/v2ray -test -config /etc/v2ray/config.json
V2Ray v3.15 (die Commanderin) 20180329
An unified platform for anti-censorship.
Configuration OK.
```

## 配置

以下给出了 VMess 的配置文件，包含客户端和服务器端，将你的配置替换成下面给出的配置，然后将服务器地址修改成你的就可以正常使用。修改完配置之后要重启 V2Ray 才能使用新配置生效。

**VMess 协议的认证基于时间，一定要保证服务器和客户端的系统时间相差要在90秒以内。**

### 客户端配置

以下是客户端配置，将客户端的 config.json 文件修改成下面的内容，修改完成后要重启 V2Ray 才会使修改的配置生效。
```javascript
{
  "inbounds": [
    {
      "port": 1080, // 监听端口
      "protocol": "socks", // 入口协议为 SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  //socks的认证设置，noauth 代表不认证，由于 socks 通常在客户端使用，所以这里不认证
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess", // 出口协议
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // 服务器地址，请修改为你自己的服务器 IP 或域名
            "port": 16823,  // 服务器端口
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // 用户 ID，必须与服务器端配置相同
                "alterId": 64 // 此处的值也应当与服务器相同
              }
            ]
          }
        ]
      }
    }
  ]
}
```

在配置当中，有一个 id (在这里的例子是 b831381d-6324-4d53-ad4f-8cda48b30811)，作用类似于 Shadowsocks 的密码(password), VMess 的 id 的格式必须与 UUID 格式相同。关于 id 或者 UUID 没必要了解很多，在这里只要清楚以下几点就足够了：
* 相对应的 VMess 传入传出的 id 必须相同（如果你不是很明白这句话，那么可以简单理解成服务器与客户端的 id 必须相同）
* 由于 id 使用的是 UUID 的格式，我们可以使用任何 UUID 生成工具生成 UUID 作为这里的 id。比如 [UUID Generator](https://www.uuidgenerator.net/) 这个网站，只要一打开或者刷新这个网页就可以得到一个 UUID，如下图。或者可以在 Linux 使用命令 `cat /proc/sys/kernel/random/uuid` 生成。

![](/resource/images/generate_uuid.png)

### 服务器配置

以下是服务器配置，将服务器 /etc/v2ray 目录下的 config.json 文件修改成下面的内容，修改完成后要重启 V2Ray 才会使修改的配置生效。
```javascript
{
  "inbounds": [
    {
      "port": 16823, // 服务器监听端口
      "protocol": "vmess",    // 主传入协议
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // 用户 ID，客户端与服务器必须相同
            "alterId": 64
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",  // 主传出协议
      "settings": {}
    }
  ]
}
```

## 原理简析

根据上文给出的配置，在这里简单的介绍一下 V2Ray 的工作原理。

无论是客户端还是服务器，配置文件都由两部分内容组成： `inbounds` 和 `outbounds`。V2Ray 没有使用常规代理软件的 C/S（即客户端/服务器）结构，它既可以当做服务器也可以作为客户端。于是我们可以从另一个角度来理解，认为每一个 V2Ray 都是一个节点，`inbound` 是关于如何与上一个节点连接的配置，`outbound` 是关于如何与下一个节点连接的配置。对于第一个节点，`inbound` 与浏览器连接；对于最后一个节点，`outbound`与目标网站连接。`inbounds` 和 `outbounds` 是 `inbound` 和 `outbound` 的集合，意味着每一个 V2Ray 节点都可以有多个入口和出口。本例当中的入口和出口都只有一个，这是为了便于说明和理解。

### 客户端

客户端配置中的 inbounds，port 为 1080，即 V2Ray 监听了一个端口 1080，协议是 socks。之前我们已经把浏览器的代理设置好了（SOCKS Host: 127.0.0.1，Port: 1080），假如访问了 google.com，浏览器就会发出一个数据包打包成 socks 协议发送到本机（127.0.0.1指的本机，localhost）的 1080 端口，这个时候数据包就会被 V2Ray 接收到。

再看 outbounds，protocol 是 vmess，说明 V2Ray 接收到数据包之后要将数据包打包成 [VMess](https://www.v2ray.com/chapter_03/01_effective.html#vmess-%E5%8D%8F%E8%AE%AE) 协议并且使用预设的 id 加密（这个例子 id 是 b831381d-6324-4d53-ad4f-8cda48b30811），然后发往服务器地址为 serveraddr.com 的 16823 端口。服务器地址 address 可以是域名也可以是 IP，只要正确就可以了。


在客户端配置的 inbounds 中，有一个 `"sniffing"` 字段，V2Ray 手册解释为“流量探测，根据指定的流量类型，重置所请求的目标”，这话不太好理解，简单说这东西就是从网络流量中识别出域名。这个 sniffing 有两个用处：

1. 解决 DNS 污染；
2. 对于 IP 流量可以应用后文提到的域名路由规则；
3. 识别 BT 协议，根据自己的需要拦截或者直连 BT 流量(后文有一节专门提及)。

如果这段话不懂，没关系，照着写吧。

### 服务器

接着看服务器，服务器配置的 id 是 b831381d-6324-4d53-ad4f-8cda48b30811，所以 V2Ray 服务器接收到客户端发来的数据包时就会尝试用 b831381d-6324-4d53-ad4f-8cda48b30811 解密，如果解密成功再看一下时间对不对，对的话就把数据包发到 outbound 去，outbound.protocol 是 freedom（freedom 的中文意思是自由，在这里姑且将它理解成直连吧），数据包就直接发到 google.com 了。

实际上数据包的流向就是：
```
{浏览器} <--(socks)--> {V2Ray 客户端 inbound <-> V2Ray 客户端 outbound} <--(VMess)-->  {V2Ray 服务器 inbound <-> V2Ray 服务器 outbound} <--(Freedom)--> {目标网站}
```

配置中还有一个 alterId 参数，这个参数主要是为了加强防探测能力。理论上 alterId 越大越好，但越大就约占内存(只针对服务器，客户端不占内存)，所以折中之下设一个中间值才是最好的。那么设多大才是最好的？其实这个是分场景的，我没有严格测试过这个，不过根据经验，alterId 的值设为 30 到 100 之间应该是比较合适的。alterId 的大小要保证客户端的小于等于服务器的。

有人疑惑请求发出去后数据怎么回来，毕竟大多数的场景是下载。这个其实不算是问题，既然请求通过 V2Ray 发出去了，响应数据也会通过 V2Ray 原路返回（也许会有朋友看到这话会马上反驳说不一定是原路返回的，有这种想法的估计是非常了解 TCP/IP 协议的，何必较这个劲，这是底层的东西，又掌控在运营商手里，从应用层理解原路返回又有何不可）。

--------

## 注意事项

- 为了让浅显地介绍 V2Ray 的工作方式，本节中关于原理简析的描述有一些地方是错误的。但我知识水平又不够，还不知道该怎么改，暂且将错就错。正确的工作原理在用户手册的 [VMess 协议](https://www.v2ray.com/developer/protocols/vmess.html) 有详细的说明。
- id 为 UUID 格式，请使用软件生成，不要尝试自己造一个，否则很大程度上造出一个错误的格式来。
- VMess 协议可以设定加密方式，但 VMess 不同的加密方式对于过墙没有明显差别，本节没有给出相关配置方式（因为这不重要，默认情况下 VMess 会自己选择一种比较合适的加密方式），具体配置可见 [V2Ray 手册](https://v2ray.com/chapter_02/protocols/vmess.html)，不同加密方式的性能可参考[性能测试](/app/benchmark.md)。

-------

## 排错指引

按照前文的指导操作，通常都能成功部署 V2Ray。然而总会有部分读者可能是看漏某些地方，导致虽然安装好了却无法连接。如果出现了这样的问题，可以尝试按下面的步骤一一进行排错。

### 打开客户端闪退

可能原因：客户端的配置文件上不正确。

修正方法：请仔细检查配置文件并修改正确。

### 客户端提示 Socks: unknown Socks version:

可能原因：客户端配置的 inboud 设置成了 socks 而浏览器的代理协议设置为 http。

修正方法：修改配置文件使客户端的 inboud 的 protocol 和浏览器代理设置的协议保持一致。

### 客户端提示 Proxy|HTTP: failed to read http request > malformed HTTP request "\x05\x01\x00"

可能原因：客户端配置的 inboud 设置成了 https 而浏览器的代理协议设置为 socks4 或者 socks5。

修正方法：修改配置文件使客户端的 inboud 的 protocol 和浏览器代理设置的协议保持一致。

### 服务器执行 `systemctl status v2ray` 输出提示 Main: failed to read config file...

可能原因：服务器的配置文件不正确。

修正方法：请仔细检查配置文件并修改正确。

### 执行 `cat /var/log/v2ray/error.log` 或者 `systemctl status v2ray` 出现 rejected  Proxy|VMess|Encoding: invalid user

可能原因：服务器与客户端的系统时间或者 id 不一致或者 alterId 不一致。

修正方法：请校准系统时间或将 id 以及 alterId 修改一致。


### 以上几点都排除之后，请仔细检查：

1). 浏览器的代理设置中的端口号与客户端的 inbound 的 port 是否一致；

2). 客户端中的 outbound 设置的 address 与 vps 的ip是否一致；

3). 客户端中的 outbound 设置的address 与服务器的 inbound 的 port 是否一致；

4). VPS 是否开启了防火墙将连接拦截了；

5). 客户端是否安装在如学校、公司之类的场所，如果是，确认这些单位是否有防火墙拦截了连接；

对于 1) 到 3)，可以通过检查配置确定是否有问题。对于 4) 和 5)，你需要与 VPS 提供商和单位网管联系沟通。

### 如果你仔细检查了以上几点并将问题排除了，结果还是无法通过 V2Ray 上网，那么你可以考虑：

 1). 仔细看前方的教程，逐步按照教程来不要错在漏，重新部署 V2Ray。部署过程中时刻注意[部署之前](/prep/start.md)提到的注意点；

 2). 直接放弃；
 
 3). 向大婶请教。


-----
## 更新历史

- 2017-08-08 排错指引补充
- 2017-08-06 添加排错指引
- 2018-02-09 补充说明
- 2018-04-05 内容补充
- 2018-09-03 更进一些 V2Ray 的变化，并修改一些描述
- 2018-11-09 跟进新 v4.0+ 的配置格式
- 2018-02-01 domainOverride 改为 sniffing
- 2019-10-27 sniffing 不再影响 tor 的使用
