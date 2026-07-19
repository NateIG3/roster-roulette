import type { AttributeKey, Position } from './attributes';
import { ATTRIBUTE_KEYS } from './attributes';

export type PlayerTier = 'current' | 'legend';

export interface Player {
  id: string;
  name: string;
  tier: PlayerTier;
  naturalPosition: Position;
  attributes: Record<AttributeKey, number>;
}

// Tuple order matches ATTRIBUTE_KEYS: build, shooting, handling, defense,
// playmaking, rebounding, clutch, finishing, athleticism.
type AttrTuple = [number, number, number, number, number, number, number, number, number];

function p(
  id: string,
  name: string,
  tier: PlayerTier,
  naturalPosition: Position,
  attrs: AttrTuple,
): Player {
  const attributes = {} as Record<AttributeKey, number>;
  ATTRIBUTE_KEYS.forEach((key, i) => {
    attributes[key] = attrs[i];
  });
  return { id, name, tier, naturalPosition, attributes };
}

// Roster is a snapshot for gameplay purposes (current NBA starters as of the
// 2025-26 season, to the best available knowledge at authoring time) — not a
// live feed. Curated to well-known names and players with a clear standout
// specialty (a rating of ~80+ in something), rather than every starter —
// generic mid-all-rounders were cut even if they technically start. Update
// this file directly to reflect roster moves or add players back.
export const PLAYERS: Player[] = [
  // --- Atlanta Hawks ---
  p('trae-young', 'Trae Young', 'current', 'PG', [45, 92, 97, 35, 96, 25, 88, 72, 65]),
  p('dyson-daniels', 'Dyson Daniels', 'current', 'SG', [62, 55, 68, 92, 65, 55, 58, 60, 75]),
  p('jalen-johnson', 'Jalen Johnson', 'current', 'PF', [75, 62, 65, 72, 60, 78, 60, 75, 85]),
  p('kristaps-porzingis', 'Kristaps Porzingis', 'current', 'C', [88, 80, 45, 78, 40, 75, 65, 78, 60]),

  // --- Boston Celtics ---
  p('derrick-white', 'Derrick White', 'current', 'PG', [55, 82, 75, 88, 78, 45, 78, 68, 68]),
  p('anfernee-simons', 'Anfernee Simons', 'current', 'SG', [50, 88, 78, 48, 62, 30, 70, 65, 72]),
  p('jaylen-brown', 'Jaylen Brown', 'current', 'SF', [78, 75, 68, 82, 55, 62, 82, 82, 90]),
  p('jayson-tatum', 'Jayson Tatum', 'current', 'PF', [75, 88, 78, 78, 70, 68, 88, 82, 80]),
  p('al-horford', 'Al Horford', 'current', 'C', [78, 75, 55, 78, 62, 68, 75, 62, 45]),

  // --- Brooklyn Nets ---
  p('cam-thomas', 'Cam Thomas', 'current', 'SG', [55, 85, 80, 40, 55, 30, 75, 72, 68]),
  p('michael-porter-jr', 'Michael Porter Jr.', 'current', 'SF', [72, 88, 58, 45, 40, 65, 60, 68, 70]),
  p('nic-claxton', 'Nic Claxton', 'current', 'C', [78, 35, 40, 82, 40, 78, 50, 70, 85]),

  // --- Charlotte Hornets ---
  p('lamelo-ball', 'LaMelo Ball', 'current', 'PG', [62, 80, 92, 45, 92, 48, 75, 68, 72]),
  p('kon-knueppel', 'Kon Knueppel', 'current', 'SF', [65, 82, 62, 55, 50, 48, 58, 60, 60]),
  p('miles-bridges', 'Miles Bridges', 'current', 'PF', [75, 68, 60, 60, 45, 65, 60, 75, 85]),

  // --- Chicago Bulls ---
  p('josh-giddey', 'Josh Giddey', 'current', 'PG', [68, 60, 78, 55, 88, 65, 55, 62, 62]),
  p('coby-white', 'Coby White', 'current', 'SG', [55, 82, 78, 48, 62, 35, 68, 65, 72]),
  p('nikola-vucevic', 'Nikola Vučević', 'current', 'C', [78, 75, 50, 55, 55, 78, 60, 68, 45]),

  // --- Cleveland Cavaliers ---
  p('darius-garland', 'Darius Garland', 'current', 'PG', [48, 85, 88, 45, 82, 30, 75, 65, 62]),
  p('donovan-mitchell', 'Donovan Mitchell', 'current', 'SG', [62, 85, 82, 68, 65, 42, 88, 82, 88]),
  p('evan-mobley', 'Evan Mobley', 'current', 'PF', [80, 62, 50, 92, 50, 82, 65, 75, 80]),
  p('jarrett-allen', 'Jarrett Allen', 'current', 'C', [80, 40, 35, 78, 35, 85, 55, 78, 75]),

  // --- Dallas Mavericks ---
  p('kyrie-irving', 'Kyrie Irving', 'current', 'PG', [52, 90, 99, 45, 82, 25, 88, 88, 75]),
  p('klay-thompson', 'Klay Thompson', 'current', 'SG', [62, 93, 55, 62, 42, 38, 82, 65, 55]),
  p('anthony-davis', 'Anthony Davis', 'current', 'PF', [85, 68, 55, 92, 48, 88, 78, 85, 85]),

  // --- Denver Nuggets ---
  p('jamal-murray', 'Jamal Murray', 'current', 'PG', [58, 85, 85, 50, 78, 35, 90, 75, 70]),
  p('cameron-johnson', 'Cameron Johnson', 'current', 'SF', [68, 85, 55, 55, 42, 48, 62, 60, 62]),
  p('aaron-gordon', 'Aaron Gordon', 'current', 'PF', [82, 62, 50, 68, 42, 68, 62, 80, 90]),
  p('nikola-jokic', 'Nikola Jokić', 'current', 'C', [82, 82, 78, 65, 98, 92, 92, 85, 55]),

  // --- Detroit Pistons ---
  p('cade-cunningham', 'Cade Cunningham', 'current', 'PG', [72, 75, 82, 55, 88, 52, 78, 72, 68]),
  p('duncan-robinson', 'Duncan Robinson', 'current', 'SG', [60, 90, 50, 40, 38, 30, 60, 50, 45]),
  p('ausar-thompson', 'Ausar Thompson', 'current', 'SF', [72, 40, 55, 85, 50, 65, 45, 62, 92]),
  p('jalen-duren', 'Jalen Duren', 'current', 'C', [82, 30, 35, 68, 38, 88, 48, 75, 88]),

  // --- Golden State Warriors ---
  p('stephen-curry', 'Stephen Curry', 'current', 'PG', [45, 99, 95, 45, 85, 32, 96, 78, 62]),
  p('jimmy-butler', 'Jimmy Butler', 'current', 'SF', [72, 65, 68, 82, 65, 58, 92, 75, 70]),
  p('draymond-green', 'Draymond Green', 'current', 'PF', [78, 55, 65, 92, 78, 72, 78, 55, 68]),

  // --- Houston Rockets ---
  p('fred-vanvleet', 'Fred VanVleet', 'current', 'PG', [42, 82, 82, 62, 82, 28, 80, 60, 55]),
  p('amen-thompson', 'Amen Thompson', 'current', 'SG', [72, 42, 68, 85, 62, 62, 55, 68, 95]),
  p('kevin-durant', 'Kevin Durant', 'current', 'SF', [72, 92, 78, 62, 62, 55, 90, 88, 72]),
  p('alperen-sengun', 'Alperen Şengün', 'current', 'C', [78, 55, 65, 62, 78, 82, 68, 78, 55]),

  // --- Indiana Pacers ---
  p('tyrese-haliburton', 'Tyrese Haliburton', 'current', 'PG', [48, 82, 82, 45, 95, 35, 78, 65, 60]),
  p('pascal-siakam', 'Pascal Siakam', 'current', 'PF', [75, 68, 62, 62, 55, 65, 72, 78, 80]),

  // --- LA Clippers ---
  p('james-harden', 'James Harden', 'current', 'PG', [58, 82, 88, 45, 90, 42, 78, 75, 55]),
  p('norman-powell', 'Norman Powell', 'current', 'SG', [60, 82, 62, 55, 38, 32, 70, 68, 68]),
  p('kawhi-leonard', 'Kawhi Leonard', 'current', 'SF', [78, 82, 68, 92, 50, 62, 85, 78, 75]),
  p('derrick-jones-jr', 'Derrick Jones Jr.', 'current', 'PF', [68, 45, 45, 75, 30, 55, 45, 65, 92]),
  p('ivica-zubac', 'Ivica Zubac', 'current', 'C', [84, 30, 30, 75, 35, 88, 50, 72, 55]),

  // --- LA Lakers ---
  p('luka-doncic', 'Luka Dončić', 'current', 'PG', [72, 85, 96, 45, 95, 62, 90, 82, 55]),
  p('austin-reaves', 'Austin Reaves', 'current', 'SG', [58, 78, 72, 55, 68, 42, 72, 65, 60]),
  p('lebron-james', 'LeBron James', 'current', 'SF', [82, 75, 85, 68, 92, 72, 90, 88, 82]),
  p('deandre-ayton', 'Deandre Ayton', 'current', 'C', [80, 48, 40, 62, 38, 75, 52, 75, 72]),

  // --- Memphis Grizzlies ---
  p('ja-morant', 'Ja Morant', 'current', 'PG', [58, 65, 88, 48, 85, 38, 78, 82, 96]),
  p('jaren-jackson-jr', 'Jaren Jackson Jr.', 'current', 'PF', [76, 65, 48, 90, 32, 62, 62, 68, 78]),
  p('zach-edey', 'Zach Edey', 'current', 'C', [92, 30, 25, 65, 28, 82, 45, 75, 40]),

  // --- Miami Heat ---
  p('tyler-herro', 'Tyler Herro', 'current', 'SG', [55, 88, 78, 42, 65, 32, 78, 65, 55]),
  p('andrew-wiggins', 'Andrew Wiggins', 'current', 'SF', [72, 68, 55, 68, 38, 50, 58, 68, 82]),
  p('bam-adebayo', 'Bam Adebayo', 'current', 'C', [80, 55, 55, 88, 62, 78, 72, 75, 78]),

  // --- Milwaukee Bucks ---
  p('giannis-antetokounmpo', 'Giannis Antetokounmpo', 'current', 'PF', [92, 55, 68, 85, 68, 85, 82, 92, 96]),
  p('myles-turner', 'Myles Turner', 'current', 'C', [76, 72, 40, 80, 35, 68, 60, 65, 62]),

  // --- Minnesota Timberwolves ---
  p('mike-conley', 'Mike Conley', 'current', 'PG', [45, 78, 75, 62, 78, 28, 68, 55, 50]),
  p('anthony-edwards', 'Anthony Edwards', 'current', 'SG', [75, 82, 78, 68, 62, 52, 85, 85, 94]),
  p('jaden-mcdaniels', 'Jaden McDaniels', 'current', 'SF', [68, 62, 50, 88, 32, 48, 50, 58, 78]),
  p('julius-randle', 'Julius Randle', 'current', 'PF', [80, 65, 62, 50, 58, 72, 65, 72, 68]),
  p('rudy-gobert', 'Rudy Gobert', 'current', 'C', [82, 25, 25, 92, 30, 90, 55, 70, 62]),

  // --- New Orleans Pelicans ---
  p('dejounte-murray', 'Dejounte Murray', 'current', 'PG', [62, 65, 78, 78, 78, 45, 65, 65, 72]),
  p('trey-murphy-iii', 'Trey Murphy III', 'current', 'SG', [65, 82, 55, 62, 38, 45, 58, 62, 75]),
  p('herbert-jones', 'Herbert Jones', 'current', 'SF', [68, 58, 48, 88, 35, 45, 48, 55, 72]),
  p('zion-williamson', 'Zion Williamson', 'current', 'PF', [92, 55, 62, 55, 55, 72, 68, 92, 90]),

  // --- New York Knicks ---
  p('jalen-brunson', 'Jalen Brunson', 'current', 'PG', [55, 85, 90, 45, 82, 32, 92, 78, 60]),
  p('mikal-bridges', 'Mikal Bridges', 'current', 'SG', [68, 75, 60, 82, 45, 42, 62, 62, 75]),
  p('og-anunoby', 'OG Anunoby', 'current', 'SF', [75, 70, 50, 88, 35, 52, 60, 65, 78]),
  p('karl-anthony-towns', 'Karl-Anthony Towns', 'current', 'PF', [82, 85, 58, 50, 55, 82, 65, 78, 62]),
  p('mitchell-robinson', 'Mitchell Robinson', 'current', 'C', [78, 20, 25, 78, 25, 88, 42, 70, 78]),

  // --- Oklahoma City Thunder ---
  p('shai-gilgeous-alexander', 'Shai Gilgeous-Alexander', 'current', 'PG', [65, 82, 92, 72, 82, 42, 92, 88, 78]),
  p('luguentz-dort', 'Luguentz Dort', 'current', 'SG', [72, 62, 55, 90, 35, 45, 55, 58, 75]),
  p('jalen-williams', 'Jalen Williams', 'current', 'SF', [70, 72, 68, 75, 62, 50, 72, 72, 78]),
  p('chet-holmgren', 'Chet Holmgren', 'current', 'PF', [68, 68, 50, 88, 42, 68, 62, 68, 72]),
  p('isaiah-hartenstein', 'Isaiah Hartenstein', 'current', 'C', [80, 35, 45, 75, 55, 82, 50, 68, 58]),

  // --- Orlando Magic ---
  p('jalen-suggs', 'Jalen Suggs', 'current', 'PG', [65, 62, 68, 85, 62, 42, 60, 62, 78]),
  p('desmond-bane', 'Desmond Bane', 'current', 'SG', [62, 85, 65, 58, 55, 42, 70, 65, 62]),
  p('franz-wagner', 'Franz Wagner', 'current', 'SF', [72, 70, 65, 68, 60, 55, 68, 72, 72]),
  p('paolo-banchero', 'Paolo Banchero', 'current', 'PF', [80, 68, 65, 58, 55, 65, 72, 78, 72]),

  // --- Philadelphia 76ers ---
  p('tyrese-maxey', 'Tyrese Maxey', 'current', 'PG', [55, 82, 85, 55, 78, 32, 78, 72, 82]),
  p('vj-edgecombe', 'VJ Edgecombe', 'current', 'SG', [65, 58, 65, 78, 45, 45, 45, 58, 88]),
  p('paul-george', 'Paul George', 'current', 'SF', [70, 80, 65, 75, 50, 52, 72, 68, 75]),
  p('joel-embiid', 'Joel Embiid', 'current', 'C', [88, 82, 62, 78, 60, 82, 82, 88, 60]),

  // --- Phoenix Suns ---
  p('jalen-green', 'Jalen Green', 'current', 'PG', [58, 75, 72, 45, 48, 32, 62, 72, 88]),
  p('devin-booker', 'Devin Booker', 'current', 'SG', [62, 90, 82, 55, 75, 38, 88, 78, 70]),
  p('dillon-brooks', 'Dillon Brooks', 'current', 'SF', [65, 62, 50, 82, 35, 42, 62, 55, 68]),

  // --- Portland Trail Blazers ---
  p('jrue-holiday', 'Jrue Holiday', 'current', 'PG', [62, 72, 75, 88, 75, 42, 72, 65, 68]),
  p('shaedon-sharpe', 'Shaedon Sharpe', 'current', 'SG', [65, 68, 68, 55, 42, 42, 55, 68, 90]),
  p('toumani-camara', 'Toumani Camara', 'current', 'SF', [70, 58, 45, 82, 35, 55, 48, 55, 72]),
  p('donovan-clingan', 'Donovan Clingan', 'current', 'C', [86, 30, 30, 82, 35, 82, 48, 68, 55]),

  // --- Sacramento Kings ---
  p('zach-lavine', 'Zach LaVine', 'current', 'PG', [60, 82, 78, 45, 58, 32, 68, 72, 85]),
  p('demar-derozan', 'DeMar DeRozan', 'current', 'SF', [70, 72, 72, 48, 62, 45, 85, 82, 62]),
  p('domantas-sabonis', 'Domantas Sabonis', 'current', 'C', [80, 62, 55, 55, 72, 92, 68, 75, 45]),

  // --- San Antonio Spurs ---
  p('de-aaron-fox', "De'Aaron Fox", 'current', 'PG', [60, 72, 85, 62, 78, 35, 78, 78, 92]),
  p('victor-wembanyama', 'Victor Wembanyama', 'current', 'C', [88, 72, 62, 96, 55, 85, 68, 78, 82]),

  // --- Toronto Raptors ---
  p('scottie-barnes', 'Scottie Barnes', 'current', 'SF', [76, 60, 68, 80, 68, 65, 62, 68, 82]),
  p('brandon-ingram', 'Brandon Ingram', 'current', 'PF', [70, 78, 68, 50, 55, 48, 68, 70, 65]),

  // --- Utah Jazz ---
  p('ace-bailey', 'Ace Bailey', 'current', 'SF', [70, 62, 55, 55, 35, 48, 45, 60, 82]),
  p('lauri-markkanen', 'Lauri Markkanen', 'current', 'PF', [75, 85, 50, 50, 35, 62, 62, 65, 62]),
  p('walker-kessler', 'Walker Kessler', 'current', 'C', [80, 25, 30, 82, 32, 82, 42, 68, 60]),

  // --- Washington Wizards ---
  p('jordan-poole', 'Jordan Poole', 'current', 'PG', [52, 78, 78, 40, 62, 28, 60, 62, 62]),
  p('bilal-coulibaly', 'Bilal Coulibaly', 'current', 'SF', [68, 52, 55, 78, 42, 45, 42, 55, 82]),
  p('khris-middleton', 'Khris Middleton', 'current', 'PF', [70, 78, 68, 55, 62, 48, 72, 65, 50]),

  // --- Legends (prime versions) ---
  p('michael-jordan-prime', 'Michael Jordan (Prime)', 'legend', 'SG', [72, 88, 90, 90, 75, 58, 99, 92, 95]),
  p('magic-johnson-prime', 'Magic Johnson (Prime)', 'legend', 'PG', [82, 68, 90, 62, 99, 72, 90, 78, 78]),
  p('larry-bird-prime', 'Larry Bird (Prime)', 'legend', 'SF', [70, 92, 75, 65, 88, 78, 95, 78, 55]),
  p('shaquille-oneal-prime', "Shaquille O'Neal (Prime)", 'legend', 'C', [99, 35, 40, 82, 55, 90, 78, 96, 85]),
  p('kobe-bryant-prime', 'Kobe Bryant (Prime)', 'legend', 'SG', [72, 90, 88, 85, 72, 55, 97, 90, 85]),
  p('tim-duncan-prime', 'Tim Duncan (Prime)', 'legend', 'PF', [85, 68, 45, 92, 55, 90, 88, 82, 62]),
  p('allen-iverson-prime', 'Allen Iverson (Prime)', 'legend', 'PG', [45, 75, 92, 62, 78, 35, 88, 85, 92]),
  p('hakeem-olajuwon-prime', 'Hakeem Olajuwon (Prime)', 'legend', 'C', [82, 55, 62, 96, 55, 88, 85, 90, 85]),
  p('julius-erving-prime', 'Julius Erving (Prime)', 'legend', 'SF', [74, 68, 75, 68, 62, 68, 85, 88, 92]),
  p('karl-malone-prime', 'Karl Malone (Prime)', 'legend', 'PF', [84, 68, 50, 72, 45, 85, 82, 85, 80]),
];

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(
  PLAYERS.map((pl) => [pl.id, pl]),
);
