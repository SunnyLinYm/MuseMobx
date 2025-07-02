const esbuild = require('esbuild')
const fs = require('fs-extra')

// 开发服务器配置
esbuild.serve({
  servedir: 'dist',
  port: 3000,
}, {
  entryPoints: ['svgEdit/index.tsx'],
  bundle: true,
  outfile: 'dist/build.js',
  sourcemap: true,
  format: 'iife',
  globalName: 'SvgEditor',
  loader: { '.ts': 'ts', '.tsx': 'tsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
}).then(() => {
  // 复制HTML文件
  fs.copySync('svgEdit/index.html', 'dist/index.html')
  console.log('构建完成，HTML文件已复制')
}).catch(err => {
  console.error('Server startup failed:', err)
})
