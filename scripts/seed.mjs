import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const categories = [
  { name: 'Football', slug: 'football' },
  { name: 'Basketball', slug: 'basketball' },
  { name: 'Tennis', slug: 'tennis' },
  { name: 'Cricket', slug: 'cricket' },
  { name: 'Rugby', slug: 'rugby' },
  { name: 'Volleyball', slug: 'volleyball' },
  { name: 'Baseball', slug: 'baseball' },
  { name: 'Ice Hockey', slug: 'ice-hockey' },
];

const competitions = [
  {
    name: 'Premier League',
    slug: 'premier-league',
    categorySlug: 'football',
  },
  { name: 'La Liga', slug: 'la-liga', categorySlug: 'football' },
  { name: 'NBA', slug: 'nba', categorySlug: 'basketball' },
  { name: 'EuroLeague', slug: 'euroleague', categorySlug: 'basketball' },
  { name: 'Wimbledon', slug: 'wimbledon', categorySlug: 'tennis' },
  { name: 'US Open', slug: 'us-open', categorySlug: 'tennis' },
  {
    name: 'Indian Premier League',
    slug: 'indian-premier-league',
    categorySlug: 'cricket',
  },
  { name: 'Rugby World Cup', slug: 'rugby-world-cup', categorySlug: 'rugby' },
  {
    name: 'Volleyball Nations League',
    slug: 'volleyball-nations-league',
    categorySlug: 'volleyball',
  },
  {
    name: 'Major League Baseball',
    slug: 'major-league-baseball',
    categorySlug: 'baseball',
  },
  {
    name: 'National Hockey League',
    slug: 'national-hockey-league',
    categorySlug: 'ice-hockey',
  },
  { name: 'Serie A', slug: 'serie-a', categorySlug: 'football' },
  { name: 'Bundesliga', slug: 'bundesliga', categorySlug: 'football' },
  { name: 'Ligue 1', slug: 'ligue-1', categorySlug: 'football' },
  {
    name: 'UEFA Champions League',
    slug: 'uefa-champions-league',
    categorySlug: 'football',
  },
  { name: 'WNBA', slug: 'wnba', categorySlug: 'basketball' },
  {
    name: 'NCAA Division I Basketball',
    slug: 'ncaa-division-i-basketball',
    categorySlug: 'basketball',
  },
  {
    name: 'Australian Open',
    slug: 'australian-open',
    categorySlug: 'tennis',
  },
  { name: 'French Open', slug: 'french-open', categorySlug: 'tennis' },
  { name: 'Big Bash League', slug: 'big-bash-league', categorySlug: 'cricket' },
  {
    name: 'Pakistan Super League',
    slug: 'pakistan-super-league',
    categorySlug: 'cricket',
  },
  { name: 'The Ashes', slug: 'the-ashes', categorySlug: 'cricket' },
  {
    name: 'ICC Cricket World Cup',
    slug: 'icc-cricket-world-cup',
    categorySlug: 'cricket',
  },
  { name: 'Six Nations', slug: 'six-nations', categorySlug: 'rugby' },
  {
    name: 'The Rugby Championship',
    slug: 'the-rugby-championship',
    categorySlug: 'rugby',
  },
  {
    name: 'Premiership Rugby',
    slug: 'premiership-rugby',
    categorySlug: 'rugby',
  },
  {
    name: 'CEV Champions League',
    slug: 'cev-champions-league',
    categorySlug: 'volleyball',
  },
  {
    name: 'Italian SuperLega',
    slug: 'italian-superlega',
    categorySlug: 'volleyball',
  },
  {
    name: 'Olympic Volleyball',
    slug: 'olympic-volleyball',
    categorySlug: 'volleyball',
  },
  {
    name: 'Nippon Professional Baseball',
    slug: 'npb',
    categorySlug: 'baseball',
  },
  {
    name: 'Korea Baseball Organization',
    slug: 'kbo',
    categorySlug: 'baseball',
  },
  { name: 'Mexican League', slug: 'mexican-league', categorySlug: 'baseball' },
  {
    name: 'Kontinental Hockey League',
    slug: 'khl',
    categorySlug: 'ice-hockey',
  },
  { name: 'Swedish Hockey League', slug: 'shl', categorySlug: 'ice-hockey' },
  {
    name: 'IIHF World Championship',
    slug: 'iihf-world-championship',
    categorySlug: 'ice-hockey',
  },
];

