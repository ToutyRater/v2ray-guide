# 不推荐的配置

也许有一部分朋友发现了，高级篇的内容关于传输层的，各种配置的组合，可以搭配出非常多的配置。但是，有一些组合是我认为不值得或者是冗余的（仅代表个人意见），以下给出。

* TLS+KCP

这是相当一部分人喜欢的组合，不推荐的原因是 vmess 本身的加密方式已经足够，加 TLS 只是多消耗设备算力，尤其是移动设备，TLS 也不在最外层，已经失去大部分人使用 TLS 的初衷。

* TLS+HTTP伪装

这并没有什么卵用，这样的组合不是 HTTPS。

* 单纯使用 Websocket

理论上，使用 Websocket 会比 TCP 性能差一些，所以如果不是搭配 CDN、nginx 或者在 PaaS 上使用，那还是使用 TCP 吧。