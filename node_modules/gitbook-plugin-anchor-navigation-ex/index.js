/**
 * 本插件修改源插件的功能：综合修复了原有的bug和兼容性
 * 1. 基于 https://github.com/zhangzq/gitbook-plugin-navigator
 * 2. 基于 https://github.com/yaneryou/gitbook-plugin-anchor-navigation
 * 3. 修复 bug ：gitbook-plugin-anchor-navigation 不正常显示
 * 4. 该插件依赖 https://plugins.gitbook.com/plugin/anchors 插件，所以 anchors 插件的必须在本插件之前
 */
/**
 * en
 * 1. based on  https://github.com/zhangzq/gitbook-plugin-navigator
 * 2. based on https://github.com/yaneryou/gitbook-plugin-anchor-navigation
 * 3. bug Restore 2 invalid does not display the bug
 * 4. The plug-in dependency Plug in,https://plugins.gitbook.com/plugin/anchors so the anchors plug-in must be before the plug-in
 */
var cheerio = require('cheerio');

function get_id(text) {
    return text.replace(/[,;. &%+*\/]/g, "_");
}


module.exports = {
    book: {
        assets: ".",
        css: ["plugin.css"]
    },
    hooks: {
        "page": function (section) {
            const defaultOption = {
                //Do you want to overwrite the page title, true: will overwrite the anchors plug-in anchor effect
                //是否重写页面标题，true:将会覆盖anchors插件锚点效果
                isRewritePageTitle:true
            }
            /**
             * [configOption: config option]
             * @type {Object}
             */
            var configOption = this.config.get('pluginsConfig')['anchor-navigation-ex'];
            if (configOption) {
                for (var item in defaultOption) {
                    if (item in configOption) {
                        defaultOption[item] = configOption[item];
                    }
                }
            }

            var isRewritePageTitle = defaultOption.isRewritePageTitle;
            var $ = cheerio.load(section.content);

            var toc = [];
            var title_id = "";
            var title = "";
            var h1 = 0, h2 = 0, h3 = 0;
            $(':header').each(function (i, elem) {
                var header = $(elem);
                var id = header.attr('id');

                if (id) {
                    switch (elem.tagName) {
                        case "h1":
                            toc.push({
                                name: header.text(),
                                url: id,
                                children: []
                            });
                            if(isRewritePageTitle){
                                h1 += 1;
                                h2 = 0, h3 = 0;
                                header.text(h1 + ". " + header.text());
                            }
                            break;
                        case "h2":
                            toc[toc.length - 1].children.push({
                                name: header.text(),
                                url: id,
                                children: []
                            });
                            if(isRewritePageTitle) {
                                h2 += 1;
                                h3 = 0;
                                header.text(h1 + "." + h2 + ". " + header.text());
                            }
                            break;
                        case "h3":
                            toc[toc.length - 1].children[toc[toc.length - 1].children.length - 1].children.push({
                                name: header.text(),
                                url: id,
                                children: []
                            });
                            if(isRewritePageTitle) {
                                h3 += 1;
                                header.text(h1 + "." + h2 + "." + h3 + ". " + header.text());
                            }
                            break;
                        default:
                            break;
                    }
                }
            });
            if (toc.length == 0) {
                section.content = $.html();
                return section;
            }

            var html = "<div id='anchors-navbar'><i class='fa fa-anchor'></i><ul><p><a href='#" + title_id + "'>" + title + "</a></p>";
            for (var i = 0; i < toc.length; i++) {
                html += "<li><a href='#" + toc[i].url + "'>" + (i + 1 + ". " + toc[i].name) + "</a></li>";
                if (toc[i].children.length > 0) {
                    html += "<ul>"
                    for (var j = 0; j < toc[i].children.length; j++) {
                        html += "<li><a href='#" + toc[i].children[j].url + "'>" + (i + 1 + "." + (j + 1) + ". " + toc[i].children[j].name) + "</a></li>";
                        if (toc[i].children[j].children.length > 0) {
                            html += "<ul>";
                            for (var k = 0; k < toc[i].children[j].children.length; k++) {
                               html += "<li><a href='#" + toc[i].children[j].children[k].url + "'>" + (i + 1 + "." + (j + 1) + "." +  (k+1) + ". " + toc[i].children[j].children[k].name) + "</a></li>";
                            }
                            html += "</ul>";
                        }
                    }
                    html += "</ul>"
                }
            }
            html += "</ul></div><a href='#" + toc[0].url + "' id='goTop'><i class='fa fa-arrow-up'></i></a>";

            section.content = $.html() + html;

            return section;
        }
    }
};
