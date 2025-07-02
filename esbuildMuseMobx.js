const esbuild = require('esbuild')
const fs = require('fs-extra')

// 开发服务器配置
esbuild.build({
	entryPoints: ['muse_mobx/index.tsx'],
	bundle: true,
	outfile: 'dist-muse/muse.js',
	sourcemap: true,
	//watch: true, // ✅ 開啟 watch 模式
	//format: 'esm',
	//target: ['esnext'],
	globalName: 'Muse',
	loader: { '.ts': 'ts', '.tsx': 'tsx' },
	define: {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
	}
})
	.then(() => {
	 复制HTML文件
	fs.copySync('muse_mobx/index.html', 'dist-muse/index.html')
		console.log('muse_mobx/index.html HTML文件已复制')
})

