import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import MuseConfig from "./MuseConfig"; // 引入 MuseConfig (普通类)
import { NotationModel } from "./MuseNotation"; // 引入 NotationModel
import "./App.css";
import { observer } from "mobx-react"; // 引入 observer
import Muse from "./Muse"; // 引入 Muse 组件

// 定义 RootStore 类型，这里就是 NotationModel 的实例
import { Instance } from "mobx-state-tree";
type RootStore = Instance<typeof NotationModel>;

export const App = observer(() => { // App 组件也需要 observer 来响应 store 的变化
	const [error, setError] = useState<any>(null);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	// 使用 useState 来保存 MST store 实例
	const [notationStore, setNotationStore] = useState<RootStore | null>(null);

	useEffect(() => {
		let url = "./b.json"; // 假设这是你的 JSON 数据源
		fetch(url)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.text();
			})
			.then(
				(result) => {
					try {
						const parsedResult = JSON.parse(result);
						const configInstance = new MuseConfig(); // 创建 MuseConfig 实例

						// 使用 NotationModel.create() 来创建 MST store 实例
						const newNotationStore = NotationModel.create({
							...parsedResult, // 假设 parsedResult 包含 pages 和 info 的结构
							config: configInstance, // 将 MuseConfig 实例作为 frozen 类型传递
						});

						// 调用 decode 方法来加载数据，这会触发 MST 内部的 observable 变化
						// 注意：如果 parsedResult 已经完全符合 MST 结构，decode 可能不是必需的
						// 但为了兼容旧的 decode 逻辑，我们保留它
						newNotationStore.decode(parsedResult);

						setNotationStore(newNotationStore);
						setIsLoaded(true);
					} catch (e: any) { // 明确捕获错误类型
						console.error("Error parsing JSON or creating store:", e);
						setError(e);
						setIsLoaded(true);
					}
				},
				(error) => {
					console.error("Error fetching data:", error);
					setError(error);
					setIsLoaded(true);
				}
			);
	}, []); // 空依赖数组表示只在组件挂载时运行一次

	// 在组件卸载时清理，如果你的 store 需要清理（例如，如果它有订阅）
	useEffect(() => {
		return () => {
			// 这里可以放置 notationStore 的清理逻辑，如果需要
			// 例如：destroy(notationStore); 如果 notationStore 被设置为 destroyable
		};
	}, [notationStore]); // 依赖 notationStore

	// 渲染 UI
	return (
		<div className="app">
			<h1>Example</h1>
			{isLoaded ? (
				error ? (
					<div>Error: {error.message || "Unknown error"}</div> // 显示更友好的错误信息
				) : (
					<div>
						{/* 将 notationStore 传递给 Muse 组件 */}
						{notationStore ? (
							<>
								<Muse notation={notationStore} />
								{/* Undo/Redo 按钮，直接调用 store 上的 action */}
								<div style={{ marginTop: '10px' }}>
									<button
										onClick={() => notationStore.undo()}
										disabled={!notationStore.canUndo()}
									>
										Undo (Ctrl+Z)
									</button>
									<button
										onClick={() => notationStore.redo()}
										disabled={!notationStore.canRedo()}
										style={{ marginLeft: '10px' }}
									>
										Redo (Ctrl+Y)
									</button>
									<button
										onClick={() => console.log(JSON.stringify(notationStore.code()))}
										style={{ marginLeft: '10px' }}
									>
										Log Current Notation Data
									</button>
								</div>
							</>
						) : (
							<div>Loading notation data...</div>
						)}
					</div>
				)
			) : (
				"Loading..."
			)}
		</div>
	);
});

render(<App />, document.getElementById("root"));