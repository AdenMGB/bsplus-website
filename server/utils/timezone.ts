// Timezone utility for Australian Central Standard Time (ACST/ACDT)
// Uses Australia/Adelaide timezone which automatically handles daylight saving

export const DEFAULT_TIMEZONE = 'Australia/Adelaide';

/**
 * Converts an ACST datetime string to UTC Unix timestamp
 * @param dateTimeString - ISO datetime string (e.g., "2024-12-25T14:30:00")
 * @returns Unix timestamp in seconds
 */
export function convertACSTToUTC(dateTimeString: string): number {
  // Parse the datetime string components
  const match = dateTimeString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    throw new Error('Invalid datetime format. Expected YYYY-MM-DDTHH:mm:ss');
  }
  
  const [, year, month, day, hour, minute, second = '00'] = match;
  
  // Create a date string in ISO format
  const dateStr = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  
  // We need to find what UTC time, when displayed in ACST, equals our input
  // ACST is UTC+9:30 or UTC+10:30 (during DST)
  // So if we want 14:30 ACST, we need UTC time that displays as 14:30 in ACST
  
  // Strategy: Start with the date as if it's UTC, then adjust backwards by the ACST offset
  // Create a date object representing this time (treating as UTC initially)
  const utcCandidate = new Date(`${dateStr}Z`);
  
  // Get what this UTC time displays as in ACST
  const acstFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  // Use iterative approach to find the correct UTC time
  let candidate = utcCandidate;
  let iterations = 0;
  const maxIterations = 20;
  
  while (iterations < maxIterations) {
    const acstDisplay = acstFormatter.format(candidate);
    
    if (acstDisplay === dateStr) {
      return Math.floor(candidate.getTime() / 1000);
    }
    
    // Calculate difference
    const acstParts = acstFormatter.formatToParts(candidate);
    const acstHour = parseInt(acstParts.find(p => p.type === 'hour')!.value);
    const acstMinute = parseInt(acstParts.find(p => p.type === 'minute')!.value);
    const targetHour = parseInt(hour);
    const targetMinute = parseInt(minute);
    
    // Calculate minutes difference
    const acstTotalMinutes = acstHour * 60 + acstMinute;
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    let diffMinutes = targetTotalMinutes - acstTotalMinutes;
    
    // Handle day rollover
    const acstDay = parseInt(acstParts.find(p => p.type === 'day')!.value);
    const targetDay = parseInt(day);
    if (acstDay !== targetDay) {
      diffMinutes += (targetDay - acstDay) * 24 * 60;
    }
    
    // Adjust candidate time
    candidate = new Date(candidate.getTime() - diffMinutes * 60000);
    
    iterations++;
  }
  
  // Fallback: Calculate offset directly
  // Get the offset for Australia/Adelaide at this specific date/time
  const testDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
  const offsetMs = getTimezoneOffsetMs(testDate, DEFAULT_TIMEZONE);
  
  // Create date representing the ACST time, then subtract offset to get UTC
  const acstDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  const utcTimestamp = Math.floor((acstDate.getTime() - offsetMs) / 1000);
  
  return utcTimestamp;
}

/**
 * Gets timezone offset in milliseconds for a specific date and timezone
 */
function getTimezoneOffsetMs(date: Date, timeZone: string): number {
  // Create two dates: one in UTC, one in the target timezone
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
  
  return tzDate.getTime() - utcDate.getTime();
}

/**
 * Converts UTC Unix timestamp to ACST datetime string
 * @param timestamp - Unix timestamp in seconds
 * @returns ISO datetime string in ACST format (e.g., "2024-12-25T14:30:00")
 */
export function convertUTCToACST(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  const second = parts.find(p => p.type === 'second')?.value;
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/**
 * Formats timestamp for display in ACST with timezone indicator
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted string (e.g., "25 Dec 2024, 14:30 ACST")
 */
export function formatACSTDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Check if daylight saving is in effect
  const isDST = isDaylightSavingTime(date, DEFAULT_TIMEZONE);
  const timezoneLabel = isDST ? 'ACDT' : 'ACST';
  
  const dateStr = dateFormatter.format(date);
  const timeStr = timeFormatter.format(date);
  
  return `${dateStr}, ${timeStr} ${timezoneLabel}`;
}

/**
 * Gets the timezone offset in minutes for a specific date and timezone
 */
function getTimezoneOffset(date: Date, timeZone: string): number {
  // Create two formatters: one for UTC, one for the target timezone
  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const utcParts = utcFormatter.formatToParts(date);
  const tzParts = tzFormatter.formatToParts(date);
  
  const utcTime = new Date(
    parseInt(utcParts.find(p => p.type === 'year')!.value),
    parseInt(utcParts.find(p => p.type === 'month')!.value) - 1,
    parseInt(utcParts.find(p => p.type === 'day')!.value),
    parseInt(utcParts.find(p => p.type === 'hour')!.value),
    parseInt(utcParts.find(p => p.type === 'minute')!.value),
    parseInt(utcParts.find(p => p.type === 'second')!.value)
  );
  
  const tzTime = new Date(
    parseInt(tzParts.find(p => p.type === 'year')!.value),
    parseInt(tzParts.find(p => p.type === 'month')!.value) - 1,
    parseInt(tzParts.find(p => p.type === 'day')!.value),
    parseInt(tzParts.find(p => p.type === 'hour')!.value),
    parseInt(tzParts.find(p => p.type === 'minute')!.value),
    parseInt(tzParts.find(p => p.type === 'second')!.value)
  );
  
  return (tzTime.getTime() - utcTime.getTime()) / 60000;
}

/**
 * Checks if daylight saving time is in effect for a given date and timezone
 */
function isDaylightSavingTime(date: Date, timeZone: string): boolean {
  // Compare January (no DST) and the given date
  const january = new Date(date.getFullYear(), 0, 1);
  const dateOffset = getTimezoneOffset(date, timeZone);
  const janOffset = getTimezoneOffset(january, timeZone);
  
  // If offset is different from January, DST is in effect
  return dateOffset !== janOffset;
}

/**
 * Gets current timezone label (ACST or ACDT) for a given timestamp
 */
export function getTimezoneLabel(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return isDaylightSavingTime(date, DEFAULT_TIMEZONE) ? 'ACDT' : 'ACST';
}
