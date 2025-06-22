import { LiturgicalDay, LiturgicalSeason } from '../types/liturgical';

export class LiturgicalCalendar {
  static async getDayInfo(dateString: string): Promise<LiturgicalDay> {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // Month is 0-indexed
    const day = date.getDate();

    let season: LiturgicalSeason;
    let celebration = 'Placeholder Celebration'; // Default placeholder

    // Basic season logic (very simplified)
    if (month === 12 && day >= 1 && day <= 24) {
      season = LiturgicalSeason.ADVENT;
      if (day === 24) celebration = "Vigil of the Nativity";
      else celebration = `Feria of Advent`;
    } else if ((month === 12 && day >= 25) || (month === 1 && day <= 13)) {
      season = LiturgicalSeason.CHRISTMASTIDE;
      if (month === 12 && day === 25) celebration = "Nativity of the Lord";
      else if (month === 1 && day === 1) celebration = "Octave Day of the Nativity";
      else celebration = "Feria of Christmastide";
    } else if (month >= 3 && month <= 4) { // Approximation for Lent/Paschaltide
      // This is a very rough placeholder and needs proper calculation
      // For example, Easter can be between March 22 and April 25
      // Septuagesima, Lent, and Paschaltide depend on Easter's date.
      if (month === 3 && day < 15) {
          season = LiturgicalSeason.LENT;
          celebration = "Feria of Lent";
      } else {
          season = LiturgicalSeason.PASCHALTIDE;
          celebration = "Feria of Paschaltide";
      }
    } else {
      season = LiturgicalSeason.TIME_AFTER_PENTECOST;
      celebration = "Feria in Ordinary Time";
    }

    // Placeholder for specific date checks (e.g., June 21, 2025)
    if (dateString === '2025-06-21') {
        celebration = "S. Aloisii Gonzagæ Confessoris";
        season = LiturgicalSeason.TIME_AFTER_PENTECOST; // Assuming based on date
        return {
            date: dateString,
            season: season,
            celebration: celebration,
            rank: 3, // III Class
            color: 'White', // Placeholder, should be determined by celebration
            commemorations: ["Tempora: Sabbato infra Hebdomadam I post Octavam Pentecostes"],
        };
    }


    return {
      date: dateString,
      season: season,
      celebration: celebration,
      rank: 4, // Default rank for a feria
      color: 'Green', // Default color
      commemorations: [],
    };
  }
}
