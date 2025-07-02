const esbuild = require('esbuild')
const fs = require('fs-extra')

// 开发服务器配置
esbuild.build({
	entryPoints: ['svgEdit/index.tsx'],
	bundle: true,
	outfile: 'dist-react/build.js',
	sourcemap: true,
	//watch: true, // ✅ 開啟 watch 模式
	//format: 'esm',
	//target: ['esnext'],
	globalName: 'SvgEditor',
	loader: { '.ts': 'ts', '.tsx': 'tsx' },
	define: {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
	}
})
//	.then(() => {
//	 复制HTML文件
//	fs.copySync('svgEdit/index.html', 'dist-react/index.html')
//	console.log('构建完成，HTML文件已复制')
//})


// 开发服务器配置
esbuild.serve({
	servedir: './dist-react', // 指定服务目录，通常是你的项目根目录
	port: 3000,    // 指定端口号，默认为8000
	host: 'localhost'
}, {
	entryPoints: ['svgEdit/index.tsx'],
	bundle: true,
	outfile: 'dist-react/build.js',
	sourcemap: true,
	//format: 'esm',
	//target: ['esnext'],
	//format: 'iife',
	//watch: true,              // 监听文件变化并自动重建
	globalName: 'bulid',
	loader: { '.ts': 'ts', '.tsx': 'tsx' },
	//define: { 'process.env.NODE_ENV': '"production"' },
	define: {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
	},
}
).then(server => {
		const { port, host } = server;
		console.log(`🚀 開發伺服器已啟動：http://${host}:${port}`);
}).then(() => {
	// 复制HTML文件
	fs.copySync('muse/a.json', 'dist-react/a.json')
	fs.copySync('muse/b.json', 'dist-react/b.json')
	console.log('muse.js ok')
})



//// 开发服务器配置
//esbuild.build({
//  entryPoints: ['src/abc_editor.ts'],
//  bundle: true,
//  outfile: 'dist-react/abc.js',
//  sourcemap: true,
//  //format: 'esm',
//  //target: ['esnext'],
//  //format: 'iife',
//  globalName: 'abc',
//  loader: { '.ts': 'ts', '.tsx': 'tsx' },
//  //define: { 'process.env.NODE_ENV': '"production"' },
//  define: {
//    NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
//  },
//}).then(() => {
//  // 复制HTML文件

//  console.log('abc.js ok')
//})

//// 开发服务器配置
//esbuild.build({
//  entryPoints: ['muse/index.tsx'],
//  bundle: true,
//  outfile: 'dist-react/muse.js',
//  sourcemap: true,
//  //format: 'esm',
//  //target: ['esnext'],
//  //format: 'iife',
//  globalName: 'muse',
//  loader: { '.ts': 'ts', '.tsx': 'tsx' },
//  //define: { 'process.env.NODE_ENV': '"production"' },
//  define: {
//    NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
//  },
//}).then(() => {
//  // 复制HTML文件
//  fs.copySync('muse/a.json', 'dist-react/a.json')
//  fs.copySync('muse/b.json', 'dist-react/b.json')
//  console.log('muse.js ok')
//});



//// 开发服务器配置
//esbuild.serve({
//	servedir: './dist-react', // 指定服务目录，通常是你的项目根目录
//	port: 3000,    // 指定端口号，默认为8000
//	host: 'localhost'
//}, {
//	entryPoints: ['muse/index.tsx'],
//	bundle: true,
//	outfile: 'dist-react/muse.js',
//	sourcemap: true,
//	//format: 'esm',
//	//target: ['esnext'],
//	//format: 'iife',
//	//watch: true,              // 监听文件变化并自动重建
//	globalName: 'muse',
//	loader: { '.ts': 'ts', '.tsx': 'tsx' },
//	//define: { 'process.env.NODE_ENV': '"production"' },
//	define: {
//		NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
//	},
//}
//).then(server => {
//		const { port, host } = server;
//		console.log(`🚀 開發伺服器已啟動：http://${host}:${port}`);
//}).then(() => {
//	// 复制HTML文件
//	fs.copySync('muse/a.json', 'dist-react/a.json')
//	fs.copySync('muse/b.json', 'dist-react/b.json')
//	console.log('muse.js ok')
//});