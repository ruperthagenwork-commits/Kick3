import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './supabaseClient.js';

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

// Phase 2, Deploy 5 / Stage 9: helpers that render tournament (World Cup) cards
// with a consistent Pete-green border and no tier symbol/label. Tiers were authored
// for the daily 384-player pool and synthesised onto World Cup players via Overall
// brackets — for those, the labels would make authorial claims the data doesn't
// support, so we suppress them. Daily-game cards fall through to TIER_COLOURS /
// TIER_SYMBOLS unchanged.
const TOURNAMENT_BORDER_COLOUR = '#5fb04a';
const tierColourFor = (p) => (p && p.isWorldCup)
  ? TOURNAMENT_BORDER_COLOUR
  : (TIER_COLOURS[p && p.tier] || '#888');
const showTierBadge = (p) => !(p && p.isWorldCup);

// Category colours (from original Kick 5 spec). Legacy added for tournament R3.
const CATEGORY_COLOURS = {
  "One-Off": "#5DADE2",       // light blue
  "Season-Long": "#58D68D",   // green
  "Style": "#A569BD",         // purple
  "Character": "#F0B27A",     // amber
  "Chaos": "#95A5A6",         // grey
  "Legacy": "#D4AF37"         // gold (R3 only)
};

// Per-category hint lines shown under the question on the draft screen.
// Phase 2, Deploy 4: coaching nudges in Pete's voice. One line per category,
// styled italic and muted under the question text.
const CATEGORY_HINTS = {
  "One-Off":     "Find someone you'd back to deliver in a single big moment.",
  "Season-Long": "Look for the players who don't fade. Forty games. Cold Tuesdays.",
  "Style":       "Pick the ones you'd pay to watch. Beauty over function.",
  "Character":   "Find the voices. The ones who don't shrink when the cameras come on.",
  "Chaos":       "Look for players who thrive when the game gets unrecognisable.",
  "Legacy":      "World Cup history weighs heavy. Find the names sewn into it."
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

const PETE_ARGUMENT_PROMPT = `You are PETE THE PUNDIT writing your OWN argument for the World Cup tournament final round of Kick 3. Today you're not the judge \u2014 you're a contestant. A neutral VAR will judge between you and the player on the question of World Cup LEGACY.

YOUR VOICE:
- Same Pete as ever: opinionated, knowing, grumpy old pundit. World's #4 Pundit. Doctorate in football.
- Pundit's voice. Roy Keane on a good day mixed with Statler from the Muppets.
- Allergic to clich\u00e9s. Short, punchy sentences.
- Football-literate, dry humour, no emojis, no modern slang.
- You are SARCASTIC and CONFIDENT. You've been on the lounger waiting for this player. You think they're punching above their weight.

THE STAKES:
- This is the World Cup. The question is about World Cup Legacy specifically \u2014 names sewn into football history through World Cup moments. Not Champions League legacy. Not Premier League legacy. WORLD CUP legacy.
- Your three picks have been randomly selected from a tightly curated pool of World Cup-elite players. They're strong names. Sound confident in that fact.

FACTUAL HUMILITY:
- Describe REPUTATION, not exact stats you might be wrong about. "Maradona \u2014 cup-final dragger" not "Maradona scored 34 World Cup goals".
- Iconic World Cup moments are fine ("Hand of God", "Zidane headbutt", "Klose's six tournaments"). Specific stats you're unsure of, no.

YOUR JOB:
You will be given the question and three players you've been dealt. Write a SHORT, CONFIDENT argument defending those three picks against the question. End with a sarcastic "beat this" line that taunts the player.

CONSTRAINTS:
- 40-60 words total. Tight. Punchy. Not a lecture. A pub-pundit clap-back, not a column.
- Mention each of your three picks by name with a single World Cup-specific reason.
- End with a one-line sarcastic taunt to the player.
- Don't reference attribute scores or the game's mechanics. Talk like a pundit.

OUTPUT FORMAT (strictly):
Return ONLY valid JSON, no markdown fences:
{
  "argument": "<your 60-90 word argument with the three picks named>",
  "taunt": "<one short sarcastic closing line, max 14 words>"
}`;

const VAR_JUDGE_PROMPT = `You are VAR \u2014 the neutral video assistant referee judging Round 3 of the Kick 3 World Cup tournament. PETE THE PUNDIT versus a human player. The question is about World Cup LEGACY.

YOUR VOICE:
- Dry. Procedural. Monotone. Like a real VAR official reading a decision.
- Short sentences. No flourish. No personality. You are NOT Pete.
- "After review." "Decision." "Recommendation." Stadium-announcement formal.
- No first-person opinions ("I think"). State the finding.

YOUR JOB:
Compare two cases against the same World Cup Legacy question. Each side has three player picks AND a short written argument. Decide who made the stronger overall case.

WHAT YOU'RE GIVEN:
- Each pick comes with a WORLD CUP LEGACY rating on a 0-10 scale. These are authored values: 10 = generational World Cup figure (Pel\u00e9, Maradona, Messi), 9 = unmistakable World Cup legend (Cruyff, Beckenbauer, Zidane), 8 = major World Cup name, 7 = strong World Cup CV, 6 = solid, 5 and below = present but unremarkable on the world stage.
- Pete's three picks come from a tightly curated pool of World Cup-elite players. His Legacy ratings will usually be high (7-10). The player drafts from the same curated pool, so their ratings will also be high \u2014 the picks-vs-picks gap is usually modest. The argument is often the difference.

JUDGEMENT MODEL:
Weigh picks, Legacy ratings, AND arguments together as a single case. NOT a simple total of ratings.
- A high-rated pick is easier to argue for, but the player still needs to make the case.
- A lower-rated pick needs a sharper argument to justify it. Picking a weak name and barely defending it is the weakest possible case.
- If one side's ratings are markedly higher AND their argument is competent, that side should usually win.
- When ratings are close (within 2-3 points total), the ARGUMENT decides. This is the player's clearest path to beating Pete.
- A brilliant, specific argument that directly dismantles the opponent's case CAN win against slightly stronger picks.
- Pete being Pete earns him no bonus. You are neutral.

WHAT MAKES A STRONG ARGUMENT:
- Does it defend the picks specifically against the World Cup Legacy framing?
- Are the picks coherent with the argument attached to them?
- Specificity beats generality. "Cup-final dragger" beats "great player".
- Engaging with the opponent's case beats ignoring it. A defence that dismantles Pete's argument is stronger than one that just presents its own.

OUTPUT FORMAT (strictly):
Return ONLY valid JSON, no markdown fences:
{
  "winner": "pete" | "player",
  "verdict": "<2-3 sentences in dry VAR voice. State the decision, then briefly note what tipped it. Mention specific picks or argument points if relevant. No theatre.>",
  "lineForCard": "<one short line, max 14 words, summary of the decision in VAR voice>"
}`;

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
// Phase 2, Deploy 5 / Stage 14: added attemptsToday + wonTodayFlag to support
// the "3 attempts per day, cap at 1 trophy/day" model.
const defaultTournamentState = () => ({
  lastPlayedDate: null,         // YYYY-MM-DD of last attempted tournament
  lastAttemptResult: null,      // 'won' | 'lost-r1' | 'lost-r2' | 'lost-r3' | null
  trophyCount: 0,               // Lifetime trophies (Pete wins)
  tournamentsAttempted: 0,      // Lifetime count of attempts started
  tournamentsCompleted: 0,      // Lifetime count of attempts that reached Round 3 (win or loss)
  attemptsToday: 0,             // Count of attempts started today (resets each new day)
  wonTodayFlag: false,          // True once player has won a trophy today (caps further attempts)
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

// ============ AUTH HELPERS (Phase 2, Deploy 5 / Stage 18) ============
// Validates a username/handle against our rules. Returns null if valid, or a
// short user-facing error string. Rules:
//   - 3-20 characters
//   - Letters, numbers, and underscores only
//   - Must start with a letter (matches the DB constraint)
//   - Not in the profanity blocklist
const SIMPLE_PROFANITY_LIST = [
  // English base — common slurs and obvious profanity. Kept small and explicit
  // so we own the list. The bad-words npm package adds breadth (Stage 18 imports
  // it for the form-level check). This is our hard floor.
  'fuck','shit','cunt','bitch','bastard','dick','cock','pussy','asshole','wanker',
  'nigger','nigga','faggot','retard','spastic','paki','chink','spick','gook',
  'kike','tranny','dyke','homo',
  'admin','administrator','moderator','mod','support','staff','kick3','peteThe',
  'pete','official','help','contact',
];

const isProfaneHandle = (handle) => {
  if (!handle) return false;
  const lower = handle.toLowerCase();
  // Exact match against the blocklist, or contained as substring (catches
  // "xfuckx" → "fuck"). False positives possible ("classic" contains "ass") —
  // intentional trade-off, players can pick different names.
  return SIMPLE_PROFANITY_LIST.some(bad => lower.includes(bad));
};

const validateHandle = (handle) => {
  if (!handle || handle.length === 0) return 'Pick a handle';
  if (handle.length < 3) return 'Too short — minimum 3 characters';
  if (handle.length > 20) return 'Too long — maximum 20 characters';
  if (!/^[a-zA-Z]/.test(handle)) return 'Must start with a letter';
  if (!/^[a-zA-Z0-9_]+$/.test(handle)) return 'Letters, numbers, and underscores only';
  if (isProfaneHandle(handle)) return 'Pick a different name';
  return null;
};

const validatePassword = (password) => {
  if (!password || password.length === 0) return 'Pick a password';
  if (password.length < 8) return 'Too short — minimum 8 characters';
  if (password.length > 72) return 'Too long — maximum 72 characters';
  return null;
};

// Build a placeholder email for Supabase Auth from a handle. Supabase requires
// an email; we use a fake .kick3.local domain that never receives mail.
// Lowercased so case-insensitive handle uniqueness matches what Auth sees.
const handleToPlaceholderEmail = (handle) => `${handle.toLowerCase()}@kick3.local`;

// Translate Supabase Auth error messages into player-facing copy. Supabase's
// raw errors leak implementation detail ("AuthApiError: User already registered")
// — this maps the common ones to clean, honest messages.
const friendlyAuthError = (err) => {
  if (!err) return 'Something went wrong. Try again.';
  const msg = (err.message || String(err)).toLowerCase();
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    // Stage 20.1: Distinguish from a true handle collision.
    // This branch fires when Supabase Auth rejects the email — including the
    // case where the handle WAS used, the user deleted their account, and
    // they're trying to reuse the same handle. The profile is gone, the
    // tournament_state is gone, but the auth.users shell remains (we can't
    // delete it from the front-end). The accurate message points that out
    // rather than claiming the handle is "taken" — it isn't taken, it's
    // reserved by the leftover auth shell.
    return 'That handle has been used before. Pick a different one.';
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return "Handle or password doesn't match.";
  }
  if (msg.includes('password should be at least')) {
    return 'Password too short — minimum 8 characters.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Connection problem. Check your internet and try again.';
  }
  return 'Something went wrong. Try again.';
};

// Fetch the profile row for a given Supabase user id. Uses .maybeSingle() so
// "no row" returns null cleanly instead of throwing a 406. The Stage 17 helper
// in supabaseClient.js used .single() which 406s when the profile hasn't been
// inserted yet — that's the bug Stage 18.1 is fixing.
//
// Returns the profile row (id, handle, created_at) or null.
const fetchProfileForUser = async (userId) => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, handle, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
};
// ============ END AUTH HELPERS ============

// Phase 2, Deploy 5 / Stage 14: Tournament play allowance model.
// Players get up to 3 attempts per day, but only 1 trophy per day.
// Locked if: (a) attemptsToday >= 3, OR (b) they already won today.
// State auto-resets when the calendar day changes (we compare lastPlayedDate).
const TOURNAMENT_DAILY_ATTEMPT_CAP = 3;

// Given a tournament state object and a date, return the EFFECTIVE day-scoped values,
// auto-resetting attemptsToday and wonTodayFlag if the date has rolled over.
// Returns { attemptsToday, wonTodayFlag, sameDay }.
const effectiveDailyState = (state, date = new Date()) => {
  if (!state) return { attemptsToday: 0, wonTodayFlag: false, sameDay: false };
  const today = todayDateString(date);
  const sameDay = state.lastPlayedDate === today;
  if (!sameDay) {
    // New day — counters reset.
    return { attemptsToday: 0, wonTodayFlag: false, sameDay: false };
  }
  return {
    attemptsToday: state.attemptsToday || 0,
    wonTodayFlag: !!state.wonTodayFlag,
    sameDay: true,
  };
};

// Has the player exhausted today's tournament attempts? Returns true/false.
// Used to gate the PLAY NOW button on the tournament home screen.
// Locked when: attempts used up (3) OR a trophy already won today.
const hasPlayedTournamentToday = (state, date = new Date()) => {
  const daily = effectiveDailyState(state, date);
  if (daily.wonTodayFlag) return true;
  if (daily.attemptsToday >= TOURNAMENT_DAILY_ATTEMPT_CAP) return true;
  return false;
};

// ============ TOURNAMENT MODE — WORLD CUP POOL (Phase 2, Deploy 1) ============
// 180 players authored for tournament mode only. Daily game and 1v1 still use
// PLAYER_POOL (384). Six attributes per player on a 1-10 scale (0 never used,
// 1 used rarely). Plus: overall (avg, one decimal), position (GK/OUT),
// peteEligible ("Y"/"N").
//
// peteEligible = "Y" → in the pool Pete draws from in R3, AND the pool the
// player drafts from in R3. 108 players currently flagged Y.
// R1/R2 still use the daily PLAYER_POOL — Deploy 2 wires those.

const WORLD_CUP_POOL = [
  { name: "Pelé", country: "Brazil", era: "1950s–70s", position: "OUT", oneOff: 10, seasonLong: 10, style: 10, character: 9, chaos: 5, legacy: 10, overall: 9, peteEligible: "Y" },
  { name: "Diego Maradona", country: "Argentina", era: "1980s–90s", position: "OUT", oneOff: 10, seasonLong: 9, style: 10, character: 4, chaos: 10, legacy: 10, overall: 8.8, peteEligible: "Y" },
  { name: "Lionel Messi", country: "Argentina", era: "2000s–2020s", position: "OUT", oneOff: 10, seasonLong: 10, style: 10, character: 8, chaos: 4, legacy: 10, overall: 8.7, peteEligible: "Y" },
  { name: "Zinedine Zidane", country: "France", era: "1990s–2000s", position: "OUT", oneOff: 9, seasonLong: 9, style: 10, character: 6, chaos: 8, legacy: 9, overall: 8.5, peteEligible: "Y" },
  { name: "Johan Cruyff", country: "Netherlands", era: "1970s", position: "OUT", oneOff: 8, seasonLong: 10, style: 10, character: 7, chaos: 5, legacy: 9, overall: 8.2, peteEligible: "Y" },
  { name: "Ronaldo (R9)", country: "Brazil", era: "1990s–2000s", position: "OUT", oneOff: 10, seasonLong: 6, style: 9, character: 5, chaos: 7, legacy: 9, overall: 7.7, peteEligible: "Y" },
  { name: "Franz Beckenbauer", country: "Germany", era: "1960s–70s", position: "OUT", oneOff: 7, seasonLong: 10, style: 9, character: 10, chaos: 3, legacy: 9, overall: 8, peteEligible: "Y" },
  { name: "Cristiano Ronaldo", country: "Portugal", era: "2000s–2020s", position: "OUT", oneOff: 10, seasonLong: 8, style: 9, character: 7, chaos: 6, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Gerd Müller", country: "Germany", era: "1970s", position: "OUT", oneOff: 10, seasonLong: 10, style: 7, character: 6, chaos: 4, legacy: 9, overall: 7.7, peteEligible: "Y" },
  { name: "Eusébio", country: "Portugal", era: "1960s", position: "OUT", oneOff: 10, seasonLong: 9, style: 9, character: 7, chaos: 5, legacy: 8, overall: 8, peteEligible: "Y" },
  { name: "Alfredo Di Stéfano", country: "Argentina/Spain", era: "1950s–60s", position: "OUT", oneOff: 3, seasonLong: 6, style: 10, character: 8, chaos: 4, legacy: 6, overall: 6.2, peteEligible: "N" },
  { name: "Ferenc Puskás", country: "Hungary", era: "1950s", position: "OUT", oneOff: 8, seasonLong: 9, style: 10, character: 7, chaos: 6, legacy: 8, overall: 8, peteEligible: "Y" },
  { name: "Bobby Charlton", country: "England", era: "1960s", position: "OUT", oneOff: 9, seasonLong: 9, style: 8, character: 9, chaos: 3, legacy: 9, overall: 7.8, peteEligible: "Y" },
  { name: "Bobby Moore", country: "England", era: "1960s–70s", position: "OUT", oneOff: 9, seasonLong: 10, style: 8, character: 10, chaos: 2, legacy: 9, overall: 8, peteEligible: "Y" },
  { name: "Roberto Baggio", country: "Italy", era: "1990s", position: "OUT", oneOff: 9, seasonLong: 9, style: 10, character: 6, chaos: 8, legacy: 8, overall: 8.3, peteEligible: "Y" },
  { name: "Romário", country: "Brazil", era: "1990s", position: "OUT", oneOff: 10, seasonLong: 9, style: 9, character: 4, chaos: 8, legacy: 9, overall: 8.2, peteEligible: "Y" },
  { name: "Ronaldinho", country: "Brazil", era: "2000s", position: "OUT", oneOff: 8, seasonLong: 7, style: 10, character: 7, chaos: 7, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Paolo Maldini", country: "Italy", era: "1990s–2000s", position: "OUT", oneOff: 6, seasonLong: 10, style: 9, character: 10, chaos: 1, legacy: 8, overall: 7.3, peteEligible: "Y" },
  { name: "Zico", country: "Brazil", era: "1980s", position: "OUT", oneOff: 8, seasonLong: 9, style: 10, character: 7, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Michel Platini", country: "France", era: "1980s", position: "OUT", oneOff: 8, seasonLong: 9, style: 10, character: 7, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Garrincha", country: "Brazil", era: "1950s–60s", position: "OUT", oneOff: 10, seasonLong: 10, style: 10, character: 4, chaos: 9, legacy: 9, overall: 8.7, peteEligible: "Y" },
  { name: "Lev Yashin", country: "Soviet Union", era: "1950s–60s", position: "GK", oneOff: 9, seasonLong: 10, style: 8, character: 9, chaos: 3, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Just Fontaine", country: "France", era: "1950s", position: "OUT", oneOff: 10, seasonLong: 10, style: 7, character: 6, chaos: 5, legacy: 8, overall: 7.7, peteEligible: "Y" },
  { name: "Lothar Matthäus", country: "Germany", era: "1980s–2000s", position: "OUT", oneOff: 8, seasonLong: 9, style: 7, character: 9, chaos: 4, legacy: 8, overall: 7.5, peteEligible: "Y" },
  { name: "Franco Baresi", country: "Italy", era: "1980s–90s", position: "OUT", oneOff: 7, seasonLong: 10, style: 8, character: 10, chaos: 2, legacy: 8, overall: 7.5, peteEligible: "Y" },
  { name: "Andrés Iniesta", country: "Spain", era: "2000s–2010s", position: "OUT", oneOff: 10, seasonLong: 9, style: 10, character: 9, chaos: 2, legacy: 9, overall: 8.2, peteEligible: "Y" },
  { name: "Xavi", country: "Spain", era: "2000s–2010s", position: "OUT", oneOff: 6, seasonLong: 10, style: 10, character: 9, chaos: 1, legacy: 8, overall: 7.3, peteEligible: "Y" },
  { name: "Andrea Pirlo", country: "Italy", era: "2000s–2010s", position: "OUT", oneOff: 8, seasonLong: 9, style: 10, character: 8, chaos: 4, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Gianluigi Buffon", country: "Italy", era: "2000s–2010s", position: "GK", oneOff: 8, seasonLong: 10, style: 7, character: 9, chaos: 2, legacy: 8, overall: 7.3, peteEligible: "Y" },
  { name: "Fabio Cannavaro", country: "Italy", era: "2000s", position: "OUT", oneOff: 9, seasonLong: 10, style: 7, character: 9, chaos: 3, legacy: 8, overall: 7.7, peteEligible: "Y" },
  { name: "Cafu", country: "Brazil", era: "1990s–2000s", position: "OUT", oneOff: 6, seasonLong: 9, style: 8, character: 10, chaos: 3, legacy: 8, overall: 7.3, peteEligible: "Y" },
  { name: "Carlos Alberto", country: "Brazil", era: "1970s", position: "OUT", oneOff: 10, seasonLong: 9, style: 9, character: 9, chaos: 4, legacy: 8, overall: 8.2, peteEligible: "Y" },
  { name: "Jairzinho", country: "Brazil", era: "1970s", position: "OUT", oneOff: 10, seasonLong: 10, style: 8, character: 6, chaos: 6, legacy: 8, overall: 8, peteEligible: "Y" },
  { name: "Tostão", country: "Brazil", era: "1970s", position: "OUT", oneOff: 8, seasonLong: 9, style: 9, character: 8, chaos: 4, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "Gerson", country: "Brazil", era: "1970s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 7, chaos: 4, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Rivelino", country: "Brazil", era: "1970s", position: "OUT", oneOff: 9, seasonLong: 9, style: 9, character: 6, chaos: 7, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Socrates", country: "Brazil", era: "1980s", position: "OUT", oneOff: 8, seasonLong: 9, style: 9, character: 9, chaos: 7, legacy: 7, overall: 8.2, peteEligible: "Y" },
  { name: "Falcão", country: "Brazil", era: "1980s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 8, chaos: 5, legacy: 7, overall: 7.3, peteEligible: "Y" },
  { name: "Hugo Sánchez", country: "Mexico", era: "1980s–90s", position: "OUT", oneOff: 7, seasonLong: 6, style: 9, character: 7, chaos: 6, legacy: 5, overall: 6.7, peteEligible: "N" },
  { name: "Hristo Stoichkov", country: "Bulgaria", era: "1990s", position: "OUT", oneOff: 10, seasonLong: 9, style: 9, character: 3, chaos: 9, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Kylian Mbappé", country: "France", era: "2010s–2020s", position: "OUT", oneOff: 10, seasonLong: 9, style: 9, character: 6, chaos: 6, legacy: 8, overall: 8, peteEligible: "Y" },
  { name: "Neymar", country: "Brazil", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 7, style: 10, character: 4, chaos: 8, legacy: 6, overall: 7.2, peteEligible: "N" },
  { name: "Luka Modrić", country: "Croatia", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 10, style: 9, character: 9, chaos: 3, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Manuel Neuer", country: "Germany", era: "2010s–2020s", position: "GK", oneOff: 8, seasonLong: 10, style: 8, character: 9, chaos: 4, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Toni Kroos", country: "Germany", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 9, style: 9, character: 8, chaos: 2, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Thomas Müller", country: "Germany", era: "2010s–2020s", position: "OUT", oneOff: 9, seasonLong: 9, style: 6, character: 8, chaos: 5, legacy: 8, overall: 7.5, peteEligible: "Y" },
  { name: "Sergio Ramos", country: "Spain", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 8, style: 7, character: 6, chaos: 8, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Sergio Busquets", country: "Spain", era: "2010s–2020s", position: "OUT", oneOff: 5, seasonLong: 10, style: 9, character: 8, chaos: 1, legacy: 7, overall: 6.7, peteEligible: "Y" },
  { name: "David Villa", country: "Spain", era: "2010s", position: "OUT", oneOff: 9, seasonLong: 9, style: 8, character: 7, chaos: 4, legacy: 7, overall: 7.3, peteEligible: "Y" },
  { name: "Iker Casillas", country: "Spain", era: "2000s–2010s", position: "GK", oneOff: 8, seasonLong: 9, style: 7, character: 9, chaos: 3, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Diego Forlán", country: "Uruguay", era: "2010s", position: "OUT", oneOff: 10, seasonLong: 10, style: 8, character: 7, chaos: 5, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Luis Suárez", country: "Uruguay", era: "2010s–2020s", position: "OUT", oneOff: 9, seasonLong: 8, style: 8, character: 3, chaos: 10, legacy: 6, overall: 7.3, peteEligible: "Y" },
  { name: "Edinson Cavani", country: "Uruguay", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 8, style: 7, character: 8, chaos: 4, legacy: 6, overall: 6.7, peteEligible: "N" },
  { name: "Arjen Robben", country: "Netherlands", era: "2010s", position: "OUT", oneOff: 9, seasonLong: 9, style: 9, character: 6, chaos: 7, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Wesley Sneijder", country: "Netherlands", era: "2010s", position: "OUT", oneOff: 9, seasonLong: 10, style: 8, character: 7, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "James Rodríguez", country: "Colombia", era: "2010s", position: "OUT", oneOff: 10, seasonLong: 9, style: 9, character: 6, chaos: 5, legacy: 6, overall: 7.5, peteEligible: "N" },
  { name: "Eden Hazard", country: "Belgium", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 8, style: 9, character: 6, chaos: 4, legacy: 6, overall: 6.7, peteEligible: "N" },
  { name: "Kevin De Bruyne", country: "Belgium", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 8, style: 9, character: 7, chaos: 3, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Romelu Lukaku", country: "Belgium", era: "2010s–2020s", position: "OUT", oneOff: 6, seasonLong: 7, style: 6, character: 6, chaos: 4, legacy: 5, overall: 5.7, peteEligible: "N" },
  { name: "Harry Kane", country: "England", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 9, style: 7, character: 8, chaos: 3, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Marco van Basten", country: "Netherlands", era: "1980s–90s", position: "OUT", oneOff: 9, seasonLong: 7, style: 10, character: 6, chaos: 4, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Ruud Gullit", country: "Netherlands", era: "1980s–90s", position: "OUT", oneOff: 8, seasonLong: 8, style: 10, character: 8, chaos: 5, legacy: 6, overall: 7.5, peteEligible: "N" },
  { name: "Frank Rijkaard", country: "Netherlands", era: "1980s–90s", position: "OUT", oneOff: 7, seasonLong: 8, style: 8, character: 7, chaos: 6, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Dennis Bergkamp", country: "Netherlands", era: "1990s", position: "OUT", oneOff: 10, seasonLong: 8, style: 10, character: 7, chaos: 4, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Patrick Kluivert", country: "Netherlands", era: "1990s–2000s", position: "OUT", oneOff: 8, seasonLong: 8, style: 8, character: 5, chaos: 5, legacy: 6, overall: 6.7, peteEligible: "N" },
  { name: "Edgar Davids", country: "Netherlands", era: "1990s–2000s", position: "OUT", oneOff: 6, seasonLong: 8, style: 7, character: 8, chaos: 7, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Clarence Seedorf", country: "Netherlands", era: "1990s–2000s", position: "OUT", oneOff: 5, seasonLong: 8, style: 9, character: 7, chaos: 3, legacy: 5, overall: 6.2, peteEligible: "N" },
  { name: "Edwin van der Sar", country: "Netherlands", era: "1990s–2000s", position: "GK", oneOff: 7, seasonLong: 9, style: 7, character: 8, chaos: 2, legacy: 6, overall: 6.5, peteEligible: "N" },
  { name: "Rivaldo", country: "Brazil", era: "1990s–2000s", position: "OUT", oneOff: 9, seasonLong: 9, style: 10, character: 5, chaos: 7, legacy: 8, overall: 8, peteEligible: "Y" },
  { name: "Roberto Carlos", country: "Brazil", era: "1990s–2000s", position: "OUT", oneOff: 8, seasonLong: 8, style: 9, character: 6, chaos: 6, legacy: 7, overall: 7.3, peteEligible: "Y" },
  { name: "Kléberson", country: "Brazil", era: "2000s", position: "OUT", oneOff: 4, seasonLong: 6, style: 6, character: 6, chaos: 3, legacy: 4, overall: 4.8, peteEligible: "N" },
  { name: "Lilian Thuram", country: "France", era: "1990s–2000s", position: "OUT", oneOff: 9, seasonLong: 9, style: 8, character: 9, chaos: 3, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "Marcel Desailly", country: "France", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 10, style: 8, character: 9, chaos: 3, legacy: 7, overall: 7.3, peteEligible: "Y" },
  { name: "Didier Deschamps", country: "France", era: "1990s", position: "OUT", oneOff: 6, seasonLong: 9, style: 6, character: 10, chaos: 2, legacy: 7, overall: 6.7, peteEligible: "Y" },
  { name: "Thierry Henry", country: "France", era: "1990s–2010s", position: "OUT", oneOff: 8, seasonLong: 8, style: 10, character: 7, chaos: 5, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "David Trezeguet", country: "France", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 7, style: 7, character: 7, chaos: 4, legacy: 5, overall: 6.2, peteEligible: "N" },
  { name: "Patrick Vieira", country: "France", era: "1990s–2000s", position: "OUT", oneOff: 6, seasonLong: 8, style: 8, character: 9, chaos: 5, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Gabriel Batistuta", country: "Argentina", era: "1990s–2000s", position: "OUT", oneOff: 10, seasonLong: 9, style: 8, character: 9, chaos: 4, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Juan Sebastián Verón", country: "Argentina", era: "1990s–2000s", position: "OUT", oneOff: 5, seasonLong: 6, style: 9, character: 6, chaos: 5, legacy: 5, overall: 6, peteEligible: "N" },
  { name: "Pep Guardiola", country: "Spain", era: "1990s", position: "OUT", oneOff: 5, seasonLong: 8, style: 9, character: 8, chaos: 3, legacy: 5, overall: 6.3, peteEligible: "N" },
  { name: "Gordon Banks", country: "England", era: "1960s–70s", position: "GK", oneOff: 10, seasonLong: 9, style: 7, character: 9, chaos: 2, legacy: 8, overall: 7.5, peteEligible: "Y" },
  { name: "Dino Zoff", country: "Italy", era: "1970s–80s", position: "GK", oneOff: 8, seasonLong: 10, style: 7, character: 10, chaos: 2, legacy: 9, overall: 7.7, peteEligible: "Y" },
  { name: "Oliver Kahn", country: "Germany", era: "1990s–2000s", position: "GK", oneOff: 9, seasonLong: 10, style: 7, character: 8, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Claudio Taffarel", country: "Brazil", era: "1990s", position: "GK", oneOff: 7, seasonLong: 9, style: 5, character: 8, chaos: 3, legacy: 7, overall: 6.5, peteEligible: "Y" },
  { name: "Daniel Passarella", country: "Argentina", era: "1970s–80s", position: "OUT", oneOff: 8, seasonLong: 9, style: 7, character: 9, chaos: 5, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "Paolo Rossi", country: "Italy", era: "1980s", position: "OUT", oneOff: 10, seasonLong: 9, style: 7, character: 7, chaos: 6, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Marco Tardelli", country: "Italy", era: "1980s", position: "OUT", oneOff: 9, seasonLong: 9, style: 7, character: 8, chaos: 6, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Andreas Brehme", country: "Germany", era: "1980s–90s", position: "OUT", oneOff: 10, seasonLong: 9, style: 7, character: 8, chaos: 4, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "Jürgen Klinsmann", country: "Germany", era: "1990s", position: "OUT", oneOff: 9, seasonLong: 9, style: 8, character: 8, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Rudi Völler", country: "Germany", era: "1980s–90s", position: "OUT", oneOff: 8, seasonLong: 8, style: 7, character: 7, chaos: 6, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Karl-Heinz Rummenigge", country: "Germany", era: "1980s", position: "OUT", oneOff: 9, seasonLong: 9, style: 9, character: 8, chaos: 5, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Enzo Francescoli", country: "Uruguay", era: "1980s–90s", position: "OUT", oneOff: 7, seasonLong: 8, style: 9, character: 8, chaos: 4, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "George Weah", country: "Liberia", era: "1990s", position: "OUT", oneOff: 8, seasonLong: 8, style: 9, character: 9, chaos: 5, legacy: 5, overall: 7.3, peteEligible: "N" },
  { name: "Roger Milla", country: "Cameroon", era: "1990s", position: "OUT", oneOff: 10, seasonLong: 9, style: 7, character: 8, chaos: 8, legacy: 7, overall: 8.2, peteEligible: "Y" },
  { name: "El Hadji Diouf", country: "Senegal", era: "2000s", position: "OUT", oneOff: 8, seasonLong: 9, style: 8, character: 3, chaos: 9, legacy: 6, overall: 7.2, peteEligible: "Y" },
  { name: "Asamoah Gyan", country: "Ghana", era: "2010s", position: "OUT", oneOff: 9, seasonLong: 8, style: 7, character: 8, chaos: 6, legacy: 6, overall: 7.3, peteEligible: "N" },
  { name: "Park Ji-sung", country: "South Korea", era: "2000s–2010s", position: "OUT", oneOff: 8, seasonLong: 9, style: 7, character: 9, chaos: 4, legacy: 6, overall: 7.2, peteEligible: "N" },
  { name: "Hidetoshi Nakata", country: "Japan", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 8, style: 8, character: 8, chaos: 4, legacy: 5, overall: 6.7, peteEligible: "N" },
  { name: "Tim Cahill", country: "Australia", era: "2010s", position: "OUT", oneOff: 9, seasonLong: 8, style: 6, character: 8, chaos: 5, legacy: 5, overall: 6.8, peteEligible: "N" },
  { name: "Landon Donovan", country: "USA", era: "2010s", position: "OUT", oneOff: 10, seasonLong: 8, style: 7, character: 7, chaos: 5, legacy: 6, overall: 7.2, peteEligible: "Y" },
  { name: "Javier Mascherano", country: "Argentina", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 10, style: 7, character: 9, chaos: 3, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Ángel Di María", country: "Argentina", era: "2010s–2020s", position: "OUT", oneOff: 10, seasonLong: 8, style: 9, character: 7, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Emi Martínez", country: "Argentina", era: "2020s", position: "GK", oneOff: 10, seasonLong: 9, style: 6, character: 7, chaos: 8, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Antoine Griezmann", country: "France", era: "2010s–2020s", position: "OUT", oneOff: 9, seasonLong: 10, style: 8, character: 8, chaos: 4, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Paul Pogba", country: "France", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 8, style: 9, character: 5, chaos: 6, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "N'Golo Kanté", country: "France", era: "2010s–2020s", position: "OUT", oneOff: 6, seasonLong: 10, style: 7, character: 10, chaos: 1, legacy: 7, overall: 6.8, peteEligible: "Y" },
  { name: "Hugo Lloris", country: "France", era: "2010s–2020s", position: "GK", oneOff: 7, seasonLong: 9, style: 7, character: 9, chaos: 3, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Raphaël Varane", country: "France", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 10, style: 8, character: 9, chaos: 2, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Olivier Giroud", country: "France", era: "2010s–2020s", position: "OUT", oneOff: 6, seasonLong: 8, style: 7, character: 8, chaos: 3, legacy: 6, overall: 6.3, peteEligible: "N" },
  { name: "Mesut Özil", country: "Germany", era: "2010s", position: "OUT", oneOff: 7, seasonLong: 9, style: 10, character: 5, chaos: 5, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Miroslav Klose", country: "Germany", era: "2000s–2010s", position: "OUT", oneOff: 8, seasonLong: 10, style: 7, character: 9, chaos: 2, legacy: 8, overall: 7.3, peteEligible: "Y" },
  { name: "Bastian Schweinsteiger", country: "Germany", era: "2000s–2010s", position: "OUT", oneOff: 9, seasonLong: 10, style: 8, character: 9, chaos: 3, legacy: 8, overall: 7.8, peteEligible: "Y" },
  { name: "Philipp Lahm", country: "Germany", era: "2000s–2010s", position: "OUT", oneOff: 7, seasonLong: 10, style: 8, character: 10, chaos: 1, legacy: 8, overall: 7.3, peteEligible: "Y" },
  { name: "Mats Hummels", country: "Germany", era: "2010s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 8, chaos: 3, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Jérôme Boateng", country: "Germany", era: "2010s", position: "OUT", oneOff: 6, seasonLong: 9, style: 8, character: 7, chaos: 4, legacy: 7, overall: 6.8, peteEligible: "Y" },
  { name: "Mario Götze", country: "Germany", era: "2010s", position: "OUT", oneOff: 10, seasonLong: 6, style: 8, character: 6, chaos: 4, legacy: 9, overall: 7.2, peteEligible: "Y" },
  { name: "Mohamed Salah", country: "Egypt", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 7, style: 9, character: 8, chaos: 3, legacy: 5, overall: 6.7, peteEligible: "N" },
  { name: "Sadio Mané", country: "Senegal", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 8, style: 9, character: 9, chaos: 3, legacy: 5, overall: 7, peteEligible: "N" },
  { name: "Riyad Mahrez", country: "Algeria", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 7, style: 9, character: 6, chaos: 4, legacy: 4, overall: 6.3, peteEligible: "N" },
  { name: "Vinícius Júnior", country: "Brazil", era: "2020s–present", position: "OUT", oneOff: 8, seasonLong: 7, style: 10, character: 6, chaos: 6, legacy: 5, overall: 7, peteEligible: "N" },
  { name: "Mario Kempes", country: "Argentina", era: "1970s", position: "OUT", oneOff: 10, seasonLong: 10, style: 8, character: 7, chaos: 5, legacy: 8, overall: 8, peteEligible: "Y" },
  { name: "Osvaldo Ardiles", country: "Argentina", era: "1970s–80s", position: "OUT", oneOff: 6, seasonLong: 9, style: 8, character: 8, chaos: 4, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Sergio Agüero", country: "Argentina", era: "2010s–2020s", position: "OUT", oneOff: 8, seasonLong: 7, style: 9, character: 7, chaos: 4, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Gonzalo Higuaín", country: "Argentina", era: "2010s", position: "OUT", oneOff: 9, seasonLong: 7, style: 8, character: 5, chaos: 5, legacy: 5, overall: 6.5, peteEligible: "N" },
  { name: "Carlos Tevez", country: "Argentina", era: "2000s–2010s", position: "OUT", oneOff: 8, seasonLong: 8, style: 8, character: 7, chaos: 6, legacy: 6, overall: 7.2, peteEligible: "N" },
  { name: "Juan Román Riquelme", country: "Argentina", era: "2000s", position: "OUT", oneOff: 7, seasonLong: 8, style: 10, character: 7, chaos: 4, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Diego Godín", country: "Uruguay", era: "2010s", position: "OUT", oneOff: 8, seasonLong: 10, style: 7, character: 10, chaos: 3, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "Luis Figo", country: "Portugal", era: "1990s–2000s", position: "OUT", oneOff: 8, seasonLong: 9, style: 10, character: 7, chaos: 5, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Rui Costa", country: "Portugal", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 8, style: 10, character: 7, chaos: 4, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Pepe", country: "Portugal", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 9, style: 6, character: 5, chaos: 8, legacy: 6, overall: 6.8, peteEligible: "Y" },
  { name: "David Beckham", country: "England", era: "1990s–2000s", position: "OUT", oneOff: 9, seasonLong: 8, style: 9, character: 6, chaos: 7, legacy: 7, overall: 7.7, peteEligible: "Y" },
  { name: "Paul Gascoigne", country: "England", era: "1990s", position: "OUT", oneOff: 10, seasonLong: 9, style: 10, character: 4, chaos: 9, legacy: 7, overall: 8.2, peteEligible: "Y" },
  { name: "Michael Owen", country: "England", era: "1990s–2000s", position: "OUT", oneOff: 10, seasonLong: 8, style: 8, character: 7, chaos: 4, legacy: 7, overall: 7.3, peteEligible: "Y" },
  { name: "Frank Lampard", country: "England", era: "2000s–2010s", position: "OUT", oneOff: 6, seasonLong: 7, style: 8, character: 8, chaos: 3, legacy: 5, overall: 6.2, peteEligible: "N" },
  { name: "Steven Gerrard", country: "England", era: "2000s–2010s", position: "OUT", oneOff: 7, seasonLong: 8, style: 8, character: 8, chaos: 4, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "John Terry", country: "England", era: "2000s–2010s", position: "OUT", oneOff: 6, seasonLong: 8, style: 6, character: 7, chaos: 5, legacy: 5, overall: 6.2, peteEligible: "N" },
  { name: "Wayne Rooney", country: "England", era: "2000s–2010s", position: "OUT", oneOff: 7, seasonLong: 7, style: 8, character: 6, chaos: 7, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Raul", country: "Spain", era: "1990s–2000s", position: "OUT", oneOff: 8, seasonLong: 8, style: 9, character: 7, chaos: 4, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Fernando Torres", country: "Spain", era: "2000s–2010s", position: "OUT", oneOff: 8, seasonLong: 7, style: 9, character: 7, chaos: 4, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Carles Puyol", country: "Spain", era: "2000s–2010s", position: "OUT", oneOff: 9, seasonLong: 9, style: 6, character: 10, chaos: 4, legacy: 8, overall: 7.7, peteEligible: "Y" },
  { name: "Lothar Emmerich", country: "Germany", era: "1960s", position: "OUT", oneOff: 7, seasonLong: 8, style: 7, character: 7, chaos: 4, legacy: 6, overall: 6.5, peteEligible: "N" },
  { name: "Uwe Seeler", country: "Germany", era: "1960s–70s", position: "OUT", oneOff: 8, seasonLong: 9, style: 7, character: 9, chaos: 3, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Jimmy Greaves", country: "England", era: "1960s", position: "OUT", oneOff: 9, seasonLong: 8, style: 9, character: 6, chaos: 5, legacy: 6, overall: 7.2, peteEligible: "N" },
  { name: "Geoff Hurst", country: "England", era: "1960s", position: "OUT", oneOff: 10, seasonLong: 8, style: 7, character: 7, chaos: 5, legacy: 8, overall: 7.5, peteEligible: "Y" },
  { name: "Gianluca Vialli", country: "Italy", era: "1980s–90s", position: "OUT", oneOff: 7, seasonLong: 8, style: 8, character: 8, chaos: 4, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Salvatore Schillaci", country: "Italy", era: "1990", position: "OUT", oneOff: 10, seasonLong: 10, style: 7, character: 7, chaos: 7, legacy: 7, overall: 8, peteEligible: "Y" },
  { name: "Giuseppe Bergomi", country: "Italy", era: "1980s–90s", position: "OUT", oneOff: 6, seasonLong: 10, style: 7, character: 10, chaos: 2, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Roberto Donadoni", country: "Italy", era: "1980s–90s", position: "OUT", oneOff: 7, seasonLong: 8, style: 9, character: 7, chaos: 3, legacy: 6, overall: 6.7, peteEligible: "N" },
  { name: "Giancarlo Antognoni", country: "Italy", era: "1980s", position: "OUT", oneOff: 7, seasonLong: 9, style: 9, character: 8, chaos: 3, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Fernando Hierro", country: "Spain", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 8, style: 7, character: 9, chaos: 4, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Andoni Zubizarreta", country: "Spain", era: "1980s–90s", position: "GK", oneOff: 7, seasonLong: 9, style: 6, character: 8, chaos: 3, legacy: 5, overall: 6.3, peteEligible: "N" },
  { name: "Emilio Butragueño", country: "Spain", era: "1980s", position: "OUT", oneOff: 9, seasonLong: 8, style: 9, character: 7, chaos: 4, legacy: 6, overall: 7.2, peteEligible: "N" },
  { name: "Davor Šuker", country: "Croatia", era: "1990s", position: "OUT", oneOff: 9, seasonLong: 10, style: 9, character: 7, chaos: 5, legacy: 7, overall: 7.8, peteEligible: "Y" },
  { name: "Robert Prosinečki", country: "Croatia", era: "1990s", position: "OUT", oneOff: 8, seasonLong: 8, style: 10, character: 6, chaos: 6, legacy: 6, overall: 7.3, peteEligible: "N" },
  { name: "Zvonimir Boban", country: "Croatia", era: "1990s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 8, chaos: 6, legacy: 6, overall: 7.3, peteEligible: "N" },
  { name: "Hakan Şükür", country: "Turkey", era: "2000s", position: "OUT", oneOff: 10, seasonLong: 9, style: 7, character: 7, chaos: 5, legacy: 6, overall: 7.3, peteEligible: "N" },
  { name: "Pavel Nedvěd", country: "Czech Republic", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 9, style: 9, character: 8, chaos: 5, legacy: 6, overall: 7.3, peteEligible: "N" },
  { name: "Igor Belanov", country: "Soviet Union", era: "1980s", position: "OUT", oneOff: 9, seasonLong: 8, style: 8, character: 7, chaos: 5, legacy: 6, overall: 7.2, peteEligible: "N" },
  { name: "Tomáš Rosický", country: "Czech Republic", era: "2000s–2010s", position: "OUT", oneOff: 7, seasonLong: 7, style: 9, character: 7, chaos: 3, legacy: 5, overall: 6.3, peteEligible: "N" },
  { name: "Karel Poborský", country: "Czech Republic", era: "1990s–2000s", position: "OUT", oneOff: 7, seasonLong: 8, style: 8, character: 7, chaos: 5, legacy: 5, overall: 6.7, peteEligible: "N" },
  { name: "Julián Álvarez", country: "Argentina", era: "2020s", position: "OUT", oneOff: 8, seasonLong: 9, style: 7, character: 8, chaos: 4, legacy: 7, overall: 7.2, peteEligible: "Y" },
  { name: "Rodrigo De Paul", country: "Argentina", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 9, style: 7, character: 8, chaos: 5, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Cristian Romero", country: "Argentina", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 9, style: 6, character: 7, chaos: 7, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Enzo Fernández", country: "Argentina", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 7, chaos: 4, legacy: 6, overall: 6.8, peteEligible: "N" },
  { name: "Lautaro Martínez", country: "Argentina", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 7, style: 8, character: 7, chaos: 4, legacy: 6, overall: 6.5, peteEligible: "N" },
  { name: "Jude Bellingham", country: "England", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 7, style: 8, character: 7, chaos: 3, legacy: 4, overall: 6, peteEligible: "N" },
  { name: "Bukayo Saka", country: "England", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 7, style: 8, character: 7, chaos: 2, legacy: 4, overall: 5.8, peteEligible: "N" },
  { name: "Phil Foden", country: "England", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 6, style: 8, character: 6, chaos: 3, legacy: 3, overall: 5.3, peteEligible: "N" },
  { name: "Declan Rice", country: "England", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 8, style: 7, character: 8, chaos: 3, legacy: 4, overall: 6, peteEligible: "N" },
  { name: "Achraf Hakimi", country: "Morocco", era: "2020s", position: "OUT", oneOff: 8, seasonLong: 9, style: 8, character: 7, chaos: 4, legacy: 6, overall: 7, peteEligible: "Y" },
  { name: "Hakim Ziyech", country: "Morocco", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 8, style: 8, character: 6, chaos: 4, legacy: 5, overall: 6.3, peteEligible: "N" },
  { name: "Yassine Bounou", country: "Morocco", era: "2020s", position: "GK", oneOff: 9, seasonLong: 10, style: 6, character: 9, chaos: 4, legacy: 7, overall: 7.5, peteEligible: "Y" },
  { name: "Sofyan Amrabat", country: "Morocco", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 10, style: 7, character: 9, chaos: 3, legacy: 7, overall: 7, peteEligible: "Y" },
  { name: "Erling Haaland", country: "Norway", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 6, style: 7, character: 6, chaos: 3, legacy: 1, overall: 5, peteEligible: "N" },
  { name: "Rodri", country: "Spain", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 8, chaos: 2, legacy: 5, overall: 6.5, peteEligible: "N" },
  { name: "Pedri", country: "Spain", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 7, style: 8, character: 7, chaos: 2, legacy: 4, overall: 5.7, peteEligible: "N" },
  { name: "Joaquín Correa", country: "Argentina", era: "2020s", position: "OUT", oneOff: 5, seasonLong: 6, style: 7, character: 6, chaos: 4, legacy: 4, overall: 5.3, peteEligible: "N" },
  { name: "Theo Hernández", country: "France", era: "2020s", position: "OUT", oneOff: 7, seasonLong: 9, style: 8, character: 7, chaos: 5, legacy: 6, overall: 7, peteEligible: "N" },
  { name: "Aurélien Tchouaméni", country: "France", era: "2020s", position: "OUT", oneOff: 6, seasonLong: 8, style: 7, character: 7, chaos: 2, legacy: 5, overall: 5.8, peteEligible: "N" },
  { name: "Heung-min Son", country: "South Korea", era: "2010s–2020s", position: "OUT", oneOff: 7, seasonLong: 7, style: 8, character: 8, chaos: 3, legacy: 4, overall: 6.2, peteEligible: "N" },
];

// Lookup a player object in WORLD_CUP_POOL by name. Returns null if not found.
const findWorldCupPlayer = (name) => {
  if (!name) return null;
  return WORLD_CUP_POOL.find(p => p.name === name) || null;
};

// Real attribute scoring for tournament R3. Returns the standard category map
// used elsewhere in the game. Falls back to stubAttributeScores for names not
// in the World Cup pool (e.g. R1/R2 picks coming from the daily pool).
const worldCupAttributeScores = (playerName) => {
  const p = findWorldCupPlayer(playerName);
  if (!p) return stubAttributeScores(playerName);
  return {
    'One-Off':     p.oneOff,
    'Season-Long': p.seasonLong,
    'Style':       p.style,
    'Character':   p.character,
    'Chaos':       p.chaos,
    'Legacy':      p.legacy,
  };
};

// The 108-player Pete-eligible subset. Used for both Pete's R3 draws AND
// the player's R3 draft cards. Returns full World Cup pool player objects.
const getPeteEligiblePool = () => WORLD_CUP_POOL.filter(p => p.peteEligible === "Y");

// Enrich a raw WORLD_CUP_POOL player into the shape draft cards expect.
// Tier is synthesised from Overall (Legend/Star/Cult/Wildcard bands).
// Position maps GK → GK, everything else → MID (the daily-game GK cap reads
// position === "GK", so this preserves the max-1-GK rule).
// Note shows the player's country and era — replaces daily-pool flavour text.
// Used by both generateR3Draft and generateTournamentDraft.
const enrichWorldCupCard = (p) => ({
  name: p.name,
  tier: p.overall >= 8.5 ? 'Legend'
      : p.overall >= 7.5 ? 'Star'
      : p.overall >= 6.5 ? 'Cult'
      : 'Wildcard',
  position: p.position === 'GK' ? 'GK' : 'MID',
  flag: '⚽',
  note: `${p.country} — ${p.era}`,
  overall: p.overall,
  peteEligible: p.peteEligible,
  isWorldCup: true,
});

// Pure random shuffle helper for picking N from the World Cup pool.
const pickRandomFromPool = (pool, n, excludeNames = []) => {
  const available = pool.filter(p => !excludeNames.includes(p.name));
  const a = [...available];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
};

// Generate a 6-card draft from the full World Cup 180 for R1 and R2 player drafts.
// Pure random — no Legend quota, no tier balancing. Phase 2, Deploy 2 / Stage 2.
// Returns three rounds of two cards each, matching generateDraft()'s shape.
const generateTournamentDraft = (excludeNames = []) => {
  const picked = pickRandomFromPool(WORLD_CUP_POOL, 6, excludeNames);
  const enriched = picked.map(enrichWorldCupCard);
  return [
    [enriched[0], enriched[1]],
    [enriched[2], enriched[3]],
    [enriched[4], enriched[5]],
  ];
};

// Generate a 6-card draft from the Pete-eligible 108 for R3 player drafts.
// Used in R3 ONLY. Excludes any names in excludeNames (typically Pete's three picks).
// GK cap applied at pick-time via the existing UI logic.
const generateR3Draft = (excludeNames = []) => {
  const picked = pickRandomFromPool(getPeteEligiblePool(), 6, excludeNames);
  const enriched = picked.map(enrichWorldCupCard);
  return [
    [enriched[0], enriched[1]],
    [enriched[2], enriched[3]],
    [enriched[4], enriched[5]],
  ];
};

// ============ END TOURNAMENT MODE — WORLD CUP POOL ============

// ============ TOURNAMENT MODE — STUB CONTENT ============
// Placeholder content for Task 5 build. Real content lands in Phase 2.
// Each opponent has: name, vibe (descriptor), three picks (by name), and a loss-message
// delivered by Pete when the player loses to them.

const STUB_OPPONENTS = {
  pubmate: {
    key: 'pubmate',
    label: "PETE'S PUB MATE",
    shortLabel: "PUB MATE",
    vibe: "Loud, emotional, picks the obvious legends.",
    // Three picks by name — must match names in PLAYER_POOL. Mid-low totals = beatable.
    picks: ["Diego Maradona", "Pel\u00e9", "Ronaldinho"],
    // Pete's reaction when the player loses to him.
    peteLossLine: "You couldn\u2019t beat my pub mate. My PUB MATE. Off you trot.",
    roundNumber: 1,
  },
  producer: {
    key: 'producer',
    label: "PETE'S PRODUCER",
    shortLabel: "PRODUCER",
    vibe: "Data-driven, dry, all numbers and no soul.",
    // Three picks by name. Mid-high totals = harder.
    picks: ["Luka Modri\u0107", "N'Golo Kant\u00e9", "Robert Lewandowski"],
    peteLossLine: "My producer just out-pundited you. Have a long think about that overnight.",
    roundNumber: 2,
  },
  pete: {
    key: 'pete',
    label: "PETE THE PUNDIT",
    shortLabel: "PETE",
    vibe: "World's #4 Pundit. Doctorate in football. Waiting for you.",
    // Pete draws 3 at random from this high-tier sub-pool each attempt (see drawPetePicks).
    // STUB for testing — Phase 2 replaces this with a "Pete-eligible" flag on the real
    // World Cup pool. Names must exist in PLAYER_POOL exactly.
    subPool: [
      "Diego Maradona", "Pelé", "Zinedine Zidane", "Lionel Messi",
      "Johan Cruyff", "Franz Beckenbauer", "Ronaldinho", "Cristiano Ronaldo",
      "Zico", "Roberto Baggio", "Paolo Maldini", "Romário",
      "Garrincha", "Michel Platini", "Lothar Matthäus"
    ],
    // picks is set dynamically at R3 entry by drawPetePicks(). Left empty here.
    picks: [],
    roundNumber: 3,
    // Pre-written reactions on the result screen. Rotated by attempt count for variety.
    winReactions: [
      "Beat me. Once. Have your trophy. Don't get used to it.",
      "Lucky day. Lounger needs a wash anyway.",
      "Fine. You earned it. Tomorrow we go again.",
      "Hmph. Decent argument. Don't expect a repeat.",
    ],
    lossReactions: [
      "Knew it. Same time tomorrow. I'll be here. Lounger's comfy.",
      "Predictable. The defence had no legs.",
      "Off you trot. Have a think about those picks.",
      "Twenty years in this game. You thought you'd just walk in?",
    ],
  },
};

// Draw 3 random picks for Pete from the Pete-eligible 108 (Phase 2, Deploy 1 / Stage 2).
// Returns an array of 3 names. Names will resolve via WORLD_CUP_POOL in
// resolveOpponentPicks(), which now checks the World Cup pool first.
const drawPetePicks = () => {
  const eligible = getPeteEligiblePool();
  // Fisher-Yates shuffle, take 3.
  const arr = [...eligible];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3).map(p => p.name);
};

// Deterministic attribute scoring stub.
// Real Phase 2 will replace this with hand-authored scores per player.
// For testing now: a small hash of the player name produces 5 attribute scores (1-10).
// Same name → same scores every time. Predictable, comparable across draws.
const stubAttributeScores = (playerName) => {
  // Simple deterministic hash. Don't use this for anything important.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < playerName.length; i++) {
    h ^= playerName.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // Five attribute scores in 1-10 range, derived from the hash.
  const scoreFrom = (seed) => 1 + (seed % 10);
  return {
    'One-Off':     scoreFrom(h),
    'Season-Long': scoreFrom(h >>> 3),
    'Style':       scoreFrom(h >>> 7),
    'Character':   scoreFrom(h >>> 11),
    'Chaos':       scoreFrom(h >>> 17),
    'Legacy':      scoreFrom(h >>> 23),
  };
};

// Total a team's attribute score against a category.
// Routes per player: World Cup pool players get real authored scores;
// daily-pool players (R1/R2 still) fall through to the hash stub.
// The flag `isWorldCup` is set by generateR3Draft and resolveOpponentPicks (for Pete).
// In R1/R2 the player squad comes from daily PLAYER_POOL — those don't have the
// flag, so they correctly fall through to stubAttributeScores.
const scoreTeamOnAttribute = (players, attribute) => {
  return players.reduce((sum, p) => {
    const name = p.name || p;
    const scores = p && p.isWorldCup
      ? worldCupAttributeScores(name)
      : stubAttributeScores(name);
    return sum + (scores[attribute] || 0);
  }, 0);
};

// Resolve opponent picks (by name) to renderable card objects.
// Phase 2, Deploy 2 / Stage 3: all three tournament opponents (Pub Mate, Producer,
// Pete) now have picks from the WORLD_CUP_POOL — Pub Mate and Producer via the
// authored 78 squads, Pete via random draw from the Pete-eligible 108. So we
// check WORLD_CUP_POOL first for any tournament-mode opponent.
//
// Falls back to PLAYER_POOL for any unknown name (defensive — shouldn't fire).
const resolveOpponentPicks = (opponent) => {
  return opponent.picks.map((name) => {
    const wc = findWorldCupPlayer(name);
    if (wc) return enrichWorldCupCard(wc);
    // Defensive fallback — daily pool then placeholder.
    const found = PLAYER_POOL.find(p => p.name === name);
    if (found) return found;
    return { name, tier: 'Star', position: 'MID', flag: '\u2691' };
  });
};

// Pick a random attribute category for a tournament round.
// Deterministic per (round, date) so the same trio gives the same attribute for 3 days.
const pickTournamentAttribute = (roundNumber, date = new Date()) => {
  const attrs = ['One-Off', 'Season-Long', 'Style', 'Character', 'Chaos'];
  const start = parseTournamentDate(TOURNAMENT_CONFIG.startDate);
  const dayAnchor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  const offset = Math.max(0, daysBetween(start, dayAnchor));
  const trioIndex = Math.floor(offset / TOURNAMENT_CONFIG.daysPerTrio);
  // Different attribute per round but stable per trio.
  return attrs[(trioIndex * 3 + roundNumber - 1) % attrs.length];
};

// ============ TOURNAMENT MODE — REAL QUESTIONS (Phase 2, Deploy 2 Stage 1) ============
// 13 trios x 3 rounds = 39 questions. Each trio's R3 is always Legacy.
// Date-based rotation: same trio runs for 3 consecutive days, then advances.
// 13 trios x 3 days = 39 days = the World Cup window (11 Jun – 19 Jul 2026).

const TOURNAMENT_QUESTIONS = [
  // Trio 1
  {
    r1: { text: "Pick three for a sudden-death knockout in 40-degree heat.", category: "One-Off" },
    r2: { text: "Pick three to walk out into a hostile away crowd in the group stage.", category: "Character" },
    r3: { text: "Pick three who'd want a World Cup final on the biggest stage.", category: "Legacy" },
  },
  // Trio 2
  {
    r1: { text: "Pick three for a sun-baked open game with the world watching.", category: "Style" },
    r2: { text: "Pick three to drag a quarter-final into extra time and penalties.", category: "Chaos" },
    r3: { text: "Pick three with their names sewn into World Cup history.", category: "Legacy" },
  },
  // Trio 3
  {
    r1: { text: "Pick three to grind through a full World Cup with the squad rotating around them.", category: "Season-Long" },
    r2: { text: "Pick three for a last-16 shootout after 120 minutes of nothing.", category: "One-Off" },
    r3: { text: "Pick three whose World Cup story doesn't need a footnote.", category: "Legacy" },
  },
  // Trio 4
  {
    r1: { text: "Pick three for a Brazilian-style 4-1 demolition in the round of 16.", category: "Style" },
    r2: { text: "Pick three to take a penalty in front of 80,000 in a partisan stadium.", category: "Character" },
    r3: { text: "Pick three Pete couldn't write off in a column on Monday morning.", category: "Legacy" },
  },
  // Trio 5
  {
    r1: { text: "Pick three to turn a dead group-stage game into something memorable.", category: "Chaos" },
    r2: { text: "Pick three to peak in the second week when everyone else is fading.", category: "Season-Long" },
    r3: { text: "Pick three the commentators reach for when the trophy lifts.", category: "Legacy" },
  },
  // Trio 6
  {
    r1: { text: "Pick three for a winner-takes-all final group game in a packed stadium.", category: "One-Off" },
    r2: { text: "Pick three to play it on the grass when the pitch is dry and quick.", category: "Style" },
    r3: { text: "Pick three who'd make Pete's shortlist before he'd admit it.", category: "Legacy" },
  },
  // Trio 7
  {
    r1: { text: "Pick three to captain a side that's lost its first game and needs to respond.", category: "Character" },
    r2: { text: "Pick three to break the deadlock in a 0-0 quarter-final everyone has stopped watching.", category: "Chaos" },
    r3: { text: "Pick three whose international shirt is heavier than their club one.", category: "Legacy" },
  },
  // Trio 8
  {
    r1: { text: "Pick three to play every minute of the group stage and arrive fresh at the knockouts.", category: "Season-Long" },
    r2: { text: "Pick three to make a tactical, low-tempo last-16 game watchable.", category: "Style" },
    r3: { text: "Pick three who'd belong in a museum, not a podcast.", category: "Legacy" },
  },
  // Trio 9
  {
    r1: { text: "Pick three to make a semi-final unrecognisable by the 70th minute.", category: "Chaos" },
    r2: { text: "Pick three to take the armband when your captain limps off in the opening game.", category: "Character" },
    r3: { text: "Pick three whose World Cup is the first chapter of any book about them.", category: "Legacy" },
  },
  // Trio 10
  {
    r1: { text: "Pick three for a final against a side you've never beaten.", category: "One-Off" },
    r2: { text: "Pick three to start every game and never play a bad one.", category: "Season-Long" },
    r3: { text: "Pick three Pete would queue in the sun to watch warm up.", category: "Legacy" },
  },
  // Trio 11
  {
    r1: { text: "Pick three to play their natural game in front of a billion people.", category: "Style" },
    r2: { text: "Pick three to drag the host nation out of their own tournament.", category: "Chaos" },
    r3: { text: "Pick three you'd want on the team-sheet read out before a final.", category: "Legacy" },
  },
  // Trio 12
  {
    r1: { text: "Pick three to take the field after the anthem brings half the squad to tears.", category: "Character" },
    r2: { text: "Pick three for a final against the tournament's golden boot winner.", category: "One-Off" },
    r3: { text: "Pick three who'd be remembered for one tournament if they'd done nothing else.", category: "Legacy" },
  },
  // Trio 13
  {
    r1: { text: "Pick three to be the last men standing when the squad has nothing left.", category: "Season-Long" },
    r2: { text: "Pick three to play their best football when the cameras are everywhere.", category: "Style" },
    r3: { text: "Pick three the World Cup needed more than they needed it.", category: "Legacy" },
  },
];

// Return the trio index (0-12) for a given date.
// Inside the window: floor((date - startDate) / 3 days).
// Before the window or after the window: clamp to 0 (Trio 1) so debug-unlock
// testing pre-launch always sees Trio 1 content.
const getTrioIndexForDate = (date = new Date()) => {
  const status = getTournamentStatus(date);
  if (!status) return 0; // Outside window → clamp to Trio 1.
  return Math.max(0, Math.min(TOURNAMENT_QUESTIONS.length - 1, status.trioNumber - 1));
};

// Look up the real question for a given round (1, 2, or 3) on a given date.
// Returns { text, category }. category drives the round's attribute scoring.
const getTournamentQuestion = (roundNumber, date = new Date()) => {
  const trioIdx = getTrioIndexForDate(date);
  const trio = TOURNAMENT_QUESTIONS[trioIdx];
  const key = roundNumber === 1 ? 'r1' : roundNumber === 2 ? 'r2' : 'r3';
  return trio[key];
};

// ============ END TOURNAMENT MODE — REAL QUESTIONS ============

// ============ TOURNAMENT MODE — OPPONENT SQUADS (Phase 2, Deploy 2 Stage 3) ============
// 78 authored squads: 13 trios × 3 days (A/B/C) × 2 opponents (Pub Mate + Producer).
// Each opponent has three picks (names exist in WORLD_CUP_POOL) plus a "voice"
// flavour line. Pub Mate voices: Mate Dave / asked his dad / Twitter / TikTok mate / podcast.
// Producer voices: model variants the football scientist ran.
//
// Day rotation within a trio: A = day 1 of the trio (Monday in a Mon-Wed cycle),
// B = day 2, C = day 3. Deterministic per date.
//
// Calibration targets: Pub Mate avg ~16-18 (R1 win rate ~85%). Producer avg
// ~21-22 (R2 win rate ~50%). Authored to those targets.

const OPPONENT_SQUADS = [
  // Trio 1
  {
    A: {
      pubmate: { picks: ["Frank Lampard", "John Terry", "Cafu"], voice: "Mate Dave at the table" },
      producer: { picks: ["N'Golo Kanté", "Luka Modrić", "Hristo Stoichkov"], voice: "The model said three" },
    },
    B: {
      pubmate: { picks: ["Uwe Seeler", "Pep Guardiola", "Joaquín Correa"], voice: "Asked his dad" },
      producer: { picks: ["Cafu", "Iker Casillas", "Romário"], voice: "Re-ran the model with different weights" },
    },
    C: {
      pubmate: { picks: ["Bukayo Saka", "Phil Foden", "Hakim Ziyech"], voice: "Read on Twitter that morning" },
      producer: { picks: ["Franz Beckenbauer", "Andoni Zubizarreta", "Luis Suárez"], voice: "Fresh academic paper said these three" },
    },
  },
  // Trio 2
  {
    A: {
      pubmate: { picks: ["John Terry", "Geoff Hurst", "Kléberson"], voice: "Mate Dave at the table" },
      producer: { picks: ["Luis Suárez", "Hristo Stoichkov", "Lothar Matthäus"], voice: "Variance optimisation model" },
    },
    B: {
      pubmate: { picks: ["Phil Foden", "Pepe", "Tim Cahill"], voice: "His mate who watches football on TikTok" },
      producer: { picks: ["Diego Maradona", "Rivelino", "Hugo Lloris"], voice: "Re-weighted for late-game scenarios" },
    },
    C: {
      pubmate: { picks: ["John Terry", "Kléberson", "Hidetoshi Nakata"], voice: "Read it on a podcast" },
      producer: { picks: ["Diego Maradona", "Garrincha", "Toni Kroos"], voice: "The 'unpredictability premium' paper" },
    },
  },
  // Trio 3
  {
    A: {
      pubmate: { picks: ["Joaquín Correa", "Mario Götze", "Kléberson"], voice: "Asked his dad" },
      producer: { picks: ["Hugo Lloris", "N'Golo Kanté", "Hristo Stoichkov"], voice: "Penalty-conversion model" },
    },
    B: {
      pubmate: { picks: ["Frank Lampard", "Wayne Rooney", "Phil Foden"], voice: "Mate Dave at the table" },
      producer: { picks: ["Miroslav Klose", "Toni Kroos", "Andoni Zubizarreta"], voice: "Re-weighted for tournament-stage variance" },
    },
    C: {
      pubmate: { picks: ["Bukayo Saka", "Heung-min Son", "Phil Foden"], voice: "Saw it on Twitter" },
      producer: { picks: ["Roberto Carlos", "Edgar Davids", "Miroslav Klose"], voice: "The 'clutch player' paper" },
    },
  },
  // Trio 4
  {
    A: {
      pubmate: { picks: ["John Terry", "Geoff Hurst", "Andoni Zubizarreta"], voice: "Mate Dave at the table" },
      producer: { picks: ["Andrea Pirlo", "Lothar Matthäus", "Luis Suárez"], voice: "Penalty-specific Character model" },
    },
    B: {
      pubmate: { picks: ["Phil Foden", "Pepe", "El Hadji Diouf"], voice: "His mate who watches football on TikTok" },
      producer: { picks: ["Hugo Lloris", "Roberto Baggio", "Wesley Sneijder"], voice: "Re-ran with hostile-crowd weighting" },
    },
    C: {
      pubmate: { picks: ["Edgar Davids", "John Terry", "Geoff Hurst"], voice: "Read it on a podcast" },
      producer: { picks: ["Steven Gerrard", "Frank Lampard", "David Beckham"], voice: "Penalty psychology paper" },
    },
  },
  // Trio 5
  {
    A: {
      pubmate: { picks: ["John Terry", "Wayne Rooney", "Asamoah Gyan"], voice: "Mate Dave at the table" },
      producer: { picks: ["Carlos Tevez", "Mario Götze", "Hidetoshi Nakata"], voice: "Endurance optimisation model" },
    },
    B: {
      pubmate: { picks: ["Andrea Pirlo", "Paul Gascoigne", "Geoff Hurst"], voice: "Asked his dad" },
      producer: { picks: ["Andoni Zubizarreta", "Riyad Mahrez", "Mario Götze"], voice: "Re-weighted for late-tournament fatigue" },
    },
    C: {
      pubmate: { picks: ["Antoine Griezmann", "Vinícius Júnior", "Neymar"], voice: "Saw it on Twitter" },
      producer: { picks: ["Lothar Matthäus", "Frank Lampard", "Joaquín Correa"], voice: "Minutes-played per goal contribution paper" },
    },
  },
  // Trio 6
  {
    A: {
      pubmate: { picks: ["Phil Foden", "Rui Costa", "Edgar Davids"], voice: "Dave (anti-Pete shift)" },
      producer: { picks: ["Bobby Moore", "Andoni Zubizarreta", "Mats Hummels"], voice: "Pass-completion-on-the-ground model" },
    },
    B: {
      pubmate: { picks: ["Olivier Giroud", "Andoni Zubizarreta", "Phil Foden"], voice: "His missus" },
      producer: { picks: ["Patrick Vieira", "Frank Lampard", "Andoni Zubizarreta"], voice: "Re-ran with possession-retention metric" },
    },
    C: {
      pubmate: { picks: ["Hidetoshi Nakata", "John Terry", "Joaquín Correa"], voice: "Read it on a podcast" },
      producer: { picks: ["Mats Hummels", "Edgar Davids", "Andoni Zubizarreta"], voice: "Pass network analysis paper" },
    },
  },
  // Trio 7
  {
    A: {
      pubmate: { picks: ["Wayne Rooney", "Edgar Davids", "Romário"], voice: "Mate Dave at the table" },
      producer: { picks: ["Paul Gascoigne", "El Hadji Diouf", "Bobby Moore"], voice: "Late-game deadlock-breaker model" },
    },
    B: {
      pubmate: { picks: ["Pepe", "Carlos Tevez", "Vinícius Júnior"], voice: "His mate who watches football on TikTok" },
      producer: { picks: ["Garrincha", "Pepe", "Patrick Vieira"], voice: "Re-ran with creativity-under-pressure metric" },
    },
    C: {
      pubmate: { picks: ["Diego Maradona", "Tim Cahill", "Phil Foden"], voice: "Read it on a podcast" },
      producer: { picks: ["Cristiano Ronaldo", "Hristo Stoichkov", "Ronaldinho"], voice: "Unpredictability index paper" },
    },
  },
  // Trio 8
  {
    A: {
      pubmate: { picks: ["Bukayo Saka", "Phil Foden", "Joaquín Correa"], voice: "Mate Dave at the table" },
      producer: { picks: ["Marcel Desailly", "Andoni Zubizarreta", "Patrick Vieira"], voice: "Defensive distribution model" },
    },
    B: {
      pubmate: { picks: ["Joaquín Correa", "Mario Götze", "Pep Guardiola"], voice: "Asked his dad" },
      producer: { picks: ["Mats Hummels", "Frank Lampard", "Andoni Zubizarreta"], voice: "Long-range completion metric" },
    },
    C: {
      pubmate: { picks: ["Vinícius Júnior", "Phil Foden", "Tim Cahill"], voice: "His mate who watches football on TikTok" },
      producer: { picks: ["Mats Hummels", "Andoni Zubizarreta", "Roberto Carlos"], voice: "Build-from-back paper recommendation" },
    },
  },
  // Trio 9
  {
    A: {
      pubmate: { picks: ["Wayne Rooney", "Edgar Davids", "Antoine Griezmann"], voice: "Mate Dave at the table" },
      producer: { picks: ["Andrea Pirlo", "Marcel Desailly", "Hristo Stoichkov"], voice: "Composure-tournament index" },
    },
    B: {
      pubmate: { picks: ["Neymar", "Vinícius Júnior", "Riyad Mahrez"], voice: "Saw it on Twitter" },
      producer: { picks: ["Lothar Matthäus", "Hugo Lloris", "Romário"], voice: "Captain-coefficient model" },
    },
    C: {
      pubmate: { picks: ["Paul Gascoigne", "Cristiano Ronaldo", "Mohamed Salah"], voice: "Read it on a podcast" },
      producer: { picks: ["Franz Beckenbauer", "Wesley Sneijder", "Diego Maradona"], voice: "Iconic-captain dataset variance" },
    },
  },
  // Trio 10
  {
    A: {
      pubmate: { picks: ["Phil Foden", "Edgar Davids", "Declan Rice"], voice: "Mate Dave at the table" },
      producer: { picks: ["Carlos Tevez", "Luis Suárez", "Joaquín Correa"], voice: "Squad-rotation minutes model" },
    },
    B: {
      pubmate: { picks: ["Tim Cahill", "Pepe", "Phil Foden"], voice: "His mate who watches football on TikTok" },
      producer: { picks: ["Pepe", "Riyad Mahrez", "Mario Götze"], voice: "Minutes-played efficiency metric" },
    },
    C: {
      pubmate: { picks: ["Hidetoshi Nakata", "Joaquín Correa", "Frank Lampard"], voice: "Read it on a podcast" },
      producer: { picks: ["Jürgen Klinsmann", "Frank Rijkaard", "Mario Götze"], voice: "Multi-tournament veteran model" },
    },
  },
  // Trio 11
  {
    A: {
      pubmate: { picks: ["John Terry", "Tim Cahill", "Andoni Zubizarreta"], voice: "Dave (anti-Pete)" },
      producer: { picks: ["Paul Gascoigne", "Emi Martínez", "Toni Kroos"], voice: "Late-game variance × calm-pivot" },
    },
    B: {
      pubmate: { picks: ["Geoff Hurst", "Joaquín Correa", "Andoni Zubizarreta"], voice: "Asked his dad" },
      producer: { picks: ["Diego Maradona", "Pepe", "Cafu"], voice: "Iconic-chaos + composure-anchor" },
    },
    C: {
      pubmate: { picks: ["Hidetoshi Nakata", "Edgar Davids", "Tim Cahill"], voice: "Read it on a podcast" },
      producer: { picks: ["Luis Suárez", "Wesley Sneijder", "Vinícius Júnior"], voice: "Disruption × modern-creative" },
    },
  },
  // Trio 12
  {
    A: {
      pubmate: { picks: ["Edgar Davids", "Paul Gascoigne", "Wayne Rooney"], voice: "Mate Dave at the table" },
      producer: { picks: ["Bastian Schweinsteiger", "Andrea Pirlo", "N'Golo Kanté"], voice: "Composure × duels model" },
    },
    B: {
      pubmate: { picks: ["Vinícius Júnior", "Riyad Mahrez", "Arjen Robben"], voice: "Saw it on Twitter" },
      producer: { picks: ["David Beckham", "Edgar Davids", "Patrick Vieira"], voice: "Premier-League-WC overlap" },
    },
    C: {
      pubmate: { picks: ["Diego Maradona", "Tim Cahill", "David Beckham"], voice: "Read it on a podcast" },
      producer: { picks: ["Fabio Cannavaro", "David Trezeguet", "Frank Lampard"], voice: "Late-2000s European delivery" },
    },
  },
  // Trio 13
  {
    A: {
      pubmate: { picks: ["Bukayo Saka", "Phil Foden", "Joaquín Correa"], voice: "Mate Dave at the table" },
      producer: { picks: ["Mats Hummels", "Marcel Desailly", "Andoni Zubizarreta"], voice: "Defensive build-from-back metric" },
    },
    B: {
      pubmate: { picks: ["Vinícius Júnior", "Phil Foden", "Bukayo Saka"], voice: "His mate who watches football on TikTok" },
      producer: { picks: ["Patrick Vieira", "Cafu", "Andoni Zubizarreta"], voice: "Defensive + distribution combined" },
    },
    C: {
      pubmate: { picks: ["Vinícius Júnior", "Heung-min Son", "Bukayo Saka"], voice: "Saw it on Twitter" },
      producer: { picks: ["Roberto Carlos", "Mats Hummels", "Andoni Zubizarreta"], voice: "Backline-creator paper" },
    },
  },
];

// Day letter for a given date inside the tournament window.
// Returns "A", "B", or "C" — corresponds to days 1/2/3 of the active trio.
// Outside the window, clamps to "A" so debug-unlock testing pre-launch is stable.
const getDayLetterForDate = (date = new Date()) => {
  const status = getTournamentStatus(date);
  if (!status) return "A"; // Outside window → clamp to Day A.
  return status.dayInTrio === 1 ? "A" : status.dayInTrio === 2 ? "B" : "C";
};

// Look up the right opponent squad for today.
// opponentType: "pubmate" | "producer".
// Returns { picks: [n1, n2, n3], voice: "..." } or a sensible fallback.
const getOpponentSquadForToday = (opponentType, date = new Date()) => {
  const trioIdx = getTrioIndexForDate(date);
  const day = getDayLetterForDate(date);
  const trio = OPPONENT_SQUADS[trioIdx];
  if (!trio || !trio[day] || !trio[day][opponentType]) {
    // Defensive fallback — shouldn't fire because the array is fully populated.
    return { picks: ["Pelé", "Diego Maradona", "Lionel Messi"], voice: "" };
  }
  return trio[day][opponentType];
};

// ============ END TOURNAMENT MODE — OPPONENT SQUADS ============

// ============ TOURNAMENT MODE — STOCK TEXT LINES (Phase 2, Deploy 3) ============
// 51 authored lines across 5 categories. Drawn at random on each occurrence.
// No state, no persistence — same player can see the same line twice.
//
// Pub Mate loss lines (10): Pete mocks Pub Mate via the voices (Dave, his dad,
//   Twitter, TikTok, podcast). Drawn when player loses R1.
// Producer loss lines (10): Pete sarcastically mocks the football scientist.
//   Drawn when player loses R2.
// Pete R3 win reactions (8): grudging→generous→self-deprecating→warm. Drawn
//   when VAR finds for the player in R3 (player wins trophy).
// Pete R3 loss reactions (8): dismissive→instructive→confident→warm-grumpy.
//   Drawn when VAR finds for Pete in R3.
// VAR phrases (15): currently used for R1/R2 verdicts. Sub-categorised by
//   Round opener / Pre-result hold / Player-win / Player-loss / R3 framing.
//   The Player-win and Player-loss subsets replace the current VAR_PHRASES_STUB
//   strings for R1/R2 final verdicts. Other categories surface in future polish.

const PUBMATE_LOSS_LINES = [
  "You lost to my pub mate. My PUB MATE. Off you trot.",
  "His mate Dave picked it. Don't ask me why Lampard's in there. Beaten by Dave-by-proxy.",
  "He asked his dad. His DAD. Did your dad pick yours? No? Maybe try that next time.",
  "My pub mate read it on Twitter at 8am. He read three names and stopped scrolling. Three names. And you lost.",
  "He asked the postman. Honestly. The POSTMAN.",
  "His mate watches football on TikTok. He picked three players he'd seen in compilations. You lost to compilations.",
  "My pub mate doesn't have an opinion. He has five mates with opinions. One of those mates beat you.",
  "He told me the podcast suggested these three. He doesn't remember which podcast. You lost to a podcast he doesn't remember.",
  "Even my pub mate could do it. Picked three names off the back of a cigarette packet. Have a long think.",
  "You lost to a man who thinks Salah won the World Cup. Take that in. Properly.",
];

const PRODUCER_LOSS_LINES = [
  "You lost to my producer. The man who calls goals 'positive outcomes.'",
  "My producer's expected-goals model said you'd lose. So you did. Have a think.",
  "He's never been moved by a football match in his life. Never. And you lost to him.",
  "Beaten by the man who watches matches with the sound off because the commentary 'introduces bias.'",
  "He cried once. Just once. When his spreadsheet auto-saved correctly. That man beat you.",
  "My producer doesn't watch football. He watches graphs of football. And the graphs were right.",
  "He optimised against you. Optimised. Like you're a delivery route. Off you trot.",
  "You lost to a heat map. A literal heat map. Coloured squares beat you tonight.",
  "My producer ran the numbers seventeen times to make sure he picked the dullest possible squad. And the dullest squad won. There's a lesson there. He doesn't get it either.",
  "He's currently entering this result into his model to improve future predictions. He's enjoying it. As much as he enjoys anything.",
];

const PETE_R3_WIN_REACTIONS = [
  "Hmm. Fine. You made the case. I don't have to like it.",
  "I'll be honest — that was a better argument than I gave you credit for. Take the trophy. Don't make a habit of it.",
  "Right. You got me. The producer's spreadsheet had me at 73% to win. So much for that.",
  "Look at you. Beat the World's #4 Pundit. I'd be more impressed if I were #5.",
  "The VAR found for you. I won't appeal. This time.",
  "Trophy's yours. The drinks are still on me, though. House rules.",
  "You spoke for your three like they were yours. That's the difference. Most people just list names. You picked.",
  "Well played. Now go away. I need to read your defence again and work out where I went wrong.",
];

const PETE_R3_LOSS_REACTIONS = [
  "That'll do. Trophy stays with me. Same time tomorrow?",
  "You wrote a defence. I wrote a case. There's a difference. Have a think.",
  "Three picks and four sentences. You needed five. Maybe six. Try again.",
  "The VAR agreed with me. The VAR usually does. Off you go.",
  "Look — I picked three players I've watched and argued about for thirty years. You picked three you'd heard of. That's why.",
  "You started strong. Then you said 'in conclusion.' Never write 'in conclusion.' Take that one with you.",
  "I'm not going to gloat. I'm going to make a cup of tea. Same outcome either way.",
  "You'll get me one day. Probably not tomorrow. But one day.",
];

// Phase 2, Deploy 5 / Stage 2: Pete reactions on R1/R2 wins, shown on the
// congratulations screen between rounds. Each line celebrates the player
// while setting up the next opponent's threat.
const PETE_R1_WIN_REACTIONS = [
  "Right. Pub mate's seen off. Don't get cocky — the producer doesn't have opinions, he has spreadsheets. Different beast.",
  "Beat my pub mate. Bigger people have. Producer's up next, and he's already optimised against you.",
  "Pub mate handled. Decent. Now I bring in the man who watches matches with a clipboard. Brace yourself.",
  "Good. The easy one's done. Producer next — he doesn't care that you won. He's already running the numbers on round two.",
  "One down. The producer's been watching from the wings. He's got data on you now.",
];

const PETE_R2_WIN_REACTIONS = [
  "You beat the spreadsheet. Surprised. Now you face me. I've been on this lounger waiting.",
  "Producer's down. Models broken, charts in tatters. Right — my turn.",
  "Two down. You've earned a chair across from me. Don't waste it.",
  "Beat my producer. Decent showing. Now I'm getting up off this lounger. You won't enjoy it.",
  "The data man fell over. Good. Now the football brain steps in. Sit down.",
];

// VAR phrases organised by category. The final verdict line for R1/R2 outcomes
// draws from VAR_PLAYER_WIN_LINES or VAR_PLAYER_LOSS_LINES. The existing
// VAR_PHRASES_STUB (Legacy tiebreak verdicts) remains for tie cases.
const VAR_ROUND_OPENER_LINES = [
  "Checking the picks.",
  "Running the numbers.",
  "Reviewing the selections.",
  "Confirming the totals.",
  "Verifying the round.",
];

const VAR_PRE_RESULT_HOLD_LINES = [
  "One moment.",
  "Cross-referencing.",
  "Standby.",
];

const VAR_PLAYER_WIN_LINES = [
  "The player advances.",
  "The score stands. Player progresses.",
  "Reviewed and confirmed. The player wins this round.",
];

const VAR_PLAYER_LOSS_LINES = [
  "The score is decisive. The player does not progress.",
  "Reviewed and confirmed. The opponent wins this round.",
  "The numbers are clear. Tournament over for today.",
];

const VAR_R3_FRAMING_LINES = [
  "Argument reviewed. Picks weighed. Decision incoming.",
];

// Pick a random line from a pool. Returns null if the pool is empty (defensive).
const pickRandomLine = (pool) => {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ============ END TOURNAMENT MODE — STOCK TEXT LINES ============
// Stub question text for a tournament round. Real questions land in Phase 2.
const stubTournamentQuestion = (roundNumber, attribute) => {
  const opener = roundNumber === 1
    ? "Round 1"
    : roundNumber === 2
      ? "Round 2"
      : "Round 3";
  const map = {
    'One-Off':     `${opener}: pick three for a one-off cup tie you have to win.`,
    'Season-Long': `${opener}: pick three to grind out a full season title.`,
    'Style':       `${opener}: pick three you'd pay to watch.`,
    'Character':   `${opener}: pick three to lead a dressing room.`,
    'Chaos':       `${opener}: pick three to cause the most chaos on the pitch.`,
  };
  return map[attribute] || `${opener}: pick three.`;
};

// VAR voice — dry procedural phrases for Round 1/2 outcomes.
// Renamed to *_STUB in Phase 2 Deploy 1 / Stage 5 — Deploy 3 will wire in the
// 15 authored VAR phrases under the new name VAR_PHRASES (the production set).
// Kept for now because pickVarPhrase still uses these six R1/R2 verdict strings.
const VAR_PHRASES_STUB = {
  winDominant:  "After review: decisive. You advance.",
  winNarrow:    "After review: marginal. You advance.",
  winLegacy:    "Tied on attribute. Legacy tiebreak in your favour. You advance.",
  lossDominant: "After review: comprehensive defeat. No advance.",
  lossNarrow:   "After review: marginal defeat. No advance.",
  lossLegacy:   "Tied on attribute. Legacy tiebreak against you. No advance.",
};

// Phase 2, Deploy 3: VAR final verdict line for R1/R2.
// Win/loss outcomes now draw randomly from the authored 3-line pools (was 2 static
// strings each: dominant/narrow). The dominant-vs-narrow gap is no longer signalled
// in text — the score totals are visible above the phrase so the player can see
// for themselves. Legacy tiebreak still uses the stub strings (they carry essential
// context the authored lines don't).
const pickVarPhrase = (playerTotal, opponentTotal, viaLegacy, won) => {
  if (viaLegacy) {
    return won ? VAR_PHRASES_STUB.winLegacy : VAR_PHRASES_STUB.lossLegacy;
  }
  if (won) {
    return pickRandomLine(VAR_PLAYER_WIN_LINES)
      || VAR_PHRASES_STUB.winDominant;
  }
  return pickRandomLine(VAR_PLAYER_LOSS_LINES)
    || VAR_PHRASES_STUB.lossDominant;
};

// ============ END TOURNAMENT MODE — STUB CONTENT ============

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

  // Phase 2, Deploy 5 / Stage 16: tracks the screen the player came from when
  // routing INTO the tournament record screen. The record screen reads this on
  // its back button to know whether to return to home or tournament-home.
  // - Default 'tournament-home' preserves existing behaviour for tournament-home → RECORD
  // - New trophy badge on the main home screen sets this to 'home' before routing in
  const [recordReturnScreen, setRecordReturnScreen] = useState('tournament-home');

  // ============ AUTH STATE (Phase 2, Deploy 5 / Stage 17) ============
  // Optional sign-in: the game works fully without it. authUser is the
  // Supabase user object (or null when signed out). authProfile is the row
  // from public.profiles (handle, created_at) for the current user.
  // authReady becomes true once we've checked Supabase for an existing
  // session — used to delay rendering of sign-in-related UI until we know.
  const [authUser, setAuthUser] = useState(null);
  const [authProfile, setAuthProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Sign-up / sign-in form state (Phase 2, Deploy 5 / Stage 18).
  // authMode: 'signup' (creating account) or 'signin' (returning user).
  // Toggled by a link on the auth screen — same screen handles both flows.
  const [authMode, setAuthMode] = useState('signup');
  const [authHandle, setAuthHandle] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  // Once-only success message shown after sign-up succeeds. Lets us show
  // "Welcome, [handle]" before redirecting back to home.
  const [authSuccess, setAuthSuccess] = useState('');

  // Profile screen state (Phase 2, Deploy 5 / Stage 20).
  // profileCloudState holds the row fetched from tournament_state — used to
  // show "last synced" + cloud trophy count on the profile screen.
  // deleteConfirmStage: 0 = normal button, 1 = "ARE YOU SURE?" state (5s window).
  const [profileCloudState, setProfileCloudState] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [deleteConfirmStage, setDeleteConfirmStage] = useState(0);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Leaderboard state (Stage 22.4 — data layer for leaderboard screen).
  // leaderboardRows: array of { handle, trophy_count, tournaments_attempted, distinct_days_played }
  //   from the leaderboard_view, top 50 ordered by (trophy_count desc, attempts desc).
  // leaderboardUserRank: { rank, row } | null — the signed-in user's position,
  //   even if outside top 50. null if user has no trophies.
  // leaderboardLastFetched: timestamp of last successful fetch (used for
  //   the "Updated Xs ago" display).
  // leaderboardLoading: true during the very first fetch (so the placeholder
  //   doesn't flash). Subsequent polling refreshes are silent.
  // leaderboardError: human-readable error string, or '' if no error.
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [leaderboardUserRank, setLeaderboardUserRank] = useState(null);
  const [leaderboardLastFetched, setLeaderboardLastFetched] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  // Check Supabase session once on mount; subscribe to auth state changes.
  // Session is persisted in localStorage by Supabase, so a previously signed-in
  // user is restored automatically on page reload.
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          setAuthUser(session.user);
          // Fetch matching profile row (handle, etc.). Safe if missing.
          const profile = await fetchProfileForUser(session.user.id);
          if (cancelled) return;
          // Stage 20.2: orphaned-session defence on mount. If we restored a
          // session but the profile row is gone (account was deleted between
          // sessions), sign back out cleanly so the home screen renders the
          // signed-out state, not a confusing half-signed-in state.
          if (!profile) {
            try { await supabase.auth.signOut(); } catch {}
            setAuthUser(null);
            setAuthProfile(null);
          } else {
            setAuthProfile(profile);
            // Stage 19: if a previous sync failed, retry now that we know we're online.
            // Inline retry rather than calling retryPendingSync() because authUser
            // isn't set in React state yet — we'd race with React's update.
            // Stage 20.2: gated behind the profile check — no point retrying
            // a sync for an account that no longer exists.
            try {
              const pending = localStorage.getItem('kick3_sync_retry_pending');
              if (pending === '1' && !cancelled) {
                const local = readTournamentState();
                const { error: retryErr } = await supabase
                  .from('tournament_state')
                  .upsert({
                    user_id: session.user.id,
                    trophy_count: local.trophyCount || 0,
                    tournaments_attempted: local.tournamentsAttempted || 0,
                    tournaments_completed: local.tournamentsCompleted || 0,
                    last_played_date: local.lastPlayedDate || null,
                    last_attempt_result: local.lastAttemptResult || null,
                    updated_at: new Date().toISOString(),
                  }, { onConflict: 'user_id' });
                if (!retryErr) {
                  try { localStorage.removeItem('kick3_sync_retry_pending'); } catch {}
                }
              }
            } catch {}
          }
        }
      } catch (err) {
        // Network errors are non-fatal — the game still works signed-out.
        if (typeof console !== 'undefined') {
          console.warn('[kick3] auth init error (non-fatal):', err);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    initAuth();

    // Listen for auth state changes (sign-in, sign-out, token refresh).
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        if (session?.user) {
          setAuthUser(session.user);
          const profile = await fetchProfileForUser(session.user.id);
          if (!cancelled) setAuthProfile(profile);
        } else {
          setAuthUser(null);
          setAuthProfile(null);
        }
      }
    );

    return () => {
      cancelled = true;
      // Unsubscribe from auth changes when the component unmounts.
      if (subscription?.subscription?.unsubscribe) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

  // ============ AUTH HANDLERS (Phase 2, Deploy 5 / Stage 18) ============
  // Reset all form state. Called when entering or leaving the auth screen,
  // and when toggling between sign-up and sign-in.
  const resetAuthForm = () => {
    setAuthHandle('');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    setAuthError('');
    setAuthSuccess('');
  };

  // Sync localStorage trophy state UP to the cloud (one-way, used at sign-up).
  // Reads the current tournament state from localStorage and writes it as the
  // initial row in tournament_state for the new user. Silent on failure —
  // game continues without persistence if the network drops.
  const syncTrophiesToCloud = async (userId) => {
    if (!userId) return;
    try {
      const local = readTournamentState();
      // Stage 21: also capture current local daily stats so first sign-up
      // saves everything in one round-trip. Falls back to empty object if
      // no stats exist yet (new player).
      const localStats = readScoreStatsFromStorage() || {};
      const { error } = await supabase
        .from('tournament_state')
        .upsert({
          user_id: userId,
          trophy_count: local.trophyCount || 0,
          tournaments_attempted: local.tournamentsAttempted || 0,
          tournaments_completed: local.tournamentsCompleted || 0,
          last_played_date: local.lastPlayedDate || null,
          last_attempt_result: local.lastAttemptResult || null,
          daily_stats: localStats,
          // Stage 22: include the days-played counter so first sign-up
          // captures the full local state in one round-trip.
          distinct_days_played: parseInt(localStorage.getItem('kick3_distinct_days') || '0', 10) || 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error && typeof console !== 'undefined') {
        console.warn('[kick3] trophy sync failed (non-fatal):', error);
      }
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] trophy sync threw (non-fatal):', err);
      }
    }
  };

  // SIGN UP — create account, insert profile, sync trophies, route to home.
  const submitSignUp = async () => {
    if (authLoading) return;
    setAuthError('');
    setAuthSuccess('');

    const handle = authHandle.trim();
    const handleErr = validateHandle(handle);
    if (handleErr) { setAuthError(handleErr); return; }
    const pwErr = validatePassword(authPassword);
    if (pwErr) { setAuthError(pwErr); return; }
    if (authPassword !== authPasswordConfirm) {
      setAuthError('Passwords don\u2019t match');
      return;
    }

    setAuthLoading(true);
    try {
      // Step 1: create the Supabase Auth user. Email is a placeholder we never
      // collect or send to — Supabase requires SOMETHING in the email field.
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: handleToPlaceholderEmail(handle),
        password: authPassword,
      });
      if (signUpErr) {
        setAuthError(friendlyAuthError(signUpErr));
        return;
      }
      const newUser = signUpData?.user;
      if (!newUser) {
        setAuthError('Sign-up succeeded but no user returned. Try signing in.');
        return;
      }

      // Step 2: insert the profile row (links handle to user id). The DB has
      // a unique constraint on lower(handle), so this catches the race where
      // two people pick the same handle at the same time.
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({ id: newUser.id, handle });
      if (profileErr) {
        // Profile insert failed — most likely "handle taken" from the unique
        // index. The Auth user was created but is orphaned without a profile.
        // We delete the Auth user via sign-out to keep the user table clean
        // for retry. The user can pick a different handle and try again.
        await supabase.auth.signOut();
        const msg = (profileErr.message || '').toLowerCase();
        if (msg.includes('duplicate') || msg.includes('unique')) {
          setAuthError('That handle is taken. Try another.');
        } else {
          setAuthError('Couldn\u2019t save your profile. Try again.');
        }
        return;
      }

      // Step 3: sync any existing localStorage trophies to the new account.
      // This is the "save my trophies" payoff — first sign-up captures whatever
      // record the player has built up so far.
      await syncTrophiesToCloud(newUser.id);

      // Step 4: success. Explicitly set authUser AND fetch+set authProfile
      // here rather than relying on the onAuthStateChange listener — the
      // listener already fired when signUp() returned, BEFORE the profile row
      // existed, so authProfile is currently null. Stage 18.1 fix: we know
      // the profile row exists now (Step 2 just inserted it), so we fetch and
      // set it directly. The home screen check `authUser && authProfile`
      // will now succeed and render the "SIGNED IN" badge correctly.
      setAuthUser(newUser);
      const newProfile = await fetchProfileForUser(newUser.id);
      if (newProfile) setAuthProfile(newProfile);
      // Stage 21.1: fresh plays on account creation.
      resetDailyPlayCounts();
      setAuthSuccess(`Welcome, ${handle}.`);
      // Brief celebratory pause, then return to home.
      setTimeout(() => {
        resetAuthForm();
        setScreen('home');
      }, 1200);
    } catch (err) {
      setAuthError(friendlyAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  // SIGN IN — authenticate, sync trophy counts (cloud wins if higher), home.
  const submitSignIn = async () => {
    if (authLoading) return;
    setAuthError('');
    setAuthSuccess('');

    const handle = authHandle.trim();
    if (!handle) { setAuthError('Enter your handle'); return; }
    if (!authPassword) { setAuthError('Enter your password'); return; }

    setAuthLoading(true);
    try {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: handleToPlaceholderEmail(handle),
        password: authPassword,
      });
      if (signInErr) {
        setAuthError(friendlyAuthError(signInErr));
        return;
      }
      const signedInUser = signInData?.user;
      if (!signedInUser) {
        setAuthError('Sign-in failed. Try again.');
        return;
      }

      // Stage 20.2: Check for orphaned sign-in (auth shell exists but profile
      // was deleted via the Delete Account flow). The auth.users row stays
      // because we can't delete it from the front-end — but the profile is
      // gone, which means there's no handle to display and the home screen
      // would render in a confusingly half-signed-in state.
      //
      // The right behaviour: treat the deleted account as deleted. Sign the
      // user back out immediately and show an honest error. The auth shell
      // stays (we can't help that), but the front-end no longer ghosts.
      const orphanCheck = await fetchProfileForUser(signedInUser.id);
      if (!orphanCheck) {
        // No profile row exists for this auth user → deleted account.
        // Sign back out so we don't leave a session hanging, then show the
        // honest error and let the user sign up with a different handle.
        try { await supabase.auth.signOut(); } catch {}
        setAuthError('That account was deleted. Sign up to start fresh.');
        return;
      }

      // Reconcile localStorage trophies with cloud trophies. Higher count wins.
      // This is a deliberate trade-off: if a player signs in on a new device
      // with zero local state, we DON'T overwrite their cloud record. If they
      // signed in on a device with MORE trophies than the cloud (e.g. they
      // played offline before signing in), we keep the better record.
      // Stage 20 wires bidirectional sync; this is the minimum honest reconcile.
      try {
        const local = readTournamentState();
        const { data: cloudRow, error: fetchErr } = await supabase
          .from('tournament_state')
          .select('*')
          .eq('user_id', signedInUser.id)
          .maybeSingle();

        if (!fetchErr && cloudRow) {
          const cloudTrophies = cloudRow.trophy_count || 0;
          const localTrophies = local.trophyCount || 0;
          if (cloudTrophies >= localTrophies) {
            // Cloud has same or more — pull cloud state down to localStorage.
            writeTournamentState({
              ...local,
              trophyCount: cloudTrophies,
              tournamentsAttempted: cloudRow.tournaments_attempted || local.tournamentsAttempted || 0,
              tournamentsCompleted: cloudRow.tournaments_completed || local.tournamentsCompleted || 0,
              lastPlayedDate: cloudRow.last_played_date || local.lastPlayedDate,
              lastAttemptResult: cloudRow.last_attempt_result || local.lastAttemptResult,
            });
          } else {
            // Local has more — push local up to cloud.
            await syncTrophiesToCloud(signedInUser.id);
          }

          // Stage 21: same reconciliation pattern for daily stats.
          // Higher TOTAL events wins as a unit (we don't try to merge
          // distributions — too risky if a sync ran partially before).
          const cloudStats = cloudRow.daily_stats || {};
          const localStats = readScoreStatsFromStorage();
          const cloudTotal = totalEventsInStats(cloudStats);
          const localTotal = totalEventsInStats(localStats);
          if (cloudTotal > localTotal) {
            // Cloud is more complete — pull down to local.
            try {
              localStorage.setItem('kick3_score_counts', JSON.stringify(cloudStats));
              setScoreStats(cloudStats);
            } catch {}
          } else if (localTotal > cloudTotal) {
            // Local is more complete — push up to cloud.
            await pushDailyStatsToCloud();
          }
          // Equal totals: do nothing (already in sync).

          // Stage 22: reconcile distinct_days_played counter. Same higher-wins
          // pattern as trophies — both sides are monotonic, so higher = more
          // complete. Updates localStorage if cloud is higher.
          const cloudDays = cloudRow.distinct_days_played || 0;
          const localDays = parseInt(localStorage.getItem('kick3_distinct_days') || '0', 10) || 0;
          if (cloudDays > localDays) {
            try { localStorage.setItem('kick3_distinct_days', String(cloudDays)); } catch {}
          } else if (localDays > cloudDays) {
            // Local has more — push up. pushTournamentStateToCloud reads the
            // current localStorage value and upserts.
            await pushTournamentStateToCloud();
          }
        } else if (!cloudRow) {
          // No cloud row exists yet (edge case — profile but no state row).
          // Push local up.
          await syncTrophiesToCloud(signedInUser.id);
          // Stage 21: also push local stats up if we have any.
          if (totalEventsInStats(readScoreStatsFromStorage()) > 0) {
            await pushDailyStatsToCloud();
          }
        }
      } catch (syncErr) {
        // Reconciliation failed — sign-in still succeeded. Log and continue.
        if (typeof console !== 'undefined') {
          console.warn('[kick3] sign-in sync failed (non-fatal):', syncErr);
        }
      }

      // Stage 18.1: explicitly set authUser + authProfile here too. Sign-in
      // generally works through the listener fine, but being explicit removes
      // any race and makes the success path deterministic.
      setAuthUser(signedInUser);
      const signedInProfile = await fetchProfileForUser(signedInUser.id);
      if (signedInProfile) setAuthProfile(signedInProfile);
      // Stage 21.1: fresh plays on sign-in.
      resetDailyPlayCounts();
      setAuthSuccess(`Welcome back, ${handle}.`);
      setTimeout(() => {
        resetAuthForm();
        setScreen('home');
      }, 1200);
    } catch (err) {
      setAuthError(friendlyAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  // ============ DAILY PLAY RESET (Phase 2, Deploy 5 / Stage 21.1) ============
  // Wipe the solo + 1v1 daily play counters. Called at every auth event:
  // sign-up, sign-in, sign-out, delete-account. Rationale: auth events are
  // natural "fresh entry" moments — let players get a clean play allowance.
  //
  // Stage 21.2: ONCE PER DAY PER DEVICE. Without this cap, a user could
  // sign-out / sign-in indefinitely to get unlimited plays. Now we track the
  // last day a reset was granted on this device (by today's question.number),
  // and skip the reset if it's already been used today. Crossing midnight
  // restores the entitlement.
  //
  // NOT touched: the tournament daily cap (kick3_tournament_v1.attemptsToday
  // and wonTodayFlag). Tournament trophies persist across auth events and
  // sync to the cloud — resetting them would create inconsistency. Solo/1v1
  // counters are pure localStorage with no cloud tie-in, safe to wipe.
  //
  // Special case: delete-account ALWAYS resets, bypassing the once-per-day
  // cap. Account deletion is the strongest "fresh start" intent — if a user
  // wipes their account, give them a clean board regardless. (Passed in via
  // the `bypassDailyCap` argument.)
  const PLAY_RESET_DAY_KEY = 'kick3_play_reset_day';

  const resetDailyPlayCounts = (bypassDailyCap = false) => {
    try {
      // Check the once-per-day cap unless explicitly bypassed.
      if (!bypassDailyCap) {
        const lastResetDay = parseInt(localStorage.getItem(PLAY_RESET_DAY_KEY) || '0', 10);
        if (lastResetDay === TODAYS_QUESTION.number) {
          // Already used today's reset on this device. No-op.
          return;
        }
      }
      localStorage.removeItem('kick3_solo_plays');
      localStorage.removeItem('kick3_h2h_plays');
      localStorage.removeItem('kick3_plays_day');
      // Stamp today's question.number so a subsequent auth event today
      // doesn't get a second reset. Day rollover (different question.number)
      // restores entitlement automatically.
      localStorage.setItem(PLAY_RESET_DAY_KEY, String(TODAYS_QUESTION.number));
      // Update React state so the home-screen buttons re-render unlocked.
      setPlays({ solo: 0, h2h: 0, day: TODAYS_QUESTION.number });
    } catch { /* silent */ }
  };
  // ============ END DAILY PLAY RESET ============

  // SIGN OUT — clear Supabase session. authUser/authProfile will be cleared
  // by the onAuthStateChange listener in the mount useEffect.
  const submitSignOut = async () => {
    // Stage 21.1: reset daily play counts on sign-out for fresh-start feel.
    resetDailyPlayCounts();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] sign-out error (non-fatal):', err);
      }
    }
    // Stay on whatever screen we're on; the home screen UI will re-render
    // with the signed-out state once authUser flips to null.
  };

  // ============ CLOUD SYNC (Phase 2, Deploy 5 / Stage 19) ============
  // Auto-sync tournament state to the cloud at end-of-attempt boundaries.
  // Silent failure with retry-on-next-mount — the localStorage state stays
  // authoritative; cloud is the cross-device backup.
  //
  // Sync points (when this gets called):
  //   - endTournamentAttempt() — after writing localStorage, also push to cloud
  //   - submitR3Defence() success path — after trophy increment, also push to cloud
  //
  // No-op when signed out (authUser is null). Game works fully without sign-in.
  //
  // Failure handling:
  //   On error → set a "needs-retry" flag in localStorage.
  //   On next page load → initAuth checks the flag, retries the sync.
  //   On success → clear the flag.

  const SYNC_RETRY_KEY = 'kick3_sync_retry_pending';

  // Push the current localStorage tournament state up to the cloud.
  // Pure function-ish — reads localStorage, writes Supabase. Doesn't touch React state.
  // Returns true on success, false on failure.
  const pushTournamentStateToCloud = async () => {
    if (!authUser) return false; // No-op when signed out.
    try {
      const local = readTournamentState();
      const { error } = await supabase
        .from('tournament_state')
        .upsert({
          user_id: authUser.id,
          trophy_count: local.trophyCount || 0,
          tournaments_attempted: local.tournamentsAttempted || 0,
          tournaments_completed: local.tournamentsCompleted || 0,
          last_played_date: local.lastPlayedDate || null,
          last_attempt_result: local.lastAttemptResult || null,
          // Stage 22 (leaderboard build): include the days-played counter.
          // Stored locally under kick3_distinct_days; see recordPlayDay() below.
          distinct_days_played: parseInt(localStorage.getItem('kick3_distinct_days') || '0', 10) || 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) {
        if (typeof console !== 'undefined') {
          console.warn('[kick3] cloud sync failed, will retry on next load:', error);
        }
        try { localStorage.setItem(SYNC_RETRY_KEY, '1'); } catch {}
        return false;
      }
      // Success — clear any pending retry flag.
      try { localStorage.removeItem(SYNC_RETRY_KEY); } catch {}
      return true;
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] cloud sync threw, will retry on next load:', err);
      }
      try { localStorage.setItem(SYNC_RETRY_KEY, '1'); } catch {}
      return false;
    }
  };

  // Retry a pending sync on mount. Called from initAuth once we know the user
  // is signed in. Reads the flag, attempts the sync, clears the flag on success.
  // Stays silent — the user shouldn't notice the retry happening.
  const retryPendingSync = async () => {
    if (!authUser) return;
    try {
      const pending = localStorage.getItem(SYNC_RETRY_KEY);
      if (pending !== '1') return;
      await pushTournamentStateToCloud();
    } catch {}
  };

  // ============ DAILY STATS SYNC (Phase 2, Deploy 5 / Stage 21) ============
  // Same pattern as tournament state: localStorage is authoritative, cloud is
  // the cross-device backup. The score-distribution object lives under the
  // 'daily_stats' jsonb column on tournament_state. We push after every score
  // increment (fire-and-forget) and pull on sign-in (higher-total wins).

  // Total number of verdicts captured in a stats distribution object.
  // Used to decide which side wins reconciliation on sign-in.
  const totalEventsInStats = (stats) => {
    if (!stats || typeof stats !== 'object') return 0;
    let total = 0;
    for (const k of Object.keys(stats)) {
      const v = parseInt(stats[k], 10);
      if (!isNaN(v) && v > 0) total += v;
    }
    return total;
  };

  // Push the current localStorage daily stats up to the cloud.
  // Writes to the daily_stats jsonb column on tournament_state.
  // Silent on failure (sets the same retry flag tournament sync uses).
  // No-op when signed out.
  const pushDailyStatsToCloud = async () => {
    if (!authUser) return false;
    try {
      const localStats = readScoreStatsFromStorage();
      const { error } = await supabase
        .from('tournament_state')
        .upsert({
          user_id: authUser.id,
          daily_stats: localStats || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) {
        if (typeof console !== 'undefined') {
          console.warn('[kick3] daily stats sync failed, will retry on next load:', error);
        }
        try { localStorage.setItem(SYNC_RETRY_KEY, '1'); } catch {}
        return false;
      }
      try { localStorage.removeItem(SYNC_RETRY_KEY); } catch {}
      return true;
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] daily stats sync threw, will retry on next load:', err);
      }
      try { localStorage.setItem(SYNC_RETRY_KEY, '1'); } catch {}
      return false;
    }
  };
  // ============ END DAILY STATS SYNC ============

  // ============ DISTINCT DAYS PLAYED (Stage 22 — leaderboard loyalty badge) ============
  // Tracks the number of distinct days the player has logged at least one play
  // of any mode (solo, 1v1, OR tournament attempt). Used by the loyalty-badge
  // tier system on the leaderboard.
  //
  // Mechanism:
  //   - localStorage key 'kick3_distinct_days' stores the integer count.
  //   - localStorage key 'kick3_last_play_day' stores the question.number of
  //     the day the last play was recorded.
  //   - On every play, recordPlayDay() checks the stamp. If today's number
  //     differs from the stored one (or it's unset), increment the count and
  //     update the stamp. Otherwise no-op.
  //   - Synced to cloud as part of pushTournamentStateToCloud's upsert.
  //
  // Tier thresholds (matches Kick3_Leaderboards_Spec.docx):
  //   0-6   = no badge
  //   7-13  = BRONZE
  //   14-20 = SILVER
  //   21-27 = GOLD
  //   28+   = DIAMOND
  const DISTINCT_DAYS_KEY = 'kick3_distinct_days';
  const LAST_PLAY_DAY_KEY = 'kick3_last_play_day';

  // Call this after every play (solo, 1v1, OR tournament attempt completion).
  // Idempotent within a single day — only increments on the FIRST play of a
  // new question.number. No-op if the same question is already stamped.
  const recordPlayDay = () => {
    try {
      const todayNum = TODAYS_QUESTION.number;
      const lastNum = parseInt(localStorage.getItem(LAST_PLAY_DAY_KEY) || '0', 10);
      if (lastNum === todayNum) return; // Already counted today.
      // New day — increment and stamp.
      const current = parseInt(localStorage.getItem(DISTINCT_DAYS_KEY) || '0', 10) || 0;
      localStorage.setItem(DISTINCT_DAYS_KEY, String(current + 1));
      localStorage.setItem(LAST_PLAY_DAY_KEY, String(todayNum));
    } catch { /* silent */ }
  };

  // Helper: derive loyalty tier from a day count. Returns one of:
  //   { tier: 'NONE'|'BRONZE'|'SILVER'|'GOLD'|'DIAMOND', label, color, daysToNext }
  // Used by both the leaderboard rendering and the profile screen.
  const loyaltyTierFor = (days) => {
    const d = parseInt(days, 10) || 0;
    if (d >= 28) return { tier: 'DIAMOND', label: 'DIAMOND', color: '#b9f2ff', textColor: '#0a1a1f', daysToNext: null };
    if (d >= 21) return { tier: 'GOLD',    label: 'GOLD',    color: '#d4af37', textColor: '#1a1408', daysToNext: 28 - d };
    if (d >= 14) return { tier: 'SILVER',  label: 'SILVER',  color: '#c0c0c0', textColor: '#1a1a1a', daysToNext: 21 - d };
    if (d >= 7)  return { tier: 'BRONZE',  label: 'BRONZE',  color: '#cd7f32', textColor: '#ffffff', daysToNext: 14 - d };
    return { tier: 'NONE', label: '', color: null, textColor: null, daysToNext: 7 - d };
  };
  // ============ END DISTINCT DAYS PLAYED ============

  // ============ LEADERBOARD FETCH (Stage 22.4 — data layer) ============
  // Reads from the leaderboard_view created in Stage A.
  // View is granted SELECT to authenticated users only — signed-out queries
  // will fail with a permission error, which is correct (leaderboard requires
  // sign-in per the locked design rule).
  //
  // Two main helpers:
  //   - fetchLeaderboardTop50() → array of rows, ordered by view definition
  //     (trophy_count desc, tournaments_attempted desc).
  //   - fetchUserRank(handle) → { rank: N, row } | null. The view is already
  //     ordered, but Supabase doesn't expose row_number(), so we count rows
  //     above the user instead. Cheap at our scale.
  //
  // Both return promises. Errors are caught and surfaced via leaderboardError.

  const fetchLeaderboardTop50 = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('handle, trophy_count, tournaments_attempted, distinct_days_played')
        .limit(50);
      if (error) {
        if (typeof console !== 'undefined') {
          console.warn('[kick3] leaderboard top50 fetch failed:', error);
        }
        return { rows: [], error };
      }
      return { rows: data || [], error: null };
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] leaderboard top50 fetch threw:', err);
      }
      return { rows: [], error: err };
    }
  };

  // Find a specific handle's rank. Strategy: count rows in the view that
  // rank ABOVE the given handle (i.e. higher trophy_count, or same trophies
  // with more attempts). Add 1 = the rank. No row_number() needed.
  // Returns { rank, row } if found, or null if the handle isn't in the view
  // (e.g. user with 0 trophies — they're filtered out by the view itself).
  const fetchUserRank = async (handle) => {
    if (!handle) return null;
    try {
      // Step 1: get the user's own row from the view.
      const { data: ownData, error: ownErr } = await supabase
        .from('leaderboard_view')
        .select('handle, trophy_count, tournaments_attempted, distinct_days_played')
        .eq('handle', handle)
        .maybeSingle();
      if (ownErr || !ownData) {
        // User isn't in the view yet — probably has zero trophies.
        return null;
      }
      // Step 2: count rows that beat the user's row. The view's ORDER BY is
      // (trophy_count desc, tournaments_attempted desc), so "beat" means:
      //   trophy_count > userTrophies
      //   OR (trophy_count == userTrophies AND attempts > userAttempts)
      // Two queries; results summed = rows above the user.
      const userTrophies = ownData.trophy_count;
      const userAttempts = ownData.tournaments_attempted;

      // (a) Rows with strictly more trophies.
      const { count: higherTrophyCount, error: higherErr } = await supabase
        .from('leaderboard_view')
        .select('*', { count: 'exact', head: true })
        .gt('trophy_count', userTrophies);
      if (higherErr) return null;

      // (b) Rows with same trophies AND more attempts.
      const { count: sameTrophyMoreAttempts, error: sameErr } = await supabase
        .from('leaderboard_view')
        .select('*', { count: 'exact', head: true })
        .eq('trophy_count', userTrophies)
        .gt('tournaments_attempted', userAttempts);
      if (sameErr) return null;

      const rank = (higherTrophyCount || 0) + (sameTrophyMoreAttempts || 0) + 1;
      return { rank, row: ownData };
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] user rank fetch threw:', err);
      }
      return null;
    }
  };

  // Combined leaderboard refresh — called by the screen's polling effect AND
  // by the manual REFRESH button. Wraps both fetches and updates all state.
  // Silent on success (no flicker). Sets error on failure.
  const refreshLeaderboard = async (isFirstFetch = false) => {
    if (!authUser) return;
    if (isFirstFetch) setLeaderboardLoading(true);
    try {
      const { rows, error: top50Err } = await fetchLeaderboardTop50();
      if (top50Err) {
        setLeaderboardError('Couldn\u2019t load the leaderboard. Try again.');
        if (isFirstFetch) setLeaderboardLoading(false);
        return;
      }
      setLeaderboardRows(rows);
      setLeaderboardError('');
      setLeaderboardLastFetched(Date.now());

      // Find the signed-in user's rank. Need their handle from authProfile.
      const myHandle = authProfile && authProfile.handle;
      if (myHandle) {
        const userRank = await fetchUserRank(myHandle);
        setLeaderboardUserRank(userRank);
      } else {
        setLeaderboardUserRank(null);
      }
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[kick3] refreshLeaderboard threw:', err);
      }
      setLeaderboardError('Network error. Try again.');
    } finally {
      if (isFirstFetch) setLeaderboardLoading(false);
    }
  };
  // ============ END LEADERBOARD FETCH ============
  // ============ END CLOUD SYNC ============

  // ============ PROFILE SCREEN (Phase 2, Deploy 5 / Stage 20) ============
  // Helpers for the profile screen: load cloud state, format "last synced"
  // timestamp, delete account (two-tap confirm).

  // Fetch the cloud tournament_state row for the current user. Used by the
  // profile screen to show "Cloud: 5 trophies / Last synced 2 minutes ago".
  // Sets profileCloudState on success, profileError on failure.
  const loadProfileCloudState = async () => {
    if (!authUser) return;
    setProfileLoading(true);
    setProfileError('');
    try {
      const { data, error } = await supabase
        .from('tournament_state')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (error) {
        setProfileError('Couldn\u2019t load your cloud data.');
        setProfileCloudState(null);
      } else {
        setProfileCloudState(data || null);
      }
    } catch {
      setProfileError('Couldn\u2019t reach the server.');
      setProfileCloudState(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Format an ISO timestamp into a relative "X minutes ago" string.
  // Used for the "Last synced" indicator on the profile screen.
  const formatLastSynced = (isoString) => {
    if (!isoString) return 'Never';
    try {
      const then = new Date(isoString).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - then) / 1000));
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
      const diffDay = Math.floor(diffHr / 24);
      return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } catch {
      return 'Unknown';
    }
  };

  // DELETE ACCOUNT — two-tap confirm flow.
  // First tap: deleteConfirmStage flips to 1, button changes to "ARE YOU SURE?"
  //            Auto-reverts to 0 after 5 seconds if no second tap.
  // Second tap: actually deletes.
  //
  // What "delete" actually does:
  //   1. Delete the tournament_state row (RLS allows user to delete their own)
  //   2. Delete the profiles row (frees up the handle for reuse)
  //   3. Sign out
  // The auth.users row stays (would need a server-side endpoint with the secret
  // key to delete). User is "logically deleted" — handle is free, profile gone.
  const submitDeleteAccount = async () => {
    if (!authUser) return;
    // First tap — arm the confirm.
    if (deleteConfirmStage === 0) {
      setDeleteConfirmStage(1);
      // Auto-revert after 5 seconds.
      setTimeout(() => {
        setDeleteConfirmStage((stage) => (stage === 1 ? 0 : stage));
      }, 5000);
      return;
    }
    // Second tap — actually delete.
    setDeleteInProgress(true);
    setProfileError('');
    try {
      // Delete tournament_state first (no dependencies).
      const { error: stateErr } = await supabase
        .from('tournament_state')
        .delete()
        .eq('user_id', authUser.id);
      if (stateErr) {
        setProfileError('Couldn\u2019t delete cloud data. Try again.');
        setDeleteInProgress(false);
        setDeleteConfirmStage(0);
        return;
      }
      // Delete the profile row (frees the handle).
      const { error: profileErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', authUser.id);
      if (profileErr) {
        setProfileError('Couldn\u2019t delete profile. Try again.');
        setDeleteInProgress(false);
        setDeleteConfirmStage(0);
        return;
      }
      // Sign out — clears the Supabase session and our React auth state.
      await supabase.auth.signOut();
      // Clear local trophy state too — the user explicitly chose to wipe.
      try { localStorage.removeItem(TOURNAMENT_CONFIG.storageKey); } catch {}
      try { localStorage.removeItem('kick3_sync_retry_pending'); } catch {}
      // Stage 21.1: also wipe the daily play counters. Account deletion is
      // the strongest "fresh start" intent — match it with the cleanest reset.
      // Stage 21.2: pass true to bypass the once-per-day cap. Deletion is
      // a deliberate destructive act; the user has earned a clean slate.
      // Also clear the reset-day stamp itself so the deleted-then-signed-up
      // user can use their once-per-day reset entitlement going forward.
      resetDailyPlayCounts(true);
      try { localStorage.removeItem('kick3_play_reset_day'); } catch {}
      // Reset profile-screen state and return home.
      setProfileCloudState(null);
      setDeleteConfirmStage(0);
      setDeleteInProgress(false);
      setScreen('home');
    } catch {
      setProfileError('Something went wrong. Try again.');
      setDeleteInProgress(false);
      setDeleteConfirmStage(0);
    }
  };
  // ============ END PROFILE SCREEN HELPERS ============
  // ============ END AUTH HANDLERS ============

  // ============ TOURNAMENT MODE — BETA GATE ============
  // tournamentBetaActive is true if ?beta=pete is (or was) in the URL.
  // When true, the green TOURNAMENT MODE button is rendered on the home screen.
  // When false, the button is not rendered — invisible to anyone without the flag.
  // Evaluated once on mount; URL changes don't re-evaluate (refresh to toggle).
  const [tournamentBetaActive] = useState(() => {
    try { return isTournamentBetaActive(); } catch { return false; }
  });

  // ============ TOURNAMENT MODE — IN-PLAY STATE ============
  // Tracks state while a tournament attempt is in progress.
  //   tournamentRound:        1, 2, or 3 — which round is being played right now
  //   tournamentOpponent:     full opponent object from STUB_OPPONENTS (or null)
  //   tournamentAttribute:    string attribute name for the current round's scoring
  //   tournamentQuestionText: the round's question (stub for now, real in Phase 2)
  //   tournamentVarResult:    { playerTotal, opponentTotal, viaLegacy, won, phrase } after VAR computes
  const [tournamentRound, setTournamentRound] = useState(0);
  const [tournamentOpponent, setTournamentOpponent] = useState(null);
  const [tournamentAttribute, setTournamentAttribute] = useState(null);
  const [tournamentQuestionText, setTournamentQuestionText] = useState('');
  const [tournamentVarResult, setTournamentVarResult] = useState(null);
  // ---- Round 3 (Pete) specific state ----
  const [r3PeteArgument, setR3PeteArgument] = useState(null);   // { argument, taunt } from AI
  const [r3PlayerDefence, setR3PlayerDefence] = useState('');    // 300-char player response
  const [r3VarVerdict, setR3VarVerdict] = useState(null);        // { winner, verdict, lineForCard } from AI
  const [r3PeteReaction, setR3PeteReaction] = useState('');      // pre-written, picked on verdict
  const [r3Loading, setR3Loading] = useState(false);
  const [r3Error, setR3Error] = useState(null);
  // Phase 2, Deploy 5 / Stage 2: Pete's reaction shown on the round-won congrats
  // screen between R1→R2 and R2→R3. Picked once when the player wins, stable
  // across re-renders. Reset on each tournament attempt start.
  const [roundWinReaction, setRoundWinReaction] = useState('');

  // ============ DEV CONSOLE HELPERS (Phase 2, Deploy 5 / Stage 12) ============
  // When ?debug=tournament-unlock is in the URL, expose key state setters and a
  // few canned scenarios on `window.kick3` so we can trigger UI states from the
  // browser console without playing through the full flow. Useful for:
  //   - Forcing a legacy tiebreak verdict (rare in normal play, hard to trigger)
  //   - Jumping to specific screens during development
  //   - Inspecting the current React state
  // No effect in production / no debug flag — completely inert.
  //
  // Phase 2, Deploy 5 / Stage 13: gated to non-production hosts only. Even if someone
  // discovers the debug flag, the helpers won't attach on kick3.app — they only attach
  // on Vercel preview URLs (*.vercel.app) and localhost. This is belt-and-braces:
  // the helpers don't write server data anyway, but it's good hygiene to keep dev
  // tools out of production.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const debugFlag = params.get('debug');
    if (debugFlag !== 'tournament-unlock' && debugFlag !== 'tournament-locked') return;
    const host = window.location.hostname || '';
    const isDevHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
    if (!isDevHost) return; // Don't attach on production (kick3.app).
    window.kick3 = {
      // Direct setters — use with caution.
      setScreen,
      setTournamentVarResult,
      setTournamentRound,
      setTournamentOpponent,
      setTournamentAttribute,
      setSquad,
      // Canned scenario: force a Legacy-tiebreak WIN on the congrats screen.
      // Player ties on attribute (18 vs 18) but wins on Legacy (22 vs 17).
      forceTiebreakWin: () => {
        setTournamentRound(1);
        setTournamentOpponent({
          label: 'PUB MATE', shortLabel: 'PUB MATE',
          vibe: 'Loud, picks the obvious legends',
          peteLossLine: '(test mode)',
          picks: ['Frank Lampard', 'John Terry', 'Cafu'],
        });
        setTournamentAttribute('Character');
        setSquad([
          { name: 'Test Player 1', tier: 'Star', position: 'MID', flag: '⚽', isWorldCup: true },
          { name: 'Test Player 2', tier: 'Star', position: 'MID', flag: '⚽', isWorldCup: true },
          { name: 'Test Player 3', tier: 'Star', position: 'MID', flag: '⚽', isWorldCup: true },
        ]);
        setRoundWinReaction("Right. Pub mate's seen off. The real test starts now.");
        setTournamentVarResult({
          playerTotal: 18,
          opponentTotal: 18,
          playerLegacy: 22,
          opponentLegacy: 17,
          viaLegacy: true,
          won: true,
          phrase: 'Tied on attribute. Legacy tiebreak in your favour. You advance.',
        });
        setScreen('tournament-round-won');
        console.log('[kick3] Forced Legacy tiebreak WIN — congrats screen should show');
      },
      // Canned scenario: force a Legacy-tiebreak LOSS on the verdict screen.
      forceTiebreakLoss: () => {
        setTournamentRound(1);
        setTournamentOpponent({
          label: 'PUB MATE', shortLabel: 'PUB MATE',
          vibe: 'Loud, picks the obvious legends',
          peteLossLine: 'You lost to my pub mate. My PUB MATE. Off you trot.',
          picks: ['Frank Lampard', 'John Terry', 'Cafu'],
        });
        setTournamentAttribute('Character');
        setSquad([
          { name: 'Test Player 1', tier: 'Star', position: 'MID', flag: '⚽', isWorldCup: true },
          { name: 'Test Player 2', tier: 'Star', position: 'MID', flag: '⚽', isWorldCup: true },
          { name: 'Test Player 3', tier: 'Star', position: 'MID', flag: '⚽', isWorldCup: true },
        ]);
        setTournamentVarResult({
          playerTotal: 18,
          opponentTotal: 18,
          playerLegacy: 14,
          opponentLegacy: 19,
          viaLegacy: true,
          won: false,
          phrase: 'Tied on attribute. Legacy tiebreak against you. No advance.',
        });
        setScreen('tournament-var');
        console.log('[kick3] Forced Legacy tiebreak LOSS — verdict screen should show');
      },
    };
    console.log('[kick3] Debug helpers attached to window.kick3');
    console.log('[kick3] Available: window.kick3.forceTiebreakWin(), window.kick3.forceTiebreakLoss()');
    return () => {
      try { delete window.kick3; } catch {}
    };
    // Run once on mount; state setters are stable from useState so safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ DRAFT CARDS — MEMOISED GK AUTO-SWAP (Phase 2, Deploy 5 / Stage 10) ============
  // BUG FIX: previously the GK auto-swap ran shuffle() inline inside the draft screen
  // render. Any state change (typing in textarea, hover, anything) re-rendered the
  // screen and re-shuffled the replacement cards — making players appear to "rotate"
  // every few seconds. Memoising the swap so it only recomputes when the actual
  // round genuinely changes.
  //
  // GK rule: max 1 goalkeeper per squad of 3. If the player has already picked a GK
  // and any card in this round is also a GK, swap that GK card for a fresh non-GK
  // pick. Source pool depends on context: R3 uses Pete-eligible 108; R1/R2 uses the
  // full World Cup 180; daily/h2h use PLAYER_POOL.
  const draftCardsForCurrentRound = useMemo(() => {
    const baseCards = draftRounds[currentRound] || [];
    const hasGkInSquad = squad.some(sq => sq.position === "GK");
    const gkCardCount = baseCards.filter(c => c && c.position === "GK").length;
    if (!hasGkInSquad || gkCardCount === 0) {
      return baseCards;
    }
    const usedNames = new Set([
      ...squad.map(p => p.name),
      ...draftRounds.flat().filter(Boolean).map(p => p.name)
    ]);
    const isWorldCupDraft = baseCards.some(c => c && c.isWorldCup);
    let replacements;
    if (isWorldCupDraft) {
      const sourcePool = tournamentRound === 3 ? getPeteEligiblePool() : WORLD_CUP_POOL;
      replacements = shuffle(
        sourcePool.filter(p => p.position !== "GK" && !usedNames.has(p.name))
      ).map(enrichWorldCupCard);
    } else {
      replacements = shuffle(
        PLAYER_POOL.filter(p => p.position !== "GK" && !usedNames.has(p.name))
      );
    }
    let ri = 0;
    return baseCards.map(c => {
      if (c && c.position === "GK" && ri < replacements.length) {
        return replacements[ri++];
      }
      return c;
    });
  }, [draftRounds, currentRound, squad, tournamentRound]);

  // ============ VAR-CHECKING SCREEN STATE (Phase 2, Deploy 5 / Stage 1) ============
  // The VAR screen cycles through three status lines (1s each) before routing to
  // the verdict. R1/R2 use this for pure suspense; R3 uses it to mask API latency.
  //
  // varCheckPhase: 0, 1, or 2 — which status line is currently showing.
  // For R1/R2 only: after phase 2 elapses (3 total seconds), auto-route to the
  // verdict screen. R3's routing is handled inside submitR3Defence (it awaits a
  // 3-second min-delay promise, then routes itself).
  const [varCheckPhase, setVarCheckPhase] = useState(0);

  // Drive the phase cycler whenever we're on the VAR-checking screen.
  // Resets when leaving the screen so the next attempt starts at phase 0.
  // Phase 2, Deploy 5 / Stage 3: at the 3s mark, route based on win/loss:
  //   Win + R1/R2 → tournament-round-won (the congrats screen IS the verdict)
  //   Loss + R1/R2 → tournament-var (the existing loss verdict screen)
  //   R3 (any outcome) → submitR3Defence handles routing itself
  useEffect(() => {
    if (screen !== 'tournament-var-checking') {
      // Reset to phase 0 for next attempt; do nothing else.
      if (varCheckPhase !== 0) setVarCheckPhase(0);
      return;
    }
    // Phase 0 is the initial state set on entry. Advance to 1 at 1s, 2 at 2s.
    const t1 = setTimeout(() => setVarCheckPhase(1), 1000);
    const t2 = setTimeout(() => setVarCheckPhase(2), 2000);
    // Auto-route at 3s for R1/R2.
    const t3 = setTimeout(() => {
      if (tournamentRound !== 1 && tournamentRound !== 2) return;
      const playerWon = tournamentVarResult && tournamentVarResult.won;
      if (playerWon) {
        // Pre-pick Pete's reaction here so it's stable for the congrats screen.
        const pool = tournamentRound === 1 ? PETE_R1_WIN_REACTIONS : PETE_R2_WIN_REACTIONS;
        const reaction = pickRandomLine(pool) || pool[0];
        setRoundWinReaction(reaction);
        setScreen('tournament-round-won');
      } else {
        setScreen('tournament-var');
      }
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [screen, tournamentRound, tournamentVarResult]);

  // Phase 2, Deploy 5 / Stage 20: load cloud state when entering profile screen.
  // Re-fetches each time the screen is entered so the "last synced" timestamp
  // is accurate. No-op when signed out (defensive — the screen requires auth).
  useEffect(() => {
    if (screen !== 'profile') return;
    if (!authUser) return;
    loadProfileCloudState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, authUser]);

  // Stage 22.4: leaderboard fetch + 30-second polling.
  // Fires when entering the leaderboard screen (signed in only).
  // On mount: immediate fetch. Then every 30s while screen is open.
  // Cleanup on unmount cancels the interval (no leaked timers).
  // No-op when signed out — the screen's own gate handles the prompt.
  useEffect(() => {
    if (screen !== 'leaderboard') return;
    if (!authUser) return;
    // Initial fetch with the loading flag set.
    refreshLeaderboard(true);
    // Then poll every 30s. Subsequent fetches don't set loading (silent).
    const intervalId = setInterval(() => {
      refreshLeaderboard(false);
    }, 30000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, authUser, authProfile]);

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
      // Stage 22: a play happened today — bump the days-played counter.
      // (Idempotent within a single day; safe to call from every play path.)
      recordPlayDay();
      // Stage 21: push to cloud if signed in. Fire-and-forget — UI doesn't
      // wait. No-op when signed out (silent in pushDailyStatsToCloud).
      // pushTournamentStateToCloud also pulls the days counter into its upsert.
      pushDailyStatsToCloud();
      pushTournamentStateToCloud();
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
    setScreen('draft');
  };

  // ============ TOURNAMENT — round entry helpers ============
  // Start a tournament attempt at Round 1 (called by PLAY NOW on tournament home).
  // Increments tournamentsAttempted in localStorage.
  const startTournament = () => {
    // Phase 2, Deploy 2 / Stage 3: opponent squad from authored 78.
    // Phase 2, Deploy 3: peteLossLine now random-drawn from the 10-line pool per attempt
    // (was a single static line). The voice line from the authored squad is preserved
    // alongside as a future polish hook (not yet displayed).
    const squadForToday = getOpponentSquadForToday('pubmate');
    const opponent = {
      ...STUB_OPPONENTS.pubmate,
      picks: squadForToday.picks,
      voice: squadForToday.voice,
      peteLossLine: pickRandomLine(PUBMATE_LOSS_LINES) || STUB_OPPONENTS.pubmate.peteLossLine,
    };
    // Phase 2, Deploy 2 / Stage 1: real questions wired. Question selects the
    // attribute for the round (category drives scoring).
    const q = getTournamentQuestion(1);
    const attribute = q.category;
    const questionText = q.text;

    // Mark this as a fresh attempt in state.
    // Phase 2, Deploy 5 / Stage 14: increment attemptsToday. If the day has rolled
    // over since the last attempt, reset to 1 (this is attempt #1 of the new day).
    const state = readTournamentState();
    const daily = effectiveDailyState(state);
    writeTournamentState({
      ...state,
      tournamentsAttempted: (state.tournamentsAttempted || 0) + 1,
      lastPlayedDate: todayDateString(),
      attemptsToday: daily.attemptsToday + 1,
      // wonTodayFlag preserved if same day, cleared by effectiveDailyState if not.
      wonTodayFlag: daily.wonTodayFlag,
    });

    setMode('tournament');
    // Phase 2, Deploy 2 / Stage 2: R1 draft now from World Cup 180 (was daily 384).
    setDraftRounds(generateTournamentDraft());
    setCurrentRound(0);
    setSquad([]);
    setSentence('');
    setError(null);
    setTournamentRound(1);
    setTournamentOpponent(opponent);
    setTournamentAttribute(attribute);
    setTournamentQuestionText(questionText);
    setTournamentVarResult(null);
    setScreen('draft');
  };

  // Advance from a completed Round 1 to Round 2 vs Pete's Producer.
  const advanceToRound2 = () => {
    // Phase 2, Deploy 2 / Stage 3: opponent squad from authored 78.
    // Phase 2, Deploy 3: peteLossLine now random-drawn from the 10-line pool per attempt.
    const squadForToday = getOpponentSquadForToday('producer');
    const opponent = {
      ...STUB_OPPONENTS.producer,
      picks: squadForToday.picks,
      voice: squadForToday.voice,
      peteLossLine: pickRandomLine(PRODUCER_LOSS_LINES) || STUB_OPPONENTS.producer.peteLossLine,
    };
    // Phase 2, Deploy 2 / Stage 1: real R2 question and its category attribute.
    const q = getTournamentQuestion(2);
    const attribute = q.category;
    const questionText = q.text;

    // Phase 2, Deploy 2 / Stage 2: R2 draft now from World Cup 180 (was daily 384).
    // Excludes R1 picks so the player doesn't see the same names twice.
    setDraftRounds(generateTournamentDraft(squad.map(p => p.name)));
    setCurrentRound(0);
    setSquad([]);
    setTournamentRound(2);
    setTournamentOpponent(opponent);
    setTournamentAttribute(attribute);
    setTournamentQuestionText(questionText);
    setTournamentVarResult(null);
    setScreen('draft');
  };

  // Compute the VAR result for the current round and route to the verdict screen.
  // Phase 2, Deploy 5 / Stage 1: route now goes through the VAR-checking screen
  // for a 3-second suspense beat before revealing the verdict.
  // Phase 2, Deploy 5 / Stage 11: Legacy totals always computed and stored in the
  // result so the verdict/congrats screens can surface them when a tiebreak fires.
  const computeTournamentVar = (finishedSquad) => {
    const opponentPicks = resolveOpponentPicks(tournamentOpponent);
    const playerTotal = scoreTeamOnAttribute(finishedSquad, tournamentAttribute);
    const opponentTotal = scoreTeamOnAttribute(opponentPicks, tournamentAttribute);
    // Compute Legacy unconditionally — needed for tiebreak case, also handy for surfacing.
    const playerLegacy = scoreTeamOnAttribute(finishedSquad, 'Legacy');
    const opponentLegacy = scoreTeamOnAttribute(opponentPicks, 'Legacy');
    let won;
    let viaLegacy = false;
    if (playerTotal > opponentTotal) {
      won = true;
    } else if (playerTotal === opponentTotal) {
      // Tiebreak on Legacy. Player wins remaining ties.
      won = playerLegacy >= opponentLegacy;
      viaLegacy = true;
    } else {
      won = false;
    }
    const phrase = pickVarPhrase(playerTotal, opponentTotal, viaLegacy, won);
    // Pre-compute the result and stash it; the VAR-checking screen will reveal it
    // after its 3-second animation completes.
    setTournamentVarResult({
      playerTotal,
      opponentTotal,
      playerLegacy,
      opponentLegacy,
      viaLegacy,
      won,
      phrase
    });
    setScreen('tournament-var-checking');
  };

  // Called from the VAR screen on a loss (Round 1 or 2).
  // Writes the end-of-attempt state and returns the player to the tournament home.
  const endTournamentAttempt = (resultKey) => {
    const state = readTournamentState();
    writeTournamentState({
      ...state,
      lastPlayedDate: todayDateString(),
      lastAttemptResult: resultKey,
    });
    // Stage 22: a tournament attempt counts as a play today — bump the
    // days-played counter (idempotent within a day).
    recordPlayDay();
    // Stage 19: push the just-written state up to the cloud if signed in.
    // Fire-and-forget — we don't block the UI on the network round-trip.
    // No-ops when signed out; silent retry-on-mount handles failures.
    pushTournamentStateToCloud();
    // Reset tournament in-play state.
    setTournamentRound(0);
    setTournamentOpponent(null);
    setTournamentAttribute(null);
    setTournamentQuestionText('');
    setTournamentVarResult(null);
    setR3PeteArgument(null);
    setR3PlayerDefence('');
    setR3VarVerdict(null);
    setR3PeteReaction('');
    setR3Error(null);
    setSquad([]);
    setScreen('tournament-home');
  };

  // ============ ROUND 3 / PETE FINAL ============
  // Entry point: player has just won Round 2 and clicks CONTINUE TO ROUND 3.
  // Generates Pete's AI argument and routes to the R3 intro screen.
  const startTournamentRound3 = async () => {
    // Draw Pete's three picks at random from his sub-pool, then build an opponent
    // object carrying those picks so the rest of the flow works unchanged.
    const petePicks = drawPetePicks();
    const opponent = { ...STUB_OPPONENTS.pete, picks: petePicks };
    // R3 question is always Legacy. Phase 2, Deploy 2 / Stage 1: real R3 question.
    const q = getTournamentQuestion(3);
    const attribute = 'Legacy';
    const questionText = q.text;

    setTournamentRound(3);
    setTournamentOpponent(opponent);
    setTournamentAttribute(attribute);
    setTournamentQuestionText(questionText);
    setR3PeteArgument(null);
    setR3VarVerdict(null);
    setR3PlayerDefence('');
    setR3PeteReaction('');
    setR3Error(null);
    setR3Loading(true);
    setScreen('tournament-r3-intro');

    // Generate Pete's argument via AI.
    try {
      const userMessage = `The question: "${questionText}"

Pete's three picks: ${opponent.picks.join(', ')}.

Write Pete's confident argument defending these three picks against the question. End with a sarcastic one-line taunt to the player. Return JSON only.`;

      const response = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: PETE_ARGUMENT_PROMPT,
          userMessage: userMessage
        })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = (data.text || "").trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setR3PeteArgument(parsed);
    } catch (e) {
      console.error('Pete argument generation failed:', e);
      // Fallback: hardcoded Pete argument so the game can continue even if API is down.
      setR3PeteArgument({
        argument: `${opponent.picks[0]}, ${opponent.picks[1]}, ${opponent.picks[2]}. Three names. World Cup royalty, every one of them. Moments people still talk about. The question was clear and so is the answer. Beat that.`,
        taunt: "Beat this. If you can be bothered."
      });
      setR3Error('Pete\u2019s argument used a fallback (API was unreachable).');
    } finally {
      setR3Loading(false);
    }
  };

  // Submit player's R3 defence to VAR for comparative judgement.
  const submitR3Defence = async () => {
    if (r3Loading) return;
    setR3Loading(true);
    setR3Error(null);
    // Phase 2, Deploy 5 / Stage 1: route through VAR-checking screen immediately.
    // The API call runs in parallel with a 3s minimum animation delay; we wait for
    // both before showing the verdict so the suspense beat is consistent.
    setScreen('tournament-var-checking');
    const minAnimationDelay = new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const opponentPicks = resolveOpponentPicks(tournamentOpponent);
      // Format each pick with its World Cup Legacy rating (0-10) so VAR can use ratings as context.
      // R3 picks are all World Cup pool players (both Pete's and the player's), so we
      // read real authored Legacy scores via worldCupAttributeScores. Falls through to
      // stubAttributeScores for safety on any name not in the World Cup pool.
      const fmtWithRating = (p) => {
        const scores = (p && p.isWorldCup)
          ? worldCupAttributeScores(p.name)
          : stubAttributeScores(p.name);
        const rating = scores['Legacy'] || 0;
        return `${p.name} (Legacy ${rating}/10)`;
      };
      const peteList = opponentPicks.map(fmtWithRating).join(', ');
      const playerList = squad.map(fmtWithRating).join(', ');
      const userMessage = `The question: "${tournamentQuestionText}"
This is the World Cup Legacy round. Each pick's Legacy rating (0-10) is shown.

PETE'S three picks: ${peteList}.
PETE'S argument: "${r3PeteArgument?.argument || ''}"

PLAYER'S three picks: ${playerList}.
PLAYER'S defence: "${r3PlayerDefence || '(The player did not write a defence.)'}"

Weigh the picks, their Legacy ratings, and both arguments together. Judge between Pete and the player. Return JSON only.`;

      const response = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: VAR_JUDGE_PROMPT,
          userMessage: userMessage
        })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = (data.text || "").trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      // Defensive: ensure winner is one of the two valid values.
      const winner = parsed.winner === 'player' ? 'player' : 'pete';
      const playerWon = winner === 'player';

      // Phase 2, Deploy 3: Pete reactions now from the authored 8-line pools (was 4-item
      // rotation by attempt index). Random selection — variety beats deterministic rotation.
      const reactionPool = playerWon
        ? PETE_R3_WIN_REACTIONS
        : PETE_R3_LOSS_REACTIONS;
      const reaction = pickRandomLine(reactionPool) || (playerWon
        ? STUB_OPPONENTS.pete.winReactions[0]
        : STUB_OPPONENTS.pete.lossReactions[0]);

      const state = readTournamentState();

      setR3VarVerdict({ ...parsed, winner, playerWon });
      setR3PeteReaction(reaction);

      // Write tournament state (trophy on win, attempt completion either way).
      // Phase 2, Deploy 5 / Stage 14: also set wonTodayFlag on a R3 win so the
      // player can't keep attempting after they've earned today's trophy.
      writeTournamentState({
        ...state,
        lastPlayedDate: todayDateString(),
        lastAttemptResult: playerWon ? 'won-r3' : 'lost-r3',
        tournamentsCompleted: (state.tournamentsCompleted || 0) + 1,
        trophyCount: (state.trophyCount || 0) + (playerWon ? 1 : 0),
        wonTodayFlag: state.wonTodayFlag || playerWon,
      });
      // Stage 22: a play happened today — bump the days-played counter
      // (idempotent within a day).
      recordPlayDay();
      // Stage 19: push the new trophy state to the cloud immediately.
      // This is the critical sync — every trophy must reach the cloud so it
      // shows up on the player's other devices.
      pushTournamentStateToCloud();

      // Wait for the VAR animation to finish (3s) before revealing verdict.
      // If the API took longer than 3s, this resolves instantly. Phase 2, Deploy 5 / Stage 1.
      await minAnimationDelay;
      setScreen('tournament-r3-verdict');
    } catch (e) {
      console.error('VAR judgement failed:', e);
      // On error, still respect the animation delay so the failure isn't jarring.
      await minAnimationDelay;
      setR3Error('VAR\u2019s connection dropped. Try again.');
      // Return to the defence screen so the player can retry.
      setScreen('tournament-r3-defend');
    } finally {
      setR3Loading(false);
    }
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
      if (mode === 'tournament') {
        // Round 3 (Pete) has a defence screen; Rounds 1 and 2 do not.
        if (tournamentRound === 3) {
          setSentence('');
          setR3PlayerDefence('');
          setScreen('tournament-r3-defend');
        } else {
          computeTournamentVar(newSquad);
        }
      } else if (mode === 'solo') {
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
    // Phase 2, Deploy 5 / Stage 15: Tournament button now always renders on the
    // home screen — but in a LOCKED state for the general public until 11 June
    // 2026. Beta users (?beta=pete) and the launch date itself unlock it.
    //
    // Conditions for tournamentUnlocked:
    //   - tournamentBetaActive (someone with ?beta=pete) → unlocked early
    //   - current date is on or after 11 June 2026 → unlocked for everyone (launch)
    const tournamentUnlocked = (() => {
      if (tournamentBetaActive) return true;
      const now = new Date();
      const launch = new Date(TOURNAMENT_CONFIG.startDate + 'T00:00:00');
      return now >= launch;
    })();

    // Phase 2, Deploy 5 / Stage 16: trophy count for the new top-right trophy
    // badge. Reads lifetime tournament trophies from localStorage on each render.
    // Safe on first load (defaults to 0 if no state exists).
    const homeTrophyCount = (() => {
      try {
        const state = readTournamentState();
        return state.trophyCount || 0;
      } catch { return 0; }
    })();
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

          /* ============ Phase 2, Deploy 5 / Stage 5 — button animations ============ */
          /* Shared tactile hover scale + glow. Applied to every interactive button on the home screens. */
          .kick3-button-hover {
            transition: transform 0.18s ease-out, box-shadow 0.18s ease-out, filter 0.18s ease-out;
          }
          .kick3-button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            filter: brightness(1.08);
          }
          .kick3-button-hover:active:not(:disabled) {
            transform: translateY(0);
            filter: brightness(0.96);
          }

          /* Pulsing gold glow — applied to the flagship tournament buttons only.
             Slow 3.6s breathing cycle. Glow is gold-tinted to read as trophy / prize. */
          @keyframes kick3-pulse-gold-kf {
            0%, 100% {
              box-shadow: 0 4px 0 rgba(0,0,0,0.25), 0 0 0 1px rgba(95,176,74,0.18), 0 0 24px 4px rgba(95,176,74,0.28);
            }
            50% {
              box-shadow: 0 4px 0 rgba(0,0,0,0.25), 0 0 0 6px rgba(95,176,74,0.45), 0 0 42px 12px rgba(95,176,74,0.65);
            }
          }
          .kick3-pulse-gold {
            animation: kick3-pulse-gold-kf 3.6s ease-in-out infinite;
          }
          .kick3-pulse-gold:disabled {
            animation: none;
          }

          /* Shimmer sweep — diagonal highlight sliding across the button.
             5s cycle: ~0.9s sweep, ~4.1s pause. For the RECORD button. */
          @keyframes kick3-shimmer-gold-kf {
            0%   { transform: translateX(-110%) skewX(-18deg); }
            18%  { transform: translateX(110%)  skewX(-18deg); }
            100% { transform: translateX(110%)  skewX(-18deg); }
          }
          .kick3-shimmer-gold {
            position: relative;
            overflow: hidden;
          }
          .kick3-shimmer-gold::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 40%;
            height: 100%;
            background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 50%, transparent 100%);
            animation: kick3-shimmer-gold-kf 5s ease-in-out infinite;
            pointer-events: none;
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
              {/* Stage 22 top status row — single horizontal row spanning the
                  top of the Pete illustration with FOUR evenly-spaced pills:
                  DAY · LEADERBOARDS · STATS · TROPHIES.
                  - DAY is a label (not tappable)
                  - LEADERBOARDS routes to 'leaderboard' screen
                  - STATS routes to 'stats' screen
                  - TROPHIES routes to tournament-record screen
                  Letter-spacing tightened from 0.3em to 0.18em and font-size
                  dropped to 10px so all four fit comfortably on a 360px phone.
                  whiteSpace: nowrap on each pill prevents two-line wrap. */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '12px',
                right: '12px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2
              }}>
                {/* DAY pill — non-tappable label */}
                <div style={{
                  background: 'rgba(20,20,30,0.85)',
                  color: colours.gold,
                  ...condFont,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${colours.gold}`,
                  whiteSpace: 'nowrap'
                }}>
                  DAY {TODAYS_QUESTION.number}
                </div>
                {/* LEADERBOARDS pill — Stage 22. Tap routes to leaderboard.
                    Signed-out tap prompts sign-in (handled in the leaderboard
                    route itself). Always visible. */}
                <button
                  onClick={() => setScreen('leaderboard')}
                  aria-label="View leaderboard"
                  style={{
                    background: 'rgba(20,20,30,0.85)',
                    color: colours.gold,
                    ...condFont,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${colours.gold}`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  LEADERBOARDS
                </button>
                {/* STATS pill */}
                <button
                  onClick={() => setScreen('stats')}
                  aria-label="View stats"
                  style={{
                    background: 'rgba(20,20,30,0.85)',
                    color: colours.gold,
                    ...condFont,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${colours.gold}`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  STATS
                </button>
                {/* TROPHIES pill */}
                <button
                  onClick={() => { setRecordReturnScreen('home'); setScreen('tournament-record'); }}
                  aria-label={`Tournament trophies: ${homeTrophyCount}. View record.`}
                  style={{
                    background: 'rgba(20,20,30,0.85)',
                    color: colours.gold,
                    ...condFont,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${colours.gold}`,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ fontSize: '12px', letterSpacing: 0 }} aria-hidden="true">🏆</span>
                  <span>{homeTrophyCount}</span>
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

              {/* SIGN IN / SAVE TROPHIES button (Phase 2, Deploy 5 / Stage 18).
                  Sits between the title block and the question chalkboard, per the
                  agreed (ii) placement. Optional throughout — when signed out, shows
                  a value-prop pitch. When signed in, shows the handle as a chip with
                  a small sign-out option. authReady gates render so we don't flash
                  the signed-out state for already-signed-in users. */}
              {authReady && (
                authUser && authProfile ? (
                  <div style={{
                    width: '100%',
                    marginBottom: '18px',
                    padding: '12px 16px',
                    background: 'rgba(95,176,74,0.10)',
                    border: '1px solid rgba(95,176,74,0.40)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        ...condFont, fontSize: '10px', letterSpacing: '0.28em',
                        color: '#5fb04a', fontWeight: 700, marginBottom: '2px'
                      }}>
                        SIGNED IN
                      </div>
                      <div style={{
                        ...displayFont, fontSize: '18px', fontWeight: 700,
                        color: colours.cream, letterSpacing: '0.02em',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {authProfile.handle}
                      </div>
                    </div>
                    {/* Two stacked buttons — PROFILE (Stage 20) and SIGN OUT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                      <button
                        onClick={() => { setProfileError(''); setDeleteConfirmStage(0); setScreen('profile'); }}
                        style={{
                          background: 'transparent', color: colours.gold,
                          border: `1px solid ${colours.gold}`, borderRadius: '6px',
                          ...condFont, fontSize: '11px', fontWeight: 600,
                          letterSpacing: '0.18em', padding: '6px 11px',
                          cursor: 'pointer'
                        }}
                      >
                        PROFILE →
                      </button>
                      <button
                        onClick={submitSignOut}
                        style={{
                          background: 'transparent', color: colours.muted,
                          border: `1px solid ${colours.muted}`, borderRadius: '6px',
                          ...condFont, fontSize: '11px', fontWeight: 600,
                          letterSpacing: '0.18em', padding: '6px 11px',
                          cursor: 'pointer'
                        }}
                      >
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { resetAuthForm(); setAuthMode('signup'); setScreen('auth'); }}
                    style={{
                      width: '100%', marginBottom: '18px',
                      padding: '14px 18px',
                      background: 'transparent',
                      color: colours.cream,
                      border: `1.5px solid rgba(212,175,55,0.55)`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{
                      ...displayFont, fontSize: '18px', fontWeight: 700,
                      color: colours.gold, letterSpacing: '0.08em'
                    }}>
                      SIGN IN WHENEVER
                    </span>
                    <span style={{
                      ...condFont, fontSize: '11px', color: colours.muted,
                      fontStyle: 'italic', letterSpacing: '0.04em'
                    }}>
                      Save your trophies and score history
                    </span>
                  </button>
                )
              )}

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

              {/* TOURNAMENT MODE — green when unlocked, locked/greyed for general public pre-launch.
                  Phase 2, Deploy 5 / Stage 15: button now ALWAYS renders. Locked state
                  shows a 🔒 emoji and "OPENS 11 JUNE" subtitle, fully unclickable. */}
              {tournamentUnlocked ? (
                <button
                  onClick={() => setScreen('tournament-home')}
                  className="kick3-button-hover kick3-pulse-gold"
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
              ) : (
                <button
                  disabled
                  aria-label="Tournament mode opens 11 June 2026"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: '#3a3a44',
                    color: colours.muted,
                    border: 'none',
                    borderRadius: '10px',
                    ...displayFont,
                    fontSize: 'clamp(20px, 5.4vw, 24px)',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'not-allowed',
                    marginBottom: '12px',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                    opacity: 0.75
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span aria-hidden="true">🔒</span>
                    <span>TOURNAMENT MODE</span>
                  </span>
                  <span style={{
                    ...condFont,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: colours.gold,
                    opacity: 0.95
                  }}>
                    OPENS 11 JUNE
                  </span>
                </button>
              )}

              {/* PLAY TODAY — yellow */}
              <button
                onClick={startGame}
                disabled={soloLocked}
                className="kick3-button-hover"
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
                    <span>SOLO MODE</span>
                  </>
                )}
              </button>

              {/* 1V1 MODE — red */}
              <button
                onClick={startH2H}
                disabled={h2hLocked}
                className="kick3-button-hover"
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
                  <span>2 PLAYER MODE</span>
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
                {/* Stage 22 top status row — desktop variant of the same
                    four-pill row used on phone. Larger font, more breathing
                    room. Same routing logic. */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  right: '18px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: 2
                }}>
                  {/* DAY pill — non-tappable label */}
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
                    whiteSpace: 'nowrap'
                  }}>
                    DAY {TODAYS_QUESTION.number}
                  </div>
                  {/* LEADERBOARDS pill */}
                  <button
                    onClick={() => setScreen('leaderboard')}
                    aria-label="View leaderboard"
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
                      whiteSpace: 'nowrap'
                    }}
                  >
                    LEADERBOARDS
                  </button>
                  {/* STATS pill */}
                  <button
                    onClick={() => setScreen('stats')}
                    aria-label="View stats"
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
                      gap: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ fontSize: '14px', letterSpacing: 0 }} aria-hidden="true">📊</span>
                    <span>STATS</span>
                  </button>
                  {/* TROPHIES pill */}
                  <button
                    onClick={() => { setRecordReturnScreen('home'); setScreen('tournament-record'); }}
                    aria-label={`Tournament trophies: ${homeTrophyCount}. View record.`}
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
                      gap: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ fontSize: '14px', letterSpacing: 0 }} aria-hidden="true">🏆</span>
                    <span>{homeTrophyCount}</span>
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

                {/* SIGN IN / SAVE TROPHIES button (Phase 2, Deploy 5 / Stage 18).
                    Desktop version — same logic as phone, slightly larger sizing. */}
                {authReady && (
                  authUser && authProfile ? (
                    <div style={{
                      width: '100%',
                      marginBottom: '22px',
                      padding: '14px 18px',
                      background: 'rgba(95,176,74,0.10)',
                      border: '1px solid rgba(95,176,74,0.40)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          ...condFont, fontSize: '11px', letterSpacing: '0.3em',
                          color: '#5fb04a', fontWeight: 700, marginBottom: '3px'
                        }}>
                          SIGNED IN
                        </div>
                        <div style={{
                          ...displayFont, fontSize: '20px', fontWeight: 700,
                          color: colours.cream, letterSpacing: '0.02em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {authProfile.handle}
                        </div>
                      </div>
                      {/* Two stacked buttons — PROFILE (Stage 20) and SIGN OUT */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => { setProfileError(''); setDeleteConfirmStage(0); setScreen('profile'); }}
                          style={{
                            background: 'transparent', color: colours.gold,
                            border: `1px solid ${colours.gold}`, borderRadius: '7px',
                            ...condFont, fontSize: '12px', fontWeight: 600,
                            letterSpacing: '0.2em', padding: '7px 14px',
                            cursor: 'pointer'
                          }}
                        >
                          PROFILE →
                        </button>
                        <button
                          onClick={submitSignOut}
                          style={{
                            background: 'transparent', color: colours.muted,
                            border: `1px solid ${colours.muted}`, borderRadius: '7px',
                            ...condFont, fontSize: '12px', fontWeight: 600,
                            letterSpacing: '0.2em', padding: '7px 14px',
                            cursor: 'pointer'
                          }}
                        >
                          SIGN OUT
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { resetAuthForm(); setAuthMode('signup'); setScreen('auth'); }}
                      style={{
                        width: '100%', marginBottom: '22px',
                        padding: '16px 20px',
                        background: 'transparent',
                        color: colours.cream,
                        border: `1.5px solid rgba(212,175,55,0.55)`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span style={{
                        ...displayFont, fontSize: '21px', fontWeight: 700,
                        color: colours.gold, letterSpacing: '0.08em'
                      }}>
                        SIGN IN WHENEVER
                      </span>
                      <span style={{
                        ...condFont, fontSize: '12px', color: colours.muted,
                        fontStyle: 'italic', letterSpacing: '0.04em'
                      }}>
                        Save your trophies and score history
                      </span>
                    </button>
                  )
                )}

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

                {/* TOURNAMENT MODE — green when unlocked, locked/greyed for general public pre-launch.
                    Phase 2, Deploy 5 / Stage 15: button now ALWAYS renders. */}
                {tournamentUnlocked ? (
                  <button
                    onClick={() => setScreen('tournament-home')}
                    className="kick3-desktop-btn-tournament kick3-pulse-gold"
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
                ) : (
                  <button
                    disabled
                    aria-label="Tournament mode opens 11 June 2026"
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      background: '#3a3a44',
                      color: colours.muted,
                      border: 'none',
                      borderRadius: '12px',
                      ...displayFont,
                      fontSize: 'clamp(24px, 2.4vw, 30px)',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'not-allowed',
                      marginBottom: '14px',
                      boxShadow: '0 5px 0 rgba(0,0,0,0.25)',
                      opacity: 0.75
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span aria-hidden="true">🔒</span>
                      <span>TOURNAMENT MODE</span>
                    </span>
                    <span style={{
                      ...condFont,
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      color: colours.gold,
                      opacity: 0.95
                    }}>
                      OPENS 11 JUNE
                    </span>
                  </button>
                )}

                {/* PLAY TODAY — yellow */}
                <button
                  onClick={startGame}
                  disabled={soloLocked}
                  className="kick3-button-hover"
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
                      <span>SOLO MODE</span>
                    </>
                  )}
                </button>

                {/* 1V1 MODE — red */}
                <button
                  onClick={startH2H}
                  disabled={h2hLocked}
                  className="kick3-button-hover"
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
                    <span>2 PLAYER MODE</span>
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
    const cards = draftCardsForCurrentRound;
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

            {/* Tournament round banner — shows opponent and their three picks */}
            {mode === 'tournament' && tournamentOpponent && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 14px',
                background: 'rgba(95,176,74,0.10)',
                border: '1px solid rgba(95,176,74,0.40)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.28em', color: '#5fb04a', fontWeight: 700 }}>
                    ROUND {tournamentRound} OF 3
                  </div>
                  <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.24em', color: colours.muted }}>
                    {tournamentAttribute && `\u2022 ${tournamentAttribute.toUpperCase()}`}
                  </div>
                </div>
                <div style={{ ...displayFont, fontSize: '20px', fontWeight: 700, color: colours.cream, letterSpacing: '0.04em', marginBottom: '4px' }}>
                  VS {tournamentOpponent.label}
                </div>
                <div style={{ ...condFont, fontStyle: 'italic', fontSize: '12px', color: colours.muted, marginBottom: '10px', lineHeight: 1.4 }}>
                  {tournamentOpponent.vibe}
                </div>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.muted, marginBottom: '6px' }}>
                  THEIR THREE
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {resolveOpponentPicks(tournamentOpponent).map((p, i) => (
                    <div key={i} style={{
                      padding: '5px 9px',
                      background: 'rgba(0,0,0,0.30)',
                      border: `1px solid ${tierColourFor(p)}66`,
                      fontSize: '12px',
                      ...condFont,
                      fontWeight: 600,
                      color: colours.cream,
                      borderRadius: '4px'
                    }}>
                      {showTierBadge(p) && (
                        <span style={{ color: tierColourFor(p), marginRight: '4px' }}>
                          {TIER_SYMBOLS[p.tier] || '\u2022'}
                        </span>
                      )}
                      {p.name}
                    </div>
                  ))}
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

            {/* Question reminder — Phase 2, Deploy 4: category badge + hint line added */}
            {(() => {
              const activeCategory = mode === 'tournament'
                ? (tournamentAttribute || 'Legacy')
                : TODAYS_QUESTION.category;
              const categoryColour = CATEGORY_COLOURS[activeCategory] || colours.gold;
              const hintLine = CATEGORY_HINTS[activeCategory] || '';
              return (
                <div style={{ marginBottom: '24px', padding: '14px 18px', background: 'rgba(212,175,55,0.06)', borderLeft: `2px solid ${colours.gold}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.gold }}>
                      THE QUESTION
                    </div>
                    {/* Category badge */}
                    <div style={{
                      ...condFont,
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '3px',
                      background: `${categoryColour}22`,
                      border: `1px solid ${categoryColour}66`,
                      color: categoryColour
                    }}>
                      ● {activeCategory.toUpperCase()}
                    </div>
                  </div>
                  <p style={{ ...displayFont, fontSize: '18px', margin: '0 0 8px 0', lineHeight: '1.2' }}>
                    {mode === 'tournament' ? tournamentQuestionText : TODAYS_QUESTION.text}
                  </p>
                  {hintLine && (
                    <p style={{
                      ...condFont,
                      fontStyle: 'italic',
                      fontSize: '12px',
                      color: colours.muted,
                      margin: 0,
                      lineHeight: 1.4,
                      opacity: 0.85
                    }}>
                      {hintLine}
                    </p>
                  )}
                </div>
              );
            })()}

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
                      border: `1px solid ${tierColourFor(p)}55`,
                      fontSize: '13px',
                      ...condFont,
                      fontWeight: 600
                    }}>
                      {showTierBadge(p) && <span style={{ color: tierColourFor(p), marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>}
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
                // GK rule is now enforced upstream by the auto-swap logic at the top
                // of this screen — if the player has a keeper and a GK card appears,
                // it gets swapped for a non-GK pick before render. So isBlocked is
                // always false here. The styling branches kept in place defensively.
                // Phase 2, Deploy 4: was "ALREADY GOT A KEEPER" disabled card.
                const isBlocked = false;
                return (
                <button
                  key={i}
                  onClick={isBlocked ? undefined : () => pickPlayer(p)}
                  disabled={isBlocked}
                  style={{
                    background: colours.surface,
                    border: `1px solid ${isBlocked ? `${colours.muted}33` : `${tierColourFor(p)}66`}`,
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
                    e.currentTarget.style.borderColor = tierColourFor(p);
                  }}
                  onMouseOut={e => {
                    if (isBlocked) return;
                    e.currentTarget.style.background = colours.surface;
                    e.currentTarget.style.borderColor = `${tierColourFor(p)}66`;
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {showTierBadge(p) && (
                        <>
                          <span style={{ color: tierColourFor(p), fontSize: '16px' }}>{TIER_SYMBOLS[p.tier]}</span>
                          <span style={{ ...condFont, fontSize: '11px', letterSpacing: '0.25em', color: tierColourFor(p) }}>
                            {p.tier.toUpperCase()}
                          </span>
                        </>
                      )}
                    </div>
                    {p.isWorldCup ? (
                      // R3 World Cup cards: show Overall rating as a gold badge top-right.
                      // Phase 2, Deploy 1 / Stage 4. Per spec: Overall shown on the player's
                      // six R3 draft cards only — never on opponents or Pete's three picks.
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: '3px',
                        padding: '4px 10px',
                        background: colours.gold,
                        color: '#0a0a14',
                        borderRadius: '3px',
                        ...displayFont,
                        fontWeight: 700,
                        lineHeight: 1
                      }}>
                        <span style={{ fontSize: '16px' }}>{Number(p.overall).toFixed(1)}</span>
                        <span style={{ fontSize: '9px', letterSpacing: '0.18em', opacity: 0.75 }}>OVR</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '20px' }}>{p.flag}</span>
                    )}
                  </div>
                  <div style={{ ...displayFont, fontSize: '26px', lineHeight: '1.1', fontWeight: 500, marginBottom: '4px' }}>
                    {p.name}
                  </div>
                  <div style={{ ...condFont, fontStyle: 'italic', color: colours.muted, fontSize: '14px' }}>
                    {p.note}
                  </div>
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
                  borderLeft: `3px solid ${tierColourFor(p)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ ...displayFont, fontSize: '20px', fontWeight: 500 }}>{p.name}</div>
                    {showTierBadge(p) && (
                      <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.2em', color: tierColourFor(p) }}>
                        {TIER_SYMBOLS[p.tier]} {p.tier.toUpperCase()}
                      </div>
                    )}
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
                    borderLeft: `2px solid ${tierColourFor(p)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '15px'
                  }}>
                    <span style={{ ...condFont, fontWeight: 600, letterSpacing: '0.02em' }}>
                      {showTierBadge(p) && <span style={{ color: tierColourFor(p), marginRight: '8px' }}>{TIER_SYMBOLS[p.tier]}</span>}
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
              {showTierBadge(p) && <span style={{ color: tierColourFor(p), marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>}
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
                    border: `1px solid ${tierColourFor(p)}55`
                  }}>
                    {showTierBadge(p) && <span style={{ color: tierColourFor(p), marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>}
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
                    border: `1px solid ${tierColourFor(p)}88`
                  }}>
                    {showTierBadge(p) && <span style={{ color: tierColourFor(p), marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>}
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
              {showTierBadge(p) && <span style={{ color: tierColourFor(p), marginRight: '4px' }}>{TIER_SYMBOLS[p.tier]}</span>}
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
        body: "Score out of 10. A grudging nod or an absolute roasting. Share the verdict card — your score, Pete's face."
      },
      {
        n: 5,
        title: "3 SOLO + 3 1V1 PER DAY",
        body: "Limited plays. Use them. Come back tomorrow for a fresh question."
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

  // ---------- AUTH SCREEN (sign-up / sign-in) ----------
  // Phase 2, Deploy 5 / Stage 18. Single screen handles both new and returning
  // users. authMode toggles between 'signup' and 'signin' — controlled by a
  // small link at the bottom. Header sells the value (save trophies); form has
  // inline validation; submit button changes label per mode.
  if (screen === 'auth') {
    const isSignUp = authMode === 'signup';
    const headerTitle = isSignUp ? 'SAVE YOUR TROPHIES' : 'WELCOME BACK';
    const headerSubtitle = isSignUp
      ? 'Optional — the game works fully without it.'
      : 'Sign in to keep your record across devices.';
    const submitLabel = isSignUp
      ? (authLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT')
      : (authLoading ? 'SIGNING IN...' : 'SIGN IN');
    const toggleLabel = isSignUp
      ? 'Already have an account? Sign in →'
      : '\u2190 New player? Create an account';
    const onSubmit = isSignUp ? submitSignUp : submitSignIn;
    const canSubmit = !authLoading && authHandle.trim().length > 0 && authPassword.length > 0
      && (!isSignUp || authPasswordConfirm.length > 0);

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '500px' }}>

            {/* Back to home — small chip top-left */}
            <button
              onClick={() => { resetAuthForm(); setScreen('home'); }}
              style={{
                background: 'transparent',
                color: colours.muted,
                border: `1px solid ${colours.muted}`,
                borderRadius: '5px',
                ...condFont, fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.2em', padding: '6px 12px',
                cursor: 'pointer', marginBottom: '24px'
              }}
            >
              ← BACK
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{
                ...displayFont, fontSize: 'clamp(32px, 8vw, 44px)',
                fontWeight: 800, color: colours.gold, margin: 0,
                letterSpacing: '0.04em', lineHeight: 1
              }}>
                {headerTitle}
              </h1>
              <p style={{
                ...condFont, fontSize: '13px', color: colours.muted,
                marginTop: '12px', marginBottom: 0, lineHeight: 1.5,
                fontStyle: 'italic'
              }}>
                {headerSubtitle}
              </p>
            </div>

            {/* Value prop — only shown on sign-up.
                Three bullet points framing why signing in is worth it. */}
            {isSignUp && (
              <div style={{
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.20)',
                padding: '14px 18px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <div style={{
                  ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                  color: colours.gold, fontWeight: 700, marginBottom: '10px'
                }}>
                  WHY SIGN IN
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '7px',
                  ...condFont, fontSize: '13px', color: colours.cream, lineHeight: 1.4
                }}>
                  <div><span style={{ color: '#5fb04a', marginRight: '8px', fontWeight: 700 }}>✓</span>Save your tournament trophies forever</div>
                  <div><span style={{ color: '#5fb04a', marginRight: '8px', fontWeight: 700 }}>✓</span>Keep your daily score history</div>
                  <div><span style={{ color: '#5fb04a', marginRight: '8px', fontWeight: 700 }}>✓</span>Keep your record across phone, laptop, tablet</div>
                  <div><span style={{ color: '#5fb04a', marginRight: '8px', fontWeight: 700 }}>✓</span>Compete on leaderboards (coming soon)</div>
                </div>
              </div>
            )}

            {/* Success state — replaces form once sign-up/sign-in completes */}
            {authSuccess && (
              <div style={{
                background: 'rgba(95,176,74,0.10)',
                border: '1px solid rgba(95,176,74,0.40)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', lineHeight: 1, marginBottom: '8px' }} aria-hidden="true">🎉</div>
                <div style={{
                  ...displayFont, fontSize: '20px', fontWeight: 700,
                  color: colours.cream, letterSpacing: '0.02em'
                }}>
                  {authSuccess}
                </div>
                <div style={{
                  ...condFont, fontSize: '12px', color: colours.muted,
                  marginTop: '8px', fontStyle: 'italic'
                }}>
                  Taking you home...
                </div>
              </div>
            )}

            {/* Form — hidden after success */}
            {!authSuccess && (
              <>
                {/* Handle field */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{
                    ...condFont, fontSize: '11px', letterSpacing: '0.25em',
                    color: colours.gold, fontWeight: 700, display: 'block',
                    marginBottom: '6px'
                  }}>
                    HANDLE
                  </label>
                  <input
                    type="text"
                    value={authHandle}
                    onChange={(e) => { setAuthHandle(e.target.value.slice(0, 20)); setAuthError(''); }}
                    placeholder={isSignUp ? "Pick a name (3-20 chars)" : "Your handle"}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    style={{
                      width: '100%', padding: '13px 14px',
                      background: 'rgba(0,0,0,0.30)',
                      border: `1px solid rgba(212,175,55,0.30)`,
                      color: colours.cream,
                      ...condFont, fontSize: '15px', fontWeight: 600,
                      borderRadius: '6px', boxSizing: 'border-box',
                      outline: 'none', letterSpacing: '0.02em'
                    }}
                  />
                  {isSignUp && (
                    <div style={{
                      ...condFont, fontSize: '11px', color: colours.muted,
                      marginTop: '5px', fontStyle: 'italic'
                    }}>
                      Letters, numbers, underscores. Must start with a letter.
                    </div>
                  )}
                </div>

                {/* Password field */}
                <div style={{ marginBottom: isSignUp ? '14px' : '20px' }}>
                  <label style={{
                    ...condFont, fontSize: '11px', letterSpacing: '0.25em',
                    color: colours.gold, fontWeight: 700, display: 'block',
                    marginBottom: '6px'
                  }}>
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
                    placeholder={isSignUp ? "8+ characters" : "Your password"}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    style={{
                      width: '100%', padding: '13px 14px',
                      background: 'rgba(0,0,0,0.30)',
                      border: `1px solid rgba(212,175,55,0.30)`,
                      color: colours.cream,
                      ...condFont, fontSize: '15px', fontWeight: 600,
                      borderRadius: '6px', boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Confirm password — sign-up only */}
                {isSignUp && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      ...condFont, fontSize: '11px', letterSpacing: '0.25em',
                      color: colours.gold, fontWeight: 700, display: 'block',
                      marginBottom: '6px'
                    }}>
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      value={authPasswordConfirm}
                      onChange={(e) => { setAuthPasswordConfirm(e.target.value); setAuthError(''); }}
                      placeholder="Type it again"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      style={{
                        width: '100%', padding: '13px 14px',
                        background: 'rgba(0,0,0,0.30)',
                        border: `1px solid rgba(212,175,55,0.30)`,
                        color: colours.cream,
                        ...condFont, fontSize: '15px', fontWeight: 600,
                        borderRadius: '6px', boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                {/* Error message */}
                {authError && (
                  <div style={{
                    background: 'rgba(232,52,74,0.10)',
                    border: '1px solid rgba(232,52,74,0.40)',
                    padding: '11px 14px', borderRadius: '6px',
                    marginBottom: '16px',
                    ...condFont, fontSize: '13px', color: colours.accent,
                    lineHeight: 1.4, fontWeight: 600
                  }}>
                    {authError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  style={{
                    width: '100%', padding: '16px',
                    background: canSubmit ? colours.gold : '#3a3a44',
                    color: canSubmit ? '#000' : colours.muted,
                    border: 'none', borderRadius: '10px',
                    ...displayFont, fontSize: '20px', fontWeight: 800,
                    letterSpacing: '0.1em',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? '0 4px 0 rgba(0,0,0,0.25)' : 'none',
                    marginBottom: '16px'
                  }}
                >
                  {submitLabel}
                </button>

                {/* Toggle mode link */}
                <button
                  onClick={() => { setAuthMode(isSignUp ? 'signin' : 'signup'); resetAuthForm(); }}
                  disabled={authLoading}
                  style={{
                    width: '100%', padding: '10px',
                    background: 'transparent',
                    color: colours.cream,
                    border: 'none',
                    ...condFont, fontSize: '13px', fontWeight: 600,
                    letterSpacing: '0.06em',
                    cursor: authLoading ? 'not-allowed' : 'pointer',
                    opacity: authLoading ? 0.5 : 0.85,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px'
                  }}
                >
                  {toggleLabel}
                </button>
              </>
            )}
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- PROFILE SCREEN ----------
  // Phase 2, Deploy 5 / Stage 20. Shows the signed-in user's handle, account
  // creation date, cloud trophy state with "last synced" timestamp, and the
  // delete-account flow (two-tap confirm).
  if (screen === 'profile') {
    // Defensive: if somehow on profile when signed out, route home.
    if (!authUser || !authProfile) {
      return (
        <>
          <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
          <div style={bgStyle}>
            <div style={pitchOverlay} />
            <div style={{ ...container, maxWidth: '500px', textAlign: 'center', paddingTop: '60px' }}>
              <p style={{ ...condFont, color: colours.muted }}>You need to be signed in to view this page.</p>
              <button
                onClick={() => setScreen('home')}
                style={{
                  marginTop: '20px', padding: '12px 24px',
                  background: colours.gold, color: '#000',
                  border: 'none', borderRadius: '8px',
                  ...displayFont, fontSize: '14px', fontWeight: 700,
                  letterSpacing: '0.12em', cursor: 'pointer'
                }}
              >
                BACK TO HOME
              </button>
            </div>
          </div>
        </>
      );
    }

    // Format account creation date — "Joined June 2026" style.
    const formatJoinDate = (iso) => {
      if (!iso) return '—';
      try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      } catch { return '—'; }
    };
    const joinDate = formatJoinDate(authProfile.created_at);
    const lastSynced = profileCloudState ? formatLastSynced(profileCloudState.updated_at) : 'Never';
    const cloudTrophies = profileCloudState ? (profileCloudState.trophy_count || 0) : 0;
    const localTrophies = readTournamentState().trophyCount || 0;

    // Stage 22.6: loyalty data. Prefer cloud value (might be ahead if user
    // played on another device), fall back to localStorage if cloud unavailable.
    const localDays = parseInt(localStorage.getItem('kick3_distinct_days') || '0', 10) || 0;
    const cloudDays = profileCloudState ? (profileCloudState.distinct_days_played || 0) : 0;
    const profileDays = Math.max(localDays, cloudDays);
    const profileTier = loyaltyTierFor(profileDays);

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '500px' }}>

            {/* Back chip top-left */}
            <button
              onClick={() => setScreen('home')}
              style={{
                background: 'transparent',
                color: colours.muted,
                border: `1px solid ${colours.muted}`,
                borderRadius: '5px',
                ...condFont, fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.2em', padding: '6px 12px',
                cursor: 'pointer', marginBottom: '20px'
              }}
            >
              ← BACK
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#5fb04a', marginBottom: '8px', fontWeight: 700 }}>
                YOUR PROFILE
              </div>
              <h1 style={{
                ...displayFont, fontSize: 'clamp(36px, 9vw, 50px)',
                fontWeight: 800, color: colours.gold, margin: 0,
                letterSpacing: '0.04em', lineHeight: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {authProfile.handle}
              </h1>
              <div style={{
                ...condFont, fontSize: '12px', color: colours.muted,
                marginTop: '10px', fontStyle: 'italic'
              }}>
                Joined {joinDate}
              </div>
            </div>

            {/* Cloud state card */}
            <div style={{
              background: colours.surface,
              padding: '18px 20px',
              borderRadius: '8px',
              marginBottom: '14px',
              borderTop: `2px solid ${colours.gold}`
            }}>
              <div style={{
                ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                color: colours.gold, fontWeight: 700, marginBottom: '12px'
              }}>
                CLOUD STATE
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ ...condFont, fontSize: '13px', color: colours.cream }}>Trophies in cloud</span>
                <span style={{ ...displayFont, fontSize: '24px', fontWeight: 700, color: colours.gold, lineHeight: 1 }}>
                  {profileLoading ? '...' : cloudTrophies}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ ...condFont, fontSize: '13px', color: colours.cream }}>Trophies on this device</span>
                <span style={{ ...displayFont, fontSize: '24px', fontWeight: 700, color: colours.cream, lineHeight: 1 }}>
                  {localTrophies}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ ...condFont, fontSize: '12px', color: colours.muted }}>Last synced</span>
                <span style={{ ...condFont, fontSize: '12px', color: colours.muted, fontWeight: 600 }}>
                  {profileLoading ? '...' : lastSynced}
                </span>
              </div>
              {/* If cloud and local differ, show a small explainer */}
              {!profileLoading && cloudTrophies !== localTrophies && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 10px',
                  background: 'rgba(212,175,55,0.06)',
                  borderRadius: '4px',
                  ...condFont, fontSize: '11px', color: colours.muted,
                  fontStyle: 'italic', lineHeight: 1.4
                }}>
                  {localTrophies > cloudTrophies
                    ? 'This device has more. Cloud syncs at the end of every tournament attempt.'
                    : 'Cloud has more (likely from another device).'
                  }
                </div>
              )}
            </div>

            {/* Stage 22.6: LOYALTY card. Sits below Cloud State. Shows the
                player's current tier as a coloured pill, days-played counter,
                and progress-to-next-tier line. */}
            <div style={{
              background: colours.surface,
              padding: '18px 20px',
              borderRadius: '8px',
              marginBottom: '14px',
              borderTop: `2px solid ${profileTier.color || colours.muted}`
            }}>
              <div style={{
                ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                color: profileTier.color || colours.muted,
                fontWeight: 700, marginBottom: '14px'
              }}>
                LOYALTY
              </div>
              {/* Tier display — big pill, or "no badge yet" line */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ ...condFont, fontSize: '13px', color: colours.cream }}>
                  Current tier
                </span>
                {profileTier.tier !== 'NONE' ? (
                  <span style={{
                    background: profileTier.color,
                    color: profileTier.textColor,
                    ...condFont, fontSize: '12px', fontWeight: 700,
                    letterSpacing: '0.18em',
                    padding: '5px 12px', borderRadius: '4px'
                  }}>
                    {profileTier.label}
                  </span>
                ) : (
                  <span style={{ ...condFont, fontSize: '12px', color: colours.muted, fontStyle: 'italic' }}>
                    No tier yet
                  </span>
                )}
              </div>
              {/* Days played */}
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ ...condFont, fontSize: '13px', color: colours.cream }}>
                  Days played
                </span>
                <span style={{
                  ...displayFont, fontSize: '20px', fontWeight: 700,
                  color: colours.cream, lineHeight: 1
                }}>
                  {profileDays}
                </span>
              </div>
              {/* Progress to next tier — only when not at DIAMOND */}
              {profileTier.daysToNext !== null && (
                <div style={{
                  paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)',
                  ...condFont, fontSize: '11px', color: colours.muted,
                  textAlign: 'center', fontStyle: 'italic', lineHeight: 1.4
                }}>
                  {profileTier.daysToNext === 1
                    ? '1 day until '
                    : `${profileTier.daysToNext} days until `}
                  {profileTier.tier === 'NONE'   && 'BRONZE'}
                  {profileTier.tier === 'BRONZE' && 'SILVER'}
                  {profileTier.tier === 'SILVER' && 'GOLD'}
                  {profileTier.tier === 'GOLD'   && 'DIAMOND'}
                </div>
              )}
              {profileTier.tier === 'DIAMOND' && (
                <div style={{
                  paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)',
                  ...condFont, fontSize: '11px', color: '#b9f2ff',
                  textAlign: 'center', fontStyle: 'italic', lineHeight: 1.4
                }}>
                  Top tier reached. Living legend.
                </div>
              )}
            </div>

            {/* Error display */}
            {profileError && (
              <div style={{
                background: 'rgba(232,52,74,0.10)',
                border: '1px solid rgba(232,52,74,0.40)',
                padding: '11px 14px', borderRadius: '6px',
                marginBottom: '14px',
                ...condFont, fontSize: '13px', color: colours.accent,
                lineHeight: 1.4, fontWeight: 600
              }}>
                {profileError}
              </div>
            )}

            {/* Sign out button — primary action */}
            <button
              onClick={submitSignOut}
              disabled={deleteInProgress}
              style={{
                width: '100%', padding: '14px',
                background: 'transparent',
                color: colours.cream,
                border: `1.5px solid ${colours.muted}`,
                borderRadius: '8px',
                ...displayFont, fontSize: '16px', fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: deleteInProgress ? 'not-allowed' : 'pointer',
                marginBottom: '24px',
                opacity: deleteInProgress ? 0.5 : 1
              }}
            >
              SIGN OUT
            </button>

            {/* Danger zone */}
            <div style={{
              padding: '16px 18px',
              background: 'rgba(232,52,74,0.06)',
              border: '1px solid rgba(232,52,74,0.30)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                ...condFont, fontSize: '10px', letterSpacing: '0.3em',
                color: colours.accent, fontWeight: 700, marginBottom: '8px'
              }}>
                DANGER ZONE
              </div>
              <p style={{
                ...condFont, fontSize: '12px', color: colours.cream,
                margin: '0 0 12px 0', lineHeight: 1.5
              }}>
                Delete your account, your cloud trophy record and score history, and your local game state on this device. Cannot be undone.
              </p>
              <button
                onClick={submitDeleteAccount}
                disabled={deleteInProgress}
                style={{
                  width: '100%', padding: '12px',
                  background: deleteConfirmStage === 1 ? colours.accent : 'transparent',
                  color: deleteConfirmStage === 1 ? colours.cream : colours.accent,
                  border: `1.5px solid ${colours.accent}`,
                  borderRadius: '7px',
                  ...condFont, fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.18em',
                  cursor: deleteInProgress ? 'not-allowed' : 'pointer',
                  opacity: deleteInProgress ? 0.5 : 1
                }}
              >
                {deleteInProgress
                  ? 'DELETING...'
                  : deleteConfirmStage === 1
                    ? 'TAP AGAIN TO CONFIRM'
                    : 'DELETE MY ACCOUNT'
                }
              </button>
              {deleteConfirmStage === 1 && !deleteInProgress && (
                <div style={{
                  ...condFont, fontSize: '11px', color: colours.muted,
                  marginTop: '8px', textAlign: 'center', fontStyle: 'italic'
                }}>
                  Reverts in 5 seconds if you change your mind.
                </div>
              )}
            </div>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- LEADERBOARD (placeholder — full build in Stage C) ----------
  // Stage 22.1: route exists, button is wired, screen renders. The real
  // leaderboard fetch + table + your-rank panel come in Stage C.
  //
  // Sign-in gate: locked per Friday morning decision — leaderboards require
  // authentication. Signed-out players see a prompt-to-sign-in screen.
  if (screen === 'leaderboard') {
    // Signed-out: show sign-in prompt instead of the leaderboard.
    if (!authUser) {
      return (
        <>
          <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
          <div style={bgStyle}>
            <div style={pitchOverlay} />
            <div style={{ ...container, maxWidth: '500px', paddingTop: '40px' }}>
              {/* Back chip top-left */}
              <button
                onClick={() => setScreen('home')}
                style={{
                  background: 'transparent', color: colours.muted,
                  border: `1px solid ${colours.muted}`, borderRadius: '5px',
                  ...condFont, fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.2em', padding: '6px 12px',
                  cursor: 'pointer', marginBottom: '32px'
                }}
              >
                ← BACK
              </button>
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '14px', fontWeight: 700 }}>
                  LEADERBOARD
                </div>
                <h1 style={{
                  ...displayFont, fontSize: 'clamp(28px, 7vw, 36px)',
                  fontWeight: 800, color: colours.cream, margin: '0 0 14px 0',
                  letterSpacing: '0.02em', lineHeight: 1.1
                }}>
                  Sign in to see the leaderboard
                </h1>
                <p style={{
                  ...condFont, fontSize: '14px', color: colours.muted,
                  marginBottom: '28px', lineHeight: 1.5
                }}>
                  The World Cup leaderboard tracks tournament trophies across the 39-day window. Available to signed-in players only.
                </p>
                <button
                  onClick={() => { resetAuthForm(); setAuthMode('signup'); setScreen('auth'); }}
                  style={{
                    padding: '14px 28px', background: colours.gold, color: '#000',
                    border: 'none', borderRadius: '8px',
                    ...displayFont, fontSize: '15px', fontWeight: 700,
                    letterSpacing: '0.12em', cursor: 'pointer'
                  }}
                >
                  SIGN IN →
                </button>
              </div>
            </div>
          </div>
          <Analytics />
        </>
      );
    }

    // Signed-in: placeholder. Real leaderboard table renders in Stage C.
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '700px', paddingTop: '40px' }}>
            {/* Back chip top-left */}
            <button
              onClick={() => setScreen('home')}
              style={{
                background: 'transparent', color: colours.muted,
                border: `1px solid ${colours.muted}`, borderRadius: '5px',
                ...condFont, fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.2em', padding: '6px 12px',
                cursor: 'pointer', marginBottom: '24px'
              }}
            >
              ← BACK
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '8px', fontWeight: 700 }}>
                WORLD CUP LEADERBOARD
              </div>
              <h1 style={{
                ...displayFont, fontSize: 'clamp(32px, 8vw, 44px)',
                fontWeight: 800, color: colours.cream, margin: 0,
                letterSpacing: '0.02em', lineHeight: 1
              }}>
                11 June &mdash; 19 July 2026
              </h1>
            </div>

            {/* Stage 22.5 polished leaderboard table.
                Data fetched + polled in 22.4. This is the visual layer:
                - Ranked rows with handle, loyalty badge, trophies, attempts
                - Own row highlighted in gold
                - Striped rows for readability
                - Loyalty badge pill inline next to each handle */}

            {/* Refresh + last-fetched timestamp (unchanged from 22.4) */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px', padding: '10px 14px',
              background: colours.surface, borderRadius: '6px'
            }}>
              <div style={{ ...condFont, fontSize: '11px', color: colours.muted, letterSpacing: '0.05em' }}>
                {leaderboardLoading
                  ? 'Loading\u2026'
                  : leaderboardLastFetched
                    ? `Updated ${Math.floor((Date.now() - leaderboardLastFetched) / 1000)}s ago`
                    : 'Not yet fetched'}
              </div>
              <button
                onClick={() => refreshLeaderboard(false)}
                style={{
                  background: 'transparent', color: colours.gold,
                  border: `1px solid ${colours.gold}`, borderRadius: '5px',
                  ...condFont, fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.2em', padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                REFRESH
              </button>
            </div>

            {/* Error display if fetch failed */}
            {leaderboardError && (
              <div style={{
                background: 'rgba(232,52,74,0.10)',
                border: '1px solid rgba(232,52,74,0.40)',
                padding: '11px 14px', borderRadius: '6px',
                marginBottom: '14px',
                ...condFont, fontSize: '13px', color: colours.accent,
                lineHeight: 1.4, fontWeight: 600
              }}>
                {leaderboardError}
              </div>
            )}

            {/* Main leaderboard table — top 50.
                Empty state shown when fetch returned zero rows.
                Own-row detection: compare row.handle to authProfile.handle.
                Loyalty badge inline using loyaltyTierFor(). */}
            <div style={{
              background: colours.surface,
              borderRadius: '10px',
              marginBottom: '14px',
              overflow: 'hidden',
              borderTop: `2px solid ${colours.gold}`
            }}>
              {/* Column headers */}
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                ...condFont, fontSize: '10px', letterSpacing: '0.25em',
                color: colours.gold, fontWeight: 700
              }}>
                <span style={{ width: '34px' }}>RANK</span>
                <span style={{ flex: 1, minWidth: 0 }}>PLAYER</span>
                <span style={{ width: '52px', textAlign: 'right' }}>TROPHIES</span>
                <span style={{ width: '52px', textAlign: 'right', marginLeft: '14px' }}>ATTEMPTS</span>
              </div>

              {/* Empty state */}
              {leaderboardRows.length === 0 && !leaderboardLoading && (
                <div style={{
                  padding: '32px 16px', textAlign: 'center',
                  ...condFont, fontSize: '13px', color: colours.muted,
                  fontStyle: 'italic', lineHeight: 1.6
                }}>
                  No trophies won yet.<br/>Be the first.
                </div>
              )}

              {/* Loading state */}
              {leaderboardLoading && leaderboardRows.length === 0 && (
                <div style={{
                  padding: '32px 16px', textAlign: 'center',
                  ...condFont, fontSize: '12px', color: colours.muted, letterSpacing: '0.15em'
                }}>
                  Loading…
                </div>
              )}

              {/* Ranked rows */}
              {leaderboardRows.map((row, i) => {
                const tier = loyaltyTierFor(row.distinct_days_played);
                const isMe = authProfile && authProfile.handle === row.handle;
                const rank = i + 1;
                return (
                  <div key={row.handle} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '10px 14px',
                    background: isMe
                      ? 'rgba(212,175,55,0.10)'
                      : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'),
                    borderLeft: isMe ? `3px solid ${colours.gold}` : '3px solid transparent',
                    borderBottom: i < leaderboardRows.length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : 'none'
                  }}>
                    {/* Rank */}
                    <span style={{
                      width: '34px',
                      ...displayFont, fontSize: '15px', fontWeight: 700,
                      color: rank <= 3 ? colours.gold : colours.muted
                    }}>
                      {rank}
                    </span>
                    {/* Handle + loyalty badge */}
                    <span style={{
                      flex: 1, minWidth: 0,
                      display: 'flex', alignItems: 'center', gap: '6px',
                      overflow: 'hidden'
                    }}>
                      <span style={{
                        ...condFont, fontSize: '13px', fontWeight: 600,
                        color: colours.cream,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: '0 1 auto', minWidth: 0
                      }}>
                        {row.handle}
                      </span>
                      {tier.tier !== 'NONE' && (
                        <span style={{
                          background: tier.color,
                          color: tier.textColor,
                          ...condFont, fontSize: '8px', fontWeight: 700,
                          letterSpacing: '0.12em',
                          padding: '2px 5px', borderRadius: '3px',
                          flexShrink: 0,
                          textTransform: 'uppercase'
                        }}>
                          {tier.label}
                        </span>
                      )}
                    </span>
                    {/* Trophies (emphasised) */}
                    <span style={{
                      width: '52px', textAlign: 'right',
                      ...displayFont, fontSize: '17px', fontWeight: 700,
                      color: colours.gold
                    }}>
                      {row.trophy_count}
                    </span>
                    {/* Attempts (quieter) */}
                    <span style={{
                      width: '52px', textAlign: 'right', marginLeft: '14px',
                      ...condFont, fontSize: '12px', color: colours.muted
                    }}>
                      {row.tournaments_attempted}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Your-rank panel — appears when signed-in user has a position
                AND isn't already visible in the top 50. If they're in the
                top 50, no separate panel needed (their row is highlighted). */}
            {leaderboardUserRank && leaderboardUserRank.rank > 50 && (() => {
              const myTier = loyaltyTierFor(leaderboardUserRank.row.distinct_days_played);
              return (
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(212,175,55,0.08)',
                  border: `1px solid rgba(212,175,55,0.40)`,
                  borderRadius: '10px',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    ...condFont, fontSize: '10px', letterSpacing: '0.28em',
                    color: colours.gold, fontWeight: 700, marginBottom: '10px'
                  }}>
                    YOUR RANK
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      width: '50px',
                      ...displayFont, fontSize: '20px', fontWeight: 700,
                      color: colours.gold
                    }}>
                      #{leaderboardUserRank.rank}
                    </span>
                    <span style={{
                      flex: 1, minWidth: 0,
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <span style={{
                        ...condFont, fontSize: '14px', fontWeight: 600,
                        color: colours.cream,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {leaderboardUserRank.row.handle}
                      </span>
                      {myTier.tier !== 'NONE' && (
                        <span style={{
                          background: myTier.color,
                          color: myTier.textColor,
                          ...condFont, fontSize: '8px', fontWeight: 700,
                          letterSpacing: '0.12em',
                          padding: '2px 5px', borderRadius: '3px',
                          flexShrink: 0
                        }}>
                          {myTier.label}
                        </span>
                      )}
                    </span>
                    <span style={{
                      ...displayFont, fontSize: '18px', fontWeight: 700,
                      color: colours.gold, marginLeft: '10px'
                    }}>
                      {leaderboardUserRank.row.trophy_count}
                    </span>
                    <span style={{
                      ...condFont, fontSize: '11px', color: colours.muted,
                      marginLeft: '8px', minWidth: '34px', textAlign: 'right'
                    }}>
                      🏆
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Signed-in, in top 50 → small confirmation note */}
            {leaderboardUserRank && leaderboardUserRank.rank <= 50 && (
              <div style={{
                padding: '10px 14px', background: 'rgba(212,175,55,0.04)',
                borderRadius: '6px', marginBottom: '14px',
                ...condFont, fontSize: '12px', color: colours.muted,
                fontStyle: 'italic', textAlign: 'center'
              }}>
                You’re #{leaderboardUserRank.rank} — see your row above.
              </div>
            )}

            {/* Signed-in but no trophies yet → invitation to play */}
            {!leaderboardUserRank && !leaderboardLoading && authProfile && (
              <div style={{
                padding: '14px 16px', background: colours.surface,
                borderRadius: '8px', marginBottom: '14px',
                ...condFont, fontSize: '12px', color: colours.muted,
                fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5
              }}>
                Win your first tournament trophy to appear on the leaderboard.
              </div>
            )}
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
    // debug=unlock and debug=locked both simulate "tournament is live today" — they
    // would be useless if insideWindow gated them out. Outside debug, insideWindow
    // strictly enforces the real 11 Jun – 19 Jul window.
    const insideWindow = !!tournamentStatus || debugMode === 'unlock' || debugMode === 'locked';
    const canPlay = insideWindow && !playedToday;

    // Dynamic context line — Phase 2, Deploy 5 / Stage 14.
    // Now reflects the 3-attempts-per-day + 1-trophy-per-day model:
    //   - Outside window: tournament returns date
    //   - Trophy won today: "Trophy earned today. Come back tomorrow."
    //   - Attempts exhausted (3/3 used, no trophy): "Three goes today. Try again tomorrow."
    //   - Fresh start of day (0 attempts used): "Three goes at the trophy. Three questions per go. Beat Pete to win it."
    //   - Mid-day (some attempts used, no trophy): "X attempts left. Beat Pete in Round 3 to earn a trophy."
    // Safe access: debug modes can flip insideWindow=true while tournamentStatus is still null
    // (when real today is outside the window).
    const dailyForContext = effectiveDailyState(tournamentState);
    const attemptsLeft = TOURNAMENT_DAILY_ATTEMPT_CAP - dailyForContext.attemptsToday;
    let contextLine;
    if (!insideWindow) {
      contextLine = 'Tournament returns 11 June 2026. Beat Pete in Round 3 to win a trophy.';
    } else if (dailyForContext.wonTodayFlag) {
      contextLine = `Trophy earned today. Come back tomorrow.`;
    } else if (attemptsLeft <= 0) {
      contextLine = `Three goes today, no trophy. Come back tomorrow.`;
    } else if (dailyForContext.attemptsToday === 0) {
      contextLine = `Three goes at the trophy. Three questions per go. Beat Pete to win it.`;
    } else {
      contextLine = `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left today. Beat Pete in Round 3 to earn a trophy.`;
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

          /* ============ Phase 2, Deploy 5 / Stage 5 — button animations ============ */
          /* Same shared classes as the home screen. Tournament-home <style> block is
             scoped to this screen only so we duplicate the definitions here. */
          .kick3-button-hover {
            transition: transform 0.18s ease-out, box-shadow 0.18s ease-out, filter 0.18s ease-out;
          }
          .kick3-button-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            filter: brightness(1.08);
          }
          .kick3-button-hover:active:not(:disabled) {
            transform: translateY(0);
            filter: brightness(0.96);
          }

          @keyframes kick3-pulse-gold-kf {
            0%, 100% {
              box-shadow: 0 4px 0 rgba(0,0,0,0.25), 0 0 0 1px rgba(95,176,74,0.18), 0 0 24px 4px rgba(95,176,74,0.28);
            }
            50% {
              box-shadow: 0 4px 0 rgba(0,0,0,0.25), 0 0 0 6px rgba(95,176,74,0.45), 0 0 42px 12px rgba(95,176,74,0.65);
            }
          }
          .kick3-pulse-gold {
            animation: kick3-pulse-gold-kf 3.6s ease-in-out infinite;
          }
          .kick3-pulse-gold:disabled {
            animation: none;
          }

          @keyframes kick3-shimmer-gold-kf {
            0%   { transform: translateX(-110%) skewX(-18deg); }
            18%  { transform: translateX(110%)  skewX(-18deg); }
            100% { transform: translateX(110%)  skewX(-18deg); }
          }
          .kick3-shimmer-gold {
            position: relative;
            overflow: hidden;
          }
          .kick3-shimmer-gold::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 40%;
            height: 100%;
            background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 50%, transparent 100%);
            animation: kick3-shimmer-gold-kf 5s ease-in-out infinite;
            pointer-events: none;
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
                onClick={canPlay ? startTournament : undefined}
                disabled={!canPlay}
                className="kick3-button-hover kick3-pulse-gold"
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

              {/* Stage 22: LEADERBOARDS button between PLAY NOW and RECORD.
                  Same visual rhythm as RECORD (gold outline transparent fill).
                  Routes to 'leaderboard' screen — sign-in gate handled inside. */}
              <button
                onClick={() => setScreen('leaderboard')}
                className="kick3-button-hover"
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
                  marginBottom: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                <span style={{ fontSize: '16px' }} aria-hidden="true">📊</span>
                <span>LEADERBOARD</span>
              </button>

              {/* RECORD — gold outline, active (opens tournament-record screen) */}
              <button
                onClick={() => { setRecordReturnScreen('tournament-home'); setScreen('tournament-record'); }}
                className="kick3-button-hover kick3-shimmer-gold"
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
                  onClick={canPlay ? startTournament : undefined}
                  disabled={!canPlay}
                  className="kick3-tour-btn-play kick3-pulse-gold"
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

                {/* Stage 22: LEADERBOARDS button (desktop) between PLAY NOW
                    and RECORD. Sign-in gate handled inside the leaderboard route. */}
                <button
                  onClick={() => setScreen('leaderboard')}
                  className="kick3-button-hover"
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
                    marginBottom: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '18px' }} aria-hidden="true">📊</span>
                  <span>LEADERBOARD</span>
                </button>

                {/* RECORD — gold outline, active */}
                <button
                  onClick={() => { setRecordReturnScreen('tournament-home'); setScreen('tournament-record'); }}
                  className="kick3-button-hover kick3-shimmer-gold"
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

            {/* Back — routes to wherever we came from (tournament-home or home).
                Phase 2, Deploy 5 / Stage 16: label adapts to destination. */}
            <button
              onClick={() => setScreen(recordReturnScreen)}
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
              ← {recordReturnScreen === 'home' ? 'BACK TO HOME' : 'BACK TO TOURNAMENT'}
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT VAR CHECKING SCREEN ----------
  // Phase 2, Deploy 5 / Stage 1. Suspense beat between draft submit and verdict.
  // TV-styled frame, three cycling status lines, ~3 seconds total.
  // R1/R2: routes to 'tournament-var' on its own (via the useEffect above).
  // R3: routes when submitR3Defence's await minAnimationDelay resolves.
  if (screen === 'tournament-var-checking') {
    // Pick one line from each of the three categories. The lines are stable for
    // the duration of this screen (don't change on re-render) — we use the phase
    // index to pick deterministically from the pool for this attempt.
    // Lines are random across attempts (since varCheckPhase is reset).
    const openerLine = VAR_ROUND_OPENER_LINES[
      Math.floor((tournamentRound || 1) * 7919) % VAR_ROUND_OPENER_LINES.length
    ];
    const holdLine = VAR_PRE_RESULT_HOLD_LINES[
      Math.floor((tournamentRound || 1) * 6271) % VAR_PRE_RESULT_HOLD_LINES.length
    ];
    const framingLine = tournamentRound === 3
      ? VAR_R3_FRAMING_LINES[0]
      : "Decision incoming.";
    const lines = [openerLine, holdLine, framingLine];
    const currentLine = lines[varCheckPhase] || lines[0];

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes kick3-var-scanline {
            0%   { transform: translateY(-100%); opacity: 0.5; }
            100% { transform: translateY(200%); opacity: 0.5; }
          }
          @keyframes kick3-var-blink {
            0%, 50%   { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
          @keyframes kick3-var-fadein {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{ ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '420px', textAlign: 'center' }}>

            {/* Label above the screen */}
            <div style={{
              ...condFont,
              fontSize: '11px',
              letterSpacing: '0.4em',
              color: colours.muted,
              fontWeight: 700,
              marginBottom: '18px',
              opacity: 0.7
            }}>
              VIDEO ASSISTANT REFEREE
            </div>

            {/* TV frame */}
            <div style={{
              background: 'linear-gradient(160deg, #1f1f2a 0%, #0d0d14 100%)',
              border: '4px solid #2a2a36',
              borderRadius: '14px',
              padding: '8px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.08)',
              position: 'relative',
              marginBottom: '24px'
            }}>
              {/* Reflection highlight on top edge */}
              <div style={{
                position: 'absolute',
                top: '2px',
                left: '8%',
                right: '8%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                borderRadius: '50%'
              }} />

              {/* Inner screen */}
              <div style={{
                background: '#050810',
                borderRadius: '6px',
                padding: '32px 20px',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Scan line — animated */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                  animation: 'kick3-var-scanline 3.5s linear infinite',
                  pointerEvents: 'none'
                }} />

                {/* Subtle CRT scan-line texture */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
                  pointerEvents: 'none'
                }} />

                {/* VAR label in top-left corner */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '10px',
                  ...condFont,
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: '#5fb04a',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#5fb04a',
                    animation: 'kick3-var-blink 1s ease-in-out infinite',
                    display: 'inline-block'
                  }} />
                  VAR · LIVE
                </div>

                {/* Round indicator top-right */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  ...condFont,
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: colours.muted,
                  fontWeight: 600
                }}>
                  R{tournamentRound || '-'}
                </div>

                {/* Cycling status text */}
                <div
                  key={varCheckPhase}
                  style={{
                    ...displayFont,
                    fontSize: 'clamp(20px, 6vw, 26px)',
                    fontWeight: 600,
                    color: '#e8e8e0',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                    position: 'relative',
                    animation: 'kick3-var-fadein 0.35s ease-out',
                    padding: '0 12px',
                    lineHeight: 1.3
                  }}
                >
                  {currentLine}
                </div>

                {/* Phase dots */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '20px',
                  position: 'relative'
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: i <= varCheckPhase ? '#5fb04a' : 'rgba(255,255,255,0.15)',
                      transition: 'background 0.3s ease'
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Stand at the bottom */}
            <div style={{
              width: '60%',
              height: '6px',
              background: 'linear-gradient(180deg, #2a2a36 0%, #1a1a22 100%)',
              borderRadius: '0 0 4px 4px',
              margin: '-20px auto 0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }} />
            <div style={{
              width: '30%',
              height: '4px',
              background: '#1a1a22',
              borderRadius: '0 0 8px 8px',
              margin: '0 auto'
            }} />
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT ROUND WON SCREEN ----------
  // Phase 2, Deploy 5 / Stage 2. Celebratory beat between R1→R2 and R2→R3.
  // Shows the player's three, Pete's reaction (in his voice), and the call to
  // continue. R3 win bypasses this — that's handled by the trophy verdict screen.
  if (screen === 'tournament-round-won' && tournamentVarResult && tournamentOpponent) {
    const r = tournamentVarResult;
    const opponentPicks = resolveOpponentPicks(tournamentOpponent);
    const nextRound = tournamentRound + 1;
    const nextOpponentLabel = nextRound === 2 ? "PETE'S PRODUCER" : "PETE THE PUNDIT";
    const continueButtonLabel = nextRound === 2 ? "FACE THE PRODUCER" : "FACE PETE";
    const continueAction = nextRound === 2 ? advanceToRound2 : startTournamentRound3;

    // Phase 2, Deploy 5 / Stage 4: confetti.
    // 40 falling particles, brand-palette colours, randomised motion.
    // Computed once on mount (no state changes inside this screen mean no re-renders
    // will regenerate them). Each particle is a small rectangle with:
    //  - random horizontal start (0-100% across viewport)
    //  - random fall duration (2.4-3.6s)
    //  - random delay (0-400ms) for staggered onset
    //  - random sway angle (the keyframe is fixed; rotation/transform gives variety)
    //  - random colour from the celebratory palette
    //  - random size (4-8px wide, 8-14px tall)
    // Container fades out at 3s via opacity transition; particles unmount at screen exit.
    const CONFETTI_COLOURS = ['#D4AF37', '#5fb04a', '#e8e8e0', '#c9302c', '#f5a623'];
    const confettiParticles = Array.from({ length: 40 }, (_, i) => {
      const left = Math.random() * 100;
      const duration = 2.4 + Math.random() * 1.2;
      const delay = Math.random() * 0.4;
      const rotateStart = Math.random() * 360;
      const rotateEnd = rotateStart + (Math.random() * 720 - 360);
      const sway = (Math.random() - 0.5) * 80; // px horizontal drift
      const colour = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length];
      const width = 4 + Math.random() * 4;
      const height = 8 + Math.random() * 6;
      return { i, left, duration, delay, rotateStart, rotateEnd, sway, colour, width, height };
    });

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes kick3-trophy-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%      { transform: scale(1.04); opacity: 0.92; }
          }
          @keyframes kick3-won-slidein {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes kick3-confetti-fall {
            0% {
              transform: translate3d(0, -10vh, 0) rotate(var(--rs, 0deg));
              opacity: 1;
            }
            85% {
              opacity: 1;
            }
            100% {
              transform: translate3d(var(--sway, 0px), 110vh, 0) rotate(var(--re, 360deg));
              opacity: 0;
            }
          }
          @keyframes kick3-confetti-container-fade {
            0%, 85% { opacity: 1; }
            100%    { opacity: 0; }
          }
        `}</style>

        {/* Confetti overlay — pointer-events:none so the continue button is still clickable. */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 9999,
          animation: 'kick3-confetti-container-fade 4s ease-out forwards'
        }}>
          {confettiParticles.map(p => (
            <div
              key={p.i}
              style={{
                position: 'absolute',
                top: 0,
                left: `${p.left}%`,
                width: `${p.width}px`,
                height: `${p.height}px`,
                background: p.colour,
                borderRadius: '1px',
                animation: `kick3-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
                ['--rs']: `${p.rotateStart}deg`,
                ['--re']: `${p.rotateEnd}deg`,
                ['--sway']: `${p.sway}px`,
              }}
            />
          ))}
        </div>

        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '560px' }}>

            {/* Top label */}
            <div style={{
              textAlign: 'center',
              ...condFont,
              fontSize: '11px',
              letterSpacing: '0.4em',
              color: '#5fb04a',
              fontWeight: 700,
              marginBottom: '10px',
              animation: 'kick3-won-slidein 0.4s ease-out'
            }}>
              ROUND {tournamentRound} COMPLETE
            </div>

            {/* Big celebratory headline */}
            <h1 style={{
              ...displayFont,
              fontSize: 'clamp(40px, 12vw, 64px)',
              fontWeight: 800,
              color: colours.gold,
              margin: '0 0 8px 0',
              textAlign: 'center',
              letterSpacing: '0.02em',
              lineHeight: 1,
              animation: 'kick3-won-slidein 0.5s ease-out',
              textShadow: '0 4px 24px rgba(212,175,55,0.35)'
            }}>
              ROUND {tournamentRound} WON
            </h1>

            {/* Subhead — opponent beaten */}
            <div style={{
              ...condFont,
              fontSize: '14px',
              letterSpacing: '0.2em',
              color: colours.cream,
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '28px',
              opacity: 0.85,
              animation: 'kick3-won-slidein 0.6s ease-out'
            }}>
              {tournamentOpponent.label} — DEFEATED
            </div>

            {/* VAR verdict phrase. Phase 2, Deploy 5 / Stage 3: was on the
                old verdict screen; lifted here as the congrats screen IS the win path. */}
            <div style={{
              textAlign: 'center',
              ...condFont,
              fontSize: '13px',
              letterSpacing: '0.18em',
              color: colours.muted,
              fontStyle: 'italic',
              marginBottom: '24px',
              padding: '0 12px',
              lineHeight: 1.4,
              animation: 'kick3-won-slidein 0.65s ease-out'
            }}>
              {r.phrase}
            </div>

            {/* Pete's reaction — quote block in his voice */}
            <div style={{
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderLeft: `3px solid ${colours.gold}`,
              padding: '18px 22px',
              borderRadius: '6px',
              marginBottom: '28px',
              animation: 'kick3-won-slidein 0.7s ease-out'
            }}>
              <div style={{
                ...condFont,
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: colours.gold,
                marginBottom: '8px',
                fontWeight: 700
              }}>
                PETE
              </div>
              <p style={{
                ...displayFont,
                fontSize: 'clamp(17px, 4.5vw, 20px)',
                fontStyle: 'italic',
                color: colours.cream,
                margin: 0,
                lineHeight: 1.4
              }}>
                &ldquo;{roundWinReaction}&rdquo;
              </p>
            </div>

            {/* Score recap — your three vs their three.
                Phase 2, Deploy 5 / Stage 3: per-player attribute scores added
                so the player sees how the win was earned (parity with the
                old verdict screen). */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '28px',
              animation: 'kick3-won-slidein 0.8s ease-out'
            }}>
              {/* Player squad */}
              <div style={{ background: colours.surface, padding: '12px 10px', borderRadius: '6px' }}>
                <div style={{
                  ...condFont,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  color: colours.gold,
                  marginBottom: '8px',
                  textAlign: 'center',
                  fontWeight: 700
                }}>
                  YOUR THREE
                </div>
                {squad.map((p, i) => {
                  const scoresMap = p && p.isWorldCup
                    ? worldCupAttributeScores(p.name)
                    : stubAttributeScores(p.name);
                  const sc = scoresMap[tournamentAttribute] || 0;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                      borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      ...condFont,
                      fontSize: '12px'
                    }}>
                      <span style={{ color: colours.cream, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: colours.gold, fontWeight: 700, fontSize: '14px' }}>{sc}</span>
                    </div>
                  );
                })}
                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(212,175,55,0.2)',
                  ...condFont,
                  fontSize: '11px',
                  color: colours.gold,
                  letterSpacing: '0.15em',
                  textAlign: 'center'
                }}>
                  {tournamentAttribute}: <span style={{ fontWeight: 800, fontSize: '14px' }}>{r.playerTotal}</span>
                </div>
              </div>

              {/* Opponent squad */}
              <div style={{ background: colours.surface, padding: '12px 10px', borderRadius: '6px' }}>
                <div style={{
                  ...condFont,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  color: colours.muted,
                  marginBottom: '8px',
                  textAlign: 'center',
                  fontWeight: 700
                }}>
                  THEIR THREE
                </div>
                {opponentPicks.map((p, i) => {
                  const scoresMap = p && p.isWorldCup
                    ? worldCupAttributeScores(p.name)
                    : stubAttributeScores(p.name);
                  const sc = scoresMap[tournamentAttribute] || 0;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                      borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      ...condFont,
                      fontSize: '12px'
                    }}>
                      <span style={{ color: colours.cream, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: colours.muted, fontWeight: 700, fontSize: '14px' }}>{sc}</span>
                    </div>
                  );
                })}
                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  ...condFont,
                  fontSize: '11px',
                  color: colours.muted,
                  letterSpacing: '0.15em',
                  textAlign: 'center'
                }}>
                  {tournamentAttribute}: <span style={{ fontWeight: 800, fontSize: '14px' }}>{r.opponentTotal}</span>
                </div>
              </div>
            </div>

            {/* Phase 2, Deploy 5 / Stage 11: Legacy tiebreak banner — only renders when the
                tiebreak decided the round. Surfaces the actual Legacy numbers so the player
                sees why the call went the way it did. */}
            {r.viaLegacy && (
              <div style={{
                marginBottom: '20px',
                textAlign: 'center',
                animation: 'kick3-won-slidein 0.85s ease-out'
              }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.gold, fontStyle: 'italic', marginBottom: '8px' }}>
                  TIED ON {tournamentAttribute.toUpperCase()} — LEGACY TIEBREAK
                </div>
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'baseline', gap: '14px', padding: '8px 14px', background: 'rgba(212,175,55,0.06)', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.18)' }}>
                  <span style={{ ...condFont, fontSize: '11px', color: colours.muted, letterSpacing: '0.15em' }}>LEGACY</span>
                  <span style={{ ...displayFont, fontSize: '18px', fontWeight: 700, color: r.playerLegacy >= r.opponentLegacy ? '#5fb04a' : colours.cream }}>
                    {r.playerLegacy}
                  </span>
                  <span style={{ ...condFont, fontSize: '11px', color: colours.muted }}>vs</span>
                  <span style={{ ...displayFont, fontSize: '18px', fontWeight: 700, color: r.opponentLegacy > r.playerLegacy ? colours.accent : colours.cream }}>
                    {r.opponentLegacy}
                  </span>
                </div>
              </div>
            )}

            {/* "What's next" label */}
            <div style={{
              textAlign: 'center',
              ...condFont,
              fontSize: '11px',
              letterSpacing: '0.3em',
              color: colours.muted,
              fontWeight: 700,
              marginBottom: '6px',
              animation: 'kick3-won-slidein 0.9s ease-out'
            }}>
              NEXT — ROUND {nextRound}
            </div>
            <div style={{
              textAlign: 'center',
              ...displayFont,
              fontSize: 'clamp(20px, 6vw, 26px)',
              fontWeight: 700,
              color: colours.cream,
              marginBottom: '20px',
              animation: 'kick3-won-slidein 1.0s ease-out'
            }}>
              {nextOpponentLabel}
            </div>

            {/* Continue button */}
            <button
              onClick={continueAction}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: '#5fb04a',
                color: '#0a1a08',
                border: 'none',
                borderRadius: '10px',
                ...displayFont,
                fontSize: 'clamp(18px, 5vw, 22px)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                animation: 'kick3-won-slidein 1.1s ease-out'
              }}
            >
              <span>{continueButtonLabel}</span>
              <span style={{ fontSize: '22px', lineHeight: 1 }}>→</span>
            </button>

            {/* Stop-for-today option */}
            <button
              onClick={() => endTournamentAttempt(`won-r${tournamentRound}`)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'transparent',
                color: colours.muted,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                ...condFont,
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                cursor: 'pointer'
              }}
            >
              STOP HERE FOR TODAY
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT VAR VERDICT SCREEN ----------
  // Shows after each Round 1 or Round 2 draft completes. Reveals both teams,
  // attribute totals, VAR phrase, and routes onward (next round on win, end on loss).
  if (screen === 'tournament-var' && tournamentVarResult && tournamentOpponent) {
    const r = tournamentVarResult;
    const opponentPicks = resolveOpponentPicks(tournamentOpponent);
    const isFinalRound = tournamentRound >= 2; // Task 5 stops here; Task 6 wires R3.

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', paddingTop: '8px', marginBottom: '20px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#5fb04a', marginBottom: '6px', fontWeight: 600 }}>
                ROUND {tournamentRound} — VS {tournamentOpponent.shortLabel}
              </div>
              <h1 style={{ ...displayFont, fontSize: 'clamp(34px, 8vw, 48px)', fontWeight: 700, color: r.won ? '#5fb04a' : colours.accent, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                {r.won ? 'YOU ADVANCE' : 'YOU LOST'}
              </h1>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.muted, marginTop: '10px' }}>
                VAR DECISION • {tournamentAttribute && tournamentAttribute.toUpperCase()}
              </div>
            </div>

            {/* Score line — big and central */}
            <div style={{
              background: colours.surface,
              padding: '22px 16px',
              textAlign: 'center',
              marginBottom: '14px',
              borderTop: `2px solid ${r.won ? '#5fb04a' : colours.accent}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '24px' }}>
                <div>
                  <div style={{ ...displayFont, fontSize: '48px', fontWeight: 700, color: r.won ? '#5fb04a' : colours.cream, lineHeight: 1 }}>
                    {r.playerTotal}
                  </div>
                  <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.24em', color: colours.muted, marginTop: '6px' }}>
                    YOU
                  </div>
                </div>
                <div style={{ ...condFont, fontSize: '14px', color: colours.muted, fontWeight: 600 }}>vs</div>
                <div>
                  <div style={{ ...displayFont, fontSize: '48px', fontWeight: 700, color: r.won ? colours.cream : colours.accent, lineHeight: 1 }}>
                    {r.opponentTotal}
                  </div>
                  <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.24em', color: colours.muted, marginTop: '6px' }}>
                    {tournamentOpponent.shortLabel}
                  </div>
                </div>
              </div>
              {r.viaLegacy && (
                <div style={{ marginTop: '14px' }}>
                  <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.gold, fontStyle: 'italic', marginBottom: '8px' }}>
                    TIED ON {tournamentAttribute.toUpperCase()} — LEGACY TIEBREAK
                  </div>
                  {/* Phase 2, Deploy 5 / Stage 11: surface the actual Legacy numbers
                      so the player can see exactly why the tiebreak went the way it did. */}
                  <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'baseline', gap: '14px', padding: '8px 12px', background: 'rgba(212,175,55,0.06)', borderRadius: '4px' }}>
                    <span style={{ ...condFont, fontSize: '11px', color: colours.muted, letterSpacing: '0.15em' }}>LEGACY</span>
                    <span style={{ ...displayFont, fontSize: '18px', fontWeight: 700, color: r.playerLegacy >= r.opponentLegacy ? '#5fb04a' : colours.cream }}>
                      {r.playerLegacy}
                    </span>
                    <span style={{ ...condFont, fontSize: '11px', color: colours.muted }}>vs</span>
                    <span style={{ ...displayFont, fontSize: '18px', fontWeight: 700, color: r.opponentLegacy > r.playerLegacy ? colours.accent : colours.cream }}>
                      {r.opponentLegacy}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* VAR phrase — dry, procedural */}
            <div style={{
              ...condFont,
              fontSize: '13px',
              color: colours.cream,
              textAlign: 'center',
              padding: '14px 16px',
              background: 'rgba(0,0,0,0.30)',
              borderLeft: `2px solid ${colours.muted}`,
              marginBottom: r.won ? '20px' : '14px',
              lineHeight: 1.5,
              letterSpacing: '0.04em'
            }}>
              {r.phrase}
            </div>

            {/* Pete's loss line — only on loss */}
            {!r.won && (
              <div style={{
                background: 'rgba(232,52,74,0.08)',
                border: '1px solid rgba(232,52,74,0.30)',
                padding: '16px',
                marginBottom: '20px',
                borderRadius: '6px'
              }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.28em', color: colours.accent, marginBottom: '8px', fontWeight: 700 }}>
                  PETE'S TAKE
                </div>
                <p style={{ ...condFont, fontStyle: 'italic', fontSize: '15px', color: colours.cream, margin: 0, lineHeight: 1.45 }}>
                  &ldquo;{tournamentOpponent.peteLossLine}&rdquo;
                </p>
              </div>
            )}

            {/* Teams side-by-side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '24px'
            }}>
              {/* Player squad */}
              <div style={{ background: colours.surface, padding: '12px 10px' }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.gold, marginBottom: '10px', textAlign: 'center', fontWeight: 700 }}>
                  YOUR THREE
                </div>
                {squad.map((p, i) => {
                  const scoresMap = p && p.isWorldCup
                    ? worldCupAttributeScores(p.name)
                    : stubAttributeScores(p.name);
                  const sc = scoresMap[tournamentAttribute] || 0;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 4px',
                      borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                      ...condFont,
                      fontSize: '12px'
                    }}>
                      <span style={{ color: colours.cream, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: colours.gold, fontWeight: 700, fontSize: '14px' }}>{sc}</span>
                    </div>
                  );
                })}
              </div>
              {/* Opponent squad */}
              <div style={{ background: colours.surface, padding: '12px 10px' }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.muted, marginBottom: '10px', textAlign: 'center', fontWeight: 700 }}>
                  THEIR THREE
                </div>
                {opponentPicks.map((p, i) => {
                  const scoresMap = p && p.isWorldCup
                    ? worldCupAttributeScores(p.name)
                    : stubAttributeScores(p.name);
                  const sc = scoresMap[tournamentAttribute] || 0;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 4px',
                      borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                      ...condFont,
                      fontSize: '12px'
                    }}>
                      <span style={{ color: colours.cream, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: colours.muted, fontWeight: 700, fontSize: '14px' }}>{sc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action button — depends on outcome and round.
                Phase 2, Deploy 5 / Stage 2: on a win, route to the round-won
                congrats screen instead of advancing directly. Pick the Pete
                reaction here so it's stable across re-renders. */}
            {r.won && !isFinalRound && (
              <button
                onClick={() => {
                  const reaction = pickRandomLine(PETE_R1_WIN_REACTIONS)
                    || PETE_R1_WIN_REACTIONS[0];
                  setRoundWinReaction(reaction);
                  setScreen('tournament-round-won');
                }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: '#5fb04a',
                  color: '#0a1a08',
                  border: 'none',
                  borderRadius: '10px',
                  ...displayFont,
                  fontSize: 'clamp(18px, 5vw, 22px)',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                }}
              >
                <span>CONTINUE TO ROUND 2</span>
                <span style={{ fontSize: '22px', lineHeight: 1 }}>→</span>
              </button>
            )}
            {r.won && isFinalRound && (
              <button
                onClick={() => {
                  const reaction = pickRandomLine(PETE_R2_WIN_REACTIONS)
                    || PETE_R2_WIN_REACTIONS[0];
                  setRoundWinReaction(reaction);
                  setScreen('tournament-round-won');
                }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: '#5fb04a',
                  color: '#0a1a08',
                  border: 'none',
                  borderRadius: '10px',
                  ...displayFont,
                  fontSize: 'clamp(18px, 5vw, 22px)',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                }}
              >
                <span>CONTINUE TO ROUND 3</span>
                <span style={{ fontSize: '22px', lineHeight: 1 }}>→</span>
              </button>
            )}
            <button
              onClick={() => endTournamentAttempt(r.won ? `won-r${tournamentRound}` : `lost-r${tournamentRound}`)}
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

  // ---------- TOURNAMENT R3 INTRO SCREEN ----------
  // Earns the moment. Pete-on-the-lounger banner, Pete's three picks visible,
  // Pete's AI-generated argument shown, then the player drafts.
  if (screen === 'tournament-r3-intro' && tournamentOpponent) {
    const petePicks = resolveOpponentPicks(tournamentOpponent);
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>

            {/* Pete on the lounger banner */}
            <div style={{
              position: 'relative',
              marginBottom: '24px',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
              background: '#1a2840'
            }}>
              <picture>
                <source srcSet="/pete-tournament.webp" type="image/webp" />
                <img src="/pete-tournament.jpg" alt="Pete on the lounger" style={{ display: 'block', width: '100%', height: 'auto' }} />
              </picture>
            </div>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#5fb04a', marginBottom: '8px', fontWeight: 700 }}>
                ROUND 3 — THE FINAL
              </div>
              <h1 style={{ ...displayFont, fontSize: 'clamp(34px, 9vw, 52px)', fontWeight: 800, color: colours.gold, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                PETE THE PUNDIT
              </h1>
              <p style={{ ...condFont, fontStyle: 'italic', fontSize: '14px', color: colours.cream, marginTop: '14px', marginBottom: 0, opacity: 0.9 }}>
                &ldquo;Oh. You’re still here. Sit down.&rdquo;
              </p>
            </div>

            {/* Question */}
            <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(212,175,55,0.06)', borderLeft: `2px solid ${colours.gold}` }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.gold, marginBottom: '4px' }}>
                THE QUESTION
              </div>
              <p style={{ ...displayFont, fontSize: '18px', margin: 0, lineHeight: '1.2' }}>
                {tournamentQuestionText}
              </p>
            </div>

            {/* Pete's three picks */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.28em', color: colours.muted, marginBottom: '8px', fontWeight: 700 }}>
                PETE’S THREE
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {petePicks.map((p, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.30)',
                    border: `1px solid ${tierColourFor(p)}66`,
                    fontSize: '14px',
                    ...condFont,
                    fontWeight: 600,
                    color: colours.cream,
                    borderRadius: '5px'
                  }}>
                    {showTierBadge(p) && (
                      <span style={{ color: tierColourFor(p), marginRight: '6px' }}>
                        {TIER_SYMBOLS[p.tier] || '\u2022'}
                      </span>
                    )}
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Pete's argument */}
            <div style={{
              background: 'rgba(95,176,74,0.06)',
              border: '1px solid rgba(95,176,74,0.30)',
              padding: '18px 20px',
              marginBottom: '24px',
              borderRadius: '8px'
            }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.28em', color: '#5fb04a', marginBottom: '12px', fontWeight: 700 }}>
                PETE’S ARGUMENT
              </div>
              {r3Loading && !r3PeteArgument ? (
                <p style={{ ...condFont, fontStyle: 'italic', color: colours.muted, margin: 0, fontSize: '14px' }}>
                  Pete is sharpening his case…
                </p>
              ) : r3PeteArgument ? (
                <>
                  <p style={{ ...condFont, fontSize: '15px', color: colours.cream, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {r3PeteArgument.argument}
                  </p>
                  <p style={{ ...condFont, fontStyle: 'italic', fontSize: '14px', color: colours.gold, margin: 0, lineHeight: 1.4 }}>
                    &ldquo;{r3PeteArgument.taunt}&rdquo;
                  </p>
                </>
              ) : (
                <p style={{ ...condFont, color: colours.accent, margin: 0, fontSize: '14px' }}>
                  Couldn’t reach Pete. Try again in a moment.
                </p>
              )}
              {r3Error && (
                <p style={{ ...condFont, fontSize: '11px', color: colours.muted, marginTop: '10px', marginBottom: 0, fontStyle: 'italic' }}>
                  {r3Error}
                </p>
              )}
            </div>

            {/* Action button — draft your three */}
            <button
              onClick={() => {
                // Begin drafting for R3. Player drafts from the Pete-eligible 108
                // (Phase 2, Deploy 1 / Stage 3) — was generateDraft from the daily pool.
                // Excludes Pete's three picks so there's no clash.
                const petePickNames = resolveOpponentPicks(tournamentOpponent).map(p => p.name);
                setDraftRounds(generateR3Draft(petePickNames));
                setCurrentRound(0);
                setSquad([]);
                setScreen('draft');
              }}
              disabled={r3Loading || !r3PeteArgument}
              style={{
                width: '100%',
                padding: '18px 20px',
                background: (!r3Loading && r3PeteArgument) ? colours.gold : '#3a3a44',
                color: (!r3Loading && r3PeteArgument) ? '#000' : colours.muted,
                border: 'none',
                borderRadius: '10px',
                ...displayFont,
                fontSize: 'clamp(18px, 5vw, 22px)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: (!r3Loading && r3PeteArgument) ? 'pointer' : 'not-allowed',
                marginBottom: '12px',
                boxShadow: (!r3Loading && r3PeteArgument) ? '0 4px 0 rgba(0,0,0,0.25)' : 'none',
                opacity: (!r3Loading && r3PeteArgument) ? 1 : 0.6
              }}
            >
              {r3Loading && !r3PeteArgument ? 'PETE IS THINKING…' : 'DRAFT YOUR THREE →'}
            </button>

            {/* Subtle back/forfeit */}
            <button
              onClick={() => endTournamentAttempt('forfeited-r3')}
              style={{
                width: '100%', padding: '10px 20px',
                background: 'transparent', color: colours.muted,
                border: `1px solid ${colours.muted}`, borderRadius: '8px',
                ...condFont, fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em',
                cursor: 'pointer'
              }}
            >
              FORFEIT — BACK TO TOURNAMENT
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT R3 DEFENCE SCREEN ----------
  // Player writes a 300-char response to Pete's argument.
  if (screen === 'tournament-r3-defend' && tournamentOpponent) {
    const petePicks = resolveOpponentPicks(tournamentOpponent);
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '8px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: '#5fb04a', marginBottom: '6px', fontWeight: 700 }}>
                ROUND 3 — YOUR DEFENCE
              </div>
              <h1 style={{ ...displayFont, fontSize: 'clamp(28px, 7vw, 38px)', fontWeight: 700, color: colours.gold, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                SEND IT TO PETE
              </h1>
            </div>

            {/* Recap of both sides */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ background: colours.surface, padding: '10px 8px' }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.gold, marginBottom: '6px', textAlign: 'center', fontWeight: 700 }}>
                  YOUR THREE
                </div>
                {squad.map((p, i) => (
                  <div key={i} style={{ ...condFont, fontSize: '11px', color: colours.cream, padding: '2px 0', textAlign: 'center', fontWeight: 600 }}>
                    {p.name}
                  </div>
                ))}
              </div>
              <div style={{ background: colours.surface, padding: '10px 8px' }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: colours.muted, marginBottom: '6px', textAlign: 'center', fontWeight: 700 }}>
                  PETE’S THREE
                </div>
                {petePicks.map((p, i) => (
                  <div key={i} style={{ ...condFont, fontSize: '11px', color: colours.cream, padding: '2px 0', textAlign: 'center', fontWeight: 600 }}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Pete's argument (recap) */}
            {r3PeteArgument && (
              <div style={{
                background: 'rgba(95,176,74,0.06)',
                border: '1px solid rgba(95,176,74,0.20)',
                padding: '12px 14px',
                marginBottom: '16px',
                borderRadius: '6px'
              }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.28em', color: '#5fb04a', marginBottom: '8px', fontWeight: 700 }}>
                  PETE SAID
                </div>
                <p style={{ ...condFont, fontSize: '13px', color: colours.cream, margin: 0, lineHeight: 1.45 }}>
                  {r3PeteArgument.argument}
                </p>
                <p style={{ ...condFont, fontStyle: 'italic', fontSize: '12px', color: colours.gold, margin: '8px 0 0 0' }}>
                  &ldquo;{r3PeteArgument.taunt}&rdquo;
                </p>
              </div>
            )}

            {/* Instruction */}
            <div style={{ ...condFont, fontSize: '13px', color: colours.cream, marginBottom: '12px', lineHeight: 1.5 }}>
              Pete’s made his case. Now make yours. Argue for your three. Dismantle his. VAR is listening.
            </div>

            {/* Textarea */}
            <textarea
              value={r3PlayerDefence}
              onChange={(e) => setR3PlayerDefence(e.target.value.slice(0, 250))}
              placeholder="Argue your case in 250 characters. Be specific. Engage with Pete’s argument."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '14px',
                background: colours.surface,
                border: `1px solid rgba(255,255,255,0.12)`,
                color: colours.cream,
                ...condFont,
                fontSize: '14px',
                lineHeight: 1.5,
                borderRadius: '6px',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: '6px'
              }}
            />
            <div style={{ ...condFont, fontSize: '11px', color: colours.muted, marginBottom: '20px', textAlign: 'right' }}>
              {r3PlayerDefence.length} / 250
            </div>

            {r3Error && (
              <div style={{
                ...condFont, fontSize: '12px', color: colours.accent,
                marginBottom: '12px', padding: '8px 12px',
                background: 'rgba(232,52,74,0.10)', border: '1px solid rgba(232,52,74,0.30)',
                borderRadius: '4px'
              }}>
                {r3Error}
              </div>
            )}

            {/* Send to Pete */}
            <button
              onClick={submitR3Defence}
              disabled={r3Loading || r3PlayerDefence.trim().length === 0}
              style={{
                width: '100%',
                padding: '18px 20px',
                background: (!r3Loading && r3PlayerDefence.trim().length > 0) ? colours.gold : '#3a3a44',
                color: (!r3Loading && r3PlayerDefence.trim().length > 0) ? '#000' : colours.muted,
                border: 'none',
                borderRadius: '10px',
                ...displayFont,
                fontSize: 'clamp(18px, 5vw, 22px)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: (!r3Loading && r3PlayerDefence.trim().length > 0) ? 'pointer' : 'not-allowed',
                marginBottom: '10px',
                boxShadow: (!r3Loading && r3PlayerDefence.trim().length > 0) ? '0 4px 0 rgba(0,0,0,0.25)' : 'none',
                opacity: (!r3Loading && r3PlayerDefence.trim().length > 0) ? 1 : 0.6
              }}
            >
              {r3Loading ? 'VAR REVIEWING…' : 'SEND IT TO PETE'}
            </button>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ---------- TOURNAMENT R3 VERDICT SCREEN ----------
  // VAR delivers the comparative verdict. Pete reacts. Trophy awarded on win.
  if (screen === 'tournament-r3-verdict' && r3VarVerdict && tournamentOpponent) {
    const playerWon = r3VarVerdict.playerWon;
    const petePicks = resolveOpponentPicks(tournamentOpponent);
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;1,500&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={bgStyle}>
          <div style={pitchOverlay} />
          <div style={{ ...container, maxWidth: '640px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', paddingTop: '8px', marginBottom: '20px' }}>
              <div style={{ ...condFont, fontSize: '11px', letterSpacing: '0.3em', color: colours.muted, marginBottom: '8px', fontWeight: 600 }}>
                VAR DECISION — ROUND 3
              </div>
              {playerWon ? (
                <>
                  <div style={{ fontSize: '52px', lineHeight: 1, marginBottom: '6px' }} aria-hidden="true">🏆</div>
                  <h1 style={{ ...displayFont, fontSize: 'clamp(38px, 10vw, 56px)', fontWeight: 800, color: colours.gold, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                    YOU BEAT PETE
                  </h1>
                  <div style={{ ...condFont, fontSize: '13px', letterSpacing: '0.22em', color: '#5fb04a', marginTop: '12px', fontWeight: 700 }}>
                    +1 TROPHY
                  </div>
                </>
              ) : (
                <>
                  <h1 style={{ ...displayFont, fontSize: 'clamp(38px, 10vw, 56px)', fontWeight: 800, color: colours.accent, margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}>
                    PETE WINS
                  </h1>
                  <div style={{ ...condFont, fontSize: '13px', letterSpacing: '0.22em', color: colours.muted, marginTop: '12px', fontWeight: 600 }}>
                    NO TROPHY TODAY
                  </div>
                </>
              )}
            </div>

            {/* VAR verdict */}
            <div style={{
              background: 'rgba(0,0,0,0.30)',
              borderLeft: `2px solid ${colours.muted}`,
              padding: '14px 18px',
              marginBottom: '14px'
            }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.3em', color: colours.muted, marginBottom: '8px', fontWeight: 700 }}>
                VAR REVIEW
              </div>
              <p style={{ ...condFont, fontSize: '14px', color: colours.cream, margin: 0, lineHeight: 1.55, letterSpacing: '0.02em' }}>
                {r3VarVerdict.verdict}
              </p>
            </div>

            {/* Pete's reaction */}
            <div style={{
              background: playerWon ? 'rgba(212,175,55,0.08)' : 'rgba(232,52,74,0.08)',
              border: `1px solid ${playerWon ? 'rgba(212,175,55,0.30)' : 'rgba(232,52,74,0.30)'}`,
              padding: '14px 18px',
              marginBottom: '20px',
              borderRadius: '6px'
            }}>
              <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.28em', color: playerWon ? colours.gold : colours.accent, marginBottom: '8px', fontWeight: 700 }}>
                PETE’S TAKE
              </div>
              <p style={{ ...condFont, fontStyle: 'italic', fontSize: '15px', color: colours.cream, margin: 0, lineHeight: 1.45 }}>
                &ldquo;{r3PeteReaction}&rdquo;
              </p>
            </div>

            {/* Recap — both sides */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ background: colours.surface, padding: '10px 8px', borderTop: `2px solid ${playerWon ? colours.gold : colours.muted}` }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: playerWon ? colours.gold : colours.muted, marginBottom: '6px', textAlign: 'center', fontWeight: 700 }}>
                  YOU
                </div>
                {squad.map((p, i) => (
                  <div key={i} style={{ ...condFont, fontSize: '11px', color: colours.cream, padding: '2px 0', textAlign: 'center', fontWeight: 600 }}>
                    {p.name}
                  </div>
                ))}
              </div>
              <div style={{ background: colours.surface, padding: '10px 8px', borderTop: `2px solid ${!playerWon ? colours.accent : colours.muted}` }}>
                <div style={{ ...condFont, fontSize: '10px', letterSpacing: '0.22em', color: !playerWon ? colours.accent : colours.muted, marginBottom: '6px', textAlign: 'center', fontWeight: 700 }}>
                  PETE
                </div>
                {petePicks.map((p, i) => (
                  <div key={i} style={{ ...condFont, fontSize: '11px', color: colours.cream, padding: '2px 0', textAlign: 'center', fontWeight: 600 }}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Back to tournament */}
            <button
              onClick={() => endTournamentAttempt(playerWon ? 'won-r3' : 'lost-r3')}
              style={{
                width: '100%', padding: '14px 20px',
                background: playerWon ? colours.gold : 'transparent',
                color: playerWon ? '#000' : colours.gold,
                border: playerWon ? 'none' : `2px solid ${colours.gold}`,
                borderRadius: '10px',
                ...displayFont, fontSize: '16px', fontWeight: 700, letterSpacing: '0.12em',
                cursor: 'pointer',
                boxShadow: playerWon ? '0 4px 0 rgba(0,0,0,0.25)' : 'none'
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
