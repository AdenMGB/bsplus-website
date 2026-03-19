//#region src/lib/utils/admin.ts
async function readJson(input, init) {
	const response = await fetch(input, init);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || `${response.status} ${response.statusText}`);
	}
	return response.json();
}
//#endregion
export { readJson as t };
