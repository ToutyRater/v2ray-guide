module.exports = {
	book: { assets: "./book", css: [ "block.css" ] },
	hooks: {
		// Qiita記法を独自フォーマットに変換
		"page:before": function(page) {
			var regixAll = /([^\S]```.*)(:(.+))[\s\S]+?```/g;
			var regix = /([^\S]```.*)(:(.+))[\s\S]+?```/;
			var matchAll = page.content.match(regixAll);

			for(var i = 0; matchAll && i < matchAll.length; i++){
				var match = matchAll[i].match(regix);
				var input = match.input.replace(match[2], "");
				var replace = input.replace(match[1], "\n\n!FILENAME " + match[3] + match[1]);
				page.content = page.content.replace(match.input, replace);
			}

			return page;
		},

		// 独自フォーマットからfilenameタグを生成
		"page": function(page) {
			var regixAll = /(<p>!FILENAME\s+([\S].+)<\/p>)\s*<pre>[\s\S]*?(<\/pre>)/g;
			var regix = /(<p>!FILENAME\s+([\S].+)<\/p>)\s*<pre>[\s\S]*?(<\/pre>)/;
			var replacer = function(filename){
				return '<div><p class="code-filename">' + filename + '</p></div>';
			}

			var tagAll = page.content.match(regixAll);

			for(var j = 0; tagAll && j < tagAll.length; j++){
				var tag = page.content.match(regix);
				var replace = tag[0].replace(tag[1], replacer(tag[2]));
				page.content = page.content.replace(tag[0], replace);
			}

			return page;
		}
	}
};

