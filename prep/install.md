# 安装

本节将说明如何安装 V2Ray，内容包含服务器安装和客户端安装。需要注意的是，与 Shadowsocks 不同，从软件上 V2Ray 不区分服务器版和客户端版，也就是说在服务器和客户端运行的 V2Ray 是同一个软件，区别只是配置文件的不同。因此 V2Ray 的安装在服务器和客户端上是一样的，但是通常情况下 VPS 使用的是 Linux 而 PC 使用的是 Windows，因此本章默认服务器为 Linux VPS，客户端为 Windows PC。如果你的 PC 使用的是 Linux 操作系统，那么请参考本文的服务器安装；VPS 使用的是 Windows，参考本文的客户端安装；如果你使用的是 MacOS ，请你自行研究怎么安装吧，安装完了跳过本节继续往下看。

本文中会有不少的命令以 sudo 开头，代表着以管理员权限运行，如果你是用 root 账户执行文中的命令，就不用打 sudo。

-----

## 时间校准

对于 V2Ray，它的验证方式包含时间，就算是配置没有任何问题，如果时间不正确，也无法连接 V2Ray 服务器的，服务器会认为你这是不合法的请求。所以系统时间一定要正确，只要保证时间误差在**90秒**之内就没问题。

对于 VPS(Linux) 可以执行命令 `date -R` 查看时间：
```
$ date -R
Sun, 22 Jan 2017 10:10:36 -0500
```
输出结果中的 -0500 代表的是时区为西 5 区，如果转换成东 8 区时间则为 `2017-01-22 23:10:36`。

如果时间不准确，可以使用 `date --set` 修改时间：

```
$ sudo date --set="2017-01-22 16:16:23"
Sun 22 Jan 16:16:23 GMT 2017
```
如果你的服务器架构是 OpenVZ，那么使用上面的命令有可能修改不了时间，直接发工单联系 VPS 提供商的客服吧，就说你在 VPS 上运行的服务对时间有要求，要他们提供可行的修改系统时间的方法。

对 VPS 的时间校准之后接着是个人电脑，如何修改电脑上的时间我想不必我多说了。

无论是 VPS 还是个人电脑，时区是什么无所谓，因为 V2Ray 会自动转换时区，但是时间一定要准确。

-----

## 服务器安装

### 脚本安装

在 Linux 操作系统， V2Ray 的安装有脚本安装、手动安装、编译安装 3 种方式，选择其中一种即可，本指南仅提供使用使用脚本安装的方法，并仅推荐使用脚本安装，该脚本由 V2Ray 官方提供。该脚本仅可以在 Debian 系列或者支持 Systemd 的 Linux 操作系统使用。

**除非你是大佬，或者能够自行处理类似 command not found 的问题，否则请你使用 Debian 8.x 以上或者 Ubuntu 16.04 以上的 Linux 系统。**
本指南默认使用 Debian 8.7 系统作为示范。

首先下载脚本：

```
$ wget https://install.direct/go.sh
--2018-03-17 22:49:09--  https://install.direct/go.sh
Resolving install.direct (install.direct)... 104.27.174.71, 104.27.175.71, 2400:cb00:2048:1::681b:af47, ...
Connecting to install.direct (install.direct)|104.27.174.71|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/plain]
Saving to: ‘go.sh’

go.sh                             [ <=>                                                 ]  11.24K  --.-KB/s    in 0.001s  

2018-03-17 22:49:09 (17.2 MB/s) - ‘go.sh’ saved [11510]
```

然后执行脚本安装 V2Ray:

```
$ sudo bash go.sh
Installing curl
Updating software repo
Installing curl
Selecting previously unselected package curl.
(Reading database ... 36028 files and directories currently installed.)
Preparing to unpack .../curl_7.38.0-4+deb8u5_amd64.deb ...
Unpacking curl (7.38.0-4+deb8u5) ...
Processing triggers for man-db (2.7.0.2-5) ...
Setting up curl (7.38.0-4+deb8u5) ...
Installing V2Ray v2.33 on x86_64
Donwloading V2Ray.
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   608    0   608    0     0   2403      0 --:--:-- --:--:-- --:--:--  2412
100 2583k  100 2583k    0     0  1229k      0  0:00:02  0:00:02 --:--:-- 1847k
Installing unzip
Installing unzip
Selecting previously unselected package unzip.
(Reading database ... 36035 files and directories currently installed.)
Preparing to unpack .../unzip_6.0-16+deb8u3_amd64.deb ...
Unpacking unzip (6.0-16+deb8u3) ...
Processing triggers for mime-support (3.58) ...
Processing triggers for man-db (2.7.0.2-5) ...
Setting up unzip (6.0-16+deb8u3) ...
Extracting V2Ray package to /tmp/v2ray.
Archive:  /tmp/v2ray/v2ray.zip
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/readme.md  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/systemd/v2ray.service  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/systemv/v2ray  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/v2ray  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/vpoint_socks_vmess.json  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/vpoint_vmess_freedom.json  
PORT:40827
UUID:505f001d-4aa8-4519-9c54-6b65749ee3fb
Created symlink from /etc/systemd/system/multi-user.target.wants/v2ray.service to /lib/systemd/system/v2ray.service.
V2Ray v2.33 is installed.
```

看到类似于这样的提示就算安装成功了。如果安装不成功脚本会有红色的提示语句，这个时候你应当按照提示除错，除错后再重新执行一遍脚本安装 V2Ray。对于错误提示如果看不懂，使用翻译软件翻译一下就好。

