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
点[这里](https://github.com/v2ray/v2ray-core/releases)下载 V2Ray 的 Windows 压缩包，如果是 32 位系统，下载 v2ray-windows-32.zip，如果是 64 位系统，下载 v2ray-windows-64.zip。解压之后会有 v2ray.exe 和 config.json 这两个文件，~~config.json 已经设置好 V2Ray 的官方服务器，也就是说你可以不自己搭建服务器而直接使用 V2Ray 提供的服务器科学上网。这个时候双击运行 v2ray.exe，这个时候可以通过 config.json 设置好的 VPS 科学上网~~(由于早前官方服务器遭受未明攻击，目前已停止提供服务)。
![](/resource/images/v2rayrunnig.png)

但是现在还不能科学上网，因为 V2Ray 将所有选择权交给用户，它不会自动帮你设置系统代理，因此还需要在浏览器里设置代理。以火狐（Firefox）为例，点菜单 -> 选项 -> 高级 -> 设置 -> 手动代理设置，在 SOCKS Host 填上 127.0.0.1，后面的 Port 填 1080，再勾上使用 SOCKS v5 时代理 DNS (这个勾选项在旧的版本里叫做远程 DNS)。操作图见下：

![](/resource/images/firefox_proxy_setting1.png)

![](/resource/images/firefox_proxy_setting2.png)

![](/resource/images/firefox_proxy_setting3.png)

![](/resource/images/firefox_proxy_setting4.png)


## 服务器安装

### 脚本安装

在 Linux 操作系统， V2Ray 的安装有脚本安装、手动安装、编译安装 3 种方式，选择其中一种即可，本指南仅提供使用使用脚本安装的方法，并仅推荐使用脚本安装，该脚本由 V2Ray 官方提供。

V2Ray 官方提供了一个一键安装脚本，这个脚本可以在 Debian 系列或者支持 Systemd 的 Linux 操作系统使用。

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
$ sudo  bash install-release.sh 
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

看到类似于这样的提示就算安装成功了。如果安装不成功脚本会有红色的提示语句，只需按照提示除错再重新执行一遍脚本安装 V2Ray。对于错误提示如果看不懂，使用翻译软件翻译一下就好。


在安装完 V2Ray 之后，修改配置文件重启 V2Ray 即可，配置文件路径为 /etc/v2ray/config.json。

使用以下命令启动 V2Ray:

```
$ sudo systemctl start v2ray
```

停止运行 V2Ray：

```
$ sudo  systemctl stop v2ray
```

重启 V2Ray:

```
$ sudo systemctl restart v2ray
```

在首次安装完成之后， V2Ray 不会自动启动，需要手动运行上述启动命令。而在已经运行 V2Ray 的 VPS 上再次执行安装脚本，安装脚本会自动停止 V2Ray 进程，升级 V2Ray 程序，然后自动运行 V2Ray。在升级过程中，配置文件不会被修改。

对于以上脚本，还有更多用法，在此不多说了，可以执行 `bash install-release.sh -h` 看帮助。

### Docker 安装

Docker 技术是一种新的虚拟化技术,和传统的虚拟化技术不同。v2ray 同样提供 Docker 部署方式,并且通过 Docker 来部署 V2ray 会非常轻松高效。

首先安装 Docker:

```
$ sudo apt-get install -y docker
```

安装完 Docker 后我们从 [DockerHub](https://hub.docker.com/) 通过搜索找到 V2ray 官方提供的镜像, 链接[在此](https://hub.docker.com/r/v2ray/official/)。找到拉取镜像的的命令并复制下来,在网页右侧我们可以看到命令为 `docker pull v2ray/official` ,我们将其复制下来回到命令行中粘贴并执行：

```
$ sudo docker pull v2ray/official
```

待 V2ray 的 Docker 镜像拉去完成后就可以进入下一步部署阶段.在此之前,你需要在 /etc 目录下新建一个文件夹 v2ray, 并把你的配置写好后命令为 config.json 放入 v2ray 文件夹内。待配置文件准备就绪后键入以下命令进行部署,部署前请记下配置文件中你所设置的端口号,在部署时需要将其映射到宿主机上。否则将无法访问。此处假设设定的端口号为8888,需要映射到宿主机的8888端口上。则命令为:

```
$ sudo docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 8888:8888 v2ray/official  v2ray -config=/etc/v2ray/config.json
```

键入以上命令后,命令行会出现一串字符,代表容器部署成功,可以立即通过客户端连接并开始使用了。如果还不放心,键入以下命令来查看容器的运行状态:

```
$ sudo docker container ls
```
如果看到输出的结果中有以下字段代表容器成功运行:

```
$ docker container ls
CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                     NAMES
2a7sdo87kdf3        v2ray/official        "v2ray -config=/et..."   3 minutes ago       Up 3 minutes        0.0.0.0:8888->8888/tcp    v2ray

```
通过以下命令来启动v2ray:

```
$ sudo docker container start v2ray
```
停止v2ray:

```
$ sudo docker container stop v2ray
```
重启v2ray:

```
$ sudo docker container restart v2ray
```
查看日志:
```
$ sudo docker container log  v2ray
```

更新配置后，需要重新部署容器，命令如下：

```
$ sudo docker container stop v2ray
$ sudo docker container rm v2ray
$ sudo docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 8888:8888 v2ray/official  v2ray -config=/etc/v2ray/config.json
```

假如你的配置换了端口号，那么相应的端口映射也要更改，假如你在配置文件中把监听端口改为了9999，则'-p'参数应该这样写：
```
-p  9999:9999
```

假如你想将容器中的端口映射到本机的端口，则命令应该这样写

```
-p 127.0.0.1:端口号:端口号
```

**除非你打算使用Nginx来转发Websocket否则不需要映射到本地，直接填写`端口号:端口号`的形式即可**

另外，如果开启了动态端口，-p 标记可以多次使用来绑定多个端口。具体用法是在指令中再加上多个 -p 标记即可。

更新 V2ray 的 Docker 镜像:
```
$ docker pull v2ray/official
```
更新完之后，你需要重新部署容器，方法见上

------------
## 更新历史

- 2017-08-06 加点提醒

- 2017-08-05 
使用最新的脚本，脚本依然来自于 [V2Ray](https://raw.githubusercontent.com/v2ray/v2ray-core/master/release/install-release.sh) 

