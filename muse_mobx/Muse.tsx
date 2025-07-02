import { observer } from "mobx-react";
import React from "react";
import MuseNotation, { NotationModel } from "./MuseNotation"; // 引入 NotationModel
import { Instance } from "mobx-state-tree"; // 引入 Instance 类型

// 定义 props 接口，明确指定 notation 的类型是 NotationModel 的实例
interface MuseProps {
	notation: Instance<typeof NotationModel>;
}

// 使用 observer 包裹 React.FC 或 class component
// 如果只是简单的 props 传递，函数组件更简洁
const Muse: React.FC<MuseProps> = observer(({ notation }) => {
	return (
		<div>
			{/* 将 notation 实例向下传递给 MuseNotation 组件 */}
			<MuseNotation notation={notation} />
			{/* 你可以在这里添加其他 UI 元素，例如调试按钮 */}
			{/*
            <button
                onClick={() => {
                    console.log(notation.code()); // 调用 notation 实例的 code 方法
                }}
            >
                Log Notation Code
            </button>
            */}
		</div>
	);
});

export default Muse;