在上面的提示中，有一行 "PORT:40827" 代表着端口号为 40827，还有一行 "UUID:505f001d-4aa8-4519-9c54-6b65749ee3fb" 代表着 id 为 505f001d-4aa8-4519-9c54-6b65749ee3fb。这两个都是随机生成的，不用担心跟别人撞上了。

安装完之后，使用以下命令启动 V2Ray:

```
$ sudo systemctl start v2ray
```

在首次安装完成之后，V2Ray 不会自动启动，需要手动运行上述启动命令。而在已经运行 V2Ray 的 VPS 上再次执行安装脚本，安装脚本会自动停止 V2Ray 进程，升级 V2Ray 程序，然后自动运行 V2Ray。在升级过程中，配置文件不会被修改。

对于安装脚本，还有更多用法，在此不多说了，可以执行 `bash go.sh -h` 看帮助。

### 升级更新

在 VPS，重新执行一遍安装脚本就可以更新了，在更新过程中会自动重启 V2Ray，配置文件保持不变。

```
$ sudo bash go.sh
```

V2Ray 的更新策略是快速迭代，每周更新(无意外的情况下)。版本号的格式是 `vX.Y.Z`，如 `v2.44.0`。v是固定的字母v，version 的首字母；X、Y、Z都是数字，X是大版本号，每年更新一个大版本(现在是 v4.Y.Z，V2Ray 已经走到了第四个年头)，Y 是小版本，每周五更新一个小版本。Z是区分正式版和测试版，Z是0代表着是正式版，不是0说明是测试版。例如，v4.7.0 是正式版，v4.7.1是测试版，建议只使用正式版，不手动指定的情况下V2Ray 的安装脚本也只会安装最新的正式版。

有些细心的朋友可能会注意到有时候周五 V2Ray 刚发布了一个新版本，次日或过两日又更新一个正式版。出现这种情况是因为周五发布的正式版出现了影响使用严重的 BUG，需要立马发布一个新版本。这种情况比较烦，但是为了保证兼容性、性能优化等又需要保证版本不要太老旧。所以我比较建议在周四更新，选这么一个日子是因为有重大的 BUG 肯定在前面几天就已经修复了，小问题(恐怕都不知道有)的话不会影响使用；而且版本号与最新版相比迟那么一两个也没什么关系。

## 客户端安装
点[这里](https://github.com/v2ray/v2ray-core/releases)下载 V2Ray 的 Windows 压缩包，如果是 32 位系统，下载 v2ray-windows-32.zip，如果是 64 位系统，下载 v2ray-windows-64.zip（下载速度慢或无法下载请考虑挂已有的翻墙软件来下载）。下载并且解压之后会有下面这些文件：
* `v2ray.exe` 运行 V2Ray 的程序文件
* `wv2ray.exe` 同 v2ray.exe，区别在于wv2ray.exe是后台运行的，不像 v2ray.exe 会有类似于 cmd 控制台的窗口。运行 V2Ray 时从 v2ray.exe 和 wv2ray.exe 中任选一个即可
* `config.json` V2Ray 的配置文件，后面我们对 V2Ray 进行配置其实就是修改这个文件
* `v2ctl.exe` V2Ray 的工具，有多种功能，除特殊用途外，一般由 v2ray.exe 来调用，用户不用太关心
* `geosite.dat` 用于路由的域名文件
* `geoip.dat` 用于路由的 IP 文件
* `其它` 除上面的提到文件外，其他的不是运行 V2Ray 的必要文件。更详细的说明可以看 doc 文件夹下的 readme.md 文件，可以通过记事本或其它的文本编辑器打开查看

实际上双击 v2ray.exe （或wv2ray.exe） 就可以运行 V2Ray 了，V2Ray 会读取 config.json 中的配置与服务器连接。~~默认的配置文件包含 V2Ray 官方服务器的配置，也就是说你可以不自己搭建服务器而直接使用 V2Ray 提供的服务器科学上网。在不修改 config.json 的情况下，双击运行 v2ray.exe，可以直接科学上网~~（V2Ray 官方服务器已下线）。
![](/resource/images/v2rayrunnig.png)

V2Ray 将所有选择权交给用户，它不会自动设置系统代理，因此还需要在浏览器里设置代理。以火狐（Firefox）为例，点菜单 -> 选项 -> 高级 -> 设置 -> 手动代理设置，在 SOCKS Host 填上 127.0.0.1，后面的 Port 填 1080，再勾上使用 SOCKS v5 时代理 DNS (这个勾选项在旧的版本里叫做远程 DNS)。操作图见下：

![](/resource/images/firefox_proxy_setting1.png)

![](/resource/images/firefox_proxy_setting2.png)

![](/resource/images/firefox_proxy_setting3.png)

![](/resource/images/firefox_proxy_setting4.png)

如果使用的是其它的浏览器，请自行在网上搜一下怎么设置 SOCKS 代理。


------------
## 更新历史

- 2017-08-06 加点提醒
- 2017-08-05 使用最新的脚本，脚本依然来自于 [V2Ray](https://raw.githubusercontent.com/v2ray/v2ray-core/master/release/install-release.sh)
- 2017-10-07 V2Ray 官方服务器已经恢复
- 2017-12-22 移除官方服务器
- 2017-12-29 加入 IPFS
- 2018-04-05 Update
- 2018-11-11 Update
- 2019-01-19 Update
