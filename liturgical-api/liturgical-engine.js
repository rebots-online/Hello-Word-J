const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class LiturgicalEngine {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'assets', 'liturgical-cache.db');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Calculate Easter date using Butcher's algorithm
  calculateEaster(year) {
    const y = year;
    const a = y % 19;
    const b = Math.floor(y / 100);
    const c = y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  // Calculate liturgical season for a date
  calculateLiturgicalSeason(date) {
    const year = date.getFullYear();
    const easter = this.calculateEaster(year);
    const advent = new Date(year, 11, 25); // December 25
    const firstAdvent = new Date(advent);
    firstAdvent.setDate(advent.getDate() - (advent.getDay() || 7) - 21);
    
    const ashWednesday = new Date(easter);
    ashWednesday.setDate(easter.getDate() - 46);
    
    const pentecost = new Date(easter);
    pentecost.setDate(easter.getDate() + 49);
    
    const palmSunday = new Date(easter);
    palmSunday.setDate(easter.getDate() - 7);
    
    const epiphany = new Date(year, 0, 6); // January 6
    
    if (date >= firstAdvent || date < epiphany) {
      return 'Advent';
    } else if (date >= epiphany && date < ashWednesday) {
      return 'Ordinary';
    } else if (date >= ashWednesday && date < palmSunday) {
      return 'Lent';
    } else if (date >= palmSunday && date < easter) {
      return 'Lent';
    } else if (date >= easter && date < pentecost) {
      return 'Easter';
    } else {
      return 'Ordinary';
    }
  }

  // Get liturgical rank for a date
  calculateLiturgicalRank(date, season) {
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();
    const easter = this.calculateEaster(year);
    
    // Major feasts
    if (this.isChristmas(date) || this.isEpiphany(date) || date.getTime() === easter.getTime()) {
      return 8;
    }
    
    // Sundays in privileged seasons
    if (dayOfWeek === 0 && (season === 'Advent' || season === 'Lent' || season === 'Easter')) {
      return 8;
    }
    
    // Regular Sundays
    if (dayOfWeek === 0) {
      return 5;
    }
    
    // Weekdays
    return 5;
  }

  isChristmas(date) {
    return date.getMonth() === 11 && date.getDate() === 25;
  }

  isEpiphany(date) {
    return date.getMonth() === 0 && date.getDate() === 6;
  }

  // Get calendar information for a date
  async getCalendar(dateString) {
    return new Promise((resolve, reject) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        reject(new Error('Invalid date format'));
        return;
      }

      const season = this.calculateLiturgicalSeason(date);
      const rank = this.calculateLiturgicalRank(date, season);
      const year = date.getFullYear();
      const easter = this.calculateEaster(year);

      const calendar = {
        date: dateString,
        dayOfWeek: date.getDay(),
        season: season,
        rank: rank,
        liturgicalYear: year,
        easter: easter.toISOString().split('T')[0],
        weekNumber: this.getWeekNumber(date, season, easter)
      };

      resolve(calendar);
    });
  }

  getWeekNumber(date, season, easter) {
    if (season === 'Ordinary Time') {
      const epiphany = new Date(date.getFullYear(), 0, 6);
      const daysSinceEpiphany = Math.floor((date - epiphany) / (1000 * 60 * 60 * 24));
      return Math.floor(daysSinceEpiphany / 7) + 1;
    } else if (season === 'Easter') {
      const daysSinceEaster = Math.floor((date - easter) / (1000 * 60 * 60 * 24));
      return Math.floor(daysSinceEaster / 7) + 1;
    }
    return 1;
  }

  // Convert Gregorian date to Julian Day Number
  toJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  // Get Mass texts for a date - Rock 'Em Sock 'Em Priorities™
  async getMass(dateString) {
    return new Promise((resolve, reject) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        reject(new Error('Invalid date format'));
        return;
      }

      const julianDay = this.toJulianDay(date);
      const year = date.getFullYear();
      const easter = this.calculateEaster(year);
      const easterJD = this.toJulianDay(easter);
      
      this.getCalendar(dateString).then(calendar => {
        // Rock 'Em Sock 'Em Priority Query - highest priority wins
        const query = `
          -- Query the actual mass_texts table structure
          SELECT 
            'mass_texts' as source,
            text_type as part_type,
            latin_text,
            reference as rubrical_notes,
            CASE 
              WHEN text_type IN ('Kyrie', 'Gloria', 'Credo', 'Sanctus', 'Agnus Dei', 'Ite Missa Est') THEN 1
              WHEN text_type IN ('Introit', 'Collect', 'Epistle', 'Gradual', 'Gospel', 'Offertory', 'Secret', 'Preface', 'Canon', 'Communion', 'Postcommunion') THEN 2
              ELSE 3
            END as priority,
            'Mass texts for ' || season || ' rank ' || rank as calculation
          FROM mass_texts
          WHERE season = ? AND rank = ?
          
          ORDER BY part_type, priority
        `;
        
        const season = calendar.season === 'Ordinary' ? 'Ordinary Time' : calendar.season;
        const rank = 'Simplex'; // Default rank for now
        
        this.db.all(query, [season, rank], (err, allRows) => {
          if (err) {
            reject(err);
            return;
          }

          // Build complete mass with Rock 'Em Sock 'Em priority system
          const mass = {
            calendar: calendar,
            julian_day: julianDay,
            easter_offset: julianDay - easterJD,
            texts: {
              // Mass Ordinary (invariable parts)
              kyrie: this.findBestText(allRows, 'Kyrie'),
              gloria: this.findBestText(allRows, 'Gloria'),
              credo: this.findBestText(allRows, 'Credo'),
              sanctus: this.findBestText(allRows, 'Sanctus'),
              agnus_dei: this.findBestText(allRows, 'Agnus Dei'),
              
              // Mass Proper (variable parts)
              introit: this.findBestText(allRows, 'Introit'),
              collect: this.findBestText(allRows, 'Collect'),
              epistle: this.findBestText(allRows, 'Epistle'),
              gradual: this.findBestText(allRows, 'Gradual'),
              alleluia: this.findBestText(allRows, 'Alleluia'),
              tract: this.findBestText(allRows, 'Tract'),
              gospel: this.findBestText(allRows, 'Gospel'),
              offertory: this.findBestText(allRows, 'Offertory'),
              secret: this.findBestText(allRows, 'Secret'),
              preface: this.findBestText(allRows, 'Preface'),
              canon: this.findBestText(allRows, 'Canon'),
              communion: this.findBestText(allRows, 'Communion'),
              postcommunion: this.findBestText(allRows, 'Postcommunion'),
              ite_missa_est: this.findBestText(allRows, 'Ite Missa Est')
            }
          };

          resolve(mass);
        });
      }).catch(reject);
    });
  }

  findTextByType(rows, type) {
    const text = rows.find(row => row.text_type === type);
    return text ? {
      latin: text.latin_text,
      english: text.english_text,
      reference: text.reference
    } : null;
  }

  findOrdinaryPart(rows, partType) {
    const part = rows.find(row => row.part_type === partType);
    return part ? {
      latin: part.latin_text,
      seasonal_variants: part.seasonal_variants,
      rubrical_notes: part.rubrical_notes
    } : null;
  }

  findProperText(rows, textType) {
    const text = rows.find(row => row.part_type === textType);
    return text ? {
      latin: text.latin_text,
      rubrics: text.rubrical_notes,
      source: text.source_section
    } : null;
  }

  // Find the best text using Rock 'Em Sock 'Em priority system
  findBestText(rows, partType) {
    // Find all texts for this part type, sorted by priority (lower = higher priority)
    const candidates = rows.filter(row => row.part_type === partType)
                          .sort((a, b) => a.priority - b.priority);
    
    if (candidates.length === 0) return null;
    
    // Return the highest priority (lowest priority number) text
    const best = candidates[0];
    return {
      latin: best.latin_text,
      rubrics: best.rubrical_notes,
      source: best.source,
      priority: best.priority,
      calculation: best.calculation || 'Direct lookup'
    };
  }

  // Julian-based Easter calculation for SQL compatibility
  calculateEasterJD(year) {
    const easter = this.calculateEaster(year);
    return this.toJulianDay(easter);
  }

  // Get Breviary texts for a date and hour
  async getBreviary(dateString, hour) {
    return new Promise((resolve, reject) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        reject(new Error('Invalid date format'));
        return;
      }

      this.getCalendar(dateString).then(calendar => {
        const query = `
          SELECT * FROM breviary_texts 
          WHERE season = ? AND hour = ?
          ORDER BY sequence_order
        `;
        
        this.db.all(query, [calendar.season, hour], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          const breviary = {
            calendar: calendar,
            hour: hour,
            texts: {
              opening: this.findTextByType(rows, 'Opening'),
              hymn: this.findTextByType(rows, 'Hymn'),
              antiphon: this.findTextByType(rows, 'Antiphon'),
              psalm: this.findTextByType(rows, 'Psalm'),
              capitulum: this.findTextByType(rows, 'Capitulum'),
              responsory: this.findTextByType(rows, 'Responsory'),
              verse: this.findTextByType(rows, 'Verse'),
              canticle: this.findTextByType(rows, 'Canticle'),
              prayer: this.findTextByType(rows, 'Prayer'),
              commemoration: this.findTextByType(rows, 'Commemoration')
            }
          };

          resolve(breviary);
        });
      }).catch(reject);
    });
  }

  // Get all breviary hours for a date
  async getAllBreviaryHours(dateString) {
    const hours = ['Matins', 'Lauds', 'Prime', 'Terce', 'Sext', 'None', 'Vespers', 'Compline'];
    const promises = hours.map(hour => this.getBreviary(dateString, hour));
    
    try {
      const results = await Promise.all(promises);
      const breviary = {
        date: dateString,
        hours: {}
      };
      
      results.forEach((result, index) => {
        breviary.hours[hours[index]] = result;
      });
      
      return breviary;
    } catch (error) {
      throw error;
    }
  }

  // Get liturgical year information
  async getLiturgicalYear(dateString) {
    return new Promise((resolve, reject) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        reject(new Error('Invalid date format'));
        return;
      }

      const year = date.getFullYear();
      const easter = this.calculateEaster(year);
      const advent = new Date(year, 11, 25);
      const firstAdvent = new Date(advent);
      firstAdvent.setDate(advent.getDate() - (advent.getDay() || 7) - 21);

      const yearInfo = {
        year: year,
        easter: easter.toISOString().split('T')[0],
        firstAdvent: firstAdvent.toISOString().split('T')[0],
        liturgicalYear: date < firstAdvent ? year : year + 1,
        currentSeason: this.calculateLiturgicalSeason(date)
      };

      resolve(yearInfo);
    });
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

module.exports = LiturgicalEngine;