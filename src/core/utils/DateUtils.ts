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
   * Gets the liturgical week/day name based on traditional Roman Rite calendar.
   * Implements full liturgical season calculations based on Easter and Christmas.
   * 
   * @param year Full year
   * @param month 1-indexed month
   * @param day 1-indexed day
   * @param version Optional version string (e.g., "1960", "1955")
   * @param missa Optional boolean, true if for Mass
   * @returns A string identifier for the liturgical day/season (e.g., "Adv1-0", "Quad3-4")
   */
  public static getLiturgicalWeekKey(year: number, month: number, day: number, version?: string, missa?: boolean): string | null {
    const dayOfWeek = DateUtils.getDayOfWeek(year, month, day); // 0 = Sunday
    const currentDate = new Date(year, month - 1, day);
    
    // Get Easter for this year and surrounding years
    const [easterMonth, easterDay] = DateUtils.getEaster(year);
    const easterDate = new Date(year, easterMonth - 1, easterDay);
    
    // Calculate key dates relative to Easter
    const daysFromEaster = DateUtils.daysBetween(year, easterMonth, easterDay, year, month, day);
    
    // Septuagesima Sunday: 63 days before Easter (9 weeks)
    const septuagesimaDate = new Date(easterDate);
    septuagesimaDate.setDate(easterDate.getDate() - 63);
    
    // Ash Wednesday: 46 days before Easter
    const ashWednesdayDate = new Date(easterDate);
    ashWednesdayDate.setDate(easterDate.getDate() - 46);
    
    // Pentecost: 49 days after Easter (7 weeks)
    const pentecostDate = new Date(easterDate);
    pentecostDate.setDate(easterDate.getDate() + 49);
    
    // Trinity Sunday: 56 days after Easter (8 weeks)
    const trinitySundayDate = new Date(easterDate);
    trinitySundayDate.setDate(easterDate.getDate() + 56);

    // === CHRISTMAS SEASON ===
    // Christmas Day
    if (month === 12 && day === 25) return `Nat0-${dayOfWeek}`;
    
    // Octave of Christmas (Dec 26 - Jan 1)
    if ((month === 12 && day > 25) || (month === 1 && day === 1)) {
      return `Nat1-${dayOfWeek}`;
    }
    
    // Days after Octave of Christmas until Epiphany (Jan 2-5)
    if (month === 1 && day >= 2 && day <= 5) {
      return `Nat2-${dayOfWeek}`;
    }
    
    // === EPIPHANY SEASON ===
    // Epiphany (Jan 6)
    if (month === 1 && day === 6) return `Epi0-${dayOfWeek}`;
    
    // Octave of Epiphany (Jan 7-13)
    if (month === 1 && day >= 7 && day <= 13) {
      return `Epi1-${dayOfWeek}`;
    }
    
    // Time after Epiphany (Jan 14 until Septuagesima)
    if (currentDate >= new Date(year, 0, 14) && currentDate < septuagesimaDate) {
      const jan14 = new Date(year, 0, 14);
      const weeksAfterEpiphany = Math.floor((currentDate.getTime() - jan14.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 2;
      return `Epi${weeksAfterEpiphany}-${dayOfWeek}`;
    }
    
    // === SEPTUAGESIMA / PRE-LENT ===
    // Septuagesima week (9 weeks before Easter)
    if (daysFromEaster >= -69 && daysFromEaster < -63) {
      return `Quadp1-${dayOfWeek}`; // Septuagesima
    }
    if (daysFromEaster >= -63 && daysFromEaster < -56) {
      return `Quadp2-${dayOfWeek}`; // Sexagesima
    }
    if (daysFromEaster >= -56 && daysFromEaster < -46) {
      return `Quadp3-${dayOfWeek}`; // Quinquagesima (includes days before Ash Wed)
    }
    
    // === LENT ===
    // Ash Wednesday to Saturday (days -46 to -43)
    if (daysFromEaster >= -46 && daysFromEaster < -42) {
      return `Quad1-${dayOfWeek}`; // First week of Lent
    }
    
    // Weeks of Lent
    if (daysFromEaster >= -42 && daysFromEaster < -35) {
      return `Quad1-${dayOfWeek}`; // 1st Sunday of Lent week
    }
    if (daysFromEaster >= -35 && daysFromEaster < -28) {
      return `Quad2-${dayOfWeek}`; // 2nd Sunday of Lent week
    }
    if (daysFromEaster >= -28 && daysFromEaster < -21) {
      return `Quad3-${dayOfWeek}`; // 3rd Sunday of Lent week
    }
    if (daysFromEaster >= -21 && daysFromEaster < -14) {
      return `Quad4-${dayOfWeek}`; // 4th Sunday of Lent (Laetare)
    }
    
    // === PASSIONTIDE ===
    // Passion Week (5th Sunday of Lent / 1st of Passiontide)
    if (daysFromEaster >= -14 && daysFromEaster < -7) {
      return `Quad5-${dayOfWeek}`; // Passion Sunday week
    }
    
    // Holy Week
    if (daysFromEaster >= -7 && daysFromEaster < 0) {
      return `Quad6-${dayOfWeek}`; // Palm Sunday week
    }
    
    // === PASCHALTIDE ===
    // Easter Sunday
    if (daysFromEaster === 0) return `Pasc0-${dayOfWeek}`;
    
    // Easter Week (Octave)
    if (daysFromEaster >= 1 && daysFromEaster <= 7) {
      return `Pasc1-${dayOfWeek}`;
    }
    
    // Weeks after Easter until Ascension
    if (daysFromEaster >= 8 && daysFromEaster < 14) {
      return `Pasc2-${dayOfWeek}`; // Low Sunday week
    }
    if (daysFromEaster >= 14 && daysFromEaster < 21) {
      return `Pasc3-${dayOfWeek}`;
    }
    if (daysFromEaster >= 21 && daysFromEaster < 28) {
      return `Pasc4-${dayOfWeek}`;
    }
    if (daysFromEaster >= 28 && daysFromEaster < 35) {
      return `Pasc5-${dayOfWeek}`;
    }
    
    // Ascension week (Thursday is day 39)
    if (daysFromEaster >= 35 && daysFromEaster < 42) {
      return `Pasc6-${dayOfWeek}`; // Ascension week
    }
    
    // Week after Ascension until Pentecost
    if (daysFromEaster >= 42 && daysFromEaster < 49) {
      return `Pasc7-${dayOfWeek}`;
    }
    
    // === PENTECOST AND TIME AFTER ===
    // Pentecost Sunday
    if (daysFromEaster === 49) return `Pent0-${dayOfWeek}`;
    
    // Pentecost Octave
    if (daysFromEaster >= 50 && daysFromEaster <= 56) {
      return `Pent1-${dayOfWeek}`;
    }
    
    // Time after Pentecost (numbered Sundays)
    if (daysFromEaster > 56) {
      const weeksAfterTrinity = Math.floor((daysFromEaster - 56) / 7) + 1;
      // Cap at 24 weeks (can be 23-28 depending on Easter date)
      const weekNum = Math.min(weeksAfterTrinity, 24);
      return `Pent${weekNum}-${dayOfWeek}`;
    }
    
    // === ADVENT ===
    // Calculate Advent (4 Sundays before Christmas)
    const christmas = new Date(year, 11, 25);
    const christmasDayOfWeek = christmas.getDay();
    // First Sunday of Advent is the Sunday closest to Nov 30 (St. Andrew)
    const advent1 = new Date(christmas);
    advent1.setDate(christmas.getDate() - 21 - christmasDayOfWeek - (christmasDayOfWeek === 0 ? 7 : 0));
    
    // Adjust to find the 4th Sunday before Christmas
    const daysToChristmas = Math.floor((christmas.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (month === 11 || (month === 12 && day < 25)) {
      // Check if we're in Advent
      if (currentDate >= advent1 && currentDate < christmas) {
        const daysFromAdvent1 = Math.floor((currentDate.getTime() - advent1.getTime()) / (24 * 60 * 60 * 1000));
        const adventWeek = Math.floor(daysFromAdvent1 / 7) + 1;
        if (adventWeek >= 1 && adventWeek <= 4) {
          return `Adv${adventWeek}-${dayOfWeek}`;
        }
      }
      
      // Time after Pentecost continues until Advent
      // This catches late November before Advent
      if (currentDate < advent1 && daysFromEaster > 56) {
        const weeksAfterTrinity = Math.floor((daysFromEaster - 56) / 7) + 1;
        return `Pent${Math.min(weeksAfterTrinity, 24)}-${dayOfWeek}`;
      }
    }
    
    // Fallback - should not reach here if calendar logic is complete
    console.warn(`DateUtils.getLiturgicalWeekKey: Unhandled date ${year}-${month}-${day}`);
    return `Pent1-${dayOfWeek}`; // Default to Time after Pentecost
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
