import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

// --- 384 shared player pool + 31 daily questions ---
// Players are drawn at random from PLAYER_POOL for every question.
// Constraint: max 1 goalkeeper per draft, no duplicates within a draft.
const QUESTIONS = [
  // Q1 —
  {
    text: "Who do you want taking the last penalty in a World Cup final?",
    category: "One-Off",
    ronIntro: "Right, get yourselves comfortable. Last penalty, World Cup final, the whole lot on one boot. Pick three. I'll mark you out of ten. Try to make it interesting.",
  },
  // Q2 —
  {
    text: "Who do you want stepping up for a Champions League final free-kick, 89th minute, 1-0 down?",
    category: "One-Off",
    ronIntro: "Set-piece at the death. Whole season on the boot. Three picks. I'll be watching the run-up.",
  },
  // Q3 —
  {
    text: "Who do you want anchoring your squad through a 38-game Premier League title race?",
    category: "Season-Long",
    ronIntro: "Forty weeks. Cold Tuesday in Stoke. Twelve injuries. Pick three to drag the season home. I'm watching for stamina.",
  },
  // Q4 —
  {
    text: "Best three players to dominate a Champions League group stage?",
    category: "Season-Long",
    ronIntro: "Six matches. Tuesday and Wednesday nights. Different opposition each time. Pick three who'll deliver under the lights.",
  },
  // Q5 —
  {
    text: "Whose three-player squad is the most fun to watch on a Saturday afternoon?",
    category: "Style",
    ronIntro: "I want to be entertained. Not lectured to about pressing triggers. Pick three who make me forget my back hurts.",
  },
  // Q6 —
  {
    text: "Best three for nutmegs, rabonas, and absolute showboating?",
    category: "Style",
    ronIntro: "Trick merchants only. I want flair, embarrassment for defenders, and at least one piece of skill that gets someone subbed.",
  },
  // Q7 —
  {
    text: "Who do you want when your team is 2-0 down at half-time in a Champions League knockout?",
    category: "Character",
    ronIntro: "Dressing room is silent. Forty-five minutes to save your season. Pick three who don't accept it. I want bottle.",
  },
  // Q8 —
  {
    text: "Best three for a tunnel fight before a North London derby?",
    category: "Character",
    ronIntro: "Concourse at the Emirates. Tempers up. Three of them, three of yours. Who walks out smiling?",
  },
  // Q9 —
  {
    text: "Whose three-player squad is most likely to get sent off in a single match?",
    category: "Chaos",
    ronIntro: "I want carnage. Pick three guaranteed to see red. Bonus marks if it's all in the first half.",
  },
  // Q10 —
  {
    text: "Best three to score from a corner you absolutely should not have scored from?",
    category: "Chaos",
    ronIntro: "Set-piece routine. Pure chaos. Pick three you'd back to put it in from the most ridiculous angle. I'm scoring on absurdity.",
  },
  // Q11 —
  {
    text: "Who do you want with the ball at their feet, last minute, level in extra time of a Champions League final?",
    category: "One-Off",
    ronIntro: "Stadium silent. Ninety-thousand staring. One touch decides it. Pick three you'd give the ball to. I'm marking on nerve.",
  },
  // Q12 —
  {
    text: "Best three to play with on a beach in flip-flops?",
    category: "Style",
    ronIntro: "Sand. Sun. No tactics board. Pick three who'd actually enjoy it. I'm scoring on smiles.",
  },
  // Q13 —
  {
    text: "Whose three-player squad scores the most goals in a 5-2 thriller you should have lost?",
    category: "Chaos",
    ronIntro: "Game's a mess. Defending optional. Pick three who'd score 4 between them whatever's happening at the other end.",
  },
  // Q14 —
  {
    text: "Who do you want when your club's on the brink and the whole stadium's lost its voice?",
    category: "Season-Long",
    ronIntro: "Late April. Bottom three. The fans have stopped singing — that's how bad it's got. You need three players who'd find another gear when the season's collapsing. Pick three. Convince me you wouldn't fold.",
  },
  // Q15 —
  {
    text: "Who do you want walking into the dressing room at half-time when everything's gone wrong?",
    category: "Character",
    ronIntro: "0-2 down. Press conference imminent. Pick three you'd want to actually open their mouth in there. Voice carries weight.",
  },
  // Q16 —
  {
    text: "Best three players to win you one knockout game against a much better team?",
    category: "One-Off",
    ronIntro: "Underdog. One leg. They've got the better players. Pick three who'd find a way. I'm watching for cunning.",
  },
  // Q17 —
  {
    text: "Best three for the most beautiful team goal — six passes, no defender touches it?",
    category: "Style",
    ronIntro: "Pure football. Triangles. One-touch. Pick three who'd thread a goal together that ends up on every highlight reel for twenty years.",
  },
  // Q18 —
  {
    text: "Whose three-player squad gets into the most arguments with the referee in 90 minutes?",
    category: "Chaos",
    ronIntro: "Yellow cards optional. Sustained complaining only. Pick three who'd surround the man in black at every decision.",
  },
  // Q19 —
  {
    text: "Who do you want carrying your club through one full Champions League campaign — group to final?",
    category: "Season-Long",
    ronIntro: "13 matches. From dead Tuesday in Ukraine to a final in May. Pick three who'd be standing at the end. I'm marking on whole-season weight.",
  },
  // Q20 —
  {
    text: "Who do you want as your three-player squad's captain when the camera's on you in the tunnel?",
    category: "Character",
    ronIntro: "Walk-out shot. Sky Sports cameras in your face. National anthem next. Pick three you'd trust to set the tone before a ball's been kicked.",
  },
  // Q21 —
  {
    text: "Who do you want for one perfect counter-attack — break from your own box, score in eight seconds?",
    category: "One-Off",
    ronIntro: "Throw-in to them. Cleared to the halfway line. Eight seconds, you're 1-0 up. Pick three who'd execute it without thinking.",
  },
  // Q22 —
  {
    text: "Best three players who'd make every match look like a video game on easy mode?",
    category: "Style",
    ronIntro: "I want the football equivalent of a cheat code. Pick three who'd make the game look pre-scripted. Everyone else looks normal speed.",
  },
  // Q23 —
  {
    text: "Whose three-player squad celebrates the most ridiculously after a goal?",
    category: "Chaos",
    ronIntro: "Goal goes in. Camera follows them. Pick three you'd back to do something the internet remembers for a decade.",
  },
  // Q24 —
  {
    text: "Who do you want for one full season of Wednesday-Saturday-Wednesday-Saturday over Christmas?",
    category: "Season-Long",
    ronIntro: "December into January. Eight games in three weeks. Boxing Day. New Year's Day. Pick three with the engine and the appetite. I'm marking on stamina.",
  },
  // Q25 —
  {
    text: "Who do you want walking onto the pitch on the final day with the league title in your hands?",
    category: "Character",
    ronIntro: "Final day. Top of the league by one point. Kick-off in ten minutes. Pick three you'd put on the team sheet to see it through. I'll be watching the body language.",
  },
  // Q26 —
  {
    text: "Who's your three-player squad for the strangest goal you've ever seen?",
    category: "One-Off",
    ronIntro: "Forty years in football and I'm still surprised by goals. Pick three who'd score one nobody's ever seen before. I'm not interested in tap-ins. Surprise me.",
  },
  // Q27 —
  {
    text: "Whose three-player squad has the best first touch?",
    category: "Style",
    ronIntro: "Nothing technical scores higher with me than a perfect first touch. Pick three whose control would make every pass look easier than it is.",
  },
  // Q28 —
  {
    text: "Whose three-player squad is most likely to score and concede in the same minute?",
    category: "Chaos",
    ronIntro: "End-to-end. Defending optional. Pick three who'd give you a goal and a heart attack within sixty seconds.",
  },
  // Q29 —
  {
    text: "Who do you want stepping up in a moment everyone else is hiding from?",
    category: "Season-Long",
    ronIntro: "Pressure does funny things to footballers. Most hide. The great ones ask for the ball. Pick three who'd want the moment when ninety thousand are holding their breath. I'll know if you're guessing.",
  },
  // Q30 —
  {
    text: "Who do you want for a derby match where the away end is closed and you're 1-0 down?",
    category: "Character",
    ronIntro: "Hostile crowd. Closed away end. You're getting it from every side. 1-0 down. Pick three who feed off it.",
  },
  // Q31 —
  {
    text: "Best three to score the goal that gets you promoted from the Championship?",
    category: "One-Off",
    ronIntro: "Wembley play-off final. 1-1, extra time. £200m on the line. Pick three you'd give the ball to. I'm watching for nerve in lower-league lights.",
  },
];

