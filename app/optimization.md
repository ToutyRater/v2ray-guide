# 内存优化

为了更好能够提供更好的性能，V2Ray 有一个缓存机制，在上下游网络速率有差异时会缓存一部分数据。举个实际的例子，假如你在下载小姐姐，网站到你的 VPS 的速度有 500 Mbps，而 VPS 到家里宽带只有 50 Mbps，V2Ray 在 VPS 会以比较高的速率把小姐姐先下好再慢慢传到电脑里。默认情况下 V2Ray 对每个连接的缓存大小是 10 MBytes，也就是说如果下载小姐姐开了 32 线程，那么 V2Ray 最高会缓存 320 MBytes 的数据。这样一来那些内存只有 256 MBytes 甚至是 128 MBytes 的 VPS 压力就会比较大。所幸的是缓存的大小我们是可以修改的，减小缓存的大小可以降低对内存的占用，会对小内存机器比较友好。

## 修改缓存

VPS 中打开 /etc/systemd/system/v2ray.service 文件，将 `ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json` 修改成 `ExecStart=/usr/bin/env v2ray.ray.buffer.size=1 /usr/bin/v2ray/v2ray -config /etc/v2ray/config.json`，保存；然后执行下面的命令生效。
```
$ sudo systemctl daemon-reload && sudo systemctl restart v2ray.service
```
上面的 v2ray.ray.buffer.size 就是缓存的变量，设为 1 也没多大影响（主观感觉，没实际测试对比过），内存不太够用的朋友可以试一下。

## 更新历史

- 2018-05-01 初版
