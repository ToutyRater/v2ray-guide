# 小结

现在对本章作个总结。

## 配置文件格式

V2Ray 的配置文件格式就像这样。
```javascript
  "log": {},
  "dns": {},
  "routing": {},
  "inbound": {},
  "outbound": {},
  "inboundDetour": [],
  "outboundDetour": [],
  "transport": {}
```

总的来说，V2Ray 的配置有 8 个项，每个项都可以展开成的配置。这 8 个配置项当中，除了 DNS 之外，其它的在本章都有涉及。因为 V2Ray 配置灵活多变，本教程的配置案例没法一一覆盖 V2Ray 所有的配置项，请大家另行参考 V2Ray 的用户手册。

