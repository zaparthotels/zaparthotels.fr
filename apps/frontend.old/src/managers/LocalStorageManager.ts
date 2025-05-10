export class LocalStorageManager {
	public setItem<T>(key: string, item: T) {
		localStorage.setItem(key, JSON.stringify(item));
	}

	public getItem<T>(key: string): T {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : null;
	}
}
