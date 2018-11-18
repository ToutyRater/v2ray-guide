# 高级篇

恭喜大家来到高级篇。

使用基础篇当中的配置案例已经能够满足基本的科学上网需求，但 V2Ray 提供了许多额外的功能，可以带来更好的上网体验。在本篇当中，将针对某个功能简要介绍，并给出关键配置，因此可能不是完整的，也不会像基础篇那样详细，只会在关键之处作一些必要的介绍。

V2Ray 的相比其它工具有一大优点是可以自行选择传输层的形式，也就是说 V2Ray 服务器和客户端之间的传输的数据包形式我们是可以选择的。如我们可以选择伪装成 HTTP(TCP)流量，如果使用了 mKCP 也可以伪装成 BT 下载、视频通话、微信视频通话。也可以选择使用 WebSokcs 或者 TLS。以上这个都是传输层的配置决定的。

V2Ray 中传输层配置在 transport 里设定，也可以在 inbound/outbound 中的 streamSettings 设定。这两者的区别是 inbound/outbound 的 streamSettings 只对当前的 inbound/outbound 有效(分连接配置)，不影响其它的 inbound/outbound 的传输层配置，而 transport 是全局的，对整个配置所有的 inbound 和 outbound 都有效(全局配置)，如果一个 inbound/outbound 中设定了 streamSettings，transport 的全局设定不会影响这个 inbound/outbound。

在本篇当中，大部分内容都涉及到了传输层，关于这部分内容使用的是 inbound/outbound 的 streamSettings(分连接配置)，同时也建议大家使用分连接配置。因为通常情况下我们会有在不同的 inbound/outbound 中使用不同的传输层配置。 
