/**
 * Mass Texts Component - Displays complete Traditional Latin Mass
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../shared/themes/ThemeProvider';
import { Theme } from '../shared/themes/index';

interface MassText {
  latin: string;
  english: string;
  is_rubric: boolean;
}

interface MassTexts {
  [key: string]: MassText;
}

interface MassTextsProps {
  date: string; // YYYY-MM-DD format
}

// Fixed Ordinary parts (same every Mass)
const ORDINARY_TEXTS: MassTexts = {
  "Introibo": {
    "latin": "Sacerdos: Introíbo ad altáre Dei.\nMinister: Ad Deum qui laetíficat juventútem meam.\nSacerdos: Júdica me, Deus, et discérne causam meam de gente non sancta: ab hómine iníquo et dolóso érue me.\nMinister: Quia tu es, Deus, fortitúdo mea: quare me repulísti, et quare tristis incédo, dum afflígit me inimícus?",
    "english": "Priest: I will go unto the altar of God.\nServer: To God who giveth joy to my youth.\nPriest: Judge me, O God, and distinguish my cause from the nation that is not holy: deliver me from the unjust and deceitful man.\nServer: For thou, O God, art my strength: why hast thou cast me off? and why do I go sorrowful whilst the enemy afflicteth me?",
    "is_rubric": false
  },
  "Confiteor": {
    "latin": "Confíteor Deo omnipoténti, beátæ Maríæ semper Vírgini, beáto Michaéli Archángelo, beáto Joánni Baptístæ, sanctis Apóstolis Petro et Paulo, ómnibus Sanctis, et vobis, fratres: quia peccávi nimis cogitatióne, verbo et ópere: mea culpa, mea culpa, mea máxima culpa. Ídeo precor beátam Maríam semper Vírginem, beátum Michaélem Archángelum, beátum Joánnem Baptístam, sanctos Apóstolos Petrum et Paulum, omnes Sanctos, et vos, fratres, oráre pro me ad Dóminum, Deum nostrum.",
    "english": "I confess to Almighty God, to blessed Mary ever Virgin, to blessed Michael the Archangel, to blessed John the Baptist, to the holy Apostles Peter and Paul, to all the Saints, and to you, brethren, that I have sinned exceedingly in thought, word and deed: through my fault, through my fault, through my most grievous fault. Therefore I beseech blessed Mary ever Virgin, blessed Michael the Archangel, blessed John the Baptist, the holy Apostles Peter and Paul, all the Saints, and you, brethren, to pray for me to the Lord our God.",
    "is_rubric": false
  },
  "Kyrie": {
    "latin": "Kyrie eleison.\nChriste eleison.\nKyrie eleison.",
    "english": "Lord, have mercy.\nChrist, have mercy.\nLord, have mercy.",
    "is_rubric": false
  },
  "Gloria": {
    "latin": "Glória in excélsis Deo. Et in terra pax homínibus bonae voluntátis. Laudámus te. Benedícimus te. Adorámus te. Glorificámus te. Grátias ágimus tibi propter magnam glóriam tuam. Dómine Deus, Rex cæléstis, Deus Pater omnípotens. Dómine Fili unigénite, Jesu Christe. Dómine Deus, Agnus Dei, Fílius Patris. Qui tollis peccáta mundi, miserére nobis. Qui tollis peccáta mundi, súscipe deprecatiónem nostram. Qui sedes ad déxteram Patris, miserére nobis. Quóniam tu solus Sanctus. Tu solus Dóminus. Tu solus Altíssimus, Jesu Christe. Cum Sancto Spíritu in glória Dei Patris. Amen.",
    "english": "Glory to God in the highest. And on earth peace to men of good will. We praise thee. We bless thee. We adore thee. We glorify thee. We give thee thanks for thy great glory. O Lord God, heavenly King, God the Father almighty. O Lord, the only-begotten Son, Jesus Christ. O Lord God, Lamb of God, Son of the Father. Who takest away the sins of the world, have mercy on us. Who takest away the sins of the world, receive our prayer. Who sittest at the right hand of the Father, have mercy on us. For thou only art holy. Thou only art the Lord. Thou only, O Jesus Christ, with the Holy Ghost, art most high in the glory of God the Father. Amen.",
    "is_rubric": false
  },
  "Credo": {
    "latin": "Credo in unum Deum, Patrem omnipoténtem, factórem cæli et terræ, visibílium ómnium et invisibílium. Et in unum Dóminum Jesum Christum, Fílium Dei unigénitum. Et ex Patre natum ante ómnia sǽcula. Deum de Deo, lumen de lúmine, Deum verum de Deo vero. Génitum, non factum, consubstantiálem Patri: per quem ómnia facta sunt...",
    "english": "I believe in one God, the Father almighty, Maker of heaven and earth, and of all things visible and invisible. And in one Lord Jesus Christ, the only-begotten Son of God. Born of the Father before all ages. God of God: Light of Light: true God of true God. Begotten, not made, consubstantial with the Father: by whom all things were made...",
    "is_rubric": false
  },
  "Orate_Fratres": {
    "latin": "Sacerdos: Oráte, fratres: ut meum ac vestrum sacrifícium acceptábile fiat apud Deum Patrem omnipoténtem.\nPopulus: Suscípiat Dóminus sacrifícium de mánibus tuis ad laudem et glóriam nominis sui, ad utilitátem quoque nostram, totiúsque Ecclésiæ suæ sanctæ.",
    "english": "Priest: Pray, brethren, that my sacrifice and yours may be acceptable to God the Father almighty.\nPeople: May the Lord accept the sacrifice from thy hands, to the praise and glory of his name, to our benefit and that of all his holy Church.",
    "is_rubric": false
  },
  "Praefatio": {
    "latin": "Vere dignum et justum est, æquum et salutáre, nos tibi semper et ubíque grátias ágere: Dómine sancte, Pater omnípotens, ætérne Deus: Qui cum unigénito Fílio tuo et Spíritu Sancto unus es Deus, unus es Dóminus: non in uníus singularitáte persónæ, sed in uníus Trinitáte substántiæ. Quod enim de tua glória, revelánte te, crédimus, hoc de Fílio tuo, hoc de Spíritu Sancto sine differéntia discretiónis sentímus.",
    "english": "It is truly meet and just, right and for our salvation, that we should at all times, and in all places, give thanks unto thee, O holy Lord, Father almighty, everlasting God: Who, with thine only-begotten Son and the Holy Ghost, art one God, one Lord: not in the oneness of a single person, but in the Trinity of one substance. For that which we believe of thy glory, O Father, the same we believe of thy Son, and of the Holy Ghost, without any difference or inequality.",
    "is_rubric": false
  },
  "Sanctus": {
    "latin": "Sanctus, Sanctus, Sanctus, Dóminus Deus Sábaoth. Pleni sunt cæli et terra glória tua. Hosánna in excélsis. Benedíctus qui venit in nómine Dómini. Hosánna in excélsis.",
    "english": "Holy, Holy, Holy, Lord God of Sabaoth. Heaven and earth are full of thy glory. Hosanna in the highest. Blessed is he that cometh in the name of the Lord. Hosanna in the highest.",
    "is_rubric": false
  },
  "Canon": {
    "latin": "Te ígitur, clementíssime Pater, per Jesum Christum, Fílium tuum, Dóminum nostrum, súpplices rogámus, ac pétimus, uti accépta hábeas et benedícas, hæc + dona, hæc + múnera, hæc + sancta sacrifícia illibáta...",
    "english": "We therefore, humbly pray and beseech thee, most merciful Father, through Jesus Christ, thy Son, our Lord, that thou wouldst vouchsafe to accept and bless these + gifts, these + presents, these + holy unspotted sacrifices...",
    "is_rubric": false
  },
  "Pater": {
    "latin": "Pater noster, qui es in cælis: sanctificétur nomen tuum: advéniat regnum tuum: fiat volúntas tua, sicut in cælo, et in terra. Panem nostrum cotidiánum da nobis hódie: et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris: et ne nos indúcas in tentatiónem: sed líbera nos a malo. Amen.",
    "english": "Our Father, who art in heaven, hallowed be thy name: thy kingdom come: thy will be done on earth as it is in heaven. Give us this day our daily bread: and forgive us our trespasses, as we forgive those who trespass against us: and lead us not into temptation: but deliver us from evil. Amen.",
    "is_rubric": false
  },
  "Agnus_Dei": {
    "latin": "Agnus Dei, qui tollis peccáta mundi: miserére nobis.\nAgnus Dei, qui tollis peccáta mundi: miserére nobis.\nAgnus Dei, qui tollis peccáta mundi: dona nobis pacem.",
    "english": "Lamb of God, who takest away the sins of the world: have mercy on us.\nLamb of God, who takest away the sins of the world: have mercy on us.\nLamb of God, who takest away the sins of the world: grant us peace.",
    "is_rubric": false
  },
  "Domine_Non_Sum": {
    "latin": "Dómine, non sum dignus, ut intres sub tectum meum: sed tantum dic verbo, et sanábitur ánima mea.",
    "english": "Lord, I am not worthy that thou shouldst enter under my roof: but only say the word, and my soul shall be healed.",
    "is_rubric": false
  },
  "Ite_Missa_Est": {
    "latin": "Sacerdos: Ite, missa est.\nPopulus: Deo grátias.",
    "english": "Priest: Go, the Mass is ended.\nPeople: Thanks be to God.",
    "is_rubric": false
  }
};

export const MassTexts: React.FC<MassTextsProps> = ({ date }) => {
  const { theme } = useTheme();
  const [massTexts, setMassTexts] = useState<MassTexts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('Introibo');

  useEffect(() => {
    loadMassTexts();
  }, [date]);

  const loadMassTexts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the real liturgical CLI to get Mass texts
      // Use platform-specific import for web compatibility
      const { getLiturgicalMass } = await import('../api/liturgical.web');
      const massData = await getLiturgicalMass(date);

      // Combine the fixed Ordinary with the dynamic Propers from CLI
      const combinedTexts = {
        ...ORDINARY_TEXTS,
        ...massData.propers
      };

      setMassTexts(combinedTexts);
      setLoading(false);

    } catch (err) {
      console.error('Error loading Mass texts:', err);
      // Fall back to showing just the Ordinary if CLI fails
      setMassTexts(ORDINARY_TEXTS);
      setError('CLI connection failed. Showing fixed parts of the Mass only.');
      setLoading(false);
    }
  };

  const massOrder = [
    'Introibo', 'Confiteor', 'Introitus', 'Kyrie', 'Gloria', 'Oratio', 
    'Lectio', 'Graduale', 'Evangelium', 'Credo', 'Offertorium', 
    'Orate_Fratres', 'Secreta', 'Praefatio', 'Sanctus', 'Canon', 
    'Pater', 'Agnus_Dei', 'Domine_Non_Sum', 'Communio', 'Postcommunio', 'Ite_Missa_Est'
  ];

  const getSectionTitle = (key: string) => {
    const titles: { [key: string]: string } = {
      'Introibo': 'Prayers at the Foot of the Altar',
      'Confiteor': 'Confiteor',
      'Introitus': 'Introit',
      'Kyrie': 'Kyrie Eleison',
      'Gloria': 'Gloria in Excelsis',
      'Oratio': 'Collect',
      'Lectio': 'Epistle',
      'Graduale': 'Gradual',
      'Evangelium': 'Gospel',
      'Credo': 'Credo',
      'Offertorium': 'Offertory',
      'Orate_Fratres': 'Orate Fratres',
      'Secreta': 'Secret',
      'Praefatio': 'Preface',
      'Sanctus': 'Sanctus',
      'Canon': 'Canon of the Mass',
      'Pater': 'Our Father',
      'Agnus_Dei': 'Agnus Dei',
      'Domine_Non_Sum': 'Domine Non Sum Dignus',
      'Communio': 'Communion',
      'Postcommunio': 'Postcommunion',
      'Ite_Missa_Est': 'Ite Missa Est'
    };
    return titles[key] || key;
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Mass texts...</Text>
      </View>
    );
  }

  if (!massTexts) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No Mass texts available for {date}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Holy Mass</Text>
        <Text style={styles.subtitle}>Extraordinary Form (1962 Missal)</Text>
        <Text style={styles.date}>{new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
        {error && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ {error}</Text>
          </View>
        )}
      </View>

      {massOrder.map((section) => {
        const text = massTexts[section];
        const isExpanded = expandedSection === section;
        const isProper = ['Introitus', 'Oratio', 'Lectio', 'Graduale', 'Evangelium', 'Offertorium', 'Secreta', 'Communio', 'Postcommunio'].includes(section);

        return (
          <View key={section} style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setExpandedSection(isExpanded ? null : section)}
            >
              <Text style={styles.sectionTitle}>
                {getSectionTitle(section)}
              </Text>
              <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
            </TouchableOpacity>

            {isExpanded && text && (
              <View style={styles.sectionContent}>
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>Latin:</Text>
                  <Text style={styles.latinText}>{text.latin}</Text>
                </View>
                
                {text.english && (
                  <View style={styles.textBlock}>
                    <Text style={styles.textLabel}>English:</Text>
                    <Text style={styles.englishText}>{text.english}</Text>
                  </View>
                )}
              </View>
            )}

            {isExpanded && !text && (
              <View style={styles.sectionContent}>
                <Text style={styles.missingText}>
                  {isProper ? 'Daily changing text - requires liturgical calculation' : 'Text not available'}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Traditional Latin Mass according to the 1962 Roman Missal
        </Text>
        <Text style={styles.footerNote}>
          CLI Integration: The working liturgical CLI contains the daily Propers.
        </Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.headlineLarge,
    fontWeight: theme.typography.bold,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.primaryFont,
  },
  subtitle: {
    fontSize: theme.typography.titleMedium,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.secondaryFont,
  },
  date: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.primary,
    fontStyle: 'italic',
    fontFamily: theme.typography.secondaryFont,
  },
  warningBox: {
    backgroundColor: theme.colors.warning + '20',
    borderColor: theme.colors.warning + '60',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  warningText: {
    color: theme.colors.warning,
    fontSize: theme.typography.labelSmall,
    textAlign: 'center',
    fontFamily: theme.typography.primaryFont,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.titleLarge,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.primaryFont,
  },
  expandIcon: {
    fontSize: theme.typography.titleLarge,
    color: theme.colors.onSurfaceVariant,
    fontWeight: theme.typography.bold,
    fontFamily: theme.typography.monoFont,
  },
  sectionContent: {
    padding: theme.spacing.md,
  },
  textBlock: {
    marginBottom: theme.spacing.md,
  },
  textLabel: {
    fontSize: theme.typography.labelLarge,
    fontWeight: theme.typography.semiBold,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.primaryFont,
  },
  latinText: {
    fontSize: theme.typography.bodyLarge,
    lineHeight: theme.typography.bodyLarge * theme.typography.lineHeightNormal,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.secondaryFont,
  },
  englishText: {
    fontSize: theme.typography.bodyMedium,
    lineHeight: theme.typography.bodyMedium * theme.typography.lineHeightNormal,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    fontFamily: theme.typography.secondaryFont,
  },
  missingText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.lg,
    fontFamily: theme.typography.primaryFont,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.labelSmall,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.secondaryFont,
  },
  footerNote: {
    fontSize: theme.typography.labelSmall - 1,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: theme.typography.primaryFont,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.typography.bodyLarge,
    color: theme.colors.onSurfaceVariant,
    fontFamily: theme.typography.primaryFont,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.bodyLarge,
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.primaryFont,
  },
});