const PLAYER_POOL = [
  { name: "Diego Maradona", tier: "Legend", position: "FWD", flag: "🇦🇷", note: "Hand of God, foot of God" },
  { name: "Zinedine Zidane", tier: "Legend", position: "MID", flag: "🇫🇷", note: "'98 final brace, '06 headbutt" },
  { name: "Pelé", tier: "Legend", position: "FWD", flag: "🇧🇷", note: "Three World Cups" },
  { name: "Roberto Baggio", tier: "Legend", position: "FWD", flag: "🇮🇹", note: "Skied the final penalty. The image of '94. Ponytail of pain." },
  { name: "Andrés Iniesta", tier: "Legend", position: "MID", flag: "🇪🇸", note: "'10 final winner" },
  { name: "Bobby Moore", tier: "Legend", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Calm personified" },
  { name: "Eric Cantona", tier: "Legend", position: "FWD", flag: "🇫🇷", note: "Cool defined. Penalty taker for France & United." },
  { name: "Michel Platini", tier: "Legend", position: "MID", flag: "🇫🇷", note: "Three-time Ballon d'Or, took France's biggest moments" },
  { name: "Lothar Matthäus", tier: "Legend", position: "MID", flag: "🇩🇪", note: "'90 World Cup winner, took Germany's clutch ones" },
  { name: "Marco van Basten", tier: "Legend", position: "FWD", flag: "🇳🇱", note: "Euro '88 final author, big-moment merchant" },
  { name: "Lionel Messi", tier: "Star", position: "FWD", flag: "🇦🇷", note: "Won it. Finally." },
  { name: "Kylian Mbappé", tier: "Star", position: "FWD", flag: "🇫🇷", note: "Hat-trick in a final, still lost" },
  { name: "Harry Kane", tier: "Star", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's captain" },
  { name: "Erling Haaland", tier: "Star", position: "FWD", flag: "🇳🇴", note: "Goals for fun. Never been there." },
  { name: "Cristiano Ronaldo", tier: "Star", position: "FWD", flag: "🇵🇹", note: "Yes you knew he'd be here" },
  { name: "Bukayo Saka", tier: "Star", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Missed for England, came back stronger" },
  { name: "Vinícius Júnior", tier: "Star", position: "FWD", flag: "🇧🇷", note: "Madrid's go-to, ice-cold technique" },
  { name: "Robert Lewandowski", tier: "Star", position: "FWD", flag: "🇵🇱", note: "Poland's captain, 90%+ conversion lifetime" },
  { name: "Bruno Fernandes", tier: "Star", position: "MID", flag: "🇵🇹", note: "Demands the ball. Always. Won't flinch." },
  { name: "Lautaro Martínez", tier: "Star", position: "FWD", flag: "🇦🇷", note: "Won the Copa final. Argentine ice." },
  { name: "Roberto Carlos", tier: "Cult", position: "DEF", flag: "🇧🇷", note: "Will absolutely smash it" },
  { name: "Andrea Pirlo", tier: "Cult", position: "MID", flag: "🇮🇹", note: "Will Panenka it. Will smile." },
  { name: "Stuart Pearce", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The redemption man" },
  { name: "Antonin Panenka", tier: "Cult", position: "MID", flag: "🇨🇿", note: "Invented the chip. Iconic." },
  { name: "Mario Balotelli", tier: "Cult", position: "FWD", flag: "🇮🇹", note: "Why always him?" },
  { name: "Dimitar Berbatov", tier: "Cult", position: "FWD", flag: "🇧🇬", note: "Cooler than you" },
  { name: "Eden Hazard", tier: "Cult", position: "FWD", flag: "🇧🇪", note: "Belgium's set-piece man, slow-walk style" },
  { name: "Yaya Touré", tier: "Cult", position: "MID", flag: "🇨🇮", note: "Calmest under pressure, AFCON winner" },
  { name: "Carlos Tevez", tier: "Cult", position: "FWD", flag: "🇦🇷", note: "Streetfighter who took Argentina's biggest" },
  { name: "Robert Pirès", tier: "Cult", position: "FWD", flag: "🇫🇷", note: "Took it cool, scored cool, all his career" },
  { name: "Gareth Southgate (1996)", tier: "Wildcard", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "He missed. He KNOWS." },
  { name: "Jordan Pickford", tier: "Wildcard", position: "GK", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "He's a goalkeeper. Bold." },
  { name: "Asamoah Gyan", tier: "Wildcard", position: "FWD", flag: "🇬🇭", note: "Missed the biggest penalty in African football history" },
  { name: "Chris Waddle", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sent his into orbit, '90" },
  { name: "David Trezeguet", tier: "Wildcard", position: "FWD", flag: "🇫🇷", note: "Missed France's decisive penalty in the 2006 final" },
  { name: "John Terry", tier: "Legend", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "5 PL titles, captain through all of them. Slipped at the Luzhniki." },
  { name: "Marcus Rashford", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Missed for England, came back stronger." },
  { name: "Jadon Sancho (2021)", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Same final, same ghost" },
  { name: "Lukas Podolski", tier: "Wildcard", position: "FWD", flag: "🇩🇪", note: "Germany's '06 generation, biggest stage" },
  { name: "David Beckham", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The technique. The kick at Simeone." },
  { name: "Juninho Pernambucano", tier: "Legend", position: "MID", flag: "🇧🇷", note: "76 of them. Knuckleball king." },
  { name: "Zico", tier: "Legend", position: "MID", flag: "🇧🇷", note: "Only Maradona had a better dead ball" },
  { name: "Ronaldinho", tier: "Legend", position: "MID", flag: "🇧🇷", note: "Curled it over Seaman from 40 yards. Said he meant it." },
  { name: "Pierre van Hooijdonk", tier: "Legend", position: "FWD", flag: "🇳🇱", note: "Forest's free-kick technician, knuckleball pioneer" },
  { name: "James Ward-Prowse", tier: "Star", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Beckham's record holder" },
  { name: "Trent Alexander-Arnold", tier: "Star", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Range from anywhere" },
  { name: "Hakan Çalhanoğlu", tier: "Star", position: "MID", flag: "🇹🇷", note: "30+ yards is his speciality" },
  { name: "Bruno Guimarães", tier: "Star", position: "MID", flag: "🇧🇷", note: "Newcastle's curler, big-moment man" },
  { name: "Lorenzo Pellegrini", tier: "Star", position: "MID", flag: "🇮🇹", note: "Roma captain, set-piece menace" },
  { name: "Jude Bellingham", tier: "Star", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Real Madrid's young set-piece option" },
  { name: "Sinisa Mihajlović", tier: "Cult", position: "DEF", flag: "🇷🇸", note: "Hat-trick of free-kicks in a Serie A game" },
  { name: "Rogerio Ceni", tier: "Cult", position: "GK", flag: "🇧🇷", note: "Goalkeeper. 131 career goals." },
  { name: "Ronald Koeman", tier: "Cult", position: "DEF", flag: "🇳🇱", note: "Won Wembley with one in '92" },
  { name: "Diego Forlán", tier: "Cult", position: "FWD", flag: "🇺🇾", note: "Could finish from anywhere" },
  { name: "Rivaldo", tier: "Cult", position: "FWD", flag: "🇧🇷", note: "Ballon d'Or off dead balls and bicycles" },
  { name: "Sebastian Giovinco", tier: "Cult", position: "FWD", flag: "🇮🇹", note: "Atomic ant, surgical free-kicks" },
  { name: "Riyad Mahrez", tier: "Cult", position: "FWD", flag: "🇩🇿", note: "Curling specialist, City's go-to" },
  { name: "Daniel Parejo", tier: "Cult", position: "MID", flag: "🇪🇸", note: "Valencia's set-piece artist" },
  { name: "Miralem Pjanić", tier: "Cult", position: "MID", flag: "🇧🇦", note: "Roma & Juve, technician's technician" },
  { name: "Toni Kroos", tier: "Cult", position: "MID", flag: "🇩🇪", note: "Surgical, never wastes one" },
  { name: "John Arne Riise", tier: "Wildcard", position: "MID", flag: "🇳🇴", note: "Will absolutely break the net" },
  { name: "Christian Eriksen", tier: "Wildcard", position: "MID", flag: "🇩🇰", note: "Best dead-ball man Spurs ever had" },
  { name: "Memphis Depay", tier: "Wildcard", position: "FWD", flag: "🇳🇱", note: "Netherlands' first-choice dead ball" },
  { name: "Alex (Chelsea/PSG)", tier: "Wildcard", position: "DEF", flag: "🇧🇷", note: "Defender. Thunder for a left foot." },
  { name: "Dimitri Payet", tier: "Wildcard", position: "MID", flag: "🇫🇷", note: "Euro 2016 free-kick king" },
  { name: "Zlatan Ibrahimović", tier: "Wildcard", position: "FWD", flag: "🇸🇪", note: "Will try a bicycle from 30 yards" },
  { name: "Adel Taarabt", tier: "Wildcard", position: "FWD", flag: "🇲🇦", note: "Either world-class or zero, no middle" },
  { name: "Anders Limpar", tier: "Wildcard", position: "FWD", flag: "🇸🇪", note: "Forgotten Arsenal free-kick man" },
  { name: "Sergi Roberto", tier: "Wildcard", position: "DEF", flag: "🇪🇸", note: "Took the big PSG-comeback free-kick" },
  { name: "Tony Yeboah", tier: "Wildcard", position: "FWD", flag: "🇬🇭", note: "Volleys included, dead balls feared" },
  { name: "Patrick Vieira", tier: "Legend", position: "MID", flag: "🇫🇷", note: "Invincibles' engine" },
  { name: "Roy Keane", tier: "Legend", position: "MID", flag: "🇮🇪", note: "He'll demand more from you" },
  { name: "Steven Gerrard", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Never won it, will die trying" },
  { name: "Frank Lampard", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Goals from midfield, every season" },
  { name: "Alan Shearer", tier: "Legend", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "260 PL goals" },
  { name: "Thierry Henry", tier: "Legend", position: "FWD", flag: "🇫🇷", note: "175 PL goals, 2 titles" },
  { name: "Paul Scholes", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "11 PL titles, brain of every season" },
  { name: "Ryan Giggs", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "13 titles. Played until 40." },
  { name: "Didier Drogba", tier: "Legend", position: "FWD", flag: "🇨🇮", note: "Big-game scorer, 4 PL titles" },
  { name: "Kevin De Bruyne", tier: "Star", position: "MID", flag: "🇧🇪", note: "Six titles" },
  { name: "Mohamed Salah", tier: "Star", position: "FWD", flag: "🇪🇬", note: "Goals every season, no fail" },
  { name: "Virgil van Dijk", tier: "Star", position: "DEF", flag: "🇳🇱", note: "Ended a 30-year wait" },
  { name: "Rodri", tier: "Star", position: "MID", flag: "🇪🇸", note: "Ballon d'Or anchor, City's metronome" },
  { name: "William Saliba", tier: "Star", position: "DEF", flag: "🇫🇷", note: "Arsenal's defensive iron man" },
  { name: "Declan Rice", tier: "Star", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Never misses a game, leads from midfield" },
  { name: "Alisson", tier: "Star", position: "GK", flag: "🇧🇷", note: "Liverpool's title-winning keeper" },
  { name: "N'Golo Kanté", tier: "Cult", position: "MID", flag: "🇫🇷", note: "Two titles with two clubs" },
  { name: "Vincent Kompany", tier: "Cult", position: "DEF", flag: "🇧🇪", note: "That goal vs Leicester" },
  { name: "Tony Adams", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain leader legend" },
  { name: "Nemanja Vidić", tier: "Cult", position: "DEF", flag: "🇷🇸", note: "Won 5 PLs by being terrifying" },
  { name: "Jamie Vardy", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Leicester. 5000-1." },
  { name: "Steve Bruce", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captained United to first PL title, never capped" },
  { name: "Gary Pallister", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "4 PL titles, calmest defender alive" },
  { name: "Sami Hyypiä", tier: "Cult", position: "DEF", flag: "🇫🇮", note: "Liverpool's defensive bedrock for a decade" },
  { name: "Phil Jagielka", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton captain forever, never injured" },
  { name: "Wilfried Zaha", tier: "Wildcard", position: "FWD", flag: "🇨🇮", note: "Carried Palace by himself for years" },
  { name: "Aaron Lennon", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pure pace, full season" },
  { name: "Andy Cole", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "187 PL goals across five title-winning seasons" },
  { name: "Marouane Fellaini", tier: "Wildcard", position: "MID", flag: "🇧🇪", note: "Plan B. The whole plan." },
  { name: "Peter Crouch", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "100 PL goals across five clubs" },
  { name: "Tim Cahill", tier: "Wildcard", position: "FWD", flag: "🇦🇺", note: "Header-scoring corner-flag puncher" },
  { name: "Mark Noble", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "West Ham forever. 550+ games. Never left." },
  { name: "James Milner", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Every position. Two clubs, two titles." },
  { name: "Charlie Adam", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Stoke grit. Long-shot specialist." },
  { name: "Ben Foster", tier: "Wildcard", position: "GK", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Retired, unretired at 39 to keep going" },
  { name: "Karim Benzema", tier: "Legend", position: "FWD", flag: "🇫🇷", note: "Real Madrid's CL talisman" },
  { name: "Raúl", tier: "Legend", position: "FWD", flag: "🇪🇸", note: "Real Madrid's original CL legend" },
  { name: "Andriy Shevchenko", tier: "Legend", position: "FWD", flag: "🇺🇦", note: "Carried Milan and Dynamo" },
  { name: "Filippo Inzaghi", tier: "Legend", position: "FWD", flag: "🇮🇹", note: "Born offside, scored for fun" },
  { name: "Kaká", tier: "Legend", position: "MID", flag: "🇧🇷", note: "Milan's CL Ballon d'Or, group-stage dominator" },
  { name: "Phil Foden", tier: "Star", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "City's CL ever-present" },
  { name: "Sergio Agüero", tier: "Cult", position: "FWD", flag: "🇦🇷", note: "Aguerooooo. City's CL warrior." },
  { name: "Edin Džeko", tier: "Cult", position: "FWD", flag: "🇧🇦", note: "Reliable on the European stage" },
  { name: "Ángel Di María", tier: "Cult", position: "FWD", flag: "🇦🇷", note: "Big-game performer always" },
  { name: "Demba Ba", tier: "Cult", position: "FWD", flag: "🇸🇳", note: "The Steven Gerrard slip goal. That night at Stamford Bridge." },
  { name: "Costinha", tier: "Cult", position: "MID", flag: "🇵🇹", note: "Mourinho's '04 Porto hero" },
  { name: "Hernán Crespo", tier: "Cult", position: "FWD", flag: "🇦🇷", note: "Inter/Milan/Chelsea CL nights, big-game forward" },
  { name: "Edinson Cavani", tier: "Cult", position: "FWD", flag: "🇺🇾", note: "PSG's CL ever-present, late winners" },
  { name: "Allan Saint-Maximin", tier: "Cult", position: "FWD", flag: "🇫🇷", note: "Newcastle's '23-24 group-stage menace" },
  { name: "Hakan Şükür", tier: "Wildcard", position: "FWD", flag: "🇹🇷", note: "10.8 seconds, 2002 World Cup" },
  { name: "Dejan Lovren", tier: "Wildcard", position: "DEF", flag: "🇭🇷", note: "Sometimes brilliant, often not" },
  { name: "Park Ji-sung", tier: "Wildcard", position: "MID", flag: "🇰🇷", note: "Big-night man for United in Europe" },
  { name: "Adriano (Inter peak)", tier: "Wildcard", position: "FWD", flag: "🇧🇷", note: "Briefly the best striker alive" },
  { name: "Hatem Ben Arfa", tier: "Wildcard", position: "FWD", flag: "🇫🇷", note: "Will score from the halfway line" },
  { name: "Marko Arnautović", tier: "Wildcard", position: "FWD", flag: "🇦🇹", note: "Bologna's chaos pickup" },
  { name: "Vincent Aboubakar", tier: "Wildcard", position: "FWD", flag: "🇨🇲", note: "Porto's goal-machine, group stage merchant" },
  { name: "Luuk de Jong", tier: "Wildcard", position: "FWD", flag: "🇳🇱", note: "Sevilla's improbable Europa League hero" },
  { name: "Dries Mertens", tier: "Wildcard", position: "MID", flag: "🇧🇪", note: "Napoli's joyful long-range scorer" },
  { name: "Johan Cruyff", tier: "Legend", position: "MID", flag: "🇳🇱", note: "Invented the turn" },
  { name: "Ronaldo Nazário", tier: "Legend", position: "FWD", flag: "🇧🇷", note: "Pre-knee Ronaldo, end of debate" },
  { name: "Garrincha", tier: "Legend", position: "FWD", flag: "🇧🇷", note: "Bent legs, magic feet" },
  { name: "George Best", tier: "Legend", position: "FWD", flag: "🏴󠁧󠁢󠁮󠁩󠁲󠁿", note: "United's original Saturday entertainer" },
  { name: "Stanley Matthews", tier: "Legend", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Played until 50 because crowds demanded it" },
  { name: "Lamine Yamal", tier: "Star", position: "FWD", flag: "🇪🇸", note: "Plays like he's still in the playground" },
  { name: "Khvicha Kvaratskhelia", tier: "Star", position: "FWD", flag: "🇬🇪", note: "Pure joy with the ball" },
  { name: "Mohammed Kudus", tier: "Star", position: "MID", flag: "🇬🇭", note: "Dribbles for the highlight reel" },
  { name: "Cole Palmer", tier: "Star", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The shiver, the goals" },
  { name: "Jamal Musiala", tier: "Star", position: "FWD", flag: "🇩🇪", note: "Glides past defenders" },
  { name: "Florian Wirtz", tier: "Star", position: "MID", flag: "🇩🇪", note: "Leverkusen's silk-touch specialist" },
  { name: "Jay-Jay Okocha", tier: "Cult", position: "MID", flag: "🇳🇬", note: "So good they named him twice" },
  { name: "Abedi Pelé", tier: "Cult", position: "MID", flag: "🇬🇭", note: "Marseille magician" },
  { name: "Riquelme", tier: "Cult", position: "MID", flag: "🇦🇷", note: "Walked everywhere. Ran football." },
  { name: "Pavel Nedvěd", tier: "Cult", position: "MID", flag: "🇨🇿", note: "Long blonde hair, longer shots" },
  { name: "Davor Šuker", tier: "Cult", position: "FWD", flag: "🇭🇷", note: "Croatian magic at France '98" },
  { name: "Adebayo Akinfenwa", tier: "Wildcard", position: "FWD", flag: "🇳🇬", note: "The Beast" },
  { name: "Faustino Asprilla", tier: "Wildcard", position: "FWD", flag: "🇨🇴", note: "Cartwheels and chaos" },
  { name: "Paul Gascoigne", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Genius and pain" },
  { name: "Jens Lehmann", tier: "Wildcard", position: "GK", flag: "🇩🇪", note: "Argued with everyone, even his own bench" },
  { name: "Charlie Austin", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "QPR's natural finisher, throwback joy" },
  { name: "Mauro Camoranesi", tier: "Wildcard", position: "FWD", flag: "🇦🇷", note: "Italian/Argentine flair from full-back" },
  { name: "Rivaldinho", tier: "Wildcard", position: "FWD", flag: "🇧🇷", note: "Brazilian son carrying the flame" },
  { name: "Jermaine Pennant", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Bursts of pure speed and tricks" },
  { name: "Robinho", tier: "Legend", position: "FWD", flag: "🇧🇷", note: "Step-overs invented here" },
  { name: "Romário", tier: "Legend", position: "FWD", flag: "🇧🇷", note: "Didn't run. Never had to." },
  { name: "René Higuita", tier: "Legend", position: "GK", flag: "🇨🇴", note: "Scorpion kick. Goalkeeper." },
  { name: "Hugo Sánchez", tier: "Legend", position: "FWD", flag: "🇲🇽", note: "Bicycle-kick artist, signature backflip" },
  { name: "Neymar", tier: "Star", position: "MID", flag: "🇧🇷", note: "Once nutmegged a man twice" },
  { name: "Ousmane Dembélé", tier: "Star", position: "FWD", flag: "🇫🇷", note: "Two-footed terror" },
  { name: "Raphinha", tier: "Star", position: "FWD", flag: "🇧🇷", note: "Tricks daily" },
  { name: "Adama Traoré", tier: "Cult", position: "FWD", flag: "🇪🇸", note: "Cones go missing when he's running" },
  { name: "Erik Lamela", tier: "Cult", position: "MID", flag: "🇦🇷", note: "Rabona connoisseur" },
  { name: "Adnan Januzaj", tier: "Cult", position: "FWD", flag: "🇧🇪", note: "Briefly the future" },
  { name: "Yannick Bolasie", tier: "Cult", position: "FWD", flag: "🇨🇩", note: "Most flicks per game in the PL" },
  { name: "Joe Cole", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Trickiest English player of his era" },
  { name: "Ricardo Quaresma", tier: "Wildcard", position: "MID", flag: "🇵🇹", note: "Trivela, only ever trivela" },
  { name: "Olivier Giroud", tier: "Wildcard", position: "FWD", flag: "🇫🇷", note: "French aerial menace. Won a Puskás for the scorpion. Won everything." },
  { name: "Wayne Rooney", tier: "Legend", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Stamped on Ricardo Carvalho. Overhead vs City, 2011 — best PL goal ever?" },
  { name: "Helder Postiga", tier: "Wildcard", position: "FWD", flag: "🇵🇹", note: "Portugal winger, all flicks and tricks" },
  { name: "Edgar Davids", tier: "Wildcard", position: "MID", flag: "🇳🇱", note: "Goggles and grace" },
  { name: "Tomáš Rosický", tier: "Wildcard", position: "MID", flag: "🇨🇿", note: "Arsenal's trick midfielder" },
  { name: "Sergio Ramos", tier: "Legend", position: "DEF", flag: "🇪🇸", note: "93rd minute, every time" },
  { name: "Paolo Maldini", tier: "Legend", position: "DEF", flag: "🇮🇹", note: "Saw it all, conceded none of it" },
  { name: "Alessandro Costacurta", tier: "Legend", position: "DEF", flag: "🇮🇹", note: "Milan's quiet leader, 5 CLs" },
  { name: "Marquinhos", tier: "Star", position: "DEF", flag: "🇧🇷", note: "PSG captain, leads from the back" },
  { name: "Carles Puyol", tier: "Cult", position: "DEF", flag: "🇪🇸", note: "Will throw his head at it. Won Spain a World Cup with one header." },
  { name: "Diego Godín", tier: "Cult", position: "DEF", flag: "🇺🇾", note: "Last man, every man" },
  { name: "Gabi", tier: "Cult", position: "MID", flag: "🇪🇸", note: "Atlético captain, Simeone's general" },
  { name: "Xabi Alonso", tier: "Cult", position: "MID", flag: "🇪🇸", note: "Istanbul. Calmest 35 minutes of his life." },
  { name: "Fernando Hierro", tier: "Cult", position: "DEF", flag: "🇪🇸", note: "Real Madrid's three-CL captain" },
  { name: "Dietmar Hamann", tier: "Cult", position: "MID", flag: "🇩🇪", note: "Half-time sub vs Milan. Changed history." },
  { name: "Daniele De Rossi", tier: "Cult", position: "MID", flag: "🇮🇹", note: "Roma forever, captain through everything" },
  { name: "Vidal", tier: "Wildcard", position: "MID", flag: "🇨🇱", note: "Mohawk, no fear" },
  { name: "Pepe", tier: "Wildcard", position: "DEF", flag: "🇵🇹", note: "Will get sent off, but you'll go down swinging" },
  { name: "Jamie Carragher", tier: "Wildcard", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Istanbul. Every tackle, every block." },
  { name: "Marco Materazzi", tier: "Wildcard", position: "DEF", flag: "🇮🇹", note: "Won an Inter treble being the heart of it" },
  { name: "Bryan Robson", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Captain Marvel — broken bones, kept going" },
  { name: "Roberto Mancini (player)", tier: "Wildcard", position: "MID", flag: "🇮🇹", note: "Sampdoria captain, comeback merchant" },
  { name: "Vinnie Jones", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Three-second yellow" },
  { name: "Graeme Souness", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Planted a flag in the centre circle once" },
  { name: "Gennaro Gattuso", tier: "Legend", position: "MID", flag: "🇮🇹", note: "All teeth, all fight" },
  { name: "Andoni Goikoetxea", tier: "Legend", position: "DEF", flag: "🇪🇸", note: "The Butcher of Bilbao" },
  { name: "Claudio Gentile", tier: "Legend", position: "DEF", flag: "🇮🇹", note: "Marked Maradona out of '82" },
  { name: "Billy Bremner", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Leeds '70s captain, never lost a tunnel" },
  { name: "Diego Costa", tier: "Star", position: "FWD", flag: "🇪🇸", note: "Stamps optional" },
  { name: "Granit Xhaka", tier: "Star", position: "MID", flag: "🇨🇭", note: "Wears red on purpose" },
  { name: "Casemiro", tier: "Star", position: "MID", flag: "🇧🇷", note: "All elbows, all the time" },
  { name: "Antonio Rüdiger", tier: "Star", position: "DEF", flag: "🇩🇪", note: "Will smile while doing it" },
  { name: "João Cancelo", tier: "Star", position: "DEF", flag: "🇵🇹", note: "Will start something, finish nothing" },
  { name: "Saúl Ñíguez", tier: "Star", position: "MID", flag: "🇪🇸", note: "Atlético hard-man, smiling through" },
  { name: "Jérémy Toulalan", tier: "Star", position: "MID", flag: "🇫🇷", note: "Lyon enforcer of his era" },
  { name: "Pierre-Emile Højbjerg", tier: "Star", position: "MID", flag: "🇩🇰", note: "Tottenham's enforcer, fights the ref too" },
  { name: "Joey Barton", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "On and off the pitch" },
  { name: "Lee Cattermole", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sunderland's own" },
  { name: "Nigel de Jong", tier: "Cult", position: "MID", flag: "🇳🇱", note: "Karate kick to the chest" },
  { name: "Robbie Savage", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Career wind-up merchant" },
  { name: "Paul Ince", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The Guv'nor. United's enforcer." },
  { name: "Massimo Ambrosini", tier: "Cult", position: "MID", flag: "🇮🇹", note: "Milan captain, would scrap" },
  { name: "Felipe Melo", tier: "Cult", position: "MID", flag: "🇧🇷", note: "Half tricks, half red cards" },
  { name: "Lee Bowyer", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Fought his own teammate" },
  { name: "Duncan Ferguson", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Did time for headbutting" },
  { name: "Mark Hughes", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Built like a bouncer" },
  { name: "Kevin Muscat", tier: "Wildcard", position: "MID", flag: "🇦🇺", note: "Most-banned man in Australian football" },
  { name: "Robbie Fowler", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Cocaine line celebration. Mad lad." },
  { name: "Mido", tier: "Wildcard", position: "FWD", flag: "🇪🇬", note: "Threw boots at his own teammate" },
  { name: "El Hadji Diouf", tier: "Wildcard", position: "FWD", flag: "🇸🇳", note: "Spat at fans. Multiple times." },
  { name: "Ben Thatcher", tier: "Wildcard", position: "DEF", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "One of the worst tackles in PL history" },
  { name: "Romelu Lukaku", tier: "Star", position: "FWD", flag: "🇧🇪", note: "Chest-first into defenders" },
  { name: "Luis Suárez", tier: "Wildcard", position: "FWD", flag: "🇺🇾", note: "Three biting incidents. Career banned twice." },
  { name: "Mark van Bommel", tier: "Wildcard", position: "MID", flag: "🇳🇱", note: "Holland 2010 final. Hatchet job." },
  { name: "Marlon King", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Banned for assault, mid-career" },
  { name: "Andre Onana", tier: "Wildcard", position: "GK", flag: "🇨🇲", note: "Hot-tempered keeper, pre-meditated theatrics" },
  { name: "Marcel Desailly", tier: "Legend", position: "DEF", flag: "🇫🇷", note: "Towering presence, '98 final scorer" },
  { name: "Ibrahima Konaté", tier: "Star", position: "DEF", flag: "🇫🇷", note: "Liverpool's aerial monster" },
  { name: "Cristian Romero", tier: "Star", position: "DEF", flag: "🇦🇷", note: "Argentina/Spurs CB, won the World Cup" },
  { name: "Ben Mee", tier: "Star", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Burnley/Brentford set-piece warrior" },
  { name: "Rio Ferdinand", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Always rises late" },
  { name: "Ricardo Carvalho", tier: "Cult", position: "DEF", flag: "🇵🇹", note: "Mourinho corner specialist" },
  { name: "Christopher Samba", tier: "Cult", position: "DEF", flag: "🇨🇬", note: "Massive frame, all corner goals" },
  { name: "Jan Vertonghen", tier: "Cult", position: "DEF", flag: "🇧🇪", note: "Defender, scored every type of header" },
  { name: "Jimmy Glass", tier: "Wildcard", position: "GK", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Carlisle's keeper. 95th min. Saved them." },
  { name: "Tim Howard", tier: "Wildcard", position: "GK", flag: "🇺🇸", note: "Scored from his own box" },
  { name: "Asmir Begović", tier: "Wildcard", position: "GK", flag: "🇧🇦", note: "Scored after 13 seconds for Stoke" },
  { name: "Brad Friedel", tier: "Wildcard", position: "GK", flag: "🇺🇸", note: "Goalkeeper goal scorer" },
  { name: "Petr Čech", tier: "Wildcard", position: "GK", flag: "🇨🇿", note: "Came up for a corner once. We remember." },
  { name: "Andy Carroll", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "6'4. Whole career was corners." },
  { name: "Christian Benteke", tier: "Wildcard", position: "FWD", flag: "🇧🇪", note: "Aerial specialist, set-piece scorer" },
  { name: "Aleksandar Mitrović", tier: "Wildcard", position: "FWD", flag: "🇷🇸", note: "Pure unmovable striker" },
  { name: "Wesley Sneijder", tier: "Cult", position: "MID", flag: "🇳🇱", note: "2010: nearly won a treble single-handed" },
  { name: "Arjen Robben", tier: "Cult", position: "MID", flag: "🇳🇱", note: "You know what's coming. Can't stop it." },
  { name: "Andrea Belotti", tier: "Cult", position: "FWD", flag: "🇮🇹", note: "Italy's clutch finisher" },
  { name: "Mario Götze (2014)", tier: "Cult", position: "MID", flag: "🇩🇪", note: "Won Germany the World Cup, off the bench" },
  { name: "Sylvain Wiltord", tier: "Cult", position: "FWD", flag: "🇫🇷", note: "Equalised in stoppage time, '00 final" },
  { name: "Ole Gunnar Solskjær", tier: "Wildcard", position: "FWD", flag: "🇳🇴", note: "Off the bench. 93rd minute. Treble." },
  { name: "Eder", tier: "Wildcard", position: "FWD", flag: "🇵🇹", note: "Won Portugal a Euros final from the bench. Beat France in their backyard." },
  { name: "Mario Mandžukić", tier: "Wildcard", position: "FWD", flag: "🇭🇷", note: "Croatia's relentless final-goal man" },
  { name: "Marek Hamšík", tier: "Wildcard", position: "MID", flag: "🇸🇰", note: "Slovakia captain, clutch finisher" },
  { name: "Cesc Fàbregas", tier: "Wildcard", position: "MID", flag: "🇪🇸", note: "Late assists, late goals" },
  { name: "Sócrates", tier: "Legend", position: "MID", flag: "🇧🇷", note: "Smoked at half-time, danced through the second" },
  { name: "Falcão", tier: "Legend", position: "FWD", flag: "🇧🇷", note: "Actual beach football world champion" },
  { name: "Jeremy Doku", tier: "Star", position: "FWD", flag: "🇧🇪", note: "Dribbles for the love of it" },
  { name: "Jorge Campos", tier: "Wildcard", position: "GK", flag: "🇲🇽", note: "Goalkeeper-striker. Loudest shirts in football." },
  { name: "Carlos Valderrama", tier: "Wildcard", position: "MID", flag: "🇨🇴", note: "The hair, the slow walk, the perfect ball" },
  { name: "Hristo Stoichkov", tier: "Wildcard", position: "FWD", flag: "🇧🇬", note: "Bulgarian fire in flip-flops" },
  { name: "Tomas Brolin", tier: "Wildcard", position: "FWD", flag: "🇸🇪", note: "Retired early to enjoy life. Pure beach." },
  { name: "Gerd Müller", tier: "Legend", position: "FWD", flag: "🇩🇪", note: "365 Bundesliga goals" },
  { name: "Eusébio", tier: "Legend", position: "FWD", flag: "🇵🇹", note: "9 goals in a single World Cup" },
  { name: "Jermain Defoe", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "162 PL goals across four clubs" },
  { name: "Michael Owen", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pace and finish, Liverpool/Real" },
  { name: "Dwight Yorke", tier: "Wildcard", position: "FWD", flag: "🇹🇹", note: "United '99 — goals AND smiles" },
  { name: "James Maddison", tier: "Star", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Set-piece quality, big-game taker" },
  { name: "Ollie Watkins", tier: "Star", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came up from below, knows the grit" },
  { name: "Ivan Toney", tier: "Star", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Came through lower leagues, takes the pressure" },
  { name: "Kevin Nolan", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Box-to-box midfield grafter" },
  { name: "Glenn Murray", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Brighton's promotion-clinching workhorse" },
  { name: "Peter Odemwingie", tier: "Wildcard", position: "FWD", flag: "🇳🇬", note: "Drove to QPR, scored everywhere else" },
  { name: "Kevin Davies", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Most fouls in PL history. By a mile." },
  { name: "Steven Fletcher", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Sunderland's relegation-survival man" },
  { name: "Brett Emerton", tier: "Wildcard", position: "FWD", flag: "🇦🇺", note: "Bolton workhorse, Premier League grafter" },
  { name: "Connor Wickham", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sunderland's survival hero, '14" },
  { name: "Franz Beckenbauer", tier: "Legend", position: "DEF", flag: "🇩🇪", note: "Der Kaiser. Authority personified." },
  { name: "Marco Tardelli", tier: "Legend", position: "MID", flag: "🇮🇹", note: "Italia '82 winner, captain energy" },
  { name: "Luis Figo", tier: "Legend", position: "MID", flag: "🇵🇹", note: "Real Madrid's quiet authority" },
  { name: "Fabio Cannavaro", tier: "Legend", position: "DEF", flag: "🇮🇹", note: "'06 World Cup-winning captain" },
  { name: "Iker Casillas", tier: "Cult", position: "GK", flag: "🇪🇸", note: "Spain's quiet captain through everything" },
  { name: "Daniel Agger", tier: "Cult", position: "DEF", flag: "🇩🇰", note: "Liverpool's hardman with a brain" },
  { name: "Martin Keown", tier: "Cult", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Arsenal Invincibles enforcer" },
  { name: "Edwin van der Sar", tier: "Wildcard", position: "GK", flag: "🇳🇱", note: "Senior pro, calm voice from the back" },
  { name: "Lucio", tier: "Wildcard", position: "DEF", flag: "🇧🇷", note: "Inter's 2010 treble captain. Authority without volume." },
  { name: "Pep Guardiola (player)", tier: "Wildcard", position: "MID", flag: "🇪🇸", note: "Captain's captain at Barça" },
  { name: "Franco Baresi", tier: "Legend", position: "DEF", flag: "🇮🇹", note: "Won 3 CLs as a defender, one-leg merchant" },
  { name: "Diego Simeone", tier: "Cult", position: "MID", flag: "🇦🇷", note: "Pre-management. Won the ball through arguments. Most uncomfortable opponent." },
  { name: "Nicolás Otamendi", tier: "Cult", position: "DEF", flag: "🇦🇷", note: "Argentine cunning, dirty when needed" },
  { name: "Nemanja Matić", tier: "Cult", position: "MID", flag: "🇷🇸", note: "Slows games down, frustrates better teams" },
  { name: "Rui Costa", tier: "Cult", position: "MID", flag: "🇵🇹", note: "Portuguese magic, big-game player" },
  { name: "Dirk Kuyt", tier: "Wildcard", position: "FWD", flag: "🇳🇱", note: "Workrate of three players" },
  { name: "Wissam Ben Yedder", tier: "Wildcard", position: "FWD", flag: "🇫🇷", note: "Sevilla's CL late-goal machine" },
  { name: "Xavi Hernández", tier: "Legend", position: "MID", flag: "🇪🇸", note: "The man who made Spain" },
  { name: "Dennis Bergkamp", tier: "Legend", position: "FWD", flag: "🇳🇱", note: "Touch and vision, every time" },
  { name: "Ferenc Puskás", tier: "Legend", position: "FWD", flag: "🇭🇺", note: "Hungary's '50s genius, the original" },
  { name: "Pedri", tier: "Star", position: "MID", flag: "🇪🇸", note: "Heir to Iniesta's throne" },
  { name: "Sergio Busquets", tier: "Cult", position: "MID", flag: "🇪🇸", note: "First touch out, second touch decisive" },
  { name: "David Silva", tier: "Cult", position: "MID", flag: "🇪🇸", note: "Made City flow for a decade" },
  { name: "Mesut Özil", tier: "Cult", position: "MID", flag: "🇩🇪", note: "Most assists per game in PL history" },
  { name: "Adam Lallana", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's quiet artist on the ball" },
  { name: "Joshua Kimmich", tier: "Wildcard", position: "MID", flag: "🇩🇪", note: "Ranged passing from the right back" },
  { name: "Thiago Alcântara", tier: "Wildcard", position: "MID", flag: "🇪🇸", note: "Spin-and-find specialist" },
  { name: "Marco Verratti", tier: "Wildcard", position: "MID", flag: "🇮🇹", note: "Shortest player on the pitch, longest pass" },
  { name: "Bernardo Silva", tier: "Wildcard", position: "MID", flag: "🇵🇹", note: "Tight-space genius" },
  { name: "Ilkay Gündoğan", tier: "Wildcard", position: "MID", flag: "🇩🇪", note: "Late-arriving box maestro" },
  { name: "Craig Bellamy", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Famous for arguments with refs and teammates" },
  { name: "Ashley Williams", tier: "Wildcard", position: "DEF", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Wales' captain, constant complainer" },
  { name: "Luka Modrić", tier: "Cult", position: "MID", flag: "🇭🇷", note: "Spine of Real's three-peat" },
  { name: "Manuel Neuer", tier: "Cult", position: "GK", flag: "🇩🇪", note: "Bayern's 2013 and 2020 winner" },
  { name: "Rafael Marquez", tier: "Cult", position: "DEF", flag: "🇲🇽", note: "Barça's quiet CL spine, '06 winner" },
  { name: "Diego Milito", tier: "Wildcard", position: "FWD", flag: "🇦🇷", note: "Both goals in Inter's 2010 final" },
  { name: "Bobby Charlton", tier: "Legend", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England's cathedral. Quietest leader ever." },
  { name: "Dunga", tier: "Wildcard", position: "MID", flag: "🇧🇷", note: "Brazil '94 captain, hardest gaze in football" },
  { name: "Samuel Eto'o", tier: "Cult", position: "FWD", flag: "🇨🇲", note: "Multiple CL counter-attack goals" },
  { name: "Robin van Persie", tier: "Cult", position: "FWD", flag: "🇳🇱", note: "Sharp left foot in space" },
  { name: "Nicolas Anelka", tier: "Cult", position: "FWD", flag: "🇫🇷", note: "Pace and finish, every club" },
  { name: "Theo Walcott", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pace and nothing else. But the pace was incredible." },
  { name: "Antonio Valencia", tier: "Wildcard", position: "DEF", flag: "🇪🇨", note: "United's right-side destroyer" },
  { name: "Ashley Young", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Pace then crosses, 15 years of it" },
  { name: "Daniel Sturridge", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's counter-attack finisher" },
  { name: "Alphonso Davies", tier: "Wildcard", position: "DEF", flag: "🇨🇦", note: "Fastest player in football, plays left back" },
  { name: "Antoine Griezmann", tier: "Star", position: "FWD", flag: "🇫🇷", note: "The Hotline Bling dance, Drake-inspired" },
  { name: "Robbie Keane", tier: "Cult", position: "FWD", flag: "🇮🇪", note: "Cartwheel into a roll, every time" },
  { name: "Fabrizio Ravanelli", tier: "Cult", position: "FWD", flag: "🇮🇹", note: "Shirt over head, every goal" },
  { name: "Roger Milla", tier: "Cult", position: "FWD", flag: "🇨🇲", note: "Corner-flag dance, '90 World Cup" },
  { name: "Bebeto", tier: "Cult", position: "FWD", flag: "🇧🇷", note: "Baby-rocking. The original meme celebration." },
  { name: "Jimmy Bullard", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Re-enacted Phil Brown's half-time team-talk" },
  { name: "Emmanuel Adebayor", tier: "Cult", position: "FWD", flag: "🇹🇬", note: "Sprinted full pitch to celebrate at Arsenal end" },
  { name: "Lomana LuaLua", tier: "Cult", position: "FWD", flag: "🇨🇩", note: "Triple-flip celebration, every single time" },
  { name: "Jürgen Klinsmann", tier: "Wildcard", position: "FWD", flag: "🇩🇪", note: "Swallow-dive after his Spurs debut goal" },
  { name: "Lee Sharpe", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Corner-flag Elvis routine" },
  { name: "Lucas Moura", tier: "Wildcard", position: "MID", flag: "🇧🇷", note: "Knee-slide, shirt off, full passion" },
  { name: "Aymeric Laporte", tier: "Wildcard", position: "DEF", flag: "🇪🇸", note: "The chair-sit at City" },
  { name: "Dele Alli", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "The hand-eye trick celebration" },
  { name: "Gareth Barry", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Most PL appearances ever (653)" },
  { name: "Jordan Henderson", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Liverpool's boxing-day captain" },
  { name: "Michael Carrick", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Five PL titles, never missed a Christmas" },
  { name: "Stewart Downing", tier: "Cult", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Middlesbrough/Liverpool/Villa, never injured" },
  { name: "Aaron Hughes", tier: "Wildcard", position: "DEF", flag: "🇬🇧", note: "PL ever-present for half a decade" },
  { name: "Cesar Azpilicueta", tier: "Wildcard", position: "DEF", flag: "🇪🇸", note: "Chelsea's right-back, left-back, centre-back — every game" },
  { name: "John O'Shea", tier: "Wildcard", position: "DEF", flag: "🇮🇪", note: "United utility man, played every position" },
  { name: "Joleon Lescott", tier: "Wildcard", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Won the league with City, never injured" },
  { name: "Tony Hibbert", tier: "Wildcard", position: "DEF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton's never-leaves right back" },
  { name: "David Unsworth", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Everton's PL grafter through three eras" },
  { name: "Kasper Schmeichel", tier: "Wildcard", position: "GK", flag: "🇩🇰", note: "Leicester ever-present, won the league" },
  { name: "Alessandro Nesta", tier: "Legend", position: "DEF", flag: "🇮🇹", note: "Italy's most graceful defender ever" },
  { name: "Thibaut Courtois", tier: "Star", position: "GK", flag: "🇧🇪", note: "Real Madrid's CL-final saviour" },
  { name: "Giorgio Chiellini", tier: "Wildcard", position: "DEF", flag: "🇮🇹", note: "Italian centre-back template" },
  { name: "Jérôme Boateng", tier: "Wildcard", position: "DEF", flag: "🇩🇪", note: "Bayern's '13 treble winner" },
  { name: "Mats Hummels", tier: "Wildcard", position: "DEF", flag: "🇩🇪", note: "Germany's '14 World Cup-winning back-line" },
  { name: "Olof Mellberg", tier: "Cult", position: "DEF", flag: "🇸🇪", note: "Aston Villa's direct-corner specialist" },
  { name: "Asier Illarramendi", tier: "Cult", position: "MID", flag: "🇪🇸", note: "Real Sociedad's set-piece artist" },
  { name: "Aleksandar Kolarov", tier: "Cult", position: "DEF", flag: "🇷🇸", note: "Serbian thunder, Roma free-kick man" },
  { name: "David Luiz", tier: "Wildcard", position: "DEF", flag: "🇧🇷", note: "Direct corner for Brazil — yes really" },
  { name: "Andros Townsend", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Range from anywhere on his right foot" },
  { name: "Dani Alves", tier: "Legend", position: "DEF", flag: "🇧🇷", note: "Right-back as fourth attacker" },
  { name: "Achraf Hakimi", tier: "Star", position: "DEF", flag: "🇲🇦", note: "Best attacking full-back, leaks at the back" },
  { name: "Marcelo", tier: "Cult", position: "DEF", flag: "🇧🇷", note: "Brazilian left-back, attacking energy only" },
  { name: "Fernando Torres", tier: "Wildcard", position: "FWD", flag: "🇪🇸", note: "Will score AND miss an open goal" },
  { name: "Jorginho", tier: "Star", position: "MID", flag: "🇮🇹", note: "Hop-step penalty technique, near-perfect record" },
  { name: "Matt Le Tissier", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Southampton, free-kick king, never missed a pen" },
  { name: "Rickie Lambert", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Highest PL penalty conversion rate" },
  { name: "Sebastian Larsson", tier: "Wildcard", position: "MID", flag: "🇸🇪", note: "Sweden's go-to spot-kick man" },
  { name: "Patrice Evra", tier: "Cult", position: "DEF", flag: "🇫🇷", note: "Manchester derby legend" },
  { name: "Kevin Keegan", tier: "Legend", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "England, Newcastle, Liverpool — knew every level" },
  { name: "Dominic Calvert-Lewin", tier: "Star", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Aerial threat, knows the pressure" },
  { name: "Adam Le Fondre", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Reading and Bolton goal-machine" },
  { name: "Billy Sharp", tier: "Cult", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Sheffield United's perpetual top scorer" },
  { name: "Kevin Phillips", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Crystal Palace play-off final winner, 2013" },
  { name: "Ross McCormack", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", note: "Fulham/Leeds Championship goal-machine" },
  { name: "Bobby Zamora", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "QPR's 90+1 play-off final winner, 2014" },
  { name: "Sam Vokes", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", note: "Burnley's promotion ever-present" },
  { name: "Dwight Gayle", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Newcastle's Championship goal-machine" },
  { name: "Britt Assombalonga", tier: "Wildcard", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Forest/Boro Championship hero" },
  { name: "Marlon Pack", tier: "Wildcard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", note: "Bristol City Championship workhorse" },
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

// Generate 3 draft rounds, each with 2 cards.
//
// Selection logic (chaos-driven, post-pool-expansion):
//  - 75% of games: 1 random Legend + 5 random from the non-Legend pool (Stars + Cults + Wildcards)
//  - 25% of games: 6 random from the non-Legend pool (no Legend)
//  - Within the non-Legend draws: pure random — no quotas. Could be 5 Cults, could be 3 Wildcards 2 Stars, anything.
// The 6 selected players are then randomly paired into 3 rounds of 2.
const generateDraft = (excludeNames = []) => {
  const available = PLAYER_POOL.filter(p => !excludeNames.includes(p.name));
  const legends = available.filter(p => p.tier === "Legend");
  const nonLegends = available.filter(p => p.tier !== "Legend");

  // Decide whether this game gets a Legend (75% yes, 25% no).
  // Edge case: if no Legends are available (e.g. all excluded), force 0-Legend mode.
  const includeLegend = legends.length > 0 && Math.random() < 0.75;

  let selected = [];
  if (includeLegend) {
    // 1 random Legend + 5 random non-Legends
    selected.push(shuffle(legends)[0]);
    selected = selected.concat(shuffle(nonLegends).slice(0, 5));
  } else {
    // 0 Legends, 6 random non-Legends
    selected = shuffle(nonLegends).slice(0, 6);
  }

  // Safety: if we somehow got fewer than 6 (very small pool / heavy exclusions),
  // top up from anything available so we never return malformed rounds.
  if (selected.length < 6) {
    const remaining = available.filter(p => !selected.includes(p));
    selected = selected.concat(shuffle(remaining).slice(0, 6 - selected.length));
  }

  // Random pairing into 3 rounds of 2.
  // GK rule is enforced at the PICK step (cards get disabled if the player
  // has already picked a keeper), not here — so the draft itself is free chaos.
  const paired = shuffle(selected);
  return [
    [paired[0], paired[1]],
    [paired[2], paired[3]],
    [paired[4], paired[5]]
  ];
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
The user picks 3 players for a football debate question and writes a short argument (up to 300 characters — usually 1-3 sentences) defending their squad. You score the argument out of 10 and deliver a verdict.

THE 10-POINT SCORE — use the FULL range. 9s and 10s are achievable and you should reward them when earned:

- 10: A near-perfect answer. The squad is genuinely brilliant for the question AND the argument is sharp, original, and reveals real football thinking. You should hand out a 10 maybe once in twenty arguments. Rare but achievable.
- 9: Excellent on both axes. Strong squad with at least one inspired pick, plus a defence that surprises you or makes you nod. You should hand out a 9 when an argument genuinely impresses you — not "the default for good" but "the player has clearly thought about this."
- 8: Very good. Solid squad, well-argued. The argument has at least one specific insight rather than just listing players.
- 7: Good. The squad makes sense, the defence is competent. Most well-prepared answers land here.
- 5-6: Reasonable but flawed. Either the squad is generic or the argument is thin. The default for an average answer.
- 3-4: Lazy, generic, contradictory, or full of holes. "These are great players" energy.
- 1-2: Terrible. Comically bad picks, no argument, or actively self-defeating logic.

CRITICAL: Do NOT default to 7 or 8 for everything decent. Reserve 7 for "good," save 8 for "very good," and actively hand out 9s when someone gives you something sharp. A user who delivers a clever, specific argument backed by inspired picks should get 9. A user whose argument genuinely makes you reconsider something should get 10.

The score reflects BOTH the squad picks AND how well the argument defends them. A good argument can save a weird squad. A weak argument pulls down a great squad.

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
Two players have each picked a 3-player squad and written a short argument defending their choice. Your job is to:
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

The score reflects BOTH the squad picks AND the argument quality. Reward arguments that directly counter the opponent's squad.

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

// ============ TOURNAMENT MODE — FOUNDATIONS (v2 — trio-based) ============
// Pure plumbing. Defines:
//   - Tournament window: 11 June – 19 July 2026.
//   - getTournamentStatus(date) — returns trio number, days-until-next-trio, locked-out state.
//     Each tournament attempt = three rounds in one sitting (Pub Mate → Statistician → Pete).
//     Same trio of questions runs for 3 consecutive days, then rotates.
//   - Beta gate (?beta=pete) — hides tournament UI from anyone without the flag.
//   - Debug overrides — for testing without waiting for real dates.
//   - readTournamentState / writeTournamentState — localStorage helpers (namespace kick3_tournament_v1).

const TOURNAMENT_CONFIG = {
  startDate: '2026-06-11',  // Day 1 of Trio 1
  endDate:   '2026-07-19',  // Last day of the window (World Cup final day)
  daysPerTrio: 3,           // Same trio runs for 3 consecutive days, then rotates
  storageKey: 'kick3_tournament_v1',
  betaParam: 'pete',
};

// Parse 'YYYY-MM-DD' into a Date anchored at UTC noon (DST-safe day comparison).
const parseTournamentDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
};

// Days between two dates (calendar days, ignoring time-of-day).
const daysBetween = (from, to) => {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// Today's date as a YYYY-MM-DD string. Used as the lastPlayedDate key.
const todayDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Given a Date, return tournament status:
//   - null if outside the tournament window
//   - { trioNumber, dayInTrio, totalTrios } if inside the window
//     trioNumber: 1-based (Trio 1 starts on startDate, runs for 3 days, then Trio 2 begins).
//     dayInTrio:  1, 2, or 3 (which of the 3 days within this trio it is).
//     totalTrios: count of trios across the entire window.
const getTournamentStatus = (date) => {
  const start = parseTournamentDate(TOURNAMENT_CONFIG.startDate);
  const end   = parseTournamentDate(TOURNAMENT_CONFIG.endDate);
  const dayAnchor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  if (dayAnchor < start || dayAnchor > end) return null;
  const offset = daysBetween(start, dayAnchor);
  const trioNumber = Math.floor(offset / TOURNAMENT_CONFIG.daysPerTrio) + 1;
  const dayInTrio  = (offset % TOURNAMENT_CONFIG.daysPerTrio) + 1;
  const totalTrios = Math.ceil((daysBetween(start, end) + 1) / TOURNAMENT_CONFIG.daysPerTrio);
  return { trioNumber, dayInTrio, totalTrios };
};

// Read beta flag from URL (?beta=pete) or localStorage.
// On first visit with the URL param, persist to localStorage so the flag survives navigation.
// To turn off: visit ?beta=off (clears the flag).
const isTournamentBetaActive = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const betaParam = params.get('beta');
    if (betaParam === 'off') {
      localStorage.removeItem('kick3_tournament_beta');
      return false;
    }
    if (betaParam === TOURNAMENT_CONFIG.betaParam) {
      localStorage.setItem('kick3_tournament_beta', '1');
      return true;
    }
    return localStorage.getItem('kick3_tournament_beta') === '1';
  } catch {
    return false;
  }
};

// Debug overrides — let us test tournament states without waiting for real dates.
// Usage:
//   ?debug=tournament-unlock   → force the PLAY NOW button to be available (skip lockout)
//   ?debug=tournament-locked   → force the locked-out countdown view (just played)
// Returns 'unlock' | 'locked' | null.
const getTournamentDebugMode = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const debug = params.get('debug');
    if (debug === 'tournament-unlock') return 'unlock';
    if (debug === 'tournament-locked') return 'locked';
    return null;
  } catch {
    return null;
  }
};

// Default tournament state for a player who has never attempted a tournament.
const defaultTournamentState = () => ({
  lastPlayedDate: null,         // YYYY-MM-DD of last attempted tournament
  lastAttemptResult: null,      // 'won' | 'lost-r1' | 'lost-r2' | 'lost-r3' | null
  trophyCount: 0,               // Lifetime trophies (Pete wins)
  tournamentsAttempted: 0,      // Lifetime count of attempts started
  tournamentsCompleted: 0,      // Lifetime count of attempts that reached Round 3 (win or loss)
});

// Read tournament state from localStorage. Falls back to defaults on any failure.
const readTournamentState = () => {
  try {
    const raw = localStorage.getItem(TOURNAMENT_CONFIG.storageKey);
    if (!raw) return defaultTournamentState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultTournamentState();
    return { ...defaultTournamentState(), ...parsed };
  } catch {
    return defaultTournamentState();
  }
};

// Write tournament state to localStorage. Silent on failure — game still works without persistence.
const writeTournamentState = (state) => {
  try {
    localStorage.setItem(TOURNAMENT_CONFIG.storageKey, JSON.stringify(state));
  } catch { /* silent */ }
};

// Has the player already attempted today's tournament? Returns true/false.
// Used to gate the PLAY NOW button on the tournament home screen.
const hasPlayedTournamentToday = (state, date = new Date()) => {
  if (!state || !state.lastPlayedDate) return false;
  return state.lastPlayedDate === todayDateString(date);
};

// ============ END TOURNAMENT MODE — FOUNDATIONS ============

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
  const statsCardRef = useRef(null);
  const recordCardRef = useRef(null);

  // Share state — shows feedback in the share button.
  const [shareState, setShareState] = useState('idle'); // 'idle' | 'working' | 'shared' | 'copied' | 'error'

  // ============ TOURNAMENT MODE — BETA GATE ============
  // tournamentBetaActive is true if ?beta=pete is (or was) in the URL.
  // When true, the green TOURNAMENT MODE button is rendered on the home screen.
  // When false, the button is not rendered — invisible to anyone without the flag.
  // Evaluated once on mount; URL changes don't re-evaluate (refresh to toggle).
  const [tournamentBetaActive] = useState(() => {
    try { return isTournamentBetaActive(); } catch { return false; }
  });

  // ============ STREAK LOGIC ============
  // Three values persisted to localStorage:
  //   kick3_streak_current — current consecutive-day streak
  //   kick3_streak_best    — highest streak ever achieved
  //   kick3_streak_last_day — TODAYS_QUESTION.number of the last completed verdict
  // Streak only updates when a verdict is recorded (recordStreak() called).
  const readStreakFromStorage = () => {
    try {
      return {
        current: parseInt(localStorage.getItem('kick3_streak_current') || '0', 10) || 0,
        best:    parseInt(localStorage.getItem('kick3_streak_best')    || '0', 10) || 0,
        lastDay: parseInt(localStorage.getItem('kick3_streak_last_day')|| '0', 10) || 0,
      };
    } catch {
      // localStorage can throw in private mode / disabled storage
      return { current: 0, best: 0, lastDay: 0 };
    }
  };
  const [streak, setStreak] = useState(readStreakFromStorage);
  // Tracks whether the player just hit a new personal best on the most recent verdict.
  // Stored separately so we only show "NEW PERSONAL BEST" once per verdict.
  const [isPersonalBest, setIsPersonalBest] = useState(false);

  // Call when a verdict (solo or h2h) is successfully delivered.
  // Idempotent — calling multiple times for the same day's question is a no-op.
  const recordStreak = () => {
    try {
      const today = TODAYS_QUESTION.number;
      const prev = readStreakFromStorage();
      // Already recorded today — no change.
      if (prev.lastDay === today) return;
      // Consecutive day → +1. Otherwise → reset to 1.
      const newCurrent = (prev.lastDay === today - 1) ? prev.current + 1 : 1;
      const newBest = Math.max(prev.best, newCurrent);
      const beatBest = newCurrent > prev.best && prev.best > 0;
      localStorage.setItem('kick3_streak_current', String(newCurrent));
      localStorage.setItem('kick3_streak_best',    String(newBest));
      localStorage.setItem('kick3_streak_last_day',String(today));
      setStreak({ current: newCurrent, best: newBest, lastDay: today });
      setIsPersonalBest(beatBest);
    } catch {
      // Storage unavailable — silently skip. Game still works.
    }
  };

  // ============ DAILY PLAY LIMIT (3 solo + 3 1v1 per day) ============
  // Counters reset automatically when TODAYS_QUESTION.number advances.
  // localStorage keys:
  //   kick3_solo_plays — count of solo plays today
  //   kick3_h2h_plays  — count of 1v1 plays today
  //   kick3_plays_day  — the question.number these counters apply to
  const MAX_PLAYS_PER_DAY = 3;
  const readPlaysFromStorage = () => {
    try {
      const today = TODAYS_QUESTION.number;
      const storedDay = parseInt(localStorage.getItem('kick3_plays_day') || '0', 10) || 0;
      // If the day has rolled over, counters are effectively zero for today.
      if (storedDay !== today) return { solo: 0, h2h: 0, day: today };
      return {
        solo: parseInt(localStorage.getItem('kick3_solo_plays') || '0', 10) || 0,
        h2h:  parseInt(localStorage.getItem('kick3_h2h_plays')  || '0', 10) || 0,
        day:  storedDay,
      };
    } catch {
      return { solo: 0, h2h: 0, day: TODAYS_QUESTION.number };
    }
  };
  const [plays, setPlays] = useState(readPlaysFromStorage);

  const recordPlay = (kind /* 'solo' | 'h2h' */) => {
    try {
      const today = TODAYS_QUESTION.number;
      const prev = readPlaysFromStorage();
      // If day rolled over since last play, reset both counters first
      const baseSolo = prev.day === today ? prev.solo : 0;
      const baseH2h  = prev.day === today ? prev.h2h  : 0;
      const newSolo = kind === 'solo' ? baseSolo + 1 : baseSolo;
      const newH2h  = kind === 'h2h'  ? baseH2h  + 1 : baseH2h;
      localStorage.setItem('kick3_solo_plays', String(newSolo));
      localStorage.setItem('kick3_h2h_plays',  String(newH2h));
      localStorage.setItem('kick3_plays_day',  String(today));
      setPlays({ solo: newSolo, h2h: newH2h, day: today });
    } catch { /* silent */ }
  };

  const soloLocked = plays.solo >= MAX_PLAYS_PER_DAY;
  const h2hLocked  = plays.h2h  >= MAX_PLAYS_PER_DAY;

  // ============ SCORE DISTRIBUTION STATS ============
  // Lifetime tally of how many of each score (1-10) the player has earned.
  // Stored as a JSON object: { "1": 0, "2": 1, ..., "10": 3 }.
  const readScoreStatsFromStorage = () => {
    try {
      const raw = localStorage.getItem('kick3_score_counts');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      return {};
    }
  };
  const [scoreStats, setScoreStats] = useState(readScoreStatsFromStorage);

  const recordScore = (score) => {
    const s = Math.max(1, Math.min(10, Math.round(score || 0)));
    if (!s) return;
    try {
      const prev = readScoreStatsFromStorage();
      const next = { ...prev, [s]: (prev[s] || 0) + 1 };
      localStorage.setItem('kick3_score_counts', JSON.stringify(next));
      setScoreStats(next);
    } catch { /* silent */ }
  };

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

  // SHARE STATS — same pattern as shareCard but for the lifetime stats screen.
  // Builds the share text from the current scoreStats / totalPlays / average.
  const shareStats = async () => {
    setShareState('working');
    try {
      const blob = await renderCardToBlob(statsCardRef);
      if (!blob) throw new Error('Render failed');

      const filename = `kick3-my-stats.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      // Build a quick text summary for the share sheet (image is the headline,
      // but text is what appears alongside in messaging apps that show both).
      let total = 0, sum = 0;
      for (let s = 1; s <= 10; s++) {
        const c = scoreStats[s] || scoreStats[String(s)] || 0;
        total += c;
        sum += s * c;
      }
      const avg = total > 0 ? (sum / total).toFixed(1) : '—';
      const shareText = total > 0
        ? `My Kick 3 record: ${total} verdicts, ${avg} avg — kick3.app`
        : `Kick 3 — kick3.app`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Kick 3 — My Stats',
          text: shareText
        });
        setShareState('shared');
      } else if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/jpeg': blob })
        ]);
        setShareState('copied');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setShareState('shared');
      }
    } catch (err) {
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

  // SHARE TOURNAMENT RECORD — same pattern as shareStats, for the tournament RECORD screen.
  const shareRecord = async () => {
    setShareState('working');
    try {
      const blob = await renderCardToBlob(recordCardRef);
      if (!blob) throw new Error('Render failed');

      const filename = `kick3-tournament-record.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      const state = readTournamentState();
      const shareText = state.trophyCount > 0
        ? `${state.trophyCount} Kick 3 trophies. Beat Pete to win one — kick3.app`
        : `Tournament mode on Kick 3 — kick3.app`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Kick 3 — Tournament Record',
          text: shareText
        });
        setShareState('shared');
      } else if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/jpeg': blob })
        ]);
        setShareState('copied');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setShareState('shared');
      }
    } catch (err) {
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

  // Maps a verdict score (1-10) to Pete's reaction image.
  // Five reactions, in five score bands. Score is clamped to 1-10.
  const petePictureFor = (score) => {
    const s = Math.max(1, Math.min(10, Math.round(score || 0)));
    if (s <= 2) return { src: '/pete-fury.webp',         alt: "Pete is furious" };
    if (s <= 4) return { src: '/pete-disappointed.webp', alt: "Pete is disappointed" };
    if (s <= 6) return { src: '/pete-sceptical.webp',    alt: "Pete is sceptical" };
    if (s <= 8) return { src: '/pete-respect.webp',      alt: "Pete is impressed" };
    return                  { src: '/pete-delighted.webp',     alt: "Pete is delighted" };
  };

  const shareLabel = {
    idle: 'SHARE VERDICT',
    working: 'GENERATING…',
    shared: 'SHARED ✓',
    copied: 'COPIED ✓',
    error: 'TRY AGAIN'
  }[shareState];

  const startGame = () => {
    if (soloLocked) return; // Daily limit reached — button should be locked anyway
    setMode('solo');
    setDraftRounds(generateDraft());
    setCurrentRound(0);
    setSquad([]);
    setSentence('');
    setVerdict(null);
    setError(null);
    setIsPersonalBest(false);
    setScreen('draft');
  };

  const startH2H = () => {
    if (h2hLocked) return; // Daily limit reached — button should be locked anyway
    setMode('h2h');
    setP1Name('');
    setP2Name('');
    setP1Squad([]);
    setP2Squad([]);
    setP1Sentence('');
    setP2Sentence('');
    setH2hVerdict(null);
    setError(null);
    setIsPersonalBest(false);
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
      // Just advance to the next round. The initial draft already contains
      // 6 valid players (with at most 1 Legend). Regenerating here would
      // re-roll the 75/25 dice and break the per-game Legend cap.
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
      recordStreak();
      recordPlay('h2h');
      // For h2h the score is the higher of the two — that's what Pete reacted to
      recordScore(Math.max(parsed.p1Score || 0, parsed.p2Score || 0));
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

Their defence: "${sentence || '(They did not write a defence.)'}"

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
      recordStreak();
      recordPlay('solo');
      recordScore(parsed.score);
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
        {/* Responsive CSS — phone uses the Pete-desk vertical layout, desktop uses the full bedroom with overlay UI */}
        <style>{`
          .kick3-home-root {
            min-height: 100vh;
            width: 100%;
            background: ${colours.bg};
            color: ${colours.text};
          }

          /* ============ PHONE LAYOUT (default, < 900px) — half illustration, half navy UI ============ */
          .kick3-phone-wrap {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .kick3-phone-pete {
            position: relative;
            background: #2a1810;
            overflow: hidden;
            width: 100%;
          }
          .kick3-phone-pete img {
            display: block;
            width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center top;
          }
          .kick3-phone-ui {
            background: ${colours.bg};
            padding: 28px 24px 32px 24px;
            flex: 1 0 auto;
            display: flex;
            flex-direction: column;
          }

          /* Hide phone layout on desktop */
          @media (min-width: 900px) {
            .kick3-phone-wrap { display: none; }
          }

          /* ============ DESKTOP LAYOUT (NEW — half-and-half) ============ */
          .kick3-desktop-new-wrap {
            display: none;
            min-height: 100vh;
            width: 100%;
            background: ${colours.bg};
            padding: 32px 24px 48px 24px;
          }
          .kick3-desktop-new-inner {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
          }
          .kick3-desktop-new-pete {
            position: relative;
            background: #2a1810;
            overflow: hidden;
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            margin-bottom: 32px;
          }
          .kick3-desktop-new-pete img {
            display: block;
            width: 100%;
            height: auto;
          }
          .kick3-desktop-new-ui {
            background: ${colours.bg};
            padding: 0 8px;
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 900px) {
            .kick3-desktop-new-wrap { display: block; }
          }

          /* Desktop button hover effects (phone has none) */
          .kick3-desktop-btn-play {
            transition: transform 0.15s ease, filter 0.15s ease;
            cursor: pointer;
          }
          .kick3-desktop-btn-play:hover {
            transform: scale(1.03);
            filter: brightness(1.1);
          }
          .kick3-desktop-btn-h2h {
            transition: transform 0.15s ease, filter 0.15s ease;
            cursor: pointer;
          }
          .kick3-desktop-btn-h2h:hover {
            transform: scale(1.03);
            filter: brightness(1.15);
          }
          .kick3-desktop-btn-tournament {
            transition: transform 0.15s ease, filter 0.15s ease;
          }
          .kick3-desktop-btn-tournament:hover {
            transform: scale(1.03);
            filter: brightness(1.1);
          }

        `}</style>

        <div className="kick3-home-root">

          {/* ============ PHONE LAYOUT — half illustration, half navy UI ============ */}
          <div className="kick3-phone-wrap">
            {/* Hero illustration — Pete's bedroom (mobile crop) */}
            <div className="kick3-phone-pete">
              <picture>
                <source
                  srcSet="/pete-bedroom-mobile.webp 1x, /pete-bedroom-mobile-2x.webp 2x"
                  type="image/webp"
                />
                <img
                  src="/pete-bedroom-mobile.jpg"
                  alt="Pete the Pundit asleep in his study"
                />
              </picture>
              {/* DAY badge — top-left corner of illustration */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: 'rgba(20,20,30,0.85)',
                color: colours.gold,
                ...condFont,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.3em',
                padding: '6px 10px',
                borderRadius: '4px',
                border: `1px solid ${colours.gold}`
              }}>
                DAY {TODAYS_QUESTION.number}
              </div>
              {/* Top-right stack: streak badge (if any) + STATS button (always) */}
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '6px'
              }}>
                {streak.current >= 1 && (
                  <div style={{
                    background: 'rgba(20,20,30,0.85)',
                    color: colours.gold,
                    ...condFont,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: `1px solid ${colours.gold}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '13px', letterSpacing: 0 }} aria-hidden="true">🔥</span>
                    <span>{streak.current} DAY STREAK</span>
                  </div>
                )}
                <button
                  onClick={() => setScreen('stats')}
                  style={{
                    background: 'rgba(20,20,30,0.85)',
                    color: colours.gold,
                    ...condFont,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: `1px solid ${colours.gold}`,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '12px', letterSpacing: 0 }} aria-hidden="true">📊</span>
                  <span>STATS</span>
                </button>
              </div>
            </div>

            {/* Navy UI panel below illustration */}
            <div className="kick3-phone-ui">
              {/* Title block — big bold KICK 3 */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{
                  ...displayFont,
                  fontSize: 'clamp(64px, 17vw, 88px)',
                  lineHeight: '0.85',
                  margin: 0,
                  fontWeight: 700,
                  color: colours.gold,
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase'
                }}>
                  KICK 3
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  <div style={{ height: '1px', flex: '0 0 28px', background: colours.cream, opacity: 0.7 }} />
                  <div style={{
                    ...condFont,
                    fontSize: '13px',
                    color: colours.cream,
                    fontWeight: 600,
                    letterSpacing: '0.28em'
                  }}>
                    WITH PETE THE PUNDIT
                  </div>
                  <div style={{ height: '1px', flex: '0 0 28px', background: colours.cream, opacity: 0.7 }} />
                </div>
              </div>

              {/* Question chalkboard — wooden frame around dark slate */}
              <div style={{
                background: 'linear-gradient(135deg, #6b4423 0%, #4a2e15 50%, #5c3a1d 100%)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '22px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  background: '#1a1d23',
                  borderRadius: '3px',
                  padding: '18px 18px 16px 18px',
                  textAlign: 'center',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
                  position: 'relative'
                }}>
                  {/* Subtle chalk-dust texture using radial gradients */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '3px',
                    pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.025) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 50%)'
                  }} />
                  <div style={{
                    ...condFont,
                    fontSize: '11px',
                    letterSpacing: '0.3em',
                    color: colours.gold,
                    fontWeight: 600,
                    marginBottom: '4px',
                    position: 'relative'
                  }}>
                    TODAY&apos;S QUESTION
                  </div>
                  <div style={{
                    width: '36px',
                    height: '2px',
                    background: colours.gold,
                    margin: '0 auto 14px auto',
                    opacity: 0.7,
                    position: 'relative'
                  }} />
                  <p style={{
                    fontFamily: "'Permanent Marker', 'Teko', cursive",
                    fontSize: 'clamp(20px, 5.4vw, 26px)',
                    lineHeight: '1.18',
                    margin: 0,
                    color: '#f5f0e1',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    textShadow: '0 1px 0 rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}>
                    {TODAYS_QUESTION.text}
                  </p>
                  <div style={{ width: '50%', height: '1px', background: '#f5f0e1', opacity: 0.3, margin: '14px auto 8px auto', position: 'relative' }} />
                  <div style={{
                    ...condFont,
                    fontSize: '10px',
                    letterSpacing: '0.25em',
                    color: CATEGORY_COLOURS[TODAYS_QUESTION.category] || colours.muted,
                    fontWeight: 600,
                    position: 'relative'
                  }}>
                    ● {TODAYS_QUESTION.category.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* TOURNAMENT MODE — green (beta-only, hidden unless ?beta=pete) */}
              {tournamentBetaActive && (
                <button
                  onClick={() => setScreen('tournament-home')}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    background: '#5fb04a',
                    color: '#0a1a08',
                    border: 'none',
                    borderRadius: '10px',
                    ...displayFont,
                    fontSize: 'clamp(20px, 5.4vw, 24px)',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                    position: 'relative'
                  }}
                  aria-label="Open tournament mode"
                >
                  <span>TOURNAMENT MODE</span>
                  <span style={{
                    background: 'rgba(0,0,0,0.18)',
                    color: '#0a1a08',
                    ...condFont,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    lineHeight: 1
                  }}>BETA</span>
                </button>
              )}

              {/* PLAY TODAY — yellow */}
              <button
                onClick={startGame}
                disabled={soloLocked}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: soloLocked ? '#3a3a44' : colours.gold,
                  color: soloLocked ? colours.muted : '#000',
                  border: 'none',
                  borderRadius: '10px',
                  ...displayFont,
                  fontSize: 'clamp(20px, 5.4vw, 24px)',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: soloLocked ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                  boxShadow: soloLocked ? 'none' : '0 4px 0 rgba(0,0,0,0.25)',
                  opacity: soloLocked ? 0.7 : 1,
                  position: 'relative'
                }}
              >
                {/* Counter badge — left, only after 1+ plays used today, only if not locked */}
                {!soloLocked && plays.solo > 0 && (
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.18)',
                    color: '#000',
                    ...condFont,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    lineHeight: 1
                  }} aria-label={`${MAX_PLAYS_PER_DAY - plays.solo} of ${MAX_PLAYS_PER_DAY} plays left`}>
                    <span style={{ fontSize: '13px', letterSpacing: 0 }} aria-hidden="true">🎯</span>
                    <span>{MAX_PLAYS_PER_DAY - plays.solo}/{MAX_PLAYS_PER_DAY}</span>
                  </span>
                )}
                {soloLocked ? (
                  <>
                    <span style={{ fontSize: '20px', letterSpacing: 0 }} aria-hidden="true">🔒</span>
                    <span>COME BACK TOMORROW</span>
                  </>
                ) : (
                  <>
                    <span>PLAY TODAY</span>
                    <span style={{ fontSize: '22px', lineHeight: 1 }}>→</span>
                  </>
                )}
              </button>

              {/* 1V1 MODE — red */}
              <button
                onClick={startH2H}
                disabled={h2hLocked}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: h2hLocked ? '#3a3a44' : colours.accent,
                  color: h2hLocked ? colours.muted : colours.cream,
                  border: 'none',
                  borderRadius: '10px',
                  ...displayFont,
                  fontSize: 'clamp(16px, 4.4vw, 19px)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  cursor: h2hLocked ? 'not-allowed' : 'pointer',
                  marginBottom: '20px',
                  boxShadow: h2hLocked ? 'none' : '0 4px 0 rgba(0,0,0,0.25)',
                  opacity: h2hLocked ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  position: 'relative'
                }}
              >
                {/* Counter badge — left, only after 1+ plays used today, only if not locked */}
                {!h2hLocked && plays.h2h > 0 && (
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.25)',
                    color: colours.cream,
                    ...condFont,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    lineHeight: 1
                  }} aria-label={`${MAX_PLAYS_PER_DAY - plays.h2h} of ${MAX_PLAYS_PER_DAY} 1v1 plays left`}>
                    <span style={{ fontSize: '13px', letterSpacing: 0 }} aria-hidden="true">🥊</span>
                    <span>{MAX_PLAYS_PER_DAY - plays.h2h}/{MAX_PLAYS_PER_DAY}</span>
                  </span>
                )}
                {h2hLocked ? (
                  <>
                    <span style={{ fontSize: '18px', letterSpacing: 0 }} aria-hidden="true">🔒</span>
                    <span>1V1 LIMIT REACHED</span>
                  </>
                ) : (
                  <span>1V1 MODE</span>
                )}
              </button>

              {/* Countdown */}
              <div style={{
                ...condFont,
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: colours.cream,
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '18px'
              }}>
                NEXT QUESTION IN{' '}
                <span style={{
                  color: colours.gold,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  marginLeft: '4px'
                }}>
                  {timeUntilNext}
                </span>
              </div>

              {/* Pete's italic intro quote */}
              <p style={{
                ...condFont,
                fontStyle: 'italic',
                fontSize: '13px',
                color: colours.muted,
                textAlign: 'center',
                margin: 0,
                padding: '0 8px',
                lineHeight: '1.5',
                opacity: 0.85
              }}>
                &ldquo;{TODAYS_QUESTION.ronIntro}&rdquo;
              </p>

              {/* HOW TO PLAY — secondary button, visible in bottom third of home */}
              <button
                onClick={() => setScreen('howto')}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '14px 20px',
                  background: 'transparent',
                  color: colours.gold,
                  border: `1.5px solid ${colours.gold}`,
                  borderRadius: '8px',
                  ...condFont,
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '14px', letterSpacing: 0 }} aria-hidden="true">📖</span>
                <span>HOW TO PLAY</span>
              </button>

              {/* Contact footer */}
              <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: `1px solid rgba(212,175,55,0.15)`,
                textAlign: 'center'
              }}>
                {/* Socials row — links go to @kick3.app on each platform */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    ...condFont,
                    fontSize: '10px',
                    letterSpacing: '0.3em',
                    color: colours.muted,
                    fontWeight: 600,
                    opacity: 0.7
                  }}>
                    FOLLOW @KICK3.APP
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <a
                      href="https://www.instagram.com/kick3.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Kick 3 on Instagram"
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colours.gold,
                        opacity: 0.85,
                        transition: 'opacity 0.15s'
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.tiktok.com/@kick3.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Kick 3 on TikTok"
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colours.gold,
                        opacity: 0.85,
                        transition: 'opacity 0.15s'
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                <a
                  href="mailto:contactkick3@gmail.com"
                  style={{
                    ...condFont,
                    fontSize: '11px',
                    letterSpacing: '0.25em',
                    color: colours.muted,
                    textDecoration: 'none',
                    fontWeight: 600,
                    opacity: 0.7,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '13px', letterSpacing: 0 }} aria-hidden="true">✉️</span>
                  <span>CONTACT THE TEAM AT KICK 3 &rarr;</span>
                </a>
              </div>
            </div>
          </div>

          {/* ============ DESKTOP LAYOUT (NEW — half illustration, half navy UI) ============ */}
          <div className="kick3-desktop-new-wrap">
            <div className="kick3-desktop-new-inner">
              {/* Hero illustration — Pete's bedroom wide */}
              <div className="kick3-desktop-new-pete">
                <picture>
                  <source
                    srcSet="/pete-bedroom-desktop-wide.webp 1x, /pete-bedroom-desktop-wide-2x.webp 2x"
                    type="image/webp"
                  />
                  <img
                    src="/pete-bedroom-desktop-wide.jpg"
                    alt="Pete the Pundit asleep in his study"
                  />
                </picture>
                {/* DAY badge */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  background: 'rgba(20,20,30,0.85)',
                  color: colours.gold,
                  ...condFont,
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: `1px solid ${colours.gold}`
                }}>
                  DAY {TODAYS_QUESTION.number}
                </div>
                {/* Top-right stack: streak badge (if any) + STATS button (always) */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  {streak.current >= 1 && (
                    <div style={{
                      background: 'rgba(20,20,30,0.85)',
                      color: colours.gold,
                      ...condFont,
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      border: `1px solid ${colours.gold}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '15px', letterSpacing: 0 }} aria-hidden="true">🔥</span>
                      <span>{streak.current} DAY STREAK</span>
                    </div>
                  )}
                  <button
                    onClick={() => setScreen('stats')}
                    style={{
                      background: 'rgba(20,20,30,0.85)',
                      color: colours.gold,
                      ...condFont,
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      border: `1px solid ${colours.gold}`,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '14px', letterSpacing: 0 }} aria-hidden="true">📊</span>
                    <span>STATS</span>
                  </button>
                </div>
              </div>

              {/* Navy UI panel below */}
              <div className="kick3-desktop-new-ui">
                {/* Title block — big bold KICK 3 */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h1 style={{
                    ...displayFont,
                    fontSize: 'clamp(72px, 7vw, 104px)',
                    lineHeight: '0.85',
                    margin: 0,
                    fontWeight: 700,
                    color: colours.gold,
                    letterSpacing: '0.01em',
                    textTransform: 'uppercase'
                  }}>
                    KICK 3
                  </h1>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '12px'
                  }}>
                    <div style={{ height: '1px', flex: '0 0 36px', background: colours.cream, opacity: 0.7 }} />
                    <div style={{
                      ...condFont,
                      fontSize: '15px',
                      color: colours.cream,
                      fontWeight: 600,
                      letterSpacing: '0.28em'
                    }}>
                      WITH PETE THE PUNDIT
                    </div>
                    <div style={{ height: '1px', flex: '0 0 36px', background: colours.cream, opacity: 0.7 }} />
                  </div>
                </div>

                {/* Question chalkboard — wooden frame around slate */}
                <div style={{
                  background: 'linear-gradient(135deg, #6b4423 0%, #4a2e15 50%, #5c3a1d 100%)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '26px',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    background: '#1a1d23',
                    borderRadius: '4px',
                    padding: '22px 24px 20px 24px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '4px',
                      pointerEvents: 'none',
                      background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.025) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 50%)'
                    }} />
                    <div style={{
                      ...condFont,
                      fontSize: '13px',
                      letterSpacing: '0.3em',
                      color: colours.gold,
                      fontWeight: 600,
                      marginBottom: '6px',
                      position: 'relative'
                    }}>
                      TODAY&apos;S QUESTION
                    </div>
                    <div style={{
                      width: '44px',
                      height: '2px',
                      background: colours.gold,
                      margin: '0 auto 16px auto',
                      opacity: 0.7,
                      position: 'relative'
                    }} />
                    <p style={{
                      fontFamily: "'Permanent Marker', 'Teko', cursive",
                      fontSize: 'clamp(24px, 2.4vw, 32px)',
                      lineHeight: '1.2',
                      margin: 0,
                      color: '#f5f0e1',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      textShadow: '0 1px 0 rgba(0,0,0,0.3)',
                      position: 'relative'
                    }}>
                      {TODAYS_QUESTION.text}
                    </p>
                    <div style={{ width: '50%', height: '1px', background: '#f5f0e1', opacity: 0.3, margin: '16px auto 10px auto', position: 'relative' }} />
                    <div style={{
                      ...condFont,
                      fontSize: '12px',
                      letterSpacing: '0.25em',
                      color: CATEGORY_COLOURS[TODAYS_QUESTION.category] || colours.muted,
                      fontWeight: 600,
                      position: 'relative'
                    }}>
                      ● {TODAYS_QUESTION.category.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* TOURNAMENT MODE — green (beta-only, hidden unless ?beta=pete) */}
                {tournamentBetaActive && (
                  <button
                    onClick={() => setScreen('tournament-home')}
                    className="kick3-desktop-btn-tournament"
                    style={{
                      width: '100%',
                      padding: '22px 24px',
                      background: '#5fb04a',
                      color: '#0a1a08',
                      border: 'none',
                      borderRadius: '12px',
                      ...displayFont,
                      fontSize: 'clamp(24px, 2.4vw, 30px)',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      marginBottom: '14px',
                      boxShadow: '0 5px 0 rgba(0,0,0,0.25)',
                      position: 'relative'
                    }}
                    aria-label="Open tournament mode"
                  >
                    <span>TOURNAMENT MODE</span>
                    <span style={{
                      background: 'rgba(0,0,0,0.18)',
                      color: '#0a1a08',
                      ...condFont,
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      lineHeight: 1
                    }}>BETA</span>
                  </button>
                )}

                {/* PLAY TODAY — yellow */}
                <button
                  onClick={startGame}
                  disabled={soloLocked}
                  style={{
                    width: '100%',
                    padding: '22px 24px',
                    background: soloLocked ? '#3a3a44' : colours.gold,
                    color: soloLocked ? colours.muted : '#000',
                    border: 'none',
                    borderRadius: '12px',
                    ...displayFont,
                    fontSize: 'clamp(24px, 2.4vw, 30px)',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '14px',
                    cursor: soloLocked ? 'not-allowed' : 'pointer',
                    marginBottom: '14px',
                    boxShadow: soloLocked ? 'none' : '0 5px 0 rgba(0,0,0,0.25)',
                    opacity: soloLocked ? 0.7 : 1,
                    position: 'relative'
                  }}
                >
                  {/* Counter badge — left, only after 1+ plays used today, only if not locked */}
                  {!soloLocked && plays.solo > 0 && (
                    <span style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.18)',
                      color: '#000',
                      ...condFont,
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      lineHeight: 1
                    }} aria-label={`${MAX_PLAYS_PER_DAY - plays.solo} of ${MAX_PLAYS_PER_DAY} plays left`}>
                      <span style={{ fontSize: '15px', letterSpacing: 0 }} aria-hidden="true">🎯</span>
                      <span>{MAX_PLAYS_PER_DAY - plays.solo}/{MAX_PLAYS_PER_DAY}</span>
                    </span>
                  )}
                  {soloLocked ? (
                    <>
                      <span style={{ fontSize: '24px', letterSpacing: 0 }} aria-hidden="true">🔒</span>
                      <span>COME BACK TOMORROW</span>
                    </>
                  ) : (
                    <>
                      <span>PLAY TODAY</span>
                      <span style={{ fontSize: '26px', lineHeight: 1 }}>→</span>
                    </>
                  )}
                </button>

                {/* 1V1 MODE — red */}
                <button
                  onClick={startH2H}
                  disabled={h2hLocked}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: h2hLocked ? '#3a3a44' : colours.accent,
                    color: h2hLocked ? colours.muted : colours.cream,
                    border: 'none',
                    borderRadius: '12px',
                    ...displayFont,
                    fontSize: 'clamp(18px, 1.8vw, 22px)',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    cursor: h2hLocked ? 'not-allowed' : 'pointer',
                    marginBottom: '24px',
                    boxShadow: h2hLocked ? 'none' : '0 5px 0 rgba(0,0,0,0.25)',
                    opacity: h2hLocked ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Counter badge — left, only after 1+ plays used today, only if not locked */}
                  {!h2hLocked && plays.h2h > 0 && (
                    <span style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.25)',
                      color: colours.cream,
                      ...condFont,
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      lineHeight: 1
                    }} aria-label={`${MAX_PLAYS_PER_DAY - plays.h2h} of ${MAX_PLAYS_PER_DAY} 1v1 plays left`}>
                      <span style={{ fontSize: '15px', letterSpacing: 0 }} aria-hidden="true">🥊</span>
                      <span>{MAX_PLAYS_PER_DAY - plays.h2h}/{MAX_PLAYS_PER_DAY}</span>
                    </span>
                  )}
                  {h2hLocked ? (
                    <>
                      <span style={{ fontSize: '20px', letterSpacing: 0 }} aria-hidden="true">🔒</span>
                      <span>1V1 LIMIT REACHED</span>
                    </>
                  ) : (
                    <span>1V1 MODE</span>
                  )}
                </button>

                {/* Countdown */}
                <div style={{
                  ...condFont,
                  fontSize: '13px',
                  letterSpacing: '0.06em',
                  color: colours.cream,
                  fontWeight: 700,
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  NEXT QUESTION IN{' '}
                  <span style={{
                    color: colours.gold,
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                    marginLeft: '4px'
                  }}>
                    {timeUntilNext}
                  </span>
                </div>

                {/* Pete's italic intro quote */}
                <p style={{
                  ...condFont,
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: colours.muted,
                  textAlign: 'center',
                  margin: 0,
                  padding: '0 10px',
                  lineHeight: '1.5',
                  opacity: 0.85
                }}>
                  &ldquo;{TODAYS_QUESTION.ronIntro}&rdquo;
                </p>

                {/* HOW TO PLAY — secondary button, visible in bottom third of home */}
                <button
                  onClick={() => setScreen('howto')}
                  style={{
                    width: '100%',
                    marginTop: '28px',
                    padding: '16px 22px',
                    background: 'transparent',
                    color: colours.gold,
                    border: `1.5px solid ${colours.gold}`,
                    borderRadius: '10px',
                    ...condFont,
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.28em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '16px', letterSpacing: 0 }} aria-hidden="true">📖</span>
                  <span>HOW TO PLAY</span>
                </button>

                {/* Contact footer */}
                <div style={{
                  marginTop: '28px',
                  paddingTop: '20px',
                  borderTop: `1px solid rgba(212,175,55,0.15)`,
                  textAlign: 'center'
                }}>
                  {/* Socials row — links go to @kick3.app on each platform */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      ...condFont,
                      fontSize: '11px',
                      letterSpacing: '0.3em',
                      color: colours.muted,
                      fontWeight: 600,
                      opacity: 0.7
                    }}>
                      FOLLOW @KICK3.APP
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <a
                        href="https://www.instagram.com/kick3.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Kick 3 on Instagram"
                        style={{
                          width: '44px',
                          height: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colours.gold,
                          opacity: 0.85,
                          transition: 'opacity 0.15s'
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="5" ry="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.tiktok.com/@kick3.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Kick 3 on TikTok"
                        style={{
                          width: '44px',
                          height: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colours.gold,
                          opacity: 0.85,
                          transition: 'opacity 0.15s'
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  <a
                    href="mailto:contactkick3@gmail.com"
                    style={{
                      ...condFont,
                      fontSize: '12px',
                      letterSpacing: '0.28em',
                      color: colours.muted,
                      textDecoration: 'none',
                      fontWeight: 600,
                      opacity: 0.7,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '14px', letterSpacing: 0 }} aria-hidden="true">✉️</span>
                    <span>CONTACT THE TEAM AT KICK 3 &rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
        <Analytics />
      </>
    );
  }

  // ---------- DRAFT SCREEN ----------
  if (screen === 'draft') {
    let cards = draftRounds[currentRound] || [];
    // Safety: if the player already has a GK AND both cards in this round are GKs,
    // they'd be stuck with nothing to pick. Swap one of the GKs for a non-GK
    // fallback. Single-GK rounds are left alone — the GK card is shown disabled
    // with an "Already got a keeper" hint so the rule is visible to the player.
    const hasGkInSquad = squad.some(sq => sq.position === "GK");
    const gkCardCount = cards.filter(c => c && c.position === "GK").length;
    if (hasGkInSquad && gkCardCount === cards.filter(Boolean).length && gkCardCount > 0) {
      // All cards are GKs and player already has one — swap all but one for non-GKs.
      const usedNames = new Set([
        ...squad.map(p => p.name),
        ...draftRounds.flat().filter(Boolean).map(p => p.name)
      ]);
      const replacements = shuffle(
        PLAYER_POOL.filter(p => p.position !== "GK" && !usedNames.has(p.name))
      );
      let ri = 0;
      cards = cards.map(c => {
        if (c && c.position === "GK" && ri < replacements.length) {
          return replacements[ri++];
        }
        return c;
      });
    }
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
              {cards.map((p, i) => {
                if (!p) return null;
                // GK rule: max 1 goalkeeper per squad of 3.
                // If the player has already picked a GK, any further GK cards are blocked.
                const hasGkAlready = squad.some(sq => sq.position === "GK");
                const isBlocked = p.position === "GK" && hasGkAlready;
                return (
                <button
                  key={i}
                  onClick={isBlocked ? undefined : () => pickPlayer(p)}
                  disabled={isBlocked}
                  style={{
                    background: colours.surface,
                    border: `1px solid ${isBlocked ? `${colours.muted}33` : `${TIER_COLOURS[p.tier]}66`}`,
                    borderRadius: '4px',
                    padding: '20px',
                    textAlign: 'left',
                    cursor: isBlocked ? 'not-allowed' : 'pointer',
                    color: colours.text,
                    fontFamily: "'Barlow', sans-serif",
                    position: 'relative',
                    transition: 'all 0.15s',
                    opacity: isBlocked ? 0.45 : 1
                  }}
                  onMouseOver={e => {
                    if (isBlocked) return;
                    e.currentTarget.style.background = colours.surfaceHover;
                    e.currentTarget.style.borderColor = TIER_COLOURS[p.tier];
                  }}
                  onMouseOut={e => {
                    if (isBlocked) return;
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
                  {isBlocked && (
                    <div style={{
                      marginTop: '8px',
                      ...condFont,
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      color: colours.accent,
                      fontWeight: 600
                    }}>
                      ALREADY GOT A KEEPER
                    </div>
                  )}
                </button>
                );
              })}
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
              Make your case. Pete's listening.
            </p>

            <textarea
              value={sentence}
              onChange={e => setSentence(e.target.value.slice(0, 300))}
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
              {sentence.length}/300
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
                marginBottom: '16px',
                padding: '10px',
                border: `2px solid ${ratingColour}`,
                background: `${ratingColour}11`,
                transform: 'rotate(-1.5deg)'
              }}>
                <div style={{ ...displayFont, fontSize: '24px', fontWeight: 700, color: ratingColour, letterSpacing: '0.05em' }}>
                  {verdict.rating}
                </div>
              </div>

              {/* Streak line — sits inside the shared card */}
              {streak.current >= 1 && (
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    ...condFont,
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    color: colours.gold
                  }}>
                    <span style={{ fontSize: '15px', letterSpacing: 0 }} aria-hidden="true">🔥</span>
                    <span>{streak.current} DAY STREAK</span>
                  </div>
                  {isPersonalBest && (
                    <div style={{
                      marginTop: '6px',
                      ...condFont,
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.25em',
                      color: colours.cream
                    }}>
                      <span aria-hidden="true">🏆</span> NEW PERSONAL BEST
                    </div>
                  )}
                </div>
              )}

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

              {/* Pete's verdict */}
              <div style={{ borderTop: `1px solid ${colours.goldDim}`, paddingTop: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: `2px solid ${colours.gold}`,
                    boxShadow: `0 0 12px rgba(212,175,55,0.25)`,
                    background: colours.bg
                  }}>
                    <img
                      src={petePictureFor(verdict.score).src}
                      alt={petePictureFor(verdict.score).alt}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        display: 'block'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
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

              {/* Socials — links to @kick3.app on Instagram and TikTok */}
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: `1px solid rgba(212,175,55,0.10)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                  color: colours.muted, fontWeight: 600, opacity: 0.7
                }}>
                  FOLLOW @KICK3.APP
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <a href="https://www.instagram.com/kick3.app" target="_blank" rel="noopener noreferrer" aria-label="Kick 3 on Instagram"
                     style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colours.gold, opacity: 0.85 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@kick3.app" target="_blank" rel="noopener noreferrer" aria-label="Kick 3 on TikTok"
                     style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colours.gold, opacity: 0.85 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z"/>
                    </svg>
                  </a>
                </div>
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
              Make your case. Make Pete proud.
            </p>

            <textarea
              value={sentence}
              onChange={e => setSentence(e.target.value.slice(0, 300))}
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
              {sentence.length}/300
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
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
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
                marginBottom: '16px',
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

              {/* Streak line — sits inside the shared card */}
              {streak.current >= 1 && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    ...condFont,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    color: colours.gold
                  }}>
                    <span style={{ fontSize: '14px', letterSpacing: 0 }} aria-hidden="true">🔥</span>
                    <span>{streak.current} DAY STREAK</span>
                  </div>
                  {isPersonalBest && (
                    <div style={{
                      marginTop: '4px',
                      ...condFont,
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.25em',
                      color: colours.cream
                    }}>
                      <span aria-hidden="true">🏆</span> NEW PERSONAL BEST
                    </div>
                  )}
                </div>
              )}

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
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: `2px solid ${colours.gold}`,
                    boxShadow: `0 0 12px rgba(212,175,55,0.25)`,
                    background: colours.bg
                  }}>
                    <img
                      src={petePictureFor(Math.max(h2hVerdict.p1Score || 0, h2hVerdict.p2Score || 0)).src}
                      alt={petePictureFor(Math.max(h2hVerdict.p1Score || 0, h2hVerdict.p2Score || 0)).alt}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        display: 'block'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
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
              Impress Pete and score well. Send it to your mate.
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

              {/* Socials — links to @kick3.app on Instagram and TikTok */}
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: `1px solid rgba(212,175,55,0.10)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                  color: colours.muted, fontWeight: 600, opacity: 0.7
                }}>
                  FOLLOW @KICK3.APP
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <a href="https://www.instagram.com/kick3.app" target="_blank" rel="noopener noreferrer" aria-label="Kick 3 on Instagram"
                     style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colours.gold, opacity: 0.85 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@kick3.app" target="_blank" rel="noopener noreferrer" aria-label="Kick 3 on TikTok"
                     style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colours.gold, opacity: 0.85 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- HOW TO PLAY ----------
  if (screen === 'howto') {
    const steps = [
      {
        n: 1,
        title: "EVERY DAY, ONE QUESTION",
        body: "Pete poses a daily debate. Title-deciders, dressing-room moments, beach kickabouts. Something to argue about."
      },
      {
        n: 2,
        title: "PICK 3 FROM A RANDOM DRAW",
        body: "Three rounds. Two players per round. Choose one. Six cards become three picks — your squad."
      },
      {
        n: 3,
        title: "DEFEND IN 300 CHARACTERS",
        body: "Why these three? Convince Pete. He's seen forty years of football and he can spot a lazy argument."
      },
      {
        n: 4,
        title: "PETE DELIVERS A VERDICT",
        body: "Score out of 10. A grudging nod or an absolute roasting. Share the verdict card — your streak, your score, Pete's face."
      },
      {
        n: 5,
        title: "3 SOLO + 3 1V1 PER DAY",
        body: "Limited plays. Use them. Come back tomorrow. Keep the streak alive."
      },
    ];
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', paddingTop: '8px', marginBottom: '8px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: colours.muted, marginBottom: '8px' }}>
                A QUICK WORD FROM PETE
              </div>
              <h1 style={{ ...displayFont, fontSize: 'clamp(34px, 8vw, 48px)', fontWeight: 700, color: colours.gold, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                HOW TO PLAY
              </h1>
            </div>

            {/* Pete's grumpy welcome */}
            <p style={{
              ...condFont,
              fontStyle: 'italic',
              color: colours.cream,
              fontSize: '15px',
              textAlign: 'center',
              marginTop: '20px',
              marginBottom: '28px',
              lineHeight: 1.4,
              opacity: 0.9
            }}>
              &ldquo;Right. You're here. I'll keep this short — I've got football to watch.&rdquo;
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {steps.map(s => (
                <div key={s.n} style={{
                  background: colours.surface,
                  borderLeft: `3px solid ${colours.gold}`,
                  padding: '16px 18px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    ...displayFont,
                    fontSize: '36px',
                    fontWeight: 700,
                    color: colours.gold,
                    lineHeight: 0.9,
                    flexShrink: 0,
                    minWidth: '40px'
                  }}>
                    {s.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...condFont, fontSize: '13px', letterSpacing: '0.2em', color: colours.gold, fontWeight: 700, marginBottom: '6px' }}>
                      {s.title}
                    </div>
                    <div style={{ ...condFont, fontSize: '15px', color: colours.cream, lineHeight: 1.4 }}>
                      {s.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sign-off */}
            <p style={{
              ...condFont,
              fontStyle: 'italic',
              color: colours.muted,
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '24px',
              lineHeight: 1.5
            }}>
              &ldquo;Argue well. Surprise me. Don't pick three goalkeepers.&rdquo;
              <br />
              <span style={{ fontSize: '12px', letterSpacing: '0.2em', opacity: 0.6 }}>— PETE</span>
            </p>

            {/* Got it button */}
            <button
              onClick={() => setScreen('home')}
              style={{
                width: '100%',
                padding: '16px',
                background: colours.gold,
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                ...displayFont,
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
              }}
            >
              GOT IT — TAKE ME BACK
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- MY STATS ----------
  if (screen === 'stats') {
    // Compute total plays + max count for bar scaling + weighted average
    const counts = {};
    let totalPlays = 0;
    let maxCount = 0;
    let scoreSum = 0; // weighted sum of (score × count) for average
    for (let s = 1; s <= 10; s++) {
      const c = scoreStats[s] || scoreStats[String(s)] || 0;
      counts[s] = c;
      totalPlays += c;
      scoreSum += s * c;
      if (c > maxCount) maxCount = c;
    }
    // Average score to one decimal place. Show "—" if no plays yet.
    const averageScore = totalPlays > 0 ? (scoreSum / totalPlays).toFixed(1) : '—';
    // Find rarest non-zero score band as a fun stat
    const peteRating = (() => {
      if (totalPlays === 0) return "No verdicts yet. Pete's waiting.";
      const tens = counts[10] || 0;
      const nines = counts[9] || 0;
      if (tens > 0) return `You've made Pete say a 10. Rare air.`;
      if (nines > 0) return `${nines} score${nines === 1 ? '' : 's'} of 9. Pete's impressed.`;
      const sevens = counts[7] || 0;
      const eights = counts[8] || 0;
      if (sevens + eights >= 3) return "Pete's been nodding. Keep arguing well.";
      return "Plenty to argue for. Pete's listening.";
    })();

    // Colour by score band (matches Pete reaction tiers)
    const colourForScore = (s) => {
      if (s >= 9) return '#9bd99b';        // delighted — green
      if (s >= 7) return colours.gold;     // respect — gold
      if (s >= 5) return '#d4af55';        // sceptical — muted gold
      if (s >= 3) return '#d49955';        // disappointed — amber
      return colours.accent;               // fury — red
    };

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&family=Permanent+Marker&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>
            {/* Capturable region — everything inside this ref becomes the share image.
                Padding + bg make the screenshot look like a polished card not a screen-grab. */}
            <div ref={statsCardRef} style={{
              background: colours.bg,
              padding: '20px 16px 24px',
              marginBottom: '20px'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', paddingTop: '4px', marginBottom: '20px' }}>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: colours.muted, marginBottom: '8px' }}>
                  ALL-TIME RECORD
                </div>
                <h1 style={{ ...displayFont, fontSize: 'clamp(34px, 8vw, 48px)', fontWeight: 700, color: colours.gold, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                  MY STATS
                </h1>
              </div>

              {/* Top summary cards: VERDICTS + AVG SCORE */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '24px'
              }}>
                <div style={{ background: colours.surface, padding: '16px 10px', textAlign: 'center', borderTop: `2px solid ${colours.cream}` }}>
                  <div style={{ ...displayFont, fontSize: '36px', fontWeight: 700, color: colours.cream, lineHeight: 1 }}>
                    {totalPlays}
                  </div>
                  <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colours.muted, marginTop: '6px' }}>
                    VERDICTS
                  </div>
                </div>
                <div style={{ background: colours.surface, padding: '16px 10px', textAlign: 'center', borderTop: `2px solid ${colours.gold}` }}>
                  <div style={{ ...displayFont, fontSize: '36px', fontWeight: 700, color: colours.cream, lineHeight: 1 }}>
                    {averageScore}
                  </div>
                  <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colours.muted, marginTop: '6px' }}>
                    AVG SCORE
                  </div>
                </div>
              </div>

              {/* Pete's read on you */}
              <p style={{
                ...condFont,
                fontStyle: 'italic',
                color: colours.cream,
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: 1.4,
                opacity: 0.9
              }}>
                &ldquo;{peteRating}&rdquo;
              </p>

              {/* Score distribution */}
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: colours.gold, marginBottom: '12px', textAlign: 'left' }}>
                SCORE DISTRIBUTION
              </div>
              <div style={{
                background: colours.surface,
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {[10,9,8,7,6,5,4,3,2,1].map(score => {
                  const c = counts[score];
                  const widthPct = maxCount > 0 ? (c / maxCount) * 100 : 0;
                  const barColour = colourForScore(score);
                  return (
                    <div key={score} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        ...displayFont,
                        fontSize: '18px',
                        fontWeight: 700,
                        color: barColour,
                        minWidth: '24px',
                        textAlign: 'right',
                        lineHeight: 1
                      }}>
                        {score}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '20px',
                        background: 'rgba(255,255,255,0.05)',
                        position: 'relative',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${widthPct}%`,
                          height: '100%',
                          background: barColour,
                          opacity: c > 0 ? 0.8 : 0,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{
                        ...condFont,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: c > 0 ? colours.cream : colours.muted,
                        minWidth: '28px',
                        textAlign: 'left'
                      }}>
                        {c}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hint if no plays yet */}
              {totalPlays === 0 && (
                <p style={{
                  ...condFont,
                  fontSize: '13px',
                  color: colours.muted,
                  textAlign: 'center',
                  marginBottom: '12px',
                  fontStyle: 'italic'
                }}>
                  Play your first verdict and Pete's score lands here.
                </p>
              )}

              {/* kick3.app footer — baked into every share image for URL marketing */}
              <div style={{
                ...condFont,
                fontSize: '12px',
                letterSpacing: '0.3em',
                color: colours.gold,
                textAlign: 'center',
                paddingTop: '12px',
                fontWeight: 700,
                opacity: 0.85
              }}>
                KICK3.APP
              </div>
            </div>

            {/* SHARE STATS button — only render when there's something worth sharing */}
            {totalPlays > 0 && (
              <button
                onClick={shareStats}
                disabled={shareState === 'working'}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: shareState === 'shared' || shareState === 'copied' ? '#27AE60' : colours.gold,
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  ...displayFont,
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: shareState === 'working' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                  marginBottom: '10px',
                  opacity: shareState === 'working' ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {shareState === 'idle' && (
                  <>
                    <span style={{ fontSize: '18px', letterSpacing: 0 }} aria-hidden="true">📤</span>
                    <span>SHARE STATS</span>
                  </>
                )}
                {shareState === 'working' && <span>GENERATING…</span>}
                {shareState === 'shared'  && <span>SHARED ✓</span>}
                {shareState === 'copied'  && <span>COPIED ✓</span>}
                {shareState === 'error'   && <span>TRY AGAIN</span>}
              </button>
            )}

            {/* Back button */}
            <button
              onClick={() => setScreen('home')}
              style={{
                width: '100%',
                padding: '16px',
                background: totalPlays > 0 ? 'transparent' : colours.gold,
                color: totalPlays > 0 ? colours.gold : '#000',
                border: totalPlays > 0 ? `2px solid ${colours.gold}` : 'none',
                borderRadius: '8px',
                ...displayFont,
                fontSize: totalPlays > 0 ? '18px' : '20px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                boxShadow: totalPlays > 0 ? 'none' : '0 4px 0 rgba(0,0,0,0.25)'
              }}
            >
              BACK TO HOME
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT HOME SCREEN ----------
  // Real screen. Pete-on-the-lounger banner, dynamic cycle context, PLAY NOW + RECORD.
  // PLAY NOW is gated by hasPlayedTournamentToday(); locked = countdown to UK midnight.
  // RECORD is inactive in Task 3 (greyed out) — wired up properly in Task 4.
  if (screen === 'tournament-home') {
    const tournamentStatus = getTournamentStatus(new Date());
    const debugMode = getTournamentDebugMode();
    const tournamentState = readTournamentState();
    const playedToday = debugMode === 'unlock'
      ? false
      : debugMode === 'locked'
        ? true
        : hasPlayedTournamentToday(tournamentState);
    const insideWindow = !!tournamentStatus;
    const canPlay = insideWindow && !playedToday;

    // Dynamic context line — three states.
    let contextLine;
    if (!insideWindow) {
      contextLine = 'Tournament returns 11 June 2026. Beat Pete in Round 3 to win a trophy.';
    } else if (playedToday) {
      contextLine = `You\u2019ve played today. Trio ${tournamentStatus.trioNumber} of ${tournamentStatus.totalTrios}. Come back tomorrow.`;
    } else {
      contextLine = `Trio ${tournamentStatus.trioNumber} of ${tournamentStatus.totalTrios}. Three rounds, one sitting. Beat Pete to win a trophy.`;
    }

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />

        {/* Responsive CSS — phone = banner bleeds to edges, desktop = banner framed in a card */}
        <style>{`
          .kick3-tour-root {
            min-height: 100vh;
            width: 100%;
            background: ${colours.bg};
            color: ${colours.text};
          }
          /* ============ PHONE LAYOUT (default, < 900px) ============ */
          .kick3-tour-phone-wrap {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .kick3-tour-phone-banner {
            position: relative;
            background: #1a2840;
            overflow: hidden;
            width: 100%;
          }
          .kick3-tour-phone-banner img {
            display: block;
            width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center center;
          }
          .kick3-tour-phone-ui {
            background: ${colours.bg};
            padding: 28px 24px 40px 24px;
            flex: 1 0 auto;
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 900px) {
            .kick3-tour-phone-wrap { display: none; }
          }

          /* ============ DESKTOP LAYOUT ============ */
          .kick3-tour-desktop-wrap {
            display: none;
            min-height: 100vh;
            width: 100%;
            background: ${colours.bg};
            padding: 32px 24px 48px 24px;
          }
          .kick3-tour-desktop-inner {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
          }
          .kick3-tour-desktop-banner {
            position: relative;
            background: #1a2840;
            overflow: hidden;
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            margin-bottom: 32px;
          }
          .kick3-tour-desktop-banner img {
            display: block;
            width: 100%;
            height: auto;
          }
          .kick3-tour-desktop-ui {
            padding: 0 8px;
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 900px) {
            .kick3-tour-desktop-wrap { display: block; }
          }

          /* Button hover effects (desktop only) */
          .kick3-tour-btn-play {
            transition: transform 0.15s ease, filter 0.15s ease;
          }
          .kick3-tour-btn-play:hover:not(:disabled) {
            transform: scale(1.03);
            filter: brightness(1.1);
          }
        `}</style>

        <div className="kick3-tour-root">

          {/* ============ PHONE LAYOUT ============ */}
          <div className="kick3-tour-phone-wrap">
            <div className="kick3-tour-phone-banner">
              <picture>
                <source srcSet="/pete-tournament.webp" type="image/webp" />
                <img src="/pete-tournament.jpg" alt="Pete the Pundit on a sun lounger at the World Cup" />
              </picture>
              {/* BACK chip — top-left */}
              <button
                onClick={() => setScreen('home')}
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: 'rgba(20,20,30,0.85)',
                  color: colours.gold,
                  ...condFont,
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colours.gold}`,
                  cursor: 'pointer'
                }}
                aria-label="Back to main home"
              >
                ← BACK
              </button>
            </div>

            <div className="kick3-tour-phone-ui">
              {/* Wordmark */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{
                  ...displayFont,
                  fontSize: 'clamp(40px, 11vw, 56px)',
                  fontWeight: 800,
                  color: '#5fb04a',
                  letterSpacing: '0.04em',
                  lineHeight: 1
                }}>
                  TOURNAMENT MODE
                </div>
                <div style={{
                  ...condFont,
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  color: colours.muted,
                  fontWeight: 600,
                  marginTop: '10px'
                }}>
                  — BEAT PETE TO WIN A TROPHY —
                </div>
              </div>

              {/* Cycle context */}
              <div style={{
                ...condFont,
                fontSize: '13px',
                color: colours.cream,
                textAlign: 'center',
                lineHeight: 1.55,
                marginTop: '20px',
                marginBottom: '24px',
                padding: '0 4px'
              }}>
                {contextLine}
              </div>

              {/* PLAY NOW — green */}
              <button
                onClick={() => { /* Wired up in Task 5 */ }}
                disabled={!canPlay}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: canPlay ? '#5fb04a' : '#3a3a44',
                  color: canPlay ? '#0a1a08' : colours.muted,
                  border: 'none',
                  borderRadius: '10px',
                  ...displayFont,
                  fontSize: 'clamp(20px, 5.4vw, 24px)',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: canPlay ? 'pointer' : 'not-allowed',
                  marginBottom: '12px',
                  boxShadow: canPlay ? '0 4px 0 rgba(0,0,0,0.25)' : 'none',
                  opacity: canPlay ? 1 : 0.7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                }}
              >
                {!insideWindow ? (
                  <span>TOURNAMENT NOT LIVE</span>
                ) : playedToday ? (
                  <>
                    <span style={{ fontSize: '18px' }} aria-hidden="true">⏳</span>
                    <span>NEXT IN {timeUntilNext}</span>
                  </>
                ) : (
                  <>
                    <span>PLAY NOW</span>
                    <span style={{ fontSize: '22px', lineHeight: 1 }}>→</span>
                  </>
                )}
              </button>

              {/* RECORD — gold outline, active (opens tournament-record screen) */}
              <button
                onClick={() => setScreen('tournament-record')}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: 'transparent',
                  color: colours.gold,
                  border: `2px solid ${colours.gold}`,
                  borderRadius: '10px',
                  ...displayFont,
                  fontSize: 'clamp(16px, 4.4vw, 19px)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                <span style={{ fontSize: '16px' }} aria-hidden="true">🏆</span>
                <span>RECORD</span>
              </button>

              {/* Pete taunt */}
              <div style={{
                ...condFont,
                fontStyle: 'italic',
                fontSize: '12px',
                color: colours.muted,
                textAlign: 'center',
                lineHeight: 1.55,
                padding: '0 12px'
              }}>
                &ldquo;I&rsquo;ve forgotten more football than you&rsquo;ll ever know. Three rounds. Beat me. I&rsquo;ll wait.&rdquo;
              </div>
            </div>
          </div>

          {/* ============ DESKTOP LAYOUT ============ */}
          <div className="kick3-tour-desktop-wrap">
            <div className="kick3-tour-desktop-inner">
              <div className="kick3-tour-desktop-banner">
                <picture>
                  <source srcSet="/pete-tournament.webp" type="image/webp" />
                  <img src="/pete-tournament.jpg" alt="Pete the Pundit on a sun lounger at the World Cup" />
                </picture>
                {/* BACK chip — top-left of banner */}
                <button
                  onClick={() => setScreen('home')}
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '18px',
                    background: 'rgba(20,20,30,0.85)',
                    color: colours.gold,
                    ...condFont,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    padding: '10px 16px',
                    borderRadius: '5px',
                    border: `1px solid ${colours.gold}`,
                    cursor: 'pointer'
                  }}
                  aria-label="Back to main home"
                >
                  ← BACK
                </button>
              </div>

              <div className="kick3-tour-desktop-ui">
                {/* Wordmark */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{
                    ...displayFont,
                    fontSize: 'clamp(48px, 5vw, 64px)',
                    fontWeight: 800,
                    color: '#5fb04a',
                    letterSpacing: '0.04em',
                    lineHeight: 1
                  }}>
                    TOURNAMENT MODE
                  </div>
                  <div style={{
                    ...condFont,
                    fontSize: '13px',
                    letterSpacing: '0.3em',
                    color: colours.muted,
                    fontWeight: 600,
                    marginTop: '14px'
                  }}>
                    — BEAT PETE TO WIN A TROPHY —
                  </div>
                </div>

                {/* Cycle context */}
                <div style={{
                  ...condFont,
                  fontSize: '15px',
                  color: colours.cream,
                  textAlign: 'center',
                  lineHeight: 1.55,
                  marginTop: '24px',
                  marginBottom: '28px',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {contextLine}
                </div>

                {/* PLAY NOW — green */}
                <button
                  onClick={() => { /* Wired up in Task 5 */ }}
                  disabled={!canPlay}
                  className="kick3-tour-btn-play"
                  style={{
                    width: '100%',
                    padding: '22px 24px',
                    background: canPlay ? '#5fb04a' : '#3a3a44',
                    color: canPlay ? '#0a1a08' : colours.muted,
                    border: 'none',
                    borderRadius: '12px',
                    ...displayFont,
                    fontSize: 'clamp(24px, 2.4vw, 30px)',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    cursor: canPlay ? 'pointer' : 'not-allowed',
                    marginBottom: '14px',
                    boxShadow: canPlay ? '0 5px 0 rgba(0,0,0,0.25)' : 'none',
                    opacity: canPlay ? 1 : 0.7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px'
                  }}
                >
                  {!insideWindow ? (
                    <span>TOURNAMENT NOT LIVE</span>
                  ) : playedToday ? (
                    <>
                      <span style={{ fontSize: '22px' }} aria-hidden="true">⏳</span>
                      <span>NEXT IN {timeUntilNext}</span>
                    </>
                  ) : (
                    <>
                      <span>PLAY NOW</span>
                      <span style={{ fontSize: '26px', lineHeight: 1 }}>→</span>
                    </>
                  )}
                </button>

                {/* RECORD — gold outline, active */}
                <button
                  onClick={() => setScreen('tournament-record')}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: 'transparent',
                    color: colours.gold,
                    border: `2px solid ${colours.gold}`,
                    borderRadius: '12px',
                    ...displayFont,
                    fontSize: 'clamp(18px, 1.8vw, 22px)',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    cursor: 'pointer',
                    marginBottom: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '18px' }} aria-hidden="true">🏆</span>
                  <span>RECORD</span>
                </button>

                {/* Pete taunt */}
                <div style={{
                  ...condFont,
                  fontStyle: 'italic',
                  fontSize: '14px',
                  color: colours.muted,
                  textAlign: 'center',
                  lineHeight: 1.55,
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  padding: '0 12px'
                }}>
                  &ldquo;I&rsquo;ve forgotten more football than you&rsquo;ll ever know. Three rounds. Beat me. I&rsquo;ll wait.&rdquo;
                </div>
              </div>
            </div>
          </div>

        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT RECORD SCREEN ----------
  // Shows lifetime tournament stats: trophies, attempts, win rate against Pete.
  // Shareable via the existing share-card mechanism.
  if (screen === 'tournament-record') {
    const recordState = readTournamentState();
    const trophies = recordState.trophyCount || 0;
    const attempts = recordState.tournamentsAttempted || 0;
    const completed = recordState.tournamentsCompleted || 0;
    // Win rate vs Pete = trophies / tournaments that reached Round 3.
    const winRate = completed > 0
      ? `${Math.round((trophies / completed) * 100)}% (${trophies} of ${completed})`
      : '—';
    const isEmpty = attempts === 0;

    // Pete's read on the record — quick flavour line.
    const peteRead = (() => {
      if (isEmpty) return "Your record is empty. Time to fix that.";
      if (trophies === 0 && completed > 0) return `${completed} attempt${completed === 1 ? '' : 's'} at me. Nought trophies. Have another go.`;
      if (trophies === 1) return "One trophy. A start.";
      if (trophies >= 5) return `${trophies} trophies. Beginning to think you might know football.`;
      return `${trophies} trophies. Not bad.`;
    })();

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>

            {/* Capturable region — everything inside this ref becomes the share image. */}
            <div ref={recordCardRef} style={{
              background: colours.bg,
              padding: '20px 16px 24px',
              marginBottom: '20px'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', paddingTop: '4px', marginBottom: '24px' }}>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#5fb04a', marginBottom: '8px', fontWeight: 600 }}>
                  TOURNAMENT
                </div>
                <h1 style={{ ...displayFont, fontSize: 'clamp(34px, 8vw, 48px)', fontWeight: 700, color: colours.gold, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                  MY RECORD
                </h1>
              </div>

              {/* TROPHIES — hero stat */}
              <div style={{
                background: colours.surface,
                padding: '28px 16px',
                textAlign: 'center',
                borderTop: `2px solid ${isEmpty ? colours.muted : colours.gold}`,
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '40px', lineHeight: 1, marginBottom: '8px' }} aria-hidden="true">🏆</div>
                <div style={{
                  ...displayFont,
                  fontSize: 'clamp(56px, 14vw, 80px)',
                  fontWeight: 700,
                  color: isEmpty ? colours.muted : colours.gold,
                  lineHeight: 1
                }}>
                  {trophies}
                </div>
                <div style={{ ...condFont, fontSize: '12px', letterSpacing: '0.3em', color: colours.muted, marginTop: '10px' }}>
                  {trophies === 1 ? 'TROPHY' : 'TROPHIES'}
                </div>
              </div>

              {/* ATTEMPTS + WIN RATE — two-up grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '24px'
              }}>
                <div style={{ background: colours.surface, padding: '16px 10px', textAlign: 'center', borderTop: `2px solid ${colours.cream}` }}>
                  <div style={{ ...displayFont, fontSize: '32px', fontWeight: 700, color: isEmpty ? colours.muted : colours.cream, lineHeight: 1 }}>
                    {attempts}
                  </div>
                  <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.22em', color: colours.muted, marginTop: '6px' }}>
                    ATTEMPTED
                  </div>
                </div>
                <div style={{ background: colours.surface, padding: '16px 10px', textAlign: 'center', borderTop: `2px solid #5fb04a` }}>
                  <div style={{
                    ...displayFont,
                    fontSize: completed > 0 ? '24px' : '32px',
                    fontWeight: 700,
                    color: isEmpty ? colours.muted : colours.cream,
                    lineHeight: 1
                  }}>
                    {winRate}
                  </div>
                  <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.22em', color: colours.muted, marginTop: '6px' }}>
                    VS PETE
                  </div>
                </div>
              </div>

              {/* Pete's read */}
              <p style={{
                ...condFont,
                fontStyle: 'italic',
                color: colours.cream,
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '8px',
                marginTop: 0,
                lineHeight: 1.45,
                opacity: 0.9
              }}>
                &ldquo;{peteRead}&rdquo;
              </p>

              {/* Footer brand */}
              <div style={{
                ...condFont,
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: colours.muted,
                textAlign: 'center',
                marginTop: '20px',
                opacity: 0.7
              }}>
                KICK3.APP
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={shareRecord}
              disabled={shareState === 'working'}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: colours.gold,
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                ...displayFont,
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: shareState === 'working' ? 'wait' : 'pointer',
                marginBottom: '12px',
                boxShadow: '0 3px 0 rgba(0,0,0,0.25)',
                opacity: shareState === 'working' ? 0.7 : 1
              }}
            >
              {shareState === 'working' ? 'PREPARING...' :
               shareState === 'shared'  ? '✓ SHARED' :
               shareState === 'copied'  ? '✓ COPIED' :
               shareState === 'error'   ? 'TRY AGAIN' :
               'SHARE RECORD'}
            </button>

            {/* Back to tournament home */}
            <button
              onClick={() => setScreen('tournament-home')}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'transparent',
                color: colours.muted,
                border: `1px solid ${colours.muted}`,
                borderRadius: '8px',
                ...condFont,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                cursor: 'pointer'
              }}
            >
              ← BACK TO TOURNAMENT
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  return null;
}
