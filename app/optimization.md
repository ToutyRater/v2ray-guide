# 内存优化

为了更好能够提供更好的性能，V2Ray 有一个缓存机制，在上下游网络速率有差异时会缓存一部分数据。举个实际的例子，假如你在下载小姐姐，网站到你的 VPS 的速度有 500 Mbps，而 VPS 到家里宽带只有 50 Mbps，V2Ray 在 VPS 会以比较高的速率把小姐姐先下好再慢慢传到电脑里。默认情况下 V2Ray 对每个连接的缓存大小是 10 MBytes （现在默认缓存最大为 512 KBytes），也就是说如果下载小姐姐开了 32 线程，那么 V2Ray 最高会缓存 320 MBytes 的数据。这样一来那些内存只有 256 MBytes 甚至是 128 MBytes 的 VPS 压力就会比较大。所幸的是缓存的大小我们是可以修改的，减小缓存的大小可以降低对内存的占用，会对小内存机器比较友好。

## 修改缓存

### 利用环境变量修改

(**注：经过多个版本的迭代优化，V2Ray 的内存占用已经大幅度减少，默认的缓存大小最大也只有 512 KBytes，通过环境变量修改缓存参数已经不适用**)

VPS 中编辑 /etc/systemd/system/v2ray.service 文件，将 `ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json` 修改成 `ExecStart=/usr/bin/env v2ray.ray.buffer.size=1 /usr/bin/v2ray/v2ray -config /etc/v2ray/config.json`，保存；然后执行下面的命令生效。
```
$ sudo systemctl daemon-reload && sudo systemctl restart v2ray.service
```
上面的 v2ray.ray.buffer.size 就是缓存的变量，设为 1 也没多大影响（主观感觉，没实际测试对比过），内存不太够用的朋友可以试一下。

### 在配置文件中修改

在上面的通过环境变量修改缓存大小中，有一个问题是 v2ray.ray.buffer.size 的单位是 Mbytes，最小只能改成 1 Mbytes，如果改成 0 的话就意味着缓存无限制。不过在配置文件中也可以修改缓存大小，单位是 Kbytes，在配置中设成 0 的话表示禁用缓存，需要将缓存设得更小的朋友可以参考 V2Ray 官方文档的本地策略一节，配置比较简单，这里就不详述了。

## 更新历史

- 2018-05-01 初版
- 2018-08-02 添加配置文件修改缓存
- 2018-11-11 v2ray.ray.buffer.size 废弃
