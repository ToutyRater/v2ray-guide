# 内置 DNS 

## 简介

仔细看过 V2Ray 手册的朋友应该都知道 V2Ray 内置有一个 DNS 的功能。这一节就来简单介绍一下 V2Ray 这个 DNS 是怎么回事。
这个 DNS 可以总结为：
1. 只为 V2Ray 内部的 routing 和 freedom 服务;
2. 只有当 routings 的 domainStrategy 设置成 IPIfNonMatch 或 freedom 的 domainStrategy 设置成 useIP 才会工作;
3. 客户端的 DNS 配置不影响服务器的解析;

其实就这么简单。再说多点就是只有你的 domainStrategy 设置成了 IPIfNonMatch，在你上网时 V2Ray 找不到对应的路由域名规则，V2Ray 才会通过设置的 DNS 服务器将域名解析成IP，然后匹配规则，其它的它可不管。freedom 同理。

还有，有的网友想利用 DNS 中的 host 做去广告，我没有这么试过，也不知道结果怎么样。我只想说，这是本末倒置了，要去广告使用 routing 就行，不必搞 DNS。

V2Ray 的 DNS 配置与 SS 的远程 DNS 不是一回事。 我已经想好怎么利用 DNS 配置了，但我还得开个坑，把坑挖好了再说。

-----
## 更新历史

- 2017-08-06 初版

- 2017-08-06 修改不当用词

- 2017-11-16 暂时删去

- 2017-12-31 retore