const originalDemoPostCompetitions = competitions.slice(0, 11);

const editorialProfiles = {
  football: {
    name: 'football',
    topics: [
      {
        title: 'breaking a high press',
        context:
          'A pressing side tries to close the first pass quickly, so the goalkeeper and defenders need clear passing angles.',
        detail:
          'A third-player combination can move the ball past the first wave, while a direct pass may be useful when the central lanes are blocked.',
      },
      {
        title: 'creating width and overloads',
        context:
          'Wide players stretch the defensive line and create space for teammates between the lines.',
        detail:
          'An overlapping run can draw out a full-back; the next decision is whether to cross early, combine near the corner, or recycle possession.',
      },
      {
        title: 'managing the transition after losing the ball',
        context:
          'The seconds immediately after a turnover often decide whether a team can counter-press or must recover into shape.',
        detail:
          'Nearby players can pressure the ball while the rest of the team protects forward passing lanes and the space behind the defence.',
      },
      {
        title: 'making set pieces more difficult to defend',
        context:
          'Corners and free kicks create rehearsed situations where delivery, timing, and movement all matter.',
        detail:
          'A decoy run can open a route for a teammate, while the defending side must coordinate marking, coverage, and the second ball.',
      },
      {
        title: 'controlling the tempo of a match',
        context:
          'Teams can change the rhythm by choosing when to circulate possession and when to attack space quickly.',
        detail:
          'The score, remaining time, and positions of the opposing midfield shape whether a team should accelerate or keep the ball.',
      },
    ],
  },
  basketball: {
    name: 'basketball',
    topics: [
      {
        title: 'reading the pick-and-roll',
        context:
          'The ball handler and screener force the defence to choose how it will protect the drive, roll, and perimeter shooters.',
        detail:
          'A switch, drop, or show creates different passing windows; the useful read depends on where the help defender is positioned.',
      },
      {
        title: 'building useful spacing',
        context:
          'Good spacing gives a driver room to attack and gives the ball handler outlets if the defence collapses.',
        detail:
          'Watch how off-ball movement shifts defenders and whether a pass creates a clean catch-and-shoot chance or a closeout to attack.',
      },
      {
        title: 'turning defence into transition offence',
        context:
          'A rebound or steal can start a fast break before the other team has set its defence.',
        detail:
          'The first decision is whether to push the ball, fill the lanes, or slow down and organize when numbers are even.',
      },
      {
        title: 'using the bench and managing rotations',
        context:
          'Substitutions affect energy, matchups, and the balance between playmaking and shooting.',
        detail:
          'A rotation change can target a matchup or stabilize a lineup; its value is clearer when considered across several possessions.',
      },
      {
        title: 'making decisions in late-clock possessions',
        context:
          'When the shot clock runs low, teams need a plan that still leaves room for a second action.',
        detail:
          'A screen can create a quick advantage, but the players away from the ball must remain ready for a kick-out or rebound.',
      },
    ],
  },
  tennis: {
    name: 'tennis',
    topics: [
      {
        title: 'building a point around the serve',
        context:
          'A serve can open the court, draw a shorter return, or make the opponent hit from an uncomfortable position.',
        detail:
          'The next shot matters as much as pace: placement can create space for a controlled first groundstroke.',
      },
      {
        title: 'choosing a return position',
        context:
          'Standing closer or farther from the baseline changes the time available to react and the angles available on the return.',
        detail:
          'A player may adjust position by serve type, score pressure, and how effectively they have been handling the opponent’s delivery.',
      },
      {
        title: 'changing direction in a baseline rally',
        context:
          'A rally often becomes dangerous when a player changes direction before creating a balanced position.',
        detail:
          'Depth and height can move an opponent back, making a later change of direction safer and more difficult to counter.',
      },
      {
        title: 'adapting to the court surface',
        context:
          'Court speed and bounce influence how much time players have and which patterns are practical.',
        detail:
          'Footwork, recovery position, and shot selection all need to adjust to the way the ball travels on the surface.',
      },
      {
        title: 'handling pressure in a tiebreak',
        context:
          'A tiebreak compresses a set into a short sequence where every serve and return receives extra attention.',
        detail:
          'A dependable first pattern can reduce uncertainty, while a returner looks for a clear target rather than a low-percentage winner.',
      },
    ],
  },
  cricket: {
    name: 'cricket',
    topics: [
      {
        title: 'planning the powerplay',
        context:
          'Fielding restrictions can reward aggressive batting, but early wickets can change the risk available to a side.',
        detail:
          'Batters weigh boundary options against strike rotation, while bowlers use line, length, and field placement to limit easy scoring.',
      },
      {
        title: 'using spin through the middle overs',
        context:
          'Spin can control the scoring rate and test whether batters can create scoring options without taking unnecessary risks.',
        detail:
          'Changes of pace and angle work alongside the field; batters can respond with footwork, placement, or a change in strike.',
      },
      {
        title: 'setting a plan for the final overs',
        context:
          'At the end of an innings, batters look for scoring options while bowlers try to make clean contact difficult.',
        detail:
          'Yorkers, slower balls, and field changes are most useful when they fit a clear plan rather than appearing as isolated variations.',
      },
      {
        title: 'reading the field before each delivery',
        context:
          'Fielders provide clues about the areas a bowler wants to protect and the shots a batter may be invited to play.',
        detail:
          'A small change in field placement can reveal a new plan; batters can decide whether to accept the challenge or find another option.',
      },
      {
        title: 'how match format changes strategy',
        context:
          'A multi-day match, one-day game, and T20 contest reward different balances of patience, scoring, and risk.',
        detail:
          'The same player may choose different shots or bowling spells depending on time, wickets, target, and conditions.',
      },
    ],
  },
  rugby: {
    name: 'rugby',
    topics: [
      {
        title: 'winning territory with the kicking game',
        context:
          'A kick can relieve pressure, challenge the backfield, or create a contest for possession.',
        detail:
          'The chase line and the location of support determine whether the kick becomes a defensive reset or an attacking opportunity.',
      },
      {
        title: 'protecting possession at the breakdown',
        context:
          'After a tackle, arriving players must secure the ball while staying organized for the next phase.',
        detail:
          'Body position, support timing, and the referee’s interpretation shape how quickly a team can recycle possession.',
      },
      {
        title: 'using the lineout as an attacking platform',
        context:
          'A lineout gives teams a structured restart and a chance to move the defence before open play begins.',
        detail:
          'Throw accuracy and coordinated movement can create options to drive, pass to the backs, or use a short variation.',
      },
      {
        title: 'choosing when to play through phases',
        context:
          'Repeated phases can tire a defence, but a team also needs to recognize when space has appeared elsewhere.',
        detail:
          'Communication between forwards and backs helps keep support close while preserving the option to shift the point of attack.',
      },
      {
        title: 'understanding discipline and field position',
        context:
          'Penalties can give the opposition territory and a choice between a kick at goal, touch, or a quick restart.',
        detail:
          'Teams can reduce pressure by understanding tackle height, offside lines, and the choices available after a whistle.',
      },
    ],
  },
  volleyball: {
    name: 'volleyball',
    topics: [
      {
        title: 'building a reliable serve-receive pattern',
        context:
          'A controlled first contact gives the setter more choices and makes the attack harder to predict.',
        detail:
          'Receiver responsibilities should be clear, especially when a serve targets the seam between two players.',
      },
      {
        title: 'reading rotations and front-row matchups',
        context:
          'Rotations affect which players are available to attack and how a team organizes its blocking assignments.',
        detail:
          'Recognizing the rotation helps viewers anticipate setter location, available hitters, and potential mismatches.',
      },
      {
        title: 'coordinating the block and floor defence',
        context:
          'A block can take away one attacking angle and direct the ball toward a defender covering the floor.',
        detail:
          'The plan is strongest when blockers and back-row players agree on which spaces they are responsible for.',
      },
      {
        title: 'transitioning quickly after a dig',
        context:
          'A successful dig is only the start of a defensive play; the team must rebuild an attack while the ball is in the air.',
        detail:
          'Players need to move from coverage into approach lanes without crowding the setter or losing sight of the ball.',
      },
      {
        title: 'varying the setter’s distribution',
        context:
          'A setter can spread the ball across the net to keep blockers from settling on one hitter.',
        detail:
          'The quality of the pass, the rotation, and the previous attack all influence which option is most available.',
      },
    ],
  },
  baseball: {
    name: 'baseball',
    topics: [
      {
        title: 'understanding the count and the next pitch',
        context:
          'The ball-strike count changes the balance between a hitter’s patience and a pitcher’s willingness to challenge the zone.',
        detail:
          'A count can narrow likely choices, but location and pitch movement still determine whether the hitter can make good contact.',
      },
      {
        title: 'planning bullpen use across a series',
        context:
          'Relief decisions depend on matchups, recent workload, game leverage, and the innings still to cover.',
        detail:
          'A manager may save a specialist for a later pocket of hitters or use the best available arm in the current high-leverage moment.',
      },
      {
        title: 'positioning the infield for contact',
        context:
          'Defensive positioning reflects the hitter, pitcher, runners, and situation rather than a single fixed alignment.',
        detail:
          'A small shift in starting position can change the route to a ground ball, so defenders must balance anticipation with coverage.',
      },
      {
        title: 'deciding when to attempt an extra base',
        context:
          'Baserunners and coaches assess the outfielder’s arm, the ball’s path, and the number of outs before advancing.',
        detail:
          'A good send is based on a clear read and a practiced turn, not simply on running as soon as the ball is hit.',
      },
      {
        title: 'balancing a lineup across nine innings',
        context:
          'Lineup construction can influence how often strong hitters come to the plate and which matchups appear late.',
        detail:
          'Bench options and the opposing bullpen add another layer to decisions about pinch hitters and defensive substitutions.',
      },
    ],
  },
  'ice-hockey': {
    name: 'ice hockey',
    topics: [
      {
        title: 'choosing a forecheck pressure',
        context:
          'A forecheck tries to disrupt the breakout and recover possession before the opponent establishes its attack.',
        detail:
          'The first skater’s angle influences whether support can close the boards, protect the middle, or pressure a rushed pass.',
      },
      {
        title: 'making a power play move the penalty kill',
        context:
          'A power play aims to create passing lanes and force defenders to choose between protecting the net and challenging the puck.',
        detail:
          'Quick puck movement can shift the penalty kill, but a clear shooting lane and net-front screen still matter.',
      },
      {
        title: 'managing line changes without losing structure',
        context:
          'Line changes keep players fresh, but a poorly timed change can leave open ice for the opponent.',
        detail:
          'Teams look for safe moments to change while maintaining pressure on the puck and keeping support available.',
      },
      {
        title: 'creating a net-front screen',
        context:
          'Traffic near the crease can make it harder for a goaltender to track a shot through bodies and sticks.',
        detail:
          'The player at the net must balance screening, looking for rebounds, and avoiding interference.',
      },
      {
        title: 'controlling rebounds after a save',
        context:
          'A shot that is stopped can still create danger if the rebound lands in a high-traffic area.',
        detail:
          'Defenders can tie up sticks and clear space while attackers look to arrive at the crease with their next move ready.',
      },
    ],
  },
};

