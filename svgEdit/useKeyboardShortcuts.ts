import { useEffect } from 'react';
import { useEditorStore } from './EditorStore';

export function useKeyboardShortcuts() {
	const store = useEditorStore();

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
				e.preventDefault();
				store.undo();
			} else if ((e.ctrlKey && e.key === 'y') ||
				(e.ctrlKey && e.shiftKey && e.key === 'Z')) {
				e.preventDefault();
				store.redo();
			}
		};

		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [store]);
}
