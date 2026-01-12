import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { players, categories } from '../src/db/schema'

const db = drizzle(sql)

// Sample players data (from players.ts)
const samplePlayers = [
  {
    playerId: 'ronaldo',
    name: 'Cristiano Ronaldo',
    acceptedAnswers: ['ronaldo', 'cristiano ronaldo', 'cr7', 'cristiano'],
    clues: {
      position: 'Forward / Winger',
      trophies: "5x Champions League, 5x Ballon d'Or, Euro 2016",
      stats: 'All-time top international goalscorer with 130+ goals',
      international: 'Portugal captain, 200+ caps',
      clubs: 'Sporting, Man United, Real Madrid, Juventus, Al-Nassr',
      hint: "Known for his 'SIUUU' celebration",
    },
    difficulty: 'easy' as const,
  },
  {
    playerId: 'messi',
    name: 'Lionel Messi',
    acceptedAnswers: ['messi', 'lionel messi', 'leo messi', 'leo'],
    clues: {
      position: 'Forward / Attacking Midfielder',
      trophies: "4x Champions League, 8x Ballon d'Or, World Cup 2022",
      stats: '800+ career goals, most goals in a calendar year (91)',
      international: 'Argentina captain, Copa America winner',
      clubs: 'Barcelona, PSG, Inter Miami',
      hint: "The 'Little Magician' from Rosario",
    },
    difficulty: 'easy' as const,
  },
  {
    playerId: 'mbappe',
    name: 'Kylian Mbappé',
    acceptedAnswers: ['mbappe', 'kylian mbappe', 'mbappé', 'kylian mbappé'],
    clues: {
      position: 'Forward',
      trophies: 'World Cup 2018, 6x Ligue 1, Nations League 2021',
      stats: 'Youngest French player to score at a World Cup',
      international: 'France, scored hat-trick in World Cup final',
      clubs: 'Monaco, PSG, Real Madrid',
      hint: 'The Teenage Ninja Turtle fan from Bondy',
    },
    difficulty: 'easy' as const,
  },
  {
    playerId: 'modric',
    name: 'Luka Modrić',
    acceptedAnswers: ['modric', 'luka modric', 'modrić', 'luka modrić'],
    clues: {
      position: 'Central Midfielder',
      trophies: "5x Champions League, Ballon d'Or 2018",
      stats: 'Over 500 appearances for Real Madrid',
      international: 'Croatia captain, World Cup 2018 finalist',
      clubs: 'Dinamo Zagreb, Tottenham, Real Madrid',
      hint: "Ended Messi-Ronaldo Ballon d'Or duopoly in 2018",
    },
    difficulty: 'medium' as const,
  },
  {
    playerId: 'benzema',
    name: 'Karim Benzema',
    acceptedAnswers: ['benzema', 'karim benzema', 'benz', 'kb9'],
    clues: {
      position: 'Striker',
      trophies: "5x Champions League, Ballon d'Or 2022",
      stats: "Real Madrid's 2nd all-time top scorer",
      international: 'France, returned from 6-year exile',
      clubs: 'Lyon, Real Madrid, Al-Ittihad',
      hint: 'The cat who always lands on his feet',
    },
    difficulty: 'medium' as const,
  },
  {
    playerId: 'salah',
    name: 'Mohamed Salah',
    acceptedAnswers: ['salah', 'mohamed salah', 'mo salah', 'mohammad salah'],
    clues: {
      position: 'Right Winger / Forward',
      trophies: 'Champions League 2019, Premier League 2020',
      stats: 'Premier League Golden Boot winner 3x',
      international: 'Egypt, African Player of the Year 2x',
      clubs: 'Basel, Chelsea, Fiorentina, Roma, Liverpool',
      hint: 'The Egyptian King at Anfield',
    },
    difficulty: 'medium' as const,
  },
  {
    playerId: 'gavi',
    name: 'Gavi',
    acceptedAnswers: ['gavi', 'pablo gavi', 'pablo páez gavi'],
    clues: {
      position: 'Central Midfielder',
      trophies: 'La Liga 2023, Golden Boy 2022',
      stats: 'Youngest Barcelona player in El Clásico (17 years old)',
      international: 'Spain, Euro 2024 squad',
      clubs: 'Barcelona',
      hint: 'La Masia graduate, one-club wonderkid',
    },
    difficulty: 'hard' as const,
  },
  {
    playerId: 'bellingham',
    name: 'Jude Bellingham',
    acceptedAnswers: ['bellingham', 'jude bellingham'],
    clues: {
      position: 'Central / Attacking Midfielder',
      trophies: 'La Liga 2024, Champions League 2024',
      stats: 'Scored 23 goals in debut La Liga season',
      international: 'England, youngest player at Euro 2020',
      clubs: 'Birmingham City, Borussia Dortmund, Real Madrid',
      hint: "Birmingham's £30m wonderkid who conquered Spain",
    },
    difficulty: 'hard' as const,
  },
  {
    playerId: 'saka',
    name: 'Bukayo Saka',
    acceptedAnswers: ['saka', 'bukayo saka'],
    clues: {
      position: 'Right Winger',
      trophies: 'FA Cup 2020',
      stats: "Arsenal's top scorer and assister 2022-23",
      international: 'England, missed crucial Euro 2020 penalty',
      clubs: 'Arsenal',
      hint: 'The Starboy from Hale End academy',
    },
    difficulty: 'hard' as const,
  },
]