const articleFormats = [
  {
    name: 'Tactical notebook',
    opening:
      'Start with the shape of the play, then follow how each decision changes the space available.',
    lens: 'Track the first movement, the response, and the next available option.',
  },
  {
    name: 'New fan’s explainer',
    opening:
      'The easiest way to understand this situation is to watch what each side is trying to take away.',
    lens: 'Notice the basic roles first; the finer details become clearer on a second look.',
  },
  {
    name: 'Coach’s board',
    opening:
      'Break the sequence into setup, first action, support, and recovery rather than judging only the final outcome.',
    lens: 'Ask whether the players had support and what adjustment the opposition made.',
  },
  {
    name: 'Matchday checklist',
    opening:
      'Use a few repeatable cues to follow the contest without needing a live statistics feed.',
    lens: 'Watch spacing, communication, and how quickly each side resets after the play.',
  },
];

const readerPrompts = [
  'Compare the first option with the safer alternative before deciding which choice made more sense.',
  'Look for the moment the defence or opponent has to make a second decision.',
  'Ask what changed between the setup and the final action, not just whether the attempt succeeded.',
  'Notice which teammate or player created the space, even if somebody else finished the sequence.',
  'On a rewatch, focus on the players away from the ball and how their positioning affects the play.',
];

const storyAngles = [
  'A useful measure here is consistency across several attempts, rather than one highlight moment.',
  'Context matters: the score, phase, court position, or remaining time can change the best available choice.',
  'The opponent’s response is part of the story; a successful adjustment often forces a new counter-adjustment.',
  'Small details such as timing and communication can explain why the same plan works in one sequence but not another.',
  'There is more than one sound solution, so compare the risk of the aggressive option with the value of keeping control.',
];

