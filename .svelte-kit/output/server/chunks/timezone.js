//#region server/utils/timezone.ts
var DEFAULT_TIMEZONE = "Australia/Adelaide";
/**
* Converts an ACST datetime string to UTC Unix timestamp
* @param dateTimeString - ISO datetime string (e.g., "2024-12-25T14:30:00")
* @returns Unix timestamp in seconds
*/
function convertACSTToUTC(dateTimeString) {
	const match = dateTimeString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
	if (!match) throw new Error("Invalid datetime format. Expected YYYY-MM-DDTHH:mm:ss");
	const [, year, month, day, hour, minute, second = "00"] = match;
	const dateStr = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
	const utcCandidate = /* @__PURE__ */ new Date(`${dateStr}Z`);
	const acstFormatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: DEFAULT_TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
	let candidate = utcCandidate;
	let iterations = 0;
	const maxIterations = 20;
	while (iterations < maxIterations) {
		if (acstFormatter.format(candidate) === dateStr) return Math.floor(candidate.getTime() / 1e3);
		const acstParts = acstFormatter.formatToParts(candidate);
		const acstHour = parseInt(acstParts.find((p) => p.type === "hour").value);
		const acstMinute = parseInt(acstParts.find((p) => p.type === "minute").value);
		const targetHour = parseInt(hour);
		const targetMinute = parseInt(minute);
		const acstTotalMinutes = acstHour * 60 + acstMinute;
		let diffMinutes = targetHour * 60 + targetMinute - acstTotalMinutes;
		const acstDay = parseInt(acstParts.find((p) => p.type === "day").value);
		const targetDay = parseInt(day);
		if (acstDay !== targetDay) diffMinutes += (targetDay - acstDay) * 24 * 60;
		candidate = /* @__PURE__ */ new Date(candidate.getTime() - diffMinutes * 6e4);
		iterations++;
	}
	const offsetMs = getTimezoneOffsetMs(/* @__PURE__ */ new Date(`${year}-${month}-${day}T12:00:00Z`), DEFAULT_TIMEZONE);
	const acstDate = /* @__PURE__ */ new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
	return Math.floor((acstDate.getTime() - offsetMs) / 1e3);
}
/**
* Gets timezone offset in milliseconds for a specific date and timezone
*/
function getTimezoneOffsetMs(date, timeZone) {
	const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
	return new Date(date.toLocaleString("en-US", { timeZone })).getTime() - utcDate.getTime();
}
/**
* Converts UTC Unix timestamp to ACST datetime string
* @param timestamp - Unix timestamp in seconds
* @returns ISO datetime string in ACST format (e.g., "2024-12-25T14:30:00")
*/
function convertUTCToACST(timestamp) {
	const date = /* @__PURE__ */ new Date(timestamp * 1e3);
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: DEFAULT_TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}).formatToParts(date);
	return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}T${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}:${parts.find((p) => p.type === "second")?.value}`;
}
/**
* Formats timestamp for display in ACST with timezone indicator
* @param timestamp - Unix timestamp in seconds
* @returns Formatted string (e.g., "25 Dec 2024, 14:30 ACST")
*/
function formatACSTDateTime(timestamp) {
	const date = /* @__PURE__ */ new Date(timestamp * 1e3);
	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: DEFAULT_TIMEZONE,
		year: "numeric",
		month: "short",
		day: "numeric"
	});
	const timeFormatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: DEFAULT_TIMEZONE,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
	const timezoneLabel = isDaylightSavingTime(date, "Australia/Adelaide") ? "ACDT" : "ACST";
	return `${dateFormatter.format(date)}, ${timeFormatter.format(date)} ${timezoneLabel}`;
}
/**
* Gets the timezone offset in minutes for a specific date and timezone
*/
function getTimezoneOffset(date, timeZone) {
	const utcFormatter = new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
	const tzFormatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
	const utcParts = utcFormatter.formatToParts(date);
	const tzParts = tzFormatter.formatToParts(date);
	const utcTime = new Date(parseInt(utcParts.find((p) => p.type === "year").value), parseInt(utcParts.find((p) => p.type === "month").value) - 1, parseInt(utcParts.find((p) => p.type === "day").value), parseInt(utcParts.find((p) => p.type === "hour").value), parseInt(utcParts.find((p) => p.type === "minute").value), parseInt(utcParts.find((p) => p.type === "second").value));
	return (new Date(parseInt(tzParts.find((p) => p.type === "year").value), parseInt(tzParts.find((p) => p.type === "month").value) - 1, parseInt(tzParts.find((p) => p.type === "day").value), parseInt(tzParts.find((p) => p.type === "hour").value), parseInt(tzParts.find((p) => p.type === "minute").value), parseInt(tzParts.find((p) => p.type === "second").value)).getTime() - utcTime.getTime()) / 6e4;
}
/**
* Checks if daylight saving time is in effect for a given date and timezone
*/
function isDaylightSavingTime(date, timeZone) {
	const january = new Date(date.getFullYear(), 0, 1);
	return getTimezoneOffset(date, timeZone) !== getTimezoneOffset(january, timeZone);
}
/**
* Gets current timezone label (ACST or ACDT) for a given timestamp
*/
function getTimezoneLabel(timestamp) {
	return isDaylightSavingTime(/* @__PURE__ */ new Date(timestamp * 1e3), "Australia/Adelaide") ? "ACDT" : "ACST";
}
//#endregion
export { getTimezoneLabel as i, convertUTCToACST as n, formatACSTDateTime as r, convertACSTToUTC as t };