// Sample categories data (from Outliers.tsx)
const sampleCategories = [
  {
    difficulty: 1,
    connection: 'Planets in our solar system',
    items: ['Mars', 'Venus', 'Saturn', 'Neptune', 'Jupiter', 'Mercury'],
    outliers: ['Pluto', 'Europa', 'Titan', 'Moon', 'Ceres', 'Ganymede'],
  },
  {
    difficulty: 1,
    connection: 'Beatles members',
    items: ['John', 'Paul', 'George', 'Ringo'],
    outliers: ['Pete', 'Mick', 'Keith', 'Brian', 'Eric', 'Roger'],
  },
  {
    difficulty: 1,
    connection: 'Hogwarts houses',
    items: ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'],
    outliers: ['Dumbledore', 'Hogwarts', 'Azkaban', 'Durmstrang'],
  },
  {
    difficulty: 2,
    connection: 'NATO phonetic alphabet',
    items: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'],
    outliers: ['Able', 'Baker', 'Cast', 'Apple', 'Beta'],
  },
  {
    difficulty: 2,
    connection: 'Chemical element symbols that are single letters',
    items: ['H', 'B', 'C', 'N', 'O', 'F', 'P', 'S', 'K', 'V', 'Y', 'I', 'W', 'U'],
    outliers: ['He', 'Li', 'Be', 'Ne', 'Na', 'Mg', 'Al'],
  },
  {
    difficulty: 2,
    connection: 'Countries that drive on the left',
    items: ['UK', 'Japan', 'Australia', 'India', 'Thailand'],
    outliers: ['USA', 'France', 'Germany', 'Brazil', 'China'],
  },
  {
    difficulty: 3,
    connection: 'Shakespeare plays set in Italy',
    items: ['Romeo and Juliet', 'Othello', 'The Merchant of Venice', 'Much Ado About Nothing'],
    outliers: ['Hamlet', 'Macbeth', 'King Lear', 'A Midsummer Night\'s Dream'],
  },
  {
    difficulty: 3,
    connection: 'Elements named after scientists',
    items: ['Curium', 'Einsteinium', 'Fermium', 'Nobelium', 'Mendelevium'],
    outliers: ['Uranium', 'Plutonium', 'Americium', 'Californium'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have hosted both Summer and Winter Olympics',
    items: ['USA', 'France', 'Japan', 'Italy', 'Germany', 'Canada'],
    outliers: ['UK', 'Brazil', 'China', 'Australia', 'Greece'],
  },
]

async function seed() {
  console.log('Starting database seed...')

  try {
    // Clear existing data
    console.log('Clearing existing data...')
    await db.delete(players)
    await db.delete(categories)

    // Insert players
    console.log('Inserting players...')
    for (const player of samplePlayers) {
      await db.insert(players).values(player)
      console.log(`  Added player: ${player.name}`)
    }

    // Insert categories
    console.log('Inserting categories...')
    for (const category of sampleCategories) {
      await db.insert(categories).values(category)
      console.log(`  Added category: ${category.connection}`)
    }

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