const posts = [
  {
    title: 'Demo: What to watch in the Premier League this week',
    content:
      'A sample football briefing covering the fixtures, form, and key matchups to follow. This is demo content, not a report of a real match.',
    categorySlug: 'football',
    competitionSlug: 'premier-league',
  },
  {
    title: 'Demo: La Liga season storylines',
    content:
      'A sample preview of the teams and tactical questions fans may follow across a La Liga season. This is demo content, not a report of a real match.',
    categorySlug: 'football',
    competitionSlug: 'la-liga',
  },
  {
    title: 'Demo: NBA matchups to keep an eye on',
    content:
      'A sample basketball briefing about team rotations, pace, and standout matchups. This is demo content, not a report of a real game.',
    categorySlug: 'basketball',
    competitionSlug: 'nba',
  },
  {
    title: 'Demo: Following the EuroLeague season',
    content:
      'A sample EuroLeague preview focused on club form and the race for the playoffs. This is demo content, not a report of a real game.',
    categorySlug: 'basketball',
    competitionSlug: 'euroleague',
  },
  {
    title: 'Demo: A guide to the Wimbledon draw',
    content:
      'A sample tennis explainer about the draw, court surfaces, and the tournament format. This is demo content, not a report of a real match.',
    categorySlug: 'tennis',
    competitionSlug: 'wimbledon',
  },
  {
    title: 'Demo: What makes the US Open unique',
    content:
      'A sample overview of the hard-court major, its atmosphere, and the challenges players face. This is demo content, not a report of a real match.',
    categorySlug: 'tennis',
    competitionSlug: 'us-open',
  },
  {
    title: 'Demo: A fan guide to the IPL',
    content:
      'A sample cricket explainer covering the fast-paced league format and the skills that shape a T20 innings. This is demo content, not a report of a real match.',
    categorySlug: 'cricket',
    competitionSlug: 'indian-premier-league',
  },
  {
    title: 'Demo: Rugby World Cup tournament format',
    content:
      'A sample guide to pools, knockout rounds, and the tactical variety of international rugby. This is demo content, not a report of a real match.',
    categorySlug: 'rugby',
    competitionSlug: 'rugby-world-cup',
  },
  {
    title: 'Demo: How the Volleyball Nations League works',
    content:
      'A sample introduction to the international competition format and the rotations that make volleyball compelling. This is demo content, not a report of a real match.',
    categorySlug: 'volleyball',
    competitionSlug: 'volleyball-nations-league',
  },
  {
    title: 'Demo: A beginner’s guide to Major League Baseball',
    content:
      'A sample baseball explainer covering innings, pitching changes, and the long rhythm of a season. This is demo content, not a report of a real game.',
    categorySlug: 'baseball',
    competitionSlug: 'major-league-baseball',
  },
  {
    title: 'Demo: Understanding the NHL season',
    content:
      'A sample ice hockey preview covering the regular season, special teams, and the path to the playoffs. This is demo content, not a report of a real game.',
    categorySlug: 'ice-hockey',
    competitionSlug: 'national-hockey-league',
  },
];

