/*
 將根 Store 獨立成一個檔案的好處：
1.清晰的職責分離 (Separation of Concerns)：
．MuseNotation.tsx 的主要職責是定義 Notation 這種數據結構及其相關的邏輯（如添加/刪除頁面、編碼/解碼）。它本身是一個領域模型。
．一個獨立的 store.ts 或 RootStore.ts 檔案，其主要職責就是組裝這些領域模型，並管理應用程式的全局狀態，包括像 UndoManager 這樣的跨領域功能。
2.更好的可維護性 (Maintainability)：
．當你需要修改或理解根 Store 的行為時，你只需要查看 store.ts。
．當你需要理解 Notation 模型的行為時，你查看 MuseNotation.tsx。
．這使得程式碼庫更容易導航和理解。
3.可測試性 (Testability)：
．獨立的 Store 檔案更容易進行單元測試，你可以專注於測試 Store 的初始化、組裝以及全局動作（如 Undo/Redo）的行為，而無需考慮具體的 UI 渲染邏輯。
．領域模型（如 NotationModel）也可以獨立測試。
4.避免循環依賴 (Circular Dependencies)：
．隨著應用程式的發展，各個模型之間可能會出現複雜的依賴關係。將根 Store 分離出來，有助於打破潛在的循環依賴。例如，如果 Selector 需要知道根 Store 的存在，而根 Store 又引用了 Selector，就可能出現問題。將根 Store 作為最頂層的實體，由它來引用其他模型，可以簡化依賴關係。
5.全局服務的統一管理 (Global Services)：
．UndoManager 就是一個典型的全局服務。將其初始化和管理放在根 Store 中，可以確保它是應用程式級別的功能。
．未來如果還有其他全局服務（例如用戶認證狀態、數據庫連接等），它們也可以被添加到這個根 Store 中。
6.初始化邏輯的集中化 (Centralized Initialization)：
．在 index.tsx 中創建 Store 實例時，所有與 Store 初始化相關的邏輯（如 MuseConfig 的創建、從 API 載入初始數據、調用 decode 等）都將指向這個獨立的 Store 檔案，使得入口點程式碼更加清晰。
 */


// src/models/RootStore.ts (建议的路径)
import { types, Instance, onAction } from "mobx-state-tree";
import { UndoManager } from "mst-middlewares"; // 确保你已安装 mst-middlewares

// 引入你的核心业务模型
import { NotationModel } from "../MuseNotation"; // 假设 MuseNotation.ts 也在 models 文件夹中
import MuseConfig from "../MuseConfig"; // 引入 MuseConfig，注意路径变化

// 定义 RootStore 模型
export const RootStoreModel = types
	.model("RootStore", {
		notation: NotationModel, // 包含 NotationModel 作为根的业务数据
		// 如果有其他全局状态，也可以在这里添加
		// 例如：ui: UIModel,
		// user: UserModel,
	})
	.actions((self) => {
		let undoManager: Instance<typeof UndoManager>; // 声明 undoManager

		return {
			afterCreate() {
				// 初始化 undoManager
				undoManager = new UndoManager(self.notation); // 监听 notation 模型的动作

				// 监听所有动作，并将其添加到 undoManager 中
				// 你可以根据 action.name 或 action.path 进行过滤
				onAction(
					self.notation, // 只监听 notation 及其子模型的动作
					(call) => {
						// 过滤掉 Selection 相关的动作
						if (call.name === "setSelect") return;
						// 过滤掉 getThis 动作
						if (call.name === "getThis") return;
						// 过滤掉 decode 和 code 动作 (数据加载/保存)
						if (call.name === "decode" || call.name === "code") return;
						// 过滤掉 info 模型的 decode 和 code 动作
						if (call.path.includes("/info/") && (call.name === "decode" || call.name === "code")) return;

						// Debugging: 打印被记录的动作
						// console.log("Recorded action for undo:", call.name, call.path);

						undoManager.add(call);
					},
					true // true 表示深度监听所有子模型中的动作
				);
			},
			// 提供 Undo/Redo 动作，这些动作是 RootStore 的公共 API
			undo() {
				if (undoManager.canUndo) {
					undoManager.undo();
				}
			},
			redo() {
				if (undoManager.canRedo) {
					undoManager.redo();
				}
			},
			// 提供查询能力
			canUndo(): boolean {
				return undoManager.canUndo;
			},
			canRedo(): boolean {
				return undoManager.canRedo;
			},
			// 暴露 undoManager 实例，用于调试或其他高级场景
			getUndoManager() {
				return undoManager;
			},
		};
	});

// 导出 RootStore 的实例类型，方便 TypeScript 类型检查
export type RootStore = Instance<typeof RootStoreModel>;

// 这是一个工厂函数，用于创建 RootStore 实例
// 方便在应用入口点进行初始化
export function createRootStore(initialData: any, config: MuseConfig): RootStore {
	return RootStoreModel.create({
		notation: { // 注意这里是 notation 属性，而不是直接的根
			...initialData,
			config: config,
		},
	});
}