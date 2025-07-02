const { buildSync, transformSync } = require("esbuild");
const fs = require("fs-extra");
const { build } = require("./node_modules/esbuild/lib/main");

var config = {
	entryPoints: [
		"./src/proto.ts",
		"./src/sprintf.ts",
		"./src/string_extension.ts",
		"./src/abc_glyphs.ts",
		"./src/abc_graphelements.ts",
		"./src/abc_layout.ts",
		"./src/abc_write.ts",
		"./src/abc_tunebook.ts",
		"./src/abc_parse_header.ts",
		"./src/abc_tune.ts",
		"./src/abc_tokenizer.ts",
		"./src/abc_parse.ts",
		"./src/abc_midiwriter.ts",
		"./src/svg.ts",
		"./src/abc_editor.ts",
		"./src/abc_plugin.ts",

		"./src/abc_parser_lint.ts",
		"./src/application.ts",
		"./src/Maestro_500.js",
		"./src/jsonschema-b4.js",
		"./src/play_embedded.ts",
		//"./src/raphael-patched.js",
		"./src/scalefont.ts",
		"./src/wav_generator.ts",
	],
	bundle: false,
	legalComments:"inline",
	//legalComments: 'eof',
	outdir: './dist'
};



const obj = { dereference: true }
//src是需要copy函数中src目录的遍历结果，包括子文件路径和子目录路径
obj.filter = (src, dest) => {
	let stat = fs.lstatSync(src)
	let isDirectory = stat.isDirectory()

	if (isDirectory) {
		//自己的匹配规则
		if (src.endsWith('.vs'))
			return false;
		else
			return true;
	}
	else {
		if (src.endsWith('.txt') ||
			src.endsWith('.css') ||
			src.endsWith('.html')) {
			console.log(`${src} -> ${dest}`);
			return true;
		} else {
			return false;
		}
	}
}


(async () => {

	fs.removeSync("dist");
	//复制函数
	fs.copySync("src", "dist", obj, err => {
		if (err) return console.error('err', err);
		console.log("拷贝文件成功！")
	})

	console.log('編譯 esbuild abc2svgLin.js')

	var { code, map, warnings } = buildSync(config);
	var { code, map, warnings } = transformSync('let x:number = 1', {
		format: 'cjs',
		//  sourcefile: filename,
		//format: 'cjs',
		target: ["es2015"],
		//sourcemap: 'external',
		loader: 'ts'
	})
	if (warnings) console.log(warnings);
	console.log(code);
	var fstream = fs.createWriteStream(config.outdir + '/test.js');
	fstream.write(code);

})();
