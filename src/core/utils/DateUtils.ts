// HelloWord/src/core/utils/DateUtils.ts

export class DateUtils {

  /**
   * Calculates Easter Sunday for a given year using the Meeus/Jones/Butcher algorithm (Gregorian).
   * Returns [month, day], where month is 1-indexed (1 = January).
   */
  public static getEaster(year: number): [number, number] {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return [month, day];
  }

  /**
   * Checks if a year is a leap year.
   */
  public static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Gets the day of the week for a given date.
   * @param year Full year (e.g., 2024)
   * @param month 1-indexed month (1 = January)
   * @param day 1-indexed day
   * @returns Day of the week: 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
   */
  public static getDayOfWeek(year: number, month: number, day: number): number {
    // JavaScript's Date.getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
    // Month in JavaScript's Date constructor is 0-indexed.
    return new Date(year, month - 1, day).getDay();
  }

  /**
   * Gets the day string for Sanctoral lookups (MM-DD).
   * Handles leap year adjustment for dates after Feb 28 in some versions (though this logic is often in kalendar files or Directorium).
   * For now, a simple MM-DD.
   * @param month 1-indexed month
   * @param day 1-indexed day
   * @returns string in MM-DD format.
   */
  public static getSanctoralDayKey(month: number, day: number): string {
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  /**
   * Gets the liturgical week/day name. This is a placeholder for a very complex function.
   * The actual Divinum Officium `getweek` involves detailed calculations based on Easter,
   * Christmas, Epiphany, and specific rules for each liturgical version.
   *
   * This initial version will only handle a few fixed points for demonstration.
   * The returned string should match the patterns used for Tempora file lookups (e.g., "Nat1-0", "Epi1-0").
   *
   * @param year Full year
   * @param month 1-indexed month
   * @param day 1-indexed day
   * @param version Optional version string, may affect calculations.
   * @param missa Optional boolean, true if for Mass (can affect Vigils etc.).
   * @returns A string identifier for the liturgical day/season, or null if not determined by this simplified version.
   */
  public static getLiturgicalWeekKey(year: number, month: number, day: number, version?: string, missa?: boolean): string | null {
    const dayOfWeek = DateUtils.getDayOfWeek(year, month, day); // 0 = Sunday

    // Very basic fixed date examples (incomplete, does not represent full logic)
    if (month === 12 && day === 25) return "Nat1-0"; // Christmas Day (Nat-0 in some DO files, Nat1-0 for Sunday within Octave) - this needs to be exact
                                                     // Perl code uses $weekname (Nat1) and $dayofweek (0 for Sunday) to form "Nat1-0"
                                                     // For Christmas itself, it might be just "Nat" or "Nat0" + dayofweek for octave days.
                                                     // Let's assume "Nat1-0" for Christmas day for now, subject to refinement.
                                                     // Actually, Divinum Officium seems to use file names like "Tempora/Nat0-0.txt" for Christmas Day if it's a Sunday,
                                                     // "Nat0-1.txt" if Monday, etc. Or "Nat1.txt" for the feast itself.
                                                     // The "Nat1" refers to 1st week of Nativity (octave). "Nat0" might be the feast day itself.
                                                     // Let's use a simplified "Christmas" for now.
                                                     // The actual key from DO for Dec 25th is often "Nativity" and files are like Tempora/Nativity-0.txt, Tempora/Nativity-1.txt etc.
                                                     // Or, for the main feast itself, it could be something like Tempora/Nativity.txt.
                                                     // The getweek in Perl returns something like "Nat1" for the octave, and then a "-$dayofweek" is appended.
                                                     // For Dec 25, it's often just "Nat" or "Nat0". Let's use "Nat0" and the day of week.
                                                     // So, for Dec 25 (if Sunday) -> "Nat0-0"
    if (month === 12 && day === 25) return `Nat0-${dayOfWeek}`; // Christmas Day (Nat0 is for feast day, Nat1 for octave week)
    if (month === 12 && day > 25 && day <= 31) return `Nat1-${dayOfWeek}`; // Days within Octave of Christmas (1st week of Nativity)
    if (month === 1 && day === 1) return `Nat1-${dayOfWeek}`; // Octave Day of Christmas (still Nat1 week)

    if (month === 1 && day === 6) return `Epi0-${dayOfWeek}`; // Epiphany
    if (month === 1 && day > 6 && day < 13) { // Days within Octave of Epiphany
        // Sunday within Octave of Epiphany is special: Epi1-0
        // Other days: Epi0-dayOfWeek (for feast day context) or Epi1-dayOfWeek (for octave week context)
        // Let's assume Epi1 for the week.
        return `Epi1-${dayOfWeek}`;
    }
    if (month === 1 && day === 13) return `Epi1-${dayOfWeek}`; // Octave Day of Epiphany (still Epi1 week)


    // Placeholder for Easter and dependent calculations
    const [easterMonth, easterDay] = DateUtils.getEaster(year);
    if (month === easterMonth && day === easterDay) return `Pasc0-${dayOfWeek}`; // Easter Sunday (Pasc0 used for Easter week)

    // TODO: Implement full logic for:
    // - Advent (4 Sundays before Christmas)
    // - Septuagesima, Sexagesima, Quinquagesima (pre-Lent, 9,8,7 weeks before Easter)
    // - Lent (Ash Wednesday is 46 days before Easter; 40 days of Lent excluding Sundays)
    // - Passiontide (last 2 weeks of Lent)
    // - Paschaltide (Easter to Saturday after Pentecost)
    // - Ascension (40 days after Easter)
    // - Pentecost (50 days after Easter)
    // - Time after Epiphany / Time after Pentecost (numbered Sundays)
    // - Ember Days, Rogation Days
    // - Version-specific variations (e.g., 1955 reforms changed some calculations)

    console.warn(`DateUtils.getLiturgicalWeekKey: Full calculation for ${year}-${month}-${day} not yet implemented.`);
    return null;
  }

  /**
   * Adds a specified number of days to a given date.
   * @param year Full year
   * @param month 1-indexed month
   * @param day 1-indexed day
   * @param daysToAdd Number of days to add (can be negative)
   * @returns [year, month, day] array for the new date.
   */
  public static addDays(year: number, month: number, day: number, daysToAdd: number): [number, number, number] {
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + daysToAdd);
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  }

  /**
   * Calculates the number of days between two dates.
   * @param y1 year1
   * @param m1 month1 (1-indexed)
   * @param d1 day1
   * @param y2 year2
   * @param m2 month2 (1-indexed)
   * @param d2 day2
   * @returns number of days (positive if date2 is after date1)
   */
  public static daysBetween(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.round((date2.getTime() - date1.getTime()) / MS_PER_DAY);
  }

}
