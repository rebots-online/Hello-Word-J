const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'assets', 'liturgical-cache.db');
const db = new sqlite3.Database(dbPath);

// Create tables for liturgical texts
db.serialize(() => {
  // Mass texts table
  db.run(`CREATE TABLE IF NOT EXISTS mass_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season TEXT NOT NULL,
    rank TEXT NOT NULL,
    text_type TEXT NOT NULL,
    latin_text TEXT NOT NULL,
    english_text TEXT,
    reference TEXT,
    sequence_order INTEGER DEFAULT 0
  )`);

  // Breviary texts table
  db.run(`CREATE TABLE IF NOT EXISTS breviary_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season TEXT NOT NULL,
    hour TEXT NOT NULL,
    text_type TEXT NOT NULL,
    latin_text TEXT NOT NULL,
    english_text TEXT,
    reference TEXT,
    sequence_order INTEGER DEFAULT 0
  )`);

  // Insert sample Mass texts for Ordinary Time
  const massTexts = [
    ['Ordinary Time', 'Simplex', 'Introit', 'Inclina, Domine, aurem tuam, et exaudi me: salva servum tuum, Deus meus, sperantem in te: miserere mei, Domine, quoniam ad te clamavi tota die.', 'Incline thy ear, O Lord, and hear me: save thy servant, O my God, who trusteth in thee: have mercy on me, O Lord, for I have cried to thee all the day.', 'Ps 85:1-3', 1],
    ['Ordinary Time', 'Simplex', 'Kyrie', 'Kyrie eleison. Christe eleison. Kyrie eleison.', 'Lord, have mercy. Christ, have mercy. Lord, have mercy.', 'Ordinary', 2],
    ['Ordinary Time', 'Simplex', 'Gloria', 'Gloria in excelsis Deo. Et in terra pax hominibus bonae voluntatis.', 'Glory to God in the highest. And on earth peace to men of good will.', 'Luke 2:14', 3],
    ['Ordinary Time', 'Simplex', 'Collect', 'Deus, cuius providentia in sui dispositione non fallitur: te supplices exoramus; ut noxia cuncta submoveas, et omnia nobis profutura concedas.', 'O God, whose providence faileth not in its design: we humbly beseech thee to put away from us all hurtful things, and to give us all things which be profitable for us.', 'Collect', 4],
    ['Ordinary Time', 'Simplex', 'Epistle', 'Lectio Epistolae beati Pauli Apostoli ad Romanos. Fratres: Obsecro vos per misericordiam Dei, ut exhibeatis corpora vestra hostiam viventem, sanctam, Deo placentem.', 'Lesson from the Epistle of blessed Paul the Apostle to the Romans. Brethren: I beseech you by the mercy of God, that you present your bodies a living sacrifice, holy, pleasing unto God.', 'Romans 12:1-2', 5],
    ['Ordinary Time', 'Simplex', 'Gradual', 'Bonum est confiteri Domino: et psallere nomini tuo, Altissime.', 'It is good to give praise to the Lord: and to sing to thy name, O most High.', 'Ps 91:2', 6],
    ['Ordinary Time', 'Simplex', 'Gospel', 'Sequentia sancti Evangelii secundum Matthaeum. In illo tempore: Dixit Jesus discipulis suis: Nemo potest duobus dominis servire.', 'Continuation of the holy Gospel according to Matthew. At that time: Jesus said to his disciples: No man can serve two masters.', 'Matthew 6:24-33', 7],
    ['Ordinary Time', 'Simplex', 'Credo', 'Credo in unum Deum, Patrem omnipotentem, factorem caeli et terrae, visibilium omnium et invisibilium.', 'I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible.', 'Nicene Creed', 8],
    ['Ordinary Time', 'Simplex', 'Offertory', 'Domine Deus, in simplicitate cordis mei laetus obtuli universa: et populum tuum, qui repertus est, vidi cum ingenti gaudio.', 'Lord God, in the simplicity of my heart I have joyfully offered all: and thy people that are found here I have seen with great joy.', '1 Chron 29:17', 9],
    ['Ordinary Time', 'Simplex', 'Secret', 'Oblationem nostram tibi, Domine, quaesumus, placatus assume: et ad nostrae salutis augmentum perducere dignare.', 'Receive favorably, we beseech thee, O Lord, our oblation: and vouchsafe to bring it to the increase of our salvation.', 'Secret', 10],
    ['Ordinary Time', 'Simplex', 'Preface', 'Vere dignum et justum est, aequum et salutare, nos tibi semper et ubique gratias agere: Domine sancte, Pater omnipotens, aeterne Deus.', 'It is truly meet and just, right and availing unto salvation, that we should at all times and in all places give thanks unto thee: O holy Lord, Father almighty, eternal God.', 'Common Preface', 11],
    ['Ordinary Time', 'Simplex', 'Canon', 'Te igitur, clementissime Pater, per Jesum Christum, Filium tuum, Dominum nostrum, supplices rogamus ac petimus.', 'Therefore, most merciful Father, we humbly pray and beseech thee through Jesus Christ thy Son, our Lord.', 'Roman Canon', 12],
    ['Ordinary Time', 'Simplex', 'Communion', 'Gustate et videte quoniam suavis est Dominus: beatus vir qui sperat in eo.', 'Taste and see that the Lord is sweet: blessed is the man that hopeth in him.', 'Ps 33:9', 13],
    ['Ordinary Time', 'Simplex', 'Postcommunion', 'Sit nobis, Domine, reparatio mentis et corporis caeleste mysterium: ut cuius exsequimur cultum, sentiamus effectum.', 'May the heavenly mystery, O Lord, be unto us a renewal of mind and body: that we may feel the effect of that which we celebrate.', 'Postcommunion', 14],
    ['Ordinary Time', 'Simplex', 'Ite Missa Est', 'Ite, missa est. Deo gratias.', 'Go, the Mass is ended. Thanks be to God.', 'Dismissal', 15]
  ];

  const massStmt = db.prepare('INSERT INTO mass_texts (season, rank, text_type, latin_text, english_text, reference, sequence_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
  massTexts.forEach(text => massStmt.run(text));
  massStmt.finalize();

  // Insert sample Breviary texts for Lauds
  const breviaryTexts = [
    ['Ordinary Time', 'Lauds', 'Opening', 'Deus in adjutorium meum intende. Domine, ad adjuvandum me festina.', 'O God, come to my assistance. O Lord, make haste to help me.', 'Ps 69:2', 1],
    ['Ordinary Time', 'Lauds', 'Hymn', 'Splendor paternae gloriae, de luce lucem proferens, lux lucis et fons luminis, diem dies illuminans.', 'O splendor of the Father\'s glory, bringing light from light, light of light and fount of brightness, day illuminating day.', 'Ambrosian Hymn', 2],
    ['Ordinary Time', 'Lauds', 'Antiphon', 'Servite Domino in laetitia: introite in conspectu ejus in exsultatione.', 'Serve the Lord with gladness: come before his presence with exceeding joy.', 'Ps 99:2', 3],
    ['Ordinary Time', 'Lauds', 'Psalm', 'Jubilate Deo, omnis terra: servite Domino in laetitia. Introite in conspectu ejus in exsultatione.', 'Sing joyfully to God, all the earth: serve the Lord with gladness. Come before his presence with exceeding joy.', 'Ps 99:1-2', 4],
    ['Ordinary Time', 'Lauds', 'Capitulum', 'Jam non estis hospites et advenae: sed estis cives sanctorum, et domestici Dei.', 'Now you are no more strangers and foreigners: but you are fellow citizens with the saints, and domestics of God.', 'Eph 2:19', 5],
    ['Ordinary Time', 'Lauds', 'Responsory', 'Christe, Fili Dei vivi, miserere nobis. Qui sedes ad dexteram Patris, miserere nobis.', 'Christ, Son of the living God, have mercy on us. Who sittest at the right hand of the Father, have mercy on us.', 'Responsory', 6],
    ['Ordinary Time', 'Lauds', 'Verse', 'Domine, refugium factus es nobis a generatione in generationem.', 'Lord, thou hast been our refuge from generation to generation.', 'Ps 89:1', 7],
    ['Ordinary Time', 'Lauds', 'Canticle', 'Benedictus Dominus Deus Israel: quia visitavit et redemit populum suum.', 'Blessed be the Lord God of Israel: because he hath visited and wrought the redemption of his people.', 'Luke 1:68', 8],
    ['Ordinary Time', 'Lauds', 'Prayer', 'Domine Deus omnipotens, qui ad principium hujus diei nos pervenire fecisti: tua nos hodie salva virtute.', 'Lord God almighty, who hast brought us to the beginning of this day: save us this day by thy power.', 'Collect', 9],
    ['Ordinary Time', 'Lauds', 'Commemoration', 'Sancta Maria et omnes Sancti intercedant pro nobis ad Dominum: ut nos mereamur ab eo adjuvari et salvari.', 'May holy Mary and all the Saints intercede for us to the Lord: that we may deserve to be helped and saved by him.', 'Commemoration', 10]
  ];

  const breviaryStmt = db.prepare('INSERT INTO breviary_texts (season, hour, text_type, latin_text, english_text, reference, sequence_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
  breviaryTexts.forEach(text => breviaryStmt.run(text));
  breviaryStmt.finalize();

  console.log('Database setup completed with sample liturgical texts');
});

db.close();