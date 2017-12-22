# 安装

本节将说明如何安装 V2Ray，内容包含服务器安装和客户端安装。需要注意的是，与 Shadowsocks 不同，V2Ray 不区分服务器版和客户端版，也就是说在服务器和客户端运行的 V2Ray 是同一个软件，区别只是配置文件的不同。因此 V2Ray 的安装在服务器和客户端上是一样的，但是通常情况下 VPS 使用的是 Linux 而 PC 使用的是 Windows，因此本章默认服务器为 Linux VPS，客户端为 Windows PC。如果你的 PC 使用的是 Linux 操作系统，那么请参考服务器安装。如果你的 PC 使用的是 MacOS 或者 VPS 使用的是 Windows，这两者请你自行研究怎么安装吧，安装完了跳过本节继续往下看。

-----

## 时间校准

对于 V2Ray，它的验证方式包含时间，就算是配置没有任何问题，如果时间不正确，也无法连接 V2Ray 服务器的，服务器会认为你这是不合法的请求。所以系统时间一定要正确，只要保证时间误差在**一分钟**之内就没问题。

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
如果使用上面的命令却修改不了时间，你就要联系 VPS 提供商的客服了，要求他们提供可行的修改系统时间的方法，因为这多半是他们的锅。

对 VPS 的时间校准之后接着是个人电脑，如何修改电脑上的时间我想不必我多说了。

无论是 VPS 还是个人电脑，时区是什么无所谓，因为 V2Ray 会自动转换时区，但是时间一定要准确。

-----

## 客户端安装
点[这里](https://github.com/v2ray/v2ray-core/releases)下载 V2Ray 的 Windows 压缩包，如果是 32 位系统，下载 v2ray-windows-32.zip，如果是 64 位系统，下载 v2ray-windows-64.zip。解压之后会有 v2ray.exe 和 config.json 这两个文件，config.json 包含 V2Ray 官方服务器的配置，也就是说你可以不自己搭建服务器而直接使用 V2Ray 提供的服务器科学上网。~~在不修改 config.json 的情况下，双击运行 v2ray.exe，可以直接科学上网~~（V2Ray 官方服务器以下线）。除以上两个文件外压缩包还有其它文件，文件 readme.md 是这些文件的说明，你可以通过记事本或其它的文本编辑器打开查看。本指南不再详述。

![](/resource/images/v2rayrunnig.png)

但是现在实际上还不能科学上网，因为 V2Ray 将所有选择权交给用户，它不会自动帮你设置系统代理，因此还需要在浏览器里设置代理。以火狐（Firefox）为例，点菜单 -> 选项 -> 高级 -> 设置 -> 手动代理设置，在 SOCKS Host 填上 127.0.0.1，后面的 Port 填 1080，再勾上使用 SOCKS v5 时代理 DNS (这个勾选项在旧的版本里叫做远程 DNS)。操作图见下：

![](/resource/images/firefox_proxy_setting1.png)

![](/resource/images/firefox_proxy_setting2.png)

![](/resource/images/firefox_proxy_setting3.png)

![](/resource/images/firefox_proxy_setting4.png)

如果使用的是其它的浏览器，请自行在网上搜一下怎么设置 SOCKS 代理。
## 服务器安装

### 脚本安装

在 Linux 操作系统， V2Ray 的安装有脚本安装、手动安装、编译安装 3 种方式，选择其中一种即可，本指南仅提供使用使用脚本安装的方法，并仅推荐使用脚本安装，该脚本由 V2Ray 官方提供。该脚本可以在 Debian 系列或者支持 Systemd 的 Linux 操作系统使用。


**除非你是大佬，或者能够自行处理类似 command not found 的问题，否则请你使用 Debian 8.x 以上或者 Ubuntu 16.04 以上的 Linux 系统。**
本指南默认使用 Debian 8.7 系统作为示范。

首先下载脚本：

```
$ wget https://toutyrater.github.io/install-release.sh
--2017-08-04 23:23:10--  https://toutyrater.github.io/install-release.sh
Resolving toutyrater.github.io (toutyrater.github.io)... 151.101.129.147, 151.101.1.147, 151.101.193.147, ...
Connecting to toutyrater.github.io (toutyrater.github.io)|151.101.129.147|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 9960 (9.7K) [application/x-sh]
Saving to: ‘install-release.sh’

install-release.sh                  100%[====================================================================>]   9.73K  --.-KB/s   in 0s     

2017-08-04 23:23:10 (53.5 MB/s) - ‘install-release.sh’ saved [9960/9960]
```

然后执行脚本安装 V2Ray:

```
$ sudo bash install-release.sh 
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


在安装完 V2Ray 之后，修改配置文件重启 V2Ray 即可，配置文件路径为 /etc/v2ray/config.json。

使用以下命令启动 V2Ray:

```
$ sudo systemctl start v2ray
```

停止运行 V2Ray：

```
$ sudo systemctl stop v2ray
```

重启 V2Ray:

```
$ sudo systemctl restart v2ray
```

在首次安装完成之后，V2Ray 不会自动启动，需要手动运行上述启动命令。而在已经运行 V2Ray 的 VPS 上再次执行安装脚本，安装脚本会自动停止 V2Ray 进程，升级 V2Ray 程序，然后自动运行 V2Ray。在升级过程中，配置文件不会被修改。

更新 V2Ray 的方法是**再次执行安装脚本！再次执行安装脚本！再次执行安装脚本！**

对于安装脚本，还有更多用法，在此不多说了，可以执行 `bash install-release.sh -h` 看帮助。

------------
## 更新历史

- 2017-08-06 加点提醒

- 2017-08-05 使用最新的脚本，脚本依然来自于 [V2Ray](https://raw.githubusercontent.com/v2ray/v2ray-core/master/release/install-release.sh) 

- 2017-10-07 V2ray 官方服务器已经恢复

- 2017-12-22 移除官方服务器

