import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

// --- 10 starter daily questions, each with a curated 24-player pool ---
// Each pool has exactly 6 Legends, 6 Stars, 6 Cult heroes, 6 Wildcards
const QUESTIONS = [
  // Q1 — One-Off — World Cup penalty
  {
    text: "Who do you want taking the last penalty in a World Cup final?",
    category: "One-Off",
    ronIntro: "Right, get yourselves comfortable. Last penalty, World Cup final, the whole lot on one boot. Pick three. I'll mark you out of ten. Try to make it interesting.",
    pool: [
      // Legends
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Hand of God, foot of God" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "'98 final brace, '06 headbutt" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "Three World Cups" },
      { name: "Roberto Baggio", tier: "Legend", flag: "🇮🇹", note: "Missed in '94. Ponytail of pain." },
      { name: "Andrés Iniesta", tier: "Legend", flag: "🇪🇸", note: "'10 final winner" },
      { name: "Bobby Moore", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Calm personified" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Cool defined. Penalty taker for France & United." },
      { name: "Michel Platini", tier: "Legend", flag: "🇫🇷", note: "Three-time Ballon d'Or, took France's biggest moments" },
      { name: "Lothar Matthäus", tier: "Legend", flag: "🇩🇪", note: "'90 World Cup winner, took Germany's clutch ones" },
      { name: "Marco van Basten", tier: "Legend", flag: "🇳🇱", note: "Euro '88 final author, big-moment merchant" },
      // Stars
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Won it. Finally." },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Hat-trick in a final, still lost" },
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's captain" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Goals for fun. Never been there." },
      { name: "Cristiano Ronaldo", tier: "Star", flag: "🇵🇹", note: "Yes you knew he'd be here" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Missed for England, came back stronger" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Madrid's go-to, ice-cold technique" },
      { name: "Robert Lewandowski", tier: "Star", flag: "🇵🇱", note: "Poland's captain, 90%+ conversion lifetime" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Demands the ball. Always. Won't flinch." },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Won the Copa final. Argentine ice." },
      // Cult
      { name: "Roberto Carlos", tier: "Cult", flag: "🇧🇷", note: "Will absolutely smash it" },
      { name: "Andrea Pirlo", tier: "Cult", flag: "🇮🇹", note: "Will Panenka it. Will smile." },
      { name: "Stuart Pearce", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The redemption man" },
      { name: "Antonin Panenka", tier: "Cult", flag: "🇨🇿", note: "Invented the chip. Iconic." },
      { name: "Mario Balotelli", tier: "Cult", flag: "🇮🇹", note: "Why always him?" },
      { name: "Dimitar Berbatov", tier: "Cult", flag: "🇧🇬", note: "Cooler than you" },
      { name: "Eden Hazard", tier: "Cult", flag: "🇧🇪", note: "Belgium's set-piece man, slow-walk style" },
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "Calmest under pressure, AFCON winner" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Streetfighter who took Argentina's biggest" },
      { name: "Robert Pirès", tier: "Cult", flag: "🇫🇷", note: "Took it cool, scored cool, all his career" },
      // Wildcards
      { name: "Gareth Southgate (1996)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "He missed. He KNOWS." },
      { name: "Jordan Pickford", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "He's a goalkeeper. Bold." },
      { name: "Asamoah Gyan", tier: "Wildcard", flag: "🇬🇭", note: "Missed the biggest penalty in African football history" },
      { name: "Chris Waddle", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sent his into orbit, '90" },
      { name: "David Trezeguet", tier: "Wildcard", flag: "🇫🇷", note: "Missed France's decisive penalty in the 2006 final" },
      { name: "John Terry (2008)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Slipped. The slip." },
      { name: "Roberto Baggio (1994)", tier: "Wildcard", flag: "🇮🇹", note: "Skied the final penalty. The image of '94." },
      { name: "Marcus Rashford (2021)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Euro final miss, came back stronger" },
      { name: "Jadon Sancho (2021)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Same final, same ghost" },
      { name: "Lukas Podolski", tier: "Wildcard", flag: "🇩🇪", note: "Germany's '06 generation, biggest stage" }
    ]
  },

  // Q2 — One-Off — Champions League last-minute free kick
  {
    text: "Who do you want stepping up for a Champions League final free-kick, 89th minute, 1-0 down?",
    category: "One-Off",
    ronIntro: "Set-piece at the death. Whole season on the boot. Three picks. I'll be watching the run-up.",
    pool: [
      // Legends
      { name: "David Beckham", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The technique" },
      { name: "Roberto Carlos", tier: "Legend", flag: "🇧🇷", note: "That free-kick vs France" },
      { name: "Juninho Pernambucano", tier: "Legend", flag: "🇧🇷", note: "76 of them. Knuckleball king." },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "The stance, the strike" },
      { name: "Andrea Pirlo", tier: "Legend", flag: "🇮🇹", note: "Whispers it in" },
      { name: "Zico", tier: "Legend", flag: "🇧🇷", note: "Only Maradona had a better dead ball" },
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "Curled it over Seaman from 40 yards. Said he meant it." },
      { name: "Michel Platini", tier: "Legend", flag: "🇫🇷", note: "Italia '90 era king, 41 international goals" },
      { name: "Pierre van Hooijdonk", tier: "Legend", flag: "🇳🇱", note: "Forest's free-kick technician, knuckleball pioneer" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Coppa Italia free-kicks, all-time best dead ball" },
      // Stars
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Mostly curls them in" },
      { name: "James Ward-Prowse", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Beckham's record holder" },
      { name: "Trent Alexander-Arnold", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Range from anywhere" },
      { name: "Hakan Çalhanoğlu", tier: "Star", flag: "🇹🇷", note: "30+ yards is his speciality" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Captain. Will demand it." },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Real Madrid's set-piece man" },
      { name: "Bruno Guimarães", tier: "Star", flag: "🇧🇷", note: "Newcastle's curler, big-moment man" },
      { name: "Lorenzo Pellegrini", tier: "Star", flag: "🇮🇹", note: "Roma captain, set-piece menace" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Argentine cold technique" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Real Madrid's young set-piece option" },
      // Cult
      { name: "Sinisa Mihajlović", tier: "Cult", flag: "🇷🇸", note: "Hat-trick of free-kicks in a Serie A game" },
      { name: "Rogerio Ceni", tier: "Cult", flag: "🇧🇷", note: "Goalkeeper. 131 career goals." },
      { name: "Ronald Koeman", tier: "Cult", flag: "🇳🇱", note: "Won Wembley with one in '92" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Could finish from anywhere" },
      { name: "Rivaldo", tier: "Cult", flag: "🇧🇷", note: "Ballon d'Or off dead balls and bicycles" },
      { name: "Sebastian Giovinco", tier: "Cult", flag: "🇮🇹", note: "Atomic ant, surgical free-kicks" },
      { name: "Riyad Mahrez", tier: "Cult", flag: "🇩🇿", note: "Curling specialist, City's go-to" },
      { name: "Daniel Parejo", tier: "Cult", flag: "🇪🇸", note: "Valencia's set-piece artist" },
      { name: "Miralem Pjanić", tier: "Cult", flag: "🇧🇦", note: "Roma & Juve, technician's technician" },
      { name: "Toni Kroos", tier: "Cult", flag: "🇩🇪", note: "Surgical, never wastes one" },
      // Wildcards
      { name: "John Arne Riise", tier: "Wildcard", flag: "🇳🇴", note: "Will absolutely break the net" },
      { name: "Christian Eriksen", tier: "Wildcard", flag: "🇩🇰", note: "Best dead-ball man Spurs ever had" },
      { name: "Memphis Depay", tier: "Wildcard", flag: "🇳🇱", note: "Netherlands' first-choice dead ball" },
      { name: "Alex (Chelsea/PSG)", tier: "Wildcard", flag: "🇧🇷", note: "Defender. Thunder for a left foot." },
      { name: "Dimitri Payet", tier: "Wildcard", flag: "🇫🇷", note: "Euro 2016 free-kick king" },
      { name: "Zlatan Ibrahimović", tier: "Wildcard", flag: "🇸🇪", note: "Will try a bicycle from 30 yards" },
      { name: "Adel Taarabt", tier: "Wildcard", flag: "🇲🇦", note: "Either world-class or zero, no middle" },
      { name: "Anders Limpar", tier: "Wildcard", flag: "🇸🇪", note: "Forgotten Arsenal free-kick man" },
      { name: "Sergi Roberto", tier: "Wildcard", flag: "🇪🇸", note: "Took the big PSG-comeback free-kick" },
      { name: "Tony Yeboah", tier: "Wildcard", flag: "🇬🇭", note: "Volleys included, dead balls feared" }
    ]
  },

  // Q3 — Season-Long — Premier League title race
  {
    text: "Who do you want anchoring your squad through a 38-game Premier League title race?",
    category: "Season-Long",
    ronIntro: "Forty weeks. Cold Tuesday in Stoke. Twelve injuries. Pick three to drag the season home. I'm watching for stamina.",
    pool: [
      // Legends
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Invincibles' engine" },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "He'll demand more from you" },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Never won it, will die trying" },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Goals from midfield, every season" },
      { name: "Alan Shearer", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "260 PL goals" },
      { name: "Thierry Henry", tier: "Legend", flag: "🇫🇷", note: "175 PL goals, 2 titles" },
      { name: "Paul Scholes", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "11 PL titles, brain of every season" },
      { name: "Ryan Giggs", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "13 titles. Played until 40." },
      { name: "John Terry", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "5 PL titles, captain through all of them" },
      { name: "Didier Drogba", tier: "Legend", flag: "🇨🇮", note: "Big-game scorer, 4 PL titles" },
      // Stars
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Wins title in his first season" },
      { name: "Kevin De Bruyne", tier: "Star", flag: "🇧🇪", note: "Six titles" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Goals every season, no fail" },
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Ended a 30-year wait" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Captain. Drags United through it." },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "38 games, every one. Iron man." },
      { name: "Rodri", tier: "Star", flag: "🇪🇸", note: "Ballon d'Or anchor, City's metronome" },
      { name: "William Saliba", tier: "Star", flag: "🇫🇷", note: "Arsenal's defensive iron man" },
      { name: "Declan Rice", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Never misses a game, leads from midfield" },
      { name: "Alisson", tier: "Star", flag: "🇧🇷", note: "Liverpool's title-winning keeper" },
      // Cult
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "Won City their first title himself" },
      { name: "N'Golo Kanté", tier: "Cult", flag: "🇫🇷", note: "Two titles with two clubs" },
      { name: "Vincent Kompany", tier: "Cult", flag: "🇧🇪", note: "That goal vs Leicester" },
      { name: "Tony Adams", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain leader legend" },
      { name: "Nemanja Vidić", tier: "Cult", flag: "🇷🇸", note: "Won 5 PLs by being terrifying" },
      { name: "Jamie Vardy", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Leicester. 5000-1." },
      { name: "Steve Bruce", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captained United to first PL title, never capped" },
      { name: "Gary Pallister", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "4 PL titles, calmest defender alive" },
      { name: "Sami Hyypiä", tier: "Cult", flag: "🇫🇮", note: "Liverpool's defensive bedrock for a decade" },
      { name: "Phil Jagielka", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton captain forever, never injured" },
      // Wildcards
      { name: "Wilfried Zaha", tier: "Wildcard", flag: "🇨🇮", note: "Carried Palace by himself for years" },
      { name: "Aaron Lennon", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pure pace, full season" },
      { name: "Andy Cole", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "187 PL goals across five title-winning seasons" },
      { name: "Marouane Fellaini", tier: "Wildcard", flag: "🇧🇪", note: "Plan B. The whole plan." },
      { name: "Peter Crouch", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "100 PL goals across five clubs" },
      { name: "Tim Cahill", tier: "Wildcard", flag: "🇦🇺", note: "Header-scoring corner-flag puncher" },
      { name: "Mark Noble", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "West Ham forever. 550+ games. Never left." },
      { name: "James Milner", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Every position. Two clubs, two titles." },
      { name: "Charlie Adam", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Stoke grit. Long-shot specialist." },
      { name: "Ben Foster", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Retired, unretired at 39 to keep going" }
    ]
  },

  // Q4 — Season-Long — Champions League group stage
  {
    text: "Best three players to dominate a Champions League group stage?",
    category: "Season-Long",
    ronIntro: "Six matches. Tuesday and Wednesday nights. Different opposition each time. Pick three who'll deliver under the lights.",
    pool: [
      // Legends
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "All-time top scorer in the comp" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Eight group-stage hat-tricks" },
      { name: "Karim Benzema", tier: "Legend", flag: "🇫🇷", note: "Real Madrid's CL talisman" },
      { name: "Raul", tier: "Legend", flag: "🇪🇸", note: "Real Madrid's original CL legend" },
      { name: "Andriy Shevchenko", tier: "Legend", flag: "🇺🇦", note: "Carried Milan and Dynamo" },
      { name: "Filippo Inzaghi", tier: "Legend", flag: "🇮🇹", note: "Born offside, scored for fun" },
      { name: "Zlatan Ibrahimović", tier: "Legend", flag: "🇸🇪", note: "Group stage stamper for every club he played for" },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Anfield European nights" },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "29 CL goals from midfield" },
      { name: "Kaká", tier: "Legend", flag: "🇧🇷", note: "Milan's CL Ballon d'Or, group-stage dominator" },
      // Stars
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Goals per game absurd" },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Prime CL form" },
      { name: "Robert Lewandowski", tier: "Star", flag: "🇵🇱", note: "5 in 9 minutes" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Big-game player" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Made for these nights" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "European nights at Anfield" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal's CL force, group stage scorer" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's CL ever-present" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "United's European points-getter" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Inter's modern CL striker" },
      // Cult
      { name: "Didier Drogba", tier: "Cult", flag: "🇨🇮", note: "Final winner, all-rounder" },
      { name: "Sergio Agüero", tier: "Cult", flag: "🇦🇷", note: "City's CL warrior" },
      { name: "Edin Džeko", tier: "Cult", flag: "🇧🇦", note: "Reliable on the European stage" },
      { name: "Ángel Di María", tier: "Cult", flag: "🇦🇷", note: "Big-game performer always" },
      { name: "Demba Ba", tier: "Cult", flag: "🇸🇳", note: "That goal vs PSG. The slip." },
      { name: "Costinha", tier: "Cult", flag: "🇵🇹", note: "Mourinho's '04 Porto hero" },
      { name: "Hernán Crespo", tier: "Cult", flag: "🇦🇷", note: "Inter/Milan/Chelsea CL nights, big-game forward" },
      { name: "Edinson Cavani", tier: "Cult", flag: "🇺🇾", note: "PSG's CL ever-present, late winners" },
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "City's first CL force" },
      { name: "Allan Saint-Maximin", tier: "Cult", flag: "🇫🇷", note: "Newcastle's '23-24 group-stage menace" },
      // Wildcards
      { name: "Memphis Depay", tier: "Wildcard", flag: "🇳🇱", note: "Hot or cold, no in-between" },
      { name: "Hakan Şükür", tier: "Wildcard", flag: "🇹🇷", note: "10.8 seconds, 2002 World Cup" },
      { name: "Dejan Lovren", tier: "Wildcard", flag: "🇭🇷", note: "Sometimes brilliant, often not" },
      { name: "Park Ji-sung", tier: "Wildcard", flag: "🇰🇷", note: "Big-night man for United in Europe" },
      { name: "Adriano (Inter peak)", tier: "Wildcard", flag: "🇧🇷", note: "Briefly the best striker alive" },
      { name: "Hatem Ben Arfa", tier: "Wildcard", flag: "🇫🇷", note: "Will score from the halfway line" },
      { name: "Marko Arnautović", tier: "Wildcard", flag: "🇦🇹", note: "Bologna's chaos pickup" },
      { name: "Vincent Aboubakar", tier: "Wildcard", flag: "🇨🇲", note: "Porto's goal-machine, group stage merchant" },
      { name: "Luuk de Jong", tier: "Wildcard", flag: "🇳🇱", note: "Sevilla's improbable Europa League hero" },
      { name: "Dries Mertens", tier: "Wildcard", flag: "🇧🇪", note: "Napoli's joyful long-range scorer" }
    ]
  },

  // Q5 — Style — Saturday afternoon entertainment
  {
    text: "Whose three-player squad is the most fun to watch on a Saturday afternoon?",
    category: "Style",
    ronIntro: "I want to be entertained. Not lectured to about pressing triggers. Pick three who make me forget my back hurts.",
    pool: [
      // Legends
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "Smile of the gods" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Pirouettes in tight spaces" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "All of him, all the time" },
      { name: "Johan Cruyff", tier: "Legend", flag: "🇳🇱", note: "Invented the turn" },
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Pre-knee Ronaldo, end of debate" },
      { name: "Garrincha", tier: "Legend", flag: "🇧🇷", note: "Bent legs, magic feet" },
      { name: "George Best", tier: "Legend", flag: "🏴󠁧󠁢󠁮󠁩󠁲󠁿", note: "United's original Saturday entertainer" },
      { name: "Roberto Baggio", tier: "Legend", flag: "🇮🇹", note: "Tip-toe through defences, ponytail flying" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Collar up, magic on" },
      { name: "Stanley Matthews", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Played until 50 because crowds demanded it" },
      // Stars
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "Plays like he's still in the playground" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Step-overs, smiles, controversy" },
      { name: "Khvicha Kvaratskhelia", tier: "Star", flag: "🇬🇪", note: "Pure joy with the ball" },
      { name: "Mohammed Kudus", tier: "Star", flag: "🇬🇭", note: "Dribbles for the highlight reel" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The shiver, the goals" },
      { name: "Jamal Musiala", tier: "Star", flag: "🇩🇪", note: "Glides past defenders" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Skips defenders for fun" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal's joy generator" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Watching him is a treat" },
      { name: "Florian Wirtz", tier: "Star", flag: "🇩🇪", note: "Leverkusen's silk-touch specialist" },
      // Cult
      { name: "Hatem Ben Arfa", tier: "Cult", flag: "🇫🇷", note: "Will dribble through six players" },
      { name: "Jay-Jay Okocha", tier: "Cult", flag: "🇳🇬", note: "So good they named him twice" },
      { name: "Dimitar Berbatov", tier: "Cult", flag: "🇧🇬", note: "Touch of silk, never sweated" },
      { name: "Abedi Pelé", tier: "Cult", flag: "🇬🇭", note: "Marseille magician" },
      { name: "Adel Taarabt", tier: "Cult", flag: "🇲🇦", note: "Either bench or god, no middle" },
      { name: "Riquelme", tier: "Cult", flag: "🇦🇷", note: "Walked everywhere. Ran football." },
      { name: "Matthew Le Tissier", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Loyal, lethal, lazy in the best way" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Could finish from anywhere" },
      { name: "Pavel Nedvěd", tier: "Cult", flag: "🇨🇿", note: "Long blonde hair, longer shots" },
      { name: "Davor Šuker", tier: "Cult", flag: "🇭🇷", note: "Croatian magic at France '98" },
      // Wildcards
      { name: "Mario Balotelli", tier: "Wildcard", flag: "🇮🇹", note: "Why always him?" },
      { name: "Adebayo Akinfenwa", tier: "Wildcard", flag: "🇳🇬", note: "The Beast" },
      { name: "Peter Crouch", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Touches like a small player at 6'7" },
      { name: "Faustino Asprilla", tier: "Wildcard", flag: "🇨🇴", note: "Cartwheels and chaos" },
      { name: "Paul Gascoigne", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Genius and pain" },
      { name: "Jens Lehmann", tier: "Wildcard", flag: "🇩🇪", note: "Argued with everyone, even his own bench" },
      { name: "Charlie Austin", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "QPR's natural finisher, throwback joy" },
      { name: "Mauro Camoranesi", tier: "Wildcard", flag: "🇦🇷", note: "Italian/Argentine flair from full-back" },
      { name: "Rivaldinho", tier: "Wildcard", flag: "🇧🇷", note: "Brazilian son carrying the flame" },
      { name: "Jermaine Pennant", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Bursts of pure speed and tricks" }
    ]
  },

  // Q6 — Style — Showboating
  {
    text: "Best three for nutmegs, rabonas, and absolute showboating?",
    category: "Style",
    ronIntro: "Trick merchants only. I want flair, embarrassment for defenders, and at least one piece of skill that gets someone subbed.",
    pool: [
      // Legends
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "The ball was on a string" },
      { name: "Zlatan Ibrahimović", tier: "Legend", flag: "🇸🇪", note: "The bicycle vs England" },
      { name: "Robinho", tier: "Legend", flag: "🇧🇷", note: "Step-overs invented here" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Sporting Lisbon trick reel" },
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Elastico every game" },
      { name: "Romário", tier: "Legend", flag: "🇧🇷", note: "Didn't run. Never had to." },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "The original show" },
      { name: "Garrincha", tier: "Legend", flag: "🇧🇷", note: "Bent legs, magic feet, the joy" },
      { name: "René Higuita", tier: "Legend", flag: "🇨🇴", note: "Scorpion kick. Goalkeeper." },
      { name: "Hugo Sánchez", tier: "Legend", flag: "🇲🇽", note: "Bicycle-kick artist, signature backflip" },
      // Stars
      { name: "Neymar", tier: "Star", flag: "🇧🇷", note: "Once nutmegged a man twice" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Step-over factory" },
      { name: "Ousmane Dembélé", tier: "Star", flag: "🇫🇷", note: "Two-footed terror" },
      { name: "Raphinha", tier: "Star", flag: "🇧🇷", note: "Tricks daily" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cool kid energy" },
      { name: "Mohammed Kudus", tier: "Star", flag: "🇬🇭", note: "Skills for the algorithm" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Quietly humiliates defenders" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "The next great showman" },
      { name: "Jamal Musiala", tier: "Star", flag: "🇩🇪", note: "Glides like a playground kid" },
      { name: "Khvicha Kvaratskhelia", tier: "Star", flag: "🇬🇪", note: "Pure joy with the ball" },
      // Cult
      { name: "Jay-Jay Okocha", tier: "Cult", flag: "🇳🇬", note: "Nutmeg machine" },
      { name: "Hatem Ben Arfa", tier: "Cult", flag: "🇫🇷", note: "Solo goals for fun" },
      { name: "Adel Taarabt", tier: "Cult", flag: "🇲🇦", note: "More tricks than results" },
      { name: "Adama Traoré", tier: "Cult", flag: "🇪🇸", note: "Cones go missing when he's running" },
      { name: "Erik Lamela", tier: "Cult", flag: "🇦🇷", note: "Rabona connoisseur" },
      { name: "Adnan Januzaj", tier: "Cult", flag: "🇧🇪", note: "Briefly the future" },
      { name: "Riquelme", tier: "Cult", flag: "🇦🇷", note: "Walked everywhere, ran football" },
      { name: "Faustino Asprilla", tier: "Cult", flag: "🇨🇴", note: "Cartwheels and chaos" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Cool finishing, cooler tricks" },
      { name: "Yannick Bolasie", tier: "Cult", flag: "🇨🇩", note: "Most flicks per game in the PL" },
      // Wildcards
      { name: "Joe Cole", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Trickiest English player of his era" },
      { name: "Ricardo Quaresma", tier: "Wildcard", flag: "🇵🇹", note: "Trivela, only ever trivela" },
      { name: "Olivier Giroud (scorpion kick)", tier: "Wildcard", flag: "🇫🇷", note: "Won a Puskás for it" },
      { name: "Wayne Rooney (overhead, 2011)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Best PL goal ever?" },
      { name: "Helder Postiga", tier: "Wildcard", flag: "🇵🇹", note: "Portugal winger, all flicks and tricks" },
      { name: "Mario Balotelli", tier: "Wildcard", flag: "🇮🇹", note: "Will try anything" },
      { name: "Paul Gascoigne", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The class clown's tricks" },
      { name: "Edgar Davids", tier: "Wildcard", flag: "🇳🇱", note: "Goggles and grace" },
      { name: "Jens Lehmann", tier: "Wildcard", flag: "🇩🇪", note: "Goalkeeper, would attempt anything" },
      { name: "Tomáš Rosický", tier: "Wildcard", flag: "🇨🇿", note: "Arsenal's trick midfielder" }
    ]
  },

  // Q7 — Character — 2-0 down at half time
  {
    text: "Who do you want when your team is 2-0 down at half-time in a Champions League knockout?",
    category: "Character",
    ronIntro: "Dressing room is silent. Forty-five minutes to save your season. Pick three who don't accept it. I want bottle.",
    pool: [
      // Legends
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Istanbul. Need I say more?" },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Will fight you and the opposition" },
      { name: "Sergio Ramos", tier: "Legend", flag: "🇪🇸", note: "93rd minute, every time" },
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Saw it all, conceded none of it" },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Captain's captain" },
      { name: "John Terry", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everywhere, all at once" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Won knockouts on his own. Big-game soul." },
      { name: "Roberto Baggio", tier: "Legend", flag: "🇮🇹", note: "Carried Italy through pressure, every tournament" },
      { name: "Alessandro Costacurta", tier: "Legend", flag: "🇮🇹", note: "Milan's quiet leader, 5 CLs" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Will look around the room and decide it ends now" },
      // Stars
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Calm in the storm" },
      { name: "Cristiano Ronaldo", tier: "Star", flag: "🇵🇹", note: "Will not let you lose alone" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Carries the world quietly" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Captain. Demands more." },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Old head, young legs" },
      { name: "Toni Kroos", tier: "Star", flag: "🇩🇪", note: "Heartbeat doesn't change" },
      { name: "Rodri", tier: "Star", flag: "🇪🇸", note: "City's anchor, Ballon d'Or, never panics" },
      { name: "Declan Rice", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Plays the same in 2-0 down or 2-0 up" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real Madrid's CL comeback specialist" },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG captain, leads from the back" },
      // Cult
      { name: "Carles Puyol", tier: "Cult", flag: "🇪🇸", note: "Will throw his head at it" },
      { name: "Vincent Kompany", tier: "Cult", flag: "🇧🇪", note: "Won City the league with one goal" },
      { name: "Diego Godín", tier: "Cult", flag: "🇺🇾", note: "Last man, every man" },
      { name: "Gabi", tier: "Cult", flag: "🇪🇸", note: "Atlético captain, Simeone's general" },
      { name: "Tony Adams", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Donkey ears, lion's heart" },
      { name: "Sami Hyypiä", tier: "Cult", flag: "🇫🇮", note: "Quiet captain, Istanbul winner" },
      { name: "Xabi Alonso", tier: "Cult", flag: "🇪🇸", note: "Istanbul. Calmest 35 minutes of his life." },
      { name: "Fernando Hierro", tier: "Cult", flag: "🇪🇸", note: "Real Madrid's three-CL captain" },
      { name: "Dietmar Hamann", tier: "Cult", flag: "🇩🇪", note: "Half-time sub vs Milan. Changed history." },
      { name: "Daniele De Rossi", tier: "Cult", flag: "🇮🇹", note: "Roma forever, captain through everything" },
      // Wildcards
      { name: "Yaya Touré", tier: "Wildcard", flag: "🇨🇮", note: "Will start carrying everyone" },
      { name: "Vidal", tier: "Wildcard", flag: "🇨🇱", note: "Mohawk, no fear" },
      { name: "Pepe", tier: "Wildcard", flag: "🇵🇹", note: "Will get sent off, but you'll go down swinging" },
      { name: "Paul Scholes", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Quiet assassin" },
      { name: "Edinson Cavani", tier: "Wildcard", flag: "🇺🇾", note: "Runs through walls" },
      { name: "Stuart Pearce", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. Italia '90 redemption." },
      { name: "Jamie Carragher", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Istanbul. Every tackle, every block." },
      { name: "Marco Materazzi", tier: "Wildcard", flag: "🇮🇹", note: "Won an Inter treble being the heart of it" },
      { name: "Bryan Robson", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel — broken bones, kept going" },
      { name: "Roberto Mancini (player)", tier: "Wildcard", flag: "🇮🇹", note: "Sampdoria captain, comeback merchant" }
    ]
  },

  // Q8 — Character — Tunnel fight
  {
    text: "Best three for a tunnel fight before a North London derby?",
    category: "Character",
    ronIntro: "Concourse at the Emirates. Tempers up. Three of them, three of yours. Who walks out smiling?",
    pool: [
      // Legends
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Will start it. Will finish it." },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Tall, terrifying, technical" },
      { name: "Tony Adams", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain leader legend" },
      { name: "Vinnie Jones", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Three-second yellow" },
      { name: "Stuart Pearce", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho" },
      { name: "Graeme Souness", tier: "Legend", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Planted a flag in the centre circle once" },
      { name: "Gennaro Gattuso", tier: "Legend", flag: "🇮🇹", note: "All teeth, all fight" },
      { name: "Andoni Goikoetxea", tier: "Legend", flag: "🇪🇸", note: "The Butcher of Bilbao" },
      { name: "Claudio Gentile", tier: "Legend", flag: "🇮🇹", note: "Marked Maradona out of '82" },
      { name: "Billy Bremner", tier: "Legend", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Leeds '70s captain, never lost a tunnel" },
      // Stars
      { name: "Sergio Ramos", tier: "Star", flag: "🇪🇸", note: "Most reds in football history" },
      { name: "Diego Costa", tier: "Star", flag: "🇪🇸", note: "Stamps optional" },
      { name: "Granit Xhaka", tier: "Star", flag: "🇨🇭", note: "Wears red on purpose" },
      { name: "Casemiro", tier: "Star", flag: "🇧🇷", note: "All elbows, all the time" },
      { name: "Antonio Rüdiger", tier: "Star", flag: "🇩🇪", note: "Will smile while doing it" },
      { name: "Cristiano Romero", tier: "Star", flag: "🇦🇷", note: "Spurs' enforcer" },
      { name: "João Cancelo", tier: "Star", flag: "🇵🇹", note: "Will start something, finish nothing" },
      { name: "Saúl Ñíguez", tier: "Star", flag: "🇪🇸", note: "Atlético hard-man, smiling through" },
      { name: "Jérémy Toulalan", tier: "Star", flag: "🇫🇷", note: "Lyon enforcer of his era" },
      { name: "Pierre-Emile Højbjerg", tier: "Star", flag: "🇩🇰", note: "Tottenham's enforcer, fights the ref too" },
      // Cult
      { name: "Pepe", tier: "Cult", flag: "🇵🇹", note: "Stamped on someone's arms once" },
      { name: "Joey Barton", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "On and off the pitch" },
      { name: "Lee Cattermole", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sunderland's own" },
      { name: "Marco Materazzi", tier: "Cult", flag: "🇮🇹", note: "Got Zidane sent off" },
      { name: "Nigel de Jong", tier: "Cult", flag: "🇳🇱", note: "Karate kick to the chest" },
      { name: "Edgar Davids", tier: "Cult", flag: "🇳🇱", note: "Goggles. Always angry." },
      { name: "Robbie Savage", tier: "Cult", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Career wind-up merchant" },
      { name: "Paul Ince", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The Guv'nor. United's enforcer." },
      { name: "Massimo Ambrosini", tier: "Cult", flag: "🇮🇹", note: "Milan captain, would scrap" },
      { name: "Felipe Melo", tier: "Cult", flag: "🇧🇷", note: "Half tricks, half red cards" },
      // Wildcards
      { name: "Lee Bowyer", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Fought his own teammate" },
      { name: "Eric Cantona", tier: "Wildcard", flag: "🇫🇷", note: "Kung-fu kick. Fan in row C." },
      { name: "Duncan Ferguson", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Did time for headbutting" },
      { name: "Bryan Robson", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel. Played through broken bones." },
      { name: "Mark Hughes", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Built like a bouncer" },
      { name: "Kevin Muscat", tier: "Wildcard", flag: "🇦🇺", note: "Most-banned man in Australian football" },
      { name: "Robbie Fowler", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cocaine line celebration. Mad lad." },
      { name: "Mido", tier: "Wildcard", flag: "🇪🇬", note: "Threw boots at his own teammate" },
      { name: "El Hadji Diouf", tier: "Wildcard", flag: "🇸🇳", note: "Spat at fans. Multiple times." },
      { name: "Ben Thatcher", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "One of the worst tackles in PL history" }
    ]
  },

  // Q9 — Chaos — Most likely to get sent off
  {
    text: "Whose three-player squad is most likely to get sent off in a single match?",
    category: "Chaos",
    ronIntro: "I want carnage. Pick three guaranteed to see red. Bonus marks if it's all in the first half.",
    pool: [
      // Legends
      { name: "Sergio Ramos", tier: "Legend", flag: "🇪🇸", note: "Career red-card record holder" },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "13 in his career" },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Eight reds in the Premier League alone" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Headbutt heard around the world" },
      { name: "Wayne Rooney", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Stamped on Ricardo Carvalho" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Punched the ball, then a Greek" },
      { name: "Roberto Carlos", tier: "Legend", flag: "🇧🇷", note: "Bookings every Clásico" },
      { name: "Andoni Goikoetxea", tier: "Legend", flag: "🇪🇸", note: "The Butcher of Bilbao" },
      { name: "Claudio Gentile", tier: "Legend", flag: "🇮🇹", note: "Italian original — elbows, every game" },
      { name: "Marco Materazzi", tier: "Legend", flag: "🇮🇹", note: "Got Zidane sent off in a final" },
      // Stars
      { name: "Diego Costa", tier: "Star", flag: "🇪🇸", note: "Picks fights for fun" },
      { name: "Granit Xhaka", tier: "Star", flag: "🇨🇭", note: "Just looks at refs the wrong way" },
      { name: "Casemiro", tier: "Star", flag: "🇧🇷", note: "Stamps, kicks, generally" },
      { name: "Antonio Rüdiger", tier: "Star", flag: "🇩🇪", note: "Smiles while doing it" },
      { name: "Cristiano Romero", tier: "Star", flag: "🇦🇷", note: "On a fortnightly basis" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Will dive AND see red" },
      { name: "Saúl Ñíguez", tier: "Star", flag: "🇪🇸", note: "Atlético, all elbows" },
      { name: "Romelu Lukaku", tier: "Star", flag: "🇧🇪", note: "Chest-first into defenders" },
      { name: "Pierre-Emile Højbjerg", tier: "Star", flag: "🇩🇰", note: "Argues with anyone" },
      { name: "João Cancelo", tier: "Star", flag: "🇵🇹", note: "Started something every match" },
      // Cult
      { name: "Pepe", tier: "Cult", flag: "🇵🇹", note: "11 reds, smiling all the way" },
      { name: "Joey Barton", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Three reds in 90 minutes once" },
      { name: "Mario Balotelli", tier: "Cult", flag: "🇮🇹", note: "Why always him?" },
      { name: "Lee Cattermole", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "PL all-time leader for cards" },
      { name: "Vinnie Jones", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Three seconds, yellow card" },
      { name: "Nigel de Jong", tier: "Cult", flag: "🇳🇱", note: "Karate Kid in the World Cup final" },
      { name: "Gennaro Gattuso", tier: "Cult", flag: "🇮🇹", note: "Career red-card collection" },
      { name: "Paul Ince", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England captain in red shirts often" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Once refused to come on as a sub" },
      { name: "Lee Bowyer", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Fought his own teammate on the pitch" },
      // Wildcards
      { name: "Eric Cantona", tier: "Wildcard", flag: "🇫🇷", note: "Kung-fu, eight-month ban" },
      { name: "Luis Suárez", tier: "Wildcard", flag: "🇺🇾", note: "Three biting incidents. Career banned twice." },
      { name: "Jens Lehmann", tier: "Wildcard", flag: "🇩🇪", note: "Sent off in a CL final" },
      { name: "David Beckham (1998)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The kick at Simeone" },
      { name: "Mark van Bommel", tier: "Wildcard", flag: "🇳🇱", note: "Holland 2010 final. Hatchet job." },
      { name: "Felipe Melo", tier: "Wildcard", flag: "🇧🇷", note: "Brazilian stamping specialist" },
      { name: "Robbie Savage", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Refs hate him existing" },
      { name: "Marlon King", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Banned for assault, mid-career" },
      { name: "El Hadji Diouf", tier: "Wildcard", flag: "🇸🇳", note: "Spat at fans, multiple times" },
      { name: "Andre Onana", tier: "Wildcard", flag: "🇨🇲", note: "Hot-tempered keeper, pre-meditated theatrics" }
    ]
  },

  // Q10 — Chaos — Goal from a corner you shouldn't have scored
  {
    text: "Best three to score from a corner you absolutely should not have scored from?",
    category: "Chaos",
    ronIntro: "Set-piece routine. Pure chaos. Pick three you'd back to put it in from the most ridiculous angle. I'm scoring on absurdity.",
    pool: [
      // Legends
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Back-post header machine" },
      { name: "Sergio Ramos", tier: "Legend", flag: "🇪🇸", note: "93rd minute, Lisbon, 2014" },
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Won't miss" },
      { name: "Tony Adams", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Always the back post" },
      { name: "John Terry", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Most goals from corners ever in the PL" },
      { name: "Alan Shearer", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Will outjump anyone" },
      { name: "Marco Materazzi", tier: "Legend", flag: "🇮🇹", note: "'06 final equaliser, set-piece monster" },
      { name: "Fernando Hierro", tier: "Legend", flag: "🇪🇸", note: "Real Madrid's set-piece monster" },
      { name: "Steve Bruce", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "United's first-PL-title corner-goal captain" },
      { name: "Marcel Desailly", tier: "Legend", flag: "🇫🇷", note: "Towering presence, '98 final scorer" },
      // Stars
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Wins everything aerial" },
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Set-piece monster" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Just bullies it in" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Late runs, late goals" },
      { name: "William Saliba", tier: "Star", flag: "🇫🇷", note: "Towering threat" },
      { name: "Casemiro", tier: "Star", flag: "🇧🇷", note: "Specialist target" },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG's set-piece threat" },
      { name: "Ibrahima Konaté", tier: "Star", flag: "🇫🇷", note: "Liverpool's aerial monster" },
      { name: "Cristian Romero", tier: "Star", flag: "🇦🇷", note: "Spurs' aerial threat" },
      { name: "Ben Mee", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Burnley/Brentford set-piece warrior" },
      // Cult
      { name: "Tim Cahill", tier: "Cult", flag: "🇦🇺", note: "5'10. Heads it like he's 6'5." },
      { name: "Rogerio Ceni", tier: "Cult", flag: "🇧🇷", note: "Goalkeeper. Goes up for corners. Scores." },
      { name: "Sami Hyypiä", tier: "Cult", flag: "🇫🇮", note: "All elbows, all goals" },
      { name: "Peter Crouch", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "6'7. Aerial menace from any corner." },
      { name: "Rio Ferdinand", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Always rises late" },
      { name: "Ricardo Carvalho", tier: "Cult", flag: "🇵🇹", note: "Mourinho corner specialist" },
      { name: "Christopher Samba", tier: "Cult", flag: "🇨🇬", note: "Massive frame, all corner goals" },
      { name: "Phil Jagielka", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton corner specialist" },
      { name: "Marouane Fellaini", tier: "Cult", flag: "🇧🇪", note: "Hair, height, ten corner-goals a season" },
      { name: "Jan Vertonghen", tier: "Cult", flag: "🇧🇪", note: "Defender, scored every type of header" },
      // Wildcards
      { name: "Jimmy Glass", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Carlisle's keeper. 95th min. Saved them." },
      { name: "Tim Howard", tier: "Wildcard", flag: "🇺🇸", note: "Scored from his own box" },
      { name: "Asmir Begović", tier: "Wildcard", flag: "🇧🇦", note: "Scored after 13 seconds for Stoke" },
      { name: "Brad Friedel", tier: "Wildcard", flag: "🇺🇸", note: "Goalkeeper goal scorer" },
      { name: "Petr Čech", tier: "Wildcard", flag: "🇨🇿", note: "Came up for a corner once. We remember." },
      { name: "Adebayo Akinfenwa", tier: "Wildcard", flag: "🇳🇬", note: "Just bench-presses defenders out the way" },
      { name: "Andy Carroll", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "6'4. Whole career was corners." },
      { name: "Christian Benteke", tier: "Wildcard", flag: "🇧🇪", note: "Aerial specialist, set-piece scorer" },
      { name: "Olivier Giroud", tier: "Wildcard", flag: "🇫🇷", note: "French aerial menace, won everything" },
      { name: "Aleksandar Mitrović", tier: "Wildcard", flag: "🇷🇸", note: "Pure unmovable striker" }
    ]
  },

  // Q11 — One-Off — CL final extra time, ball at feet
  {
    text: "Who do you want with the ball at their feet, last minute, level in extra time of a Champions League final?",
    category: "One-Off",
    ronIntro: "Stadium silent. Ninety-thousand staring. One touch decides it. Pick three you'd give the ball to. I'm marking on nerve.",
    pool: [
      // Legends
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "'02 final volley. Untouchable in big moments." },
      { name: "Andrés Iniesta", tier: "Legend", flag: "🇪🇸", note: "Decisive in finals. Always." },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Finds an angle no one else sees" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Will demand the ball" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Made finals look easy" },
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Final-deciding pace and finish" },
      { name: "Andrea Pirlo", tier: "Legend", flag: "🇮🇹", note: "Will whisper one in. From anywhere." },
      { name: "Xavi", tier: "Legend", flag: "🇪🇸", note: "Found Iniesta. Found everyone." },
      { name: "Roberto Baggio", tier: "Legend", flag: "🇮🇹", note: "The pause, the precision" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "Three World Cups of last-minute confidence" },
      // Stars
      { name: "Kevin De Bruyne", tier: "Star", flag: "🇧🇪", note: "Picks the killer pass" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real Madrid's CL final scorer" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Built for these moments" },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Pace burns finals open" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Will demand and deliver" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "One sniff, one goal" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Argentine final-winning ice" },
      { name: "Toni Kroos", tier: "Star", flag: "🇩🇪", note: "Last-minute pass to Vinícius. Didn't move a muscle." },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's late-goal merchant" },
      { name: "Florian Wirtz", tier: "Star", flag: "🇩🇪", note: "Leverkusen's invincibles' moment-maker" },
      // Cult
      { name: "Frank Lampard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Late runs from midfield, every time" },
      { name: "Steven Gerrard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Drags games into his hands" },
      { name: "Kaká", tier: "Cult", flag: "🇧🇷", note: "Gliding runs, ice finishing" },
      { name: "Wesley Sneijder", tier: "Cult", flag: "🇳🇱", note: "2010: nearly won a treble single-handed" },
      { name: "Arjen Robben", tier: "Cult", flag: "🇳🇱", note: "You know what's coming. Can't stop it." },
      { name: "Didier Drogba", tier: "Cult", flag: "🇨🇮", note: "2012 final: header AND penalty" },
      { name: "Andrea Belotti", tier: "Cult", flag: "🇮🇹", note: "Italy's clutch finisher" },
      { name: "Mario Götze (2014)", tier: "Cult", flag: "🇩🇪", note: "Won Germany the World Cup, off the bench" },
      { name: "David Trezeguet", tier: "Cult", flag: "🇫🇷", note: "Won France a Euros final, 2000" },
      { name: "Sylvain Wiltord", tier: "Cult", flag: "🇫🇷", note: "Equalised in stoppage time, '00 final" },
      // Wildcards
      { name: "Ole Gunnar Solskjær (1999)", tier: "Wildcard", flag: "🇳🇴", note: "Off the bench. 93rd minute. Treble." },
      { name: "Sergio Agüero (2012)", tier: "Wildcard", flag: "🇦🇷", note: "Aguerooooo" },
      { name: "Demba Ba (2014)", tier: "Wildcard", flag: "🇸🇳", note: "The Steven Gerrard slip goal" },
      { name: "Eder (Portugal, Euro 2016)", tier: "Wildcard", flag: "🇵🇹", note: "Won Portugal a Euros final from the bench" },
      { name: "Olivier Giroud", tier: "Wildcard", flag: "🇫🇷", note: "Won everything. Always doubted." },
      { name: "Mario Mandžukić", tier: "Wildcard", flag: "🇭🇷", note: "Croatia's relentless final-goal man" },
      { name: "Diego Forlán", tier: "Wildcard", flag: "🇺🇾", note: "Could finish from anywhere" },
      { name: "Marek Hamšík", tier: "Wildcard", flag: "🇸🇰", note: "Slovakia captain, clutch finisher" },
      { name: "Cesc Fàbregas", tier: "Wildcard", flag: "🇪🇸", note: "Late assists, late goals" },
      { name: "Carles Puyol (2010)", tier: "Wildcard", flag: "🇪🇸", note: "Won Spain a World Cup with one header" }
    ]
  },

  // Q12 — Style — Beach football
  {
    text: "Best three to play with on a beach in flip-flops?",
    category: "Style",
    ronIntro: "Sand. Sun. No tactics board. Pick three who'd actually enjoy it. I'm scoring on smiles.",
    pool: [
      // Legends
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "Born for it" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "Started on the beach. Never left it." },
      { name: "Romário", tier: "Legend", flag: "🇧🇷", note: "Beach football's actual hall-of-famer" },
      { name: "Garrincha", tier: "Legend", flag: "🇧🇷", note: "Played for joy, every day" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Would dribble through the surf" },
      { name: "Johan Cruyff", tier: "Legend", flag: "🇳🇱", note: "Cigarette, bare feet, perfect first touch" },
      { name: "Zico", tier: "Legend", flag: "🇧🇷", note: "Brazilian, born to it" },
      { name: "Sócrates", tier: "Legend", flag: "🇧🇷", note: "Smoked at half-time, danced through the second" },
      { name: "George Best", tier: "Legend", flag: "🏴󠁧󠁢󠁮󠁩󠁲󠁿", note: "Belfast boy, beach-football energy" },
      { name: "Falcão", tier: "Legend", flag: "🇧🇷", note: "Actual beach football world champion" },
      // Stars
      { name: "Neymar", tier: "Star", flag: "🇧🇷", note: "Brazilian beach football royalty" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Smiles when he's playing" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "Plays like every game's a kickabout" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cool head, looser hips" },
      { name: "Khvicha Kvaratskhelia", tier: "Star", flag: "🇬🇪", note: "Pure joy with the ball" },
      { name: "Mohammed Kudus", tier: "Star", flag: "🇬🇭", note: "Skills first, end product second" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Joy in his feet, every game" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Watches the kickabout look like Wembley" },
      { name: "Jamal Musiala", tier: "Star", flag: "🇩🇪", note: "Glides, smiles, plays" },
      { name: "Jeremy Doku", tier: "Star", flag: "🇧🇪", note: "Dribbles for the love of it" },
      // Cult
      { name: "Adriano (Inter peak)", tier: "Cult", flag: "🇧🇷", note: "Rio de Janeiro to Milan and back" },
      { name: "Robinho", tier: "Cult", flag: "🇧🇷", note: "Step-overs were his warm-up" },
      { name: "Jay-Jay Okocha", tier: "Cult", flag: "🇳🇬", note: "Fun was the whole point" },
      { name: "Hatem Ben Arfa", tier: "Cult", flag: "🇫🇷", note: "Made every kickabout look like Marseille" },
      { name: "Riquelme", tier: "Cult", flag: "🇦🇷", note: "Slow walk, perfect ball" },
      { name: "Roberto Carlos", tier: "Cult", flag: "🇧🇷", note: "Will absolutely smash it into the dunes" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Beach-tan look, beach-finish technique" },
      { name: "Yannick Bolasie", tier: "Cult", flag: "🇨🇩", note: "Tricks for the highlights" },
      { name: "Adel Taarabt", tier: "Cult", flag: "🇲🇦", note: "Either god or nothing — beach is god mode" },
      { name: "Abedi Pelé", tier: "Cult", flag: "🇬🇭", note: "Marseille magic, Ghanaian flair" },
      // Wildcards
      { name: "Eric Cantona", tier: "Wildcard", flag: "🇫🇷", note: "Collared shirt, philosopher king" },
      { name: "Adebayo Akinfenwa", tier: "Wildcard", flag: "🇳🇬", note: "Just brings the energy" },
      { name: "Mario Balotelli", tier: "Wildcard", flag: "🇮🇹", note: "Will turn up. Bring fireworks." },
      { name: "Faustino Asprilla", tier: "Wildcard", flag: "🇨🇴", note: "Cartwheels included free" },
      { name: "Paul Gascoigne", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Genius and chaos in equal measure" },
      { name: "Jorge Campos", tier: "Wildcard", flag: "🇲🇽", note: "Goalkeeper-striker. Loudest shirts in football." },
      { name: "Carlos Valderrama", tier: "Wildcard", flag: "🇨🇴", note: "The hair, the slow walk, the perfect ball" },
      { name: "Hristo Stoichkov", tier: "Wildcard", flag: "🇧🇬", note: "Bulgarian fire in flip-flops" },
      { name: "Tomas Brolin", tier: "Wildcard", flag: "🇸🇪", note: "Retired early to enjoy life. Pure beach." },
      { name: "René Higuita", tier: "Wildcard", flag: "🇨🇴", note: "Goalkeeper. Will scorpion-kick the ice cream." }
    ]
  },

  // Q13 — Chaos — 5-2 goalfest
  {
    text: "Whose three-player squad scores the most goals in a 5-2 thriller you should have lost?",
    category: "Chaos",
    ronIntro: "Game's a mess. Defending optional. Pick three who'd score 4 between them whatever's happening at the other end.",
    pool: [
      // Legends
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Pre-knee, scored at will" },
      { name: "Romário", tier: "Legend", flag: "🇧🇷", note: "1000 career goals, his words" },
      { name: "Thierry Henry", tier: "Legend", flag: "🇫🇷", note: "Invincibles' top scorer for fun" },
      { name: "Gerd Müller", tier: "Legend", flag: "🇩🇪", note: "365 Bundesliga goals" },
      { name: "Eusébio", tier: "Legend", flag: "🇵🇹", note: "9 goals in a single World Cup" },
      { name: "Marco van Basten", tier: "Legend", flag: "🇳🇱", note: "Hat-trick king, three-time Ballon d'Or" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "700+ club goals" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "All-time top scorer in football" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "1283 goals (his words)" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Decisive in any game" },
      // Stars
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Scoring rate: absurd" },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Hat-trick in a final, almost won it" },
      { name: "Robert Lewandowski", tier: "Star", flag: "🇵🇱", note: "5 goals in 9 minutes once" },
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's all-time top scorer" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Direct, fast, deadly" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Liverpool's top scorer year after year" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Modern goal-machine winger" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's goal-creator and scorer" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cool finishes from anywhere" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Inter's go-to in a goalfest" },
      // Cult
      { name: "Sergio Agüero", tier: "Cult", flag: "🇦🇷", note: "Agueroooo. Multiple times." },
      { name: "Didier Drogba", tier: "Cult", flag: "🇨🇮", note: "Carries goals on big nights" },
      { name: "Edinson Cavani", tier: "Cult", flag: "🇺🇾", note: "Runs through walls for goals" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Energy and goals, never stopped" },
      { name: "Andriy Shevchenko", tier: "Cult", flag: "🇺🇦", note: "Milan's clinical finisher" },
      { name: "Jermain Defoe", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "162 PL goals across four clubs" },
      { name: "Robbie Fowler", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "God. Liverpool's natural finisher" },
      { name: "Michael Owen", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pace and finish, Liverpool/Real" },
      { name: "Filippo Inzaghi", tier: "Cult", flag: "🇮🇹", note: "Born offside, scored everywhere" },
      { name: "Wayne Rooney", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's record scorer for years" },
      // Wildcards
      { name: "Mario Balotelli", tier: "Wildcard", flag: "🇮🇹", note: "Either 3 goals or sent off" },
      { name: "Adebayo Akinfenwa", tier: "Wildcard", flag: "🇳🇬", note: "Will physically score from anywhere" },
      { name: "Faustino Asprilla", tier: "Wildcard", flag: "🇨🇴", note: "3-2 vs Barcelona, '97 — hat-trick" },
      { name: "Dwight Yorke", tier: "Wildcard", flag: "🇹🇹", note: "United '99 — goals AND smiles" },
      { name: "Peter Crouch", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "100 PL goals from the most unlikely angles" },
      { name: "Hakan Şükür", tier: "Wildcard", flag: "🇹🇷", note: "Fastest goal in World Cup history" },
      { name: "Andy Cole", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "187 PL goals, ice cold" },
      { name: "Tim Cahill", tier: "Wildcard", flag: "🇦🇺", note: "5'10 header machine" },
      { name: "Demba Ba", tier: "Wildcard", flag: "🇸🇳", note: "Newcastle's goal merchant" },
      { name: "Christian Benteke", tier: "Wildcard", flag: "🇧🇪", note: "Aerial, ground, anywhere" }
    ]
  },

  // Q14 — Season-Long — Relegation dogfight
  {
    text: "Who do you want for a relegation dogfight in April?",
    category: "Season-Long",
    ronIntro: "Four games left. You're 18th. Pick three who'd grab the club by the collar and drag them out of it. Hero ball merchants only.",
    pool: [
      // Legends
      { name: "Alan Shearer", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "260 PL goals, never relegated himself" },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Demands more from everyone" },
      { name: "Stuart Pearce", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. Will not lose at home." },
      { name: "Bryan Robson", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel. Played through everything." },
      { name: "Tony Adams", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain leader legend" },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Engine and enforcer" },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Drags any team to a result" },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Goals from midfield, every season" },
      { name: "Ryan Giggs", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Senior pro for hire" },
      { name: "John Terry", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Won't accept it" },
      // Stars
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's captain. Carries clubs." },
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Calm in the storm" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "38 games every season, no excuses" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Drags United through every crisis" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Old head, young legs" },
      { name: "James Maddison", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Set-piece quality, big-game taker" },
      { name: "Declan Rice", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Iron man, leads from midfield" },
      { name: "Ben Mee", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Burnley/Brentford survival warrior" },
      { name: "Ollie Watkins", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came up from below, knows the grit" },
      { name: "Ivan Toney", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came through lower leagues, takes the pressure" },
      // Cult
      { name: "Jamie Vardy", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Won the league at 5000-1. Will save you from 18th." },
      { name: "Wilfried Zaha", tier: "Cult", flag: "🇨🇮", note: "Carried Palace single-handed for years" },
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "Won City the league himself" },
      { name: "Kevin Nolan", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Box-to-box midfield grafter" },
      { name: "Charlie Adam", tier: "Cult", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Range from anywhere, no fear" },
      { name: "Christian Benteke", tier: "Cult", flag: "🇧🇪", note: "Towering target, kept Villa up twice" },
      { name: "Mark Noble", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "West Ham's perpetual heart" },
      { name: "James Milner", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Every position, every game" },
      { name: "Phil Jagielka", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton survival captain forever" },
      { name: "Glenn Murray", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Brighton's promotion-clinching workhorse" },
      // Wildcards
      { name: "Andy Carroll", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Plan B. The whole plan." },
      { name: "Marouane Fellaini", tier: "Wildcard", flag: "🇧🇪", note: "Throw him up front, see what happens" },
      { name: "Peter Odemwingie", tier: "Wildcard", flag: "🇳🇬", note: "Drove to QPR, scored everywhere else" },
      { name: "Kevin Davies", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Most fouls in PL history. By a mile." },
      { name: "Steven Fletcher", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Sunderland's relegation-survival man" },
      { name: "Tim Cahill", tier: "Wildcard", flag: "🇦🇺", note: "5'10 header machine, Everton's hero" },
      { name: "Brett Emerton", tier: "Wildcard", flag: "🇦🇺", note: "Bolton workhorse, Premier League grafter" },
      { name: "Robbie Savage", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Will fight everyone for survival" },
      { name: "Connor Wickham", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sunderland's survival hero, '14" },
      { name: "Charlie Austin", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "QPR throwback striker" }
    ]
  },

  // Q15 — Character — Half-time dressing room
  {
    text: "Who do you want walking into the dressing room at half-time when everything's gone wrong?",
    category: "Character",
    ronIntro: "0-2 down. Press conference imminent. Pick three you'd want to actually open their mouth in there. Voice carries weight.",
    pool: [
      // Legends
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Will tell you exactly what he thinks" },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Captain's captain" },
      { name: "Tony Adams", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Donkey ears, lion's heart" },
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Calm. Authoritative. Won everything." },
      { name: "Franz Beckenbauer", tier: "Legend", flag: "🇩🇪", note: "Der Kaiser. Authority personified." },
      { name: "Bobby Moore", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's calmest ever captain" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Will say one cryptic sentence. Team wins." },
      { name: "Marco Tardelli", tier: "Legend", flag: "🇮🇹", note: "Italia '82 winner, captain energy" },
      { name: "Luis Figo", tier: "Legend", flag: "🇵🇹", note: "Real Madrid's quiet authority" },
      { name: "Fabio Cannavaro", tier: "Legend", flag: "🇮🇹", note: "'06 World Cup-winning captain" },
      // Stars
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Doesn't shout. Doesn't need to." },
      { name: "Sergio Ramos", tier: "Star", flag: "🇪🇸", note: "Won't accept losing" },
      { name: "Toni Kroos", tier: "Star", flag: "🇩🇪", note: "Heartbeat doesn't change" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Demands more, every game" },
      { name: "Cristiano Ronaldo", tier: "Star", flag: "🇵🇹", note: "Will not let the dressing room sleep" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Quiet authority. They listen." },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Old head, young legs" },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG captain, leads quietly" },
      { name: "Rodri", tier: "Star", flag: "🇪🇸", note: "Doesn't need to raise his voice" },
      { name: "Declan Rice", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Calm, English, captain material" },
      // Cult
      { name: "Carles Puyol", tier: "Cult", flag: "🇪🇸", note: "Will throw his head at the door if needed" },
      { name: "Vincent Kompany", tier: "Cult", flag: "🇧🇪", note: "Won City their first PL through sheer will" },
      { name: "Diego Godín", tier: "Cult", flag: "🇺🇾", note: "Atlético's spine. Doesn't blink." },
      { name: "Steven Gerrard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Istanbul team-talk material" },
      { name: "Iker Casillas", tier: "Cult", flag: "🇪🇸", note: "Spain's quiet captain through everything" },
      { name: "Daniel Agger", tier: "Cult", flag: "🇩🇰", note: "Liverpool's hardman with a brain" },
      { name: "Jamie Carragher", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's loudest leader" },
      { name: "Daniele De Rossi", tier: "Cult", flag: "🇮🇹", note: "Roma forever, captain through everything" },
      { name: "Xabi Alonso", tier: "Cult", flag: "🇪🇸", note: "Calmest tactical brain alive" },
      { name: "Martin Keown", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal Invincibles enforcer" },
      // Wildcards
      { name: "Graeme Souness", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Once planted a flag in the centre circle" },
      { name: "Edwin van der Sar", tier: "Wildcard", flag: "🇳🇱", note: "Senior pro, calm voice from the back" },
      { name: "Lothar Matthäus", tier: "Wildcard", flag: "🇩🇪", note: "Most-capped Germany player ever" },
      { name: "Lucio", tier: "Wildcard", flag: "🇧🇷", note: "Inter's 2010 treble captain. Authority without volume." },
      { name: "John Terry", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Chelsea's loudest leader for a decade" },
      { name: "Bryan Robson", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Played through broken bones. Captain Marvel." },
      { name: "Stuart Pearce", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. Won't have it." },
      { name: "Gennaro Gattuso", tier: "Wildcard", flag: "🇮🇹", note: "Will literally smash a teacup" },
      { name: "Pep Guardiola (player)", tier: "Wildcard", flag: "🇪🇸", note: "Captain's captain at Barça" },
      { name: "Wesley Sneijder", tier: "Wildcard", flag: "🇳🇱", note: "Inter '10 treble's voice" }
    ]
  },

  // Q16 — One-Off — Knockout vs better team
  {
    text: "Best three players to win you one knockout game against a much better team?",
    category: "One-Off",
    ronIntro: "Underdog. One leg. They've got the better players. Pick three who'd find a way. I'm watching for cunning.",
    pool: [
      // Legends
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Beat England single-handed in '86" },
      { name: "Andrés Iniesta", tier: "Legend", flag: "🇪🇸", note: "Decides knockouts with one touch" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Made big games look easy" },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Juventus '99 — single-handed performance" },
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Won't let them past, ever" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Drags lesser teams to wins" },
      { name: "Franco Baresi", tier: "Legend", flag: "🇮🇹", note: "Won 3 CLs as a defender, one-leg merchant" },
      { name: "Fabio Cannavaro", tier: "Legend", flag: "🇮🇹", note: "'06 World Cup, beat better teams as captain" },
      { name: "Xavi", tier: "Legend", flag: "🇪🇸", note: "Drags better teams onto his terms" },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Istanbul. Olympiakos. Career of upsets." },
      // Stars
      { name: "Cristiano Ronaldo", tier: "Star", flag: "🇵🇹", note: "Big games, bigger mentality" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Made for one-off knockouts" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real Madrid's CL knockout specialist" },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Pace burns better teams open" },
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Holds the back four together" },
      { name: "Casemiro", tier: "Star", flag: "🇧🇷", note: "Breaks up everything. Won 5 CLs." },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "One-off chaos merchant" },
      { name: "Khvicha Kvaratskhelia", tier: "Star", flag: "🇬🇪", note: "Georgia's giant-killer in waiting" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's knockout-game scorer" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Built for one-off pressure" },
      // Cult
      { name: "Pepe", tier: "Cult", flag: "🇵🇹", note: "Will get under their skin and stay there" },
      { name: "Diego Simeone (as a player)", tier: "Cult", flag: "🇦🇷", note: "Most uncomfortable opponent in Europe" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Energy and goals, never stopped" },
      { name: "Andrea Pirlo", tier: "Cult", flag: "🇮🇹", note: "Slows the game down, runs it from there" },
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "One man, three positions, no panic" },
      { name: "N'Golo Kanté", tier: "Cult", flag: "🇫🇷", note: "Wins everything. Says nothing." },
      { name: "Wesley Sneijder", tier: "Cult", flag: "🇳🇱", note: "2010: nearly won a treble single-handed" },
      { name: "Nicolás Otamendi", tier: "Cult", flag: "🇦🇷", note: "Argentine cunning, dirty when needed" },
      { name: "Nemanja Matić", tier: "Cult", flag: "🇷🇸", note: "Slows games down, frustrates better teams" },
      { name: "Rui Costa", tier: "Cult", flag: "🇵🇹", note: "Portuguese magic, big-game player" },
      // Wildcards
      { name: "Park Ji-sung", tier: "Wildcard", flag: "🇰🇷", note: "Man-marked Pirlo into invisibility" },
      { name: "Mark Hughes", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Bullied better defenders for years" },
      { name: "Costinha", tier: "Wildcard", flag: "🇵🇹", note: "Mourinho's '04 Porto enforcer" },
      { name: "Demba Ba", tier: "Wildcard", flag: "🇸🇳", note: "Slipped past Liverpool, won the league for City" },
      { name: "Marouane Fellaini", tier: "Wildcard", flag: "🇧🇪", note: "Plan B becomes plan A under pressure" },
      { name: "Tim Cahill", tier: "Wildcard", flag: "🇦🇺", note: "Nuisance, header machine, smiling assassin" },
      { name: "Eder (Portugal, '16)", tier: "Wildcard", flag: "🇵🇹", note: "Beat France in their backyard" },
      { name: "Dirk Kuyt", tier: "Wildcard", flag: "🇳🇱", note: "Workrate of three players" },
      { name: "Ole Gunnar Solskjær", tier: "Wildcard", flag: "🇳🇴", note: "Won a CL final from the bench" },
      { name: "Wissam Ben Yedder", tier: "Wildcard", flag: "🇫🇷", note: "Sevilla's CL late-goal machine" }
    ]
  },

  // Q17 — Style — Most beautiful team goal
  {
    text: "Best three for the most beautiful team goal — six passes, no defender touches it?",
    category: "Style",
    ronIntro: "Pure football. Triangles. One-touch. Pick three who'd thread a goal together that ends up on every highlight reel for twenty years.",
    pool: [
      // Legends
      { name: "Xavi Hernández", tier: "Legend", flag: "🇪🇸", note: "Architect of the Barça dynasty" },
      { name: "Andrés Iniesta", tier: "Legend", flag: "🇪🇸", note: "Glides between lines, finds impossible angles" },
      { name: "Johan Cruyff", tier: "Legend", flag: "🇳🇱", note: "Invented the way the modern game is played" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Pirouettes in tight spaces" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Sees the pass everyone else misses" },
      { name: "Dennis Bergkamp", tier: "Legend", flag: "🇳🇱", note: "Touch and vision, every time" },
      { name: "Michel Platini", tier: "Legend", flag: "🇫🇷", note: "Italia '90 era playmaker, three Ballons d'Or" },
      { name: "Ferenc Puskás", tier: "Legend", flag: "🇭🇺", note: "Hungary's '50s genius, the original" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Made every pass look obvious in hindsight" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "Brazilian flow, before there was a name for it" },
      // Stars
      { name: "Kevin De Bruyne", tier: "Star", flag: "🇧🇪", note: "Best playmaker of his generation" },
      { name: "Jamal Musiala", tier: "Star", flag: "🇩🇪", note: "Glides, finds, finishes" },
      { name: "Pedri", tier: "Star", flag: "🇪🇸", note: "Heir to Iniesta's throne" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Through-balls into space, every game" },
      { name: "Rodri", tier: "Star", flag: "🇪🇸", note: "Conducts the orchestra from deep" },
      { name: "Florian Wirtz", tier: "Star", flag: "🇩🇪", note: "Bayer's creative metronome" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's interplay specialist" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real's run-and-finish at the end of moves" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Threads the killer ball, ice-cold" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "The next great combination player" },
      // Cult
      { name: "Andrea Pirlo", tier: "Cult", flag: "🇮🇹", note: "Slows time. Picks the perfect ball." },
      { name: "Sergio Busquets", tier: "Cult", flag: "🇪🇸", note: "First touch out, second touch decisive" },
      { name: "David Silva", tier: "Cult", flag: "🇪🇸", note: "Made City flow for a decade" },
      { name: "Toni Kroos", tier: "Cult", flag: "🇩🇪", note: "Range and weight, never wasted a pass" },
      { name: "Cesc Fàbregas", tier: "Cult", flag: "🇪🇸", note: "Vision before he was old enough to drink" },
      { name: "Mesut Özil", tier: "Cult", flag: "🇩🇪", note: "Most assists per game in PL history" },
      { name: "Frank Lampard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Late runs, late finishes, beautiful chemistry" },
      { name: "Steven Gerrard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Range and weight on every pass" },
      { name: "Paul Scholes", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Never wasted a pass in his life" },
      { name: "Robert Pirès", tier: "Cult", flag: "🇫🇷", note: "Invincibles' velvet touch" },
      // Wildcards
      { name: "Adam Lallana", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's quiet artist on the ball" },
      { name: "Joshua Kimmich", tier: "Wildcard", flag: "🇩🇪", note: "Ranged passing from the right back" },
      { name: "Granit Xhaka", tier: "Wildcard", flag: "🇨🇭", note: "Best left-foot passer at Arsenal in years" },
      { name: "Thiago Alcântara", tier: "Wildcard", flag: "🇪🇸", note: "Spin-and-find specialist" },
      { name: "Marco Verratti", tier: "Wildcard", flag: "🇮🇹", note: "Shortest player on the pitch, longest pass" },
      { name: "Riyad Mahrez", tier: "Wildcard", flag: "🇩🇿", note: "Left foot, inside foot, outside foot — all perfect" },
      { name: "Trent Alexander-Arnold", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Quarterback range from right back" },
      { name: "Bernardo Silva", tier: "Wildcard", flag: "🇵🇹", note: "Tight-space genius" },
      { name: "Ilkay Gündoğan", tier: "Wildcard", flag: "🇩🇪", note: "Late-arriving box maestro" },
      { name: "Christian Eriksen", tier: "Wildcard", flag: "🇩🇰", note: "Quiet weight on every ball" }
    ]
  },

  // Q18 — Chaos — Arguments with the referee
  {
    text: "Whose three-player squad gets into the most arguments with the referee in 90 minutes?",
    category: "Chaos",
    ronIntro: "Yellow cards optional. Sustained complaining only. Pick three who'd surround the man in black at every decision.",
    pool: [
      // Legends
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Won't let an inch of bad refereeing go" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Argued with everyone, always" },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Eight reds in the PL alone" },
      { name: "Sergio Ramos", tier: "Legend", flag: "🇪🇸", note: "Career red-card record holder" },
      { name: "Wayne Rooney", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Veins in temples, always" },
      { name: "Zlatan Ibrahimović", tier: "Legend", flag: "🇸🇪", note: "Will lecture refs on philosophy" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Banned for kung-fu kick. Argued with reality itself." },
      { name: "Graeme Souness", tier: "Legend", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Career arguer, with everyone" },
      { name: "Stuart Pearce", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. Won't accept a single decision." },
      { name: "Vinnie Jones", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Three-second yellow, lifetime grievances" },
      // Stars
      { name: "Cristiano Ronaldo", tier: "Star", flag: "🇵🇹", note: "Captain rights abused" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Hands on hips, mouth running" },
      { name: "Granit Xhaka", tier: "Star", flag: "🇨🇭", note: "Just looks at refs the wrong way" },
      { name: "Antonio Rüdiger", tier: "Star", flag: "🇩🇪", note: "Smiles while complaining" },
      { name: "Diego Costa", tier: "Star", flag: "🇪🇸", note: "Picks fights for fun" },
      { name: "Casemiro", tier: "Star", flag: "🇧🇷", note: "Will dispute every call" },
      { name: "Cristiano Romero", tier: "Star", flag: "🇦🇷", note: "Constant theatrics, every game" },
      { name: "Saúl Ñíguez", tier: "Star", flag: "🇪🇸", note: "Atlético's sustained-complaint specialist" },
      { name: "João Cancelo", tier: "Star", flag: "🇵🇹", note: "Will dispute every single throw-in" },
      { name: "Pierre-Emile Højbjerg", tier: "Star", flag: "🇩🇰", note: "Argues with anyone, including own teammates" },
      // Cult
      { name: "Joey Barton", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "On the pitch, off the pitch, on Twitter" },
      { name: "John Terry", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain. Demands all the calls." },
      { name: "Pepe", tier: "Cult", flag: "🇵🇹", note: "Three reds, smiling all the way" },
      { name: "Edgar Davids", tier: "Cult", flag: "🇳🇱", note: "Goggles. Always angry." },
      { name: "Marco Materazzi", tier: "Cult", flag: "🇮🇹", note: "Got Zidane sent off by talking" },
      { name: "Lee Cattermole", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "PL all-time leader for cards" },
      { name: "Gennaro Gattuso", tier: "Cult", flag: "🇮🇹", note: "Will scream at refs in three languages" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Streetfighter mentality, every game" },
      { name: "Paul Ince", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain. Always disputing." },
      { name: "Diego Simeone (player)", tier: "Cult", flag: "🇦🇷", note: "Pre-management, won the ball through arguments" },
      // Wildcards
      { name: "Robbie Savage", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Loudest man in the dressing room and the box" },
      { name: "Craig Bellamy", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Famous for arguments with refs and teammates" },
      { name: "El Hadji Diouf", tier: "Wildcard", flag: "🇸🇳", note: "Spat on opponents, argued with everyone" },
      { name: "Daniele De Rossi", tier: "Wildcard", flag: "🇮🇹", note: "Roma captain, perpetually furious" },
      { name: "Mark Hughes", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Bullied refs as much as defenders" },
      { name: "Ashley Williams", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Wales' captain, constant complainer" },
      { name: "Mark van Bommel", tier: "Wildcard", flag: "🇳🇱", note: "Career provocateur, Holland 2010 final" },
      { name: "Felipe Melo", tier: "Wildcard", flag: "🇧🇷", note: "Stamping AND complaining, double threat" },
      { name: "Andre Onana", tier: "Wildcard", flag: "🇨🇲", note: "Hot-tempered keeper, theatrical" },
      { name: "Robbie Fowler", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Snorted the line celebration. Permanent grievance." }
    ]
  },

  // Q19 — Season-Long — Full Champions League campaign
  {
    text: "Who do you want carrying your club through one full Champions League campaign — group to final?",
    category: "Season-Long",
    ronIntro: "13 matches. From dead Tuesday in Ukraine to a final in May. Pick three who'd be standing at the end. I'm marking on whole-season weight.",
    pool: [
      // Legends
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "All-time CL top scorer" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Eight CL group-stage hat-tricks" },
      { name: "Karim Benzema", tier: "Legend", flag: "🇫🇷", note: "Real Madrid's CL talisman" },
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Five CL finals, five winners' medals" },
      { name: "Andrés Iniesta", tier: "Legend", flag: "🇪🇸", note: "Decided two CL finals" },
      { name: "Andrea Pirlo", tier: "Legend", flag: "🇮🇹", note: "Conducted Milan's 2007 CL win" },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Istanbul. Anfield European nights." },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "29 CL goals from midfield" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "'02 final volley, 2 CL titles" },
      { name: "Alessandro Costacurta", tier: "Legend", flag: "🇮🇹", note: "Milan's quiet 5-CL anchor" },
      // Stars
      { name: "Kevin De Bruyne", tier: "Star", flag: "🇧🇪", note: "City's CL-winning architect" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real's CL final scorer" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Built for these nights" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Goals per game absurd" },
      { name: "Toni Kroos", tier: "Star", flag: "🇩🇪", note: "Six CL winners' medals" },
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Anchored Liverpool's '19 win" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Liverpool's '19 CL win, European nights at Anfield" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "United's European points-getter" },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG's European captain" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal's CL main man" },
      // Cult
      { name: "Sergio Ramos", tier: "Cult", flag: "🇪🇸", note: "93rd minute, Lisbon, 2014" },
      { name: "Casemiro", tier: "Cult", flag: "🇧🇷", note: "Five CL winners' medals" },
      { name: "Luka Modrić", tier: "Cult", flag: "🇭🇷", note: "Spine of Real's three-peat" },
      { name: "Sergio Busquets", tier: "Cult", flag: "🇪🇸", note: "Three CL titles with Barça" },
      { name: "Xabi Alonso", tier: "Cult", flag: "🇪🇸", note: "Won it with Liverpool AND Real" },
      { name: "Manuel Neuer", tier: "Cult", flag: "🇩🇪", note: "Bayern's 2013 and 2020 winner" },
      { name: "Ángel Di María", tier: "Cult", flag: "🇦🇷", note: "Big-game performer in Europe always" },
      { name: "Rafael Marquez", tier: "Cult", flag: "🇲🇽", note: "Barça's quiet CL spine, '06 winner" },
      { name: "Fabio Cannavaro", tier: "Cult", flag: "🇮🇹", note: "'06 World Cup, CL with Madrid" },
      { name: "Carles Puyol", tier: "Cult", flag: "🇪🇸", note: "Barça's three CL wins, never blinked" },
      // Wildcards
      { name: "Wesley Sneijder", tier: "Wildcard", flag: "🇳🇱", note: "2010: nearly won a treble single-handed" },
      { name: "Didier Drogba", tier: "Wildcard", flag: "🇨🇮", note: "Header AND penalty, 2012 final" },
      { name: "Diego Milito", tier: "Wildcard", flag: "🇦🇷", note: "Both goals in Inter's 2010 final" },
      { name: "Yaya Touré", tier: "Wildcard", flag: "🇨🇮", note: "Barça's 2009 treble engine" },
      { name: "Edinson Cavani", tier: "Wildcard", flag: "🇺🇾", note: "Ran through walls for PSG in Europe" },
      { name: "Iker Casillas", tier: "Wildcard", flag: "🇪🇸", note: "Captained Real's '14 La Décima win" },
      { name: "Demba Ba", tier: "Wildcard", flag: "🇸🇳", note: "Slipped past Liverpool, CL knockout hero" },
      { name: "Filippo Inzaghi", tier: "Wildcard", flag: "🇮🇹", note: "Born offside, scored finals" },
      { name: "Costinha", tier: "Wildcard", flag: "🇵🇹", note: "Mourinho's '04 Porto miracle" },
      { name: "Park Ji-sung", tier: "Wildcard", flag: "🇰🇷", note: "United's man-marker in big CL nights" }
    ]
  },

  // Q20 — Character — Tunnel walk-out captaincy
  {
    text: "Who do you want as your three-player squad's captain when the camera's on you in the tunnel?",
    category: "Character",
    ronIntro: "Walk-out shot. Sky Sports cameras in your face. National anthem next. Pick three you'd trust to set the tone before a ball's been kicked.",
    pool: [
      // Legends
      { name: "Tony Adams", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain leader legend" },
      { name: "Bobby Moore", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's calmest ever captain" },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Won't let anyone slack off" },
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Won everything. Said little." },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Captain's captain at Arsenal" },
      { name: "Franz Beckenbauer", tier: "Legend", flag: "🇩🇪", note: "Der Kaiser. Authority personified." },
      { name: "Bobby Charlton", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's cathedral. Quietest leader ever." },
      { name: "Fabio Cannavaro", tier: "Legend", flag: "🇮🇹", note: "'06 World Cup-winning captain" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Collar up, presence inhabited" },
      { name: "Marco Tardelli", tier: "Legend", flag: "🇮🇹", note: "The '82 winner. The roar." },
      // Stars
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Calm, towering, unflappable" },
      { name: "Sergio Ramos", tier: "Star", flag: "🇪🇸", note: "Most-decorated captain in Spain's history" },
      { name: "Cristiano Ronaldo", tier: "Star", flag: "🇵🇹", note: "Portugal's leader for 20 years" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Argentina's quiet captain, World Cup winner" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "United's captain. Demands more." },
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's captain. Composed." },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG captain, calm in any situation" },
      { name: "Rodri", tier: "Star", flag: "🇪🇸", note: "Doesn't speak much. Doesn't have to." },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Old head, young legs" },
      { name: "Declan Rice", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Calm English captaincy" },
      // Cult
      { name: "Vincent Kompany", tier: "Cult", flag: "🇧🇪", note: "Won City the league through sheer will" },
      { name: "Carles Puyol", tier: "Cult", flag: "🇪🇸", note: "Will throw his head at any door" },
      { name: "Iker Casillas", tier: "Cult", flag: "🇪🇸", note: "Spain's quiet captain through everything" },
      { name: "Steven Gerrard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's heartbeat for two decades" },
      { name: "John Terry", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Chelsea's loudest leader for a decade" },
      { name: "Xavi Hernández", tier: "Cult", flag: "🇪🇸", note: "Barça and Spain's quiet conductor" },
      { name: "Daniele De Rossi", tier: "Cult", flag: "🇮🇹", note: "Roma forever, captain through everything" },
      { name: "Massimo Ambrosini", tier: "Cult", flag: "🇮🇹", note: "Milan captain's captain" },
      { name: "Jamie Carragher", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's loudest leader" },
      { name: "Xabi Alonso", tier: "Cult", flag: "🇪🇸", note: "Calmest tactical brain in any tunnel" },
      // Wildcards
      { name: "Bryan Robson", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel. Played through broken bones." },
      { name: "Stuart Pearce", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. England's hard-faced leader." },
      { name: "Lucio", tier: "Wildcard", flag: "🇧🇷", note: "Inter's 2010 treble captain" },
      { name: "Lothar Matthäus", tier: "Wildcard", flag: "🇩🇪", note: "Most-capped Germany player ever" },
      { name: "Daniel Agger", tier: "Wildcard", flag: "🇩🇰", note: "Liverpool and Denmark's quiet hardman" },
      { name: "Diego Godín", tier: "Wildcard", flag: "🇺🇾", note: "Atlético and Uruguay's spine" },
      { name: "Graeme Souness", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Once planted a flag in the centre circle" },
      { name: "Dunga", tier: "Wildcard", flag: "🇧🇷", note: "Brazil '94 captain, hardest gaze in football" },
      { name: "Hristo Stoichkov", tier: "Wildcard", flag: "🇧🇬", note: "Bulgaria's terrifying captain" },
      { name: "Nemanja Vidić", tier: "Wildcard", flag: "🇷🇸", note: "United's no-nonsense captain" }
    ]
  },

  // Q21 — One-Off — Eight-second counter-attack
  {
    text: "Who do you want for one perfect counter-attack — break from your own box, score in eight seconds?",
    category: "One-Off",
    ronIntro: "Throw-in to them. Cleared to the halfway line. Eight seconds, you're 1-0 up. Pick three who'd execute it without thinking.",
    pool: [
      // Legends
      { name: "Thierry Henry", tier: "Legend", flag: "🇫🇷", note: "Pace, vision, finish — the complete forward" },
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Pre-knee, the fastest finisher ever" },
      { name: "Andriy Shevchenko", tier: "Legend", flag: "🇺🇦", note: "Milan's clinical counter-attack king" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Pace and finish, every counter" },
      { name: "Marco van Basten", tier: "Legend", flag: "🇳🇱", note: "Hat-trick king, ice-cold" },
      { name: "Romário", tier: "Legend", flag: "🇧🇷", note: "Didn't run far. Didn't need to." },
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "Could turn defence into attack alone" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "The 1986 England goal — eight seconds personified" },
      { name: "Filippo Inzaghi", tier: "Legend", flag: "🇮🇹", note: "Born to find the gaps in transitions" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Drift, accelerate, finish" },
      // Stars
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Fastest forward in Europe" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real Madrid's break-out specialist" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Long-strider, deadly in space" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Liverpool's right-channel destroyer" },
      { name: "Khvicha Kvaratskhelia", tier: "Star", flag: "🇬🇪", note: "Direct, fast, fearless" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal's main threat in transition" },
      { name: "Robert Lewandowski", tier: "Star", flag: "🇵🇱", note: "Sharp finisher in transition" },
      { name: "Ousmane Dembélé", tier: "Star", flag: "🇫🇷", note: "Two-footed pace specialist" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's transition link-up" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cool finishes from transition" },
      // Cult
      { name: "Arjen Robben", tier: "Cult", flag: "🇳🇱", note: "You knew where he was going. Couldn't stop him." },
      { name: "Sergio Agüero", tier: "Cult", flag: "🇦🇷", note: "Counter-attack finishing royalty" },
      { name: "Didier Drogba", tier: "Cult", flag: "🇨🇮", note: "Held it up, brought runners through" },
      { name: "Samuel Eto'o", tier: "Cult", flag: "🇨🇲", note: "Multiple CL counter-attack goals" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Energy and finish, never stopped running" },
      { name: "Robin van Persie", tier: "Cult", flag: "🇳🇱", note: "Sharp left foot in space" },
      { name: "Ryan Giggs", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The 1999 FA Cup semi-final. Eight seconds, no chance." },
      { name: "Eden Hazard", tier: "Cult", flag: "🇧🇪", note: "Drift, pace, finish — Chelsea's main man for years" },
      { name: "Nicolas Anelka", tier: "Cult", flag: "🇫🇷", note: "Pace and finish, every club" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Could finish from any angle" },
      // Wildcards
      { name: "Theo Walcott", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pace and nothing else. But the pace was incredible." },
      { name: "Aaron Lennon", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Spurs' counter-attacking nightmare" },
      { name: "Jermain Defoe", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "162 PL goals, mostly on the run" },
      { name: "Antonio Valencia", tier: "Wildcard", flag: "🇪🇨", note: "United's right-side destroyer" },
      { name: "Ashley Young", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pace then crosses, 15 years of it" },
      { name: "Daniel Sturridge", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's counter-attack finisher" },
      { name: "Hakan Şükür", tier: "Wildcard", flag: "🇹🇷", note: "Fastest goal in World Cup history (10.8s)" },
      { name: "Wilfried Zaha", tier: "Wildcard", flag: "🇨🇮", note: "Palace's break-out specialist for years" },
      { name: "Yannick Bolasie", tier: "Wildcard", flag: "🇨🇩", note: "Pure pace, every counter" },
      { name: "Adama Traoré", tier: "Wildcard", flag: "🇪🇸", note: "Cones go missing when he's running" }
    ]
  },

  // Q22 — Style — Video game on easy mode
  {
    text: "Best three players who'd make every match look like a video game on easy mode?",
    category: "Style",
    ronIntro: "I want the football equivalent of a cheat code. Pick three who'd make the game look pre-scripted. Everyone else looks normal speed.",
    pool: [
      // Legends
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Sees the pass that doesn't exist" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Beat England single-handed in '86" },
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Pre-knee. End of debate." },
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "The ball was on a string" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Untouchable in tight spaces" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Pace, power, finishing — all elite" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "1283 goals — looks like a coding error" },
      { name: "Johan Cruyff", tier: "Legend", flag: "🇳🇱", note: "Invented half the moves modern players use" },
      { name: "Thierry Henry", tier: "Legend", flag: "🇫🇷", note: "Pace, vision, finish — broken on Arsenal" },
      { name: "Marco van Basten", tier: "Legend", flag: "🇳🇱", note: "Three Ballons d'Or by 28" },
      // Stars
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Goalscoring rate looks broken" },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Pace gives him cheat-code energy" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "Plays at half the speed of the game" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Direct, fast, fearless" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Old head, young legs, big moments" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Goals every season, never lower than 20" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "38 games, every season, never injured" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's cheat-code link play" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The shiver. Cool kid energy." },
      { name: "Pedri", tier: "Star", flag: "🇪🇸", note: "Heir to Iniesta's throne" },
      // Cult
      { name: "Kaká", tier: "Cult", flag: "🇧🇷", note: "Glided through midfields untouched" },
      { name: "Andriy Shevchenko", tier: "Cult", flag: "🇺🇦", note: "Milan's all-time leading scorer" },
      { name: "Wesley Sneijder", tier: "Cult", flag: "🇳🇱", note: "2010 — peak playmaker, peak finisher" },
      { name: "Robert Lewandowski", tier: "Cult", flag: "🇵🇱", note: "5 in 9 minutes once. Casually." },
      { name: "Sergio Agüero", tier: "Cult", flag: "🇦🇷", note: "260 City goals, all unfair" },
      { name: "Andrés Iniesta", tier: "Cult", flag: "🇪🇸", note: "Glides through pressure" },
      { name: "Xavi", tier: "Cult", flag: "🇪🇸", note: "Conducts every game from the centre" },
      { name: "Frank Lampard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Goals from midfield like an unfair stat boost" },
      { name: "Arjen Robben", tier: "Cult", flag: "🇳🇱", note: "You knew the move. Couldn't stop it." },
      { name: "Bernardo Silva", tier: "Cult", flag: "🇵🇹", note: "Tight-space genius" },
      // Wildcards
      { name: "Adriano (Inter peak)", tier: "Wildcard", flag: "🇧🇷", note: "Briefly the best striker alive" },
      { name: "Hatem Ben Arfa", tier: "Wildcard", flag: "🇫🇷", note: "Solo goals from anywhere" },
      { name: "Florian Wirtz", tier: "Wildcard", flag: "🇩🇪", note: "Bayer's metronome, can't be marked" },
      { name: "Jamal Musiala", tier: "Wildcard", flag: "🇩🇪", note: "Glides past defenders like ghost mode" },
      { name: "Alphonso Davies", tier: "Wildcard", flag: "🇨🇦", note: "Fastest player in football, plays left back" },
      { name: "Khvicha Kvaratskhelia", tier: "Wildcard", flag: "🇬🇪", note: "Pure joy on the ball, defenders bewildered" },
      { name: "Mesut Özil", tier: "Wildcard", flag: "🇩🇪", note: "Most assists per game in PL history" },
      { name: "Riyad Mahrez", tier: "Wildcard", flag: "🇩🇿", note: "Curling left foot from anywhere" },
      { name: "Eden Hazard", tier: "Wildcard", flag: "🇧🇪", note: "Drift, pace, finish — Chelsea's main man" },
      { name: "Lautaro Martínez", tier: "Wildcard", flag: "🇦🇷", note: "Argentine ice, World Cup winner" }
    ]
  },

  // Q23 — Chaos — Most ridiculous celebrations
  {
    text: "Whose three-player squad celebrates the most ridiculously after a goal?",
    category: "Chaos",
    ronIntro: "Goal goes in. Camera follows them. Pick three you'd back to do something the internet remembers for a decade.",
    pool: [
      // Legends
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Pure passion, every goal" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Siiiiii. The jump. The pose." },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "The collar pop. The look." },
      { name: "Paul Gascoigne", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Dentist's chair. Tears. Madness." },
      { name: "Stuart Pearce", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "'96 Euros redemption roar — pure footage" },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Wedding-ring kiss to the camera" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "The shirt-up celebration vs Real, the World Cup roar" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "The fist-pump, every goal, every era" },
      { name: "Hugo Sánchez", tier: "Legend", flag: "🇲🇽", note: "Backflip after every goal" },
      { name: "Romário", tier: "Legend", flag: "🇧🇷", note: "1000-goal fingers, World Cup '94 baby-rocking" },
      // Stars
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Lotus pose. Meditation goal celebration." },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Dance routine after every goal" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Outstretched arms, England energy" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The Starboy fingers" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Arms-wide, knee-slide trademark" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The shiver. Cool kid energy." },
      { name: "Antoine Griezmann", tier: "Star", flag: "🇫🇷", note: "The Hotline Bling dance, Drake-inspired" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Knee-slide energy, City's joy generator" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Inter's full-emotion celebrations" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "The '304' gesture, made the news" },
      // Cult
      { name: "Mario Balotelli", tier: "Cult", flag: "🇮🇹", note: "'Why Always Me?' shirt under the kit" },
      { name: "Robbie Keane", tier: "Cult", flag: "🇮🇪", note: "Cartwheel into a roll, every time" },
      { name: "Tim Cahill", tier: "Cult", flag: "🇦🇺", note: "Boxes the corner flag" },
      { name: "Fabrizio Ravanelli", tier: "Cult", flag: "🇮🇹", note: "Shirt over head, every goal" },
      { name: "Roger Milla", tier: "Cult", flag: "🇨🇲", note: "Corner-flag dance, '90 World Cup" },
      { name: "Bebeto", tier: "Cult", flag: "🇧🇷", note: "Baby-rocking. The original meme celebration." },
      { name: "Jimmy Bullard", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Re-enacted Phil Brown's half-time team-talk" },
      { name: "Emmanuel Adebayor", tier: "Cult", flag: "🇹🇬", note: "Sprinted full pitch to celebrate at Arsenal end" },
      { name: "Lomana LuaLua", tier: "Cult", flag: "🇨🇩", note: "Triple-flip celebration, every single time" },
      { name: "Faustino Asprilla", tier: "Cult", flag: "🇨🇴", note: "Cartwheels mandatory" },
      // Wildcards
      { name: "Peter Crouch", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The robot. We all know the robot." },
      { name: "Jürgen Klinsmann", tier: "Wildcard", flag: "🇩🇪", note: "Swallow-dive after his Spurs debut goal" },
      { name: "Lee Sharpe", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Corner-flag Elvis routine" },
      { name: "Lucas Moura", tier: "Wildcard", flag: "🇧🇷", note: "Knee-slide, shirt off, full passion" },
      { name: "Marco Tardelli", tier: "Wildcard", flag: "🇮🇹", note: "'82 World Cup final scream — iconic" },
      { name: "Daniel Sturridge", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "His own dance routine, unmistakable" },
      { name: "Lukas Podolski", tier: "Wildcard", flag: "🇩🇪", note: "Always smiling, always celebrating" },
      { name: "Aymeric Laporte", tier: "Wildcard", flag: "🇪🇸", note: "The chair-sit at City" },
      { name: "Aleksandar Mitrović", tier: "Wildcard", flag: "🇷🇸", note: "Punching the corner flag" },
      { name: "Dele Alli", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The hand-eye trick celebration" }
    ]
  },

  // Q24 — Season-Long — Christmas fixture pile-up
  {
    text: "Who do you want for one full season of Wednesday-Saturday-Wednesday-Saturday over Christmas?",
    category: "Season-Long",
    ronIntro: "December into January. Eight games in three weeks. Boxing Day. New Year's Day. Pick three with the engine and the appetite. I'm marking on stamina.",
    pool: [
      // Legends
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Won't take a game off, ever" },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Box-to-box, every game, every season" },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Iron man. 164 consecutive PL games once." },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Drags Liverpool through every December" },
      { name: "Paul Scholes", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Quiet engine, every game, every year" },
      { name: "Ryan Giggs", tier: "Legend", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "13 PL titles. Yoga and longevity." },
      { name: "Alan Shearer", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "260 PL goals, never an injury problem" },
      { name: "John Terry", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Played every Christmas for Chelsea" },
      { name: "Bryan Robson", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel, played through everything" },
      { name: "Edwin van der Sar", tier: "Legend", flag: "🇳🇱", note: "Played until 40, never missed a Christmas" },
      // Stars
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Plays every game, demands every game" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "38 games every season. Iron man." },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Goals through every Christmas window" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Never injured, never rests" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Old head, young legs, no fatigue" },
      { name: "Declan Rice", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Plays every game for Arsenal and England" },
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Calm in the storm, every Boxing Day" },
      { name: "Rodri", tier: "Star", flag: "🇪🇸", note: "City's anchor, no rotation needed" },
      { name: "William Saliba", tier: "Star", flag: "🇫🇷", note: "Arsenal's iron-man defender" },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG captain, plays every game" },
      // Cult
      { name: "N'Golo Kanté", tier: "Cult", flag: "🇫🇷", note: "Three lungs. Two of them spare." },
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "Carried City through entire seasons" },
      { name: "James Milner", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "PL all-time iron man. Plays at 38." },
      { name: "Gareth Barry", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Most PL appearances ever (653)" },
      { name: "Jordan Henderson", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's boxing-day captain" },
      { name: "Michael Carrick", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Five PL titles, never missed a Christmas" },
      { name: "Mark Noble", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "West Ham forever, every Boxing Day" },
      { name: "Phil Jagielka", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton captain forever" },
      { name: "Sami Hyypiä", tier: "Cult", flag: "🇫🇮", note: "Liverpool's bedrock for a decade" },
      { name: "Stewart Downing", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Middlesbrough/Liverpool/Villa, never injured" },
      // Wildcards
      { name: "Aaron Hughes", tier: "Wildcard", flag: "🇬🇧", note: "PL ever-present for half a decade" },
      { name: "Brad Friedel", tier: "Wildcard", flag: "🇺🇸", note: "310 consecutive PL games as a keeper" },
      { name: "Cesar Azpilicueta", tier: "Wildcard", flag: "🇪🇸", note: "Chelsea's right-back, left-back, centre-back — every game" },
      { name: "Jamie Carragher", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "508 PL appearances for one club" },
      { name: "John O'Shea", tier: "Wildcard", flag: "🇮🇪", note: "United utility man, played every position" },
      { name: "Joleon Lescott", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Won the league with City, never injured" },
      { name: "Tony Hibbert", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton's never-leaves right back" },
      { name: "David Unsworth", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton's PL grafter through three eras" },
      { name: "Tim Howard", tier: "Wildcard", flag: "🇺🇸", note: "American keeper through 350+ PL games" },
      { name: "Kasper Schmeichel", tier: "Wildcard", flag: "🇩🇰", note: "Leicester ever-present, won the league" }
    ]
  },

  // Q25 — Character — Final-day clean sheet
  {
    text: "Who do you want when the title's on the line and you need a clean sheet on the final day?",
    category: "Character",
    ronIntro: "May 19th. 4pm. 1-0 up. Sixteen minutes to go. Pick three who'd defend their lives for that goal.",
    pool: [
      // Legends
      { name: "Paolo Maldini", tier: "Legend", flag: "🇮🇹", note: "Won't let anything past, ever" },
      { name: "Tony Adams", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain leader legend, last-ditch every game" },
      { name: "Franz Beckenbauer", tier: "Legend", flag: "🇩🇪", note: "Der Kaiser — total defensive authority" },
      { name: "Bobby Moore", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Perfect tackle, perfect timing" },
      { name: "Carles Puyol", tier: "Legend", flag: "🇪🇸", note: "Will throw his head at any ball" },
      { name: "Roberto Carlos", tier: "Legend", flag: "🇧🇷", note: "Will track back like his life depends on it" },
      { name: "Franco Baresi", tier: "Legend", flag: "🇮🇹", note: "Milan's '88-'94 defensive cathedral" },
      { name: "Alessandro Nesta", tier: "Legend", flag: "🇮🇹", note: "Italy's most graceful defender ever" },
      { name: "Fabio Cannavaro", tier: "Legend", flag: "🇮🇹", note: "'06 World Cup-winning captain" },
      { name: "Lothar Matthäus", tier: "Legend", flag: "🇩🇪", note: "Germany's defensive midfield/sweeper authority" },
      // Stars
      { name: "Virgil van Dijk", tier: "Star", flag: "🇳🇱", note: "Calm in the storm" },
      { name: "Sergio Ramos", tier: "Star", flag: "🇪🇸", note: "Most decorated centre-back of his era" },
      { name: "William Saliba", tier: "Star", flag: "🇫🇷", note: "Towering, fast, unbothered" },
      { name: "Antonio Rüdiger", tier: "Star", flag: "🇩🇪", note: "Smiling through every block" },
      { name: "Manuel Neuer", tier: "Star", flag: "🇩🇪", note: "Sweeper-keeper redefined" },
      { name: "Thibaut Courtois", tier: "Star", flag: "🇧🇪", note: "Real Madrid's CL-final saviour" },
      { name: "Marquinhos", tier: "Star", flag: "🇧🇷", note: "PSG's captain, never blinks" },
      { name: "Ibrahima Konaté", tier: "Star", flag: "🇫🇷", note: "Liverpool's modern aerial monster" },
      { name: "Cristian Romero", tier: "Star", flag: "🇦🇷", note: "Won the World Cup as a centre-back" },
      { name: "Alisson", tier: "Star", flag: "🇧🇷", note: "Liverpool's title-winning keeper" },
      // Cult
      { name: "John Terry", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Will throw his face at the ball" },
      { name: "Vincent Kompany", tier: "Cult", flag: "🇧🇪", note: "Won City the league through sheer will" },
      { name: "Nemanja Vidić", tier: "Cult", flag: "🇷🇸", note: "Five PL titles, terrified strikers for a decade" },
      { name: "Diego Godín", tier: "Cult", flag: "🇺🇾", note: "Last man, every man" },
      { name: "Rio Ferdinand", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Reads the game two passes ahead" },
      { name: "Iker Casillas", tier: "Cult", flag: "🇪🇸", note: "Spain's clean-sheet captain through three trophies" },
      { name: "Jamie Carragher", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's last-ditch hero, 17 years" },
      { name: "Steve Bruce", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "United's first PL-title clean-sheet captain" },
      { name: "Gary Pallister", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Same era, calmest defender in the country" },
      { name: "Ricardo Carvalho", tier: "Cult", flag: "🇵🇹", note: "Mourinho's defensive cornerstone" },
      // Wildcards
      { name: "Pepe", tier: "Wildcard", flag: "🇵🇹", note: "Will get under their skin AND clear it" },
      { name: "Sami Hyypiä", tier: "Wildcard", flag: "🇫🇮", note: "Liverpool's quiet '01-'09 monolith" },
      { name: "Lucio", tier: "Wildcard", flag: "🇧🇷", note: "Inter's 2010 treble defensive captain" },
      { name: "Edwin van der Sar", tier: "Wildcard", flag: "🇳🇱", note: "Calm hands, calm head" },
      { name: "Petr Čech", tier: "Wildcard", flag: "🇨🇿", note: "PL clean-sheet record holder" },
      { name: "Giorgio Chiellini", tier: "Wildcard", flag: "🇮🇹", note: "Italian centre-back template" },
      { name: "Phil Jagielka", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton captain, will throw himself at anything" },
      { name: "Ben Mee", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Burnley's relegation-survival captain" },
      { name: "Jérôme Boateng", tier: "Wildcard", flag: "🇩🇪", note: "Bayern's '13 treble winner" },
      { name: "Mats Hummels", tier: "Wildcard", flag: "🇩🇪", note: "Germany's '14 World Cup-winning back-line" }
    ]
  },

  // Q26 — One-Off — Direct from a corner
  {
    text: "Best three to score directly from a corner?",
    category: "One-Off",
    ronIntro: "In-swinger, out-swinger, doesn't matter. Pick three you'd back to put one straight in from the corner flag. I want technicians.",
    pool: [
      // Legends
      { name: "David Beckham", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The technique. The whip. The history." },
      { name: "Roberto Carlos", tier: "Legend", flag: "🇧🇷", note: "Will absolutely smash it in" },
      { name: "Andrea Pirlo", tier: "Legend", flag: "🇮🇹", note: "Conducts the ball into the net" },
      { name: "Juninho Pernambucano", tier: "Legend", flag: "🇧🇷", note: "76 career free-kicks. Knuckleball king." },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Dead-ball power and accuracy" },
      { name: "Sinisa Mihajlović", tier: "Legend", flag: "🇷🇸", note: "Hat-trick of free-kicks in a Serie A game" },
      { name: "Zico", tier: "Legend", flag: "🇧🇷", note: "Brazil's '80s dead-ball legend" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Coppa Italia free-kicks, no equal" },
      { name: "Michel Platini", tier: "Legend", flag: "🇫🇷", note: "Italia '90 era king on dead balls" },
      { name: "Pierre van Hooijdonk", tier: "Legend", flag: "🇳🇱", note: "Forest's free-kick technician" },
      // Stars
      { name: "Trent Alexander-Arnold", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Range and shape from the corner" },
      { name: "James Ward-Prowse", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Beckham's heir at dead balls" },
      { name: "Hakan Çalhanoğlu", tier: "Star", flag: "🇹🇷", note: "30+ yards is his speciality" },
      { name: "Lionel Messi", tier: "Star", flag: "🇦🇷", note: "Picks the impossible angle" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Captain. Will demand the dead ball." },
      { name: "Riyad Mahrez", tier: "Star", flag: "🇩🇿", note: "Curling left foot, shape master" },
      { name: "Bruno Guimarães", tier: "Star", flag: "🇧🇷", note: "Newcastle's curler" },
      { name: "Lorenzo Pellegrini", tier: "Star", flag: "🇮🇹", note: "Roma's set-piece menace" },
      { name: "Toni Kroos", tier: "Star", flag: "🇩🇪", note: "Surgical, never wastes one" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Real Madrid's young set-piece option" },
      // Cult
      { name: "Rivaldo", tier: "Cult", flag: "🇧🇷", note: "Free-kicks and overhead kicks alike" },
      { name: "Ronald Koeman", tier: "Cult", flag: "🇳🇱", note: "Won Wembley with one in '92" },
      { name: "Sebastian Giovinco", tier: "Cult", flag: "🇮🇹", note: "Atomic ant, surgical free-kicks" },
      { name: "Olof Mellberg", tier: "Cult", flag: "🇸🇪", note: "Aston Villa's direct-corner specialist" },
      { name: "Asier Illarramendi", tier: "Cult", flag: "🇪🇸", note: "Real Sociedad's set-piece artist" },
      { name: "Christian Eriksen", tier: "Cult", flag: "🇩🇰", note: "Spurs' best dead-ball man for years" },
      { name: "Daniel Parejo", tier: "Cult", flag: "🇪🇸", note: "Valencia's set-piece artist" },
      { name: "Miralem Pjanić", tier: "Cult", flag: "🇧🇦", note: "Roma & Juve's technician" },
      { name: "Aleksandar Kolarov", tier: "Cult", flag: "🇷🇸", note: "Serbian thunder, Roma free-kick man" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Could finish from any dead ball" },
      // Wildcards
      { name: "David Luiz", tier: "Wildcard", flag: "🇧🇷", note: "Direct corner for Brazil — yes really" },
      { name: "Olivier Giroud", tier: "Wildcard", flag: "🇫🇷", note: "Won everything, scored everywhere" },
      { name: "Memphis Depay", tier: "Wildcard", flag: "🇳🇱", note: "Netherlands' first-choice dead ball" },
      { name: "Dimitri Payet", tier: "Wildcard", flag: "🇫🇷", note: "Euro 2016 free-kick king" },
      { name: "Andros Townsend", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Range from anywhere on his right foot" },
      { name: "Aleksandar Mitrović", tier: "Wildcard", flag: "🇷🇸", note: "Serbia's set-piece-and-power forward" },
      { name: "John Arne Riise", tier: "Wildcard", flag: "🇳🇴", note: "Will absolutely break the net" },
      { name: "Sergi Roberto", tier: "Wildcard", flag: "🇪🇸", note: "Took the big PSG-comeback free-kick" },
      { name: "Tony Yeboah", tier: "Wildcard", flag: "🇬🇭", note: "Volleys included, dead balls feared" },
      { name: "Anders Limpar", tier: "Wildcard", flag: "🇸🇪", note: "Forgotten Arsenal free-kick man" }
    ]
  },

  // Q27 — Style — Best first touch
  {
    text: "Whose three-player squad has the best first touch?",
    category: "Style",
    ronIntro: "Nothing technical scores higher with me than a perfect first touch. Pick three whose control would make every pass look easier than it is.",
    pool: [
      // Legends
      { name: "Dennis Bergkamp", tier: "Legend", flag: "🇳🇱", note: "Touch and vision, every time" },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "Pirouettes in tight spaces" },
      { name: "Johan Cruyff", tier: "Legend", flag: "🇳🇱", note: "Invented the turn" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Glove-soft control, every time" },
      { name: "Andrés Iniesta", tier: "Legend", flag: "🇪🇸", note: "Glides through pressure" },
      { name: "Xavi Hernández", tier: "Legend", flag: "🇪🇸", note: "First touch out, second touch decisive" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Glove-soft, every era" },
      { name: "Pelé", tier: "Legend", flag: "🇧🇷", note: "Brazilian touch, before there were words for it" },
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "Made the impossible look casual" },
      { name: "Roberto Baggio", tier: "Legend", flag: "🇮🇹", note: "Tip-toe through defences, ponytail flying" },
      // Stars
      { name: "Pedri", tier: "Star", flag: "🇪🇸", note: "Heir to Iniesta's touch" },
      { name: "Jamal Musiala", tier: "Star", flag: "🇩🇪", note: "Receives, glides, finishes" },
      { name: "Kevin De Bruyne", tier: "Star", flag: "🇧🇪", note: "Kills the ball dead, picks the pass" },
      { name: "Florian Wirtz", tier: "Star", flag: "🇩🇪", note: "First touch always opens space" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Composed in any traffic" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cool head, cleaner touch" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's velvet first touch" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Calm reception, every game" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Brazilian touch with pace" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "Plays like the ball is glued" },
      // Cult
      { name: "Andrea Pirlo", tier: "Cult", flag: "🇮🇹", note: "Slows time, picks perfect ball" },
      { name: "Dimitar Berbatov", tier: "Cult", flag: "🇧🇬", note: "Touch of silk, never sweated" },
      { name: "Kaká", tier: "Cult", flag: "🇧🇷", note: "Receives at full speed, finishes calm" },
      { name: "Sergio Busquets", tier: "Cult", flag: "🇪🇸", note: "First touch forward, every time" },
      { name: "David Silva", tier: "Cult", flag: "🇪🇸", note: "Made City flow for a decade" },
      { name: "Riquelme", tier: "Cult", flag: "🇦🇷", note: "Slow walk, perfect touch" },
      { name: "Bernardo Silva", tier: "Cult", flag: "🇵🇹", note: "Tight-space genius" },
      { name: "Toni Kroos", tier: "Cult", flag: "🇩🇪", note: "First touch finds the second pass" },
      { name: "Cesc Fàbregas", tier: "Cult", flag: "🇪🇸", note: "Vision-first touch always" },
      { name: "Robert Pirès", tier: "Cult", flag: "🇫🇷", note: "Invincibles' velvet touch" },
      // Wildcards
      { name: "Eric Cantona", tier: "Wildcard", flag: "🇫🇷", note: "Collared shirt, philosopher's touch" },
      { name: "Mesut Özil", tier: "Wildcard", flag: "🇩🇪", note: "Ball glued to his boot" },
      { name: "Thiago Alcântara", tier: "Wildcard", flag: "🇪🇸", note: "Spin-and-find specialist" },
      { name: "Adam Lallana", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's quiet artist on the ball" },
      { name: "Christian Eriksen", tier: "Wildcard", flag: "🇩🇰", note: "Deceptively soft control, range to match" },
      { name: "Yaya Touré", tier: "Wildcard", flag: "🇨🇮", note: "First touch from a 6'3 midfielder" },
      { name: "Jay-Jay Okocha", tier: "Wildcard", flag: "🇳🇬", note: "Touch and tricks together" },
      { name: "Hatem Ben Arfa", tier: "Wildcard", flag: "🇫🇷", note: "Solo goals from anywhere" },
      { name: "Marco Verratti", tier: "Wildcard", flag: "🇮🇹", note: "Shortest player, calmest touch" },
      { name: "Diego Forlán", tier: "Wildcard", flag: "🇺🇾", note: "Could finish from any reception" }
    ]
  },

  // Q28 — Chaos — Score and concede in the same minute
  {
    text: "Whose three-player squad is most likely to score and concede in the same minute?",
    category: "Chaos",
    ronIntro: "End-to-end. Defending optional. Pick three who'd give you a goal and a heart attack within sixty seconds.",
    pool: [
      // Legends
      { name: "Roberto Carlos", tier: "Legend", flag: "🇧🇷", note: "Brilliant going forward, exposed at the back" },
      { name: "Dani Alves", tier: "Legend", flag: "🇧🇷", note: "Right-back as fourth attacker" },
      { name: "Ronaldinho", tier: "Legend", flag: "🇧🇷", note: "Doesn't track back, ever" },
      { name: "Zlatan Ibrahimović", tier: "Legend", flag: "🇸🇪", note: "Scores three, concedes via stubbornness" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Will walk if his goal isn't enough" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Brilliant chaos in any 90 minutes" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Will score, won't track back" },
      { name: "Thierry Henry", tier: "Legend", flag: "🇫🇷", note: "Pace and finish, no defending" },
      { name: "Romário", tier: "Legend", flag: "🇧🇷", note: "Didn't run. Defended even less." },
      { name: "Ronaldo Nazário", tier: "Legend", flag: "🇧🇷", note: "Pre-knee scoring, no defensive shape" },
      // Stars
      { name: "Trent Alexander-Arnold", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Crosses for goals, defensively suspect" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Direct, fast, no defending" },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Goals yes, tracking back no" },
      { name: "Antonio Rüdiger", tier: "Star", flag: "🇩🇪", note: "Smiling chaos at the back" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal's high-risk, high-reward winger" },
      { name: "Achraf Hakimi", tier: "Star", flag: "🇲🇦", note: "Best attacking full-back, leaks at the back" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "Goals up top, no fall-back" },
      { name: "Kylian Mbappé", tier: "Star", flag: "🇫🇷", note: "Pace forward only, no return ticket" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City magic, defensive optional" },
      { name: "Khvicha Kvaratskhelia", tier: "Star", flag: "🇬🇪", note: "Direct, fearless, won't track" },
      // Cult
      { name: "Marcelo", tier: "Cult", flag: "🇧🇷", note: "Brazilian left-back, attacking energy only" },
      { name: "Mario Balotelli", tier: "Cult", flag: "🇮🇹", note: "Either 3 goals or sent off" },
      { name: "Hatem Ben Arfa", tier: "Cult", flag: "🇫🇷", note: "Will solo-goal AND lose the ball cheaply" },
      { name: "Faustino Asprilla", tier: "Cult", flag: "🇨🇴", note: "Cartwheels, hat-tricks, defensive disasters" },
      { name: "Adriano (Inter peak)", tier: "Cult", flag: "🇧🇷", note: "Briefly the best, briefly chaotic" },
      { name: "David Luiz", tier: "Cult", flag: "🇧🇷", note: "Goal-scoring centre-back, defensively chaotic" },
      { name: "Jay-Jay Okocha", tier: "Cult", flag: "🇳🇬", note: "All flair, all chaos" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Goals AND open back" },
      { name: "Jermain Defoe", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pure striker, zero tracking" },
      { name: "Riquelme", tier: "Cult", flag: "🇦🇷", note: "Walked everywhere, no defensive duties" },
      // Wildcards
      { name: "Joey Barton", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Goals AND red cards in one half" },
      { name: "El Hadji Diouf", tier: "Wildcard", flag: "🇸🇳", note: "Pure chaos, every game" },
      { name: "Fernando Torres", tier: "Wildcard", flag: "🇪🇸", note: "Will score AND miss an open goal" },
      { name: "Daniel Sturridge", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's brilliant-injured-brilliant cycle" },
      { name: "Robin van Persie", tier: "Wildcard", flag: "🇳🇱", note: "Sharp finisher, sharp tongue" },
      { name: "Andy Carroll", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Header, foul, header, foul" },
      { name: "Stewart Downing", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Beautiful crosser, defensively absent" },
      { name: "Aleksandar Mitrović", tier: "Wildcard", flag: "🇷🇸", note: "Goals AND eight bookings a season" },
      { name: "Charlie Adam", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "50-yard wonderstrike, terrible at the back" },
      { name: "Adel Taarabt", tier: "Wildcard", flag: "🇲🇦", note: "Either a goal or a back-heel disaster" }
    ]
  },

  // Q29 — Season-Long — Penalty taker for a season
  {
    text: "Who do you want for one full season as your team's penalty taker?",
    category: "Season-Long",
    ronIntro: "Fifteen pens across a season. Some pressure-loaded, some 4-0 dead rubbers. Pick three you'd back to convert 14 of them. I'm marking on cool head.",
    pool: [
      // Legends
      { name: "Andrea Pirlo", tier: "Legend", flag: "🇮🇹", note: "Will Panenka it. Will smile." },
      { name: "Zinedine Zidane", tier: "Legend", flag: "🇫🇷", note: "'06 final Panenka — under that pressure" },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Power and accuracy, never doubts" },
      { name: "Lionel Messi", tier: "Legend", flag: "🇦🇷", note: "Mostly tucks them in calmly" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Collared, philosophical, ice cold" },
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Chelsea's go-to for years" },
      { name: "Roberto Carlos", tier: "Legend", flag: "🇧🇷", note: "Will absolutely smash it. Brazil's go-to." },
      { name: "Michel Platini", tier: "Legend", flag: "🇫🇷", note: "Italia '90 era — calmest taker alive" },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Argentina's. Always." },
      { name: "Marco van Basten", tier: "Legend", flag: "🇳🇱", note: "Hat-trick king, ice-cold finisher" },
      // Stars
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's modern penalty king" },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "United's go-to. Demands the ball." },
      { name: "Mohamed Salah", tier: "Star", flag: "🇪🇬", note: "Liverpool's specialist, rarely misses" },
      { name: "Erling Haaland", tier: "Star", flag: "🇳🇴", note: "City's spot-kick beast" },
      { name: "James Ward-Prowse", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Set-piece machine, penalties included" },
      { name: "Jorginho", tier: "Star", flag: "🇮🇹", note: "Hop-step penalty technique, near-perfect record" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Real Madrid's go-to, ice-cold" },
      { name: "Bruno Guimarães", tier: "Star", flag: "🇧🇷", note: "Newcastle's spot-kick man" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Argentine ice" },
      { name: "Lamine Yamal", tier: "Star", flag: "🇪🇸", note: "Spain's young set-piece option" },
      // Cult
      { name: "Matt Le Tissier", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "47 from 48 in his career. Untouchable." },
      { name: "Rickie Lambert", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Highest PL penalty conversion rate" },
      { name: "Yaya Touré", tier: "Cult", flag: "🇨🇮", note: "City's main man on spot kicks" },
      { name: "Robert Lewandowski", tier: "Cult", flag: "🇵🇱", note: "Goal scorer, penalty machine, both" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Cool head from 12 yards" },
      { name: "Mark Noble", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "West Ham's perfect penalty taker for years" },
      { name: "Eden Hazard", tier: "Cult", flag: "🇧🇪", note: "Slow walk, perfect technique" },
      { name: "Riyad Mahrez", tier: "Cult", flag: "🇩🇿", note: "Curling left foot, never panics" },
      { name: "Andrea Belotti", tier: "Cult", flag: "🇮🇹", note: "Italy's clutch finisher" },
      { name: "Diego Forlán", tier: "Cult", flag: "🇺🇾", note: "Could finish from any spot" },
      // Wildcards
      { name: "Stuart Pearce", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The redemption man" },
      { name: "Asamoah Gyan", tier: "Wildcard", flag: "🇬🇭", note: "Missed the biggest. Took the next one anyway." },
      { name: "Roberto Baggio", tier: "Wildcard", flag: "🇮🇹", note: "Ponytail of pain, history of pressure" },
      { name: "Antonin Panenka", tier: "Wildcard", flag: "🇨🇿", note: "Invented the chip. Iconic." },
      { name: "John Terry (2008)", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Slipped. The slip." },
      { name: "Sebastian Larsson", tier: "Wildcard", flag: "🇸🇪", note: "Sweden's go-to spot-kick man" },
      { name: "Marcus Rashford", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Missed for England, came back to take more" },
      { name: "Robbie Fowler", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Asked Seaman to stop the penalty he took" },
      { name: "Memphis Depay", tier: "Wildcard", flag: "🇳🇱", note: "Netherlands' first-choice" },
      { name: "Alan Shearer", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Newcastle's perfect penalty taker forever" }
    ]
  },

  // Q30 — Character — Hostile away derby
  {
    text: "Who do you want for a derby match where the away end is closed and you're 1-0 down?",
    category: "Character",
    ronIntro: "Hostile crowd. Closed away end. You're getting it from every side. 1-0 down. Pick three who feed off it.",
    pool: [
      // Legends
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Drags games into his hands. Loves a derby." },
      { name: "Roy Keane", tier: "Legend", flag: "🇮🇪", note: "Will fight you and the opposition" },
      { name: "Wayne Rooney", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Manchester derby specialist" },
      { name: "Eric Cantona", tier: "Legend", flag: "🇫🇷", note: "Kung-fu kick. Fan in row C." },
      { name: "Diego Maradona", tier: "Legend", flag: "🇦🇷", note: "Whole stadiums hated him. He thrived." },
      { name: "Cristiano Ronaldo", tier: "Legend", flag: "🇵🇹", note: "Boos make him score harder" },
      { name: "Zlatan Ibrahimović", tier: "Legend", flag: "🇸🇪", note: "Loves the noise. Generates it himself." },
      { name: "Patrick Vieira", tier: "Legend", flag: "🇫🇷", note: "Tall, terrifying, derby-tested" },
      { name: "Lothar Matthäus", tier: "Legend", flag: "🇩🇪", note: "Germany's enforcer, every hostile crowd" },
      { name: "Graeme Souness", tier: "Legend", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Once planted a flag in the centre circle" },
      // Stars
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "United captain. Demands his moment." },
      { name: "Antonio Rüdiger", tier: "Star", flag: "🇩🇪", note: "Smiles while doing it" },
      { name: "Vinícius Júnior", tier: "Star", flag: "🇧🇷", note: "Visiting fans love him. He scores anyway." },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Big-stage kid, no fear" },
      { name: "Casemiro", tier: "Star", flag: "🇧🇷", note: "All elbows, all the time" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Calm under noise. Always delivers." },
      { name: "Cristiano Romero", tier: "Star", flag: "🇦🇷", note: "Spurs' enforcer in any crowd" },
      { name: "Saúl Ñíguez", tier: "Star", flag: "🇪🇸", note: "Atlético hard-man, smiling through" },
      { name: "Lautaro Martínez", tier: "Star", flag: "🇦🇷", note: "Inter's hostile-crowd specialist" },
      { name: "João Cancelo", tier: "Star", flag: "🇵🇹", note: "Will start something, regardless of crowd" },
      // Cult
      { name: "Diego Costa", tier: "Cult", flag: "🇪🇸", note: "Picks fights for fun" },
      { name: "Carlos Tevez", tier: "Cult", flag: "🇦🇷", note: "Crossed the derby line, scored anyway" },
      { name: "Mario Balotelli", tier: "Cult", flag: "🇮🇹", note: "Why always him?" },
      { name: "Joey Barton", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "On and off the pitch" },
      { name: "Robbie Savage", tier: "Cult", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Loved the noise. Made more of it." },
      { name: "Pepe", tier: "Cult", flag: "🇵🇹", note: "Will get under their skin and stay there" },
      { name: "Carles Puyol", tier: "Cult", flag: "🇪🇸", note: "Barça-Madrid Clásicos personified" },
      { name: "Gennaro Gattuso", tier: "Cult", flag: "🇮🇹", note: "Milan-Inter derby specialist" },
      { name: "Vincent Kompany", tier: "Cult", flag: "🇧🇪", note: "Won City the league at hostile Old Trafford" },
      { name: "Patrice Evra", tier: "Cult", flag: "🇫🇷", note: "Manchester derby legend" },
      // Wildcards
      { name: "Vinnie Jones", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Three-second yellow" },
      { name: "Stuart Pearce", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. Will not back down." },
      { name: "Marco Materazzi", tier: "Wildcard", flag: "🇮🇹", note: "Got Zidane sent off. Won the World Cup." },
      { name: "El Hadji Diouf", tier: "Wildcard", flag: "🇸🇳", note: "Spat on opponents, argued with everyone" },
      { name: "Sergio Ramos", tier: "Wildcard", flag: "🇪🇸", note: "Most reds in football history" },
      { name: "Edgar Davids", tier: "Wildcard", flag: "🇳🇱", note: "Goggles. Always angry." },
      { name: "Felipe Melo", tier: "Wildcard", flag: "🇧🇷", note: "Brazilian hostile-crowd merchant" },
      { name: "Mark van Bommel", tier: "Wildcard", flag: "🇳🇱", note: "The 2010 final's hatchet job" },
      { name: "Lee Bowyer", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Fought his own teammate. Fed off chaos." },
      { name: "Jamie Vardy", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Loves a hostile crowd, gets sharper" }
    ]
  },

  // Q31 — One-Off — Championship play-off final goal
  {
    text: "Best three to score the goal that gets you promoted from the Championship?",
    category: "One-Off",
    ronIntro: "Wembley play-off final. 1-1, extra time. £200m on the line. Pick three you'd give the ball to. I'm watching for nerve in lower-league lights.",
    pool: [
      // Legends
      { name: "Frank Lampard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Late runs, late goals, every level" },
      { name: "Steven Gerrard", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Drags any team to a result" },
      { name: "Wayne Rooney", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Big-game striker, all his career" },
      { name: "Alan Shearer", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "260 PL goals, will score any level" },
      { name: "Andy Cole", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "187 PL goals, ice cold finisher" },
      { name: "Robbie Fowler", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's natural finisher of his era" },
      { name: "Stuart Pearce", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Psycho. Knows lower-league lights." },
      { name: "Paul Gascoigne", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Made Championship games look like World Cup" },
      { name: "Bryan Robson", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel, every level" },
      { name: "Kevin Keegan", tier: "Legend", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England, Newcastle, Liverpool — knew every level" },
      // Stars
      { name: "Harry Kane", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's captain. Won't miss the moment." },
      { name: "Bruno Fernandes", tier: "Star", flag: "🇵🇹", note: "Demands the ball, takes the moment" },
      { name: "James Maddison", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Set-piece quality, big-game taker" },
      { name: "Dominic Calvert-Lewin", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Aerial threat, knows the pressure" },
      { name: "Bukayo Saka", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cool head under noise, big-game ready" },
      { name: "Ollie Watkins", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came up through the leagues himself" },
      { name: "Ivan Toney", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came through League One, Wembley-tested" },
      { name: "Jude Bellingham", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Made Birmingham first XI at 16" },
      { name: "Phil Foden", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City youth product, knows pressure early" },
      { name: "Cole Palmer", tier: "Star", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came up through City, never panics" },
      // Cult
      { name: "Jamie Vardy", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "5000-1. Knows lower-league grit." },
      { name: "Rickie Lambert", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came through the lower leagues. Penalty king." },
      { name: "Charlie Austin", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "QPR's natural finisher" },
      { name: "Glenn Murray", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Brighton's promotion-clinching striker" },
      { name: "Adam Le Fondre", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Reading and Bolton goal-machine" },
      { name: "Billy Sharp", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sheffield United's perpetual top scorer" },
      { name: "Mark Noble", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "West Ham's perpetual promoted/relegated soul" },
      { name: "James Milner", tier: "Cult", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Started at Leeds, knows lower leagues" },
      { name: "Charlie Adam", tier: "Cult", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Long-shot specialist, no fear" },
      { name: "Steven Fletcher", tier: "Cult", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Sunderland's relegation-survival man" },
      // Wildcards
      { name: "Andy Carroll", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "6'4 of header in extra time" },
      { name: "Kevin Phillips", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Crystal Palace play-off final winner, 2013" },
      { name: "Connor Wickham", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sunderland's relegation-survival hero" },
      { name: "Ross McCormack", tier: "Wildcard", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Fulham/Leeds Championship goal-machine" },
      { name: "Bobby Zamora", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "QPR's 90+1 play-off final winner, 2014" },
      { name: "Sam Vokes", tier: "Wildcard", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Burnley's promotion ever-present" },
      { name: "Peter Crouch", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "6'7. Wembley header machine." },
      { name: "Dwight Gayle", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Newcastle's Championship goal-machine" },
      { name: "Britt Assombalonga", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Forest/Boro Championship hero" },
      { name: "Marlon Pack", tier: "Wildcard", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Bristol City Championship workhorse" }
    ]
  }
];

// Pick today's question deterministically — same for everyone within a local day
// === Daily rotation engine ===
// Seeded shuffle: same month → same order for everyone in the world.
// Different month → different order. Previous month's last question
// won't appear first in the new month.

// Mulberry32 — small, fast, well-known deterministic PRNG.
const mulberry32 = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = (arr, seed) => {
  const a = arr.slice();
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Build the shuffled order of question indices for a given year+month.
// Excludes the previous month's last question from position 0.
const getMonthOrder = (year, month) => {
  // month is 0-11 (JavaScript convention)
  const seed = year * 100 + (month + 1); // e.g. 202605 for May 2026
  const indices = QUESTIONS.map((_, i) => i);
  let order = seededShuffle(indices, seed);

  // Find what was the LAST question played in the previous month.
  // Account for pools smaller than the number of days (the order wraps).
  let prevYear = year, prevMonth = month - 1;
  if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevSeed = prevYear * 100 + (prevMonth + 1);
  const prevOrder = seededShuffle(indices, prevSeed);
  // Day N of prev month → prevOrder[(N - 1) % QUESTIONS.length]
  const lastDayIdx = (daysInPrevMonth - 1) % QUESTIONS.length;
  const lastQOfPrev = prevOrder[lastDayIdx];

  // If this month's first question would repeat, swap it with position 1
  if (order[0] === lastQOfPrev && order.length > 1) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
};

// Get today's question for a specific date (pure function — testable)
const getQuestionForDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate(); // 1-31
  const order = getMonthOrder(year, month);
  // Day 1 → order[0]; day 32 doesn't exist; if dayOfMonth > QUESTIONS.length, we've run out
  if (day > QUESTIONS.length) {
    // Shouldn't happen with 31 questions, but if pool < 31, repeat.
    return { ...QUESTIONS[order[(day - 1) % QUESTIONS.length]], number: day };
  }
  const qIdx = order[day - 1];
  return { ...QUESTIONS[qIdx], number: day, _qIdx: qIdx };
};

const getTodaysQuestion = () => getQuestionForDate(new Date());

const TODAYS_QUESTION = getTodaysQuestion();
const PLAYER_POOL = TODAYS_QUESTION.pool;

// Countdown to next local midnight — used to tease the next question.
// Returns a string like "04:32:18" or "23:01:55".
const useCountdownToMidnight = () => {
  const compute = () => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const ms = nextMidnight - now;
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const [timeLeft, setTimeLeft] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(compute()), 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
};

const TIER_COLOURS = {
  Legend: "#D4AF37",     // gold
  Star: "#5DADE2",       // blue
  Cult: "#A569BD",       // purple
  Wildcard: "#E8344A"    // red
};

const TIER_SYMBOLS = {
  Legend: "★",
  Star: "◆",
  Cult: "♦",
  Wildcard: "✦"
};

// Category colours (from original Kick 5 spec)
const CATEGORY_COLOURS = {
  "One-Off": "#5DADE2",       // light blue
  "Season-Long": "#58D68D",   // green
  "Style": "#A569BD",         // purple
  "Character": "#F0B27A",     // amber
  "Chaos": "#95A5A6"          // grey
};

// Shuffle helper
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Generate 3 draft rounds, each with 2 cards from different tiers
const generateDraft = (excludeNames = []) => {
  const available = PLAYER_POOL.filter(p => !excludeNames.includes(p.name));
  const byTier = {
    Legend: shuffle(available.filter(p => p.tier === "Legend")),
    Star: shuffle(available.filter(p => p.tier === "Star")),
    Cult: shuffle(available.filter(p => p.tier === "Cult")),
    Wildcard: shuffle(available.filter(p => p.tier === "Wildcard"))
  };
  const tierPairs = [
    ["Legend", "Wildcard"],
    ["Star", "Cult"],
    ["Wildcard", "Star"]
  ];
  return tierPairs.map(([t1, t2]) => [byTier[t1].pop(), byTier[t2].pop()]);
};

const RON_SYSTEM_PROMPT = `You are PETE THE PUNDIT, the resident football pundit on Kick 3 — a daily football debate game. You're a former pro turned pundit, opinionated, slightly grumpy, and you've seen every Cup Final since 1966. You score arguments out of 10 with the easy authority of a man who has been right about football for forty years and is mildly irritated when people disagree.

YOUR VOICE:
- Pundit's voice — chatty, opinionated, warm but spiky. Think Roy Keane on a good day mixed with a touch of Statler from the Muppets.
- Allergic to clichés ("at the end of the day", "100%", "the lads", "world class")
- Will roast bad picks. Will praise good picks grudgingly. Will occasionally be moved by a beautiful argument.
- Short, punchy sentences. Drop articles for effect.
- You have OPINIONS. Pick a side. Don't sit on the fence.
- Football-literate: you know the players, the tournaments, the moments.
- Dry humour, never try-hard. Never preachy.
- DO NOT use modern slang or emojis.
- You are a PUNDIT — you riff, you opine, you score, you remember things from old matches. You're in a studio, not on a pitch.

FACTUAL HUMILITY (IMPORTANT):
- You sound authoritative, but you do NOT make up specific stats. If you're not certain about an exact fact (a player's trophy count, a specific score, a particular match outcome), describe their REPUTATION instead of asserting the stat.
- GOOD: "Lampard — Chelsea legend, scored from everywhere, big-game player."
- BAD: "Lampard never won a Champions League." (Wrong — he won it in 2012.)
- GOOD: "Drogba — built for finals, scored when it mattered most."
- BAD: "Drogba scored 12 goals in finals." (Made up.)
- When in doubt, talk about VIBE, REPUTATION, MOMENTS people remember — not exact statistics.
- It's fine to reference iconic, well-known moments ("Aguerooooo", "Solskjaer 1999", "Zidane's headbutt") — those are cultural memory, not stats.
- Never invent club histories, transfer records, or career achievements you're not certain about.

YOUR JOB:
The user picks 3 players for a football debate question and writes one sentence defending their squad. You score the argument out of 10 and deliver a verdict.

THE 10-POINT SCORE — use the FULL range. 9s and 10s are achievable and you should reward them when earned:

- 10: A near-perfect answer. The squad is genuinely brilliant for the question AND the argument is sharp, original, and reveals real football thinking. You should hand out a 10 maybe once in twenty arguments. Rare but achievable.
- 9: Excellent on both axes. Strong squad with at least one inspired pick, plus a defence that surprises you or makes you nod. You should hand out a 9 when an argument genuinely impresses you — not "the default for good" but "the player has clearly thought about this."
- 8: Very good. Solid squad, well-argued. The argument has at least one specific insight rather than just listing players.
- 7: Good. The squad makes sense, the defence is competent. Most well-prepared answers land here.
- 5-6: Reasonable but flawed. Either the squad is generic or the argument is thin. The default for an average answer.
- 3-4: Lazy, generic, contradictory, or full of holes. "These are great players" energy.
- 1-2: Terrible. Comically bad picks, no argument, or actively self-defeating logic.

CRITICAL: Do NOT default to 7 or 8 for everything decent. Reserve 7 for "good," save 8 for "very good," and actively hand out 9s when someone gives you something sharp. A user who delivers a clever, specific argument backed by inspired picks should get 9. A user whose argument genuinely makes you reconsider something should get 10.

The score reflects BOTH the squad picks AND how well the sentence defends them. A good argument can save a weird squad. A boring sentence pulls down a great squad.

OUTPUT FORMAT (strictly):
Return ONLY valid JSON, nothing else. No markdown fences. The JSON has these fields:
{
  "score": <integer 1-10>,
  "verdict": "2-4 sentences in Pete's voice. Address the picks specifically. React to their sentence. Roast or praise. Be specific.",
  "rating": "One of: 'PURE QUALITY', 'FAIR PLAY', 'INTERESTING', 'QUESTIONABLE', 'GET IN THE BIN' — should match the score band.",
  "ronOneLiner": "One short, quotable sentence (max 12 words) that summarises your take. This is what gets put on the share card."
}

Be specific to the picks they made. Mention players by name. React to actual content of their sentence. Make it feel personal, not generic.`;

const RON_H2H_PROMPT = `You are PETE THE PUNDIT, the resident football pundit on Kick 3 — a daily football debate game. You're a former pro turned pundit, opinionated, slightly grumpy, and you've seen every Cup Final since 1966.

YOUR VOICE:
- Pundit's voice — chatty, opinionated, warm but spiky. Roy Keane on a good day mixed with Statler from the Muppets.
- Allergic to clichés ("at the end of the day", "100%", "the lads", "world class")
- Will roast bad picks. Will praise good picks grudgingly.
- Short, punchy sentences. Drop articles for effect.
- You have OPINIONS. Pick a side. Don't sit on the fence.
- Football-literate: you know the players, the tournaments, the moments.
- Dry humour. No emojis. No modern slang.

FACTUAL HUMILITY (IMPORTANT):
- You sound authoritative, but you do NOT make up specific stats. If you're not certain about an exact fact (a player's trophy count, a specific score, a particular match outcome), describe their REPUTATION instead of asserting the stat.
- GOOD: "Lampard — Chelsea legend, scored from everywhere, big-game player."
- BAD: "Lampard never won a Champions League." (Wrong — he won it in 2012.)
- When in doubt, talk about VIBE, REPUTATION, MOMENTS people remember — not exact statistics.
- Iconic well-known moments are fine ("Aguerooooo", "Solskjaer 1999", "Zidane's headbutt"). Specific stats you're not sure of are not.

YOUR JOB IN HEAD-TO-HEAD MODE:
Two players have each picked a 3-player squad and written a sentence defending their choice. Your job is to:
1. Score each player's argument out of 10 (use the full range — see scoring guide below)
2. Declare a winner (the higher score wins; if tied, you must pick one)
3. Deliver a single combined verdict that addresses BOTH players by name

THE 10-POINT SCORE — use the FULL range. 9s and 10s are achievable and you should reward them when earned:

- 10: A near-perfect answer. Genuinely brilliant squad for the question AND a sharp, original argument. Rare but achievable — hand one out maybe once in twenty arguments.
- 9: Excellent. Strong squad with at least one inspired pick, plus a defence that surprises you. Reward this when an argument genuinely impresses you.
- 8: Very good. Solid squad, well-argued, with at least one specific insight.
- 7: Good. Sensible squad, competent defence. Most well-prepared answers.
- 5-6: Reasonable but flawed. Generic squad or thin argument. The default average.
- 3-4: Lazy, generic, contradictory, full of holes.
- 1-2: Terrible. Comically bad picks, no defence, or self-defeating logic.

CRITICAL: Do NOT default to 7 or 8 for everything decent. Reserve 7 for "good," save 8 for "very good," and actively hand out 9s when one player delivers something sharp the other doesn't. The whole point of head-to-head is meaningful score gaps — if both players give thoughtful answers, find the differentiator and score accordingly.

The score reflects BOTH the squad picks AND the sentence quality. Reward arguments that directly counter the opponent's squad.

OUTPUT FORMAT (strictly):
Return ONLY valid JSON, no markdown fences:
{
  "p1Score": <integer 1-10>,
  "p2Score": <integer 1-10>,
  "winnerIdx": <0 for p1 wins, 1 for p2 wins — must reflect higher score; if tied, choose one and explain>,
  "verdict": "3-5 sentences. Address BOTH players by their actual name. React to their picks and sentences specifically. Compare the two squads. Declare a winner with a reason.",
  "ronOneLiner": "One short, quotable sentence (max 14 words) that names the winner. The headline line."
}

Be specific. Mention players by name. Use both player names in the verdict. Make the verdict feel like a referee's judgement after watching both arguments.`;

export default function Kick3() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('solo'); // 'solo' or 'h2h'
  const [draftRounds, setDraftRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [squad, setSquad] = useState([]);
  const [sentence, setSentence] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Head-to-head state
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [activePlayer, setActivePlayer] = useState(0); // 0 or 1
  const [p1Squad, setP1Squad] = useState([]);
  const [p2Squad, setP2Squad] = useState([]);
  const [p1Sentence, setP1Sentence] = useState('');
  const [p2Sentence, setP2Sentence] = useState('');
  const [h2hVerdict, setH2hVerdict] = useState(null);

  // Countdown to next question (next local midnight)
  const timeUntilNext = useCountdownToMidnight();

  // Refs for the verdict cards (used by the share-image generator)
  const soloCardRef = useRef(null);
  const h2hCardRef = useRef(null);

  // Share state — shows feedback in the share button.
  const [shareState, setShareState] = useState('idle'); // 'idle' | 'working' | 'shared' | 'copied' | 'error'

  // Render the verdict card to a JPEG blob.
  // 1.5x scale + 90% JPEG quality keeps file size ~250-350KB instead of ~1MB,
  // with no visible quality loss on phone screens.
  const renderCardToBlob = async (cardRef) => {
    if (!cardRef.current || !window.html2canvas) return null;
    const canvas = await window.html2canvas(cardRef.current, {
      backgroundColor: '#0a0a14',
      scale: 1.5,
      useCORS: true,
      logging: false
    });
    return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
  };

  // SHARE — opens native share sheet on phone, copies on desktop, downloads as last resort.
  const shareCard = async (cardRef, mode) => {
    setShareState('working');
    try {
      const blob = await renderCardToBlob(cardRef);
      if (!blob) throw new Error('Render failed');

      const filename = `kick3-day${TODAYS_QUESTION.number}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });
      const shareText = mode === 'h2h'
        ? `Kick 3 — Day ${TODAYS_QUESTION.number} — kick3.app`
        : `My Kick 3 score today: ${verdict?.score || ''}/10 — kick3.app`;

      // Best mobile experience: native share sheet
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Kick 3',
          text: shareText
        });
        setShareState('shared');
      } else if (navigator.clipboard && window.ClipboardItem) {
        // Desktop fallback: copy image to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/jpeg': blob })
        ]);
        setShareState('copied');
      } else {
        // Last resort: trigger a download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setShareState('shared');
      }
    } catch (err) {
      // User cancelling the share sheet on iOS throws — that's not an error
      if (err.name === 'AbortError') {
        setShareState('idle');
        return;
      }
      console.error('Share failed:', err);
      setShareState('error');
    } finally {
      setTimeout(() => setShareState('idle'), 2500);
    }
  };

  const shareLabel = {
    idle: 'SHARE VERDICT',
    working: 'GENERATING…',
    shared: 'SHARED ✓',
    copied: 'COPIED ✓',
    error: 'TRY AGAIN'
  }[shareState];

  const startGame = () => {
    setMode('solo');
    setDraftRounds(generateDraft());
    setCurrentRound(0);
    setSquad([]);
    setSentence('');
    setVerdict(null);
    setError(null);
    setScreen('draft');
  };

  const startH2H = () => {
    setMode('h2h');
    setP1Name('');
    setP2Name('');
    setP1Squad([]);
    setP2Squad([]);
    setP1Sentence('');
    setP2Sentence('');
    setH2hVerdict(null);
    setError(null);
    setScreen('h2h-names');
  };

  const beginH2HDraft = () => {
    if (!p1Name.trim() || !p2Name.trim()) return;
    setActivePlayer(0);
    setSquad([]);
    setDraftRounds(generateDraft());
    setCurrentRound(0);
    setScreen('h2h-pass-to-draft');
  };

  const pickPlayer = (player) => {
    const newSquad = [...squad, player];
    setSquad(newSquad);
    if (currentRound < 2) {
      // Exclude picked players from THIS player's pool
      // For h2h, also exclude the other player's already-drafted squad
      const otherSquad = mode === 'h2h' && activePlayer === 1 ? p1Squad.map(p => p.name) : [];
      const exclude = [...newSquad.map(p => p.name), ...otherSquad];
      const remaining = generateDraft(exclude);
      const updated = [...draftRounds];
      updated[currentRound + 1] = remaining[currentRound + 1];
      if (currentRound + 2 < 3) updated[currentRound + 2] = remaining[currentRound + 2];
      setDraftRounds(updated);
      setCurrentRound(currentRound + 1);
    } else {
      // Done drafting
      if (mode === 'solo') {
        setScreen('defend');
      } else {
        // h2h
        if (activePlayer === 0) {
          setP1Squad(newSquad);
          setSquad([]);
          setActivePlayer(1);
          // generate p2 draft, excluding p1's squad
          setDraftRounds(generateDraft(newSquad.map(p => p.name)));
          setCurrentRound(0);
          setScreen('h2h-pass-to-p2-draft');
        } else {
          setP2Squad(newSquad);
          setScreen('h2h-reveal');
        }
      }
    }
  };

  const proceedToP1Defend = () => {
    setSentence('');
    setScreen('h2h-pass-to-p1-defend');
  };

  const submitP1Sentence = () => {
    setP1Sentence(sentence);
    setSentence('');
    setScreen('h2h-pass-to-p2-defend');
  };

  const submitP2Sentence = async () => {
    setP2Sentence(sentence);
    await deliverH2HVerdict(sentence);
  };

  const deliverH2HVerdict = async (p2SentenceFinal) => {
    setLoading(true);
    setError(null);
    try {
      const userMessage = `Today's question: "${TODAYS_QUESTION.text}"

PLAYER 1: ${p1Name}
${p1Name}'s squad:
${p1Squad.map((p, i) => `${i+1}. ${p.name} (${p.tier}) — ${p.note}`).join('\n')}
${p1Name}'s defence: "${p1Sentence || '(No defence given.)'}"

PLAYER 2: ${p2Name}
${p2Name}'s squad:
${p2Squad.map((p, i) => `${i+1}. ${p.name} (${p.tier}) — ${p.note}`).join('\n')}
${p2Name}'s defence: "${p2SentenceFinal || '(No defence given.)'}"

Score each /10, declare a winner, deliver verdict as JSON.`;

      const response = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: RON_H2H_PROMPT,
          userMessage: userMessage
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = (data.text || "").trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setH2hVerdict(parsed);
      setScreen('h2h-verdict');
    } catch (e) {
      console.error(e);
      setError("Pete lost his train of thought. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitToRon = async () => {
    setLoading(true);
    setError(null);
    try {
      const userMessage = `Today's question: "${TODAYS_QUESTION.text}"

The user's squad of 3:
${squad.map((p, i) => `${i+1}. ${p.name} (${p.tier}) — ${p.note}`).join('\n')}

Their one-sentence defence: "${sentence || '(They did not write a defence.)'}"

Deliver your verdict as JSON.`;

      const response = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: RON_SYSTEM_PROMPT,
          userMessage: userMessage
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = (data.text || "").trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setVerdict(parsed);
      setScreen('verdict');
    } catch (e) {
      console.error(e);
      setError("Pete lost his train of thought. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Styles ----------
  const colours = {
    bg: '#0a0a14',
    bg2: '#13131f',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    text: '#f5f5f0',
    muted: 'rgba(245,245,240,0.55)',
    gold: '#D4AF37',
    goldDim: '#8a7228',
    cream: '#f5f5f0',
    accent: '#E8344A'
  };

  const bgStyle = {
    minHeight: '100vh',
    width: '100%',
    background: `radial-gradient(ellipse at top, #1a1a2e 0%, ${colours.bg} 60%)`,
    color: colours.text,
    fontFamily: "'Barlow', -apple-system, sans-serif",
    padding: '24px 20px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  };

  // Subtle pitch-line pattern overlay
  const pitchOverlay = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none'
  };

  const container = {
    maxWidth: '480px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  };

  const displayFont = { fontFamily: "'Teko', 'Oswald', sans-serif", letterSpacing: '0.02em' };
  const condFont = { fontFamily: "'Barlow Condensed', sans-serif" };

  // ---------- HOME SCREEN ----------
  if (screen === 'home') {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            {/* Logo block */}
            <div style={{ textAlign: 'center', paddingTop: '40px', marginBottom: '48px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.4em', color: colours.gold, marginBottom: '8px', fontStyle: 'italic' }}>
                — DAY {TODAYS_QUESTION.number} —
              </div>
              <h1 style={{ ...displayFont, fontSize: '88px', lineHeight: '0.85', margin: 0, fontWeight: 700, color: colours.cream, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                KICK<span style={{ color: colours.gold, fontSize: '88px' }}>3</span>
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '12px' }}>
                <div style={{ height: '2px', width: '40px', background: colours.gold }} />
                <div style={{ ...condFont, fontSize: '13px', color: colours.gold, fontWeight: 600, letterSpacing: '0.3em', fontStyle: 'italic' }}>WITH PETE THE PUNDIT</div>
                <div style={{ height: '2px', width: '40px', background: colours.gold }} />
              </div>
              <p style={{ ...condFont, fontStyle: 'italic', color: colours.muted, marginTop: '20px', fontSize: '14px', letterSpacing: '0.05em' }}>
                Draft three. Defend them. Let Pete decide.
              </p>
            </div>

            {/* Today's Question card */}
            <div style={{
              background: colours.surface,
              border: `1px solid ${colours.goldDim}`,
              borderRadius: '4px',
              padding: '24px',
              marginBottom: '32px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '20px',
                background: colours.bg,
                padding: '0 10px',
                ...condFont,
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: colours.gold
              }}>
                TODAY&apos;S QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '28px', lineHeight: '1.1', margin: '8px 0 12px 0', fontWeight: 500 }}>
                {TODAYS_QUESTION.text}
              </p>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: CATEGORY_COLOURS[TODAYS_QUESTION.category] || colours.muted, fontWeight: 600 }}>
                ● {TODAYS_QUESTION.category.toUpperCase()}
              </div>
            </div>

            {/* Ron's intro */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '40px', alignItems: 'flex-start' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${colours.gold} 0%, ${colours.goldDim} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: `2px solid ${colours.gold}`,
                ...displayFont,
                fontSize: '24px',
                fontWeight: 700,
                color: colours.bg
              }}>
                P
              </div>
              <div>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.2em', color: colours.gold, marginBottom: '4px' }}>
                  PETE THE PUNDIT
                </div>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', color: colours.text, fontStyle: 'italic' }}>
                  &ldquo;{TODAYS_QUESTION.ronIntro}&rdquo;
                </p>
              </div>
            </div>

            {/* Countdown to next question */}
            <div style={{
              marginBottom: '24px',
              padding: '12px 14px',
              background: 'rgba(212,175,55,0.06)',
              borderLeft: `2px solid ${colours.gold}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                ...condFont, fontSize: '11px', letterSpacing: '0.25em',
                color: colours.muted, fontWeight: 600
              }}>
                NEXT QUESTION IN
              </div>
              <div style={{
                ...displayFont, fontSize: '20px', fontWeight: 600,
                color: colours.gold, letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {timeUntilNext}
              </div>
            </div>

            {/* Play buttons */}
            <button onClick={startGame} style={{
              width: '100%',
              padding: '18px',
              background: colours.gold,
              color: colours.bg,
              border: 'none',
              borderRadius: '2px',
              ...displayFont,
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              marginBottom: '12px'
            }}>
              PLAY SOLO →
            </button>
            <button onClick={startH2H} style={{
              width: '100%',
              padding: '18px',
              background: 'transparent',
              color: colours.cream,
              border: `1px solid ${colours.gold}`,
              borderRadius: '2px',
              ...displayFont,
              fontSize: '20px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}>
              1 VS 1 →
            </button>

            <p style={{ textAlign: 'center', ...condFont, color: colours.muted, fontSize: '12px', marginTop: '32px', letterSpacing: '0.05em' }}>
              Solo  ·  1 vs 1  ·  Scored /10  ·  Pete decides
            </p>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- DRAFT SCREEN ----------
  if (screen === 'draft') {
    const cards = draftRounds[currentRound] || [];
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            {/* H2H player banner */}
            {mode === 'h2h' && (
              <div style={{
                marginBottom: '20px',
                padding: '10px 14px',
                background: activePlayer === 0 ? 'rgba(232,52,74,0.12)' : 'rgba(93,173,226,0.12)',
                border: `1px solid ${activePlayer === 0 ? '#E8344A' : '#5DADE2'}`,
                textAlign: 'center'
              }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.muted, marginBottom: '2px' }}>
                  DRAFTING
                </div>
                <div style={{ ...displayFont, fontSize: '24px', fontWeight: 600, color: activePlayer === 0 ? '#E8344A' : '#5DADE2' }}>
                  {activePlayer === 0 ? p1Name.toUpperCase() : p2Name.toUpperCase()}
                </div>
              </div>
            )}

            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingTop: '8px' }}>
              <div style={{ ...condFont, fontSize: '12px', letterSpacing: '0.3em', color: colours.gold }}>
                PICK {currentRound + 1} OF 3
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: '24px', height: '4px',
                    background: i <= currentRound ? colours.gold : 'rgba(255,255,255,0.15)'
                  }} />
                ))}
              </div>
            </div>

            {/* Question reminder */}
            <div style={{ marginBottom: '24px', padding: '14px 18px', background: 'rgba(212,175,55,0.06)', borderLeft: `2px solid ${colours.gold}` }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '4px' }}>
                THE QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '18px', margin: 0, lineHeight: '1.2' }}>
                {TODAYS_QUESTION.text}
              </p>
            </div>

            {/* Squad so far */}
            {squad.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colours.muted, marginBottom: '8px' }}>
                  YOUR SQUAD
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {squad.map((p, i) => (
                    <div key={i} style={{
                      padding: '6px 10px',
                      background: colours.surface,
                      border: `1px solid ${TIER_COLOURS[p.tier]}55`,
                      fontSize: '13px',
                      ...condFont,
                      fontWeight: 600
                    }}>
                      <span style={{ color: TIER_COLOURS[p.tier], marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ ...condFont, color: colours.muted, fontSize: '14px', marginBottom: '20px', textAlign: 'center', letterSpacing: '0.05em' }}>
              CHOOSE ONE
            </p>

            {/* Two cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cards.map((p, i) => p && (
                <button key={i} onClick={() => pickPlayer(p)} style={{
                  background: colours.surface,
                  border: `1px solid ${TIER_COLOURS[p.tier]}66`,
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: colours.text,
                  fontFamily: "'Barlow', sans-serif",
                  position: 'relative',
                  transition: 'all 0.15s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = colours.surfaceHover;
                  e.currentTarget.style.borderColor = TIER_COLOURS[p.tier];
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = colours.surface;
                  e.currentTarget.style.borderColor = `${TIER_COLOURS[p.tier]}66`;
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: TIER_COLOURS[p.tier], fontSize: '16px' }}>{TIER_SYMBOLS[p.tier]}</span>
                      <span style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: TIER_COLOURS[p.tier] }}>
                        {p.tier.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '20px' }}>{p.flag}</span>
                  </div>
                  <div style={{ ...displayFont, fontSize: '26px', lineHeight: '1.1', fontWeight: 500, marginBottom: '4px' }}>
                    {p.name}
                  </div>
                  <div style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '14px' }}>
                    {p.note}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- DEFEND SCREEN ----------
  if (screen === 'defend') {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            <div style={{ ...condFont, fontSize: '12px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '24px', paddingTop: '8px', textAlign: 'center' }}>
              — DEFEND YOUR SQUAD —
            </div>

            {/* Squad recap */}
            <div style={{ marginBottom: '28px' }}>
              {squad.map((p, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  marginBottom: '8px',
                  background: colours.surface,
                  borderLeft: `3px solid ${TIER_COLOURS[p.tier]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ ...displayFont, fontSize: '20px', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.2em', color: TIER_COLOURS[p.tier] }}>
                      {TIER_SYMBOLS[p.tier]} {p.tier.toUpperCase()}
                    </div>
                  </div>
                  <span style={{ fontSize: '22px' }}>{p.flag}</span>
                </div>
              ))}
            </div>

            {/* Question reminder */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colours.muted, marginBottom: '6px' }}>
                THE QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '20px', margin: 0, lineHeight: '1.15', color: colours.cream }}>
                {TODAYS_QUESTION.text}
              </p>
            </div>

            <p style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>
              One sentence. Make it count. Pete's listening.
            </p>

            <textarea
              value={sentence}
              onChange={e => setSentence(e.target.value.slice(0, 200))}
              placeholder="e.g. Iniesta has done it before and the other two are pure ice."
              style={{
                width: '100%',
                minHeight: '90px',
                background: colours.surface,
                border: `1px solid ${colours.goldDim}`,
                borderRadius: '2px',
                color: colours.text,
                padding: '14px',
                fontFamily: "'Barlow', sans-serif",
                fontSize: '15px',
                lineHeight: '1.4',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
            <div style={{ textAlign: 'right', ...condFont, color: colours.muted, fontSize: '11px', marginTop: '4px', marginBottom: '20px' }}>
              {sentence.length}/200
            </div>

            {error && (
              <div style={{ padding: '12px', background: 'rgba(232,52,74,0.1)', border: `1px solid ${colours.accent}`, marginBottom: '12px', color: colours.accent, fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button onClick={submitToRon} disabled={loading} style={{
              width: '100%',
              padding: '18px',
              background: loading ? colours.goldDim : colours.gold,
              color: colours.bg,
              border: 'none',
              borderRadius: '2px',
              ...displayFont,
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: loading ? 'wait' : 'pointer'
            }}>
              {loading ? 'PETE IS DELIBERATING...' : "OVER TO PETE →"}
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- VERDICT SCREEN ----------
  if (screen === 'verdict' && verdict) {
    const ratingColours = {
      'PURE QUALITY': '#27AE60',
      'FAIR PLAY': '#5DADE2',
      'INTERESTING': colours.gold,
      'QUESTIONABLE': '#F0B27A',
      'GET IN THE BIN': colours.accent
    };
    const ratingColour = ratingColours[verdict.rating] || colours.gold;

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            {/* Verdict card (designed to be the share artifact) */}
            <div ref={soloCardRef} style={{
              background: `linear-gradient(155deg, #1a1a2e 0%, #0a0a14 100%)`,
              border: `2px solid ${colours.gold}`,
              borderRadius: '4px',
              padding: '28px 24px',
              marginTop: '20px',
              position: 'relative',
              boxShadow: `0 0 40px rgba(212,175,55,0.15)`
            }}>
              {/* Top stamp */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.4em', color: colours.gold, fontStyle: 'italic' }}>
                  KICK 3  ·  DAY {TODAYS_QUESTION.number}
                </div>
              </div>

              {/* SCORE — the headline number */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.4em', color: colours.muted, marginBottom: '4px' }}>
                  PETE&apos;S SCORE
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    ...displayFont,
                    fontSize: '120px',
                    lineHeight: '0.85',
                    fontWeight: 700,
                    color: ratingColour,
                    textShadow: `0 0 30px ${ratingColour}55`
                  }}>
                    {verdict.score}
                  </div>
                  <div style={{
                    ...displayFont,
                    fontSize: '40px',
                    fontWeight: 400,
                    color: colours.muted
                  }}>
                    /10
                  </div>
                </div>
              </div>

              {/* Rating stamp */}
              <div style={{
                textAlign: 'center',
                marginBottom: '24px',
                padding: '10px',
                border: `2px solid ${ratingColour}`,
                background: `${ratingColour}11`,
                transform: 'rotate(-1.5deg)'
              }}>
                <div style={{ ...displayFont, fontSize: '24px', fontWeight: 700, color: ratingColour, letterSpacing: '0.05em' }}>
                  {verdict.rating}
                </div>
              </div>

              {/* Question */}
              <div style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '13px', textAlign: 'center', marginBottom: '6px' }}>
                THE QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '20px', textAlign: 'center', margin: '0 0 24px 0', lineHeight: '1.15' }}>
                {TODAYS_QUESTION.text}
              </p>

              {/* Squad */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                {squad.map((p, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    borderLeft: `2px solid ${TIER_COLOURS[p.tier]}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '15px'
                  }}>
                    <span style={{ ...condFont, fontWeight: 600, letterSpacing: '0.02em' }}>
                      <span style={{ color: TIER_COLOURS[p.tier], marginRight: '8px' }}>{TIER_SYMBOLS[p.tier]}</span>
                      {p.name}
                    </span>
                    <span>{p.flag}</span>
                  </div>
                ))}
              </div>

              {/* User sentence */}
              {sentence && (
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', marginBottom: '20px', fontSize: '14px', fontStyle: 'italic', color: colours.muted, lineHeight: '1.4' }}>
                  &ldquo;{sentence}&rdquo;
                </div>
              )}

              {/* Ron's verdict */}
              <div style={{ borderTop: `1px solid ${colours.goldDim}`, paddingTop: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colours.gold} 0%, ${colours.goldDim} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    ...displayFont,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: colours.bg
                  }}>P</div>
                  <div>
                    <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.25em', color: colours.gold, marginBottom: '2px' }}>
                      PETE&apos;S VERDICT
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', color: colours.text }}>
                      {verdict.verdict}
                    </p>
                  </div>
                </div>

                {/* The one-liner — the quotable bit */}
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(212,175,55,0.08)',
                  borderLeft: `3px solid ${colours.gold}`,
                  borderRight: `3px solid ${colours.gold}`,
                  textAlign: 'center'
                }}>
                  <p style={{
                    ...displayFont,
                    fontSize: '20px',
                    margin: 0,
                    lineHeight: '1.2',
                    color: colours.cream,
                    fontStyle: 'italic',
                    fontWeight: 500
                  }}>
                    &ldquo;{verdict.ronOneLiner}&rdquo;
                  </p>
                </div>
              </div>

              {/* Footer URL — visible inside the share image */}
              <div style={{
                marginTop: '24px',
                paddingTop: '14px',
                borderTop: `1px solid rgba(212,175,55,0.2)`,
                textAlign: 'center',
                ...condFont,
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: colours.gold,
                fontStyle: 'italic'
              }}>
                kick3.app
              </div>
            </div>

            {/* SHARE button — primary action */}
            <button
              onClick={() => shareCard(soloCardRef, 'solo')}
              disabled={shareState === 'working'}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '16px',
                background: shareState === 'shared' || shareState === 'copied' ? '#27AE60' : colours.gold,
                color: colours.bg,
                border: 'none',
                borderRadius: '2px',
                ...displayFont,
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                cursor: shareState === 'working' ? 'wait' : 'pointer',
                transition: 'background 0.2s',
                opacity: shareState === 'working' ? 0.7 : 1
              }}
            >
              {shareLabel}
            </button>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => setScreen('home')} style={{
                flex: 1, padding: '14px', background: 'transparent',
                color: colours.text, border: `1px solid ${colours.muted}`,
                borderRadius: '2px', ...displayFont, fontSize: '16px',
                letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 500
              }}>
                BACK
              </button>
              <button onClick={startGame} style={{
                flex: 1, padding: '14px', background: 'transparent',
                color: colours.text, border: `1px solid ${colours.gold}`,
                borderRadius: '2px', ...displayFont, fontSize: '16px',
                letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 500
              }}>
                PLAY AGAIN
              </button>
            </div>

            <p style={{ textAlign: 'center', ...condFont, color: colours.muted, fontSize: '12px', marginTop: '24px', fontStyle: 'italic' }}>
              Send it to your mates. See if they can beat you.
            </p>

            {/* Pete returns countdown */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              padding: '12px',
              borderTop: `1px solid rgba(212,175,55,0.15)`,
            }}>
              <div style={{
                ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                color: colours.muted, marginBottom: '4px'
              }}>
                PETE RETURNS IN
              </div>
              <div style={{
                ...displayFont, fontSize: '22px', fontWeight: 600,
                color: colours.gold, letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {timeUntilNext}
              </div>
            </div>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- H2H NAMES SCREEN ----------
  if (screen === 'h2h-names') {
    const canStart = p1Name.trim() && p2Name.trim();
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            <div style={{ ...condFont, fontSize: '12px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '8px', paddingTop: '20px', textAlign: 'center' }}>
              1 VS 1
            </div>
            <h2 style={{ ...displayFont, fontSize: '40px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px 0', lineHeight: '1' }}>
              WHO&apos;S PLAYING?
            </h2>
            <p style={{ ...condFont, fontStyle: 'italic', color: colours.muted, textAlign: 'center', fontSize: '14px', marginBottom: '36px' }}>
              Two players. One device. Pete decides.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#E8344A', marginBottom: '6px' }}>
                ● PLAYER 1
              </div>
              <input
                value={p1Name}
                onChange={e => setP1Name(e.target.value.slice(0, 16))}
                placeholder="Name"
                style={{
                  width: '100%',
                  background: 'rgba(232,52,74,0.06)',
                  border: '1px solid #E8344A',
                  color: colours.text,
                  padding: '14px',
                  ...displayFont,
                  fontSize: '22px',
                  fontWeight: 500,
                  borderRadius: '2px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#5DADE2', marginBottom: '6px' }}>
                ● PLAYER 2
              </div>
              <input
                value={p2Name}
                onChange={e => setP2Name(e.target.value.slice(0, 16))}
                placeholder="Name"
                style={{
                  width: '100%',
                  background: 'rgba(93,173,226,0.06)',
                  border: '1px solid #5DADE2',
                  color: colours.text,
                  padding: '14px',
                  ...displayFont,
                  fontSize: '22px',
                  fontWeight: 500,
                  borderRadius: '2px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button onClick={beginH2HDraft} disabled={!canStart} style={{
              width: '100%',
              padding: '18px',
              background: canStart ? colours.gold : colours.goldDim,
              color: colours.bg,
              border: 'none',
              borderRadius: '2px',
              ...displayFont,
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: canStart ? 'pointer' : 'not-allowed',
              opacity: canStart ? 1 : 0.5
            }}>
              KICK OFF →
            </button>

            <button onClick={() => setScreen('home')} style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: colours.muted,
              border: 'none',
              ...condFont,
              fontSize: '13px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              marginTop: '16px'
            }}>
              ← BACK
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- PASS-THE-PHONE INTERSTITIAL ----------
  // Shared interstitial used in 4 spots; varies by screen value
  if (screen.startsWith('h2h-pass-to-')) {
    const passConfig = {
      'h2h-pass-to-draft': {
        toName: p1Name, colour: '#E8344A', label: 'PLAYER 1',
        action: 'YOUR TURN TO DRAFT', sub: '3 picks. Blind. No cheating.',
        next: () => setScreen('draft')
      },
      'h2h-pass-to-p2-draft': {
        toName: p2Name, colour: '#5DADE2', label: 'PLAYER 2',
        action: 'YOUR TURN TO DRAFT', sub: `${p1Name} is done. 3 picks. No duplicates.`,
        next: () => setScreen('draft')
      },
      'h2h-pass-to-p1-defend': {
        toName: p1Name, colour: '#E8344A', label: 'PLAYER 1',
        action: 'WRITE YOUR DEFENCE', sub: "You've seen their squad. Make it count.",
        next: () => setScreen('h2h-defend')
      },
      'h2h-pass-to-p2-defend': {
        toName: p2Name, colour: '#5DADE2', label: 'PLAYER 2',
        action: 'WRITE YOUR DEFENCE', sub: `${p1Name} has locked theirs in. No peeking. Make your case.`,
        next: () => setScreen('h2h-defend')
      }
    };
    const config = passConfig[screen];
    if (!config) return null;
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={{ ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={pitchOverlay} />
          <div style={{ ...container, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{ height: '1px', width: '60px', background: colours.goldDim }} />
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.4em', color: colours.gold, fontStyle: 'italic' }}>KICK 3</div>
              <div style={{ height: '1px', width: '60px', background: colours.goldDim }} />
            </div>
            <div style={{ ...condFont, fontSize: '12px', letterSpacing: '0.4em', color: colours.muted, marginBottom: '8px' }}>
              OVER TO
            </div>
            <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: config.colour, marginBottom: '4px' }}>
              ● {config.label}
            </div>
            <h1 style={{ ...displayFont, fontSize: '64px', fontWeight: 700, margin: '0 0 32px 0', color: colours.cream, lineHeight: '1' }}>
              {config.toName.toUpperCase()}
            </h1>
            <div style={{ padding: '20px', background: `${config.colour}11`, border: `1px solid ${config.colour}66`, marginBottom: '32px' }}>
              <div style={{ ...displayFont, fontSize: '20px', color: config.colour, fontWeight: 600, marginBottom: '4px' }}>
                {config.action}
              </div>
              <div style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '14px' }}>
                {config.sub}
              </div>
            </div>
            <button onClick={config.next} style={{
              width: '100%',
              padding: '18px',
              background: config.colour,
              color: colours.cream,
              border: 'none',
              borderRadius: '2px',
              ...displayFont,
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}>
              READY, {config.toName.toUpperCase()} →
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- H2H REVEAL — both squads side by side ----------
  if (screen === 'h2h-reveal') {
    const renderSquad = (squad, name, colour) => (
      <div style={{ flex: 1, padding: '14px', background: `${colour}08`, border: `1px solid ${colour}55` }}>
        <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colour, marginBottom: '10px', textAlign: 'center' }}>
          ● {name.toUpperCase()}
        </div>
        {squad.map((p, i) => (
          <div key={i} style={{
            padding: '8px 6px',
            borderBottom: i < 2 ? `1px solid ${colour}22` : 'none'
          }}>
            <div style={{ ...displayFont, fontSize: '15px', fontWeight: 500, lineHeight: '1.1', marginBottom: '2px' }}>
              <span style={{ color: TIER_COLOURS[p.tier], marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>
              {p.name}
            </div>
            <div style={{ ...condFont, fontSize: '11px', color: colours.muted, fontStyle: 'italic' }}>
              {p.note}
            </div>
          </div>
        ))}
      </div>
    );
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            <div style={{ textAlign: 'center', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ ...condFont, fontSize: '12px', letterSpacing: '0.4em', color: colours.gold, fontStyle: 'italic', marginBottom: '4px' }}>
                — THE BIG REVEAL —
              </div>
              <h2 style={{ ...displayFont, fontSize: '40px', margin: 0, fontWeight: 700, lineHeight: '1' }}>
                SQUADS LOCKED
              </h2>
            </div>

            {/* Question reminder */}
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(212,175,55,0.06)', borderLeft: `2px solid ${colours.gold}` }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '2px' }}>
                THE QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '17px', margin: 0, lineHeight: '1.15' }}>
                {TODAYS_QUESTION.text}
              </p>
            </div>

            {/* Side by side squads */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {renderSquad(p1Squad, p1Name, '#E8344A')}
              {renderSquad(p2Squad, p2Name, '#5DADE2')}
            </div>

            <p style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              Now defend yours. Best argument wins.
            </p>

            <button onClick={proceedToP1Defend} style={{
              width: '100%',
              padding: '18px',
              background: colours.gold,
              color: colours.bg,
              border: 'none',
              borderRadius: '2px',
              ...displayFont,
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}>
              ON TO THE ARGUMENTS →
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- H2H DEFEND SCREEN (used for both P1 and P2) ----------
  if (screen === 'h2h-defend') {
    const isP1 = activePlayer === 0;
    // Wait — for h2h, activePlayer is set during draft. We need to know who's defending.
    // We'll use: if p1Sentence is empty, we're collecting p1's. Else collecting p2's.
    const collectingP1 = !p1Sentence;
    const myName = collectingP1 ? p1Name : p2Name;
    const myColour = collectingP1 ? '#E8344A' : '#5DADE2';
    const mySquad = collectingP1 ? p1Squad : p2Squad;
    const oppName = collectingP1 ? p2Name : p1Name;
    const oppColour = collectingP1 ? '#5DADE2' : '#E8344A';
    const oppSquad = collectingP1 ? p2Squad : p1Squad;
    const onSubmit = collectingP1 ? submitP1Sentence : submitP2Sentence;

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            <div style={{
              padding: '8px 14px',
              background: `${myColour}12`,
              border: `1px solid ${myColour}`,
              textAlign: 'center',
              marginBottom: '20px',
              marginTop: '8px'
            }}>
              <div style={{ ...displayFont, fontSize: '20px', fontWeight: 600, color: myColour }}>
                ● {myName.toUpperCase()} — DEFEND
              </div>
            </div>

            {/* Opposing squad — what you're arguing against */}
            <div style={{
              padding: '12px',
              background: `${oppColour}08`,
              border: `1px dashed ${oppColour}66`,
              marginBottom: '14px'
            }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: oppColour, marginBottom: '6px' }}>
                ARGUING AGAINST · {oppName.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {oppSquad.map((p, i) => (
                  <span key={i} style={{
                    ...condFont,
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${TIER_COLOURS[p.tier]}55`
                  }}>
                    <span style={{ color: TIER_COLOURS[p.tier], marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* My squad */}
            <div style={{
              padding: '12px',
              background: `${myColour}10`,
              border: `1px solid ${myColour}88`,
              marginBottom: '20px'
            }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: myColour, marginBottom: '6px' }}>
                YOUR SQUAD
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {mySquad.map((p, i) => (
                  <span key={i} style={{
                    ...condFont,
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${TIER_COLOURS[p.tier]}88`
                  }}>
                    <span style={{ color: TIER_COLOURS[p.tier], marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            <p style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
              One sentence. Make {myName} proud.
            </p>

            <textarea
              value={sentence}
              onChange={e => setSentence(e.target.value.slice(0, 200))}
              placeholder={`e.g. ${oppSquad[0]?.name || 'Their pick'} won't get near my back three.`}
              style={{
                width: '100%',
                minHeight: '90px',
                background: colours.surface,
                border: `1px solid ${myColour}66`,
                borderRadius: '2px',
                color: colours.text,
                padding: '14px',
                fontFamily: "'Barlow', sans-serif",
                fontSize: '15px',
                lineHeight: '1.4',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
            <div style={{ textAlign: 'right', ...condFont, color: colours.muted, fontSize: '11px', marginTop: '4px', marginBottom: '20px' }}>
              {sentence.length}/200
            </div>

            {error && (
              <div style={{ padding: '12px', background: 'rgba(232,52,74,0.1)', border: `1px solid ${colours.accent}`, marginBottom: '12px', color: colours.accent, fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button onClick={onSubmit} disabled={loading} style={{
              width: '100%',
              padding: '18px',
              background: loading ? colours.goldDim : myColour,
              color: colours.cream,
              border: 'none',
              borderRadius: '2px',
              ...displayFont,
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: loading ? 'wait' : 'pointer'
            }}>
              {loading ? 'PETE IS DELIBERATING...' : (collectingP1 ? `LOCK IN — PASS TO ${p2Name.toUpperCase()} →` : 'OVER TO PETE →')}
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- H2H VERDICT SCREEN ----------
  if (screen === 'h2h-verdict' && h2hVerdict) {
    const winnerName = h2hVerdict.winnerIdx === 0 ? p1Name : p2Name;
    const winnerColour = h2hVerdict.winnerIdx === 0 ? '#E8344A' : '#5DADE2';
    const renderSquadCompact = (squad, name, colour, score, isWinner) => (
      <div style={{
        flex: 1,
        padding: '12px',
        background: isWinner ? `${colour}18` : `${colour}06`,
        border: `${isWinner ? '2px' : '1px'} solid ${colour}${isWinner ? '' : '55'}`,
        position: 'relative'
      }}>
        {isWinner && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '8px',
            background: colours.gold,
            color: colours.bg,
            ...displayFont,
            fontSize: '11px',
            letterSpacing: '0.2em',
            padding: '2px 8px',
            fontWeight: 700
          }}>
            WINNER
          </div>
        )}
        <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colour, marginBottom: '6px', textAlign: 'center' }}>
          ● {name.toUpperCase()}
        </div>
        <div style={{ ...displayFont, fontSize: '52px', fontWeight: 700, color: colour, textAlign: 'center', lineHeight: '1' }}>
          {score}<span style={{ fontSize: '20px', color: colours.muted }}>/10</span>
        </div>
        <div style={{ marginTop: '10px' }}>
          {squad.map((p, i) => (
            <div key={i} style={{ ...condFont, fontSize: '12px', fontWeight: 600, padding: '3px 0', textAlign: 'center' }}>
              <span style={{ color: TIER_COLOURS[p.tier], marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={container}>
            {/* Verdict card */}
            <div ref={h2hCardRef} style={{
              background: `linear-gradient(155deg, #1a1a2e 0%, #0a0a14 100%)`,
              border: `2px solid ${colours.gold}`,
              borderRadius: '4px',
              padding: '24px 20px',
              marginTop: '16px',
              boxShadow: `0 0 40px rgba(212,175,55,0.15)`
            }}>
              {/* Top stamp */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.4em', color: colours.gold, fontStyle: 'italic' }}>
                  KICK 3  ·  1 VS 1  ·  DAY {TODAYS_QUESTION.number}
                </div>
              </div>

              {/* Winner banner */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '12px',
                background: `${winnerColour}15`,
                border: `2px solid ${winnerColour}`,
                transform: 'rotate(-1deg)'
              }}>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.4em', color: colours.muted, marginBottom: '2px' }}>
                  PETE DECLARES
                </div>
                <div style={{ ...displayFont, fontSize: '34px', fontWeight: 700, color: winnerColour, letterSpacing: '0.05em', lineHeight: '1' }}>
                  {winnerName.toUpperCase()} WINS
                </div>
              </div>

              {/* Question */}
              <div style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '12px', textAlign: 'center', marginBottom: '4px' }}>
                THE QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '18px', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '1.15' }}>
                {TODAYS_QUESTION.text}
              </p>

              {/* Side by side scores */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {renderSquadCompact(p1Squad, p1Name, '#E8344A', h2hVerdict.p1Score, h2hVerdict.winnerIdx === 0)}
                {renderSquadCompact(p2Squad, p2Name, '#5DADE2', h2hVerdict.p2Score, h2hVerdict.winnerIdx === 1)}
              </div>

              {/* Sentences */}
              <div style={{ marginBottom: '20px' }}>
                {p1Sentence && (
                  <div style={{ padding: '10px 12px', background: 'rgba(232,52,74,0.06)', borderLeft: `2px solid #E8344A`, marginBottom: '6px', fontSize: '13px', fontStyle: 'italic', color: colours.muted, lineHeight: '1.4' }}>
                    <span style={{ ...condFont, fontWeight: 700, color: '#E8344A', fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.2em' }}>{p1Name.toUpperCase()}: </span>
                    &ldquo;{p1Sentence}&rdquo;
                  </div>
                )}
                {p2Sentence && (
                  <div style={{ padding: '10px 12px', background: 'rgba(93,173,226,0.06)', borderLeft: `2px solid #5DADE2`, fontSize: '13px', fontStyle: 'italic', color: colours.muted, lineHeight: '1.4' }}>
                    <span style={{ ...condFont, fontWeight: 700, color: '#5DADE2', fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.2em' }}>{p2Name.toUpperCase()}: </span>
                    &ldquo;{p2Sentence}&rdquo;
                  </div>
                )}
              </div>

              {/* Pete's verdict */}
              <div style={{ borderTop: `1px solid ${colours.goldDim}`, paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colours.gold} 0%, ${colours.goldDim} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    ...displayFont,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: colours.bg
                  }}>P</div>
                  <div>
                    <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.25em', color: colours.gold, marginBottom: '2px' }}>
                      PETE&apos;S VERDICT
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: colours.text }}>
                      {h2hVerdict.verdict}
                    </p>
                  </div>
                </div>

                {/* The one-liner */}
                <div style={{
                  marginTop: '16px',
                  padding: '14px',
                  background: 'rgba(212,175,55,0.08)',
                  borderLeft: `3px solid ${colours.gold}`,
                  borderRight: `3px solid ${colours.gold}`,
                  textAlign: 'center'
                }}>
                  <p style={{
                    ...displayFont,
                    fontSize: '18px',
                    margin: 0,
                    lineHeight: '1.2',
                    color: colours.cream,
                    fontStyle: 'italic',
                    fontWeight: 500
                  }}>
                    &ldquo;{h2hVerdict.ronOneLiner}&rdquo;
                  </p>
                </div>
              </div>

              {/* Footer URL — visible inside the share image */}
              <div style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: `1px solid rgba(212,175,55,0.2)`,
                textAlign: 'center',
                ...condFont,
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: colours.gold,
                fontStyle: 'italic'
              }}>
                kick3.app
              </div>
            </div>

            {/* SHARE button */}
            <button
              onClick={() => shareCard(h2hCardRef, 'h2h')}
              disabled={shareState === 'working'}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '16px',
                background: shareState === 'shared' || shareState === 'copied' ? '#27AE60' : colours.gold,
                color: colours.bg,
                border: 'none',
                borderRadius: '2px',
                ...displayFont,
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                cursor: shareState === 'working' ? 'wait' : 'pointer',
                transition: 'background 0.2s',
                opacity: shareState === 'working' ? 0.7 : 1
              }}
            >
              {shareLabel}
            </button>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => setScreen('home')} style={{
                flex: 1, padding: '14px', background: 'transparent',
                color: colours.text, border: `1px solid ${colours.muted}`,
                borderRadius: '2px', ...displayFont, fontSize: '16px',
                letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 500
              }}>
                BACK
              </button>
              <button onClick={startH2H} style={{
                flex: 1, padding: '14px', background: 'transparent',
                color: colours.text, border: `1px solid ${colours.gold}`,
                borderRadius: '2px', ...displayFont, fontSize: '16px',
                letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 500
              }}>
                REMATCH
              </button>
            </div>

            <p style={{ textAlign: 'center', ...condFont, color: colours.muted, fontSize: '12px', marginTop: '20px', fontStyle: 'italic' }}>
              Beat Pete's verdict. Send it to your mate.
            </p>

            {/* Pete returns countdown */}
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              padding: '12px',
              borderTop: `1px solid rgba(212,175,55,0.15)`,
            }}>
              <div style={{
                ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                color: colours.muted, marginBottom: '4px'
              }}>
                NEXT QUESTION IN
              </div>
              <div style={{
                ...displayFont, fontSize: '22px', fontWeight: 600,
                color: colours.gold, letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {timeUntilNext}
              </div>
            </div>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  return null;
}
