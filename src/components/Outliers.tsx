'use client'

import React, { useState, useEffect } from 'react'

// Seeded random
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getDayNumber = () => {
  const start = new Date('2026-01-09').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
}

const getTimeUntilMidnight = () => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  return midnight - now
}

const formatTime = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const shuffleWithSeed = (array, seed) => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// LocalStorage helpers
const STORAGE_KEY = 'outlier_data'

const loadGameData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

const saveGameData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore localStorage errors
  }
}

// Categories with items and connections
// Each category has 4+ items that share the connection, plus outliers
const CATEGORIES = [
  // ==================== EASY (Difficulty 1) ====================
  // Obvious, common knowledge categories

  {
    difficulty: 1,
    connection: 'Planets in our solar system',
    items: ['Mars', 'Venus', 'Saturn', 'Neptune', 'Jupiter', 'Mercury'],
    outliers: ['Pluto', 'Europa', 'Titan', 'Moon', 'Ceres', 'Ganymede'],
  },
  {
    difficulty: 1,
    connection: 'Primary colors (light)',
    items: ['Red', 'Green', 'Blue'],
    outliers: ['Yellow', 'Orange', 'Purple', 'Pink', 'Cyan', 'Magenta'],
  },
  {
    difficulty: 1,
    connection: 'Secondary colors',
    items: ['Orange', 'Green', 'Purple', 'Violet'],
    outliers: ['Red', 'Blue', 'Yellow', 'White', 'Black'],
  },
  {
    difficulty: 1,
    connection: 'Months with 30 days',
    items: ['April', 'June', 'September', 'November'],
    outliers: ['March', 'July', 'January', 'February', 'August', 'December'],
  },
  {
    difficulty: 1,
    connection: 'Card suits',
    items: ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
    outliers: ['Joker', 'Ace', 'Trump', 'Wild', 'Jack', 'King'],
  },
  {
    difficulty: 1,
    connection: 'Beatles members',
    items: ['John', 'Paul', 'George', 'Ringo'],
    outliers: ['Pete', 'Mick', 'Keith', 'Brian', 'Eric', 'Roger'],
  },
  {
    difficulty: 1,
    connection: 'Vowels',
    items: ['A', 'E', 'I', 'O', 'U'],
    outliers: ['Y', 'W', 'H', 'R', 'S', 'T'],
  },
  {
    difficulty: 1,
    connection: 'Continents',
    items: ['Africa', 'Asia', 'Europe', 'Antarctica', 'Australia'],
    outliers: ['Greenland', 'India', 'Arabia', 'Siberia', 'Alaska'],
  },
  {
    difficulty: 1,
    connection: 'Weekdays',
    items: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    outliers: ['Saturday', 'Sunday', 'Weekend', 'Holiday'],
  },
  {
    difficulty: 1,
    connection: 'Hogwarts houses',
    items: ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'],
    outliers: ['Dumbledore', 'Hogwarts', 'Azkaban', 'Durmstrang'],
  },
  {
    difficulty: 1,
    connection: 'Oceans',
    items: ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'],
    outliers: ['Mediterranean', 'Caribbean', 'Baltic', 'Caspian'],
  },
  {
    difficulty: 1,
    connection: 'Seasons',
    items: ['Spring', 'Summer', 'Fall', 'Winter'],
    outliers: ['Autumn', 'Monsoon', 'Harvest', 'Solstice'],
  },
  {
    difficulty: 1,
    connection: "Snow White's dwarfs",
    items: ['Grumpy', 'Sleepy', 'Dopey', 'Doc', 'Happy', 'Bashful', 'Sneezy'],
    outliers: ['Lazy', 'Cranky', 'Smiley', 'Hungry', 'Silly'],
  },
  {
    difficulty: 1,
    connection: 'Teenage Mutant Ninja Turtles',
    items: ['Leonardo', 'Donatello', 'Raphael', 'Michelangelo'],
    outliers: ['Splinter', 'Shredder', 'Picasso', 'Rembrandt'],
  },
  {
    difficulty: 1,
    connection: 'Noble gases',
    items: ['Helium', 'Neon', 'Argon', 'Krypton', 'Xenon'],
    outliers: ['Oxygen', 'Nitrogen', 'Hydrogen', 'Carbon'],
  },
  {
    difficulty: 1,
    connection: 'Great Lakes',
    items: ['Superior', 'Michigan', 'Huron', 'Erie', 'Ontario'],
    outliers: ['Tahoe', 'Champlain', 'Okeechobee', 'Placid'],
  },
  {
    difficulty: 1,
    connection: 'Zodiac signs',
    items: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo'],
    outliers: ['Orion', 'Draco', 'Phoenix', 'Pegasus'],
  },
  {
    difficulty: 1,
    connection: 'Primary taste sensations',
    items: ['Sweet', 'Sour', 'Salty', 'Bitter', 'Umami'],
    outliers: ['Spicy', 'Tangy', 'Savory', 'Zesty'],
  },
  {
    difficulty: 1,
    connection: 'Phases of the moon',
    items: ['New', 'Crescent', 'Quarter', 'Gibbous', 'Full'],
    outliers: ['Half', 'Eclipse', 'Harvest', 'Blue'],
  },
  {
    difficulty: 1,
    connection: 'Colors of the rainbow',
    items: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'],
    outliers: ['Pink', 'Brown', 'Black', 'White', 'Gray'],
  },
  {
    difficulty: 1,
    connection: 'Directions on a compass',
    items: ['North', 'South', 'East', 'West'],
    outliers: ['Up', 'Down', 'Left', 'Right', 'Forward'],
  },
  {
    difficulty: 1,
    connection: 'Months with 31 days',
    items: ['January', 'March', 'May', 'July', 'August', 'October', 'December'],
    outliers: ['April', 'June', 'September', 'November', 'February'],
  },
  {
    difficulty: 1,
    connection: 'Teletubbies',
    items: ['Tinky Winky', 'Dipsy', 'Laa-Laa', 'Po'],
    outliers: ['Barney', 'Elmo', 'Big Bird', 'Dora'],
  },
  {
    difficulty: 1,
    connection: 'Pac-Man ghosts',
    items: ['Blinky', 'Pinky', 'Inky', 'Clyde'],
    outliers: ['Pac-Man', 'Ghosty', 'Spooky', 'Shadow'],
  },
  {
    difficulty: 1,
    connection: 'Olympic ring colors',
    items: ['Blue', 'Yellow', 'Black', 'Green', 'Red'],
    outliers: ['White', 'Orange', 'Purple', 'Gold', 'Silver'],
  },
  {
    difficulty: 1,
    connection: 'Rock-paper-scissors-lizard-Spock options',
    items: ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock'],
    outliers: ['Fire', 'Water', 'Bomb', 'Gun', 'Air'],
  },
  {
    difficulty: 1,
    connection: 'US coins',
    items: ['Penny', 'Nickel', 'Dime', 'Quarter'],
    outliers: ['Dollar', 'Euro', 'Pound', 'Peso'],
  },
  {
    difficulty: 1,
    connection: 'Monopoly tokens (classic)',
    items: ['Car', 'Dog', 'Hat', 'Ship', 'Thimble', 'Iron'],
    outliers: ['Dice', 'Hotel', 'House', 'Money'],
  },
  {
    difficulty: 1,
    connection: 'States of matter',
    items: ['Solid', 'Liquid', 'Gas', 'Plasma'],
    outliers: ['Vapor', 'Ice', 'Steam', 'Gel'],
  },
  {
    difficulty: 1,
    connection: 'Spice Girls',
    items: ['Scary', 'Sporty', 'Baby', 'Ginger', 'Posh'],
    outliers: ['Spicy', 'Sassy', 'Silly', 'Sweet'],
  },
  {
    difficulty: 1,
    connection: 'Cartoon Network original shows',
    items: ["Dexter's Laboratory", 'Powerpuff Girls', 'Johnny Bravo', 'Courage the Cowardly Dog'],
    outliers: ['SpongeBob', 'Rugrats', 'Hey Arnold', 'Fairly OddParents'],
  },

  // ==================== MEDIUM (Difficulty 2) ====================
  // Require some knowledge or thought

  {
    difficulty: 2,
    connection: 'Countries that drive on the left',
    items: ['Japan', 'UK', 'Australia', 'India', 'Thailand', 'Kenya'],
    outliers: ['France', 'Germany', 'Brazil', 'Canada', 'Spain', 'Italy'],
  },
  {
    difficulty: 2,
    connection: 'Elements named after scientists',
    items: ['Einsteinium', 'Curium', 'Fermium', 'Nobelium', 'Mendelevium'],
    outliers: ['Uranium', 'Plutonium', 'Titanium', 'Helium', 'Californium'],
  },
  {
    difficulty: 2,
    connection: 'Words that are also poker terms',
    items: ['Fold', 'River', 'Blind', 'Check', 'Flop', 'Raise'],
    outliers: ['Crease', 'Stream', 'Dark', 'Mark', 'Drop'],
  },
  {
    difficulty: 2,
    connection: 'Companies founded in garages',
    items: ['Apple', 'Amazon', 'Google', 'Disney', 'HP', 'Harley-Davidson'],
    outliers: ['Microsoft', 'Facebook', 'Netflix', 'Tesla', 'IBM'],
  },
  {
    difficulty: 2,
    connection: "Animals that can't jump",
    items: ['Elephant', 'Sloth', 'Hippo', 'Rhino'],
    outliers: ['Giraffe', 'Whale', 'Turtle', 'Penguin', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with red, white, and blue flags',
    items: ['USA', 'France', 'UK', 'Netherlands', 'Russia', 'Norway'],
    outliers: ['Germany', 'Italy', 'Ireland', 'Sweden', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Capitals that start with the same letter as their country',
    items: ['Guatemala City', 'Kuwait City', 'Luxembourg City', 'Monaco', 'Panama City'],
    outliers: ['Paris', 'London', 'Tokyo', 'Berlin', 'Madrid'],
  },
  {
    difficulty: 2,
    connection: 'Movies that won Best Picture and Best Director',
    items: ['The Godfather', "Schindler's List", 'Titanic', 'No Country for Old Men'],
    outliers: ['Pulp Fiction', 'Goodfellas', 'Saving Private Ryan', 'The Social Network'],
  },
  {
    difficulty: 2,
    connection: 'Brands that started as something else',
    items: ['Nokia', 'Samsung', 'Nintendo', 'Colgate', 'Wrigley'],
    outliers: ['Apple', 'Microsoft', 'Google', 'Amazon'],
  },
  {
    difficulty: 2,
    connection: 'Countries with exactly 4 letters',
    items: ['Peru', 'Cuba', 'Iran', 'Iraq', 'Oman', 'Togo', 'Fiji', 'Mali', 'Chad', 'Laos'],
    outliers: ['Chile', 'Egypt', 'Spain', 'China', 'Japan', 'Kenya'],
  },
  {
    difficulty: 2,
    connection: "Animals that lay eggs but aren't birds",
    items: ['Platypus', 'Crocodile', 'Turtle', 'Snake', 'Fish'],
    outliers: ['Dolphin', 'Whale', 'Bat', 'Koala', 'Kangaroo'],
  },
  {
    difficulty: 2,
    connection: 'Countries without rivers',
    items: ['Saudi Arabia', 'Bahrain', 'Kuwait', 'UAE', 'Qatar'],
    outliers: ['Egypt', 'Iraq', 'Israel', 'Jordan', 'Lebanon'],
  },
  {
    difficulty: 2,
    connection: 'Words borrowed from Japanese',
    items: ['Karaoke', 'Tsunami', 'Emoji', 'Tofu', 'Origami', 'Sake'],
    outliers: ['Kung Fu', 'Yoga', 'Safari', 'Guru', 'Cafe'],
  },
  {
    difficulty: 2,
    connection: 'Landlocked countries',
    items: ['Switzerland', 'Austria', 'Mongolia', 'Nepal', 'Bolivia'],
    outliers: ['France', 'Germany', 'China', 'Argentina', 'Turkey'],
  },
  {
    difficulty: 2,
    connection: 'Animals with pouches',
    items: ['Kangaroo', 'Koala', 'Wombat', 'Opossum', 'Wallaby'],
    outliers: ['Platypus', 'Panda', 'Sloth', 'Armadillo'],
  },
  {
    difficulty: 2,
    connection: 'Shakespeare plays set in Italy',
    items: ['Romeo and Juliet', 'Othello', 'The Merchant of Venice', 'Much Ado About Nothing'],
    outliers: ['Hamlet', 'Macbeth', 'King Lear', 'Twelfth Night'],
  },
  {
    difficulty: 2,
    connection: 'Foods named after places',
    items: ['Champagne', 'Hamburger', 'Buffalo wings', 'Parmesan', 'Worcestershire'],
    outliers: ['Pizza', 'Sushi', 'Tacos', 'Croissant'],
  },
  {
    difficulty: 2,
    connection: 'Two-word countries',
    items: ['New Zealand', 'South Africa', 'Sri Lanka', 'Costa Rica', 'Puerto Rico'],
    outliers: ['Australia', 'Argentina', 'Indonesia', 'Venezuela'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can recognize themselves in mirrors',
    items: ['Chimpanzee', 'Dolphin', 'Elephant', 'Magpie', 'Orangutan'],
    outliers: ['Dog', 'Cat', 'Parrot', 'Gorilla'],
  },
  {
    difficulty: 2,
    connection: 'Elements discovered in the 20th century',
    items: ['Plutonium', 'Neptunium', 'Americium', 'Curium', 'Berkelium', 'Californium'],
    outliers: ['Uranium', 'Radium', 'Gold', 'Silver', 'Iron'],
  },
  {
    difficulty: 2,
    connection: 'Countries on the equator',
    items: ['Ecuador', 'Brazil', 'Kenya', 'Indonesia', 'Colombia'],
    outliers: ['Mexico', 'Peru', 'Australia', 'India', 'Egypt'],
  },
  {
    difficulty: 2,
    connection: 'Cities that have hosted the Summer Olympics twice',
    items: ['London', 'Paris', 'Los Angeles', 'Athens', 'Tokyo'],
    outliers: ['Barcelona', 'Sydney', 'Beijing', 'Berlin', 'Rome'],
  },
  {
    difficulty: 2,
    connection: 'Fruits that are technically berries',
    items: ['Banana', 'Avocado', 'Grape', 'Tomato', 'Watermelon'],
    outliers: ['Strawberry', 'Raspberry', 'Blackberry', 'Cherry'],
  },
  {
    difficulty: 2,
    connection: 'Nocturnal animals',
    items: ['Bat', 'Owl', 'Raccoon', 'Hedgehog', 'Moth', 'Firefly'],
    outliers: ['Eagle', 'Squirrel', 'Butterfly', 'Robin', 'Deer'],
  },
  {
    difficulty: 2,
    connection: 'Countries that have won the FIFA World Cup',
    items: ['Brazil', 'Germany', 'Italy', 'Argentina', 'France', 'Uruguay'],
    outliers: ['Netherlands', 'Portugal', 'Belgium', 'Mexico', 'Sweden'],
  },
  {
    difficulty: 2,
    connection: 'US states that border Canada',
    items: ['Alaska', 'Washington', 'Montana', 'Michigan', 'New York', 'Maine'],
    outliers: ['Oregon', 'California', 'Wisconsin', 'Massachusetts'],
  },
  {
    difficulty: 2,
    connection: 'Animals that sleep standing up',
    items: ['Horse', 'Elephant', 'Giraffe', 'Flamingo', 'Cow'],
    outliers: ['Dog', 'Cat', 'Lion', 'Bear', 'Deer'],
  },
  {
    difficulty: 2,
    connection: 'Words from Arabic',
    items: ['Algebra', 'Algorithm', 'Coffee', 'Cotton', 'Magazine', 'Safari'],
    outliers: ['Yoga', 'Karma', 'Tsunami', 'Karate'],
  },
  {
    difficulty: 2,
    connection: 'Things measured in carats',
    items: ['Diamonds', 'Gold', 'Gemstones', 'Pearls'],
    outliers: ['Silver', 'Platinum', 'Carrots', 'Coal'],
  },
  {
    difficulty: 2,
    connection: 'Countries with more than one capital',
    items: ['South Africa', 'Bolivia', 'Netherlands', 'Sri Lanka'],
    outliers: ['USA', 'UK', 'Australia', 'Canada', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'James Bond actors',
    items: ['Connery', 'Moore', 'Brosnan', 'Craig', 'Dalton', 'Lazenby'],
    outliers: ['Clooney', 'Pitt', 'Cruise', 'Smith'],
  },
  {
    difficulty: 2,
    connection: 'US presidents on Mount Rushmore',
    items: ['Washington', 'Jefferson', 'Lincoln', 'Roosevelt'],
    outliers: ['Kennedy', 'Reagan', 'Obama', 'Adams'],
  },
  {
    difficulty: 2,
    connection: 'Greek letters used in math/science',
    items: ['Pi', 'Sigma', 'Delta', 'Omega', 'Alpha', 'Beta'],
    outliers: ['Zeta', 'Theta', 'Chi', 'Psi'],
  },
  {
    difficulty: 2,
    connection: 'Things with keys but no locks',
    items: ['Piano', 'Keyboard', 'Typewriter', 'Map'],
    outliers: ['Door', 'Safe', 'Diary', 'Chest'],
  },
  {
    difficulty: 2,
    connection: 'Movies where the dog dies',
    items: ['Marley & Me', 'Old Yeller', 'I Am Legend', 'John Wick'],
    outliers: ['Beethoven', '101 Dalmatians', 'Lady and the Tramp', 'Bolt'],
  },
  {
    difficulty: 2,
    connection: 'Countries with Union Jack in their flag',
    items: ['Australia', 'New Zealand', 'Fiji', 'Tuvalu'],
    outliers: ['Canada', 'India', 'South Africa', 'Jamaica'],
  },
  {
    difficulty: 2,
    connection: 'Animals with more than one heart',
    items: ['Octopus', 'Squid', 'Earthworm', 'Hagfish'],
    outliers: ['Whale', 'Spider', 'Crab', 'Starfish'],
  },
  {
    difficulty: 2,
    connection: 'Cities built on canals',
    items: ['Venice', 'Amsterdam', 'Bangkok', 'St. Petersburg'],
    outliers: ['Paris', 'London', 'Rome', 'Madrid'],
  },
  {
    difficulty: 2,
    connection: 'Pixar movies without human protagonists',
    items: ['Finding Nemo', 'Cars', "A Bug's Life", 'Ratatouille', 'WALL-E'],
    outliers: ['Toy Story', 'The Incredibles', 'Up', 'Coco'],
  },

  // ==================== HARD (Difficulty 3) ====================
  // Abstract, tricky, or require deeper thinking

  {
    difficulty: 3,
    connection: 'Words where all letters are in alphabetical order',
    items: ['Almost', 'Biopsy', 'Chimps', 'Forty', 'Ghost', 'Begins'],
    outliers: ['Always', 'Binary', 'Change', 'Fifty', 'Spirit', 'Begins'],
  },
  {
    difficulty: 3,
    connection: 'Words spelled the same backward (palindromes)',
    items: ['Radar', 'Level', 'Civic', 'Kayak', 'Rotor', 'Madam'],
    outliers: ['Radio', 'Lever', 'Civil', 'Canoe', 'Motor', 'Woman'],
  },
  {
    difficulty: 3,
    connection: 'US states with exactly four letters',
    items: ['Ohio', 'Iowa', 'Utah', 'Guam'],
    outliers: ['Idaho', 'Maine', 'Texas', 'Oregon', 'Alaska'],
  },
  {
    difficulty: 3,
    connection: 'Words containing all five vowels once',
    items: ['Education', 'Sequoia', 'Behaviour', 'Equation', 'Boundaries'],
    outliers: ['Beautiful', 'Euphoria', 'Audition', 'Tambourine'],
  },
  {
    difficulty: 3,
    connection: 'Films where the title character dies',
    items: ['Titanic', 'Gladiator', 'Braveheart', 'Logan', 'Scarface'],
    outliers: ['Avatar', 'Joker', 'Rocky', 'Batman', 'Rambo'],
  },
  {
    difficulty: 3,
    connection: 'Countries entirely within another country (enclaves)',
    items: ['Vatican', 'San Marino', 'Lesotho', 'Eswatini'],
    outliers: ['Monaco', 'Andorra', 'Luxembourg', 'Malta', 'Liechtenstein'],
  },
  {
    difficulty: 3,
    connection: 'Words that lose a letter and remain valid (planet→plant)',
    items: ['Planet', 'Scared', 'Pirate', 'Friend', 'Therapist'],
    outliers: ['Rocket', 'Afraid', 'Sailor', 'Cousin', 'Doctor'],
  },
  {
    difficulty: 3,
    connection: 'Things that have rings',
    items: ['Saturn', 'Tree', 'Phone', 'Onion', 'Olympic logo'],
    outliers: ['Moon', 'Flower', 'Radio', 'Garlic'],
  },
  {
    difficulty: 3,
    connection: 'Words where removing the first letter makes a new word',
    items: ['Scream', 'Braid', 'Ozone', 'Aplant', 'Glove'],
    outliers: ['Shout', 'Hair', 'Oxygen', 'Tree'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be broken without touching',
    items: ['Promise', 'Silence', 'Record', 'Heart', 'News'],
    outliers: ['Glass', 'Bone', 'Window', 'Egg'],
  },
  {
    difficulty: 3,
    connection: 'Words where you can remove letters one at a time and always have a word',
    items: ['Starting', 'Splatters', 'Tramps', 'Shrimp'],
    outliers: ['Beginning', 'Splashes', 'Walking', 'Lobster'],
  },
  {
    difficulty: 3,
    connection: 'Things with necks but no heads',
    items: ['Bottle', 'Guitar', 'Shirt', 'Vase'],
    outliers: ['Giraffe', 'Swan', 'Snake', 'Lamp'],
  },
  {
    difficulty: 3,
    connection: 'Compound words where both parts are body parts',
    items: ['Eyebrow', 'Kneecap', 'Fingernail', 'Eyelid', 'Thumbnail'],
    outliers: ['Headache', 'Backpack', 'Footprint', 'Handstand'],
  },
  {
    difficulty: 3,
    connection: 'Words that become their opposite when you add UN-',
    items: ['Lock', 'Do', 'Tie', 'Fold', 'Wrap'],
    outliers: ['Happy', 'Usual', 'Clear', 'Sure'],
  },
  {
    difficulty: 3,
    connection: 'Units of measurement named after people',
    items: ['Watt', 'Volt', 'Ampere', 'Ohm', 'Kelvin', 'Newton', 'Joule', 'Hertz'],
    outliers: ['Meter', 'Gram', 'Liter', 'Second', 'Mile'],
  },
  {
    difficulty: 3,
    connection: 'Countries whose names end in -land',
    items: ['Finland', 'Poland', 'Ireland', 'Thailand', 'Switzerland', 'Iceland'],
    outliers: ['Norway', 'Sweden', 'Denmark', 'Austria'],
  },
  {
    difficulty: 3,
    connection: 'Words that are shorter in the past tense',
    items: ['Cut', 'Put', 'Hurt', 'Shut', 'Split'],
    outliers: ['Walk', 'Talk', 'Jump', 'Run'],
  },
  {
    difficulty: 3,
    connection: "Elements whose symbols don't match their English names",
    items: ['Gold', 'Silver', 'Lead', 'Iron', 'Sodium', 'Potassium'],
    outliers: ['Oxygen', 'Carbon', 'Nitrogen', 'Hydrogen'],
  },
  {
    difficulty: 3,
    connection: "Things that have beds but you can't sleep in",
    items: ['River', 'Garden', 'Truck', 'Hospital', 'Nail'],
    outliers: ['Bedroom', 'Hotel', 'Mattress', 'Couch'],
  },
  {
    difficulty: 3,
    connection: 'Words where Q is not followed by U',
    items: ['Qatar', 'Qigong', 'Qat', 'Qi', 'Qoph'],
    outliers: ['Queen', 'Quick', 'Quiet', 'Quote'],
  },
  {
    difficulty: 3,
    connection: 'Numbers that are spelled with letters in alphabetical order',
    items: ['Forty', 'Sixty', 'Eighty'],
    outliers: ['Twenty', 'Thirty', 'Fifty', 'Seventy'],
  },
  {
    difficulty: 3,
    connection: 'Movies with numbers in the title that are sequels but not that number sequel',
    items: ["Ocean's Eleven", 'Apollo 13', '21 Jump Street', 'The Magnificent Seven'],
    outliers: ['Rocky 2', 'Toy Story 3', 'Home Alone 2', 'Shrek 2'],
  },
  {
    difficulty: 3,
    connection: "Things that can run but can't walk",
    items: ['River', 'Nose', 'Refrigerator', 'Stocking', 'Software'],
    outliers: ['Dog', 'Human', 'Horse', 'Cheetah'],
  },
  {
    difficulty: 3,
    connection: 'Colors that are also fruits',
    items: ['Orange', 'Peach', 'Plum', 'Lime', 'Tangerine'],
    outliers: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
  },
  {
    difficulty: 3,
    connection: "Things that have teeth but can't bite",
    items: ['Comb', 'Saw', 'Zipper', 'Gear', 'Rake'],
    outliers: ['Dog', 'Shark', 'Lion', 'Snake'],
  },
  {
    difficulty: 3,
    connection: 'Words spelled with Roman numerals',
    items: ['MIX', 'LID', 'CIVIL', 'MILD', 'LIVID'],
    outliers: ['MAX', 'LIP', 'CIVIC', 'WILD', 'VIVID'],
  },
  {
    difficulty: 3,
    connection: "Things that have legs but can't walk",
    items: ['Table', 'Chair', 'Pants', 'Tripod', 'Journey'],
    outliers: ['Spider', 'Dog', 'Centipede', 'Chicken'],
  },
  {
    difficulty: 3,
    connection: "Collective nouns that don't match the animal",
    items: [
      'Murder of crows',
      'Parliament of owls',
      'Conspiracy of lemurs',
      'Unkindness of ravens',
    ],
    outliers: ['Pack of wolves', 'Herd of elephants', 'School of fish', 'Flock of birds'],
  },
  {
    difficulty: 3,
    connection: 'Words that contain three consecutive letters of the alphabet',
    items: ['Defog', 'Hijack', 'Laughing', 'Overstuffed', 'Underground'],
    outliers: ['Alphabet', 'Letters', 'Sequence', 'Triple'],
  },
  {
    difficulty: 3,
    connection: 'US states that are also common first names',
    items: ['Georgia', 'Virginia', 'Carolina', 'Dakota', 'Montana'],
    outliers: ['Texas', 'Florida', 'Alaska', 'Ohio'],
  },
  {
    difficulty: 3,
    connection: 'Things that have banks but no money',
    items: ['River', 'Blood', 'Snow', 'Memory', 'Cloud'],
    outliers: ['Savings', 'Investment', 'Checking', 'Vault'],
  },
  {
    difficulty: 3,
    connection: 'Words where doubling a letter changes pronunciation',
    items: ['Diner/Dinner', 'Super/Supper', 'Later/Latter', 'Coma/Comma'],
    outliers: ['Book/Boo', 'Moon/Moo', 'Cool/Co', 'Food/Foo'],
  },
  {
    difficulty: 3,
    connection: "Things that have tongues but can't taste",
    items: ['Shoe', 'Fire', 'Bell', 'Wagon', 'Balance'],
    outliers: ['Human', 'Cat', 'Dog', 'Snake'],
  },
  {
    difficulty: 3,
    connection: 'Movies where the main character is already dead',
    items: ['The Sixth Sense', 'Coco', 'Ghost', 'Beetlejuice'],
    outliers: ['The Departed', 'Seven', 'Final Destination', 'The Ring'],
  },
  {
    difficulty: 3,
    connection: "Things that have shells but aren't animals",
    items: ['Company', 'Bullet', 'Taco', 'Building', 'Game'],
    outliers: ['Turtle', 'Crab', 'Snail', 'Clam'],
  },
  {
    difficulty: 3,
    connection: 'Things with crowns but not royalty',
    items: ['Tooth', 'Tree', 'Hat', 'Watch', 'Bowling pin'],
    outliers: ['King', 'Queen', 'Prince', 'Princess'],
  },
  {
    difficulty: 3,
    connection: 'Words that sound the same but have opposite meanings when spelled differently',
    items: ['Raise/Raze', 'Complement/Compliment', 'Waive/Wave', 'Flair/Flare'],
    outliers: ['Their/There', 'To/Too', "Your/You're", "Its/It's"],
  },
  {
    difficulty: 3,
    connection: 'Things that can be full and empty at the same time',
    items: ['Glass', 'Moon', 'Stomach', 'Room', 'Tank'],
    outliers: ['Balloon', 'Box', 'Bag', 'Bucket'],
  },
  {
    difficulty: 3,
    connection: 'English words from Hindi/Urdu',
    items: ['Jungle', 'Shampoo', 'Pajamas', 'Bungalow', 'Thug', 'Loot'],
    outliers: ['Safari', 'Yoga', 'Tsunami', 'Karate'],
  },
  {
    difficulty: 3,
    connection: 'Sports played on horseback',
    items: ['Polo', 'Horseball', 'Buzkashi', 'Tent pegging'],
    outliers: ['Racing', 'Jumping', 'Dressage', 'Rodeo'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have changed their name',
    items: ['Myanmar', 'Iran', 'Thailand', 'Sri Lanka', 'Zimbabwe'],
    outliers: ['India', 'China', 'Japan', 'Egypt'],
  },
  {
    difficulty: 3,
    connection: "Things that can be pitched but aren't baseballs",
    items: ['Tent', 'Idea', 'Voice', 'Roof', 'Sale'],
    outliers: ['Ball', 'Strike', 'Curve', 'Fast'],
  },
  {
    difficulty: 3,
    connection: 'Words with silent K',
    items: ['Knight', 'Knife', 'Knock', 'Know', 'Knee', 'Knot'],
    outliers: ['King', 'Kitchen', 'Keep', 'Kind'],
  },
  {
    difficulty: 3,
    connection: 'Animals whose names are also verbs',
    items: ['Duck', 'Fish', 'Parrot', 'Badger', 'Wolf', 'Buffalo'],
    outliers: ['Lion', 'Tiger', 'Elephant', 'Giraffe'],
  },
  {
    difficulty: 3,
    connection: 'Capital cities named after people',
    items: ['Washington', 'Lincoln', 'Tegucigalpa', 'Freetown', 'Colombo'],
    outliers: ['Paris', 'London', 'Tokyo', 'Berlin'],
  },
  {
    difficulty: 3,
    connection: 'Things that get wetter as they dry',
    items: ['Towel', 'Sponge', 'Paper towel', 'Cloth'],
    outliers: ['Hair', 'Clothes', 'Paint', 'Cement'],
  },
  {
    difficulty: 3,
    connection: 'Words where PH sounds like F',
    items: ['Phone', 'Phantom', 'Photo', 'Philosophy', 'Phrase'],
    outliers: ['Shepherd', 'Uphill', 'Loophole', 'Pothole'],
  },
  {
    difficulty: 3,
    connection: 'Animals in Chinese zodiac',
    items: [
      'Rat',
      'Ox',
      'Tiger',
      'Dragon',
      'Snake',
      'Horse',
      'Goat',
      'Monkey',
      'Rooster',
      'Dog',
      'Pig',
      'Rabbit',
    ],
    outliers: ['Cat', 'Bear', 'Lion', 'Wolf', 'Elephant'],
  },

  // ==================== ADDITIONAL EASY (Difficulty 1) ====================

  {
    difficulty: 1,
    connection: 'Disney Princesses',
    items: ['Cinderella', 'Ariel', 'Belle', 'Jasmine', 'Mulan', 'Tiana', 'Rapunzel', 'Moana'],
    outliers: ['Elsa', 'Tinker Bell', 'Alice', 'Wendy'],
  },
  {
    difficulty: 1,
    connection: 'Chess pieces',
    items: ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'],
    outliers: ['Ace', 'Joker', 'Jack', 'Dice'],
  },
  {
    difficulty: 1,
    connection: 'Marvel Avengers (original)',
    items: ['Iron Man', 'Thor', 'Hulk', 'Captain America', 'Black Widow', 'Hawkeye'],
    outliers: ['Spider-Man', 'Wolverine', 'Deadpool', 'Venom'],
  },
  {
    difficulty: 1,
    connection: 'Fast food chains',
    items: ["McDonald's", 'Burger King', "Wendy's", 'KFC', 'Taco Bell', 'Subway'],
    outliers: ['Olive Garden', "Applebee's", "Denny's", 'Cheesecake Factory'],
  },
  {
    difficulty: 1,
    connection: 'Social media platforms',
    items: ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'Snapchat', 'LinkedIn'],
    outliers: ['Google', 'Amazon', 'Netflix', 'Spotify'],
  },
  {
    difficulty: 1,
    connection: 'Harry Potter books',
    items: ["Sorcerer's Stone", 'Chamber of Secrets', 'Prisoner of Azkaban', 'Goblet of Fire'],
    outliers: ['Lord of the Rings', 'Narnia', 'Hunger Games', 'Twilight'],
  },
  {
    difficulty: 1,
    connection: 'Types of pasta',
    items: ['Spaghetti', 'Penne', 'Fettuccine', 'Rigatoni', 'Linguine', 'Macaroni'],
    outliers: ['Rice', 'Couscous', 'Quinoa', 'Bread'],
  },
  {
    difficulty: 1,
    connection: 'Pixar movies',
    items: ['Toy Story', 'Finding Nemo', 'The Incredibles', 'WALL-E', 'Up', 'Coco'],
    outliers: ['Shrek', 'Frozen', 'Minions', 'Moana'],
  },
  {
    difficulty: 1,
    connection: 'Types of dogs',
    items: ['Labrador', 'Poodle', 'Bulldog', 'Beagle', 'Husky', 'Golden Retriever'],
    outliers: ['Persian', 'Siamese', 'Tabby', 'Maine Coon'],
  },
  {
    difficulty: 1,
    connection: 'Musical instruments in an orchestra',
    items: ['Violin', 'Cello', 'Flute', 'Trumpet', 'Clarinet', 'Trombone'],
    outliers: ['Guitar', 'Drums', 'Banjo', 'Ukulele'],
  },
  {
    difficulty: 1,
    connection: 'Types of coffee drinks',
    items: ['Espresso', 'Latte', 'Cappuccino', 'Americano', 'Mocha', 'Macchiato'],
    outliers: ['Tea', 'Hot Chocolate', 'Smoothie', 'Juice'],
  },
  {
    difficulty: 1,
    connection: 'Countries in South America',
    items: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela'],
    outliers: ['Mexico', 'Spain', 'Portugal', 'Cuba'],
  },
  {
    difficulty: 1,
    connection: 'Fruits with pits/stones',
    items: ['Peach', 'Cherry', 'Plum', 'Apricot', 'Mango', 'Avocado'],
    outliers: ['Apple', 'Banana', 'Orange', 'Grape'],
  },
  {
    difficulty: 1,
    connection: 'Types of sharks',
    items: ['Great White', 'Hammerhead', 'Tiger', 'Bull', 'Whale Shark', 'Mako'],
    outliers: ['Dolphin', 'Whale', 'Orca', 'Seal'],
  },
  {
    difficulty: 1,
    connection: 'Friends TV show characters',
    items: ['Rachel', 'Monica', 'Phoebe', 'Ross', 'Chandler', 'Joey'],
    outliers: ['Jerry', 'Elaine', 'George', 'Kramer'],
  },
  {
    difficulty: 1,
    connection: 'Types of cheese',
    items: ['Cheddar', 'Mozzarella', 'Parmesan', 'Brie', 'Gouda', 'Swiss'],
    outliers: ['Butter', 'Yogurt', 'Cream', 'Milk'],
  },
  {
    difficulty: 1,
    connection: 'Bones in the human body',
    items: ['Femur', 'Tibia', 'Humerus', 'Skull', 'Pelvis', 'Spine'],
    outliers: ['Heart', 'Liver', 'Kidney', 'Lung'],
  },
  {
    difficulty: 1,
    connection: 'Countries in Europe',
    items: ['France', 'Germany', 'Italy', 'Spain', 'Poland', 'Greece'],
    outliers: ['Turkey', 'Russia', 'Egypt', 'Morocco'],
  },
  {
    difficulty: 1,
    connection: 'NFL teams',
    items: ['Patriots', 'Cowboys', 'Packers', '49ers', 'Steelers', 'Eagles'],
    outliers: ['Yankees', 'Lakers', 'Red Sox', 'Celtics'],
  },
  {
    difficulty: 1,
    connection: 'Breakfast cereals',
    items: ['Cheerios', 'Frosted Flakes', 'Froot Loops', 'Lucky Charms', 'Corn Flakes'],
    outliers: ['Pop-Tarts', 'Toast', 'Bagel', 'Pancake'],
  },
  {
    difficulty: 1,
    connection: 'Types of clouds',
    items: ['Cumulus', 'Stratus', 'Cirrus', 'Nimbus', 'Cumulonimbus'],
    outliers: ['Rain', 'Snow', 'Fog', 'Hail'],
  },
  {
    difficulty: 1,
    connection: 'The Simpsons family members',
    items: ['Homer', 'Marge', 'Bart', 'Lisa', 'Maggie'],
    outliers: ['Peter', 'Lois', 'Stewie', 'Brian'],
  },
  {
    difficulty: 1,
    connection: 'Types of wine',
    items: ['Chardonnay', 'Merlot', 'Cabernet', 'Pinot Noir', 'Riesling', 'Sauvignon Blanc'],
    outliers: ['Beer', 'Vodka', 'Whiskey', 'Rum'],
  },
  {
    difficulty: 1,
    connection: 'Planets with rings',
    items: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'],
    outliers: ['Mars', 'Venus', 'Earth', 'Mercury'],
  },
  {
    difficulty: 1,
    connection: 'Monopoly railroad spaces',
    items: ['Reading Railroad', 'Pennsylvania Railroad', 'B&O Railroad', 'Short Line'],
    outliers: ['Boardwalk', 'Park Place', 'Go', 'Jail'],
  },
  {
    difficulty: 1,
    connection: 'Types of trees',
    items: ['Oak', 'Maple', 'Pine', 'Birch', 'Willow', 'Cedar'],
    outliers: ['Rose', 'Tulip', 'Daisy', 'Sunflower'],
  },
  {
    difficulty: 1,
    connection: 'NBA teams',
    items: ['Lakers', 'Celtics', 'Bulls', 'Heat', 'Warriors', 'Knicks'],
    outliers: ['Yankees', 'Cowboys', 'Patriots', 'Red Sox'],
  },
  {
    difficulty: 1,
    connection: 'Star Wars characters',
    items: ['Luke', 'Leia', 'Han Solo', 'Darth Vader', 'Yoda', 'Obi-Wan'],
    outliers: ['Spock', 'Kirk', 'Picard', 'Data'],
  },
  {
    difficulty: 1,
    connection: 'Types of flowers',
    items: ['Rose', 'Tulip', 'Daisy', 'Sunflower', 'Lily', 'Orchid'],
    outliers: ['Oak', 'Maple', 'Pine', 'Fern'],
  },
  {
    difficulty: 1,
    connection: 'Seinfeld characters',
    items: ['Jerry', 'George', 'Elaine', 'Kramer', 'Newman'],
    outliers: ['Ross', 'Rachel', 'Monica', 'Chandler'],
  },
  {
    difficulty: 1,
    connection: 'Types of bread',
    items: ['Sourdough', 'Baguette', 'Rye', 'Ciabatta', 'Brioche', 'Focaccia'],
    outliers: ['Cake', 'Cookie', 'Muffin', 'Donut'],
  },
  {
    difficulty: 1,
    connection: 'Countries in Asia',
    items: ['China', 'Japan', 'India', 'Thailand', 'Vietnam', 'Korea'],
    outliers: ['Australia', 'Brazil', 'Egypt', 'Mexico'],
  },

  // ==================== ADDITIONAL MEDIUM (Difficulty 2) ====================

  {
    difficulty: 2,
    connection: 'Countries that have never won an Olympic gold medal',
    items: ['Monaco', 'Liechtenstein', 'Bangladesh', 'Nepal'],
    outliers: ['Jamaica', 'Kenya', 'Cuba', 'Ethiopia'],
  },
  {
    difficulty: 2,
    connection: 'Companies older than 100 years',
    items: ['Coca-Cola', 'Ford', 'GE', 'IBM', "Kellogg's", 'Johnson & Johnson'],
    outliers: ['Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla'],
  },
  {
    difficulty: 2,
    connection: 'Countries with blue and white flags only',
    items: ['Greece', 'Finland', 'Israel', 'Scotland', 'Honduras'],
    outliers: ['France', 'USA', 'UK', 'Italy'],
  },
  {
    difficulty: 2,
    connection: 'Words borrowed from German',
    items: ['Kindergarten', 'Doppelganger', 'Zeitgeist', 'Wanderlust', 'Poltergeist'],
    outliers: ['Croissant', 'Café', 'Piano', 'Karaoke'],
  },
  {
    difficulty: 2,
    connection: 'Movies that take place in one day',
    items: ["Ferris Bueller's Day Off", 'Die Hard', '12 Angry Men', 'Training Day'],
    outliers: ['Forrest Gump', 'The Godfather', 'Titanic', 'Avatar'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are technically fruits',
    items: ['Tomato', 'Cucumber', 'Pepper', 'Eggplant', 'Zucchini', 'Pumpkin'],
    outliers: ['Carrot', 'Potato', 'Onion', 'Broccoli'],
  },
  {
    difficulty: 2,
    connection: "Cities that hosted World's Fairs",
    items: ['Paris', 'Chicago', 'New York', 'Montreal', 'Osaka', 'Seattle'],
    outliers: ['London', 'Tokyo', 'Berlin', 'Rome'],
  },
  {
    difficulty: 2,
    connection: 'Companies that started selling something different',
    items: ['Amazon', 'Nokia', 'Nintendo', 'Samsung', 'Tiffany'],
    outliers: ['Microsoft', 'Apple', 'Google', 'IBM'],
  },
  {
    difficulty: 2,
    connection: 'Countries with constitutional monarchies',
    items: ['UK', 'Japan', 'Sweden', 'Spain', 'Netherlands', 'Belgium'],
    outliers: ['USA', 'France', 'Germany', 'Italy'],
  },
  {
    difficulty: 2,
    connection: 'Animals that mate for life',
    items: ['Swan', 'Wolf', 'Penguin', 'Albatross', 'Eagle', 'Beaver'],
    outliers: ['Lion', 'Deer', 'Rabbit', 'Mouse'],
  },
  {
    difficulty: 2,
    connection: 'Foods named after real people',
    items: ['Caesar Salad', 'Beef Wellington', 'Eggs Benedict', 'Pavlova'],
    outliers: ['Hot Dog', 'Hamburger', 'French Fries', 'Pizza'],
  },
  {
    difficulty: 2,
    connection: 'Languages with over 100 million native speakers',
    items: ['Mandarin', 'Spanish', 'English', 'Hindi', 'Arabic', 'Portuguese'],
    outliers: ['French', 'German', 'Italian', 'Dutch'],
  },
  {
    difficulty: 2,
    connection: 'Islands that are countries',
    items: ['Japan', 'Iceland', 'Madagascar', 'Cuba', 'Jamaica', 'Philippines'],
    outliers: ['Hawaii', 'Greenland', 'Puerto Rico', 'Bermuda'],
  },
  {
    difficulty: 2,
    connection: 'Directors who appear in their own films',
    items: ['Hitchcock', 'Tarantino', 'M. Night Shyamalan', 'Spike Lee', 'Peter Jackson'],
    outliers: ['Spielberg', 'Nolan', 'Scorsese', 'Kubrick'],
  },
  {
    difficulty: 2,
    connection: 'Animals with blue blood',
    items: ['Horseshoe crab', 'Octopus', 'Squid', 'Lobster', 'Snail'],
    outliers: ['Human', 'Dog', 'Fish', 'Bird'],
  },
  {
    difficulty: 2,
    connection: 'US states that share a border with Mexico',
    items: ['California', 'Arizona', 'New Mexico', 'Texas'],
    outliers: ['Nevada', 'Utah', 'Colorado', 'Florida'],
  },
  {
    difficulty: 2,
    connection: 'Colors in a crayon box of 8',
    items: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Brown', 'Black'],
    outliers: ['Pink', 'Gray', 'White', 'Tan'],
  },
  {
    difficulty: 2,
    connection: 'Things invented by accident',
    items: ['Penicillin', 'Microwave', 'Post-it Notes', 'X-rays', 'Velcro'],
    outliers: ['Light bulb', 'Telephone', 'Computer', 'Television'],
  },
  {
    difficulty: 2,
    connection: 'Rivers that flow through multiple countries',
    items: ['Danube', 'Nile', 'Amazon', 'Rhine', 'Mekong', 'Ganges'],
    outliers: ['Mississippi', 'Thames', 'Seine', 'Hudson'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are blue naturally',
    items: ['Blueberry', 'Blue corn', 'Butterfly pea flower', 'Elderberry'],
    outliers: ['Blue cheese', 'Blue raspberry', 'Blue candy', 'Blue frosting'],
  },
  {
    difficulty: 2,
    connection: 'Countries that use the Euro',
    items: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Portugal'],
    outliers: ['UK', 'Sweden', 'Poland', 'Denmark'],
  },
  {
    difficulty: 2,
    connection: 'Movies with twist endings',
    items: ['The Sixth Sense', 'Fight Club', 'The Usual Suspects', 'Saw', 'Shutter Island'],
    outliers: ['Titanic', 'Forrest Gump', 'The Godfather', 'Jaws'],
  },
  {
    difficulty: 2,
    connection: 'Animals with exoskeletons',
    items: ['Crab', 'Lobster', 'Beetle', 'Scorpion', 'Shrimp', 'Ant'],
    outliers: ['Turtle', 'Armadillo', 'Snail', 'Pangolin'],
  },
  {
    difficulty: 2,
    connection: 'Brands owned by Disney',
    items: ['Marvel', 'Pixar', 'Lucasfilm', 'ESPN', 'ABC', 'Hulu'],
    outliers: ['Warner Bros', 'Universal', 'Paramount', 'Netflix'],
  },
  {
    difficulty: 2,
    connection: 'Capital cities on rivers',
    items: ['London', 'Paris', 'Rome', 'Cairo', 'Vienna', 'Budapest'],
    outliers: ['Madrid', 'Athens', 'Canberra', 'Mexico City'],
  },
  {
    difficulty: 2,
    connection: 'US states that touch the Pacific Ocean',
    items: ['California', 'Oregon', 'Washington', 'Alaska', 'Hawaii'],
    outliers: ['Nevada', 'Arizona', 'Utah', 'Idaho'],
  },
  {
    difficulty: 2,
    connection: 'Things that can be stuffed',
    items: ['Turkey', 'Pepper', 'Olive', 'Mushroom', 'Toy', 'Envelope'],
    outliers: ['Steak', 'Soup', 'Salad', 'Smoothie'],
  },
  {
    difficulty: 2,
    connection: 'Countries with populations over 200 million',
    items: ['China', 'India', 'USA', 'Indonesia', 'Pakistan', 'Brazil'],
    outliers: ['Japan', 'Germany', 'UK', 'France'],
  },
  {
    difficulty: 2,
    connection: 'Films based on Stephen King novels',
    items: ['The Shining', 'It', 'Carrie', 'Misery', 'Stand By Me', 'The Green Mile'],
    outliers: ['Jaws', 'Jurassic Park', 'The Exorcist', 'Psycho'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can regenerate body parts',
    items: ['Starfish', 'Salamander', 'Lizard', 'Sea cucumber', 'Worm'],
    outliers: ['Snake', 'Frog', 'Turtle', 'Fish'],
  },
  {
    difficulty: 2,
    connection: 'Things measured in decibels',
    items: ['Sound', 'Noise', 'Music', 'Thunder', 'Whisper'],
    outliers: ['Light', 'Heat', 'Pressure', 'Speed'],
  },
  {
    difficulty: 2,
    connection: 'Companies headquartered in Seattle',
    items: ['Amazon', 'Starbucks', 'Microsoft', 'Costco', 'Nordstrom'],
    outliers: ['Apple', 'Google', 'Nike', 'Intel'],
  },
  {
    difficulty: 2,
    connection: 'Countries with four official languages or more',
    items: ['Switzerland', 'Singapore', 'Belgium', 'South Africa'],
    outliers: ['Canada', 'India', 'USA', 'UK'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can see ultraviolet light',
    items: ['Bee', 'Butterfly', 'Reindeer', 'Goldfish', 'Bird'],
    outliers: ['Human', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Movies set in space',
    items: ['Gravity', 'Interstellar', 'Alien', '2001: A Space Odyssey', 'Apollo 13'],
    outliers: ['Avatar', 'Jurassic Park', 'Jaws', 'Titanic'],
  },
  {
    difficulty: 2,
    connection: 'Countries that have hosted the FIFA World Cup',
    items: ['Brazil', 'Germany', 'France', 'Mexico', 'USA', 'Japan'],
    outliers: ['Portugal', 'Netherlands', 'Belgium', 'Denmark'],
  },
  {
    difficulty: 2,
    connection: 'Things that are measured in Fahrenheit in the US',
    items: ['Body temperature', 'Weather', 'Oven', 'Pool water'],
    outliers: ['Distance', 'Weight', 'Time', 'Volume'],
  },
  {
    difficulty: 2,
    connection: 'Animals with pouches other than marsupials',
    items: ['Pelican', 'Hamster', 'Chipmunk', 'Sea horse'],
    outliers: ['Kangaroo', 'Koala', 'Opossum', 'Wombat'],
  },
  {
    difficulty: 2,
    connection: 'Countries with distinctive shapes people recognize',
    items: ['Italy', 'Chile', 'Japan', 'Vietnam'],
    outliers: ['France', 'Spain', 'Germany', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Musicians who have won an EGOT',
    items: ['John Legend', 'Audrey Hepburn', 'Whoopi Goldberg', 'Mel Brooks'],
    outliers: ['Beyoncé', 'Taylor Swift', 'Madonna', 'Michael Jackson'],
  },

  // ==================== ADDITIONAL HARD (Difficulty 3) ====================

  {
    difficulty: 3,
    connection: 'Words that are their own antonyms (contronyms)',
    items: ['Dust', 'Sanction', 'Cleave', 'Bolt', 'Trim', 'Weather'],
    outliers: ['Clean', 'Allow', 'Split', 'Run'],
  },
  {
    difficulty: 3,
    connection: "Things that have eyes but can't see",
    items: ['Potato', 'Needle', 'Hurricane', 'Peacock feather'],
    outliers: ['Owl', 'Eagle', 'Hawk', 'Cat'],
  },
  {
    difficulty: 3,
    connection: 'Countries whose names end in -stan',
    items: ['Pakistan', 'Afghanistan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan'],
    outliers: ['Iran', 'Iraq', 'India', 'Turkey'],
  },
  {
    difficulty: 3,
    connection: 'Words that double their last letter before -ing',
    items: ['Run', 'Swim', 'Cut', 'Hit', 'Sit', 'Stop'],
    outliers: ['Walk', 'Talk', 'Jump', 'Read'],
  },
  {
    difficulty: 3,
    connection: 'Things you can draw but not physically hold',
    items: ['Conclusion', 'Breath', 'Bath', 'Attention', 'Blank'],
    outliers: ['Picture', 'Circle', 'Line', 'Shape'],
  },
  {
    difficulty: 3,
    connection: 'Songs that are also movie titles',
    items: ['Purple Rain', 'Footloose', 'Fame', 'Grease', 'Flashdance'],
    outliers: ['Thriller', 'Imagine', 'Yesterday', 'Hello'],
  },
  {
    difficulty: 3,
    connection: 'Things measured in knots',
    items: ['Wind speed', 'Ship speed', 'Aircraft speed', 'Current speed'],
    outliers: ['Car speed', 'Running speed', 'Light speed', 'Sound speed'],
  },
  {
    difficulty: 3,
    connection: "English words with two U's",
    items: ['Vacuum', 'Continuum', 'Residuum', 'Menstruum'],
    outliers: ['Unusual', 'Unit', 'Umbrella', 'Utensil'],
  },
  {
    difficulty: 3,
    connection: 'Cities that span two continents',
    items: ['Istanbul', 'Atyrau', 'Orenburg', 'Magnitogorsk'],
    outliers: ['Athens', 'Rome', 'Paris', 'London', 'Cairo'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be broken but never held',
    items: ['Promise', 'Record', 'News', 'Silence', 'Dawn'],
    outliers: ['Glass', 'Bone', 'Egg', 'Plate'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can pause their pregnancies',
    items: ['Kangaroo', 'Bear', 'Armadillo', 'Badger', 'Seal'],
    outliers: ['Dog', 'Cat', 'Elephant', 'Horse'],
  },
  {
    difficulty: 3,
    connection: 'Words where all vowels appear exactly once in order',
    items: ['Facetious', 'Abstemious', 'Arsenious', 'Acheilous'],
    outliers: ['Education', 'Sequoia', 'Beautiful', 'Equation'],
  },
  {
    difficulty: 3,
    connection: 'Things that travel but stay in one place',
    items: ['Stamp', 'Road', 'Stairs', 'News', 'Time'],
    outliers: ['Car', 'Bird', 'Ball', 'Person'],
  },
  {
    difficulty: 3,
    connection: 'Countries with no airports',
    items: ['Vatican City', 'San Marino', 'Liechtenstein', 'Andorra', 'Monaco'],
    outliers: ['Luxembourg', 'Malta', 'Iceland', 'Cyprus'],
  },
  {
    difficulty: 3,
    connection: 'Words with double letters appearing twice',
    items: ['Committee', 'Tennessee', 'Mississippi', 'Balloon', 'Raccoon', 'Coffee'],
    outliers: ['Banana', 'Letter', 'Better', 'Common'],
  },
  {
    difficulty: 3,
    connection: 'Things with faces but no body',
    items: ['Clock', 'Coin', 'Mountain', 'Card', 'Building'],
    outliers: ['Human', 'Animal', 'Robot', 'Doll'],
  },
  {
    difficulty: 3,
    connection: "Animals that don't drink water",
    items: ['Koala', 'Kangaroo rat', 'Thorny devil', 'Sand gazelle'],
    outliers: ['Camel', 'Elephant', 'Horse', 'Dog'],
  },
  {
    difficulty: 3,
    connection: 'Foods that were once used as currency',
    items: ['Salt', 'Tea', 'Cocoa beans', 'Peppercorns', 'Cheese'],
    outliers: ['Gold', 'Silver', 'Coins', 'Shells'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be caught but not thrown',
    items: ['Cold', 'Fire', 'Breath', 'Glimpse', 'Drift'],
    outliers: ['Ball', 'Frisbee', 'Boomerang', 'Rock'],
  },
  {
    difficulty: 3,
    connection: 'US presidents who died in office',
    items: ['Lincoln', 'Kennedy', 'McKinley', 'Garfield', 'Harrison', 'FDR'],
    outliers: ['Nixon', 'Clinton', 'Reagan', 'Obama'],
  },
  {
    difficulty: 3,
    connection: 'Words that change pronunciation when capitalized',
    items: ['Polish', 'August', 'Job', 'Nice', 'Rainier'],
    outliers: ['Apple', 'London', 'March', 'Paris'],
  },
  {
    difficulty: 3,
    connection: 'Things with a spine but no bones',
    items: ['Book', 'Cactus', 'Porcupine', 'Hedgehog'],
    outliers: ['Human', 'Dog', 'Fish', 'Snake'],
  },
  {
    difficulty: 3,
    connection: 'Countries with non-rectangular flags',
    items: ['Nepal', 'Switzerland', 'Vatican City', 'Ohio'],
    outliers: ['Japan', 'Canada', 'Brazil', 'UK', 'France'],
  },
  {
    difficulty: 3,
    connection: 'Things that have heads but no hair',
    items: ['Nail', 'Pin', 'Cabbage', 'Lettuce', 'Bed', 'Coin'],
    outliers: ['Human', 'Lion', 'Dog', 'Cat'],
  },
  {
    difficulty: 3,
    connection: 'Words spelled with only letters from the first half of the alphabet',
    items: ['Cabbage', 'Facade', 'Defaced', 'Decade', 'Beige'],
    outliers: ['Alphabet', 'Normal', 'Simple', 'Words'],
  },
  {
    difficulty: 3,
    connection: 'Animals whose young have different names',
    items: ['Cow', 'Deer', 'Goose', 'Sheep', 'Swan', 'Kangaroo'],
    outliers: ['Dog', 'Cat', 'Lion', 'Tiger'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be kept but not returned',
    items: ['Secret', 'Promise', 'Score', 'Time', 'Faith'],
    outliers: ['Book', 'Money', 'Gift', 'Item'],
  },
  {
    difficulty: 3,
    connection: 'Actors who played multiple Marvel characters',
    items: ['Chris Evans', 'Michael B. Jordan', 'Gemma Chan', 'Michelle Yeoh'],
    outliers: ['Robert Downey Jr.', 'Chris Hemsworth', 'Scarlett Johansson'],
  },
  {
    difficulty: 3,
    connection: 'Words that become plural without adding S',
    items: ['Sheep', 'Deer', 'Fish', 'Moose', 'Aircraft'],
    outliers: ['Dog', 'Cat', 'Car', 'House'],
  },
  {
    difficulty: 3,
    connection: 'Things that fall but never get hurt',
    items: ['Rain', 'Snow', 'Night', 'Temperature', 'Leaves'],
    outliers: ['Person', 'Cat', 'Ball', 'Plate'],
  },
  {
    difficulty: 3,
    connection: 'Countries with more than 100 islands',
    items: ['Indonesia', 'Philippines', 'Japan', 'Finland', 'Sweden'],
    outliers: ['UK', 'Australia', 'New Zealand', 'Italy'],
  },
  {
    difficulty: 3,
    connection: 'Things with branches but no trees',
    items: ['Bank', 'Government', 'Library', 'River', 'Family'],
    outliers: ['Oak', 'Pine', 'Maple', 'Forest'],
  },
  {
    difficulty: 3,
    connection: 'Words where Y is the only vowel',
    items: ['Gym', 'Myth', 'Lynx', 'Rhythm', 'Glyph', 'Crypt'],
    outliers: ['Yes', 'Yellow', 'Yoga', 'Year'],
  },
  {
    difficulty: 3,
    connection: 'Foods classified as both fruit and vegetable',
    items: ['Tomato', 'Rhubarb', 'Pepper', 'Cucumber', 'Squash'],
    outliers: ['Apple', 'Carrot', 'Broccoli', 'Orange'],
  },
  {
    difficulty: 3,
    connection: "Things that have bark but aren't dogs",
    items: ['Tree', 'Cinnamon', 'Cork', 'Birch'],
    outliers: ['Wolf', 'Fox', 'Seal', 'Coyote'],
  },
  {
    difficulty: 3,
    connection: 'US states named after English kings or queens',
    items: ['Georgia', 'Virginia', 'Maryland', 'Carolina'],
    outliers: ['Washington', 'Pennsylvania', 'New York', 'Delaware'],
  },
  {
    difficulty: 3,
    connection: 'Things with caps but no bottles',
    items: ['Knee', 'Mushroom', 'Pen', 'Tooth', 'Ice'],
    outliers: ['Beer', 'Soda', 'Wine', 'Water'],
  },
  {
    difficulty: 3,
    connection: "Animals that don't have vocal cords",
    items: ['Giraffe', 'Rabbit', 'Fish', 'Shark'],
    outliers: ['Dog', 'Cat', 'Bird', 'Frog'],
  },
  {
    difficulty: 3,
    connection: 'Words that rhyme with themselves but look different',
    items: ['Though/Dough', 'Rough/Stuff', 'Cough/Off', 'Through/Flu'],
    outliers: ['Read/Read', 'Lead/Lead', 'Bow/Bow', 'Wind/Wind'],
  },
  {
    difficulty: 3,
    connection: "Things that have keys but aren't for doors",
    items: ['Piano', 'Computer', 'Map', 'Music', 'Answer'],
    outliers: ['House', 'Car', 'Lock', 'Safe'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have changed their capital city',
    items: ['Brazil', 'Myanmar', 'Kazakhstan', 'Nigeria', 'Tanzania'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be broken in but not out',
    items: ['Shoes', 'Horse', 'News', 'Car'],
    outliers: ['Jail', 'Prison', 'Egg', 'Box'],
  },
  {
    difficulty: 3,
    connection: 'Words that are shorter when you add letters',
    items: ['Short', 'Long', 'Much', 'Few'],
    outliers: ['Big', 'Small', 'Tall', 'Wide'],
  },
  {
    difficulty: 3,
    connection: 'Animals that are born with teeth',
    items: ['Opossum', 'Hamster', 'Guinea pig', 'Porcupine'],
    outliers: ['Human', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 3,
    connection: "Things with rings that aren't jewelry",
    items: ['Saturn', 'Tree', 'Onion', 'Phone', 'Circus', 'Boxing'],
    outliers: ['Necklace', 'Bracelet', 'Earring', 'Watch'],
  },
  {
    difficulty: 3,
    connection: 'Foods that are naturally radioactive',
    items: ['Banana', 'Brazil nut', 'Potato', 'Carrot', 'Lima bean'],
    outliers: ['Apple', 'Orange', 'Grape', 'Strawberry'],
  },
  {
    difficulty: 3,
    connection: "Things that can be tight but aren't clothing",
    items: ['Budget', 'Schedule', 'Security', 'Deadline', 'Ship'],
    outliers: ['Pants', 'Shirt', 'Shoe', 'Belt'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can see behind themselves without turning',
    items: ['Rabbit', 'Horse', 'Goat', 'Chameleon', 'Dragonfly'],
    outliers: ['Human', 'Dog', 'Cat', 'Owl'],
  },
  {
    difficulty: 3,
    connection: 'Words where -ough makes a different sound',
    items: ['Cough', 'Though', 'Through', 'Rough', 'Bough', 'Thought'],
    outliers: ['Dough', 'Ought', 'Bought', 'Fought'],
  },
  {
    difficulty: 3,
    connection: "Things that have pages but aren't books",
    items: ['Website', 'History', 'Calendar', 'Magazine'],
    outliers: ['Novel', 'Dictionary', 'Textbook', 'Comic'],
  },
  {
    difficulty: 3,
    connection: 'Countries smaller than New York City',
    items: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein', 'Malta'],
    outliers: ['Singapore', 'Bahrain', 'Luxembourg', 'Andorra'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be pitched besides baseballs',
    items: ['Tent', 'Idea', 'Voice', 'Fit', 'Battle'],
    outliers: ['Football', 'Basketball', 'Golf ball', 'Tennis ball'],
  },
  {
    difficulty: 3,
    connection: 'Animals named after other animals',
    items: ['Spider monkey', 'Tiger shark', 'Elephant seal', 'Leopard frog'],
    outliers: ['Cheetah', 'Panther', 'Jaguar', 'Puma'],
  },
  {
    difficulty: 3,
    connection: 'Words where GH is silent',
    items: ['Night', 'Thought', 'Daughter', 'Weight', 'Light', 'Caught'],
    outliers: ['Ghost', 'Ghoul', 'Afghan', 'Tough'],
  },
  {
    difficulty: 3,
    connection: "Things that have skins but aren't alive",
    items: ['Grape', 'Drum', 'Sausage', 'Milk', 'Paint'],
    outliers: ['Human', 'Animal', 'Fish', 'Snake'],
  },
  {
    difficulty: 3,
    connection: 'Countries whose capitals have the same name',
    items: ['Mexico', 'Panama', 'Kuwait', 'Singapore', 'Djibouti'],
    outliers: ['USA', 'UK', 'France', 'Canada'],
  },
  {
    difficulty: 3,
    connection: 'Things with hands but no arms',
    items: ['Clock', 'Cards', 'Help', 'Farm'],
    outliers: ['Human', 'Monkey', 'Robot', 'Statue'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can survive being frozen',
    items: ['Wood frog', 'Arctic woolly bear caterpillar', 'Tardigrade', 'Painted turtle'],
    outliers: ['Polar bear', 'Penguin', 'Seal', 'Arctic fox'],
  },
  {
    difficulty: 3,
    connection: 'English words of Australian Aboriginal origin',
    items: ['Boomerang', 'Kangaroo', 'Koala', 'Wallaby', 'Billabong'],
    outliers: ['Kiwi', 'Safari', 'Jungle', 'Bamboo'],
  },
  {
    difficulty: 3,
    connection: "Things that have roots but aren't plants",
    items: ['Tooth', 'Hair', 'Word', 'Math', 'Family', 'Problem'],
    outliers: ['Tree', 'Flower', 'Grass', 'Bush'],
  },
  {
    difficulty: 3,
    connection: 'Oscar winners who refused or declined the award',
    items: ['Marlon Brando', 'George C. Scott', 'Dudley Nichols', 'Katharine Hepburn'],
    outliers: ['Meryl Streep', 'Daniel Day-Lewis', 'Tom Hanks', 'Jack Nicholson'],
  },
  {
    difficulty: 3,
    connection: "Things that can be running but aren't moving",
    items: ['Nose', 'Water', 'Tab', 'Commentary', 'Engine'],
    outliers: ['Person', 'Car', 'Horse', 'Dog'],
  },

  // ==================== YEAR-LONG EXPANSION ====================
  // Adding 300+ Easy, 300+ Medium, 300+ Hard categories

  // ========== MORE EASY (Difficulty 1) ==========

  {
    difficulty: 1,
    connection: 'Types of apples',
    items: ['Granny Smith', 'Fuji', 'Honeycrisp', 'Gala', 'Red Delicious', 'McIntosh'],
    outliers: ['Banana', 'Orange', 'Pear', 'Peach'],
  },
  {
    difficulty: 1,
    connection: 'Ice cream flavors',
    items: ['Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Cookie Dough', 'Rocky Road'],
    outliers: ['Ketchup', 'Mustard', 'Mayo', 'Ranch'],
  },
  {
    difficulty: 1,
    connection: 'Pizza toppings',
    items: ['Pepperoni', 'Mushroom', 'Sausage', 'Olive', 'Onion', 'Pepper'],
    outliers: ['Ice cream', 'Chocolate', 'Candy', 'Cereal'],
  },
  {
    difficulty: 1,
    connection: 'Types of hats',
    items: ['Baseball cap', 'Beanie', 'Fedora', 'Cowboy hat', 'Top hat', 'Beret'],
    outliers: ['Glove', 'Scarf', 'Shoe', 'Belt'],
  },
  {
    difficulty: 1,
    connection: 'Car brands',
    items: ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Chevrolet'],
    outliers: ['Boeing', 'Airbus', 'Dell', 'Samsung'],
  },
  {
    difficulty: 1,
    connection: 'Superheroes with secret identities',
    items: ['Batman', 'Spider-Man', 'Superman', 'Iron Man', 'Wonder Woman'],
    outliers: ['Hulk', 'Thor', 'Groot', 'Thanos'],
  },
  {
    difficulty: 1,
    connection: 'Types of shoes',
    items: ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Loafers', 'Flip-flops'],
    outliers: ['Hat', 'Glove', 'Scarf', 'Belt'],
  },
  {
    difficulty: 1,
    connection: 'Vegetables',
    items: ['Carrot', 'Broccoli', 'Spinach', 'Celery', 'Lettuce', 'Cucumber'],
    outliers: ['Apple', 'Banana', 'Orange', 'Grape'],
  },
  {
    difficulty: 1,
    connection: 'School subjects',
    items: ['Math', 'Science', 'English', 'History', 'Art', 'Music'],
    outliers: ['Recess', 'Lunch', 'Homework', 'Test'],
  },
  {
    difficulty: 1,
    connection: 'Planets larger than Earth',
    items: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    outliers: ['Mars', 'Venus', 'Mercury', 'Pluto'],
  },
  {
    difficulty: 1,
    connection: "US states starting with 'New'",
    items: ['New York', 'New Jersey', 'New Mexico', 'New Hampshire'],
    outliers: ['Newark', 'Newport', 'Newcastle', 'Newton'],
  },
  {
    difficulty: 1,
    connection: 'Baseball positions',
    items: ['Pitcher', 'Catcher', 'Shortstop', 'First base', 'Outfield'],
    outliers: ['Goalie', 'Quarterback', 'Center', 'Forward'],
  },
  {
    difficulty: 1,
    connection: 'Types of sandwiches',
    items: ['BLT', 'Club', 'Grilled cheese', 'PB&J', 'Reuben', 'Submarine'],
    outliers: ['Salad', 'Soup', 'Pizza', 'Taco'],
  },
  {
    difficulty: 1,
    connection: 'Toys',
    items: ['Lego', 'Barbie', 'Hot Wheels', 'Play-Doh', 'Nerf', 'Yo-yo'],
    outliers: ['Book', 'Pencil', 'Desk', 'Chair'],
  },
  {
    difficulty: 1,
    connection: 'Types of candy',
    items: ['Snickers', 'M&Ms', 'Skittles', 'Twix', 'Kit Kat', "Reese's"],
    outliers: ['Chips', 'Crackers', 'Cookies', 'Pretzels'],
  },
  {
    difficulty: 1,
    connection: 'Kitchen appliances',
    items: ['Microwave', 'Toaster', 'Blender', 'Refrigerator', 'Oven', 'Dishwasher'],
    outliers: ['Television', 'Computer', 'Phone', 'Radio'],
  },
  {
    difficulty: 1,
    connection: 'Board games',
    items: ['Monopoly', 'Scrabble', 'Clue', 'Risk', 'Chess', 'Checkers'],
    outliers: ['Poker', 'Blackjack', 'Solitaire', 'Go Fish'],
  },
  {
    difficulty: 1,
    connection: 'Months in summer (Northern Hemisphere)',
    items: ['June', 'July', 'August'],
    outliers: ['December', 'January', 'February', 'March'],
  },
  {
    difficulty: 1,
    connection: 'Types of dances',
    items: ['Ballet', 'Salsa', 'Hip-hop', 'Waltz', 'Tango', 'Jazz'],
    outliers: ['Singing', 'Acting', 'Painting', 'Writing'],
  },
  {
    difficulty: 1,
    connection: 'Breakfast foods',
    items: ['Pancakes', 'Waffles', 'Eggs', 'Bacon', 'Toast', 'Oatmeal'],
    outliers: ['Steak', 'Spaghetti', 'Sushi', 'Tacos'],
  },
  {
    difficulty: 1,
    connection: 'Types of drinks',
    items: ['Water', 'Juice', 'Soda', 'Milk', 'Tea', 'Coffee'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Salad'],
  },
  {
    difficulty: 1,
    connection: 'Things in a classroom',
    items: ['Desk', 'Chair', 'Whiteboard', 'Pencil', 'Book', 'Computer'],
    outliers: ['Bed', 'Couch', 'Television', 'Bathtub'],
  },
  {
    difficulty: 1,
    connection: 'Farm animals',
    items: ['Cow', 'Pig', 'Chicken', 'Horse', 'Sheep', 'Goat'],
    outliers: ['Lion', 'Tiger', 'Elephant', 'Giraffe'],
  },
  {
    difficulty: 1,
    connection: 'Marine animals',
    items: ['Dolphin', 'Whale', 'Shark', 'Octopus', 'Jellyfish', 'Seal'],
    outliers: ['Eagle', 'Lion', 'Elephant', 'Monkey'],
  },
  {
    difficulty: 1,
    connection: 'Types of weather',
    items: ['Rain', 'Snow', 'Wind', 'Sunshine', 'Hail', 'Fog'],
    outliers: ['Monday', 'Summer', 'Morning', 'Night'],
  },
  {
    difficulty: 1,
    connection: 'Parts of a car',
    items: ['Engine', 'Tire', 'Steering wheel', 'Windshield', 'Brake', 'Headlight'],
    outliers: ['Propeller', 'Wing', 'Rudder', 'Anchor'],
  },
  {
    difficulty: 1,
    connection: 'Types of music genres',
    items: ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip-hop', 'Country'],
    outliers: ['Drama', 'Comedy', 'Action', 'Horror'],
  },
  {
    difficulty: 1,
    connection: 'Colors on a traffic light',
    items: ['Red', 'Yellow', 'Green'],
    outliers: ['Blue', 'Purple', 'Orange', 'Pink', 'White'],
  },
  {
    difficulty: 1,
    connection: 'Things with buttons',
    items: ['Shirt', 'Remote', 'Elevator', 'Phone', 'Keyboard', 'Calculator'],
    outliers: ['Zipper', 'Velcro', 'Laces', 'Buckle'],
  },
  {
    difficulty: 1,
    connection: 'African animals',
    items: ['Lion', 'Elephant', 'Giraffe', 'Zebra', 'Hippo', 'Rhino'],
    outliers: ['Kangaroo', 'Panda', 'Polar bear', 'Moose'],
  },
  {
    difficulty: 1,
    connection: 'Things that fly',
    items: ['Bird', 'Airplane', 'Helicopter', 'Butterfly', 'Bee', 'Kite'],
    outliers: ['Fish', 'Snake', 'Turtle', 'Crab'],
  },
  {
    difficulty: 1,
    connection: 'Desserts',
    items: ['Cake', 'Pie', 'Ice cream', 'Brownie', 'Cookie', 'Pudding'],
    outliers: ['Salad', 'Soup', 'Steak', 'Rice'],
  },
  {
    difficulty: 1,
    connection: 'Office supplies',
    items: ['Stapler', 'Pen', 'Paper clip', 'Tape', 'Scissors', 'Highlighter'],
    outliers: ['Hammer', 'Screwdriver', 'Wrench', 'Drill'],
  },
  {
    difficulty: 1,
    connection: 'Fruits that grow on trees',
    items: ['Apple', 'Orange', 'Lemon', 'Mango', 'Cherry', 'Peach'],
    outliers: ['Strawberry', 'Watermelon', 'Grape', 'Blueberry'],
  },
  {
    difficulty: 1,
    connection: 'Things at the beach',
    items: ['Sand', 'Waves', 'Sunscreen', 'Towel', 'Umbrella', 'Surfboard'],
    outliers: ['Snow', 'Skis', 'Fireplace', 'Sweater'],
  },
  {
    difficulty: 1,
    connection: 'Parts of a house',
    items: ['Roof', 'Door', 'Window', 'Wall', 'Floor', 'Chimney'],
    outliers: ['Tire', 'Engine', 'Wing', 'Propeller'],
  },
  {
    difficulty: 1,
    connection: 'Sports with balls',
    items: ['Soccer', 'Basketball', 'Tennis', 'Golf', 'Baseball', 'Volleyball'],
    outliers: ['Swimming', 'Running', 'Skiing', 'Gymnastics'],
  },
  {
    difficulty: 1,
    connection: 'Insects',
    items: ['Ant', 'Bee', 'Butterfly', 'Beetle', 'Grasshopper', 'Mosquito'],
    outliers: ['Spider', 'Scorpion', 'Worm', 'Snail'],
  },
  {
    difficulty: 1,
    connection: 'Things in space',
    items: ['Star', 'Moon', 'Planet', 'Asteroid', 'Comet', 'Galaxy'],
    outliers: ['Cloud', 'Rainbow', 'Lightning', 'Rain'],
  },
  {
    difficulty: 1,
    connection: 'Citrus fruits',
    items: ['Orange', 'Lemon', 'Lime', 'Grapefruit', 'Tangerine'],
    outliers: ['Apple', 'Banana', 'Grape', 'Strawberry'],
  },
  {
    difficulty: 1,
    connection: 'Winter clothing',
    items: ['Coat', 'Scarf', 'Gloves', 'Boots', 'Hat', 'Sweater'],
    outliers: ['Shorts', 'Sandals', 'Tank top', 'Swimsuit'],
  },
  {
    difficulty: 1,
    connection: 'Things with wheels',
    items: ['Car', 'Bicycle', 'Skateboard', 'Wagon', 'Wheelchair', 'Bus'],
    outliers: ['Boat', 'Sled', 'Surfboard', 'Skis'],
  },
  {
    difficulty: 1,
    connection: 'US holidays',
    items: ['Christmas', 'Thanksgiving', 'Independence Day', 'Halloween', 'Easter'],
    outliers: ['Boxing Day', 'Guy Fawkes', 'Bastille Day', 'Diwali'],
  },
  {
    difficulty: 1,
    connection: 'Disney animated movies',
    items: ['Lion King', 'Aladdin', 'Frozen', 'Moana', 'Mulan', 'Tangled'],
    outliers: ['Shrek', 'Minions', 'Kung Fu Panda', 'Madagascar'],
  },
  {
    difficulty: 1,
    connection: 'Berries',
    items: ['Strawberry', 'Blueberry', 'Raspberry', 'Blackberry', 'Cranberry'],
    outliers: ['Apple', 'Orange', 'Banana', 'Mango'],
  },
  {
    difficulty: 1,
    connection: 'Things in a wallet',
    items: ['Cash', 'Credit card', 'ID', 'Photos', 'Receipts'],
    outliers: ['Keys', 'Phone', 'Watch', 'Glasses'],
  },
  {
    difficulty: 1,
    connection: 'Cartoon dogs',
    items: ['Scooby-Doo', 'Pluto', 'Snoopy', 'Clifford', 'Blue', 'Goofy'],
    outliers: ['Tom', 'Jerry', 'Bugs Bunny', 'Mickey'],
  },
  {
    difficulty: 1,
    connection: 'Things that are round',
    items: ['Ball', 'Coin', 'Pizza', 'Clock', 'Donut', 'Moon'],
    outliers: ['Book', 'Table', 'Door', 'Brick'],
  },
  {
    difficulty: 1,
    connection: 'Playground equipment',
    items: ['Swing', 'Slide', 'Monkey bars', 'Seesaw', 'Sandbox', 'Merry-go-round'],
    outliers: ['Desk', 'Whiteboard', 'Bookshelf', 'Computer'],
  },
  {
    difficulty: 1,
    connection: 'Types of fish',
    items: ['Salmon', 'Tuna', 'Cod', 'Trout', 'Bass', 'Halibut'],
    outliers: ['Shrimp', 'Lobster', 'Crab', 'Octopus'],
  },
  {
    difficulty: 1,
    connection: 'Mythical creatures',
    items: ['Dragon', 'Unicorn', 'Phoenix', 'Mermaid', 'Griffin', 'Centaur'],
    outliers: ['Lion', 'Eagle', 'Horse', 'Fish'],
  },
  {
    difficulty: 1,
    connection: 'Baby animals',
    items: ['Puppy', 'Kitten', 'Calf', 'Foal', 'Chick', 'Lamb'],
    outliers: ['Dog', 'Cat', 'Cow', 'Horse'],
  },
  {
    difficulty: 1,
    connection: 'Vegetables that grow underground',
    items: ['Carrot', 'Potato', 'Onion', 'Beet', 'Radish', 'Turnip'],
    outliers: ['Broccoli', 'Lettuce', 'Corn', 'Tomato'],
  },
  {
    difficulty: 1,
    connection: 'Things at a birthday party',
    items: ['Cake', 'Balloons', 'Presents', 'Candles', 'Party hat', 'Streamers'],
    outliers: ['Homework', 'Test', 'Chores', 'Work'],
  },
  {
    difficulty: 1,
    connection: 'Things that melt',
    items: ['Ice', 'Chocolate', 'Butter', 'Cheese', 'Candle', 'Snow'],
    outliers: ['Rock', 'Wood', 'Glass', 'Metal'],
  },
  {
    difficulty: 1,
    connection: 'Sleeping things',
    items: ['Bed', 'Pillow', 'Blanket', 'Mattress', 'Pajamas', 'Alarm clock'],
    outliers: ['Chair', 'Table', 'Desk', 'Couch'],
  },
  {
    difficulty: 1,
    connection: 'Olympic sports',
    items: ['Swimming', 'Gymnastics', 'Track', 'Diving', 'Rowing', 'Fencing'],
    outliers: ['Football', 'Cricket', 'Baseball', 'Golf'],
  },
  {
    difficulty: 1,
    connection: 'Things that bounce',
    items: ['Ball', 'Trampoline', 'Rubber', 'Basketball', 'Spring'],
    outliers: ['Rock', 'Brick', 'Glass', 'Egg'],
  },
  {
    difficulty: 1,
    connection: 'Dairy products',
    items: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream', 'Ice cream'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Cereal'],
  },
  {
    difficulty: 1,
    connection: 'Things in a bathroom',
    items: ['Toilet', 'Sink', 'Shower', 'Mirror', 'Towel', 'Soap'],
    outliers: ['Bed', 'Couch', 'Table', 'Refrigerator'],
  },
  {
    difficulty: 1,
    connection: 'Things you read',
    items: ['Book', 'Magazine', 'Newspaper', 'Email', 'Sign', 'Menu'],
    outliers: ['Radio', 'Television', 'Music', 'Painting'],
  },
  {
    difficulty: 1,
    connection: 'Things that grow',
    items: ['Plant', 'Tree', 'Hair', 'Nails', 'Child', 'Flower'],
    outliers: ['Rock', 'Car', 'House', 'Phone'],
  },
  {
    difficulty: 1,
    connection: 'Asian countries',
    items: ['China', 'Japan', 'Korea', 'Vietnam', 'Thailand', 'India'],
    outliers: ['Brazil', 'Mexico', 'France', 'Egypt'],
  },
  {
    difficulty: 1,
    connection: 'Things that tick',
    items: ['Clock', 'Watch', 'Timer', 'Metronome', 'Bomb'],
    outliers: ['Radio', 'Television', 'Phone', 'Computer'],
  },
  {
    difficulty: 1,
    connection: 'Green foods',
    items: ['Broccoli', 'Spinach', 'Cucumber', 'Lettuce', 'Peas', 'Celery'],
    outliers: ['Carrot', 'Tomato', 'Banana', 'Strawberry'],
  },
  {
    difficulty: 1,
    connection: 'Things with stripes',
    items: ['Zebra', 'Tiger', 'Flag', 'Candy cane', 'Referee shirt', 'Barcode'],
    outliers: ['Leopard', 'Dalmatian', 'Cow', 'Giraffe'],
  },
  {
    difficulty: 1,
    connection: 'Nuts',
    items: ['Peanut', 'Almond', 'Walnut', 'Cashew', 'Pistachio', 'Pecan'],
    outliers: ['Apple', 'Orange', 'Grape', 'Banana'],
  },
  {
    difficulty: 1,
    connection: 'Types of boats',
    items: ['Sailboat', 'Canoe', 'Kayak', 'Yacht', 'Ferry', 'Rowboat'],
    outliers: ['Car', 'Plane', 'Train', 'Bus'],
  },
  {
    difficulty: 1,
    connection: 'Things at a circus',
    items: ['Clown', 'Elephant', 'Trapeze', 'Lion', 'Ringmaster', 'Acrobat'],
    outliers: ['Teacher', 'Doctor', 'Chef', 'Firefighter'],
  },
  {
    difficulty: 1,
    connection: 'Cleaning supplies',
    items: ['Mop', 'Broom', 'Vacuum', 'Sponge', 'Bucket', 'Duster'],
    outliers: ['Hammer', 'Saw', 'Drill', 'Wrench'],
  },
  {
    difficulty: 1,
    connection: 'Video game consoles',
    items: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Wii', 'GameCube'],
    outliers: ['iPhone', 'iPad', 'MacBook', 'Kindle'],
  },
  {
    difficulty: 1,
    connection: 'Things with handles',
    items: ['Door', 'Cup', 'Suitcase', 'Pan', 'Umbrella', 'Basket'],
    outliers: ['Ball', 'Plate', 'Bowl', 'Box'],
  },
  {
    difficulty: 1,
    connection: 'Reptiles',
    items: ['Snake', 'Lizard', 'Turtle', 'Crocodile', 'Alligator', 'Gecko'],
    outliers: ['Frog', 'Toad', 'Salamander', 'Newt'],
  },
  {
    difficulty: 1,
    connection: 'Things that spin',
    items: ['Top', 'Wheel', 'Fan', 'Earth', 'Tornado', 'Dryer'],
    outliers: ['Book', 'Table', 'Chair', 'Bed'],
  },
  {
    difficulty: 1,
    connection: 'Red foods',
    items: ['Tomato', 'Strawberry', 'Apple', 'Cherry', 'Raspberry', 'Watermelon'],
    outliers: ['Banana', 'Orange', 'Lemon', 'Blueberry'],
  },
  {
    difficulty: 1,
    connection: 'Things at a hospital',
    items: ['Doctor', 'Nurse', 'Bed', 'Medicine', 'Ambulance', 'X-ray'],
    outliers: ['Teacher', 'Desk', 'Chalkboard', 'Textbook'],
  },
  {
    difficulty: 1,
    connection: 'Yellow things',
    items: ['Banana', 'Sun', 'Lemon', 'School bus', 'Taxi', 'Rubber duck'],
    outliers: ['Apple', 'Grass', 'Sky', 'Grape'],
  },
  {
    difficulty: 1,
    connection: 'Herbs and spices',
    items: ['Basil', 'Oregano', 'Cinnamon', 'Pepper', 'Garlic', 'Ginger'],
    outliers: ['Salt', 'Sugar', 'Flour', 'Rice'],
  },
  {
    difficulty: 1,
    connection: 'Things at a zoo',
    items: ['Lion', 'Elephant', 'Giraffe', 'Monkey', 'Penguin', 'Tiger'],
    outliers: ['Dog', 'Cat', 'Hamster', 'Goldfish'],
  },
  {
    difficulty: 1,
    connection: 'Things that float',
    items: ['Boat', 'Duck', 'Cork', 'Life jacket', 'Beach ball', 'Leaf'],
    outliers: ['Rock', 'Anchor', 'Brick', 'Key'],
  },
  {
    difficulty: 1,
    connection: 'Cartoon cats',
    items: ['Garfield', 'Tom', 'Sylvester', 'Felix', 'Hello Kitty'],
    outliers: ['Scooby-Doo', 'Pluto', 'Snoopy', 'Clifford'],
  },
  {
    difficulty: 1,
    connection: 'Things in a garden',
    items: ['Flower', 'Vegetable', 'Soil', 'Hose', 'Rake', 'Seeds'],
    outliers: ['Couch', 'Television', 'Bed', 'Refrigerator'],
  },
  {
    difficulty: 1,
    connection: 'Things that ring',
    items: ['Phone', 'Doorbell', 'Bell', 'Alarm', 'Church bells'],
    outliers: ['Television', 'Computer', 'Book', 'Painting'],
  },
  {
    difficulty: 1,
    connection: 'Types of beans',
    items: ['Black beans', 'Kidney beans', 'Pinto beans', 'Lima beans', 'Navy beans'],
    outliers: ['Corn', 'Peas', 'Carrots', 'Broccoli'],
  },
  {
    difficulty: 1,
    connection: 'Things in the sky',
    items: ['Cloud', 'Sun', 'Moon', 'Star', 'Airplane', 'Bird'],
    outliers: ['Fish', 'Car', 'Train', 'Boat'],
  },
  {
    difficulty: 1,
    connection: 'Things that drip',
    items: ['Faucet', 'Ice cream', 'Rain', 'Candle', 'Nose', 'Sweat'],
    outliers: ['Rock', 'Book', 'Chair', 'Table'],
  },
  {
    difficulty: 1,
    connection: 'Baked goods',
    items: ['Bread', 'Cake', 'Cookie', 'Muffin', 'Croissant', 'Pie'],
    outliers: ['Salad', 'Soup', 'Steak', 'Sushi'],
  },
  {
    difficulty: 1,
    connection: 'Things at a construction site',
    items: ['Crane', 'Bulldozer', 'Hard hat', 'Concrete', 'Scaffolding', 'Forklift'],
    outliers: ['Desk', 'Computer', 'Printer', 'Stapler'],
  },
  {
    difficulty: 1,
    connection: 'Birds',
    items: ['Eagle', 'Robin', 'Sparrow', 'Crow', 'Pigeon', 'Parrot'],
    outliers: ['Bat', 'Butterfly', 'Bee', 'Fly'],
  },
  {
    difficulty: 1,
    connection: 'Fast food items',
    items: ['Burger', 'Fries', 'Nuggets', 'Shake', 'Hot dog', 'Pizza'],
    outliers: ['Steak', 'Lobster', 'Caviar', 'Sushi'],
  },
  {
    difficulty: 1,
    connection: 'Things in a toolbox',
    items: ['Hammer', 'Screwdriver', 'Wrench', 'Pliers', 'Tape measure', 'Nails'],
    outliers: ['Pen', 'Paper', 'Stapler', 'Scissors'],
  },
  {
    difficulty: 1,
    connection: 'Things you wear on your head',
    items: ['Hat', 'Helmet', 'Crown', 'Headband', 'Wig', 'Cap'],
    outliers: ['Gloves', 'Shoes', 'Belt', 'Watch'],
  },
  {
    difficulty: 1,
    connection: 'Camping gear',
    items: ['Tent', 'Sleeping bag', 'Flashlight', 'Campfire', 'Marshmallows', 'Cooler'],
    outliers: ['Television', 'Couch', 'Refrigerator', 'Bed'],
  },
  {
    difficulty: 1,
    connection: 'Types of soup',
    items: ['Tomato', 'Chicken noodle', 'Clam chowder', 'Minestrone', 'French onion'],
    outliers: ['Salad', 'Sandwich', 'Steak', 'Pasta'],
  },
  {
    difficulty: 1,
    connection: 'Things that shine',
    items: ['Sun', 'Star', 'Diamond', 'Gold', 'Mirror', 'Chrome'],
    outliers: ['Rock', 'Wood', 'Paper', 'Cloth'],
  },
  {
    difficulty: 1,
    connection: 'Places to sit',
    items: ['Chair', 'Couch', 'Bench', 'Stool', 'Throne', 'Bleachers'],
    outliers: ['Table', 'Desk', 'Shelf', 'Cabinet'],
  },
  {
    difficulty: 1,
    connection: 'Things that beep',
    items: ['Microwave', 'Alarm clock', 'Car horn', 'Smoke detector', 'Watch'],
    outliers: ['Book', 'Painting', 'Statue', 'Plant'],
  },
  {
    difficulty: 1,
    connection: 'Mexican foods',
    items: ['Taco', 'Burrito', 'Quesadilla', 'Enchilada', 'Nachos', 'Guacamole'],
    outliers: ['Sushi', 'Pizza', 'Pasta', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Things at an amusement park',
    items: ['Roller coaster', 'Ferris wheel', 'Carousel', 'Bumper cars', 'Cotton candy'],
    outliers: ['Desk', 'Computer', 'Printer', 'Copier'],
  },
  {
    difficulty: 1,
    connection: 'Ocean animals',
    items: ['Fish', 'Whale', 'Dolphin', 'Shark', 'Octopus', 'Jellyfish'],
    outliers: ['Dog', 'Cat', 'Bird', 'Horse'],
  },
  {
    difficulty: 1,
    connection: 'Things you plug in',
    items: ['Lamp', 'Television', 'Computer', 'Toaster', 'Charger', 'Vacuum'],
    outliers: ['Book', 'Ball', 'Chair', 'Pillow'],
  },

  // ========== MORE MEDIUM (Difficulty 2) ==========

  {
    difficulty: 2,
    connection: 'Countries that were part of the Soviet Union',
    items: ['Russia', 'Ukraine', 'Belarus', 'Kazakhstan', 'Georgia', 'Armenia'],
    outliers: ['Poland', 'Hungary', 'Czechoslovakia', 'East Germany'],
  },
  {
    difficulty: 2,
    connection: 'Films that won both Best Picture and Best Director',
    items: ['The Godfather', "Schindler's List", 'Titanic', 'No Country for Old Men', 'Birdman'],
    outliers: ['Pulp Fiction', 'Goodfellas', 'The Shawshank Redemption', 'Citizen Kane'],
  },
  {
    difficulty: 2,
    connection: 'Animals that hibernate',
    items: ['Bear', 'Groundhog', 'Chipmunk', 'Bat', 'Hedgehog', 'Turtle'],
    outliers: ['Penguin', 'Polar bear', 'Wolf', 'Fox'],
  },
  {
    difficulty: 2,
    connection: 'Countries with only one time zone despite large size',
    items: ['China', 'India', 'Argentina', 'Afghanistan'],
    outliers: ['Russia', 'USA', 'Brazil', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Brands named after founders',
    items: ['Ford', 'Disney', 'Ferrari', 'Chanel', 'Porsche', 'Heinz'],
    outliers: ['Apple', 'Amazon', 'Google', 'Nike'],
  },
  {
    difficulty: 2,
    connection: 'Radioactive elements',
    items: ['Polonium', 'Radium', 'Uranium', 'Plutonium', 'Thorium', 'Radon'],
    outliers: ['Gold', 'Silver', 'Iron', 'Copper'],
  },
  {
    difficulty: 2,
    connection: 'Animals with pouches (marsupials)',
    items: ['Kangaroo', 'Koala', 'Wombat', 'Opossum', 'Wallaby', 'Tasmanian devil'],
    outliers: ['Bear', 'Raccoon', 'Armadillo', 'Sloth'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are fermented',
    items: ['Yogurt', 'Cheese', 'Sauerkraut', 'Kimchi', 'Soy sauce', 'Beer'],
    outliers: ['Bread', 'Pasta', 'Rice', 'Salad'],
  },
  {
    difficulty: 2,
    connection: 'Rivers that flow north',
    items: ['Nile', 'Rhine', 'Mackenzie', 'Ob', 'Lena'],
    outliers: ['Amazon', 'Mississippi', 'Ganges', 'Danube'],
  },
  {
    difficulty: 2,
    connection: 'Countries with coastlines on two different oceans',
    items: ['USA', 'Canada', 'Mexico', 'South Africa', 'Egypt', 'Panama'],
    outliers: ['Brazil', 'Argentina', 'Australia', 'India'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are venomous (not poisonous)',
    items: ['Snake', 'Spider', 'Scorpion', 'Jellyfish', 'Stingray', 'Cone snail'],
    outliers: ['Poison dart frog', 'Pufferfish', 'Newt', 'Monarch butterfly'],
  },
  {
    difficulty: 2,
    connection: 'Capitals that are not the largest city in their country',
    items: ['Washington DC', 'Ottawa', 'Canberra', 'Brasilia', 'Pretoria'],
    outliers: ['London', 'Paris', 'Tokyo', 'Beijing'],
  },
  {
    difficulty: 2,
    connection: 'Companies that started in dorm rooms',
    items: ['Facebook', 'Google', 'Dell', 'Snapchat', 'Reddit', 'WordPress'],
    outliers: ['Apple', 'Amazon', 'Microsoft', 'Disney'],
  },
  {
    difficulty: 2,
    connection: 'Languages with over 1 billion speakers (including second language)',
    items: ['English', 'Mandarin', 'Hindi', 'Spanish', 'French'],
    outliers: ['Japanese', 'German', 'Italian', 'Korean'],
  },
  {
    difficulty: 2,
    connection: 'Animals with multiple stomachs',
    items: ['Cow', 'Sheep', 'Goat', 'Deer', 'Giraffe', 'Camel'],
    outliers: ['Horse', 'Pig', 'Dog', 'Cat'],
  },
  {
    difficulty: 2,
    connection: 'Movies based on TV shows',
    items: [
      'Mission: Impossible',
      'The Fugitive',
      "Charlie's Angels",
      '21 Jump Street',
      'The Addams Family',
    ],
    outliers: ['Die Hard', 'Lethal Weapon', 'Indiana Jones', 'Back to the Future'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are natural laxatives',
    items: ['Prunes', 'Coffee', 'Figs', 'Kiwi', 'Flaxseed'],
    outliers: ['Cheese', 'Rice', 'Banana', 'Toast'],
  },
  {
    difficulty: 2,
    connection: 'Countries that have hosted both Summer and Winter Olympics',
    items: ['USA', 'France', 'Germany', 'Italy', 'Japan', 'Canada'],
    outliers: ['Brazil', 'UK', 'Australia', 'Greece'],
  },
  {
    difficulty: 2,
    connection: 'Animals that use echolocation',
    items: ['Bat', 'Dolphin', 'Whale', 'Porpoise', 'Orca'],
    outliers: ['Owl', 'Cat', 'Snake', 'Shark'],
  },
  {
    difficulty: 2,
    connection: 'Foods named after cities',
    items: ['Brussels sprouts', 'Frankfurt', 'Hamburg', 'Bologna', 'Buffalo wings'],
    outliers: ['Hot dog', 'French fries', 'Pizza', 'Sushi'],
  },
  {
    difficulty: 2,
    connection: 'Countries that use right-hand traffic but used to drive on left',
    items: ['Sweden', 'Iceland', 'Ghana', 'Nigeria', 'Myanmar'],
    outliers: ['UK', 'Japan', 'Australia', 'India'],
  },
  {
    difficulty: 2,
    connection: 'Animals with excellent night vision',
    items: ['Cat', 'Owl', 'Raccoon', 'Gecko', 'Wolf'],
    outliers: ['Human', 'Chicken', 'Pigeon', 'Sheep'],
  },
  {
    difficulty: 2,
    connection: 'Cities with underground rivers',
    items: ['London', 'Paris', 'Toronto', 'Vienna', 'Melbourne'],
    outliers: ['Venice', 'Amsterdam', 'Bangkok', 'Miami'],
  },
  {
    difficulty: 2,
    connection: 'Companies worth over $1 trillion',
    items: ['Apple', 'Microsoft', 'Amazon', 'Google', 'Saudi Aramco', 'Nvidia'],
    outliers: ['Walmart', 'Disney', 'Nike', 'Coca-Cola'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can change gender',
    items: ['Clownfish', 'Wrasse', 'Moray eel', 'Oyster', 'Slug'],
    outliers: ['Frog', 'Lizard', 'Snake', 'Fish'],
  },
  {
    difficulty: 2,
    connection: 'Words that entered English from Native American languages',
    items: ['Canoe', 'Toboggan', 'Moose', 'Raccoon', 'Skunk', 'Chipmunk'],
    outliers: ['Safari', 'Jungle', 'Banana', 'Yoga'],
  },
  {
    difficulty: 2,
    connection: 'European capitals on the Danube River',
    items: ['Vienna', 'Budapest', 'Bratislava', 'Belgrade'],
    outliers: ['Paris', 'London', 'Rome', 'Madrid'],
  },
  {
    difficulty: 2,
    connection: 'Animals with exceptional night vision',
    items: ['Owl', 'Cat', 'Gecko', 'Wolf', 'Fox'],
    outliers: ['Human', 'Chicken', 'Pigeon', 'Turkey'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are blue without artificial coloring',
    items: ['Blueberry', 'Blue corn', 'Elderberry', 'Concord grape'],
    outliers: ['Blue cheese', 'Blue raspberry', 'Blue candy', 'Blue Gatorade'],
  },
  {
    difficulty: 2,
    connection: 'Countries with no military',
    items: ['Costa Rica', 'Iceland', 'Panama', 'Liechtenstein', 'Andorra'],
    outliers: ['Switzerland', 'Sweden', 'Austria', 'Finland'],
  },
  {
    difficulty: 2,
    connection: "Animals that don't sleep",
    items: ['Bullfrog', 'Jellyfish', 'Sea urchin'],
    outliers: ['Sloth', 'Koala', 'Cat', 'Lion'],
  },
  {
    difficulty: 2,
    connection: 'Movies where the villain wins',
    items: [
      'Se7en',
      'No Country for Old Men',
      'The Silence of the Lambs',
      'Chinatown',
      'Infinity War',
    ],
    outliers: ['Die Hard', 'The Dark Knight', 'Avengers: Endgame', 'Skyfall'],
  },
  {
    difficulty: 2,
    connection: 'Countries with alphabetically consecutive letters in their name',
    items: ['Norway', 'Germany', 'Fiji', 'Afghanistan', 'China'],
    outliers: ['USA', 'UK', 'Canada', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can survive in space (briefly)',
    items: ['Tardigrade', 'Fruit fly', 'Nematode', 'Lichen'],
    outliers: ['Cockroach', 'Ant', 'Spider', 'Scorpion'],
  },
  {
    difficulty: 2,
    connection: 'Foods that were invented by accident',
    items: ['Chocolate chip cookie', 'Popsicle', 'Corn flakes', 'Potato chips', 'Coca-Cola'],
    outliers: ['Pizza', 'Hamburger', 'Hot dog', 'Sandwich'],
  },
  {
    difficulty: 2,
    connection: 'Countries named after a person',
    items: ['Colombia', 'Bolivia', 'Philippines', 'Saudi Arabia', 'America'],
    outliers: ['Canada', 'Mexico', 'Brazil', 'Argentina'],
  },
  {
    difficulty: 2,
    connection: 'Animals with 360-degree vision',
    items: ['Chameleon', 'Dragonfly', 'Goat', 'Horse', 'Rabbit'],
    outliers: ['Human', 'Cat', 'Dog', 'Eagle'],
  },
  {
    difficulty: 2,
    connection: 'Cities that have been capitals of multiple countries',
    items: ['Istanbul', 'Jerusalem', 'Berlin', 'Vienna'],
    outliers: ['London', 'Paris', 'Rome', 'Tokyo'],
  },
  {
    difficulty: 2,
    connection: 'Actors who have played the Joker',
    items: ['Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto', 'Mark Hamill'],
    outliers: ['Christian Bale', 'Robert Pattinson', 'Ben Affleck', 'Michael Keaton'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are bioluminescent',
    items: ['Firefly', 'Jellyfish', 'Anglerfish', 'Glow worm', 'Squid'],
    outliers: ['Butterfly', 'Beetle', 'Moth', 'Ant'],
  },
  {
    difficulty: 2,
    connection: 'Languages written right to left',
    items: ['Arabic', 'Hebrew', 'Persian', 'Urdu', 'Pashto'],
    outliers: ['Chinese', 'Japanese', 'Korean', 'Thai'],
  },
  {
    difficulty: 2,
    connection: 'Countries that have had female heads of state',
    items: ['UK', 'Germany', 'India', 'Israel', 'Argentina', 'New Zealand'],
    outliers: ['USA', 'Russia', 'China', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can count or do basic math',
    items: ['Crow', 'Chimpanzee', 'Elephant', 'Honeybee', 'Parrot'],
    outliers: ['Dog', 'Cat', 'Horse', 'Pig'],
  },
  {
    difficulty: 2,
    connection: 'Foods that originated in Mexico',
    items: ['Chocolate', 'Tomato', 'Avocado', 'Corn', 'Vanilla', 'Chili'],
    outliers: ['Potato', 'Coffee', 'Sugar', 'Banana'],
  },
  {
    difficulty: 2,
    connection: 'Countries with more than 1000 islands',
    items: ['Finland', 'Sweden', 'Indonesia', 'Philippines', 'Norway', 'Canada'],
    outliers: ['UK', 'Australia', 'New Zealand', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Animals that use tools',
    items: ['Chimpanzee', 'Crow', 'Elephant', 'Octopus', 'Dolphin', 'Sea otter'],
    outliers: ['Dog', 'Cat', 'Horse', 'Pig'],
  },
  {
    difficulty: 2,
    connection: 'Directors who have won Best Director Oscar twice',
    items: ['John Ford', 'Frank Capra', 'Clint Eastwood', 'Alejandro Iñárritu', 'Steven Spielberg'],
    outliers: ['Martin Scorsese', 'Quentin Tarantino', 'James Cameron', 'Christopher Nolan'],
  },
  {
    difficulty: 2,
    connection: 'Countries with multiple official languages',
    items: ['Switzerland', 'Belgium', 'Canada', 'South Africa', 'Singapore', 'India'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals that sweat',
    items: ['Human', 'Horse', 'Hippo', 'Primate'],
    outliers: ['Dog', 'Cat', 'Bird', 'Reptile'],
  },
  {
    difficulty: 2,
    connection: 'Foods that contain caffeine naturally',
    items: ['Coffee', 'Tea', 'Chocolate', 'Guarana', 'Yerba mate'],
    outliers: ['Soda', 'Energy drink', 'Decaf', 'Water'],
  },
  {
    difficulty: 2,
    connection: 'Countries with land borders to only one country',
    items: ['Portugal', 'Monaco', 'Vatican City', 'San Marino', 'South Korea', 'Canada'],
    outliers: ['France', 'Germany', 'Switzerland', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can live over 100 years',
    items: ['Tortoise', 'Whale', 'Elephant', 'Parrot', 'Koi fish', 'Lobster'],
    outliers: ['Dog', 'Cat', 'Horse', 'Rabbit'],
  },
  {
    difficulty: 2,
    connection: 'Movies shot entirely in one location',
    items: ['12 Angry Men', 'Rope', 'Buried', 'Phone Booth', 'Locke'],
    outliers: ['Die Hard', 'The Shining', 'Titanic', 'Avatar'],
  },
  {
    difficulty: 2,
    connection: 'Countries where tipping is considered rude',
    items: ['Japan', 'China', 'South Korea', 'Singapore'],
    outliers: ['USA', 'Canada', 'UK', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can mimic human speech',
    items: ['Parrot', 'Mynah', 'Crow', 'Raven', 'Lyrebird'],
    outliers: ['Dog', 'Cat', 'Monkey', 'Dolphin'],
  },
  {
    difficulty: 2,
    connection: 'Words borrowed from Italian',
    items: ['Piano', 'Cappuccino', 'Paparazzi', 'Graffiti', 'Fiasco', 'Umbrella'],
    outliers: ['Croissant', 'Kindergarten', 'Karate', 'Safari'],
  },
  {
    difficulty: 2,
    connection: 'Countries where the sun never sets in summer',
    items: ['Norway', 'Sweden', 'Finland', 'Iceland', 'Russia', 'Alaska'],
    outliers: ['Canada', 'UK', 'Germany', 'France'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can detect earthquakes before they happen',
    items: ['Dog', 'Cat', 'Bird', 'Fish', 'Snake', 'Elephant'],
    outliers: ['Human', 'Cow', 'Pig', 'Chicken'],
  },
  {
    difficulty: 2,
    connection: 'Foods that were once used as medicine',
    items: ['Honey', 'Ginger', 'Garlic', 'Chocolate', 'Vinegar', 'Lemons'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Cereal'],
  },
  {
    difficulty: 2,
    connection: 'Countries with national animals that are mythical',
    items: ['Scotland', 'Wales', 'North Korea', 'Bhutan', 'Greece'],
    outliers: ['USA', 'UK', 'Australia', 'Canada'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are immune to their own venom',
    items: ['Snake', 'Scorpion', 'Honeybee'],
    outliers: ['Spider', 'Jellyfish', 'Wasp', 'Ant'],
  },
  {
    difficulty: 2,
    connection: 'Cities that are older than Rome',
    items: ['Athens', 'Jerusalem', 'Damascus', 'Varanasi', 'Luxor'],
    outliers: ['Paris', 'London', 'Istanbul', 'Moscow'],
  },
  {
    difficulty: 2,
    connection: 'Movies where the protagonist dies at the end',
    items: ['Gladiator', 'Braveheart', 'Titanic', 'Logan', 'Scarface', 'American Beauty'],
    outliers: ['Die Hard', 'Rocky', 'The Shawshank Redemption', 'Forrest Gump'],
  },
  {
    difficulty: 2,
    connection: 'Countries with pyramids',
    items: ['Egypt', 'Mexico', 'Sudan', 'Guatemala', 'China', 'Indonesia'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can predict weather',
    items: ['Groundhog', 'Frog', 'Cow', 'Sheep', 'Cricket'],
    outliers: ['Dog', 'Cat', 'Horse', 'Pig'],
  },
  {
    difficulty: 2,
    connection: 'Words that mean the same in multiple languages',
    items: ['Taxi', 'Hotel', 'Radio', 'Television', 'Internet', 'Computer'],
    outliers: ['Car', 'House', 'Book', 'Food'],
  },
  {
    difficulty: 2,
    connection: 'Countries that drive on the left AND use miles',
    items: ['UK', 'Bahamas', 'Jamaica', 'Antigua'],
    outliers: ['Japan', 'Australia', 'India', 'Thailand'],
  },
  {
    difficulty: 2,
    connection: 'Animals with the longest gestation periods',
    items: ['Elephant', 'Whale', 'Rhino', 'Giraffe', 'Camel'],
    outliers: ['Dog', 'Cat', 'Rabbit', 'Mouse'],
  },
  {
    difficulty: 2,
    connection: 'Films shot in black and white after 1970',
    items: ["Schindler's List", 'The Artist', 'Nebraska', 'Roma', 'Frances Ha'],
    outliers: ['Casablanca', 'Citizen Kane', '12 Angry Men', 'Psycho'],
  },
  {
    difficulty: 2,
    connection: 'Countries with no national anthem lyrics',
    items: ['Spain', 'San Marino', 'Bosnia', 'Kosovo'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can hold their breath the longest',
    items: ['Sperm whale', 'Elephant seal', 'Sea turtle', 'Crocodile', 'Beaver'],
    outliers: ['Dolphin', 'Human', 'Fish', 'Frog'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are probiotic',
    items: ['Yogurt', 'Kefir', 'Sauerkraut', 'Kimchi', 'Miso', 'Kombucha'],
    outliers: ['Milk', 'Juice', 'Soda', 'Water'],
  },
  {
    difficulty: 2,
    connection: 'Countries with volcanoes',
    items: ['Japan', 'Indonesia', 'Iceland', 'Italy', 'USA', 'Philippines'],
    outliers: ['UK', 'France', 'Germany', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can survive decapitation',
    items: ['Cockroach', 'Chicken', 'Turtle', 'Flatworm'],
    outliers: ['Snake', 'Lizard', 'Frog', 'Fish'],
  },
  {
    difficulty: 2,
    connection: 'Brands that are also common words',
    items: ['Apple', 'Amazon', 'Shell', 'Gap', 'Target', 'Sprint'],
    outliers: ['Nike', 'Adidas', 'Puma', 'Reebok'],
  },
  {
    difficulty: 2,
    connection: 'Countries that touch both the Atlantic and Mediterranean',
    items: ['Spain', 'France', 'Morocco', 'Algeria', 'Tunisia'],
    outliers: ['Italy', 'Greece', 'Portugal', 'UK'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can walk on water',
    items: ['Basilisk lizard', 'Water strider', 'Fishing spider', 'Pygmy gecko'],
    outliers: ['Frog', 'Duck', 'Swan', 'Crocodile'],
  },
  {
    difficulty: 2,
    connection: 'Directors who made films in multiple languages',
    items: ['Guillermo del Toro', 'Ang Lee', 'Michael Haneke', 'Denis Villeneuve'],
    outliers: ['Steven Spielberg', 'Martin Scorsese', 'Christopher Nolan', 'Quentin Tarantino'],
  },
  {
    difficulty: 2,
    connection: 'Countries with deserts AND rainforests',
    items: ['Australia', 'Brazil', 'Madagascar', 'India', 'Mexico'],
    outliers: ['Egypt', 'Saudi Arabia', 'Congo', 'Indonesia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can survive without oxygen',
    items: ['Tardigrade', 'Loricifera', 'Brine shrimp', 'Goldfish'],
    outliers: ['Fish', 'Whale', 'Dolphin', 'Seal'],
  },
  {
    difficulty: 2,
    connection: 'Foods that get better with age',
    items: ['Wine', 'Cheese', 'Whiskey', 'Balsamic vinegar', 'Soy sauce'],
    outliers: ['Milk', 'Bread', 'Fruit', 'Meat'],
  },
  {
    difficulty: 2,
    connection: 'Countries that have been invaded by France',
    items: ['Spain', 'Russia', 'Egypt', 'Italy', 'Germany', 'Mexico'],
    outliers: ['USA', 'UK', 'Japan', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that never stop growing',
    items: ['Shark', 'Lobster', 'Goldfish', 'Kangaroo', 'Python'],
    outliers: ['Dog', 'Cat', 'Human', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Movies with unreliable narrators',
    items: ['Fight Club', 'The Usual Suspects', 'Gone Girl', 'Shutter Island', 'Memento'],
    outliers: ['The Godfather', 'Forrest Gump', 'Titanic', 'Jaws'],
  },
  {
    difficulty: 2,
    connection: 'Countries with active volcanoes',
    items: ['USA', 'Japan', 'Indonesia', 'Italy', 'Iceland', 'Philippines'],
    outliers: ['UK', 'France', 'Germany', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that play dead as defense',
    items: ['Opossum', 'Hognose snake', 'Duck', 'Fire ant', 'Chicken'],
    outliers: ['Turtle', 'Armadillo', 'Hedgehog', 'Pangolin'],
  },
  {
    difficulty: 2,
    connection: 'Words that are spelled the same in English and French',
    items: ['Menu', 'Bureau', 'Table', 'Image', 'Radio', 'Piano'],
    outliers: ['House', 'Car', 'Book', 'Water'],
  },

  // ========== MORE HARD (Difficulty 3) ==========

  {
    difficulty: 3,
    connection: 'Words where adding S changes the pronunciation of another letter',
    items: ['House', 'Use', 'Close', 'Abuse'],
    outliers: ['Mouse', 'Loose', 'Choose', 'Moose'],
  },
  {
    difficulty: 3,
    connection: "Things that have scales but aren't fish or reptiles",
    items: ['Piano', 'Map', 'Justice', 'Music', 'Bathroom'],
    outliers: ['Snake', 'Fish', 'Lizard', 'Dragon'],
  },
  {
    difficulty: 3,
    connection: 'Words that are anagrams of each other',
    items: ['Listen/Silent', 'Earth/Heart', 'Angel/Glean', 'Stressed/Desserts'],
    outliers: ['Cat/Dog', 'Sun/Moon', 'Day/Night', 'Hot/Cold'],
  },
  {
    difficulty: 3,
    connection: "Countries whose names contain 'land' but aren't in Europe",
    items: ['Thailand', 'New Zealand', 'Swaziland', 'Greenland'],
    outliers: ['Finland', 'Poland', 'Ireland', 'Iceland'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be drawn besides pictures',
    items: ['Bath', 'Conclusion', 'Breath', 'Blood', 'Curtain', 'Sword'],
    outliers: ['Circle', 'Line', 'Square', 'Triangle'],
  },
  {
    difficulty: 3,
    connection: 'Words with all five vowels appearing once',
    items: ['Facetious', 'Abstemious', 'Education', 'Sequoia', 'Equation'],
    outliers: ['Beautiful', 'Alphabet', 'Wonderful', 'Question'],
  },
  {
    difficulty: 3,
    connection: 'Three-letter animal names',
    items: ['Pup', 'Ewe', 'Cat', 'Dog', 'Bat', 'Cow', 'Ant', 'Fly'],
    outliers: ['Elephant', 'Giraffe', 'Hippopotamus', 'Crocodile'],
  },
  {
    difficulty: 3,
    connection: 'Things with chambers but not hearts',
    items: ['Gun', 'Cave', 'Judge', 'Commerce', 'Echo'],
    outliers: ['Heart', 'Lung', 'Stomach', 'Brain'],
  },
  {
    difficulty: 3,
    connection: 'Words where every consonant is the same',
    items: ['Banana', 'Murmur', 'Mama', 'Papa', 'Noon'],
    outliers: ['Apple', 'Orange', 'Grape', 'Melon'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be broken in besides shoes',
    items: ['Horse', 'House', 'Conversation', 'News'],
    outliers: ['Window', 'Glass', 'Egg', 'Bone'],
  },
  {
    difficulty: 3,
    connection: 'Countries that lost territory to become smaller after 1900',
    items: ['Germany', 'Russia', 'Austria', 'Turkey', 'UK'],
    outliers: ['USA', 'China', 'India', 'Brazil'],
  },
  {
    difficulty: 3,
    connection: "Things with blades but don't cut",
    items: ['Fan', 'Helicopter', 'Grass', 'Shoulder', 'Windmill'],
    outliers: ['Knife', 'Sword', 'Scissors', 'Razor'],
  },
  {
    difficulty: 3,
    connection: "Words that lose their meaning when you add 'not'",
    items: ['Inflammable', 'Famous', 'Valuable', 'Remarkable'],
    outliers: ['Happy', 'Good', 'Big', 'Fast'],
  },
  {
    difficulty: 3,
    connection: 'Things that have arms but no hands',
    items: ['Chair', 'Starfish', 'Octopus', 'Record player', 'Sea'],
    outliers: ['Human', 'Monkey', 'Robot', 'Clock'],
  },
  {
    difficulty: 3,
    connection: "Countries that compete in Eurovision but aren't in the EU",
    items: ['Israel', 'Australia', 'UK', 'Switzerland', 'Norway', 'Ukraine'],
    outliers: ['USA', 'Canada', 'Japan', 'Brazil'],
  },
  {
    difficulty: 3,
    connection: "Things that can be passed but aren't objects",
    items: ['Time', 'Gas', 'Law', 'Judgment', 'Sentence'],
    outliers: ['Ball', 'Salt', 'Baton', 'Note'],
  },
  {
    difficulty: 3,
    connection: 'Words where the letters are in keyboard order (QWERTY row)',
    items: ['Typewriter', 'Proprietor', 'Repertoire'],
    outliers: ['Computer', 'Keyboard', 'Monitor', 'Mouse'],
  },
  {
    difficulty: 3,
    connection: "Things with springs but aren't seasons",
    items: ['Mattress', 'Watch', 'Trap', 'Water', 'Chicken'],
    outliers: ['Summer', 'Fall', 'Winter', 'Autumn'],
  },
  {
    difficulty: 3,
    connection: 'Countries where English is official but not widely spoken',
    items: ['Rwanda', 'Cameroon', 'Pakistan', 'Malta', 'Liberia'],
    outliers: ['USA', 'UK', 'Australia', 'Canada'],
  },
  {
    difficulty: 3,
    connection: "Things that can be struck but aren't hit",
    items: ['Deal', 'Pose', 'Match', 'Chord', 'Balance', 'Oil'],
    outliers: ['Ball', 'Person', 'Target', 'Drum'],
  },
  {
    difficulty: 3,
    connection: 'Words spelled with alternating hands on keyboard',
    items: ['Downtown', 'Problematic', 'Dismay', 'Authentic'],
    outliers: ['Street', 'Area', 'Minimum', 'Million'],
  },
  {
    difficulty: 3,
    connection: 'Things with waves but not water',
    items: ['Hair', 'Radio', 'Heat', 'Light', 'Sound', 'Microwave'],
    outliers: ['Ocean', 'Sea', 'Lake', 'River'],
  },
  {
    difficulty: 3,
    connection: 'Animals whose group names are also music terms',
    items: ['Swarm (bees)', 'Band (gorillas)', 'Choir (angels)'],
    outliers: ['Pack', 'Herd', 'Flock', 'School'],
  },
  {
    difficulty: 3,
    connection: "Things that can be loose but aren't tight",
    items: ['Cannon', 'Ends', 'Lips', 'Leaf', 'Change'],
    outliers: ['Rope', 'Belt', 'Knot', 'Screw'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have land both above and below the equator',
    items: ['Brazil', 'Indonesia', 'Kenya', 'Colombia', 'Ecuador'],
    outliers: ['Australia', 'USA', 'India', 'China'],
  },
  {
    difficulty: 3,
    connection: 'Things with backs but no fronts',
    items: ['Book', 'Chair', 'Hand', 'Quarterback', 'Setback'],
    outliers: ['House', 'Car', 'Person', 'Building'],
  },
  {
    difficulty: 3,
    connection: 'Words that become their opposites when you reverse them',
    items: ['Stressed/Desserts', 'Live/Evil', 'Diaper/Repaid'],
    outliers: ['Good/Bad', 'Hot/Cold', 'Big/Small', 'Fast/Slow'],
  },
  {
    difficulty: 3,
    connection: 'Things with soles but not shoes',
    items: ['Fish', 'Foot', 'Soul music', 'Dover (city)'],
    outliers: ['Boot', 'Sneaker', 'Sandal', 'Slipper'],
  },
  {
    difficulty: 3,
    connection: 'Countries whose flags feature weapons',
    items: ['Saudi Arabia', 'Mozambique', 'Kenya', 'Sri Lanka', 'Angola'],
    outliers: ['USA', 'UK', 'France', 'Japan'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be clean besides objects',
    items: ['Break', 'Slate', 'Bill of health', 'Conscience', 'Record'],
    outliers: ['Shirt', 'Car', 'Room', 'Dish'],
  },
  {
    difficulty: 3,
    connection: 'Words where removing the first and last letter gives the same word',
    items: ['Ozone', 'Ionic', 'Usurp'],
    outliers: ['Piano', 'Table', 'Chair', 'House'],
  },
  {
    difficulty: 3,
    connection: "Things with horns but aren't animals or instruments",
    items: ['Car', 'Dilemma', 'Plenty', 'Cape (geographic)'],
    outliers: ['Bull', 'Trumpet', 'French horn', 'Tuba'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have coastlines on three or more seas',
    items: ['Turkey', 'Russia', 'Egypt'],
    outliers: ['USA', 'UK', 'France', 'Australia'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be flat besides surfaces',
    items: ['Tire', 'Note (music)', 'Rate', 'Earth (historically)', 'Soda'],
    outliers: ['Table', 'Floor', 'Screen', 'Paper'],
  },
  {
    difficulty: 3,
    connection: 'Animals whose English names are also countries',
    items: ['Turkey', 'Guinea pig', 'Canary (islands)'],
    outliers: ['Lion', 'Tiger', 'Bear', 'Eagle'],
  },
  {
    difficulty: 3,
    connection: 'Things with strings but not puppets',
    items: ['Guitar', 'Theory', 'Beans', 'Pearls', 'Code'],
    outliers: ['Puppet', 'Marionette', 'Violin', 'Harp'],
  },
  {
    difficulty: 3,
    connection: 'Words where all letters have vertical symmetry',
    items: ['MATT', 'VITA', 'AWAIT', 'MAMA', 'QUOTA'],
    outliers: ['HELLO', 'WORLD', 'PEACE', 'EARTH'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be open besides doors',
    items: ['Mind', 'Relationship', 'Case', 'Season', 'Secret'],
    outliers: ['Window', 'Box', 'Gate', 'Lid'],
  },
  {
    difficulty: 3,
    connection: 'Countries whose capital cities start with different letters than the country',
    items: ['USA', 'Australia', 'Canada', 'Brazil', 'Turkey'],
    outliers: ['Mexico', 'Panama', 'Guatemala', 'Kuwait'],
  },
  {
    difficulty: 3,
    connection: "Things with floors but aren't buildings",
    items: ['Ocean', 'Forest', 'Car', 'Senate'],
    outliers: ['House', 'Office', 'School', 'Hospital'],
  },
  {
    difficulty: 3,
    connection: 'Words that are spelled differently in UK vs US English but pronounced the same',
    items: ['Color/Colour', 'Honor/Honour', 'Favorite/Favourite', 'Theater/Theatre'],
    outliers: ['Truck/Lorry', 'Apartment/Flat', 'Elevator/Lift', 'Sidewalk/Pavement'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be dead besides living things',
    items: ['End', 'Heat', 'Weight', 'Battery', 'Language'],
    outliers: ['Person', 'Animal', 'Plant', 'Flower'],
  },
  {
    difficulty: 3,
    connection: 'Planets with unusual rotations',
    items: ['Venus', 'Uranus', 'Pluto', 'Neptune'],
    outliers: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
  },
  {
    difficulty: 3,
    connection: 'Things with tails but not animals',
    items: ['Coat', 'Plane', 'Comet', 'Coin', 'Story'],
    outliers: ['Dog', 'Cat', 'Horse', 'Bird'],
  },
  {
    difficulty: 3,
    connection: 'Words that contain three double letters',
    items: ['Bookkeeper', 'Committee', 'Mississippi', 'Tennessee'],
    outliers: ['Hello', 'Balloon', 'Coffee', 'Pizza'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'sharp' (figuratively)",
    items: ['Tongue', 'Dresser', 'Mind', 'Pain', 'Note (music)'],
    outliers: ['Dull', 'Blunt', 'Flat', 'Soft'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have existed for less than 50 years',
    items: ['South Sudan', 'Kosovo', 'Montenegro', 'Timor-Leste'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 3,
    connection: "Things with wings but don't fly",
    items: ['Building', 'Chicken (cooked)', 'Stage', 'Political party', 'Buffalo (food)'],
    outliers: ['Bird', 'Plane', 'Butterfly', 'Bat'],
  },
  {
    difficulty: 3,
    connection: 'Words that mean opposite things in different contexts',
    items: ['Dust', 'Sanction', 'Cleave', 'Oversight', 'Screen'],
    outliers: ['Happy', 'Sad', 'Good', 'Bad'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be sweet besides food',
    items: ['Dreams', 'Revenge', 'Deal', 'Spot', 'Tooth'],
    outliers: ['Sugar', 'Candy', 'Chocolate', 'Cake'],
  },
  {
    difficulty: 3,
    connection: 'Countries entirely surrounded by one other country',
    items: ['Vatican City', 'San Marino', 'Lesotho'],
    outliers: ['Monaco', 'Andorra', 'Liechtenstein', 'Luxembourg'],
  },
  {
    difficulty: 3,
    connection: 'Things with pupils but not eyes',
    items: ['School', 'Camera', 'Lawyer'],
    outliers: ['Eye', 'Cat', 'Human', 'Owl'],
  },
  {
    difficulty: 3,
    connection: 'Words that are both nouns and verbs with different pronunciations',
    items: ['Record', 'Present', 'Contract', 'Object', 'Produce', 'Permit'],
    outliers: ['Run', 'Walk', 'Talk', 'Play'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be hard besides surfaces',
    items: ['Time', 'Feelings', 'Drive', 'Luck', 'Evidence'],
    outliers: ['Rock', 'Metal', 'Concrete', 'Diamond'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can taste with their feet',
    items: ['Butterfly', 'Fly', 'Bee', 'Catfish'],
    outliers: ['Dog', 'Cat', 'Bird', 'Fish'],
  },
  {
    difficulty: 3,
    connection: 'Things with bridges but not rivers',
    items: ['Nose', 'Guitar', 'Teeth', 'Card game', 'Ship'],
    outliers: ['River', 'Canyon', 'Valley', 'Road'],
  },
  {
    difficulty: 3,
    connection: 'Countries that have hosted the Olympics but no longer exist',
    items: ['Soviet Union', 'Yugoslavia', 'Nazi Germany'],
    outliers: ['USA', 'UK', 'France', 'Japan'],
  },
  {
    difficulty: 3,
    connection: 'Things with pockets but not clothing',
    items: ['Pool table', 'Air', 'Resistance', 'Calculator'],
    outliers: ['Pants', 'Jacket', 'Shirt', 'Coat'],
  },
  {
    difficulty: 3,
    connection: 'Words where each letter appears exactly twice',
    items: ['Intestines', 'Teammates', 'Caucasus'],
    outliers: ['Mississippi', 'Tennessee', 'Committee', 'Banana'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be bitter besides taste',
    items: ['End', 'Rivalry', 'Cold', 'Truth', 'Disappointment'],
    outliers: ['Coffee', 'Lemon', 'Medicine', 'Grapefruit'],
  },
  {
    difficulty: 3,
    connection: 'Animals that have been to space',
    items: ['Dog', 'Monkey', 'Cat', 'Frog', 'Fish', 'Spider'],
    outliers: ['Horse', 'Cow', 'Pig', 'Elephant'],
  },
  {
    difficulty: 3,
    connection: 'Things with needles but not sewing',
    items: ['Pine tree', 'Compass', 'Record player', 'Injection', 'Speedometer'],
    outliers: ['Thread', 'Fabric', 'Button', 'Thimble'],
  },
  {
    difficulty: 3,
    connection: 'Words spelled with only straight-line letters',
    items: ['WALK', 'TAXI', 'MILL', 'KNIFE', 'ALIVE'],
    outliers: ['BALL', 'GOOD', 'ROPE', 'SOUP'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be blind besides eyes',
    items: ['Date', 'Spot', 'Faith', 'Alley', 'Side'],
    outliers: ['Person', 'Cat', 'Bat', 'Mole'],
  },
  {
    difficulty: 3,
    connection: 'Countries whose names are also common English words',
    items: ['China', 'Turkey', 'Chile', 'Jordan', 'Georgia', 'Chad'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 3,
    connection: "Things with mouths but don't speak",
    items: ['River', 'Cave', 'Jar', 'Cannon', 'Volcano'],
    outliers: ['Person', 'Parrot', 'Phone', 'Radio'],
  },
  {
    difficulty: 3,
    connection: 'Words that gain a syllable when pluralized',
    items: ['House', 'Month', 'Mouth', 'Oath'],
    outliers: ['Cat', 'Dog', 'Book', 'Tree'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be light besides weight',
    items: ['Beer', 'Year', 'Sleeper', 'Bulb', 'Reading'],
    outliers: ['Feather', 'Air', 'Paper', 'Cloud'],
  },
  {
    difficulty: 3,
    connection: 'Elements named after places',
    items: ['Californium', 'Europium', 'Americium', 'Francium', 'Germanium', 'Polonium'],
    outliers: ['Einsteinium', 'Curium', 'Nobelium', 'Fermium'],
  },
  {
    difficulty: 3,
    connection: "Things with arms but can't hug",
    items: ['Chair', 'Clock', 'Starfish', 'Government', 'Law'],
    outliers: ['Person', 'Bear', 'Octopus', 'Robot'],
  },
  {
    difficulty: 3,
    connection: 'Words that double their last consonant to add -ed',
    items: ['Stop', 'Plan', 'Drop', 'Ship', 'Wrap'],
    outliers: ['Jump', 'Walk', 'Talk', 'Help'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be high besides altitude',
    items: ['Noon', 'Treason', 'Hopes', 'Stakes', 'Maintenance'],
    outliers: ['Mountain', 'Building', 'Plane', 'Cloud'],
  },
  {
    difficulty: 3,
    connection: 'Countries with the same name as their capital',
    items: ['Mexico', 'Panama', 'Guatemala', 'Kuwait', 'Singapore', 'Monaco'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 3,
    connection: 'Things with hearts but not alive',
    items: ['Artichoke', 'Card deck', 'City', 'Matter'],
    outliers: ['Person', 'Animal', 'Plant', 'Organ'],
  },
  {
    difficulty: 3,
    connection: 'Words where adding -ER changes the pronunciation of the base',
    items: ['Anger', 'Finger', 'Hunger', 'Linger'],
    outliers: ['Singer', 'Ringer', 'Bringer', 'Stinger'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be raw besides food',
    items: ['Deal', 'Nerve', 'Material', 'Emotion', 'Talent'],
    outliers: ['Meat', 'Fish', 'Vegetable', 'Egg'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can survive without heads',
    items: ['Cockroach', 'Chicken', 'Flatworm', 'Turtle'],
    outliers: ['Snake', 'Lizard', 'Fish', 'Frog'],
  },
  {
    difficulty: 3,
    connection: "Things with feet but don't walk",
    items: ['Table', 'Poem', 'Mountain', 'Bed', 'Ladder'],
    outliers: ['Person', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 3,
    connection: 'Words with silent B',
    items: ['Doubt', 'Debt', 'Subtle', 'Bomb', 'Climb', 'Comb'],
    outliers: ['Cab', 'Job', 'Bib', 'Rib'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'cold' (figuratively)",
    items: ['Shoulder', 'War', 'Case', 'Feet', 'Blood', 'Comfort'],
    outliers: ['Warm', 'Hot', 'Heated', 'Friendly'],
  },
  {
    difficulty: 3,
    connection: 'European capital cities',
    items: ['Madrid', 'Stockholm', 'Paris', 'Berlin', 'Rome', 'Vienna'],
    outliers: ['New York', 'Los Angeles', 'Tokyo', 'Sydney'],
  },
  {
    difficulty: 3,
    connection: "Things with lips but can't kiss",
    items: ['Jar', 'Cup', 'Wound', 'Canyon'],
    outliers: ['Person', 'Fish', 'Frog', 'Monkey'],
  },
  {
    difficulty: 3,
    connection: 'Words that are shorter in past tense',
    items: ['Seek/Sought', 'Bring/Brought', 'Think/Thought', 'Buy/Bought'],
    outliers: ['Walk/Walked', 'Talk/Talked', 'Jump/Jumped', 'Play/Played'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be dry besides moisture',
    items: ['Humor', 'Run', 'Cleaning', 'Ice', 'Wine'],
    outliers: ['Towel', 'Desert', 'Bone', 'Leaf'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can survive being cut in half',
    items: ['Planarian', 'Starfish', 'Sea cucumber', 'Earthworm'],
    outliers: ['Snake', 'Lizard', 'Fish', 'Frog'],
  },
  {
    difficulty: 3,
    connection: "Things with ears but can't hear",
    items: ['Corn', 'Pitcher', 'Mug', 'Cup'],
    outliers: ['Person', 'Dog', 'Cat', 'Elephant'],
  },
  {
    difficulty: 3,
    connection: 'Words that have all letters in alphabetical order',
    items: ['Almost', 'Chimps', 'Biopsy', 'Ghostly'],
    outliers: ['Alphabet', 'Letters', 'Ordered', 'Sorted'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be thick besides width',
    items: ['Skin', 'Plot', 'Accent', 'Air', 'Thieves'],
    outliers: ['Book', 'Wall', 'Rope', 'Board'],
  },
  {
    difficulty: 3,
    connection: 'Countries that span more than one continent',
    items: ['Russia', 'Turkey', 'Egypt', 'Kazakhstan', 'Indonesia'],
    outliers: ['USA', 'UK', 'France', 'Australia'],
  },
  {
    difficulty: 3,
    connection: "Things with bells but aren't musical",
    items: ['Door', 'Telephone', 'School', 'Wedding', 'Cat'],
    outliers: ['Church', 'Orchestra', 'Band', 'Choir'],
  },
  {
    difficulty: 3,
    connection: 'Words pronounced differently when capitalized',
    items: ['Nice', 'Polish', 'August', 'Reading', 'Lima'],
    outliers: ['Apple', 'London', 'Monday', 'January'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be fresh besides food',
    items: ['Start', 'Air', 'Coat of paint', 'Prince', 'Water'],
    outliers: ['Bread', 'Fruit', 'Vegetable', 'Fish'],
  },
  {
    difficulty: 3,
    connection: 'Animals that can drink seawater',
    items: ['Seagull', 'Albatross', 'Marine iguana', 'Sea turtle', 'Penguin'],
    outliers: ['Fish', 'Dolphin', 'Whale', 'Seal'],
  },
  {
    difficulty: 3,
    connection: 'Things with caps besides bottles',
    items: ['Knee', 'Mushroom', 'Salary', 'Snow', 'Baseball'],
    outliers: ['Bottle', 'Pen', 'Jar', 'Tube'],
  },
  {
    difficulty: 3,
    connection: 'Words where TI makes SH sound',
    items: ['Nation', 'Patient', 'Caution', 'Initial', 'Partial'],
    outliers: ['Time', 'Tiger', 'Tiny', 'Tip'],
  },

  // ==================== YEAR EXPANSION: 600+ MORE CATEGORIES ====================

  // EASY BATCH 2 (200 more)
  {
    difficulty: 1,
    connection: 'Pizza chains',
    items: ["Domino's", 'Pizza Hut', "Papa John's", 'Little Caesars'],
    outliers: ["McDonald's", 'Burger King', "Wendy's", 'KFC'],
  },
  {
    difficulty: 1,
    connection: 'Soft drinks',
    items: ['Coca-Cola', 'Pepsi', 'Sprite', 'Fanta', '7-Up', 'Mountain Dew'],
    outliers: ['Coffee', 'Tea', 'Milk', 'Juice'],
  },
  {
    difficulty: 1,
    connection: 'Types of chocolate',
    items: ['Dark', 'Milk', 'White', 'Semi-sweet', 'Bittersweet'],
    outliers: ['Vanilla', 'Strawberry', 'Caramel', 'Mint'],
  },
  {
    difficulty: 1,
    connection: 'Computer parts',
    items: ['Monitor', 'Keyboard', 'Mouse', 'CPU', 'Hard drive', 'RAM'],
    outliers: ['Engine', 'Tire', 'Brake', 'Wheel'],
  },
  {
    difficulty: 1,
    connection: 'Tropical fruits',
    items: ['Pineapple', 'Mango', 'Papaya', 'Coconut', 'Passion fruit'],
    outliers: ['Apple', 'Pear', 'Grape', 'Cherry'],
  },
  {
    difficulty: 1,
    connection: 'Winter sports',
    items: ['Skiing', 'Snowboarding', 'Ice skating', 'Hockey', 'Curling'],
    outliers: ['Swimming', 'Tennis', 'Golf', 'Soccer'],
  },
  {
    difficulty: 1,
    connection: 'String instruments',
    items: ['Guitar', 'Violin', 'Cello', 'Bass', 'Harp', 'Ukulele'],
    outliers: ['Drum', 'Trumpet', 'Flute', 'Piano'],
  },
  {
    difficulty: 1,
    connection: 'South American countries',
    items: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Ecuador'],
    outliers: ['Mexico', 'Spain', 'Portugal', 'Cuba'],
  },
  {
    difficulty: 1,
    connection: 'Breakfast drinks',
    items: ['Coffee', 'Orange juice', 'Milk', 'Tea', 'Smoothie'],
    outliers: ['Wine', 'Beer', 'Whiskey', 'Vodka'],
  },
  {
    difficulty: 1,
    connection: 'Types of rice',
    items: ['White', 'Brown', 'Jasmine', 'Basmati', 'Wild', 'Arborio'],
    outliers: ['Wheat', 'Oat', 'Barley', 'Corn'],
  },
  {
    difficulty: 1,
    connection: 'Streaming services',
    items: ['Netflix', 'Hulu', 'Disney+', 'Amazon Prime', 'HBO Max'],
    outliers: ['NBC', 'CBS', 'ABC', 'Fox'],
  },
  {
    difficulty: 1,
    connection: 'Social media apps',
    items: ['Instagram', 'TikTok', 'Snapchat', 'Twitter', 'Facebook'],
    outliers: ['Gmail', 'Word', 'Excel', 'Chrome'],
  },
  {
    difficulty: 1,
    connection: 'Dog breeds',
    items: ['Poodle', 'Bulldog', 'Beagle', 'Labrador', 'Husky', 'Dalmatian'],
    outliers: ['Persian', 'Siamese', 'Tabby', 'Maine Coon'],
  },
  {
    difficulty: 1,
    connection: 'Cat breeds',
    items: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Bengal'],
    outliers: ['Poodle', 'Beagle', 'Labrador', 'Bulldog'],
  },
  {
    difficulty: 1,
    connection: 'Brass instruments',
    items: ['Trumpet', 'Trombone', 'Tuba', 'French horn', 'Cornet'],
    outliers: ['Flute', 'Clarinet', 'Oboe', 'Saxophone'],
  },
  {
    difficulty: 1,
    connection: 'Woodwind instruments',
    items: ['Flute', 'Clarinet', 'Oboe', 'Bassoon', 'Saxophone'],
    outliers: ['Trumpet', 'Trombone', 'Tuba', 'French horn'],
  },
  {
    difficulty: 1,
    connection: 'Fast food breakfast items',
    items: ['Egg McMuffin', 'Hash browns', 'Pancakes', 'Breakfast burrito'],
    outliers: ['Big Mac', 'Whopper', 'Nuggets', 'Fries'],
  },
  {
    difficulty: 1,
    connection: 'Salad ingredients',
    items: ['Lettuce', 'Tomato', 'Cucumber', 'Croutons', 'Dressing'],
    outliers: ['Ice cream', 'Chocolate', 'Candy', 'Cake'],
  },
  {
    difficulty: 1,
    connection: 'Sandwich breads',
    items: ['White', 'Wheat', 'Rye', 'Sourdough', 'Ciabatta'],
    outliers: ['Rice', 'Pasta', 'Cereal', 'Oatmeal'],
  },
  {
    difficulty: 1,
    connection: 'Types of cookies',
    items: ['Chocolate chip', 'Oatmeal', 'Sugar', 'Peanut butter', 'Snickerdoodle'],
    outliers: ['Cake', 'Pie', 'Brownie', 'Muffin'],
  },
  {
    difficulty: 1,
    connection: 'Amusement park rides',
    items: ['Roller coaster', 'Ferris wheel', 'Bumper cars', 'Carousel', 'Log flume'],
    outliers: ['Escalator', 'Elevator', 'Stairs', 'Ramp'],
  },
  {
    difficulty: 1,
    connection: 'Types of sushi',
    items: ['California roll', 'Salmon', 'Tuna', 'Eel', 'Shrimp'],
    outliers: ['Pizza', 'Burger', 'Taco', 'Sandwich'],
  },
  {
    difficulty: 1,
    connection: 'Gym equipment',
    items: ['Treadmill', 'Dumbbell', 'Barbell', 'Bench', 'Elliptical'],
    outliers: ['Couch', 'Bed', 'Chair', 'Table'],
  },
  {
    difficulty: 1,
    connection: 'Types of tea',
    items: ['Green', 'Black', 'Oolong', 'White', 'Herbal', 'Chai'],
    outliers: ['Coffee', 'Soda', 'Juice', 'Milk'],
  },
  {
    difficulty: 1,
    connection: 'Shoe brands',
    items: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse'],
    outliers: ['Gucci', 'Prada', 'Chanel', 'Rolex'],
  },
  {
    difficulty: 1,
    connection: 'Sports with goals',
    items: ['Soccer', 'Hockey', 'Lacrosse', 'Water polo', 'Handball'],
    outliers: ['Tennis', 'Golf', 'Baseball', 'Track'],
  },
  {
    difficulty: 1,
    connection: 'Card games',
    items: ['Poker', 'Blackjack', 'Solitaire', 'Rummy', 'Bridge', 'Hearts'],
    outliers: ['Chess', 'Checkers', 'Monopoly', 'Scrabble'],
  },
  {
    difficulty: 1,
    connection: 'Types of meat',
    items: ['Beef', 'Pork', 'Chicken', 'Lamb', 'Turkey', 'Duck'],
    outliers: ['Tofu', 'Beans', 'Lentils', 'Mushroom'],
  },
  {
    difficulty: 1,
    connection: 'Cartoon mice',
    items: ['Mickey Mouse', 'Jerry', 'Speedy Gonzales', 'Fievel', 'Stuart Little'],
    outliers: ['Bugs Bunny', 'Donald Duck', 'Goofy', 'Pluto'],
  },
  {
    difficulty: 1,
    connection: 'Yellow cartoon characters',
    items: ['SpongeBob', 'Pikachu', 'Minion', 'Bart Simpson', 'Big Bird'],
    outliers: ['Elmo', 'Barney', 'Clifford', 'Blue'],
  },
  {
    difficulty: 1,
    connection: 'Things in a pencil case',
    items: ['Pencil', 'Eraser', 'Sharpener', 'Ruler', 'Pen'],
    outliers: ['Book', 'Desk', 'Chair', 'Backpack'],
  },
  {
    difficulty: 1,
    connection: 'Bathroom fixtures',
    items: ['Toilet', 'Sink', 'Bathtub', 'Shower', 'Mirror'],
    outliers: ['Bed', 'Couch', 'Table', 'Chair'],
  },
  {
    difficulty: 1,
    connection: 'Kitchen utensils',
    items: ['Fork', 'Knife', 'Spoon', 'Spatula', 'Ladle', 'Whisk'],
    outliers: ['Hammer', 'Screwdriver', 'Wrench', 'Pliers'],
  },
  {
    difficulty: 1,
    connection: 'Living room furniture',
    items: ['Couch', 'Coffee table', 'TV stand', 'Bookshelf', 'Armchair'],
    outliers: ['Toilet', 'Sink', 'Shower', 'Bathtub'],
  },
  {
    difficulty: 1,
    connection: 'Bedroom furniture',
    items: ['Bed', 'Dresser', 'Nightstand', 'Wardrobe', 'Mattress'],
    outliers: ['Stove', 'Refrigerator', 'Dishwasher', 'Microwave'],
  },
  {
    difficulty: 1,
    connection: 'Seafood',
    items: ['Shrimp', 'Lobster', 'Crab', 'Salmon', 'Tuna', 'Scallops'],
    outliers: ['Chicken', 'Beef', 'Pork', 'Lamb'],
  },
  {
    difficulty: 1,
    connection: 'Condiments',
    items: ['Ketchup', 'Mustard', 'Mayonnaise', 'Relish', 'Hot sauce'],
    outliers: ['Salt', 'Pepper', 'Sugar', 'Flour'],
  },
  {
    difficulty: 1,
    connection: 'Ice cream brands',
    items: ["Ben & Jerry's", 'Häagen-Dazs', 'Baskin-Robbins', 'Breyers'],
    outliers: ['Coca-Cola', 'Pepsi', 'Sprite', 'Fanta'],
  },
  {
    difficulty: 1,
    connection: 'Candy bars',
    items: ['Snickers', 'Milky Way', 'Twix', '3 Musketeers', 'Kit Kat'],
    outliers: ['Chips', 'Pretzels', 'Popcorn', 'Crackers'],
  },
  {
    difficulty: 1,
    connection: 'Salty snacks',
    items: ['Chips', 'Pretzels', 'Popcorn', 'Crackers', 'Nuts'],
    outliers: ['Candy', 'Chocolate', 'Ice cream', 'Cookies'],
  },
  {
    difficulty: 1,
    connection: 'Sports drinks',
    items: ['Gatorade', 'Powerade', 'BodyArmor', 'Propel'],
    outliers: ['Coca-Cola', 'Pepsi', 'Sprite', 'Fanta'],
  },
  {
    difficulty: 1,
    connection: 'Energy drinks',
    items: ['Red Bull', 'Monster', 'Rockstar', '5-Hour Energy', 'Bang'],
    outliers: ['Water', 'Milk', 'Juice', 'Tea'],
  },
  {
    difficulty: 1,
    connection: 'Water bottle brands',
    items: ['Dasani', 'Aquafina', 'Evian', 'Fiji', 'Poland Spring'],
    outliers: ['Coca-Cola', 'Pepsi', 'Gatorade', 'Juice'],
  },
  {
    difficulty: 1,
    connection: 'Types of nuts',
    items: ['Peanut', 'Almond', 'Cashew', 'Walnut', 'Pistachio', 'Pecan'],
    outliers: ['Apple', 'Orange', 'Banana', 'Grape'],
  },
  {
    difficulty: 1,
    connection: 'Types of seeds',
    items: ['Sunflower', 'Pumpkin', 'Sesame', 'Chia', 'Flax'],
    outliers: ['Peanut', 'Almond', 'Walnut', 'Cashew'],
  },
  {
    difficulty: 1,
    connection: 'Morning routines',
    items: ['Shower', 'Brush teeth', 'Eat breakfast', 'Get dressed', 'Coffee'],
    outliers: ['Sleep', 'Dinner', 'Movie', 'Party'],
  },
  {
    difficulty: 1,
    connection: 'Bedtime routines',
    items: ['Brush teeth', 'Pajamas', 'Read', 'Turn off lights', 'Set alarm'],
    outliers: ['Breakfast', 'Work', 'School', 'Exercise'],
  },
  {
    difficulty: 1,
    connection: 'School supplies',
    items: ['Notebook', 'Pencil', 'Backpack', 'Textbook', 'Calculator'],
    outliers: ['Pillow', 'Blanket', 'Mattress', 'Lamp'],
  },
  {
    difficulty: 1,
    connection: 'Art supplies',
    items: ['Paint', 'Brush', 'Canvas', 'Pencil', 'Eraser', 'Sketch pad'],
    outliers: ['Hammer', 'Screwdriver', 'Wrench', 'Pliers'],
  },
  {
    difficulty: 1,
    connection: 'Types of jackets',
    items: ['Denim', 'Leather', 'Bomber', 'Parka', 'Windbreaker'],
    outliers: ['Shorts', 'Skirt', 'Dress', 'Swimsuit'],
  },
  {
    difficulty: 1,
    connection: 'Types of pants',
    items: ['Jeans', 'Khakis', 'Sweatpants', 'Leggings', 'Cargo'],
    outliers: ['Shirt', 'Jacket', 'Hat', 'Shoes'],
  },
  {
    difficulty: 1,
    connection: 'T-shirt brands',
    items: ['Hanes', 'Fruit of the Loom', 'Gildan', 'Champion'],
    outliers: ['Rolex', 'Gucci', 'Prada', 'Chanel'],
  },
  {
    difficulty: 1,
    connection: 'Luxury brands',
    items: ['Gucci', 'Prada', 'Louis Vuitton', 'Chanel', 'Versace'],
    outliers: ['Walmart', 'Target', 'Costco', 'Amazon'],
  },
  {
    difficulty: 1,
    connection: 'Discount stores',
    items: ['Walmart', 'Target', 'Costco', 'Dollar General', 'Family Dollar'],
    outliers: ['Gucci', 'Prada', 'Chanel', 'Rolex'],
  },
  {
    difficulty: 1,
    connection: 'Coffee chains',
    items: ['Starbucks', "Dunkin'", "Peet's", 'Tim Hortons', 'Dutch Bros'],
    outliers: ["McDonald's", 'Burger King', "Wendy's", 'KFC'],
  },
  {
    difficulty: 1,
    connection: 'Donut chains',
    items: ['Krispy Kreme', "Dunkin'", 'Tim Hortons'],
    outliers: ['Starbucks', "McDonald's", 'Subway', 'KFC'],
  },
  {
    difficulty: 1,
    connection: 'Burger chains',
    items: ["McDonald's", 'Burger King', "Wendy's", 'Five Guys', 'In-N-Out'],
    outliers: ['Pizza Hut', "Domino's", "Papa John's", 'Little Caesars'],
  },
  {
    difficulty: 1,
    connection: 'Chicken chains',
    items: ['KFC', 'Chick-fil-A', 'Popeyes', "Raising Cane's", 'Wingstop'],
    outliers: ["McDonald's", 'Burger King', "Wendy's", 'Five Guys'],
  },
  {
    difficulty: 1,
    connection: 'Sandwich chains',
    items: ['Subway', "Jimmy John's", "Jersey Mike's", 'Firehouse Subs'],
    outliers: ["McDonald's", 'Burger King', 'KFC', 'Pizza Hut'],
  },
  {
    difficulty: 1,
    connection: 'Mexican food chains',
    items: ['Taco Bell', 'Chipotle', 'Qdoba', 'Del Taco', "Moe's"],
    outliers: ["McDonald's", 'KFC', 'Pizza Hut', 'Subway'],
  },
  {
    difficulty: 1,
    connection: 'Asian food chains',
    items: ['Panda Express', "P.F. Chang's", 'Benihana'],
    outliers: ["McDonald's", 'KFC', 'Taco Bell', 'Pizza Hut'],
  },
  {
    difficulty: 1,
    connection: 'Things on a desk',
    items: ['Computer', 'Lamp', 'Pen holder', 'Calendar', 'Stapler'],
    outliers: ['Bed', 'Couch', 'Refrigerator', 'Bathtub'],
  },
  {
    difficulty: 1,
    connection: 'Things in a backpack',
    items: ['Books', 'Notebook', 'Pencils', 'Laptop', 'Water bottle'],
    outliers: ['Television', 'Refrigerator', 'Bed', 'Couch'],
  },
  {
    difficulty: 1,
    connection: 'Things in a purse',
    items: ['Wallet', 'Keys', 'Phone', 'Lipstick', 'Tissues'],
    outliers: ['Laptop', 'Books', 'Umbrella', 'Lunch box'],
  },
  {
    difficulty: 1,
    connection: 'Things in a wallet',
    items: ['Cash', 'Credit cards', 'ID', 'Photos', 'Receipts'],
    outliers: ['Phone', 'Keys', 'Glasses', 'Watch'],
  },
  {
    difficulty: 1,
    connection: 'Percussion instruments',
    items: ['Drum', 'Cymbal', 'Tambourine', 'Xylophone', 'Triangle'],
    outliers: ['Guitar', 'Piano', 'Violin', 'Trumpet'],
  },
  {
    difficulty: 1,
    connection: 'Types of drums',
    items: ['Snare', 'Bass', 'Tom', 'Bongo', 'Conga', 'Djembe'],
    outliers: ['Guitar', 'Piano', 'Violin', 'Trumpet'],
  },
  {
    difficulty: 1,
    connection: 'Beatles songs',
    items: ['Hey Jude', 'Let It Be', 'Yesterday', 'Come Together', 'Help!'],
    outliers: ['Bohemian Rhapsody', 'Stairway to Heaven', 'Hotel California'],
  },
  {
    difficulty: 1,
    connection: 'Queen songs',
    items: ['Bohemian Rhapsody', 'We Will Rock You', 'We Are the Champions', 'Somebody to Love'],
    outliers: ['Hey Jude', 'Let It Be', 'Yesterday', 'Help!'],
  },
  {
    difficulty: 1,
    connection: 'Christmas songs',
    items: ['Jingle Bells', 'Silent Night', 'Rudolph', 'Frosty', 'White Christmas'],
    outliers: ['Happy Birthday', 'Auld Lang Syne', 'Star Spangled Banner'],
  },
  {
    difficulty: 1,
    connection: "Children's songs",
    items: ['Twinkle Twinkle', 'ABC Song', 'Wheels on the Bus', 'Old MacDonald'],
    outliers: ['Bohemian Rhapsody', 'Stairway to Heaven', 'Hotel California'],
  },
  {
    difficulty: 1,
    connection: 'National anthems',
    items: ['Star Spangled Banner', 'God Save the King', 'La Marseillaise', 'O Canada'],
    outliers: ['Happy Birthday', 'Jingle Bells', 'Twinkle Twinkle'],
  },
  {
    difficulty: 1,
    connection: 'Types of dresses',
    items: ['Maxi', 'Mini', 'Cocktail', 'Ball gown', 'Sundress'],
    outliers: ['Jeans', 'Pants', 'Shorts', 'Skirt'],
  },
  {
    difficulty: 1,
    connection: 'Types of skirts',
    items: ['Mini', 'Midi', 'Maxi', 'Pencil', 'A-line', 'Pleated'],
    outliers: ['Jeans', 'Pants', 'Shorts', 'Dress'],
  },
  {
    difficulty: 1,
    connection: 'Types of shirts',
    items: ['T-shirt', 'Polo', 'Button-down', 'Tank top', 'Blouse'],
    outliers: ['Pants', 'Jeans', 'Shorts', 'Skirt'],
  },
  {
    difficulty: 1,
    connection: 'Winter accessories',
    items: ['Scarf', 'Gloves', 'Beanie', 'Earmuffs', 'Mittens'],
    outliers: ['Sunglasses', 'Sandals', 'Shorts', 'Tank top'],
  },
  {
    difficulty: 1,
    connection: 'Summer accessories',
    items: ['Sunglasses', 'Sun hat', 'Sandals', 'Flip flops'],
    outliers: ['Scarf', 'Gloves', 'Beanie', 'Mittens'],
  },
  {
    difficulty: 1,
    connection: 'Jewelry',
    items: ['Ring', 'Necklace', 'Bracelet', 'Earring', 'Watch'],
    outliers: ['Hat', 'Scarf', 'Gloves', 'Belt'],
  },
  {
    difficulty: 1,
    connection: 'Precious stones',
    items: ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Amethyst'],
    outliers: ['Gold', 'Silver', 'Platinum', 'Bronze'],
  },
  {
    difficulty: 1,
    connection: 'Precious metals',
    items: ['Gold', 'Silver', 'Platinum', 'Palladium'],
    outliers: ['Diamond', 'Ruby', 'Emerald', 'Sapphire'],
  },
  {
    difficulty: 1,
    connection: 'Olympic medals',
    items: ['Gold', 'Silver', 'Bronze'],
    outliers: ['Diamond', 'Ruby', 'Emerald', 'Platinum', 'Sapphire'],
  },
  {
    difficulty: 1,
    connection: 'Poker hands',
    items: ['Royal flush', 'Straight flush', 'Full house', 'Flush', 'Straight'],
    outliers: ['Checkmate', 'Yahtzee', 'Bingo', 'Touchdown'],
  },
  {
    difficulty: 1,
    connection: 'Chess pieces',
    items: ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'],
    outliers: ['Ace', 'Jack', 'Joker', 'Trump'],
  },
  {
    difficulty: 1,
    connection: 'Months starting with J',
    items: ['January', 'June', 'July'],
    outliers: ['March', 'May', 'August', 'December', 'April'],
  },
  {
    difficulty: 1,
    connection: 'Months starting with M',
    items: ['March', 'May'],
    outliers: ['January', 'February', 'April', 'June', 'July', 'August'],
  },
  {
    difficulty: 1,
    connection: 'Months starting with A',
    items: ['April', 'August'],
    outliers: ['January', 'February', 'March', 'May', 'June', 'July'],
  },
  {
    difficulty: 1,
    connection: 'Months with R in the name',
    items: [
      'January',
      'February',
      'March',
      'April',
      'September',
      'October',
      'November',
      'December',
    ],
    outliers: ['May', 'June', 'July', 'August'],
  },
  {
    difficulty: 1,
    connection: 'Days starting with T',
    items: ['Tuesday', 'Thursday'],
    outliers: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
  },
  {
    difficulty: 1,
    connection: 'Days starting with S',
    items: ['Saturday', 'Sunday'],
    outliers: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    difficulty: 1,
    connection: 'Primary school grades',
    items: ['First', 'Second', 'Third', 'Fourth', 'Fifth'],
    outliers: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
  },
  {
    difficulty: 1,
    connection: 'High school grades',
    items: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    outliers: ['First', 'Second', 'Third', 'Fourth'],
  },
  {
    difficulty: 1,
    connection: 'Letter grades',
    items: ['A', 'B', 'C', 'D', 'F'],
    outliers: ['1', '2', '3', '4', '5'],
  },
  {
    difficulty: 1,
    connection: 'Blood types',
    items: ['A', 'B', 'AB', 'O'],
    outliers: ['C', 'D', 'E', 'F'],
  },
  {
    difficulty: 1,
    connection: 'Types of exercise',
    items: ['Running', 'Swimming', 'Cycling', 'Yoga', 'Weightlifting'],
    outliers: ['Sleeping', 'Eating', 'Reading', 'Watching TV'],
  },
  {
    difficulty: 1,
    connection: 'Yoga poses',
    items: ['Downward dog', 'Warrior', 'Tree', 'Cobra', "Child's pose"],
    outliers: ['Squat', 'Bench press', 'Deadlift', 'Pull-up'],
  },
  {
    difficulty: 1,
    connection: 'Track events',
    items: ['100m', '200m', '400m', 'Hurdles', 'Relay', 'Marathon'],
    outliers: ['Swimming', 'Cycling', 'Tennis', 'Golf'],
  },
  {
    difficulty: 1,
    connection: 'Swimming strokes',
    items: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'],
    outliers: ['Running', 'Cycling', 'Walking', 'Jumping'],
  },
  {
    difficulty: 1,
    connection: 'Golf terms',
    items: ['Birdie', 'Eagle', 'Bogey', 'Par', 'Hole in one'],
    outliers: ['Touchdown', 'Home run', 'Goal', 'Basket'],
  },
  {
    difficulty: 1,
    connection: 'Tennis terms',
    items: ['Love', 'Deuce', 'Ace', 'Serve', 'Volley', 'Match point'],
    outliers: ['Goal', 'Touchdown', 'Home run', 'Basket'],
  },
  {
    difficulty: 1,
    connection: 'Basketball positions',
    items: ['Point guard', 'Shooting guard', 'Center', 'Power forward', 'Small forward'],
    outliers: ['Quarterback', 'Pitcher', 'Goalie', 'Striker'],
  },
  {
    difficulty: 1,
    connection: 'Football positions',
    items: ['Quarterback', 'Running back', 'Wide receiver', 'Linebacker', 'Cornerback'],
    outliers: ['Point guard', 'Center', 'Pitcher', 'Goalie'],
  },
  {
    difficulty: 1,
    connection: 'Soccer positions',
    items: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker'],
    outliers: ['Quarterback', 'Pitcher', 'Point guard', 'Center'],
  },
  {
    difficulty: 1,
    connection: 'Baseball positions',
    items: ['Pitcher', 'Catcher', 'First base', 'Shortstop', 'Outfield'],
    outliers: ['Quarterback', 'Goalkeeper', 'Point guard', 'Wide receiver'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with N',
    items: [
      'New York',
      'New Jersey',
      'Nevada',
      'Nebraska',
      'North Carolina',
      'North Dakota',
      'New Mexico',
      'New Hampshire',
    ],
    outliers: ['California', 'Texas', 'Florida', 'Arizona'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with C',
    items: ['California', 'Colorado', 'Connecticut'],
    outliers: ['New York', 'Texas', 'Florida', 'Arizona'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with M',
    items: [
      'Michigan',
      'Minnesota',
      'Missouri',
      'Mississippi',
      'Montana',
      'Maine',
      'Maryland',
      'Massachusetts',
    ],
    outliers: ['California', 'Texas', 'Florida', 'Arizona'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with W',
    items: ['Washington', 'Wisconsin', 'Wyoming', 'West Virginia'],
    outliers: ['California', 'Texas', 'Florida', 'Arizona'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with A',
    items: ['Alabama', 'Alaska', 'Arizona', 'Arkansas'],
    outliers: ['California', 'Texas', 'Florida', 'New York'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with O',
    items: ['Ohio', 'Oklahoma', 'Oregon'],
    outliers: ['California', 'Texas', 'Florida', 'New York', 'Arizona'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with I',
    items: ['Idaho', 'Illinois', 'Indiana', 'Iowa'],
    outliers: ['California', 'Texas', 'Florida', 'New York'],
  },
  {
    difficulty: 1,
    connection: 'US states starting with T',
    items: ['Tennessee', 'Texas'],
    outliers: ['California', 'Florida', 'New York', 'Arizona', 'Ohio'],
  },
  {
    difficulty: 1,
    connection: 'Things that are blue',
    items: ['Sky', 'Ocean', 'Blueberry', 'Sapphire', 'Jeans'],
    outliers: ['Grass', 'Sun', 'Apple', 'Cherry'],
  },
  {
    difficulty: 1,
    connection: 'Things that are white',
    items: ['Snow', 'Milk', 'Cloud', 'Paper', 'Salt'],
    outliers: ['Grass', 'Sky', 'Apple', 'Cherry'],
  },
  {
    difficulty: 1,
    connection: 'Things that are black',
    items: ['Night', 'Coal', 'Ink', 'Licorice', 'Crow'],
    outliers: ['Snow', 'Milk', 'Cloud', 'Sun'],
  },
  {
    difficulty: 1,
    connection: 'Things that are orange',
    items: ['Orange', 'Carrot', 'Pumpkin', 'Traffic cone', 'Goldfish'],
    outliers: ['Apple', 'Grass', 'Sky', 'Snow'],
  },
  {
    difficulty: 1,
    connection: 'Things that are purple',
    items: ['Grape', 'Eggplant', 'Lavender', 'Plum', 'Violet'],
    outliers: ['Orange', 'Carrot', 'Banana', 'Apple'],
  },
  {
    difficulty: 1,
    connection: 'Things that are pink',
    items: ['Flamingo', 'Bubblegum', 'Cotton candy', 'Pepto-Bismol', 'Pig'],
    outliers: ['Grass', 'Sky', 'Carrot', 'Banana'],
  },
  {
    difficulty: 1,
    connection: 'Things that are brown',
    items: ['Chocolate', 'Coffee', 'Wood', 'Dirt', 'Bear'],
    outliers: ['Snow', 'Milk', 'Sky', 'Grass'],
  },
  {
    difficulty: 1,
    connection: 'Things that are gray',
    items: ['Elephant', 'Cloud', 'Concrete', 'Ash', 'Mouse'],
    outliers: ['Sun', 'Grass', 'Apple', 'Orange'],
  },
  {
    difficulty: 1,
    connection: 'Things that are silver',
    items: ['Mirror', 'Coin', 'Spoon', 'Moon', 'Aluminum foil'],
    outliers: ['Sun', 'Grass', 'Apple', 'Orange'],
  },
  {
    difficulty: 1,
    connection: 'Things that are gold',
    items: ['Medal', 'Ring', 'Sun', 'Honey', 'Trophy'],
    outliers: ['Moon', 'Snow', 'Grass', 'Sky'],
  },

  // MEDIUM BATCH 2 (200 more)
  {
    difficulty: 2,
    connection: 'Brands that changed their name',
    items: [
      'Google (BackRub)',
      'Nike (Blue Ribbon)',
      "Pepsi (Brad's Drink)",
      'Best Buy (Sound of Music)',
    ],
    outliers: ['Apple', 'Microsoft', 'Amazon', 'Ford'],
  },
  {
    difficulty: 2,
    connection: 'Cities with more than one word',
    items: ['New York', 'Los Angeles', 'San Francisco', 'Las Vegas', 'New Orleans'],
    outliers: ['Chicago', 'Miami', 'Dallas', 'Boston'],
  },
  {
    difficulty: 2,
    connection: 'Countries with double letters in name',
    items: ['Greece', 'Finland', 'Philippines', 'Morocco', 'Mississippi'],
    outliers: ['France', 'Germany', 'Italy', 'Spain'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are orange',
    items: ['Carrot', 'Orange', 'Sweet potato', 'Mango', 'Cantaloupe'],
    outliers: ['Apple', 'Banana', 'Grape', 'Blueberry'],
  },
  {
    difficulty: 2,
    connection: 'Countries with coastlines on the Pacific',
    items: ['Japan', 'Australia', 'Chile', 'Canada', 'Peru', 'Mexico'],
    outliers: ['UK', 'France', 'Germany', 'Italy'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are extinct',
    items: ['Dinosaur', 'Dodo', 'Mammoth', 'Tasmanian tiger', 'Passenger pigeon'],
    outliers: ['Elephant', 'Lion', 'Tiger', 'Panda'],
  },
  {
    difficulty: 2,
    connection: 'Cities that hosted Super Bowls',
    items: ['Miami', 'New Orleans', 'Los Angeles', 'Tampa', 'Phoenix'],
    outliers: ['Chicago', 'Boston', 'Seattle', 'Denver'],
  },
  {
    difficulty: 2,
    connection: 'Countries that use the pound as currency',
    items: ['UK', 'Egypt', 'Lebanon', 'Syria'],
    outliers: ['USA', 'Japan', 'Germany', 'France'],
  },
  {
    difficulty: 2,
    connection: 'Words borrowed from Spanish',
    items: ['Rodeo', 'Plaza', 'Tornado', 'Canyon', 'Mosquito', 'Guerrilla'],
    outliers: ['Croissant', 'Piano', 'Karate', 'Safari'],
  },
  {
    difficulty: 2,
    connection: 'Animals that live in groups called prides',
    items: ['Lion'],
    outliers: ['Wolf', 'Elephant', 'Fish', 'Bird', 'Deer', 'Whale'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are colorblind',
    items: ['Dog', 'Cat', 'Bull', 'Seal', 'Raccoon'],
    outliers: ['Monkey', 'Bird', 'Fish', 'Butterfly'],
  },
  {
    difficulty: 2,
    connection: 'Foods that cause food coma',
    items: ['Turkey', 'Pasta', 'Mashed potatoes', 'Rice', 'Bread'],
    outliers: ['Salad', 'Celery', 'Apple', 'Carrot'],
  },
  {
    difficulty: 2,
    connection: 'Countries with red in their flag',
    items: ['USA', 'UK', 'China', 'Japan', 'Canada', 'France'],
    outliers: ['Jamaica', 'Sweden', 'Israel', 'Argentina'],
  },
  {
    difficulty: 2,
    connection: 'Countries without red in their flag',
    items: ['Jamaica', 'Sweden', 'Israel', 'Argentina', 'Cyprus'],
    outliers: ['USA', 'UK', 'China', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can fly backward',
    items: ['Hummingbird', 'Dragonfly'],
    outliers: ['Eagle', 'Sparrow', 'Pigeon', 'Crow', 'Hawk'],
  },
  {
    difficulty: 2,
    connection: 'Foods high in potassium',
    items: ['Banana', 'Potato', 'Avocado', 'Spinach', 'Coconut water'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Cereal'],
  },
  {
    difficulty: 2,
    connection: 'Countries with nuclear weapons',
    items: ['USA', 'Russia', 'UK', 'France', 'China', 'India', 'Pakistan'],
    outliers: ['Japan', 'Germany', 'Canada', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Cities with subways',
    items: ['New York', 'London', 'Paris', 'Tokyo', 'Moscow', 'Beijing'],
    outliers: ['Houston', 'Phoenix', 'Nashville', 'Indianapolis'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are actually berries',
    items: ['Banana', 'Avocado', 'Watermelon', 'Grape', 'Tomato'],
    outliers: ['Strawberry', 'Raspberry', 'Blackberry', 'Mulberry'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are poisonous to eat',
    items: ['Pufferfish', 'Poison dart frog', 'Box jellyfish', 'Blue-ringed octopus'],
    outliers: ['Salmon', 'Chicken', 'Beef', 'Pork'],
  },
  {
    difficulty: 2,
    connection: 'Countries with deserts',
    items: ['USA', 'China', 'Australia', 'Egypt', 'Chile', 'Iran'],
    outliers: ['UK', 'Germany', 'France', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Cities that were once capitals',
    items: ['Philadelphia', 'Kyoto', 'Istanbul', 'St. Petersburg', 'Rio de Janeiro'],
    outliers: ['New York', 'Chicago', 'Miami', 'Los Angeles'],
  },
  {
    difficulty: 2,
    connection: 'Animals with the best memory',
    items: ['Elephant', 'Dolphin', 'Chimpanzee', 'Crow', 'Octopus'],
    outliers: ['Goldfish', 'Chicken', 'Turkey', 'Mouse'],
  },
  {
    difficulty: 2,
    connection: 'Foods that boost immunity',
    items: ['Citrus', 'Garlic', 'Ginger', 'Spinach', 'Yogurt', 'Turmeric'],
    outliers: ['Candy', 'Soda', 'Chips', 'Cookies'],
  },
  {
    difficulty: 2,
    connection: 'Countries with Amazon rainforest',
    items: ['Brazil', 'Peru', 'Colombia', 'Ecuador', 'Bolivia'],
    outliers: ['USA', 'Mexico', 'Argentina', 'Chile'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are crepuscular',
    items: ['Deer', 'Rabbit', 'Cat', 'Hamster', 'Ferret'],
    outliers: ['Owl', 'Bat', 'Lion', 'Eagle'],
  },
  {
    difficulty: 2,
    connection: 'Cities at high altitude',
    items: ['Denver', 'Mexico City', 'Bogotá', 'La Paz', 'Addis Ababa'],
    outliers: ['Miami', 'New York', 'Los Angeles', 'Tokyo'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are superfoods',
    items: ['Blueberry', 'Salmon', 'Kale', 'Quinoa', 'Chia seeds', 'Acai'],
    outliers: ['Chips', 'Candy', 'Soda', 'Cookies'],
  },
  {
    difficulty: 2,
    connection: 'Countries on the silk road',
    items: ['China', 'Iran', 'Turkey', 'India', 'Uzbekistan'],
    outliers: ['USA', 'Brazil', 'Australia', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can live in saltwater and freshwater',
    items: ['Salmon', 'Eel', 'Bull shark', 'Sturgeon'],
    outliers: ['Goldfish', 'Trout', 'Tuna', 'Cod'],
  },
  {
    difficulty: 2,
    connection: 'Cities built on islands',
    items: ['Manhattan', 'Singapore', 'Hong Kong', 'Venice', 'Montreal'],
    outliers: ['Chicago', 'Dallas', 'Denver', 'Atlanta'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are aphrodisiacs',
    items: ['Oyster', 'Chocolate', 'Strawberry', 'Honey', 'Fig'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Cereal'],
  },
  {
    difficulty: 2,
    connection: 'Countries with mandatory military service',
    items: ['Israel', 'South Korea', 'Switzerland', 'Singapore', 'Norway'],
    outliers: ['USA', 'UK', 'Canada', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can survive without water for long',
    items: ['Camel', 'Giraffe', 'Thorny devil', 'Kangaroo rat', 'Koala'],
    outliers: ['Fish', 'Frog', 'Duck', 'Beaver'],
  },
  {
    difficulty: 2,
    connection: 'Cities named after people',
    items: ['Washington', 'Houston', 'Columbus', 'Jacksonville', 'Lincoln'],
    outliers: ['Chicago', 'Miami', 'Denver', 'Boston'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are natural antibiotics',
    items: ['Garlic', 'Honey', 'Ginger', 'Oregano oil', 'Turmeric'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Sugar'],
  },
  {
    difficulty: 2,
    connection: 'Countries with glaciers',
    items: ['Iceland', 'Switzerland', 'New Zealand', 'Argentina', 'Norway', 'Canada'],
    outliers: ['Egypt', 'Saudi Arabia', 'Australia', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are ambidextrous',
    items: ['Octopus', 'Cat', 'Mouse', 'Chameleon'],
    outliers: ['Human', 'Parrot', 'Chimpanzee', 'Gorilla'],
  },
  {
    difficulty: 2,
    connection: 'Cities with famous bridges',
    items: ['San Francisco', 'London', 'Sydney', 'New York', 'Venice'],
    outliers: ['Dallas', 'Denver', 'Phoenix', 'Atlanta'],
  },
  {
    difficulty: 2,
    connection: 'Foods high in omega-3',
    items: ['Salmon', 'Sardines', 'Walnuts', 'Flaxseed', 'Chia seeds'],
    outliers: ['Chicken', 'Beef', 'Pork', 'Turkey'],
  },
  {
    difficulty: 2,
    connection: 'Countries that drive on the right but were British colonies',
    items: ['USA', 'Canada', 'Egypt', 'Myanmar'],
    outliers: ['India', 'Australia', 'UK', 'Kenya'],
  },
  {
    difficulty: 2,
    connection: 'Animals with the longest lifespan',
    items: ['Tortoise', 'Whale', 'Elephant', 'Koi fish', 'Parrot', 'Clam'],
    outliers: ['Mouse', 'Rabbit', 'Hamster', 'Guinea pig'],
  },
  {
    difficulty: 2,
    connection: 'Cities with canals',
    items: ['Venice', 'Amsterdam', 'Bangkok', 'Bruges', 'St. Petersburg'],
    outliers: ['Paris', 'London', 'New York', 'Tokyo'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are natural energy boosters',
    items: ['Banana', 'Oatmeal', 'Eggs', 'Brown rice', 'Sweet potato'],
    outliers: ['Candy', 'Soda', 'Chips', 'Cookies'],
  },
  {
    difficulty: 2,
    connection: 'Countries with fjords',
    items: ['Norway', 'Iceland', 'New Zealand', 'Chile', 'Greenland'],
    outliers: ['France', 'Spain', 'Italy', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals that have electroreception',
    items: ['Shark', 'Platypus', 'Electric eel', 'Ray', 'Catfish'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Cities with ancient ruins',
    items: ['Rome', 'Athens', 'Cairo', 'Mexico City', 'Jerusalem'],
    outliers: ['New York', 'Chicago', 'Los Angeles', 'Miami'],
  },
  {
    difficulty: 2,
    connection: 'Foods that help sleep',
    items: ['Cherry', 'Kiwi', 'Milk', 'Almonds', 'Turkey', 'Chamomile tea'],
    outliers: ['Coffee', 'Soda', 'Energy drink', 'Chocolate'],
  },
  {
    difficulty: 2,
    connection: 'Countries that were never colonized',
    items: ['Thailand', 'Japan', 'Ethiopia', 'Liberia', 'Nepal'],
    outliers: ['India', 'Brazil', 'Australia', 'USA'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can detect cancer',
    items: ['Dog', 'Bee', 'Nematode', 'Pigeon'],
    outliers: ['Cat', 'Horse', 'Cow', 'Pig'],
  },
  {
    difficulty: 2,
    connection: 'Cities with famous walls',
    items: ['Berlin', 'Beijing', 'Jerusalem', 'Dubrovnik', "Xi'an"],
    outliers: ['New York', 'Chicago', 'Los Angeles', 'Miami'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are natural anti-inflammatory',
    items: ['Turmeric', 'Ginger', 'Berries', 'Fatty fish', 'Broccoli'],
    outliers: ['Sugar', 'Fried food', 'Red meat', 'Soda'],
  },
  {
    difficulty: 2,
    connection: 'Countries with rainforests',
    items: ['Brazil', 'Indonesia', 'Congo', 'Peru', 'Colombia', 'Malaysia'],
    outliers: ['Egypt', 'Saudi Arabia', 'Australia', 'UK'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are monogamous',
    items: ['Swan', 'Wolf', 'Penguin', 'Albatross', 'Eagle', 'Owl'],
    outliers: ['Lion', 'Gorilla', 'Elephant seal', 'Deer'],
  },
  {
    difficulty: 2,
    connection: 'Cities known for jazz',
    items: ['New Orleans', 'Chicago', 'New York', 'Kansas City'],
    outliers: ['Nashville', 'Austin', 'Los Angeles', 'Seattle'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are prebiotics',
    items: ['Garlic', 'Onion', 'Banana', 'Asparagus', 'Oats'],
    outliers: ['Chicken', 'Beef', 'Fish', 'Eggs'],
  },
  {
    difficulty: 2,
    connection: 'Countries with active geysers',
    items: ['Iceland', 'USA', 'New Zealand', 'Russia', 'Chile'],
    outliers: ['UK', 'France', 'Germany', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can regrow teeth',
    items: ['Shark', 'Alligator', 'Crocodile', 'Piranha'],
    outliers: ['Human', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Cities known for tech industry',
    items: ['San Francisco', 'Seattle', 'Austin', 'Boston', 'Bangalore'],
    outliers: ['Miami', 'New Orleans', 'Nashville', 'Detroit'],
  },
  {
    difficulty: 2,
    connection: 'Foods that lower blood pressure',
    items: ['Banana', 'Spinach', 'Beets', 'Oatmeal', 'Berries'],
    outliers: ['Salt', 'Bacon', 'Chips', 'Soda'],
  },
  {
    difficulty: 2,
    connection: 'Countries with hot springs',
    items: ['Iceland', 'Japan', 'New Zealand', 'Costa Rica', 'Hungary'],
    outliers: ['Egypt', 'Saudi Arabia', 'UK', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that hunt in packs',
    items: ['Wolf', 'Lion', 'Hyena', 'Orca', 'Wild dog'],
    outliers: ['Tiger', 'Leopard', 'Bear', 'Eagle'],
  },
  {
    difficulty: 2,
    connection: 'Cities known for fashion',
    items: ['Paris', 'Milan', 'New York', 'London', 'Tokyo'],
    outliers: ['Dallas', 'Denver', 'Phoenix', 'Atlanta'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are natural diuretics',
    items: ['Coffee', 'Watermelon', 'Cucumber', 'Celery', 'Asparagus'],
    outliers: ['Bread', 'Rice', 'Pasta', 'Meat'],
  },
  {
    difficulty: 2,
    connection: 'Countries with coral reefs',
    items: ['Australia', 'Philippines', 'Indonesia', 'Belize', 'Egypt'],
    outliers: ['UK', 'Germany', 'Russia', 'Canada'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can see UV light',
    items: ['Bee', 'Butterfly', 'Reindeer', 'Bird', 'Fish'],
    outliers: ['Human', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Cities known for music',
    items: ['Nashville', 'Austin', 'Memphis', 'New Orleans', 'Detroit'],
    outliers: ['Wall Street', 'Silicon Valley', 'Hollywood', 'Las Vegas'],
  },
  {
    difficulty: 2,
    connection: 'Foods that boost brain function',
    items: ['Blueberries', 'Walnuts', 'Salmon', 'Turmeric', 'Dark chocolate'],
    outliers: ['Candy', 'Soda', 'Chips', 'Cookies'],
  },
  {
    difficulty: 2,
    connection: 'Countries with penguins',
    items: ['Antarctica', 'Argentina', 'South Africa', 'New Zealand', 'Chile'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals with the best eyesight',
    items: ['Eagle', 'Hawk', 'Owl', 'Falcon', 'Cat'],
    outliers: ['Mole', 'Bat', 'Worm', 'Cave fish'],
  },
  {
    difficulty: 2,
    connection: 'Cities known for gambling',
    items: ['Las Vegas', 'Macau', 'Monte Carlo', 'Atlantic City'],
    outliers: ['New York', 'Chicago', 'Los Angeles', 'Miami'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are natural pain relievers',
    items: ['Ginger', 'Turmeric', 'Cherry', 'Coffee', 'Peppermint'],
    outliers: ['Candy', 'Soda', 'Chips', 'Cookies'],
  },
  {
    difficulty: 2,
    connection: 'Countries with midnight sun',
    items: ['Norway', 'Sweden', 'Finland', 'Iceland', 'Alaska', 'Canada'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals with the strongest bite',
    items: ['Crocodile', 'Hippo', 'Jaguar', 'Gorilla', 'Hyena'],
    outliers: ['Dog', 'Cat', 'Rabbit', 'Mouse'],
  },
  {
    difficulty: 2,
    connection: 'Cities known for finance',
    items: ['New York', 'London', 'Hong Kong', 'Singapore', 'Tokyo'],
    outliers: ['Nashville', 'Austin', 'Miami', 'Seattle'],
  },

  // HARD BATCH 2 (160 more)
  {
    difficulty: 3,
    connection: 'Things that can be loaded',
    items: ['Gun', 'Question', 'Dice', 'Dishwasher', 'Truck', 'Software'],
    outliers: ['Book', 'Chair', 'Table', 'Lamp'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be raised besides lifted',
    items: ['Eyebrow', 'Question', 'Stakes', 'Children', 'Funds', 'Awareness'],
    outliers: ['Box', 'Weight', 'Ball', 'Hand'],
  },
  {
    difficulty: 3,
    connection: 'Things with spines besides books',
    items: ['Cactus', 'Porcupine', 'Fish', 'Human', 'Hedgehog'],
    outliers: ['Book', 'Notebook', 'Magazine', 'Novel'],
  },
  {
    difficulty: 3,
    connection: 'Words that change meaning with stress',
    items: ['Present', 'Record', 'Produce', 'Object', 'Permit'],
    outliers: ['Walk', 'Talk', 'Run', 'Jump'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'bounced' (figuratively)",
    items: ['Check', 'Idea', 'Baby', 'Light', 'Email'],
    outliers: ['Stick', 'Glue', 'Anchor', 'Magnet'],
  },
  {
    difficulty: 3,
    connection: 'Things with skins besides fruit',
    items: ['Grape', 'Potato', 'Drum', 'Sausage', 'Milk'],
    outliers: ['Human', 'Animal', 'Fish', 'Snake'],
  },
  {
    difficulty: 3,
    connection: 'Words where G is silent',
    items: ['Gnome', 'Sign', 'Reign', 'Gnat', 'Design', 'Align'],
    outliers: ['Go', 'Good', 'Great', 'Give'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be fixed',
    items: ['Race', 'Fight', 'Meal', 'Problem', 'Price'],
    outliers: ['Broken', 'Lost', 'Missing', 'Wrong'],
  },
  {
    difficulty: 3,
    connection: 'Things with points besides tips',
    items: ['Compass', 'Score', 'Argument', 'Decimal', 'Knife'],
    outliers: ['Pencil', 'Pin', 'Needle', 'Thorn'],
  },
  {
    difficulty: 3,
    connection: 'Words where L is silent',
    items: ['Calm', 'Palm', 'Walk', 'Talk', 'Folk', 'Half'],
    outliers: ['Lamp', 'Light', 'Love', 'Land'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'solid' (figuratively)",
    items: ['Gold', 'Ground', 'Advice', 'Evidence', 'Foundation'],
    outliers: ['Liquid', 'Flimsy', 'Weak', 'Shaky'],
  },
  {
    difficulty: 3,
    connection: 'Things with cores besides apples',
    items: ['Earth', 'Reactor', 'Values', 'Exercise', 'Memory'],
    outliers: ['Apple', 'Pear', 'Peach', 'Plum'],
  },
  {
    difficulty: 3,
    connection: 'Words where W is silent',
    items: ['Write', 'Wrong', 'Wrap', 'Wreck', 'Wrist', 'Answer'],
    outliers: ['Water', 'Want', 'Walk', 'Work'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be crude',
    items: ['Oil', 'Joke', 'Drawing', 'Language', 'Estimate'],
    outliers: ['Rude', 'Mean', 'Bad', 'Ugly'],
  },
  {
    difficulty: 3,
    connection: 'Things with shells besides eggs',
    items: ['Company', 'Game', 'Beach', 'Shock', 'Tortilla'],
    outliers: ['Egg', 'Nut', 'Turtle', 'Crab'],
  },
  {
    difficulty: 3,
    connection: 'Words where H is silent at start',
    items: ['Hour', 'Honest', 'Honor', 'Heir'],
    outliers: ['House', 'Happy', 'High', 'Help'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'deep' (figuratively)",
    items: ['Thought', 'Trouble', 'Voice', 'State', 'End', 'Pockets'],
    outliers: ['Shallow', 'Surface', 'Light', 'Simple'],
  },
  {
    difficulty: 3,
    connection: 'Things with plates besides dishes',
    items: ['License', 'Tectonic', 'Home', 'Dental', 'Fashion'],
    outliers: ['Dish', 'Dinner', 'Food', 'Table'],
  },
  {
    difficulty: 3,
    connection: 'Words where T is silent',
    items: ['Castle', 'Listen', 'Whistle', 'Fasten', 'Mortgage'],
    outliers: ['Time', 'Table', 'Talk', 'Take'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be steep',
    items: ['Price', 'Learning curve', 'Climb', 'Hill', 'Tea'],
    outliers: ['Tall', 'High', 'Big', 'Large'],
  },
  {
    difficulty: 3,
    connection: 'Things with frames besides pictures',
    items: ['Mind', 'Reference', 'Time', 'Door', 'Bicycle'],
    outliers: ['Picture', 'Photo', 'Painting', 'Art'],
  },
  {
    difficulty: 3,
    connection: 'Words with all letters below the line',
    items: ['Puppy', 'Gypsy', 'Pygmy'],
    outliers: ['Hello', 'World', 'Happy', 'Great'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be clean',
    items: ['Break', 'Slate', 'Bill of health', 'Sweep', 'Getaway'],
    outliers: ['Shirt', 'Car', 'Room', 'Dish'],
  },
  {
    difficulty: 3,
    connection: 'Things with bands besides music',
    items: ['Rubber', 'Wedding', 'Frequency', 'Resistance', 'Elastic'],
    outliers: ['Music', 'Rock', 'Jazz', 'Pop'],
  },
  {
    difficulty: 3,
    connection: 'Words that are spelled with silent letters',
    items: ['Knife', 'Knee', 'Know', 'Knight', 'Knock'],
    outliers: ['Cat', 'Dog', 'Run', 'Walk'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be rough',
    items: ['Estimate', 'Draft', 'Patch', 'Diamond', 'Neighborhood'],
    outliers: ['Sandpaper', 'Rock', 'Bark', 'Gravel'],
  },
  {
    difficulty: 3,
    connection: 'Things with lines besides drawn',
    items: ['Pick-up', 'Assembly', 'Punch', 'Fishing', 'Finish'],
    outliers: ['Drawing', 'Paper', 'Pencil', 'Ruler'],
  },
  {
    difficulty: 3,
    connection: 'Words with double meanings (heteronyms)',
    items: ['Bass', 'Bow', 'Lead', 'Row', 'Tear', 'Wind'],
    outliers: ['Walk', 'Talk', 'Run', 'Jump'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be blind',
    items: ['Date', 'Spot', 'Side', 'Trust', 'Faith'],
    outliers: ['Person', 'Cat', 'Mole', 'Bat'],
  },
  {
    difficulty: 3,
    connection: 'Things with bridges besides rivers',
    items: ['Nose', 'Guitar', 'Ship', 'Card', 'Dental'],
    outliers: ['River', 'Valley', 'Canyon', 'Road'],
  },
  {
    difficulty: 3,
    connection: 'Compound words using body parts',
    items: ['Headache', 'Earring', 'Eyebrow', 'Kneecap', 'Thumbnail'],
    outliers: ['Walking', 'Running', 'Jumping', 'Swimming'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'soft' (figuratively)",
    items: ['Spot', 'Skills', 'Landing', 'Opening', 'Drink', 'Touch'],
    outliers: ['Hard', 'Firm', 'Tough', 'Rough'],
  },
  {
    difficulty: 3,
    connection: 'Things with loops besides rope',
    items: ['Fruit', 'Feedback', 'Audio', 'Infinity', 'Closed'],
    outliers: ['Rope', 'String', 'Wire', 'Thread'],
  },
  {
    difficulty: 3,
    connection: 'Words where -TION sounds like -SHUN',
    items: ['Nation', 'Station', 'Vacation', 'Education', 'Relation'],
    outliers: ['Question', 'Suggestion', 'Digestion', 'Congestion'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be slim',
    items: ['Chance', 'Pickings', 'Jim', 'Margin', 'Volume'],
    outliers: ['Thin', 'Skinny', 'Narrow', 'Slender'],
  },
  {
    difficulty: 3,
    connection: 'Things with spots besides dalmatians',
    items: ['Blind', 'Age', 'Trouble', 'Hot', 'Sweet'],
    outliers: ['Dog', 'Leopard', 'Cheetah', 'Giraffe'],
  },
  {
    difficulty: 3,
    connection: 'Words where -SION sounds like -ZHUN',
    items: ['Vision', 'Decision', 'Television', 'Division', 'Collision'],
    outliers: ['Mission', 'Session', 'Passion', 'Permission'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'full' (figuratively)",
    items: ['Swing', 'Circle', 'Moon', 'Disclosure', 'Steam ahead'],
    outliers: ['Empty', 'Partial', 'Half', 'Incomplete'],
  },
  {
    difficulty: 3,
    connection: 'Things with marks besides grades',
    items: ['Question', 'Exclamation', 'Birth', 'Stretch', 'Trade'],
    outliers: ['Grade', 'Score', 'Point', 'Rating'],
  },
  {
    difficulty: 3,
    connection: 'Words ending in -MB where B is silent',
    items: [
      'Bomb',
      'Climb',
      'Comb',
      'Crumb',
      'Dumb',
      'Lamb',
      'Limb',
      'Numb',
      'Plumb',
      'Thumb',
      'Tomb',
    ],
    outliers: ['Amber', 'Timber', 'Chamber', 'Member'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'heavy' (figuratively)",
    items: ['Heart', 'Traffic', 'Hand', 'Sleeper', 'Rain', 'Lifting'],
    outliers: ['Light', 'Airy', 'Featherweight', 'Weightless'],
  },
  {
    difficulty: 3,
    connection: 'Things with teeth besides animals',
    items: ['Gear', 'Comb', 'Zipper', 'Saw'],
    outliers: ['Dog', 'Shark', 'Lion', 'Human'],
  },
  {
    difficulty: 3,
    connection: 'Words spelled with -OUGH making different sounds',
    items: ['Through', 'Though', 'Tough', 'Cough', 'Bough', 'Thought'],
    outliers: ['Dough', 'Enough', 'Plough', 'Drought'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'wild' (figuratively)",
    items: ['Card', 'Guess', 'Goose chase', 'Fire', 'Imagination'],
    outliers: ['Tame', 'Domestic', 'Controlled', 'Mild'],
  },
  {
    difficulty: 3,
    connection: 'Things with heads besides bodies',
    items: ['Lettuce', 'Nail', 'Bed', 'River', 'Department'],
    outliers: ['Human', 'Animal', 'Fish', 'Bird'],
  },
  {
    difficulty: 3,
    connection: 'Palindrome phrases',
    items: [
      'A man a plan a canal Panama',
      'Race car',
      "Madam I'm Adam",
      'Was it a car or a cat I saw',
    ],
    outliers: ['Hello world', 'Good morning', 'How are you', 'Nice day'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'hot' (figuratively)",
    items: ['Dog', 'Potato', 'Streak', 'Mess', 'Topic', 'Water'],
    outliers: ['Cold', 'Cool', 'Lukewarm', 'Chilly'],
  },
  {
    difficulty: 3,
    connection: 'Things with forks besides utensils',
    items: ['Road', 'Tuning', 'Pitch', 'River', 'Lightning'],
    outliers: ['Spoon', 'Knife', 'Plate', 'Bowl'],
  },
  {
    difficulty: 3,
    connection: 'Words where -EAD sounds like -ED',
    items: ['Bread', 'Dead', 'Head', 'Lead', 'Read', 'Thread', 'Spread'],
    outliers: ['Bead', 'Read', 'Plead', 'Mead'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be late besides time',
    items: ['Great', 'Night', 'Fee', 'Comer', 'Bloomer'],
    outliers: ['Watch', 'Clock', 'Bus', 'Train'],
  },
  {
    difficulty: 3,
    connection: 'Things with veins besides bodies',
    items: ['Leaf', 'Marble', 'Ore', 'Wood'],
    outliers: ['Arm', 'Leg', 'Hand', 'Neck'],
  },
  {
    difficulty: 3,
    connection: 'Words ending in -GUE where UE is silent',
    items: ['Tongue', 'League', 'Plague', 'Vague', 'Rogue', 'Vogue'],
    outliers: ['Argue', 'Fugue', 'Segue', 'Dengue'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be close besides distance',
    items: ['Call', 'Shave', 'Encounter', 'Friend', 'Quarters'],
    outliers: ['Near', 'Next', 'Beside', 'Adjacent'],
  },
  {
    difficulty: 3,
    connection: 'Things with roots besides plants',
    items: ['Hair', 'Square', 'Problem', 'Word', 'Grass'],
    outliers: ['Tree', 'Flower', 'Bush', 'Carrot'],
  },
  {
    difficulty: 3,
    connection: 'Oxymorons',
    items: ['Jumbo shrimp', 'Virtual reality', 'Open secret', 'Living dead', 'Deafening silence'],
    outliers: ['Big small', 'Hot cold', 'Fast slow', 'Up down'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be even besides numbers',
    items: ['Stevens', 'Money', 'Temper', 'Keel', 'Score'],
    outliers: ['Two', 'Four', 'Six', 'Eight'],
  },
  {
    difficulty: 3,
    connection: 'Things with bars besides prisons',
    items: ['Chocolate', 'Gold', 'Soap', 'Salad', 'Monkey'],
    outliers: ['Jail', 'Cell', 'Prison', 'Cage'],
  },
  {
    difficulty: 3,
    connection: 'Words where -OULD sounds like -OOD',
    items: ['Could', 'Would', 'Should'],
    outliers: ['Mould', 'Boulder', 'Shoulder', 'Smoulder'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be straight besides lines',
    items: ['Face', 'Shooter', 'Answer', 'Flush', 'Jacket'],
    outliers: ['Line', 'Road', 'Path', 'Edge'],
  },
  {
    difficulty: 3,
    connection: 'Things with strings besides instruments',
    items: ['Beans', 'Theory', 'Bikini', 'Puppet', 'Cheese'],
    outliers: ['Guitar', 'Violin', 'Harp', 'Cello'],
  },
  {
    difficulty: 3,
    connection: 'Portmanteau words',
    items: ['Brunch', 'Smog', 'Motel', 'Podcast', 'Blog', 'Emoticon'],
    outliers: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be false besides lies',
    items: ['Start', 'Alarm', 'Bottom', 'Teeth', 'Positive'],
    outliers: ['Lie', 'Fib', 'Untruth', 'Fabrication'],
  },
  {
    difficulty: 3,
    connection: 'Things with trunks besides elephants',
    items: ['Car', 'Tree', 'Swimming', 'Suitcase', 'Body'],
    outliers: ['Elephant', 'Mammoth', 'Mastodon', 'Tapir'],
  },
  {
    difficulty: 3,
    connection: 'Words where -OUGH sounds like -OFF',
    items: ['Cough', 'Trough'],
    outliers: ['Through', 'Though', 'Bough', 'Dough', 'Rough', 'Tough'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be just besides fair',
    items: ['Cause', 'Deserts', 'In time', 'About', 'Kidding'],
    outliers: ['Fair', 'Equal', 'Right', 'Proper'],
  },
  {
    difficulty: 3,
    connection: 'Things with wells besides water',
    items: ['Ink', 'Stair', 'Wishing', 'Oil', 'Fare'],
    outliers: ['Water', 'Ground', 'Spring', 'Artesian'],
  },
  {
    difficulty: 3,
    connection: 'Words that are their own plurals',
    items: ['Sheep', 'Deer', 'Fish', 'Moose', 'Species', 'Aircraft'],
    outliers: ['Dog', 'Cat', 'Bird', 'Horse'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be rare besides uncommon',
    items: ['Earth', 'Steak', 'Bird', 'Book', 'Gem'],
    outliers: ['Uncommon', 'Unusual', 'Scarce', 'Infrequent'],
  },
  {
    difficulty: 3,
    connection: 'Things with holes besides objects',
    items: ['Black', 'Plot', 'Ace', 'Watering', 'Loop'],
    outliers: ['Donut', 'Bagel', 'Tire', 'Ring'],
  },
  {
    difficulty: 3,
    connection: "Eponyms (words from people's names)",
    items: ['Sandwich', 'Diesel', 'Jacuzzi', 'Silhouette', 'Guillotine'],
    outliers: ['Burger', 'Pizza', 'Taco', 'Pasta'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'green' (figuratively)",
    items: ['Light', 'Thumb', 'Card', 'Room', 'Envy'],
    outliers: ['Red', 'Blue', 'Yellow', 'Purple'],
  },
  {
    difficulty: 3,
    connection: 'Things with pipes besides plumbing',
    items: ['Bag', 'Organ', 'Peace', 'Pan', 'Wind'],
    outliers: ['Water', 'Drain', 'Sewer', 'Tube'],
  },
  {
    difficulty: 3,
    connection: 'Words borrowed from Dutch',
    items: ['Cookie', 'Coleslaw', 'Boss', 'Landscape', 'Yacht', 'Sleigh'],
    outliers: ['Croissant', 'Pizza', 'Karate', 'Safari'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be live besides alive',
    items: ['Wire', 'Broadcast', 'Ammunition', 'Concert', 'Coal'],
    outliers: ['Living', 'Alive', 'Animate', 'Breathing'],
  },
  {
    difficulty: 3,
    connection: 'Things with nets besides fishing',
    items: ['Basket', 'Inter', 'Safety', 'Hair', 'Drag'],
    outliers: ['Fishing', 'Fish', 'Catch', 'Ocean'],
  },
  {
    difficulty: 3,
    connection: 'Words where -ATION is pronounced -AYSHUN',
    items: ['Nation', 'Station', 'Vacation', 'Creation', 'Relation'],
    outliers: ['Equation', 'Inflation', 'Quotation', 'Ovation'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be mixed besides ingredients',
    items: ['Feelings', 'Signals', 'Bag', 'Blessing', 'Company'],
    outliers: ['Ingredients', 'Colors', 'Drinks', 'Chemicals'],
  },
  {
    difficulty: 3,
    connection: 'Things with bands besides rubber',
    items: ['Wedding', 'Boy', 'Broad', 'Contra', 'Rock'],
    outliers: ['Rubber', 'Elastic', 'Hair', 'Wrist'],
  },
  {
    difficulty: 3,
    connection: 'Words ending in -IBLE vs -ABLE',
    items: ['Incredible', 'Visible', 'Possible', 'Terrible', 'Horrible'],
    outliers: ['Comfortable', 'Remarkable', 'Adorable', 'Capable'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be paper besides material',
    items: ['Tiger', 'Trail', 'Work', 'Boy', 'Weight'],
    outliers: ['Sheet', 'Note', 'Document', 'Page'],
  },
  {
    difficulty: 3,
    connection: 'Things with waves besides ocean',
    items: ['Sound', 'Heat', 'Light', 'Brain', 'Shock'],
    outliers: ['Ocean', 'Sea', 'Water', 'Beach'],
  },
  {
    difficulty: 3,
    connection: 'Words where QU sounds like K',
    items: ['Bouquet', 'Antique', 'Technique', 'Unique', 'Boutique'],
    outliers: ['Queen', 'Quick', 'Quiet', 'Quote'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be moving besides motion',
    items: ['Picture', 'Target', 'Violation', 'Experience', 'Van'],
    outliers: ['Walking', 'Running', 'Driving', 'Flying'],
  },
  {
    difficulty: 3,
    connection: 'Things with chains besides links',
    items: ['Food', 'Daisy', 'Ball and', 'Command', 'Supply'],
    outliers: ['Link', 'Metal', 'Jewelry', 'Necklace'],
  },

  // FINAL PUSH TO 365+ PER DIFFICULTY
  // Adding 80 Easy, 125 Medium, 80 Hard

  {
    difficulty: 1,
    connection: 'Types of TV shows',
    items: ['Drama', 'Comedy', 'Reality', 'Documentary', 'Sitcom'],
    outliers: ['Movie', 'Book', 'Play', 'Radio'],
  },
  {
    difficulty: 1,
    connection: 'Movie genres',
    items: ['Action', 'Comedy', 'Horror', 'Romance', 'Thriller', 'Sci-fi'],
    outliers: ['News', 'Sports', 'Weather', 'Talk show'],
  },
  {
    difficulty: 1,
    connection: 'Book genres',
    items: ['Mystery', 'Romance', 'Fantasy', 'Biography', 'Thriller'],
    outliers: ['Magazine', 'Newspaper', 'Comic', 'Manual'],
  },
  {
    difficulty: 1,
    connection: 'Types of stores',
    items: ['Grocery', 'Department', 'Hardware', 'Clothing', 'Electronics'],
    outliers: ['Library', 'Museum', 'Hospital', 'School'],
  },
  {
    difficulty: 1,
    connection: 'Things in a kitchen',
    items: ['Stove', 'Refrigerator', 'Sink', 'Oven', 'Microwave', 'Dishwasher'],
    outliers: ['Bed', 'Couch', 'Bathtub', 'Television'],
  },
  {
    difficulty: 1,
    connection: 'Things in a living room',
    items: ['Couch', 'Television', 'Coffee table', 'Lamp', 'Bookshelf'],
    outliers: ['Stove', 'Refrigerator', 'Toilet', 'Shower'],
  },
  {
    difficulty: 1,
    connection: 'Zoo sections',
    items: ['Reptile house', 'Aviary', 'Aquarium', 'Primate area', 'Safari'],
    outliers: ['Bedroom', 'Kitchen', 'Bathroom', 'Garage'],
  },
  {
    difficulty: 1,
    connection: 'Types of restaurants',
    items: ['Fast food', 'Fine dining', 'Casual', 'Buffet', 'Cafe'],
    outliers: ['Library', 'Museum', 'Hospital', 'School'],
  },
  {
    difficulty: 1,
    connection: 'Room types in a house',
    items: ['Bedroom', 'Bathroom', 'Kitchen', 'Living room', 'Dining room'],
    outliers: ['Car', 'Bus', 'Train', 'Plane'],
  },
  {
    difficulty: 1,
    connection: 'Things at a gas station',
    items: ['Gas pump', 'Convenience store', 'Air pump', 'Car wash'],
    outliers: ['Library', 'Museum', 'Hospital', 'School'],
  },
  {
    difficulty: 1,
    connection: 'Things at an airport',
    items: ['Gate', 'Terminal', 'Security', 'Baggage claim', 'Runway'],
    outliers: ['Checkout', 'Aisle', 'Dairy section', 'Bakery'],
  },
  {
    difficulty: 1,
    connection: 'Things at a hospital',
    items: ['Doctor', 'Nurse', 'Patient', 'Bed', 'Medicine', 'Surgery'],
    outliers: ['Teacher', 'Student', 'Desk', 'Homework'],
  },
  {
    difficulty: 1,
    connection: 'Things at a school',
    items: ['Teacher', 'Student', 'Desk', 'Book', 'Classroom'],
    outliers: ['Doctor', 'Nurse', 'Patient', 'Surgery'],
  },
  {
    difficulty: 1,
    connection: 'Things at a library',
    items: ['Books', 'Librarian', 'Shelves', 'Reading area', 'Computer'],
    outliers: ['Food', 'Drinks', 'Music', 'Dancing'],
  },
  {
    difficulty: 1,
    connection: 'Things at a wedding',
    items: ['Bride', 'Groom', 'Cake', 'Flowers', 'Rings', 'Guests'],
    outliers: ['Casket', 'Hearse', 'Cemetery', 'Mourners'],
  },
  {
    difficulty: 1,
    connection: 'Things at a park',
    items: ['Bench', 'Trees', 'Playground', 'Walking path', 'Picnic table'],
    outliers: ['Stove', 'Refrigerator', 'Television', 'Bed'],
  },
  {
    difficulty: 1,
    connection: 'Things at a gym',
    items: ['Treadmill', 'Weights', 'Bench', 'Mat', 'Mirror', 'Locker'],
    outliers: ['Bed', 'Couch', 'Television', 'Refrigerator'],
  },
  {
    difficulty: 1,
    connection: 'Things at a grocery store',
    items: ['Aisle', 'Cart', 'Checkout', 'Produce', 'Dairy', 'Frozen'],
    outliers: ['Runway', 'Gate', 'Terminal', 'Security'],
  },
  {
    difficulty: 1,
    connection: 'Things at a bank',
    items: ['Teller', 'ATM', 'Vault', 'Deposit slip', 'Safe deposit box'],
    outliers: ['Doctor', 'Nurse', 'Medicine', 'Surgery'],
  },
  {
    difficulty: 1,
    connection: 'Space objects',
    items: ['Star', 'Planet', 'Moon', 'Asteroid', 'Comet', 'Galaxy'],
    outliers: ['Cloud', 'Rain', 'Wind', 'Snow'],
  },
  {
    difficulty: 1,
    connection: 'Weather events',
    items: ['Rain', 'Snow', 'Thunder', 'Lightning', 'Tornado', 'Hurricane'],
    outliers: ['Star', 'Moon', 'Planet', 'Asteroid'],
  },
  {
    difficulty: 1,
    connection: 'Natural disasters',
    items: ['Earthquake', 'Flood', 'Tornado', 'Hurricane', 'Tsunami', 'Wildfire'],
    outliers: ['Rain', 'Snow', 'Wind', 'Cloud'],
  },
  {
    difficulty: 1,
    connection: 'Landforms',
    items: ['Mountain', 'Valley', 'Canyon', 'Plain', 'Plateau', 'Island'],
    outliers: ['Ocean', 'River', 'Lake', 'Sea'],
  },
  {
    difficulty: 1,
    connection: 'Bodies of water',
    items: ['Ocean', 'River', 'Lake', 'Sea', 'Pond', 'Stream'],
    outliers: ['Mountain', 'Valley', 'Canyon', 'Plain'],
  },
  {
    difficulty: 1,
    connection: 'Types of rocks',
    items: ['Igneous', 'Sedimentary', 'Metamorphic', 'Granite', 'Marble'],
    outliers: ['Water', 'Air', 'Fire', 'Wind'],
  },
  {
    difficulty: 1,
    connection: 'Types of clouds',
    items: ['Cumulus', 'Stratus', 'Cirrus', 'Cumulonimbus', 'Nimbus'],
    outliers: ['Rain', 'Snow', 'Hail', 'Sleet'],
  },
  {
    difficulty: 1,
    connection: 'Forms of precipitation',
    items: ['Rain', 'Snow', 'Hail', 'Sleet', 'Drizzle'],
    outliers: ['Cloud', 'Fog', 'Mist', 'Dew'],
  },
  {
    difficulty: 1,
    connection: 'Parts of a song',
    items: ['Verse', 'Chorus', 'Bridge', 'Intro', 'Outro'],
    outliers: ['Chapter', 'Page', 'Paragraph', 'Sentence'],
  },
  {
    difficulty: 1,
    connection: 'Parts of a book',
    items: ['Chapter', 'Page', 'Index', 'Table of contents', 'Glossary'],
    outliers: ['Verse', 'Chorus', 'Bridge', 'Intro'],
  },
  {
    difficulty: 1,
    connection: 'Punctuation marks',
    items: ['Period', 'Comma', 'Question mark', 'Exclamation', 'Colon'],
    outliers: ['A', 'B', 'C', 'D'],
  },
  {
    difficulty: 1,
    connection: 'Parts of speech',
    items: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun'],
    outliers: ['Period', 'Comma', 'Question mark', 'Colon'],
  },
  {
    difficulty: 1,
    connection: 'Types of triangles',
    items: ['Equilateral', 'Isosceles', 'Scalene', 'Right', 'Acute', 'Obtuse'],
    outliers: ['Square', 'Rectangle', 'Circle', 'Pentagon'],
  },
  {
    difficulty: 1,
    connection: 'Quadrilaterals',
    items: ['Square', 'Rectangle', 'Rhombus', 'Trapezoid', 'Parallelogram'],
    outliers: ['Triangle', 'Circle', 'Pentagon', 'Hexagon'],
  },
  {
    difficulty: 1,
    connection: '3D shapes',
    items: ['Cube', 'Sphere', 'Cylinder', 'Cone', 'Pyramid'],
    outliers: ['Square', 'Circle', 'Triangle', 'Rectangle'],
  },
  {
    difficulty: 1,
    connection: 'Math operations',
    items: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
    outliers: ['Noun', 'Verb', 'Adjective', 'Adverb'],
  },
  {
    difficulty: 1,
    connection: 'Types of angles',
    items: ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex'],
    outliers: ['Triangle', 'Square', 'Circle', 'Rectangle'],
  },
  {
    difficulty: 1,
    connection: 'Roman numerals',
    items: ['I', 'V', 'X', 'L', 'C', 'D', 'M'],
    outliers: ['A', 'B', 'E', 'F', 'G'],
  },
  {
    difficulty: 1,
    connection: 'Wonders of the ancient world',
    items: ['Pyramids', 'Colossus', 'Lighthouse', 'Hanging Gardens'],
    outliers: ['Eiffel Tower', 'Statue of Liberty', 'Big Ben', 'Taj Mahal'],
  },
  {
    difficulty: 1,
    connection: 'New Seven Wonders',
    items: [
      'Great Wall',
      'Petra',
      'Colosseum',
      'Chichen Itza',
      'Machu Picchu',
      'Taj Mahal',
      'Christ the Redeemer',
    ],
    outliers: ['Pyramids', 'Lighthouse', 'Colossus', 'Hanging Gardens'],
  },
  {
    difficulty: 1,
    connection: 'US national parks',
    items: ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Glacier'],
    outliers: ['Central Park', 'Hyde Park', 'Disneyland', 'Six Flags'],
  },
  {
    difficulty: 1,
    connection: 'Famous bridges',
    items: ['Golden Gate', 'Brooklyn Bridge', 'Tower Bridge', 'Sydney Harbour'],
    outliers: ['Eiffel Tower', 'Big Ben', 'Statue of Liberty', 'Colosseum'],
  },
  {
    difficulty: 1,
    connection: 'Famous towers',
    items: ['Eiffel Tower', 'Big Ben', 'Leaning Tower of Pisa', 'CN Tower', 'Tokyo Tower'],
    outliers: ['Golden Gate', 'Brooklyn Bridge', 'Tower Bridge', 'Sydney Harbour'],
  },
  {
    difficulty: 1,
    connection: 'Famous statues',
    items: ['Statue of Liberty', 'Christ the Redeemer', 'David', 'Thinker'],
    outliers: ['Eiffel Tower', 'Big Ben', 'Leaning Tower', 'CN Tower'],
  },
  {
    difficulty: 1,
    connection: 'Famous museums',
    items: ['Louvre', 'British Museum', 'Smithsonian', 'Met', 'Vatican Museums'],
    outliers: ['Mall', 'Stadium', 'Airport', 'Hospital'],
  },
  {
    difficulty: 1,
    connection: 'Famous castles',
    items: ['Neuschwanstein', 'Windsor', 'Edinburgh', 'Versailles'],
    outliers: ['White House', 'Capitol', 'Buckingham Palace', 'Kremlin'],
  },
  {
    difficulty: 1,
    connection: 'Famous palaces',
    items: ['Buckingham', 'Versailles', 'Forbidden City', 'Kremlin'],
    outliers: ['Neuschwanstein', 'Windsor Castle', 'Edinburgh Castle', 'Tower of London'],
  },
  {
    difficulty: 1,
    connection: 'Types of pasta shapes',
    items: ['Spaghetti', 'Penne', 'Fusilli', 'Farfalle', 'Rigatoni', 'Linguine'],
    outliers: ['Rice', 'Bread', 'Potato', 'Corn'],
  },
  {
    difficulty: 1,
    connection: 'Italian dishes',
    items: ['Pizza', 'Pasta', 'Risotto', 'Lasagna', 'Tiramisu'],
    outliers: ['Sushi', 'Tacos', 'Curry', 'Pho'],
  },
  {
    difficulty: 1,
    connection: 'Japanese dishes',
    items: ['Sushi', 'Ramen', 'Tempura', 'Teriyaki', 'Miso soup'],
    outliers: ['Pizza', 'Pasta', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Chinese dishes',
    items: ['Fried rice', 'Dumplings', 'Kung Pao', 'Sweet and sour', 'Chow mein'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Indian dishes',
    items: ['Curry', 'Naan', 'Biryani', 'Samosa', 'Tandoori'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Pasta'],
  },
  {
    difficulty: 1,
    connection: 'Thai dishes',
    items: ['Pad Thai', 'Tom Yum', 'Green curry', 'Satay', 'Som Tam'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Pasta'],
  },
  {
    difficulty: 1,
    connection: 'French dishes',
    items: ['Croissant', 'Baguette', 'Quiche', 'Ratatouille', 'Crepe'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'American dishes',
    items: ['Hamburger', 'Hot dog', 'BBQ ribs', 'Apple pie', 'Mac and cheese'],
    outliers: ['Sushi', 'Pasta', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Greek dishes',
    items: ['Gyro', 'Moussaka', 'Souvlaki', 'Spanakopita', 'Tzatziki'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Spanish dishes',
    items: ['Paella', 'Tapas', 'Gazpacho', 'Churros', 'Tortilla española'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'British dishes',
    items: [
      'Fish and chips',
      "Shepherd's pie",
      'Bangers and mash',
      'Toad in the hole',
      'Full English',
    ],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Vietnamese dishes',
    items: ['Pho', 'Banh mi', 'Spring rolls', 'Bun cha'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Korean dishes',
    items: ['Bibimbap', 'Bulgogi', 'Kimchi', 'Korean BBQ', 'Japchae'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },
  {
    difficulty: 1,
    connection: 'Middle Eastern dishes',
    items: ['Hummus', 'Falafel', 'Shawarma', 'Kebab', 'Baklava'],
    outliers: ['Sushi', 'Pizza', 'Tacos', 'Curry'],
  },

  {
    difficulty: 2,
    connection: 'Countries that start and end with A',
    items: ['Australia', 'Austria', 'Albania', 'Algeria', 'Argentina', 'Armenia'],
    outliers: ['Afghanistan', 'Azerbaijan', 'Andorra', 'Angola'],
  },
  {
    difficulty: 2,
    connection: 'Countries with eagles on flags',
    items: ['USA', 'Mexico', 'Germany', 'Egypt', 'Albania'],
    outliers: ['France', 'UK', 'Japan', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Countries with stars on flags',
    items: ['USA', 'China', 'Brazil', 'Turkey', 'Australia', 'New Zealand'],
    outliers: ['France', 'Germany', 'Italy', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Countries with crosses on flags',
    items: ['Switzerland', 'UK', 'Sweden', 'Norway', 'Denmark', 'Finland'],
    outliers: ['France', 'Germany', 'Italy', 'Spain'],
  },
  {
    difficulty: 2,
    connection: 'Companies that went bankrupt',
    items: ['Blockbuster', 'Toys R Us', 'Enron', 'Lehman Brothers', 'Kodak'],
    outliers: ['Apple', 'Amazon', 'Google', 'Microsoft'],
  },
  {
    difficulty: 2,
    connection: 'Brands that became generic words',
    items: ['Kleenex', 'Band-Aid', 'Jacuzzi', 'Velcro', 'Chapstick'],
    outliers: ['Apple', 'Nike', 'Coca-Cola', 'Ford'],
  },
  {
    difficulty: 2,
    connection: 'Animals that change color',
    items: ['Chameleon', 'Octopus', 'Squid', 'Flounder', 'Tree frog'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Animals with longest tongues',
    items: ['Chameleon', 'Anteater', 'Giraffe', 'Blue whale', 'Woodpecker'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Languages with clicks',
    items: ['Xhosa', 'Zulu', 'Nama', 'Sandawe'],
    outliers: ['English', 'Spanish', 'French', 'German'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are spiciest',
    items: ['Carolina Reaper', 'Ghost pepper', 'Habanero', 'Scotch bonnet', 'Thai chili'],
    outliers: ['Bell pepper', 'Banana pepper', 'Poblano', 'Paprika'],
  },
  {
    difficulty: 2,
    connection: 'Animals that glow in dark',
    items: ['Jellyfish', 'Firefly', 'Anglerfish', 'Glow worm', 'Squid'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Foods highest in protein',
    items: ['Chicken breast', 'Tuna', 'Greek yogurt', 'Eggs', 'Lentils'],
    outliers: ['Apple', 'Lettuce', 'Cucumber', 'Watermelon'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are fastest',
    items: ['Cheetah', 'Peregrine falcon', 'Sailfish', 'Pronghorn', 'Springbok'],
    outliers: ['Sloth', 'Tortoise', 'Snail', 'Koala'],
  },
  {
    difficulty: 2,
    connection: 'Foods highest in fiber',
    items: ['Lentils', 'Black beans', 'Avocado', 'Raspberries', 'Oatmeal'],
    outliers: ['Chicken', 'Beef', 'Fish', 'Eggs'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are slowest',
    items: ['Sloth', 'Snail', 'Starfish', 'Giant tortoise', 'Seahorse'],
    outliers: ['Cheetah', 'Falcon', 'Sailfish', 'Pronghorn'],
  },
  {
    difficulty: 2,
    connection: 'Foods lowest in calories',
    items: ['Cucumber', 'Celery', 'Lettuce', 'Zucchini', 'Mushroom'],
    outliers: ['Peanut butter', 'Avocado', 'Cheese', 'Bread'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most time zones',
    items: ['France', 'Russia', 'USA', 'UK', 'Australia'],
    outliers: ['China', 'India', 'Japan', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals with best hearing',
    items: ['Moth', 'Owl', 'Cat', 'Dolphin', 'Bat'],
    outliers: ['Snake', 'Octopus', 'Spider', 'Jellyfish'],
  },
  {
    difficulty: 2,
    connection: 'Foods highest in calcium',
    items: ['Milk', 'Cheese', 'Yogurt', 'Sardines', 'Tofu', 'Kale'],
    outliers: ['Chicken', 'Beef', 'Rice', 'Bread'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most borders',
    items: ['China', 'Russia', 'Brazil', 'Germany', 'France'],
    outliers: ['UK', 'Japan', 'Australia', 'New Zealand'],
  },
  {
    difficulty: 2,
    connection: 'Animals with best smell',
    items: ['Elephant', 'Bear', 'Shark', 'Dog', 'Moth'],
    outliers: ['Bird', 'Human', 'Fish', 'Insect'],
  },
  {
    difficulty: 2,
    connection: 'Foods highest in iron',
    items: ['Spinach', 'Red meat', 'Lentils', 'Tofu', 'Dark chocolate'],
    outliers: ['Apple', 'Banana', 'Orange', 'Grape'],
  },
  {
    difficulty: 2,
    connection: 'Countries with no rivers',
    items: ['Saudi Arabia', 'Bahrain', 'Kuwait', 'UAE', 'Qatar'],
    outliers: ['Egypt', 'Iraq', 'India', 'USA'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are bitter',
    items: ['Coffee', 'Dark chocolate', 'Kale', 'Brussels sprouts', 'Grapefruit'],
    outliers: ['Sugar', 'Honey', 'Candy', 'Cake'],
  },
  {
    difficulty: 2,
    connection: 'Countries with highest mountains',
    items: ['Nepal', 'China', 'Pakistan', 'India', 'Bhutan'],
    outliers: ['Netherlands', 'Denmark', 'Belgium', 'Luxembourg'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are umami',
    items: ['Parmesan', 'Soy sauce', 'Mushrooms', 'Tomatoes', 'Miso'],
    outliers: ['Sugar', 'Salt', 'Vinegar', 'Lemon'],
  },
  {
    difficulty: 2,
    connection: 'Countries with lowest populations',
    items: ['Vatican City', 'Monaco', 'Nauru', 'Tuvalu', 'Palau'],
    outliers: ['China', 'India', 'USA', 'Indonesia'],
  },
  {
    difficulty: 2,
    connection: 'Foods that are sour',
    items: ['Lemon', 'Lime', 'Vinegar', 'Sauerkraut', 'Tamarind'],
    outliers: ['Sugar', 'Honey', 'Chocolate', 'Cake'],
  },
  {
    difficulty: 2,
    connection: 'Countries with highest density',
    items: ['Monaco', 'Singapore', 'Vatican City', 'Bahrain', 'Malta'],
    outliers: ['Mongolia', 'Australia', 'Namibia', 'Canada'],
  },
  {
    difficulty: 2,
    connection: 'Foods sweet naturally',
    items: ['Honey', 'Fruit', 'Maple syrup', 'Dates', 'Stevia'],
    outliers: ['Salt', 'Vinegar', 'Coffee', 'Lemon'],
  },
  {
    difficulty: 2,
    connection: 'Countries with lowest density',
    items: ['Mongolia', 'Namibia', 'Australia', 'Iceland', 'Suriname'],
    outliers: ['Monaco', 'Singapore', 'Hong Kong', 'Malta'],
  },
  {
    difficulty: 2,
    connection: 'Foods salty naturally',
    items: ['Seaweed', 'Celery', 'Beets', 'Cheese', 'Olives'],
    outliers: ['Apple', 'Banana', 'Orange', 'Grape'],
  },
  {
    difficulty: 2,
    connection: 'Countries in NATO',
    items: ['USA', 'UK', 'France', 'Germany', 'Canada', 'Turkey'],
    outliers: ['Russia', 'China', 'India', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are diurnal',
    items: ['Eagle', 'Squirrel', 'Butterfly', 'Human', 'Rooster'],
    outliers: ['Owl', 'Bat', 'Raccoon', 'Opossum'],
  },
  {
    difficulty: 2,
    connection: 'Countries in the EU',
    items: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium'],
    outliers: ['UK', 'Switzerland', 'Norway', 'Russia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that hibernate',
    items: ['Bear', 'Groundhog', 'Chipmunk', 'Bat', 'Hedgehog'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries in OPEC',
    items: ['Saudi Arabia', 'Iran', 'Iraq', 'Venezuela', 'Kuwait', 'UAE'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals that migrate',
    items: ['Bird', 'Whale', 'Butterfly', 'Salmon', 'Wildebeest', 'Caribou'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries in G7',
    items: ['USA', 'UK', 'France', 'Germany', 'Italy', 'Canada', 'Japan'],
    outliers: ['China', 'Russia', 'India', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Animals with shells',
    items: ['Turtle', 'Snail', 'Crab', 'Lobster', 'Clam', 'Oyster'],
    outliers: ['Fish', 'Dog', 'Cat', 'Bird'],
  },
  {
    difficulty: 2,
    connection: 'Countries in BRICS',
    items: ['Brazil', 'Russia', 'India', 'China', 'South Africa'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals with horns',
    items: ['Rhino', 'Bull', 'Goat', 'Deer', 'Buffalo', 'Antelope'],
    outliers: ['Horse', 'Dog', 'Cat', 'Elephant'],
  },
  {
    difficulty: 2,
    connection: 'Countries on Mediterranean',
    items: ['Italy', 'Greece', 'Spain', 'France', 'Turkey', 'Egypt'],
    outliers: ['UK', 'Germany', 'Poland', 'Sweden'],
  },
  {
    difficulty: 2,
    connection: 'Animals with tusks',
    items: ['Elephant', 'Walrus', 'Warthog', 'Narwhal'],
    outliers: ['Horse', 'Dog', 'Cat', 'Bear'],
  },
  {
    difficulty: 2,
    connection: 'Countries on Baltic Sea',
    items: ['Sweden', 'Finland', 'Estonia', 'Latvia', 'Lithuania', 'Poland'],
    outliers: ['UK', 'France', 'Spain', 'Italy'],
  },
  {
    difficulty: 2,
    connection: 'Animals that lay eggs',
    items: ['Chicken', 'Duck', 'Turtle', 'Snake', 'Platypus', 'Fish'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries in Scandinavia',
    items: ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],
    outliers: ['UK', 'Germany', 'France', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals with spots',
    items: ['Leopard', 'Cheetah', 'Dalmatian', 'Giraffe', 'Ladybug'],
    outliers: ['Lion', 'Tiger', 'Bear', 'Elephant'],
  },
  {
    difficulty: 2,
    connection: 'Countries in Balkans',
    items: ['Serbia', 'Croatia', 'Bosnia', 'Albania', 'Greece', 'Bulgaria'],
    outliers: ['UK', 'France', 'Germany', 'Spain'],
  },
  {
    difficulty: 2,
    connection: 'Animals that regenerate limbs',
    items: ['Starfish', 'Salamander', 'Lizard', 'Crab', 'Sea cucumber'],
    outliers: ['Dog', 'Cat', 'Horse', 'Human'],
  },
  {
    difficulty: 2,
    connection: 'Countries in Central America',
    items: ['Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama'],
    outliers: ['Mexico', 'USA', 'Canada', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Animals that live underground',
    items: ['Mole', 'Groundhog', 'Rabbit', 'Badger', 'Gopher', 'Worm'],
    outliers: ['Bird', 'Fish', 'Monkey', 'Deer'],
  },
  {
    difficulty: 2,
    connection: 'Countries in Middle East',
    items: ['Saudi Arabia', 'Iran', 'Iraq', 'Israel', 'Jordan', 'UAE'],
    outliers: ['India', 'China', 'Japan', 'Thailand'],
  },
  {
    difficulty: 2,
    connection: 'Animals in trees',
    items: ['Monkey', 'Koala', 'Squirrel', 'Sloth', 'Orangutan', 'Bird'],
    outliers: ['Fish', 'Whale', 'Mole', 'Worm'],
  },
  {
    difficulty: 2,
    connection: 'Countries in Southeast Asia',
    items: ['Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines'],
    outliers: ['China', 'Japan', 'India', 'Korea'],
  },
  {
    difficulty: 2,
    connection: 'Animals with pouches',
    items: ['Kangaroo', 'Koala', 'Opossum', 'Wombat', 'Wallaby'],
    outliers: ['Dog', 'Cat', 'Bear', 'Lion'],
  },
  {
    difficulty: 2,
    connection: 'Planets with moons',
    items: ['Earth', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Uranus'],
    outliers: ['Mercury', 'Venus', 'Sun', 'Pluto'],
  },
  {
    difficulty: 2,
    connection: 'Countries without snakes',
    items: ['Ireland', 'Iceland', 'New Zealand', 'Greenland'],
    outliers: ['USA', 'Australia', 'India', 'Brazil'],
  },
  {
    difficulty: 2,
    connection: 'Animals born blind',
    items: ['Kitten', 'Puppy', 'Rabbit', 'Hamster', 'Squirrel'],
    outliers: ['Horse', 'Cow', 'Deer', 'Elephant'],
  },
  {
    difficulty: 2,
    connection: 'Countries with kangaroos',
    items: ['Australia', 'Papua New Guinea'],
    outliers: ['USA', 'UK', 'Brazil', 'India', 'China', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are solitary',
    items: ['Tiger', 'Leopard', 'Bear', 'Jaguar', 'Orangutan'],
    outliers: ['Wolf', 'Lion', 'Elephant', 'Dolphin'],
  },
  {
    difficulty: 2,
    connection: 'Countries ending in -stan',
    items: [
      'Pakistan',
      'Afghanistan',
      'Kazakhstan',
      'Uzbekistan',
      'Turkmenistan',
      'Tajikistan',
      'Kyrgyzstan',
    ],
    outliers: ['India', 'Iran', 'Iraq', 'Turkey'],
  },
  {
    difficulty: 2,
    connection: 'Animals that live in herds',
    items: ['Elephant', 'Zebra', 'Buffalo', 'Deer', 'Wildebeest'],
    outliers: ['Tiger', 'Leopard', 'Bear', 'Jaguar'],
  },
  {
    difficulty: 2,
    connection: 'Countries ending in -ia',
    items: ['India', 'Australia', 'Russia', 'Nigeria', 'Colombia', 'Malaysia'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals that live in packs',
    items: ['Wolf', 'Wild dog', 'Hyena', 'Coyote'],
    outliers: ['Tiger', 'Leopard', 'Bear', 'Jaguar'],
  },
  {
    difficulty: 2,
    connection: 'Countries ending in -land',
    items: ['Finland', 'Poland', 'Ireland', 'Thailand', 'Switzerland', 'Iceland'],
    outliers: ['France', 'Germany', 'Spain', 'Italy'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are social',
    items: ['Elephant', 'Dolphin', 'Wolf', 'Lion', 'Chimpanzee'],
    outliers: ['Tiger', 'Leopard', 'Bear', 'Jaguar'],
  },

  {
    difficulty: 3,
    connection: 'Things that can be loaded besides trucks',
    items: ['Gun', 'Question', 'Dice', 'Dishwasher', 'Software'],
    outliers: ['Book', 'Chair', 'Table', 'Lamp'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be raised besides lifted',
    items: ['Eyebrow', 'Question', 'Stakes', 'Children', 'Funds'],
    outliers: ['Box', 'Weight', 'Ball', 'Hand'],
  },
  {
    difficulty: 3,
    connection: 'Things with spines besides books',
    items: ['Cactus', 'Porcupine', 'Fish', 'Human', 'Hedgehog'],
    outliers: ['Book', 'Notebook', 'Magazine', 'Novel'],
  },
  {
    difficulty: 3,
    connection: 'Words changing meaning with stress',
    items: ['Present', 'Record', 'Produce', 'Object', 'Permit'],
    outliers: ['Walk', 'Talk', 'Run', 'Jump'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be bounced besides balls',
    items: ['Check', 'Idea', 'Baby', 'Light', 'Email'],
    outliers: ['Rock', 'Brick', 'Glass', 'Egg'],
  },
  {
    difficulty: 3,
    connection: 'Words where G is silent',
    items: ['Gnome', 'Sign', 'Reign', 'Gnat', 'Design', 'Align'],
    outliers: ['Go', 'Good', 'Great', 'Give'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be fixed besides broken items',
    items: ['Race', 'Fight', 'Meal', 'Price', 'Game'],
    outliers: ['Broken', 'Lost', 'Missing', 'Wrong'],
  },
  {
    difficulty: 3,
    connection: 'Words where L is silent',
    items: ['Calm', 'Palm', 'Walk', 'Talk', 'Folk', 'Half'],
    outliers: ['Lamp', 'Light', 'Love', 'Land'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be solid besides objects',
    items: ['Gold', 'Ground', 'Advice', 'Evidence', 'Foundation'],
    outliers: ['Rock', 'Metal', 'Ice', 'Concrete'],
  },
  {
    difficulty: 3,
    connection: 'Words where W is silent',
    items: ['Write', 'Wrong', 'Wrap', 'Wreck', 'Wrist', 'Answer'],
    outliers: ['Water', 'Want', 'Walk', 'Work'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be crude besides oil',
    items: ['Joke', 'Drawing', 'Language', 'Estimate', 'Behavior'],
    outliers: ['Rude', 'Mean', 'Bad', 'Ugly'],
  },
  {
    difficulty: 3,
    connection: 'Words where H is silent at start',
    items: ['Hour', 'Honest', 'Honor', 'Heir'],
    outliers: ['House', 'Happy', 'High', 'Help'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be deep besides water',
    items: ['Thought', 'Trouble', 'Voice', 'State', 'End'],
    outliers: ['Ocean', 'Pool', 'Hole', 'Well'],
  },
  {
    difficulty: 3,
    connection: 'Words where T is silent',
    items: ['Castle', 'Listen', 'Whistle', 'Fasten', 'Mortgage'],
    outliers: ['Time', 'Table', 'Talk', 'Take'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be steep besides hills',
    items: ['Price', 'Learning curve', 'Tea', 'Decline', 'Rise'],
    outliers: ['Tall', 'High', 'Big', 'Large'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be clean besides surfaces',
    items: ['Break', 'Slate', 'Bill of health', 'Sweep', 'Getaway'],
    outliers: ['Shirt', 'Car', 'Room', 'Dish'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'rough' (figuratively)",
    items: ['Estimate', 'Draft', 'Patch', 'Diamond', 'Neighborhood', 'Day'],
    outliers: ['Smooth', 'Soft', 'Gentle', 'Polished'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be blind besides sight',
    items: ['Date', 'Spot', 'Side', 'Trust', 'Faith'],
    outliers: ['Person', 'Cat', 'Mole', 'Bat'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be soft besides textures',
    items: ['Spot', 'Skills', 'Landing', 'Opening', 'Drink'],
    outliers: ['Pillow', 'Cotton', 'Fur', 'Silk'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be slim besides bodies',
    items: ['Chance', 'Pickings', 'Jim', 'Margin', 'Volume'],
    outliers: ['Thin', 'Skinny', 'Narrow', 'Slender'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'full' (figuratively)",
    items: ['Swing', 'Circle', 'Moon', 'Disclosure', 'Speed', 'Steam'],
    outliers: ['Empty', 'Hollow', 'Vacant', 'Barren'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'wild' (figuratively)",
    items: ['Card', 'Guess', 'Goose chase', 'Fire', 'Imagination'],
    outliers: ['Tame', 'Calm', 'Mild', 'Controlled'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'hot' (figuratively)",
    items: ['Dog', 'Potato', 'Streak', 'Mess', 'Topic', 'Seat'],
    outliers: ['Cold', 'Cool', 'Lukewarm', 'Chilly'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be late besides time',
    items: ['Great', 'Night', 'Fee', 'Comer', 'Bloomer'],
    outliers: ['Watch', 'Clock', 'Bus', 'Train'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be close besides distance',
    items: ['Call', 'Shave', 'Encounter', 'Friend', 'Quarters'],
    outliers: ['Near', 'Next', 'Beside', 'Adjacent'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be even besides numbers',
    items: ['Stevens', 'Money', 'Temper', 'Keel', 'Score'],
    outliers: ['Two', 'Four', 'Six', 'Eight'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be straight besides lines',
    items: ['Face', 'Shooter', 'Answer', 'Flush', 'Jacket'],
    outliers: ['Line', 'Road', 'Path', 'Edge'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be false besides lies',
    items: ['Start', 'Alarm', 'Bottom', 'Teeth', 'Positive'],
    outliers: ['Lie', 'Fib', 'Untruth', 'Fabrication'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be just besides fair',
    items: ['Cause', 'Deserts', 'In time', 'About', 'Kidding'],
    outliers: ['Fair', 'Equal', 'Right', 'Proper'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'rare' (figuratively)",
    items: ['Earth', 'Steak', 'Bird', 'Book', 'Gem', 'Breed'],
    outliers: ['Common', 'Frequent', 'Ordinary', 'Typical'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'green' (figuratively)",
    items: ['Light', 'Thumb', 'Card', 'Room', 'Envy', 'Horn'],
    outliers: ['Red', 'Blue', 'Yellow', 'Purple'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'live' (figuratively)",
    items: ['Wire', 'Broadcast', 'Ammunition', 'Concert', 'Coal'],
    outliers: ['Dead', 'Recorded', 'Taped', 'Defunct'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be mixed besides ingredients',
    items: ['Feelings', 'Signals', 'Bag', 'Blessing', 'Company'],
    outliers: ['Ingredients', 'Colors', 'Drinks', 'Chemicals'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be paper besides material',
    items: ['Tiger', 'Trail', 'Work', 'Boy', 'Weight'],
    outliers: ['Sheet', 'Note', 'Document', 'Page'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be moving besides motion',
    items: ['Picture', 'Target', 'Violation', 'Experience', 'Van'],
    outliers: ['Walking', 'Running', 'Driving', 'Flying'],
  },

  // Final Medium push to 365+
  {
    difficulty: 2,
    connection: 'Countries with most tourists',
    items: ['France', 'Spain', 'USA', 'China', 'Italy', 'Turkey'],
    outliers: ['Vatican City', 'Monaco', 'Liechtenstein', 'San Marino'],
  },
  {
    difficulty: 2,
    connection: 'Animals with longest necks',
    items: ['Giraffe', 'Ostrich', 'Flamingo', 'Swan', 'Alpaca'],
    outliers: ['Elephant', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most airports',
    items: ['USA', 'Brazil', 'Mexico', 'Canada', 'Russia'],
    outliers: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'],
  },
  {
    difficulty: 2,
    connection: 'Animals with best camouflage',
    items: ['Chameleon', 'Octopus', 'Stick insect', 'Leaf bug', 'Flounder'],
    outliers: ['Peacock', 'Flamingo', 'Parrot', 'Toucan'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most World Cup wins',
    items: ['Brazil', 'Germany', 'Italy', 'Argentina', 'France', 'Uruguay'],
    outliers: ['USA', 'Canada', 'UK', 'Australia'],
  },
  {
    difficulty: 2,
    connection: 'Animals with largest eyes',
    items: ['Owl', 'Squid', 'Dragonfly', 'Ostrich', 'Horse'],
    outliers: ['Elephant', 'Whale', 'Hippo', 'Rhino'],
  },
  {
    difficulty: 2,
    connection: 'Countries with longest coastlines',
    items: ['Canada', 'Indonesia', 'Greenland', 'Russia', 'Philippines'],
    outliers: ['Switzerland', 'Austria', 'Mongolia', 'Nepal'],
  },
  {
    difficulty: 2,
    connection: 'Animals with largest brains',
    items: ['Sperm whale', 'Elephant', 'Dolphin', 'Human', 'Gorilla'],
    outliers: ['Fish', 'Insect', 'Snake', 'Frog'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most languages',
    items: ['Papua New Guinea', 'Indonesia', 'Nigeria', 'India', 'USA'],
    outliers: ['Japan', 'Iceland', 'Portugal', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals with best memory',
    items: ['Elephant', 'Dolphin', 'Chimpanzee', 'Crow', 'Octopus'],
    outliers: ['Goldfish', 'Chicken', 'Turkey', 'Mouse'],
  },
  {
    difficulty: 2,
    connection: 'Countries with tallest buildings',
    items: ['UAE', 'China', 'Saudi Arabia', 'USA', 'Kuwait'],
    outliers: ['Vatican City', 'Monaco', 'San Marino', 'Andorra'],
  },
  {
    difficulty: 2,
    connection: 'Animals with most legs',
    items: ['Millipede', 'Centipede', 'Shrimp', 'Crab', 'Spider'],
    outliers: ['Snake', 'Fish', 'Snail', 'Worm'],
  },
  {
    difficulty: 2,
    connection: 'Countries with oldest universities',
    items: ['Italy', 'UK', 'Spain', 'France', 'Portugal'],
    outliers: ['USA', 'Australia', 'Canada', 'New Zealand'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are apex predators',
    items: ['Lion', 'Tiger', 'Orca', 'Great white shark', 'Crocodile'],
    outliers: ['Rabbit', 'Deer', 'Sheep', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most billionaires',
    items: ['USA', 'China', 'India', 'Germany', 'Russia'],
    outliers: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are keystone species',
    items: ['Elephant', 'Wolf', 'Bee', 'Sea otter', 'Starfish'],
    outliers: ['Housefly', 'Rat', 'Pigeon', 'Cockroach'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most volcanoes',
    items: ['USA', 'Russia', 'Indonesia', 'Japan', 'Chile'],
    outliers: ['UK', 'France', 'Germany', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are invasive species',
    items: ['Cane toad', 'Rabbit', 'Asian carp', 'Burmese python', 'Zebra mussel'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most earthquakes',
    items: ['Japan', 'Indonesia', 'Chile', 'Mexico', 'Nepal'],
    outliers: ['UK', 'France', 'Germany', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals that are endangered',
    items: ['Panda', 'Tiger', 'Rhino', 'Gorilla', 'Polar bear'],
    outliers: ['Chicken', 'Cow', 'Pig', 'Dog'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most lakes',
    items: ['Canada', 'Finland', 'Sweden', 'Russia', 'USA'],
    outliers: ['Egypt', 'Saudi Arabia', 'Libya', 'Algeria'],
  },
  {
    difficulty: 2,
    connection: 'Animals that have gone extinct recently',
    items: ['Dodo', 'Tasmanian tiger', 'Passenger pigeon', 'Quagga'],
    outliers: ['Elephant', 'Lion', 'Tiger', 'Panda'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most forests',
    items: ['Russia', 'Brazil', 'Canada', 'USA', 'China'],
    outliers: ['Egypt', 'Saudi Arabia', 'Libya', 'Qatar'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can detect magnetic fields',
    items: ['Bird', 'Sea turtle', 'Salmon', 'Bee', 'Lobster'],
    outliers: ['Human', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most islands',
    items: ['Sweden', 'Finland', 'Norway', 'Canada', 'Indonesia'],
    outliers: ['Switzerland', 'Austria', 'Mongolia', 'Nepal'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can produce electricity',
    items: ['Electric eel', 'Electric ray', 'Torpedo fish', 'Stargazer'],
    outliers: ['Fish', 'Shark', 'Whale', 'Dolphin'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most glaciers',
    items: ['USA', 'Canada', 'Russia', 'China', 'Argentina'],
    outliers: ['Egypt', 'Saudi Arabia', 'Libya', 'Qatar'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can sense infrared',
    items: ['Snake', 'Vampire bat', 'Mosquito', 'Beetle'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most deserts',
    items: ['USA', 'China', 'Australia', 'Egypt', 'Saudi Arabia'],
    outliers: ['UK', 'Germany', 'France', 'Japan'],
  },
  {
    difficulty: 2,
    connection: 'Animals that use sonar',
    items: ['Bat', 'Dolphin', 'Whale', 'Porpoise', 'Orca'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most rivers',
    items: ['Russia', 'China', 'USA', 'Brazil', 'Canada'],
    outliers: ['Saudi Arabia', 'UAE', 'Qatar', 'Bahrain'],
  },
  {
    difficulty: 2,
    connection: 'Animals that have blue blood',
    items: ['Horseshoe crab', 'Octopus', 'Squid', 'Lobster', 'Spider'],
    outliers: ['Human', 'Dog', 'Cat', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most waterfalls',
    items: ['Norway', 'Brazil', 'USA', 'Canada', 'Switzerland'],
    outliers: ['Egypt', 'Saudi Arabia', 'Libya', 'Qatar'],
  },
  {
    difficulty: 2,
    connection: 'Animals that can live extremely long',
    items: ['Tortoise', 'Lobster', 'Whale', 'Parrot', 'Elephant'],
    outliers: ['Dog', 'Cat', 'Human', 'Mouse'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most caves',
    items: ['USA', 'China', 'France', 'Spain', 'Mexico'],
    outliers: ['Netherlands', 'Denmark', 'Belgium', 'Luxembourg'],
  },
  {
    difficulty: 2,
    connection: 'Animals with longest lifespan',
    items: ['Tortoise', 'Greenland shark', 'Bowhead whale', 'Koi fish'],
    outliers: ['Mouse', 'Hamster', 'Guinea pig', 'Rabbit'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most hot springs',
    items: ['USA', 'Japan', 'Iceland', 'New Zealand', 'Italy'],
    outliers: ['UK', 'France', 'Germany', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals with shortest lifespan',
    items: ['Mayfly', 'Fruit fly', 'Housefly', 'Ant', 'Mouse'],
    outliers: ['Tortoise', 'Elephant', 'Parrot', 'Whale'],
  },
  {
    difficulty: 2,
    connection: 'Countries with most geysers',
    items: ['USA', 'Iceland', 'New Zealand', 'Russia', 'Chile'],
    outliers: ['UK', 'France', 'Germany', 'Poland'],
  },
  {
    difficulty: 2,
    connection: 'Animals born with stripes',
    items: ['Zebra', 'Tiger', 'Okapi', 'Bongo'],
    outliers: ['Lion', 'Elephant', 'Giraffe', 'Horse'],
  },
  {
    difficulty: 2,
    connection: 'Countries with northern lights',
    items: ['Norway', 'Iceland', 'Sweden', 'Finland', 'Canada', 'Alaska'],
    outliers: ['Brazil', 'Australia', 'Egypt', 'India'],
  },
  {
    difficulty: 2,
    connection: 'Animals born with spots',
    items: ['Fawn', 'Cheetah cub', 'Tapir baby', 'Lion cub'],
    outliers: ['Zebra', 'Tiger', 'Penguin', 'Panda'],
  },
  {
    difficulty: 2,
    connection: 'Countries with midnight sun',
    items: ['Norway', 'Sweden', 'Finland', 'Iceland', 'Alaska', 'Russia'],
    outliers: ['Brazil', 'Australia', 'Egypt', 'India'],
  },
  {
    difficulty: 2,
    connection: 'Animals that build dams',
    items: ['Beaver', 'Caddisfly', 'Leaf-cutter ant'],
    outliers: ['Bear', 'Wolf', 'Fox', 'Deer'],
  },
  {
    difficulty: 2,
    connection: 'Countries with polar bears',
    items: ['Canada', 'Russia', 'Norway', 'Greenland', 'USA'],
    outliers: ['Brazil', 'Australia', 'India', 'Egypt'],
  },
  {
    difficulty: 2,
    connection: 'Animals that farm',
    items: ['Ant', 'Termite', 'Ambrosia beetle', 'Damselfish'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with penguins native',
    items: ['Antarctica', 'Argentina', 'South Africa', 'New Zealand', 'Chile'],
    outliers: ['USA', 'UK', 'Canada', 'Russia'],
  },
  {
    difficulty: 2,
    connection: 'Animals that make tools',
    items: ['Chimpanzee', 'Crow', 'Octopus', 'Elephant', 'Dolphin'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with unique animals',
    items: ['Australia', 'Madagascar', 'New Zealand', 'Galapagos'],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },
  {
    difficulty: 2,
    connection: 'Animals with best night vision',
    items: ['Owl', 'Cat', 'Gecko', 'Lemur', 'Wolf'],
    outliers: ['Human', 'Chicken', 'Pigeon', 'Turkey'],
  },
  {
    difficulty: 2,
    connection: 'Countries named after explorers',
    items: ['Colombia', 'Philippines', 'America'],
    outliers: ['Brazil', 'Canada', 'Mexico', 'India'],
  },
  {
    difficulty: 2,
    connection: 'Animals with worst eyesight',
    items: ['Bat', 'Mole', 'Deep sea fish', 'Star-nosed mole'],
    outliers: ['Eagle', 'Hawk', 'Falcon', 'Owl'],
  },
  {
    difficulty: 2,
    connection: 'Countries named after directions',
    items: ['Norway', 'Australia', 'South Africa', 'South Korea', 'North Korea'],
    outliers: ['France', 'Germany', 'Italy', 'Spain'],
  },
  {
    difficulty: 2,
    connection: 'Animals that dance',
    items: ['Peacock', 'Bird of paradise', 'Flamingo', 'Bee', 'Spider'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with national birds that are eagles',
    items: ['USA', 'Germany', 'Mexico', 'Philippines', 'Egypt'],
    outliers: ['UK', 'France', 'Japan', 'Canada'],
  },
  {
    difficulty: 2,
    connection: 'Animals that sing or chirp',
    items: ['Whale', 'Bird', 'Cricket', 'Cicada', 'Frog'],
    outliers: ['Dog', 'Cat', 'Horse', 'Cow'],
  },
  {
    difficulty: 2,
    connection: 'Countries with national animals that are lions',
    items: ['UK', 'Belgium', 'Luxembourg', 'Singapore', 'Sri Lanka'],
    outliers: ['USA', 'Canada', 'Australia', 'Mexico'],
  },
  {
    difficulty: 2,
    connection: 'Animals that laugh',
    items: ['Hyena', 'Chimpanzee', 'Rat', 'Dog'],
    outliers: ['Cat', 'Horse', 'Cow', 'Bird'],
  },
  {
    difficulty: 2,
    connection: 'Countries with red and white flags only',
    items: [
      'Japan',
      'Poland',
      'Monaco',
      'Indonesia',
      'Austria',
      'Switzerland',
      'Denmark',
      'Canada',
    ],
    outliers: ['USA', 'UK', 'France', 'Germany'],
  },

  // Final Hard push to 365+
  {
    difficulty: 3,
    connection: 'Things that can be strong besides strength',
    items: ['Language', 'Suit', 'Point', 'Coffee', 'Wind'],
    outliers: ['Muscle', 'Arm', 'Leg', 'Body'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be weak besides strength',
    items: ['Spot', 'Link', 'Tea', 'Signal', 'Argument'],
    outliers: ['Arm', 'Leg', 'Muscle', 'Body'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be loose besides tight',
    items: ['Cannon', 'Ends', 'Lips', 'Leaf', 'Change'],
    outliers: ['Rope', 'Belt', 'Knot', 'Screw'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be tight besides loose',
    items: ['Budget', 'Schedule', 'Security', 'Deadline', 'Ship'],
    outliers: ['Pants', 'Shirt', 'Shoe', 'Belt'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'sharp' (figuratively)",
    items: ['Tongue', 'Dresser', 'Mind', 'Pain', 'Note', 'Turn'],
    outliers: ['Dull', 'Blunt', 'Flat', 'Soft'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be dull besides sharpness',
    items: ['Moment', 'Pain', 'Color', 'Life', 'Sound'],
    outliers: ['Knife', 'Blade', 'Pencil', 'Tool'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be bright besides light',
    items: ['Future', 'Idea', 'Student', 'Side', 'Spot'],
    outliers: ['Sun', 'Lamp', 'Bulb', 'Star'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be dark besides light',
    items: ['Horse', 'Secret', 'Side', 'Ages', 'Matter'],
    outliers: ['Night', 'Shadow', 'Cave', 'Room'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be fresh besides food',
    items: ['Start', 'Air', 'Coat of paint', 'Prince', 'Water'],
    outliers: ['Bread', 'Fruit', 'Vegetable', 'Fish'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be stale besides food',
    items: ['Joke', 'News', 'Air', 'Relationship', 'Idea'],
    outliers: ['Bread', 'Crackers', 'Chips', 'Cookies'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be rich besides money',
    items: ['History', 'Soil', 'Color', 'Flavor', 'Irony'],
    outliers: ['Person', 'Family', 'Company', 'Country'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be poor besides money',
    items: ['Taste', 'Quality', 'Health', 'Judgment', 'Sport'],
    outliers: ['Person', 'Family', 'Country', 'Company'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be high besides height',
    items: ['Noon', 'Treason', 'Hopes', 'Stakes', 'Maintenance'],
    outliers: ['Mountain', 'Building', 'Plane', 'Cloud'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be low besides height',
    items: ['Blow', 'Profile', 'Key', 'Point', 'Season'],
    outliers: ['Floor', 'Ground', 'Basement', 'Valley'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be long besides length',
    items: ['Shot', 'Face', 'Run', 'Story', 'Time'],
    outliers: ['Rope', 'Road', 'River', 'Line'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be short besides length',
    items: ['Circuit', 'Temper', 'Notice', 'Order', 'End'],
    outliers: ['Person', 'Rope', 'Line', 'Road'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be thick besides width',
    items: ['Skin', 'Plot', 'Accent', 'Air', 'Thieves'],
    outliers: ['Book', 'Wall', 'Rope', 'Board'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be thin besides width',
    items: ['Ice', 'Air', 'Line', 'Skin', 'Patience'],
    outliers: ['Paper', 'Wire', 'Thread', 'Hair'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be big besides size',
    items: ['Deal', 'Shot', 'Picture', 'Time', 'Break'],
    outliers: ['House', 'Car', 'Dog', 'Tree'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be small besides size',
    items: ['Talk', 'Fry', 'Print', 'Hours', 'Change'],
    outliers: ['Ant', 'Mouse', 'Pea', 'Seed'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be old besides age',
    items: ['School', 'Hand', 'Testament', 'World', 'Wives tale'],
    outliers: ['Person', 'Building', 'Tree', 'Book'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be new besides age',
    items: ['Deal', 'Wave', 'World', 'Money', 'Leaf'],
    outliers: ['Baby', 'Car', 'House', 'Phone'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be young besides age',
    items: ['Turks', 'Blood', 'Gun', 'Love', 'At heart'],
    outliers: ['Baby', 'Child', 'Puppy', 'Kitten'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be fast besides speed',
    items: ['Food', 'Lane', 'Friends', 'One', 'Break'],
    outliers: ['Car', 'Runner', 'Cheetah', 'Plane'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be slow besides speed',
    items: ['Cooker', 'Lane', 'Motion', 'Burn', 'Clap'],
    outliers: ['Turtle', 'Snail', 'Sloth', 'Traffic'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'hard' (figuratively)",
    items: ['Time', 'Feelings', 'Drive', 'Luck', 'Evidence', 'Worker'],
    outliers: ['Soft', 'Easy', 'Simple', 'Gentle'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be easy besides difficulty',
    items: ['Street', 'Chair', 'Money', 'Rider', 'Listening'],
    outliers: ['Test', 'Question', 'Problem', 'Task'],
  },
  {
    difficulty: 3,
    connection: "Things that can be 'dry' (figuratively)",
    items: ['Humor', 'Run', 'Cleaning', 'Ice', 'Wine', 'Spell'],
    outliers: ['Wet', 'Moist', 'Damp', 'Soaked'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be wet besides moisture',
    items: ['Blanket', 'Dream', 'Behind ears', 'Whistle'],
    outliers: ['Water', 'Rain', 'Pool', 'Ocean'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be open besides doors',
    items: ['Mind', 'Relationship', 'Case', 'Season', 'Secret'],
    outliers: ['Window', 'Box', 'Gate', 'Lid'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be closed besides doors',
    items: ['Book', 'Case', 'Mind', 'Caption', 'Shop'],
    outliers: ['Window', 'Box', 'Gate', 'Lid'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be empty besides containers',
    items: ['Threat', 'Promise', 'Nest', 'Calories', 'Handed'],
    outliers: ['Cup', 'Box', 'Room', 'Tank'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be broken besides objects',
    items: ['Heart', 'Promise', 'Record', 'News', 'English'],
    outliers: ['Glass', 'Bone', 'Plate', 'Window'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be made besides products',
    items: ['Up', 'Do', 'Believe', 'Waves', 'Ends meet'],
    outliers: ['Car', 'House', 'Food', 'Clothes'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be taken besides objects',
    items: ['Aback', 'Care', 'Place', 'Chances', 'Sides'],
    outliers: ['Book', 'Money', 'Phone', 'Keys'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be given besides gifts',
    items: ['Up', 'Birth', 'Way', 'Time', 'Notice'],
    outliers: ['Present', 'Money', 'Flowers', 'Card'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be set besides objects',
    items: ['Aside', 'Back', 'Free', 'Straight', 'Record'],
    outliers: ['Table', 'Chair', 'Plate', 'Glass'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be put besides objects',
    items: ['Down', 'Off', 'Through', 'Together', 'Aside'],
    outliers: ['Book', 'Plate', 'Glass', 'Phone'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be brought besides objects',
    items: ['Up', 'Down', 'About', 'Home', 'Forward'],
    outliers: ['Gift', 'Food', 'Package', 'Luggage'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be held besides objects',
    items: ['Breath', 'Own', 'Water', 'Court', 'Grudge'],
    outliers: ['Book', 'Cup', 'Baby', 'Hand'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be kept besides objects',
    items: ['Secret', 'Promise', 'Score', 'Time', 'Faith'],
    outliers: ['Book', 'Money', 'Gift', 'Item'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be lost besides objects',
    items: ['Mind', 'Touch', 'Cause', 'Time', 'Interest'],
    outliers: ['Keys', 'Wallet', 'Phone', 'Money'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be found besides objects',
    items: ['Out', 'Footing', 'Fault', 'Voice', 'Wanting'],
    outliers: ['Keys', 'Wallet', 'Phone', 'Money'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be caught besides objects',
    items: ['Cold', 'Fire', 'Breath', 'Glimpse', 'Drift'],
    outliers: ['Ball', 'Fish', 'Bus', 'Train'],
  },
  {
    difficulty: 3,
    connection: 'Things that can be thrown besides objects',
    items: ['Party', 'Shade', 'Tantrum', 'Towel', 'Weight around'],
    outliers: ['Ball', 'Rock', 'Frisbee', 'Dart'],
  },

  // Final Easy push to 365+
  {
    difficulty: 1,
    connection: 'Dr. Seuss books',
    items: [
      'Cat in the Hat',
      'Green Eggs and Ham',
      'The Lorax',
      'How the Grinch Stole Christmas',
      'One Fish Two Fish',
    ],
    outliers: ["Charlotte's Web", 'Goodnight Moon', 'Where the Wild Things Are'],
  },
  {
    difficulty: 1,
    connection: 'Fairy tale characters',
    items: ['Cinderella', 'Snow White', 'Sleeping Beauty', 'Rapunzel', 'Little Red Riding Hood'],
    outliers: ['Harry Potter', 'Frodo', 'Luke Skywalker', 'Batman'],
  },
  {
    difficulty: 1,
    connection: 'Nursery rhyme characters',
    items: ['Humpty Dumpty', 'Little Bo Peep', 'Jack and Jill', 'Old Mother Hubbard'],
    outliers: ['Cinderella', 'Snow White', 'Rapunzel', 'Belle'],
  },
  {
    difficulty: 1,
    connection: 'Winnie the Pooh characters',
    items: ['Pooh', 'Piglet', 'Tigger', 'Eeyore', 'Rabbit', 'Owl'],
    outliers: ['Mickey', 'Donald', 'Goofy', 'Pluto'],
  },
  {
    difficulty: 1,
    connection: 'Sesame Street characters',
    items: ['Big Bird', 'Elmo', 'Cookie Monster', 'Oscar', 'Bert', 'Ernie'],
    outliers: ['Barney', 'Dora', 'SpongeBob', 'Mickey'],
  },
  {
    difficulty: 1,
    connection: 'Peanuts characters',
    items: ['Charlie Brown', 'Snoopy', 'Lucy', 'Linus', 'Woodstock'],
    outliers: ['Mickey', 'Donald', 'Goofy', 'Pluto'],
  },
  {
    difficulty: 1,
    connection: 'Looney Tunes characters',
    items: ['Bugs Bunny', 'Daffy Duck', 'Tweety', 'Sylvester', 'Road Runner', 'Wile E. Coyote'],
    outliers: ['Mickey', 'Donald', 'Goofy', 'Pluto'],
  },
  {
    difficulty: 1,
    connection: 'SpongeBob characters',
    items: ['SpongeBob', 'Patrick', 'Squidward', 'Mr. Krabs', 'Sandy', 'Plankton'],
    outliers: ['Mickey', 'Donald', 'Goofy', 'Pluto'],
  },
  {
    difficulty: 1,
    connection: 'Shrek characters',
    items: ['Shrek', 'Donkey', 'Fiona', 'Puss in Boots', 'Lord Farquaad'],
    outliers: ['Buzz', 'Woody', 'Simba', 'Nemo'],
  },
  {
    difficulty: 1,
    connection: 'Toy Story characters',
    items: ['Woody', 'Buzz', 'Jessie', 'Rex', 'Slinky', 'Mr. Potato Head'],
    outliers: ['Shrek', 'Donkey', 'Simba', 'Nemo'],
  },
  {
    difficulty: 1,
    connection: 'Finding Nemo characters',
    items: ['Nemo', 'Marlin', 'Dory', 'Gill', 'Bruce', 'Crush'],
    outliers: ['Woody', 'Buzz', 'Shrek', 'Simba'],
  },
  {
    difficulty: 1,
    connection: 'The Lion King characters',
    items: ['Simba', 'Mufasa', 'Scar', 'Timon', 'Pumbaa', 'Nala'],
    outliers: ['Woody', 'Buzz', 'Nemo', 'Shrek'],
  },
  {
    difficulty: 1,
    connection: 'Frozen characters',
    items: ['Elsa', 'Anna', 'Olaf', 'Kristoff', 'Sven', 'Hans'],
    outliers: ['Simba', 'Ariel', 'Belle', 'Jasmine'],
  },
  {
    difficulty: 1,
    connection: 'Avengers characters',
    items: ['Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye'],
    outliers: ['Batman', 'Superman', 'Wonder Woman', 'Flash'],
  },
  {
    difficulty: 1,
    connection: 'Justice League characters',
    items: ['Batman', 'Superman', 'Wonder Woman', 'Flash', 'Aquaman'],
    outliers: ['Iron Man', 'Captain America', 'Thor', 'Hulk'],
  },
  {
    difficulty: 1,
    connection: 'X-Men characters',
    items: ['Wolverine', 'Storm', 'Cyclops', 'Jean Grey', 'Professor X', 'Magneto'],
    outliers: ['Batman', 'Superman', 'Spider-Man', 'Iron Man'],
  },
  {
    difficulty: 1,
    connection: 'Star Trek characters',
    items: ['Kirk', 'Spock', 'McCoy', 'Scotty', 'Uhura', 'Chekov'],
    outliers: ['Luke', 'Han', 'Leia', 'Vader'],
  },
  {
    difficulty: 1,
    connection: 'Game of Thrones houses',
    items: ['Stark', 'Lannister', 'Targaryen', 'Baratheon', 'Greyjoy'],
    outliers: ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'],
  },
  {
    difficulty: 1,
    connection: 'Lord of the Rings characters',
    items: ['Frodo', 'Gandalf', 'Aragorn', 'Legolas', 'Gimli', 'Sam'],
    outliers: ['Harry', 'Hermione', 'Ron', 'Dumbledore'],
  },
  {
    difficulty: 1,
    connection: 'Pokemon starters',
    items: ['Pikachu', 'Bulbasaur', 'Charmander', 'Squirtle'],
    outliers: ['Mario', 'Luigi', 'Link', 'Zelda'],
  },
  {
    difficulty: 1,
    connection: 'Mario characters',
    items: ['Mario', 'Luigi', 'Princess Peach', 'Bowser', 'Toad', 'Yoshi'],
    outliers: ['Sonic', 'Pikachu', 'Link', 'Zelda'],
  },
  {
    difficulty: 1,
    connection: 'Sonic characters',
    items: ['Sonic', 'Tails', 'Knuckles', 'Amy', 'Shadow', 'Dr. Eggman'],
    outliers: ['Mario', 'Luigi', 'Peach', 'Bowser'],
  },
  {
    difficulty: 1,
    connection: 'Minecraft items',
    items: ['Diamond', 'Iron', 'Gold', 'Wood', 'Stone', 'Coal'],
    outliers: ['Rings', 'Coins', 'Stars', 'Hearts'],
  },
  {
    difficulty: 1,
    connection: 'Fortnite terms',
    items: ['Battle royale', 'Victory royale', 'Storm', 'Loot', 'Build', 'Emote'],
    outliers: ['Touchdown', 'Home run', 'Goal', 'Basket'],
  },
  {
    difficulty: 1,
    connection: 'Roblox games',
    items: ['Adopt Me', 'Brookhaven', 'Tower of Hell', 'Murder Mystery', 'Jailbreak'],
    outliers: ['Fortnite', 'Minecraft', 'Call of Duty', 'FIFA'],
  },
]

// Generate a round with 5 items (4 connected + 1 outlier)
const generateRound = (difficulty, seed) => {
  // Filter categories by difficulty
  const validCategories = CATEGORIES.filter((c) => c.difficulty === difficulty)

  // Pick a category
  const categoryIndex = Math.floor(seededRandom(seed) * validCategories.length)
  const category = validCategories[categoryIndex]

  // Pick 4 items from the category (or all if less than 4)
  const shuffledItems = shuffleWithSeed([...category.items], seed + 100)
  const selectedItems = shuffledItems.slice(0, 4)

  // Pick 1 outlier
  const shuffledOutliers = shuffleWithSeed([...category.outliers], seed + 200)
  const outlier = shuffledOutliers[0]

  // Combine and shuffle
  const allItems = shuffleWithSeed([...selectedItems, outlier], seed + 300)
  const outlierIndex = allItems.indexOf(outlier)

  return {
    items: allItems,
    outlierIndex,
    connection: category.connection,
    difficulty,
  }
}

// Generate puzzle for today
const generatePuzzle = () => {
  const dayNum = getDayNumber()
  const seed = dayNum * 9973

  return {
    dayNum,
    rounds: [generateRound(1, seed), generateRound(2, seed + 1000), generateRound(3, seed + 2000)],
  }
}

export default function Outlier() {
  const [puzzle, setPuzzle] = useState(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [roundResults, setRoundResults] = useState([])
  const [gameState, setGameState] = useState('playing')
  const [showRules, setShowRules] = useState(false)
  const [timeUntilNext, setTimeUntilNext] = useState(getTimeUntilMidnight())
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [showingAnswer, setShowingAnswer] = useState(false)

  useEffect(() => {
    const p = generatePuzzle()
    setPuzzle(p)

    const saved = loadGameData()
    if (saved) {
      setStreak(saved.streak || 0)
      setBestStreak(saved.bestStreak || 0)

      if (saved.lastPlayedDay === p.dayNum) {
        setAlreadyPlayed(true)
        setRoundResults(saved.lastResults || [])
        setCurrentRound(3)
        setGameState(saved.lastGameState || 'lost')
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNext(getTimeUntilMidnight())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (index) => {
    if (gameState !== 'playing' || showingAnswer || alreadyPlayed) return
    setSelectedIndex(index)
  }

  const handleSubmit = () => {
    if (selectedIndex === null || !puzzle || showingAnswer) return

    const round = puzzle.rounds[currentRound]
    const isCorrect = selectedIndex === round.outlierIndex

    // Store the result for this round
    const newResults = [...roundResults, isCorrect]
    setRoundResults(newResults)
    setShowingAnswer(true)
  }

  const handleContinue = () => {
    if (!puzzle) return

    setSelectedIndex(null)
    setShowingAnswer(false)

    if (currentRound < 2) {
      setCurrentRound(currentRound + 1)
    } else {
      // Game over
      const perfectScore = roundResults.every(Boolean)
      const newGameState = perfectScore ? 'won' : 'lost'
      setGameState(newGameState)

      // Update stats
      const saved = loadGameData() || {}
      const wasPlayedYesterday = saved.lastPlayedDay === puzzle.dayNum - 1

      let newStreak = streak
      if (perfectScore) {
        newStreak = wasPlayedYesterday || saved.lastPlayedDay === undefined ? streak + 1 : 1
      } else {
        newStreak = 0
      }

      const newBestStreak = Math.max(bestStreak, newStreak)
      setStreak(newStreak)
      setBestStreak(newBestStreak)

      saveGameData({
        lastPlayedDay: puzzle.dayNum,
        lastResults: roundResults,
        lastGameState: newGameState,
        streak: newStreak,
        bestStreak: newBestStreak,
      })
    }
  }

  const generateShareText = () => {
    if (!puzzle) return ''

    let text = `OUTLIER #${puzzle.dayNum}\n`
    text += roundResults.map((r) => (r ? '🟢' : '🔴')).join('') + '\n\n'

    const score = roundResults.filter(Boolean).length
    if (score === 3) {
      text += '🎯 Perfect!'
    } else if (score === 2) {
      text += '👀 So close!'
    } else if (score === 1) {
      text += '🤔 Tricky...'
    } else {
      text += '😅 Tough day'
    }

    text += '\n\nhttps://outlier-game.vercel.app/'

    return text
  }

  const copyShare = () => {
    navigator.clipboard.writeText(generateShareText())
  }

  if (!puzzle) return null

  const round = puzzle.rounds[currentRound]
  const difficultyLabels = ['', 'Easy', 'Medium', 'Hard']
  const difficultyColors = ['', '#22c55e', '#f59e0b', '#ef4444']

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        userSelect: 'none',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: '700',
            letterSpacing: '6px',
            margin: 0,
            color: '#f9fafb',
          }}
        >
          OUTLIER
        </h1>
        <div
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px',
          }}
        >
          #{puzzle.dayNum}
        </div>
      </div>

      {/* Round indicators */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background:
                  roundResults[i] !== undefined
                    ? roundResults[i]
                      ? '#22c55e'
                      : '#ef4444'
                    : i === currentRound && gameState === 'playing'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                border:
                  i === currentRound && gameState === 'playing'
                    ? '2px solid #a78bfa'
                    : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {roundResults[i] !== undefined ? (roundResults[i] ? '✓' : '✗') : i + 1}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: difficultyColors[i + 1],
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {difficultyLabels[i + 1]}
            </div>
          </div>
        ))}
      </div>

      {/* Game area */}
      {gameState === 'playing' && !alreadyPlayed && (
        <>
          {/* Instructions */}
          <div
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            Tap the <strong>outlier</strong> — the one that doesn't belong
          </div>

          {/* Items */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            {round.items.map((item, i) => {
              const isSelected = selectedIndex === i
              const isOutlier = i === round.outlierIndex
              const showResult = showingAnswer

              let bgColor = 'rgba(255,255,255,0.05)'
              let borderColor = 'rgba(255,255,255,0.1)'

              if (showResult) {
                if (isOutlier) {
                  bgColor = 'rgba(34, 197, 94, 0.2)'
                  borderColor = '#22c55e'
                } else if (isSelected && !isOutlier) {
                  bgColor = 'rgba(239, 68, 68, 0.2)'
                  borderColor = '#ef4444'
                }
              } else if (isSelected) {
                bgColor = 'rgba(99, 102, 241, 0.2)'
                borderColor = '#6366f1'
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showingAnswer}
                  style={{
                    padding: '16px 24px',
                    fontSize: '18px',
                    fontWeight: '500',
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: showingAnswer ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                >
                  {item}
                  {showResult && isOutlier && <span style={{ marginLeft: '8px' }}>← Outlier</span>}
                </button>
              )
            })}
          </div>

          {/* Connection reveal */}
          {showingAnswer && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px 24px',
                background: roundResults[currentRound]
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                border: roundResults[currentRound]
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                textAlign: 'center',
                maxWidth: '320px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {roundResults[currentRound] ? '✓ Correct!' : '✗ Wrong'}
              </div>
              <div
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
              >
                Connection
              </div>
              <div style={{ fontSize: '15px', color: '#4ade80' }}>{round.connection}</div>
            </div>
          )}

          {/* Submit button */}
          {!showingAnswer && (
            <button
              onClick={handleSubmit}
              disabled={selectedIndex === null}
              style={{
                padding: '14px 48px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '2px',
                background:
                  selectedIndex !== null
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: selectedIndex !== null ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: selectedIndex !== null ? 'pointer' : 'default',
              }}
            >
              LOCK IN
            </button>
          )}

          {/* Continue button */}
          {showingAnswer && (
            <button
              onClick={handleContinue}
              style={{
                padding: '14px 48px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '2px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {currentRound < 2 ? 'NEXT ROUND' : 'SEE RESULTS'}
            </button>
          )}
        </>
      )}

      {/* Game over / Already played */}
      {(gameState !== 'playing' || alreadyPlayed) && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '8px',
              color: roundResults.filter(Boolean).length === 3 ? '#22c55e' : '#f9fafb',
            }}
          >
            {roundResults.filter(Boolean).length === 3
              ? '🎯 Perfect!'
              : roundResults.filter(Boolean).length === 2
                ? '👀 Almost!'
                : roundResults.filter(Boolean).length === 1
                  ? '🤔 Tricky day'
                  : '😅 Rough one'}
          </div>

          <div
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '24px',
            }}
          >
            {roundResults.filter(Boolean).length}/3 correct
          </div>

          {/* Show all rounds */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
              maxWidth: '320px',
            }}
          >
            {puzzle.rounds.map((r, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: difficultyColors[r.difficulty],
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Round {i + 1} • {difficultyLabels[r.difficulty]}
                  </span>
                  <span>{roundResults[i] ? '✅' : '❌'}</span>
                </div>
                <div
                  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}
                >
                  {r.connection}
                </div>
                <div style={{ fontSize: '13px', color: '#4ade80' }}>
                  Outlier: <strong>{r.items[r.outlierIndex]}</strong>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={copyShare}
            style={{
              padding: '14px 32px',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            SHARE
          </button>

          {/* Stats */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#a78bfa' }}>{streak}</div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                }}
              >
                Streak
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#a78bfa' }}>
                {bestStreak}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                }}
              >
                Best
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              Next puzzle in
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '300',
                color: '#f9fafb',
                fontFamily: 'monospace',
              }}
            >
              {formatTime(timeUntilNext)}
            </div>
          </div>
        </div>
      )}

      {/* How to play */}
      <button
        onClick={() => setShowRules(!showRules)}
        style={{
          marginTop: '32px',
          padding: '8px 16px',
          fontSize: '11px',
          letterSpacing: '2px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
        }}
      >
        {showRules ? 'HIDE RULES' : 'HOW TO PLAY'}
      </button>

      {showRules && (
        <div
          style={{
            marginTop: '16px',
            maxWidth: '340px',
            fontSize: '14px',
            lineHeight: '1.7',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '12px',
          }}
        >
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Goal:</strong> Find the outlier — the one item that doesn't share the hidden
            connection with the others.
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Rounds:</strong> 3 rounds of increasing difficulty (Easy → Medium → Hard).
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Scoring:</strong> Get all 3 correct for a perfect score and to keep your streak
            alive.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Tip:</strong> Look for what 4 items have in common, not just what seems odd.
          </p>
        </div>
      )}
    </div>
  )
}
