# VMess

VMess 协议是由 V2Ray 原创并使用于 V2Ray 的加密传输协议，如同 Shadowsocks 一样为了对抗墙的[深度包检测](https://zh.wikipedia.org/wiki/%E6%B7%B1%E5%BA%A6%E5%8C%85%E6%A3%80%E6%B5%8B)而研发的。在 V2Ray 上客户端与服务器的通信主要是通过 VMess 协议通信。

本小节给出了 VMess 的配置文件，其实也就是服务器和客户端的基本配置文件，这是最简单的配置了。

V2Ray 使用 inbound 和 outbound 的概念，这个概念非常清晰地体现了数据包的流动方向，同时也使得 V2Ray 功能强大复杂的同时而不混乱，结构清晰明了。简单来说，V2Ray 就是一个盒子，这个盒子有出口和入口，我们将数据包通过某个入口放进这个盒子里，然后这个盒子以某各机制（这个机制其实就是路由，后面会讲到）决定这个数据包走哪个出口并将数据包发出去。建议选看一下 V2Ray 的[工作原理](https://www.v2ray.com/chapter_01/internal.html)。

-------

## 配置前的准备

实际上，根本不用准备什么，只要有一个文本编辑器(text editor)就可以修改配置了。但我还是打算啰嗦一些，因为我发现新手容易犯语法（格式）不正确的错误，这个很正常新手上路对路况总会不是很熟悉；另外一个就是不会使用工具，用了很多年电脑文本编辑还是 Windows 自带的记事本（在我身边有不少敲代码的，平常看某个代码文件很少打开 IDE 或者使用好点的文本编辑器，而是直接用记事本看），用水果刀切菜可以吗？当然可以，建议你亲自体验一下。如果你会用工具，会非常高效的而且装有一些插件可以语法检查，将代码格式化。

文本编辑器有许多，比如说 Sublime Text、VS code、atom、notepad++，上面这些都是跨平台的，具体如何使用请自行 google 吧。这些软件都可以做到高亮显示、折叠、格式化等，建议使用，如果你不想安装软件，网上也有一些在线的 json 编辑器，还自动检查语法。如果你非要用 Windows 的记事本我也无话可说。

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

## 配置

以下给出了 VMess 的配置文件，包含客户端和服务器端，将你的配置替换成下面给出的配置即可正常使用（注意服务器地址须按你的实际情况修改）。修改完配置之后要重启 V2Ray 才能使用新配置生效。

**另外再强调一遍，V2Ray 的认证是基于时间，请确保服务器和客户端的时间准确，误差一分钟内即可**

### 客户端配置

```javascript
{
  "inbound": {
    "port": 1080, // 监听端口
    "protocol": "socks", // 入口协议为 SOCKS 5
    "settings": {
      "auth": "noauth"  // 不认证
    }
  },
  "outbound": {
    "protocol": "vmess", // 出口协议
    "settings": {
      "vnext": [
        {
          "address": "serveraddr.com", // 服务器地址，请修改为你自己的服务器 ip 或域名
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
}
```

在配置当中，有一个 id（在这里的例子是 b831381d-6324-4d53-ad4f-8cda48b30811），作用类似于 Shadowsocks 的密码（password）, VMess 的 id 使用的是 UUID。关于 id 或者 UUID 没必要了解很多，在这里只要清楚以下几点就足够了：
* 相对应的 VMess 传入传出的 id 必须相同（如果你不理解这句话，那么可以简单理解成服务器与客户端的 id 必须相同）
* 由于 id 使用的是 UUID，我们可以使用任何 UUID 生成工具生成 UUID 作为这里的 id。比如 [UUID Generator](https://www.uuidgenerator.net/) 这个网站，只要一打开或者刷新这个网页就可以得到一个 UUID，如下图

![](/resource/images/generate_uuid.png)

### 服务器配置

```javascript
{
  "inbound": {
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
  },
  "outbound": {
    "protocol": "freedom",  // 主传出协议，参见协议列表
    "settings": {}
  }
}
```

## 原理简析

根据上文给出的配置，在这里简单的介绍一下 V2Ray 的工作原理。

### 客户端

请看 inbound，port 为 1080，V2Ray 监听了一个端口 1080，协议是 socks。之前我们已经把浏览器的代理设置好了（SOCKS Host: 127.0.0.1，Port: 1080），假如访问了 google.com，浏览器就会发出一个数据包打包成 socks 协议发送到本机（127.0.0.1指的本机，localhost）的 1080 端口，这个时候数据包就会被 V2Ray 接收到。

再看 outbound，protocol 是 vmess，说明 V2Ray 接收到数据包之后要将数据包打包成 [VMess](https://www.v2ray.com/chapter_03/01_effective.html#vmess-%E5%8D%8F%E8%AE%AE) 协议并且使用预设的 id 加密（这个例子 id 是 b831381d-6324-4d53-ad4f-8cda48b30811），然后发往服务器地址为 serveraddr.com 的 16823 端口。服务器地址 address 可以是域名也可以是 IP，只要正确就可以了。

### 服务器

接着看服务器，服务器配置的 id 是 b831381d-6324-4d53-ad4f-8cda48b30811，所以 V2Ray 服务器接收到客户端发来的数据包时就会尝试用 b831381d-6324-4d53-ad4f-8cda48b30811 解密，如果解密成功再看一下时间对不对，对的话就把数据包发到 outbound 去，outbound.protocol 是 freedom（freedom 的中文意思是自由，在这里姑且将它理解成直连吧），数据包就直接发到 google.com 了。

配置中的 alterId 也是作为认证的，具体请看 [V2Ray 用户手册](https://www.v2ray.com/chapter_03/01_effective.html#alterid)。只要确保服务器和客户端配置文件的 alterId 相同就行了，但要注意 alterId 的值越大会使用 V2Ray 占用更多的内存。根据我的经验，对于一般用户来说，alterId 的值设为 50 到 100 之间应该是比较合适的。

简单来说就是：浏览器打包 ---> V2Ray 客户端接收 -> V2Ray 客户端发出 --->  V2Ray 服务器接收 -> V2Ray 服务器发出 ---> 目标网站

--------

## 注意

为了让浅显地介绍 V2Ray 的工作方式，本节中关于原理简析的描述有一些地方是错误的。但我知识水平又不够，还不知道该怎么改，暂且将错就错。正确的工作原理在用户手册的 [Effective V2Ray](https://www.v2ray.com/chapter_03/01_effective.html) 有详细的说明。


-------

## 排错指引

按照前文的指导操作,成功部署是没有问题的。然而总会有部分读者可能是看漏某些地方，导致虽然安装好了却无法连接。如果出现了这样的问题，可以尝试按下面的步骤一一进行排错。

1. 打开客户端闪退

可能原因：客户端的配置文件上不正确。

修正方法：请仔细检查配置文件并修改正确。

2. 客户端提示 Socks: unknown Socks version: 

可能原因：客户端配置的 inboud 设置成了 socks 而浏览器的代理协议设置为 http。

修正方法：修改配置文件使客户端的 inboud 的 protocol 和浏览器代理设置的协议保持一致。

3. 客户端提示 Proxy|HTTP: failed to read http request > malformed HTTP request "\x05\x01\x00"

可能原因：客户端配置的 inboud 设置成了 https 而浏览器的代理协议设置为 socks4 或者 socks5。

修正方法：修改配置文件使客户端的 inboud 的 protocol 和浏览器代理设置的协议保持一致。

4. 服务器执行 `systemctl status v2ray` 输出提示 Main: failed to read config file...

可能原因：服务器的配置文件不正确。

修正方法：请仔细检查配置文件并修改正确。

5. 执行 `cat /var/log/v2ray/error.log` 或者 `systemctl status v2ray` 出现 rejected  Proxy|VMess|Encoding: invalid user

可能原因：服务器与客户端的系统时间或者 id 不一致或者 alterId 不一致。

修正方法：请校准系统时间或将 id 以及 alterId 修改一致


6. 以上几点都排除之后，请仔细检查：

6.1 浏览器的代理设置中的端口号与客户端的inbound 的port 是否一致

6.2 客户端中的outbound 设置的address与vps 的ip是否一致

6.3 客户端中的outbound 设置的address与服务器的outbound 的 port 是否一致

6.4 VPS 是否开启了防火墙将连接拦截了

6.5 客户端是否安装在如学校、公司之类的场所，如果是，确认这些单位是否有防火墙拦截了连接

对于 6.1 到 6.3，可以通过检查配置确定是否有问题。对于 6.4 和 6.5，你需要与 VPS 提供商和单位网管联系沟通。

7. 如果你仔细检查了以上几点并将问题排除了，结果还是无法通过 V2Ray 上网，那么你可以考虑：
 
 1). 仔细看前方的教程，一不要错漏步一步按照教程来，重新部署 V2Ray。部署过程中时刻注意[部署之前](/prep/start.md)提到的注意点。
 
 2). 直接放弃。


-----
# 更新历史

- 2017-08-08 排错指引补充

- 2017-08-06 添加排错指引