const generatedPostCount = 1000 - posts.length;
const generatedPosts = Array.from(
  { length: generatedPostCount },
  (_, index) => {
    const competition =
      originalDemoPostCompetitions[index % originalDemoPostCompetitions.length];
    const profile = editorialProfiles[competition.categorySlug];
    if (!profile) {
      throw new Error(`No editorial profile for ${competition.categorySlug}`);
    }

    const competitionPostNumber = Math.floor(
      index / originalDemoPostCompetitions.length,
    );
    const topic = profile.topics[competitionPostNumber % profile.topics.length];
    const format =
      articleFormats[
        Math.floor(competitionPostNumber / profile.topics.length) %
          articleFormats.length
      ];
    const angle =
      storyAngles[
        Math.floor(
          competitionPostNumber /
            (profile.topics.length * articleFormats.length),
        ) % storyAngles.length
      ];
    const sequence = String(index + 1).padStart(4, '0');
    const oldTitleAngles = [
      'form guide',
      'season preview',
      'tactical notes',
      'players to watch',
      'competition overview',
    ];

    return {
      title: `Demo: ${competition.name} — ${topic.title} | ${format.name} #${sequence}`,
      content: [
        `${format.name}: ${topic.title} in ${competition.name}.`,
        `${format.opening} ${topic.context}`,
        topic.detail,
        `${format.lens} ${angle}`,
        `For a useful rewatch, focus on this question: ${readerPrompts[index % readerPrompts.length]}`,
        'This is original sample analysis for a demo database, not reporting about a real match or current event.',
      ].join('\n\n'),
      categorySlug: competition.categorySlug,
      competitionSlug: competition.slug,
      legacyTitle: `Demo: ${competition.name} ${oldTitleAngles[index % oldTitleAngles.length]} #${sequence}`,
    };
  },
);
posts.push(...generatedPosts);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured before running the seed');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('BEGIN');

  const categoryIds = new Map();
  for (const category of categories) {
    const result = await client.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [category.name, category.slug],
    );
    categoryIds.set(category.slug, result.rows[0].id);
  }

  const competitionIds = new Map();
  for (const competition of competitions) {
    const categoryId = categoryIds.get(competition.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category ${competition.categorySlug}`);
    }

    const imageUrl = `https://placehold.co/600x400?text=${encodeURIComponent(competition.name)}`;
    const result = await client.query(
      `INSERT INTO competitions (name, slug, category_id, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             category_id = EXCLUDED.category_id,
             image_url = EXCLUDED.image_url
       RETURNING id`,
      [competition.name, competition.slug, categoryId, imageUrl],
    );
    competitionIds.set(competition.slug, result.rows[0].id);
  }

  let insertedPosts = 0;
  let updatedPosts = 0;
  for (const post of posts) {
    const categoryId = categoryIds.get(post.categorySlug);
    const competitionId = competitionIds.get(post.competitionSlug);
    if (!categoryId || !competitionId) {
      throw new Error(
        `Unknown category or competition for seed post: ${post.title}`,
      );
    }

    if (post.legacyTitle) {
      const updated = await client.query(
        `UPDATE posts
         SET title = $1, content = $2
         WHERE category_id = $3
           AND competition_id = $4
           AND title = $5
         RETURNING id`,
        [post.title, post.content, categoryId, competitionId, post.legacyTitle],
      );
      if (updated.rowCount) {
        updatedPosts += updated.rowCount;
        continue;
      }
    }

    const result = await client.query(
      `INSERT INTO posts (title, content, category_id, competition_id)
       SELECT $1::VARCHAR(255), $2::TEXT, $3::INT, $4::INT
       WHERE NOT EXISTS (
         SELECT 1 FROM posts
         WHERE category_id = $3::INT
           AND competition_id = $4::INT
           AND title = $1::VARCHAR(255)
       )
       RETURNING id`,
      [post.title, post.content, categoryId, competitionId],
    );
    insertedPosts += result.rowCount ?? 0;
  }

  await client.query('COMMIT');
  console.log(
    `Seed complete: ${categories.length} categories, ${competitions.length} competitions, ${insertedPosts} new demo posts, ${updatedPosts} refreshed demo posts.`,
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
