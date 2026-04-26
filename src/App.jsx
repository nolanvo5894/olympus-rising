import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import medalRatesData from "./datasets/medal_rates.json";
import sportStatsData from "./datasets/sport_stats.json";

/* ═══════════════════════════════════════════════════════════════
   OLYMPUS RISING v3 — Moves Edition
   Each spirit = a sport. Each move = an event.
   Attack = probabilistic medal roll from real data (datasets/medal_rates.json).
   ═══════════════════════════════════════════════════════════════ */

// ── US State Paths (simplified Albers projection from Census TopoJSON) ──
const ST=[
["AL","south","M367,237L369,237L368,237L367,237ZM368,180L385,180L395,188L398,206L400,210L401,213L399,214L399,218L399,222L399,225L398,228L374,228L375,231L376,235L375,237L371,237L371,235L370,232L369,234L367,235L366,230L367,205L368,181L368,180Z"],
["AZ","southwest","M103,207L105,206L104,203L103,200L105,197L105,194L106,192L108,190L108,188L104,183L104,179L103,175L103,172L103,169L103,167L105,166L108,168L109,160L139,156L160,173L160,193L145,224L102,210L103,207Z"],
["CO","mountain","M160,108L185,108L201,108L220,108L229,120L230,130L230,156L220,156L200,156L181,156L168,156L160,150L159,135L160,114L160,108Z"],
["FL","south","M400,228L406,232L428,234L430,233L430,231L433,231L436,233L437,240L443,255L444,261L447,270L449,276L449,288L448,291L447,294L446,296L443,301L443,298L439,298L438,294L437,292L434,289L432,284L429,282L429,280L429,277L428,279L426,275L423,270L425,268L425,265L423,264L423,269L422,264L422,263L423,260L423,256L422,252L420,250L418,249L416,246L414,243L411,240L406,240L405,241L401,243L401,244L400,245L396,244L395,240L387,236L377,236L376,235L375,231L380,228L400,228Z"],
["GA","south","M394,180L414,180L417,183L419,186L422,188L423,190L425,193L428,196L430,198L431,200L432,202L435,204L436,207L436,209L438,211L439,214L441,216L441,217L439,218L438,219L437,221L437,224L436,226L435,228L436,231L433,231L430,231L430,232L428,236L428,233L401,231L400,227L399,224L399,221L399,217L400,214L400,212L399,208L397,198L394,180Z"],
["IN","heartland","M375,100L377,101L385,99L402,102L402,131L401,133L402,134L398,136L395,135L394,139L391,141L390,144L387,142L386,143L384,145L383,145L381,145L379,147L375,145L374,145L373,145L371,146L370,146L370,144L371,142L371,141L373,139L374,136L375,133L374,129L375,124L375,114L375,100Z"],
["KS","heartland","M229,120L262,120L292,120L298,121L300,121L301,122L301,123L300,124L299,125L300,127L301,128L302,130L303,130L304,136L304,153L282,156L254,156L230,156L230,128L229,120Z"],
["ME","northeast","M543,83L540,78L540,64L541,57L542,55L544,53L546,50L547,48L548,45L550,40L560,33L564,33L568,32L572,41L572,50L575,53L575,55L577,58L579,59L580,63L577,65L576,65L574,67L572,65L571,67L569,67L566,69L566,67L565,68L564,71L563,70L562,68L562,66L560,68L559,71L557,74L556,73L555,73L552,75L550,75L548,77L546,79L544,81L543,83Z"],
["MA","northeast","M517,87L538,87L541,85L543,88L541,89L540,91L540,92L541,93L544,95L544,97L546,99L550,99L549,96L548,95L551,98L550,100L546,101L542,103L543,102L543,99L542,100L540,102L538,99L536,97L524,96L520,96L517,87Z"],
["MN","heartland","M278,12L300,8L303,14L307,16L312,18L317,16L324,18L325,20L328,20L331,22L334,23L340,22L342,22L346,23L352,24L354,24L350,26L343,29L334,35L329,39L328,40L326,48L323,49L322,53L323,56L322,60L322,63L326,65L331,68L333,71L337,76L322,78L285,65L283,55L283,51L284,45L282,40L282,37L281,31L280,26L279,21L279,16L278,12Z"],
["NJ","northeast","M494,124L496,122L500,120L503,118L500,115L498,113L498,111L500,108L502,105L511,108L509,112L507,114L510,115L509,123L507,127L503,131L500,132L500,129L498,129L496,127L494,124Z"],
["NC","south","M433,161L449,161L481,161L493,166L493,168L491,163L490,163L492,167L490,165L488,164L487,166L486,166L485,168L483,166L483,168L487,169L489,170L491,169L493,171L491,173L490,175L487,176L485,174L484,175L480,174L485,176L484,179L484,180L486,180L486,182L484,183L487,182L483,184L475,186L471,192L468,193L458,187L442,181L438,178L425,178L419,180L408,177L410,174L416,173L418,171L421,169L424,169L428,166L432,164L433,162L433,161Z"],
["ND","heartland","M210,12L239,12L261,12L278,13L279,16L279,19L279,22L280,26L281,29L282,32L282,37L282,39L283,42L284,45L277,49L250,49L220,49L210,19L210,12Z"],
["OK","southwest","M220,156L243,156L274,156L304,162L305,171L305,185L304,196L301,195L298,192L295,193L292,193L291,194L288,195L286,195L284,194L282,194L281,192L279,194L278,195L278,193L276,194L274,193L272,194L270,193L269,191L267,190L264,190L261,190L259,190L257,187L255,187L251,185L234,162L220,156Z"],
["PA","northeast","M445,96L449,94L452,93L464,96L487,96L497,97L499,98L499,101L501,103L503,103L502,105L500,107L499,110L498,112L499,113L500,115L502,117L501,119L499,120L496,122L493,122L475,123L445,123L445,96Z"],
["SD","heartland","M209,60L220,49L257,49L284,50L281,53L285,56L285,78L285,80L285,82L285,84L284,86L285,89L284,90L282,88L279,87L276,86L274,86L271,86L265,85L241,84L209,84L209,60Z"],
["TX","southwest","M220,162L250,185L255,187L257,187L260,190L263,190L266,190L269,191L270,193L273,192L275,193L277,194L278,195L280,194L281,194L283,193L286,195L288,195L291,193L294,193L297,193L301,194L304,196L306,197L307,197L310,197L310,217L312,220L313,222L313,224L315,227L314,229L313,233L312,236L313,239L311,242L304,246L303,246L302,243L300,244L301,247L300,249L299,250L303,248L296,254L287,259L280,265L276,274L278,284L276,281L276,276L279,267L281,263L286,260L284,260L282,260L280,263L279,263L277,266L276,266L277,269L275,272L275,273L275,278L277,284L278,287L277,289L275,289L271,287L269,287L267,287L263,285L261,284L259,282L258,279L256,276L256,274L255,272L254,269L252,267L251,266L249,263L247,260L246,257L245,255L243,253L242,249L239,246L237,244L236,243L232,243L230,243L226,243L223,244L222,246L221,248L220,250L217,252L213,250L209,247L206,245L203,241L203,237L201,235L199,231L196,230L193,226L190,223L187,220L184,218L196,216L219,199L220,162Z"],
["WY","mountain","M209,60L209,80L202,108L188,108L168,108L150,108L140,108L140,96L140,76L139,68L139,62L143,60L148,60L159,60L179,60L191,60L205,60L209,60Z"],
["CT","northeast","M515,95L522,96L525,96L532,99L532,104L530,104L528,105L525,105L522,105L520,105L517,107L516,107L513,108L514,104L515,95Z"],
["MO","heartland","M292,113L324,113L334,114L336,116L336,122L338,125L342,128L343,133L347,133L348,136L346,141L349,144L351,145L353,147L355,149L355,153L357,156L359,156L359,159L357,161L355,162L355,165L354,167L348,166L349,163L319,162L304,144L303,130L302,129L300,127L299,124L301,123L301,122L298,121L295,118L293,115L292,114L292,113Z"],
["WV","capital","M424,139L427,137L429,133L431,133L432,133L433,129L436,127L439,127L442,123L442,121L443,118L444,114L449,123L457,128L462,125L464,126L466,125L470,124L471,125L472,128L466,127L466,130L464,132L461,135L458,137L453,138L451,142L449,145L448,148L445,151L441,151L438,153L435,153L431,153L431,150L428,148L426,146L425,143L424,141L424,139Z"],
["IL","heartland","M336,115L338,112L339,110L340,106L341,103L345,102L347,99L348,96L345,91L353,90L372,91L374,97L375,114L375,128L374,131L375,135L373,138L371,141L370,143L369,145L370,146L369,150L365,152L365,155L360,153L359,156L357,156L355,153L355,149L353,147L350,145L349,144L346,140L348,135L346,132L343,132L340,127L337,124L336,121L336,115Z"],
["NM","southwest","M160,156L181,156L199,156L213,156L220,162L220,173L219,195L219,203L205,216L184,217L184,218L185,219L168,224L160,193L160,176L160,156Z"],
["AR","south","M304,162L348,162L349,165L347,167L353,169L352,170L351,172L351,173L349,174L348,175L349,176L349,178L348,180L347,182L345,182L345,184L344,187L342,188L342,190L341,191L340,192L339,194L339,196L338,199L340,201L338,202L325,204L310,197L308,197L306,197L305,196L305,181L304,167L304,162Z"],
["CA","pacific","M8,96L24,96L47,96L50,123L55,136L76,154L104,182L108,188L107,190L105,193L105,196L103,200L104,203L105,207L79,210L77,207L75,200L71,197L67,196L66,194L62,192L57,189L54,187L49,186L44,185L43,181L41,178L39,173L36,170L33,166L31,161L32,158L28,156L26,152L25,149L26,147L29,150L28,148L26,145L27,143L25,144L25,145L22,145L21,142L19,139L15,135L12,129L12,123L9,119L6,115L8,107L9,100L8,96Z"],
["DE","capital","M492,123L494,122L495,123L495,124L494,125L494,126L496,128L496,130L497,132L499,135L499,136L493,138L492,123Z"],
["DC","capital","M479,133L480,135L479,133Z"],
["IA","heartland","M285,78L322,78L338,80L338,82L339,87L344,90L346,92L348,96L348,98L347,101L344,102L340,103L340,106L339,110L338,112L336,115L335,114L333,113L314,113L292,113L292,111L291,108L292,106L290,104L290,102L289,100L289,98L289,96L287,95L286,92L286,90L284,88L285,85L285,83L284,81L284,78L285,78Z"],
["KY","south","M359,156L360,153L365,155L365,152L369,150L370,146L372,145L374,145L376,145L379,146L382,145L384,146L386,143L387,142L388,144L391,143L393,140L395,135L399,135L402,134L401,131L404,131L407,132L410,135L414,136L417,137L421,135L424,138L424,141L425,143L426,146L428,148L426,153L422,156L419,158L415,160L405,161L390,160L376,160L365,162L357,161L359,159L359,156Z"],
["MD","capital","M455,123L492,124L499,140L493,145L491,144L491,143L491,141L490,140L490,141L487,140L487,137L489,137L488,136L487,135L487,133L487,132L488,132L488,129L490,127L489,126L487,127L486,127L486,130L485,130L485,133L485,135L486,140L486,141L486,143L485,142L481,140L480,140L478,137L480,135L478,132L475,131L474,128L472,127L471,125L467,125L466,125L463,125L459,126L455,129L455,123Z"],
["MI","heartland","M382,99L387,91L387,83L385,75L386,71L387,64L390,61L393,59L394,58L394,61L395,60L395,62L396,57L400,55L399,52L402,51L408,52L412,55L416,57L415,60L417,63L416,68L413,71L411,75L413,77L415,75L416,73L420,71L424,74L426,84L425,89L423,89L422,89L420,92L418,96L416,98L402,99L382,99ZM346,41L352,38L358,37L362,34L366,31L372,31L368,33L366,36L365,39L368,37L371,37L374,39L376,42L381,42L383,42L385,42L394,40L400,40L401,42L404,43L407,42L409,44L409,46L411,48L414,47L413,49L407,49L403,48L402,50L398,47L394,48L391,49L387,49L385,52L383,52L385,50L382,51L380,50L377,53L373,59L373,56L371,55L372,52L370,50L368,48L364,48L359,46L346,42L346,41Z"],
["MS","south","M338,204L339,202L339,200L338,199L338,196L339,196L340,194L340,192L341,191L341,190L343,188L343,187L344,184L345,184L345,183L346,181L355,180L368,192L366,225L365,236L362,235L357,236L356,237L354,237L352,234L352,231L347,228L334,226L335,225L335,223L335,222L335,221L336,219L337,218L338,215L339,214L340,213L341,212L339,210L339,209L338,206L339,205L338,204Z"],
["MT","mountain","M90,12L140,12L189,12L210,49L192,60L159,60L146,60L140,66L136,63L134,65L131,65L128,65L125,66L122,67L120,66L118,62L116,60L113,57L112,54L111,52L109,53L106,54L105,51L106,48L106,46L106,42L105,40L103,39L101,38L98,34L96,33L94,30L93,29L91,26L90,12Z"],
["NH","northeast","M535,60L536,58L537,56L540,64L540,77L540,80L543,83L541,85L538,87L533,88L524,86L526,84L526,81L526,78L527,75L529,73L530,70L530,68L532,67L534,66L534,64L535,61L535,60Z"],
["NY","northeast","M452,93L459,89L461,85L460,82L465,80L473,81L480,81L484,79L488,78L488,73L487,72L488,69L492,67L497,62L503,60L517,61L516,64L517,69L516,73L516,77L517,86L515,100L513,108L513,110L516,109L519,108L525,107L527,107L529,108L531,107L518,112L511,113L510,111L503,104L501,103L499,99L497,97L479,96L452,93Z"],
["OH","heartland","M402,100L416,100L420,102L422,102L425,103L431,102L435,101L441,98L444,113L444,115L443,118L442,121L441,123L440,126L437,127L434,128L432,130L432,133L431,133L430,132L428,136L427,138L424,138L421,136L419,136L417,136L413,136L410,135L407,133L405,131L402,130L402,116L402,100Z"],
["OR","pacific","M15,45L17,46L22,48L22,52L26,53L31,52L35,51L38,53L41,52L46,52L50,50L55,49L60,48L82,49L85,51L84,54L83,58L82,61L79,64L78,67L80,69L81,71L80,73L74,96L50,96L30,96L19,96L7,95L6,93L5,87L6,83L7,80L9,71L9,64L10,58L10,54L10,49L11,46L13,46L15,45Z"],
["TN","south","M353,168L353,165L354,164L355,162L356,162L370,161L379,160L390,160L402,161L413,161L425,161L433,162L432,164L429,167L427,166L424,168L421,169L418,171L417,172L412,174L410,176L408,177L394,180L376,180L355,180L349,178L349,177L349,175L349,174L350,173L351,172L351,171L353,170L353,168Z"],
["UT","mountain","M110,96L128,96L140,96L140,108L150,108L160,114L159,135L160,150L154,156L139,156L117,156L110,147L109,139L110,117L110,96Z"],
["VA","capital","M430,150L431,152L434,154L437,152L441,151L445,150L447,149L448,146L451,142L453,139L458,138L460,134L464,132L466,130L467,127L473,128L475,130L478,132L480,135L478,136L478,140L480,141L484,142L487,145L487,148L485,148L482,145L483,147L486,149L487,150L486,152L486,153L487,156L484,155L481,153L483,154L485,157L487,156L490,158L481,161L449,161L433,161L417,161L415,160L420,158L423,155L430,150Z"],
["WA","pacific","M80,12L80,43L80,47L60,48L54,49L48,51L43,51L38,53L34,52L28,53L24,53L22,49L17,46L13,45L11,45L9,42L10,43L11,40L10,39L10,37L8,36L7,32L5,26L3,22L5,20L9,22L15,22L19,23L21,24L22,22L23,23L24,26L22,26L18,32L19,32L23,26L25,27L25,30L25,33L24,34L22,33L21,34L24,34L26,32L26,30L27,26L26,22L26,23L25,21L24,19L24,18L26,17L24,15L23,14L29,12L62,12L80,12Z"],
["WI","heartland","M330,40L337,38L340,37L341,39L343,40L346,42L359,46L364,48L368,48L370,50L372,52L371,55L373,56L373,59L372,61L370,65L372,64L376,61L378,58L380,57L378,61L376,64L374,70L373,75L371,82L372,86L364,90L344,90L339,85L339,81L338,77L336,73L331,70L328,67L324,65L322,61L322,58L324,55L321,53L325,48L327,40L329,39L330,40Z"],
["NE","heartland","M209,84L241,84L265,85L271,86L274,86L276,86L279,87L282,88L284,90L286,91L286,94L288,96L288,97L289,99L289,101L290,102L291,105L291,107L292,109L291,111L292,114L293,114L294,117L297,120L262,120L229,108L209,84Z"],
["SC","south","M419,180L425,178L427,178L439,179L448,182L461,190L461,196L458,201L456,204L454,205L453,206L451,207L450,209L446,210L446,211L443,212L443,214L441,216L439,214L438,211L436,209L436,207L435,204L432,202L431,200L430,198L428,196L425,193L423,190L422,188L419,186L417,183L419,180Z"],
["ID","mountain","M81,48L80,44L80,20L89,21L92,27L93,30L93,31L97,34L100,36L102,39L104,40L107,40L106,45L105,47L106,50L105,53L107,54L110,52L112,53L113,55L115,59L115,62L119,64L121,67L123,66L126,66L129,66L133,65L135,64L138,65L140,76L128,96L104,96L80,74L80,71L80,69L78,67L80,63L82,60L83,56L85,52L82,49L81,48Z"],
["NV","pacific","M50,96L64,96L97,96L105,96L110,117L110,142L109,156L109,166L107,167L105,166L103,167L103,169L103,171L103,173L104,175L104,179L96,172L69,148L55,136L50,128L50,111L50,96Z"],
["VT","northeast","M517,60L527,60L535,61L534,64L534,66L532,67L530,68L530,70L529,73L527,75L526,78L526,81L526,84L524,86L517,87L517,81L516,77L517,75L516,72L517,69L517,66L516,63L517,61L517,60Z"],
["LA","south","M310,204L338,204L339,205L339,208L340,208L340,210L340,211L341,213L338,214L339,215L338,216L337,218L336,219L335,221L335,223L334,223L334,225L334,228L352,229L351,232L353,235L355,238L353,240L353,241L354,240L356,240L358,240L356,242L356,243L355,245L354,245L354,246L355,247L358,248L359,250L359,252L356,252L357,250L354,249L348,251L347,249L345,248L344,249L342,251L340,250L337,248L339,249L337,247L335,246L334,243L332,243L329,243L329,244L330,245L321,243L313,243L311,242L313,238L313,235L314,232L315,229L315,226L313,223L312,222L312,219L310,216L310,204Z"],
["RI","northeast","M531,104L532,103L532,97L536,97L537,99L538,100L537,100L536,100L536,101L536,102L535,103L531,104Z"]
];

// ── Regions ─────────────────────────────────────────────────
const REGIONS=[
  {id:"pacific",name:"Pacific",states:"CA, OR, WA, NV",sports:["Track & Field","Volleyball","Water Polo","Swimming","Rugby Sevens"],color:"#3b82f6",cx:57,cy:130},
  {id:"mountain",name:"Mountain",states:"CO, UT, WY, MT, ID",sports:["Freestyle Skiing","Snowboarding","Alpine Skiing","Sport Climbing","Para Alpine"],color:"#94a3b8",cx:150,cy:90},
  {id:"southwest",name:"Southwest",states:"TX, AZ, NM, OK",sports:["Gymnastics","Shooting","Sitting Volleyball","Skateboarding","Table Tennis"],color:"#ef4444",cx:210,cy:210},
  {id:"heartland",name:"Heartland",states:"OH, IN, IL, MI, MN, WI",sports:["Ice Hockey","Track & Field","Wheelchair Basketball","Swimming","Speed Skating"],color:"#eab308",cx:330,cy:90},
  {id:"south",name:"South",states:"FL, GA, AL, TN, NC, SC",sports:["Track & Field","Swimming","Tennis","Sailing","Equestrian"],color:"#22c55e",cx:400,cy:210},
  {id:"northeast",name:"Northeast",states:"NY, NJ, MA, PA, ME",sports:["Rowing","Ice Hockey","Fencing","Freestyle Skiing","Sled Hockey"],color:"#a855f7",cx:510,cy:85},
  {id:"capital",name:"Capital",states:"DC, MD, VA, WV, DE",sports:["Canoe / Kayak","Equestrian","Swimming","Track & Field"],color:"#6366f1",cx:465,cy:140},
  {id:"la28",name:"LA28",states:"Los Angeles",sports:["ALL"],color:"#d4a843",cx:68,cy:195},
];

// ── Spirits (1 per sport, moves = events) ───────────────────
// Move: [name, gold%, silver%, bronze%, keyword|null]
// Keywords: RELAY=hit twice on gold, ENDURANCE=heal 8 on hit, EXPLOSIVE=double gold dmg, PRECISION=+10 on silver/gold
// ── Medal rates loaded from pre-computed JSON (run compute_medal_rates.py to regenerate) ──
const MEDAL_RATES=medalRatesData.rates;
function rateFor(sport,move){const r=MEDAL_RATES[sport+"|"+move];return r?[r.gold,r.silver,r.bronze]:null;}

// Default rates for moves with no historical data (new events, too few appearances)
const FALLBACK_RATES={
  "Swimming|10km Open Water":[.08,.04,.04],
  "Cycling|Mountain Bike XC":[.05,.05,.10],
  "Sport Climbing|Lead":[.00,.50,.00],
  "Sport Climbing|Bouldering":[.00,.50,.00],
  "Sport Climbing|Speed":[.00,.00,.50],
  "Equestrian|Dressage Individual":[.06,.08,.08],
  "Archery|Individual Compound":[.10,.08,.10],
  "Flag Football|Tournament":[.15,.05,.05],
};
function r(sport,move){return rateFor(sport,move)||FALLBACK_RATES[sport+"|"+move]||[.05,.05,.05];}

const SPIRITS=[
  // ── Olympic spirits — rates from datasets/medal_rates.json ──
  {id:"swimming",sport:"Swimming",emoji:"🏊",para:false,regions:["pacific","capital","south"],moves:[
    ["100m Freestyle",...r("Swimming","100m Freestyle"),null],
    ["200m Butterfly",...r("Swimming","200m Butterfly"),null],
    ["4×100m Medley Relay",...r("Swimming","4×100m Medley Relay"),"RELAY"],
    ["10km Open Water",...r("Swimming","10km Open Water"),"ENDURANCE"],
    ["200m Backstroke",...r("Swimming","200m Backstroke"),null],
  ]},
  {id:"track",sport:"Track & Field",emoji:"🏃",para:false,regions:["southwest","south","capital"],moves:[
    ["100m Sprint",...r("Track & Field","100m Sprint"),"EXPLOSIVE"],
    ["400m Hurdles",...r("Track & Field","400m Hurdles"),null],
    ["4×400m Relay",...r("Track & Field","4×400m Relay"),"RELAY"],
    ["Marathon",...r("Track & Field","Marathon"),"ENDURANCE"],
    ["Shot Put",...r("Track & Field","Shot Put"),null],
  ]},
  {id:"gymnastics",sport:"Gymnastics",emoji:"🤸",para:false,regions:["southwest","south"],moves:[
    ["All-Around",...r("Gymnastics","All-Around"),null],
    ["Floor Exercise",...r("Gymnastics","Floor Exercise"),null],
    ["Vault",...r("Gymnastics","Vault"),null],
    ["Balance Beam",...r("Gymnastics","Balance Beam"),null],
  ]},
  {id:"basketball",sport:"Basketball",emoji:"🏀",para:false,regions:["south","northeast","heartland"],moves:[
    ["Men's Tournament",...r("Basketball","Men's Tournament"),"RELAY"],
    ["Women's Tournament",...r("Basketball","Women's Tournament"),"RELAY"],
  ]},
  {id:"wrestling",sport:"Wrestling",emoji:"🤼",para:false,regions:["heartland","southwest"],moves:[
    ["Freestyle 74kg",...r("Wrestling","Freestyle 74kg"),null],
    ["Greco-Roman 67kg",...r("Wrestling","Greco-Roman 67kg"),null],
    ["Women's Freestyle 57kg",...r("Wrestling","Women's Freestyle 57kg"),null],
  ]},
  {id:"rowing",sport:"Rowing",emoji:"🚣",para:false,regions:["northeast","capital","heartland"],moves:[
    ["Men's Eight",...r("Rowing","Men's Eight"),"RELAY"],
    ["Women's Single Sculls",...r("Rowing","Women's Single Sculls"),"ENDURANCE"],
    ["Men's Coxless Pair",...r("Rowing","Men's Coxless Pair"),null],
  ]},
  {id:"shooting",sport:"Shooting",emoji:"🎯",para:false,regions:["mountain","heartland"],moves:[
    ["Air Rifle 10m",...r("Shooting","Air Rifle 10m"),"PRECISION"],
    ["Skeet",...r("Shooting","Skeet"),"PRECISION"],
    ["Rapid Fire Pistol",...r("Shooting","Rapid Fire Pistol"),"PRECISION"],
  ]},
  {id:"diving",sport:"Diving",emoji:"🤿",para:false,regions:["pacific","south"],moves:[
    ["10m Platform",...r("Diving","10m Platform"),"PRECISION"],
    ["3m Springboard",...r("Diving","3m Springboard"),"PRECISION"],
    ["Synchro 10m",...r("Diving","Synchro 10m"),null],
  ]},
  {id:"fencing",sport:"Fencing",emoji:"🤺",para:false,regions:["northeast","capital"],moves:[
    ["Foil Individual",...r("Fencing","Foil Individual"),null],
    ["Épée Team",...r("Fencing","Épée Team"),"RELAY"],
    ["Sabre Individual",...r("Fencing","Sabre Individual"),null],
  ]},
  {id:"boxing",sport:"Boxing",emoji:"🥊",para:false,regions:["southwest","northeast"],moves:[
    ["Welterweight",...r("Boxing","Welterweight"),"EXPLOSIVE"],
    ["Lightweight",...r("Boxing","Lightweight"),null],
    ["Heavyweight",...r("Boxing","Heavyweight"),"EXPLOSIVE"],
  ]},
  {id:"volleyball",sport:"Volleyball",emoji:"🏐",para:false,regions:["northeast","heartland"],moves:[
    ["Indoor Men's",...r("Volleyball","Indoor Men's"),"RELAY"],
    ["Indoor Women's",...r("Volleyball","Indoor Women's"),"RELAY"],
    ["Beach Volleyball",...r("Volleyball","Beach Volleyball"),null],
  ]},
  {id:"waterpolo",sport:"Water Polo",emoji:"🤽",para:false,regions:["pacific","heartland"],moves:[
    ["Men's Tournament",...r("Water Polo","Men's Tournament"),"RELAY"],
    ["Women's Tournament",...r("Water Polo","Women's Tournament"),"RELAY"],
  ]},
  {id:"surfing",sport:"Surfing",emoji:"🏄",para:false,regions:["pacific"],moves:[
    ["Shortboard Men's",...r("Surfing","Shortboard Men's"),null],
    ["Shortboard Women's",...r("Surfing","Shortboard Women's"),null],
  ]},
  {id:"skateboarding",sport:"Skateboarding",emoji:"🛹",para:false,regions:["pacific"],moves:[
    ["Street",...r("Skateboarding","Street"),null],
    ["Park",...r("Skateboarding","Park"),null],
  ]},
  {id:"alpine",sport:"Alpine Skiing",emoji:"⛷️",para:false,regions:["mountain"],moves:[
    ["Slalom",...r("Alpine Skiing","Slalom"),null],
    ["Giant Slalom",...r("Alpine Skiing","Giant Slalom"),null],
    ["Downhill",...r("Alpine Skiing","Downhill"),"EXPLOSIVE"],
  ]},
  {id:"icehockey",sport:"Ice Hockey",emoji:"🏒",para:false,regions:["heartland","mountain","northeast"],moves:[
    ["Men's Tournament",...r("Ice Hockey","Men's Tournament"),"RELAY"],
    ["Women's Tournament",...r("Ice Hockey","Women's Tournament"),"RELAY"],
  ]},
  {id:"snowboard",sport:"Snowboarding",emoji:"🏂",para:false,regions:["mountain","pacific"],moves:[
    ["Halfpipe",...r("Snowboarding","Halfpipe"),null],
    ["Slopestyle",...r("Snowboarding","Slopestyle"),null],
    ["Snowboard Cross",...r("Snowboarding","Snowboard Cross"),"EXPLOSIVE"],
  ]},
  {id:"golf",sport:"Golf",emoji:"⛳",para:false,regions:["capital","south"],moves:[
    ["Men's Individual",...r("Golf","Men's Individual"),null],
    ["Women's Individual",...r("Golf","Women's Individual"),null],
  ]},
  {id:"tennis",sport:"Tennis",emoji:"🎾",para:false,regions:["northeast","capital","south"],moves:[
    ["Men's Singles",...r("Tennis","Men's Singles"),null],
    ["Women's Singles",...r("Tennis","Women's Singles"),null],
    ["Mixed Doubles",...r("Tennis","Mixed Doubles"),"RELAY"],
  ]},
  {id:"archery",sport:"Archery",emoji:"🏹",para:false,regions:["southwest","mountain"],moves:[
    ["Individual Recurve",...r("Archery","Individual Recurve"),"PRECISION"],
    ["Team Recurve",...r("Archery","Team Recurve"),"RELAY"],
    ["Individual Compound",...r("Archery","Individual Compound"),"PRECISION"],
  ]},
  {id:"cycling",sport:"Cycling",emoji:"🚴",para:false,regions:["mountain","pacific","capital"],moves:[
    ["Track Sprint",...r("Cycling","Track Sprint"),"EXPLOSIVE"],
    ["Team Pursuit",...r("Cycling","Team Pursuit"),"RELAY"],
    ["Road Race",...r("Cycling","Road Race"),"ENDURANCE"],
    ["BMX Racing",...r("Cycling","BMX Racing"),"EXPLOSIVE"],
    ["Mountain Bike XC",...r("Cycling","Mountain Bike XC"),"ENDURANCE"],
  ]},
  {id:"sailing",sport:"Sailing",emoji:"⛵",para:false,regions:["pacific","northeast"],moves:[
    ["49er",...r("Sailing","49er"),null],
    ["Laser/ILCA",...r("Sailing","Laser/ILCA"),"ENDURANCE"],
    ["Nacra 17 Mixed",...r("Sailing","Nacra 17 Mixed"),"RELAY"],
  ]},
  {id:"figureskating",sport:"Figure Skating",emoji:"⛸️",para:false,regions:["heartland","northeast"],moves:[
    ["Men's Singles",...r("Figure Skating","Men's Singles"),null],
    ["Women's Singles",...r("Figure Skating","Women's Singles"),null],
    ["Ice Dance",...r("Figure Skating","Ice Dance"),"RELAY"],
    ["Pairs",...r("Figure Skating","Pairs"),"RELAY"],
  ]},
  {id:"speedskating",sport:"Speed Skating",emoji:"⏱️",para:false,regions:["heartland","mountain"],moves:[
    ["500m",...r("Speed Skating","500m"),"EXPLOSIVE"],
    ["1500m",...r("Speed Skating","1500m"),null],
    ["5000m",...r("Speed Skating","5000m"),"ENDURANCE"],
    ["Short Track 1000m",...r("Speed Skating","Short Track 1000m"),null],
    ["Short Track Relay",...r("Speed Skating","Short Track Relay"),"RELAY"],
  ]},
  {id:"judo",sport:"Judo",emoji:"🥋",para:false,regions:["northeast","southwest"],moves:[
    ["73kg",...r("Judo","73kg"),null],
    ["57kg Women's",...r("Judo","57kg Women's"),null],
    ["100kg+",...r("Judo","100kg+"),"EXPLOSIVE"],
  ]},
  {id:"triathlon",sport:"Triathlon",emoji:"🏊‍♂️",para:false,regions:["pacific","capital"],moves:[
    ["Individual",...r("Triathlon","Individual"),"ENDURANCE"],
    ["Mixed Relay",...r("Triathlon","Mixed Relay"),"RELAY"],
  ]},
  {id:"weightlifting",sport:"Weightlifting",emoji:"🏋️",para:false,regions:["southwest","south"],moves:[
    ["61kg",...r("Weightlifting","61kg"),null],
    ["81kg",...r("Weightlifting","81kg"),null],
    ["109kg+",...r("Weightlifting","109kg+"),"EXPLOSIVE"],
  ]},
  {id:"baseball",sport:"Baseball",emoji:"⚾",para:false,regions:["south","northeast","southwest","pacific"],moves:[
    ["Tournament",...r("Baseball","Tournament"),"RELAY"],
  ]},
  {id:"softball",sport:"Softball",emoji:"🥎",para:false,regions:["pacific","heartland","southwest"],moves:[
    ["Tournament",...r("Softball","Tournament"),"RELAY"],
  ]},
  {id:"rugby7s",sport:"Rugby Sevens",emoji:"🏉",para:false,regions:["pacific","southwest"],moves:[
    ["Men's Tournament",...r("Rugby Sevens","Men's Tournament"),"RELAY"],
    ["Women's Tournament",...r("Rugby Sevens","Women's Tournament"),"RELAY"],
  ]},
  {id:"climbing",sport:"Sport Climbing",emoji:"🧗",para:false,regions:["mountain","pacific"],moves:[
    ["Lead",...r("Sport Climbing","Lead"),null],
    ["Bouldering",...r("Sport Climbing","Bouldering"),"EXPLOSIVE"],
    ["Speed",...r("Sport Climbing","Speed"),"EXPLOSIVE"],
  ]},
  {id:"tabletennis",sport:"Table Tennis",emoji:"🏓",para:false,regions:["northeast","capital"],moves:[
    ["Men's Singles",...r("Table Tennis","Men's Singles"),null],
    ["Women's Singles",...r("Table Tennis","Women's Singles"),null],
    ["Team Event",...r("Table Tennis","Team Event"),"RELAY"],
  ]},
  {id:"equestrian",sport:"Equestrian",emoji:"🐴",para:false,regions:["capital","heartland","south"],moves:[
    ["Eventing Individual",...r("Equestrian","Eventing Individual"),"ENDURANCE"],
    ["Jumping Team",...r("Equestrian","Jumping Team"),"RELAY"],
    ["Dressage Individual",...r("Equestrian","Dressage Individual"),"PRECISION"],
  ]},
  {id:"freestyleski",sport:"Freestyle Skiing",emoji:"🎿",para:false,regions:["mountain"],moves:[
    ["Moguls",...r("Freestyle Skiing","Moguls"),null],
    ["Aerials",...r("Freestyle Skiing","Aerials"),"EXPLOSIVE"],
    ["Ski Cross",...r("Freestyle Skiing","Ski Cross"),"EXPLOSIVE"],
    ["Halfpipe",...r("Freestyle Skiing","Halfpipe"),null],
  ]},
  {id:"canoe",sport:"Canoe / Kayak",emoji:"🛶",para:false,regions:["heartland","pacific","northeast"],moves:[
    ["Sprint K-1 1000m",...r("Canoe / Kayak","Sprint K-1 1000m"),"ENDURANCE"],
    ["Sprint C-2 500m",...r("Canoe / Kayak","Sprint C-2 500m"),"RELAY"],
    ["Slalom K-1",...r("Canoe / Kayak","Slalom K-1"),null],
  ]},
  {id:"taekwondo",sport:"Taekwondo",emoji:"🥋",para:false,regions:["southwest","south"],moves:[
    ["68kg",...r("Taekwondo","68kg"),null],
    ["57kg Women's",...r("Taekwondo","57kg Women's"),"EXPLOSIVE"],
  ]},
  {id:"modernpentathlon",sport:"Modern Pentathlon",emoji:"🤺",para:false,regions:["capital","northeast"],moves:[
    ["Individual",...r("Modern Pentathlon","Individual"),"ENDURANCE"],
  ]},
  {id:"flagfootball",sport:"Flag Football",emoji:"🏈",para:false,regions:["south","heartland","southwest"],moves:[
    ["Tournament",...r("Flag Football","Tournament"),"RELAY"],
  ]},
  // ── Paralympic Mech Warriors ──
  {id:"paraswim",sport:"Para Swimming",emoji:"🏊",para:true,regions:["south","pacific","capital"],moves:[
    ["50m Freestyle S7",.20,.15,.10,null],
    ["100m Backstroke S9",.18,.12,.08,null],
    ["4×100m Relay",.30,.08,.05,"RELAY"],
    ["200m IM SM8",.10,.10,.15,"ENDURANCE"],
  ]},
  {id:"paratrack",sport:"Para Track & Field",emoji:"🏃",para:true,regions:["south","southwest"],moves:[
    ["100m T54 Wheelchair",.18,.10,.10,"EXPLOSIVE"],
    ["Shot Put F46",.15,.12,.08,null],
    ["1500m T13",.08,.08,.15,"ENDURANCE"],
    ["Long Jump T64",.12,.10,.10,null],
  ]},
  {id:"wchairrugby",sport:"Wheelchair Rugby",emoji:"🦽",para:true,regions:["south","heartland"],moves:[
    ["Tournament",.45,.10,.08,"RELAY"],
  ]},
  {id:"sitvol",sport:"Sitting Volleyball",emoji:"🏐",para:true,regions:["south"],moves:[
    ["Women's Tournament",.40,.15,.05,"RELAY"],
    ["Men's Tournament",.10,.12,.15,null],
  ]},
  {id:"wchairbball",sport:"Wheelchair Basketball",emoji:"🏀",para:true,regions:["south","heartland"],moves:[
    ["Men's Tournament",.18,.15,.10,"RELAY"],
    ["Women's Tournament",.20,.12,.08,"RELAY"],
  ]},
  {id:"sledhockey",sport:"Sled Hockey",emoji:"🏒",para:true,regions:["heartland","northeast","mountain"],moves:[
    ["Tournament",.55,.10,.05,"RELAY"],
  ]},
  {id:"paralpine",sport:"Para Alpine",emoji:"⛷️",para:true,regions:["mountain"],moves:[
    ["Giant Slalom Standing",.18,.12,.08,null],
    ["Super-G Sitting",.15,.10,.12,null],
    ["Slalom VI",.10,.12,.10,"PRECISION"],
  ]},
  {id:"paranordic",sport:"Para Nordic",emoji:"🎿",para:true,regions:["mountain","heartland"],moves:[
    ["Biathlon Sprint",.20,.12,.08,"PRECISION"],
    ["Cross-Country 10km",.18,.10,.10,"ENDURANCE"],
    ["Relay",.25,.10,.05,"RELAY"],
  ]},
  {id:"paracycling",sport:"Para Cycling",emoji:"🚴",para:true,regions:["mountain","capital"],moves:[
    ["Track Individual Pursuit",.20,.12,.08,null],
    ["Road Time Trial",.15,.10,.10,"ENDURANCE"],
    ["Road Race Tandem",.18,.08,.08,"RELAY"],
  ]},
  {id:"paraarchery",sport:"Para Archery",emoji:"🏹",para:true,regions:["southwest","mountain"],moves:[
    ["W1 Individual",.15,.12,.10,"PRECISION"],
    ["Open Compound",.18,.10,.08,"PRECISION"],
    ["Team Recurve",.22,.08,.06,"RELAY"],
  ]},
  {id:"goalball",sport:"Goalball",emoji:"🔔",para:true,regions:["northeast","heartland"],moves:[
    ["Men's Tournament",.15,.10,.12,"RELAY"],
    ["Women's Tournament",.20,.12,.08,"RELAY"],
  ]},
  {id:"parapowerlifting",sport:"Para Powerlifting",emoji:"🏋️",para:true,regions:["south","southwest"],moves:[
    ["Up to 88kg",.18,.10,.12,"EXPLOSIVE"],
    ["Up to 65kg Women's",.15,.12,.10,"EXPLOSIVE"],
  ]},
  {id:"paratriathlon",sport:"Para Triathlon",emoji:"🏊‍♂️",para:true,regions:["pacific","capital"],moves:[
    ["PTS5",.15,.10,.08,"ENDURANCE"],
    ["PTVI",.12,.10,.12,"ENDURANCE"],
  ]},
  {id:"wchairtennis",sport:"Wheelchair Tennis",emoji:"🎾",para:true,regions:["south","northeast"],moves:[
    ["Men's Singles",.10,.15,.10,null],
    ["Women's Singles",.12,.12,.08,null],
    ["Quad Singles",.18,.10,.08,"PRECISION"],
  ]},
];

// ── Data-driven regional sport strengths (regenerated from CSV hometown data) ──
// For each sport: regions where it has ≥15% of its athletes OR is in the top 2.
const REGION_SPORT_STRENGTH={
  "Swimming":["pacific","heartland","south"],"Track & Field":["pacific","south","heartland"],
  "Gymnastics":["southwest","northeast","heartland","pacific"],"Basketball":["heartland","pacific","south","northeast"],
  "Wrestling":["heartland","northeast"],"Rowing":["northeast","pacific","heartland"],
  "Shooting":["south","mountain","southwest"],"Diving":["heartland","pacific","south","southwest"],
  "Fencing":["northeast","pacific"],"Boxing":["pacific","heartland","southwest"],
  "Volleyball":["pacific","heartland"],"Water Polo":["pacific","northeast"],
  "Surfing":["pacific","south"],"Skateboarding":["pacific","southwest","south"],
  "Alpine Skiing":["mountain","pacific","northeast"],"Ice Hockey":["heartland","northeast"],
  "Snowboarding":["mountain","pacific","northeast"],"Golf":["south","pacific","southwest"],
  "Tennis":["south","pacific"],"Archery":["pacific","heartland","northeast"],
  "Cycling":["pacific","mountain"],"Sailing":["south","pacific"],
  "Figure Skating":["pacific","heartland","northeast"],"Speed Skating":["heartland","northeast"],
  "Judo":["heartland","northeast","mountain","pacific"],"Triathlon":["northeast","mountain","pacific"],
  "Weightlifting":["south","pacific","heartland"],"Baseball":["south","northeast","southwest","pacific"],"Softball":["pacific","heartland"],
  "Rugby Sevens":["pacific","heartland"],"Sport Climbing":["mountain","heartland"],
  "Table Tennis":["pacific","northeast","southwest"],"Equestrian":["south","northeast","pacific"],
  "Freestyle Skiing":["mountain","northeast"],"Canoe / Kayak":["pacific","capital","south"],
  "Taekwondo":["southwest","pacific","heartland"],"Modern Pentathlon":["south","mountain","southwest","northeast"],
  "Flag Football":["heartland","south","southwest"],
  "Para Swimming":["heartland","south","northeast"],"Para Track & Field":["pacific","heartland","south"],
  "Wheelchair Rugby":["heartland","pacific","northeast","mountain"],"Sitting Volleyball":["south","southwest","pacific","heartland"],
  "Wheelchair Basketball":["heartland","pacific"],"Sled Hockey":["northeast","south","heartland"],
  "Para Alpine":["mountain","northeast","pacific"],"Para Nordic":["heartland","mountain","pacific"],
  "Para Cycling":["pacific","northeast"],"Para Archery":["heartland","pacific","south","southwest"],
  "Goalball":["heartland","south"],"Para Powerlifting":["south","heartland","pacific"],
  "Para Triathlon":["heartland","mountain","south","northeast"],"Wheelchair Tennis":["pacific","heartland","south"],
};
// Apply data-driven regions to all spirits
SPIRITS.forEach(s=>{if(REGION_SPORT_STRENGTH[s.sport])s.regions=REGION_SPORT_STRENGTH[s.sport];});

// ── Sport Body Types (avg height cm / weight kg, regenerated from CSV) ──
// Only includes sports that are in-game SPIRITS (Olympic only — body quiz
// doesn't apply to Paralympic sports). Counts reflect merged SPORT_MAP
// categories (e.g. Cycling includes Track/Road/BMX/MTB).
const SPORT_BODY_TYPES=[
  {sport:"Track & Field",emoji:"🏃",avgH:179.1,avgW:73.0,n:1742},
  {sport:"Rowing",emoji:"🚣",avgH:185.0,avgW:80.0,n:535},
  {sport:"Swimming",emoji:"🏊",avgH:179.8,avgW:71.9,n:510},
  {sport:"Ice Hockey",emoji:"🏒",avgH:179.4,avgW:81.8,n:374},
  {sport:"Basketball",emoji:"🏀",avgH:193.3,avgW:88.1,n:283},
  {sport:"Wrestling",emoji:"🤼",avgH:173.1,avgW:76.0,n:205},
  {sport:"Volleyball",emoji:"🏐",avgH:188.2,avgW:80.9,n:204},
  {sport:"Cycling",emoji:"🚴",avgH:177.0,avgW:71.2,n:195},
  {sport:"Speed Skating",emoji:"⏱️",avgH:172.7,avgW:68.7,n:179},
  {sport:"Shooting",emoji:"🎯",avgH:175.4,avgW:76.6,n:176},
  {sport:"Boxing",emoji:"🥊",avgH:175.2,avgW:67.3,n:171},
  {sport:"Sailing",emoji:"⛵",avgH:180.0,avgW:78.7,n:169},
  {sport:"Fencing",emoji:"🤺",avgH:178.1,avgW:72.7,n:164},
  {sport:"Alpine Skiing",emoji:"⛷️",avgH:172.7,avgW:71.5,n:163},
  {sport:"Canoe / Kayak",emoji:"🛶",avgH:178.9,avgW:74.1,n:151},
  {sport:"Water Polo",emoji:"🤽",avgH:186.9,avgW:85.7,n:147},
  {sport:"Gymnastics",emoji:"🤸",avgH:161.9,avgW:56.3,n:144},
  {sport:"Figure Skating",emoji:"⛸️",avgH:166.8,avgW:59.0,n:144},
  {sport:"Diving",emoji:"🤿",avgH:168.4,avgW:62.0,n:103},
  {sport:"Baseball",emoji:"⚾",avgH:186.1,avgW:88.3,n:97},
  {sport:"Equestrian",emoji:"🐴",avgH:173.5,avgW:64.6,n:92},
  {sport:"Freestyle Skiing",emoji:"🎿",avgH:172.8,avgW:69.2,n:91},
  {sport:"Weightlifting",emoji:"🏋️",avgH:172.5,avgW:94.3,n:89},
  {sport:"Snowboarding",emoji:"🏂",avgH:172.7,avgW:70.5,n:71},
  {sport:"Judo",emoji:"🥋",avgH:174.1,avgW:78.2,n:65},
  {sport:"Tennis",emoji:"🎾",avgH:182.6,avgW:76.2,n:59},
  {sport:"Rugby Sevens",emoji:"🏉",avgH:177.7,avgW:82.7,n:46},
  {sport:"Archery",emoji:"🏹",avgH:175.2,avgW:69.9,n:34},
  {sport:"Modern Pentathlon",emoji:"🤺",avgH:180.6,avgW:72.2,n:32},
  {sport:"Softball",emoji:"🥎",avgH:173.7,avgW:73.8,n:28},
  {sport:"Table Tennis",emoji:"🏓",avgH:171.3,avgW:62.8,n:26},
  {sport:"Triathlon",emoji:"🏊‍♂️",avgH:175.0,avgW:64.0,n:22},
  {sport:"Flag Football",emoji:"🏈",avgH:178.3,avgW:77.6,n:14},
  {sport:"Taekwondo",emoji:"🥋",avgH:176.0,avgW:66.0,n:13},
  {sport:"Skateboarding",emoji:"🛹",avgH:170.0,avgW:65.0,n:10}, // estimated — <3 athletes in CSV
  {sport:"Surfing",emoji:"🏄",avgH:175.0,avgW:72.0,n:9},        // estimated
  {sport:"Golf",emoji:"⛳",avgH:178.9,avgW:74.6,n:9},
  {sport:"Sport Climbing",emoji:"🧗",avgH:172.0,avgW:62.0,n:8}, // estimated
];

function bodyMatch(heightCm,weightKg){
  const hR=30,wR=40,sigma=0.45;
  return SPORT_BODY_TYPES.map(s=>{
    const d=Math.sqrt(((heightCm-s.avgH)/hR)**2+((weightKg-s.avgW)/wR)**2);
    const pct=Math.round(Math.exp(-Math.pow(d/sigma,2))*100);
    return {...s,dist:d,pct};
  }).sort((a,b)=>a.dist-b.dist).slice(0,5);
}

// ── Rounds (monsters array per round — supports multi-monster encounters) ──
const ROUNDS=[
  {regionId:"pacific",monsters:[
    {name:"Scylla",emoji:"🌊",hp:120,special:null,desc:"A sea beast drowning the Pacific's aquatic spirit."},
  ]},
  {regionId:"heartland",monsters:[
    {name:"Minotaur",emoji:"🐂",hp:100,special:"hit_strongest",desc:"Charges your strongest spirit first."},
    {name:"Harpy",emoji:"🦅",hp:80,special:"hit_weakest",desc:"Swoops on the weakest spirit."},
  ]},
  {regionId:"southwest",monsters:[
    {name:"Chimera",emoji:"🦁",hp:150,special:"shift_weakness",desc:"Its weakness shifts each turn — match the medal type for +50% damage."},
  ]},
  {regionId:"south",monsters:[
    {name:"Cerberus",emoji:"🐺",hp:120,special:"block_weak",desc:"Blocks moves with <25% total hit rate."},
    {name:"Hydra",emoji:"🐍",hp:100,special:"regenerate",desc:"Regenerates 10 HP each turn. Focus fire!"},
  ]},
  {regionId:"la28",monsters:[
    {name:"Typhon",emoji:"⚡",hp:200,special:"aoe",desc:"Father of Monsters. Hits ALL spirits each turn."},
  ]},
];

// ── Helpers ─────────────────────────────────────────────────
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
const HP=100; // flat HP for all spirits
const totalRate=m=>m[1]+m[2]+m[3];
const bestGold=s=>Math.max(...s.moves.map(m=>m[1]));
const tier=s=>{const g=bestGold(s);return g>=.30?{n:"Elite",c:"#d4a843"}:g>=.18?{n:"Strong",c:"#a855f7"}:g>=.10?{n:"Solid",c:"#60a5fa"}:{n:"Underdog",c:"#a1887f"};};

function rollMove(move,affinity,bodyAff,synergies={}){
  const [name,g,s,b,kw]=move;
  const r=Math.random();
  let tier_="miss",baseDmg=0;
  if(r<g){tier_="gold";baseDmg=30;}
  else if(r<g+s){tier_="silver";baseDmg=20;}
  else if(r<g+s+b){tier_="bronze";baseDmg=10;}
  // Keywords (with synergy chain bonuses)
  let bonus=0,extra="";
  const precBonus=synergies.precisionChain?15:10;
  const healAmt=synergies.enduranceChain?12:8;
  if(tier_!=="miss"&&kw==="PRECISION"&&(tier_==="gold"||tier_==="silver")){bonus=precBonus;extra=` 🎯+${precBonus} PRECISION`;}
  if(tier_==="gold"&&kw==="EXPLOSIVE"){baseDmg=synergies.explosiveChain?70:60;extra=" 💥 EXPLOSIVE";}
  if(tier_==="gold"&&kw==="RELAY"){bonus=baseDmg;extra=" 🤝 RELAY double";}
  let heal=0;
  if(tier_!=="miss"&&kw==="ENDURANCE"){heal=healAmt;extra+=` 💚+${healAmt}hp`;}
  // Affinity
  const affBonus=affinity?Math.round((baseDmg+bonus)*.5):0;
  const rallyBonus=synergies.rally&&affinity?Math.round((baseDmg+bonus)*.1):0;
  const bodyBonus=bodyAff&&tier_!=="miss"?Math.round((baseDmg+bonus)*.15):0;
  if(rallyBonus>0)extra+=" 🏟️+"+rallyBonus+" rally";
  if(bodyBonus>0)extra+=" 💪+"+bodyBonus+" body";
  return{tier:tier_,baseDmg,bonus,affBonus,rallyBonus,bodyBonus,heal,extra,total:baseDmg+bonus+affBonus+rallyBonus+bodyBonus,name,kw};
}

// ── Synergy Detection ──
function detectSynergies(team,regionId){
  const syn={rally:false,kwChains:{},paraAlliance:false,precisionChain:false,explosiveChain:false,enduranceChain:false,relayChain:false};
  // Regional Rally: 2+ spirits share region with battle region
  const regionMatches=team.filter(s=>s.regions.includes(regionId)||regionId==="la28").length;
  if(regionMatches>=2)syn.rally=true;
  // Keyword chains: 2+ spirits share a keyword
  const kwCount={};
  team.forEach(s=>s.moves.forEach(m=>{const kw=m[4];if(kw){kwCount[kw]=(kwCount[kw]||0)+1;}}));
  if(kwCount.RELAY>=2)syn.relayChain=true;
  if(kwCount.EXPLOSIVE>=2)syn.explosiveChain=true;
  if(kwCount.PRECISION>=2)syn.precisionChain=true;
  if(kwCount.ENDURANCE>=2)syn.enduranceChain=true;
  syn.kwChains=kwCount;
  // Olympic + Paralympic Alliance
  const hasOly=team.some(s=>!s.para),hasPara=team.some(s=>s.para);
  if(hasOly&&hasPara)syn.paraAlliance=true;
  return syn;
}

// ── Monte Carlo Battle Simulation ──
const SP_MAX=3;
function simulateBattle(team,monsters,numSims=1000,regionId="",bodyTop5=[]){
  let wins=0;const damages=[];
  for(let sim=0;sim<numSims;sim++){
    const ms=monsters.map(m=>({...m,hp:m.hp}));
    const ss=team.map(s=>({...s,hp:HP,sp:SP_MAX}));
    const syn=detectSynergies(team,regionId);
    let totalDmg=0,turn=0;
    while(turn<20){
      turn++;
      // Player phase: each living spirit with SP attacks random living monster
      for(const s of ss){
        if(s.hp<=0||s.sp<=0)continue;
        const liveM=ms.filter(m=>m.hp>0);if(!liveM.length)break;
        const target=liveM[Math.floor(Math.random()*liveM.length)];
        // Pick best move (highest total rate)
        const move=s.moves.reduce((a,b)=>totalRate(a)>totalRate(b)?a:b);
        const aff=s.regions.includes(regionId)||regionId==="la28";
        const bAff=bodyTop5.some(bt=>bt.sport===s.sport);
        const result=rollMove(move,aff,bAff,syn);
        let dmg=result.total;
        if(target.special==="block_weak"&&totalRate(move)<.25)dmg=0;
        target.hp-=dmg;totalDmg+=dmg;s.sp--;
        if(result.heal>0)s.hp=Math.min(HP,s.hp+result.heal);
      }
      if(ms.every(m=>m.hp<=0)){wins++;break;}
      // Monster phase
      const rnd=turn;
      for(const m of ms){
        if(m.hp<=0)continue;
        if(m.special==="regenerate")m.hp=Math.min(m.hp+10,monsters.find(x=>x.name===m.name).hp);
        const liveS=ss.filter(s=>s.hp>0);if(!liveS.length)break;
        const dmg=12+rnd*6;
        if(m.special==="aoe"){liveS.forEach(s=>{s.hp-=(10+rnd*3);});}
        else{
          let target;
          if(m.special==="hit_strongest")target=liveS.reduce((a,b)=>bestGold(a)>bestGold(b)?a:b);
          else if(m.special==="hit_weakest")target=liveS.reduce((a,b)=>a.hp<b.hp?a:b);
          else target=liveS[Math.floor(Math.random()*liveS.length)];
          target.hp-=dmg;
        }
      }
      if(ss.every(s=>s.hp<=0))break;
    }
    damages.push(totalDmg);
  }
  damages.sort((a,b)=>a-b);
  return{winRate:Math.round(wins/numSims*100),avgDmg:Math.round(damages.reduce((a,b)=>a+b,0)/numSims),damages,wins,numSims};
}

async function gemini(p){try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,messages:[{role:"user",content:p}]})});const d=await r.json();return d.content?.[0]?.text||"";}catch{return"";}}

// ── Theme ───────────────────────────────────────────────────
const T={bg:"#06080c",s1:"#0c0f16",s2:"#111620",gold:"#d4a843",gd:"#8b7530",red:"#ef4444",grn:"#22c55e",blu:"#3b82f6",pur:"#a855f7",para:"#38bdf8",txt:"#e8e0d4",dim:"#8a8278",fnt:"#3a3630",hd:"'Cinzel',serif",bd:"'Crimson Pro',Georgia,serif"};
const medalColors={gold:"#d4a843",silver:"#94a3b8",bronze:"#cd7f32",miss:"#3a3630"};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MoveBar({move}){
  const [name,g,s,b]=move;const miss=1-g-s-b;
  const data=[{n:"🥇",v:Math.round(g*100),f:medalColors.gold},{n:"🥈",v:Math.round(s*100),f:medalColors.silver},{n:"🥉",v:Math.round(b*100),f:medalColors.bronze},{n:"❌",v:Math.round(miss*100),f:medalColors.miss}];
  return(<div style={{display:"flex",height:14,borderRadius:4,overflow:"hidden",width:"100%"}}>
    {data.filter(d=>d.v>0).map((d,i)=><div key={i} title={`${d.n} ${d.v}%`} style={{width:`${d.v}%`,background:d.f,minWidth:d.v>3?undefined:2,transition:"width .3s"}}/>)}
  </div>);
}

function SpiritCard({spirit:s,compact,selected,onClick,disabled,showHp,hp:curHp,rgn,bodyMatch:bm}){
  const t=tier(s);const bc=s.para?T.para:t.c;const aff=rgn&&(s.regions.includes(rgn)||rgn==="la28");
  return(<div onClick={disabled?undefined:onClick} style={{width:compact?120:200,minHeight:compact?undefined:280,background:`linear-gradient(150deg,${T.s1},${T.s2})`,border:`2px solid ${selected?bc:bc+"44"}`,borderRadius:12,padding:compact?7:12,cursor:disabled?"default":"pointer",opacity:disabled?.3:1,transition:"all .25s",boxShadow:selected?`0 0 18px ${bc}55`:"none",position:"relative",display:"flex",flexDirection:"column",gap:compact?2:5}}>
    {s.para&&<div style={{position:"absolute",top:3,right:6,fontSize:7,color:T.para,fontFamily:T.hd,letterSpacing:2,fontWeight:700}}>MECH</div>}
    {aff&&!compact&&<div style={{position:"absolute",top:3,left:6,fontSize:7,background:T.grn+"22",color:T.grn,padding:"1px 5px",borderRadius:3,fontFamily:T.hd}}>+50%</div>}
    {bm&&!compact&&<div style={{position:"absolute",top:aff?18:3,left:6,fontSize:7,background:T.blu+"22",color:T.blu,padding:"1px 5px",borderRadius:3,fontFamily:T.hd}}>💪+15%</div>}
    <div style={{fontSize:compact?7:8,color:t.c,fontFamily:T.hd,letterSpacing:1.5,marginTop:(s.para||aff)?10:0}}>{t.n}</div>
    <div style={{fontSize:compact?12:16,marginTop:compact?0:2}}>{s.emoji} <span style={{fontFamily:T.hd,fontWeight:700,color:T.txt}}>{s.sport}</span></div>
    {!compact&&<div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{s.regions.map(r=>{const rg=REGIONS.find(x=>x.id===r);return rg?<span key={r} style={{fontSize:6,background:rg.color+"22",color:rg.color,padding:"1px 4px",borderRadius:3,fontFamily:T.bd}}>{rg.name}</span>:null;})}</div>}
    {!compact&&<div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:2,marginTop:3}}>MOVES</div>}
    {!compact&&s.moves.map((m,i)=>{const [name,g,sv,b,kw]=m;return(<div key={i} style={{marginBottom:3}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:T.txt,fontFamily:T.bd}}>{name}</span>
        <span style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>{Math.round(totalRate(m)*100)}%{kw?` ${kw==="RELAY"?"🤝":kw==="EXPLOSIVE"?"💥":kw==="ENDURANCE"?"💚":kw==="PRECISION"?"🎯":""}`:""}</span>
      </div>
      <MoveBar move={m}/>
    </div>);})}
    {compact&&<div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>{s.moves.length} moves · best: {Math.round(bestGold(s)*100)}%🥇</div>}
    {s.para&&!compact&&<div style={{fontSize:8,color:T.para,background:T.para+"12",borderRadius:4,padding:"2px 5px",textAlign:"center",fontFamily:T.bd,marginTop:2}}>⚡ ADAPT — Cancel 1 attack</div>}
    {showHp&&<div style={{marginTop:"auto",paddingTop:3}}><div style={{height:4,background:T.fnt,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(0,(curHp/HP)*100)}%`,background:curHp>HP*.3?T.grn:T.red,borderRadius:2,transition:"width .4s"}}/></div><div style={{fontSize:7,color:T.dim,textAlign:"center"}}>{curHp}/{HP}</div></div>}
  </div>);
}

const Btn=({children,onClick,color=T.gold,disabled:d,small:s})=><button disabled={d} onClick={onClick} style={{background:"transparent",border:`2px solid ${d?T.fnt:color}`,color:d?T.fnt:color,fontFamily:T.hd,fontSize:s?10:12,padding:s?"4px 10px":"8px 20px",borderRadius:7,cursor:d?"default":"pointer",letterSpacing:2,textTransform:"uppercase"}}>{children}</button>;

function USMap({atk,results,compact}){
  const rc={pacific:"#3b82f6",mountain:"#94a3b8",southwest:"#ef4444",heartland:"#eab308",south:"#22c55e",northeast:"#a855f7",capital:"#6366f1"};
  return(<svg viewBox="-5 0 600 320" style={{width:"100%",maxWidth:compact?420:540}}>
    <defs><filter id="ag"><feGaussianBlur stdDeviation="6" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="wg"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {ST.map(([ab,rg,d])=>{const ia=atk===rg,rs=results[rg],bc=rc[rg]||"#555";return <path key={ab} d={d} fill={rs==="won"?T.grn+"30":rs==="lost"?T.red+"18":ia?T.red+"35":bc+"18"} stroke={rs==="won"?T.grn+"88":rs==="lost"?T.red+"44":ia?T.red+"cc":bc+"44"} strokeWidth={ia?1.5:.5} filter={ia?"url(#ag)":rs==="won"?"url(#wg)":"none"} style={{transition:"all .5s"}}/>;})}
    {REGIONS.filter(r=>r.id!=="la28").map(r=>{const rs=results[r.id],ia=atk===r.id;return <g key={r.id}><text x={r.cx} y={r.cy} textAnchor="middle" fill={ia?T.red:rs==="won"?T.grn:rs==="lost"?T.red+"88":"#fff8"} fontSize={compact?8:10} fontFamily="Cinzel" fontWeight={700} style={{textShadow:"0 1px 4px #000a"}}>{r.name}</text>{ia&&<text x={r.cx} y={r.cy+16} textAnchor="middle" fontSize={compact?14:18}>{ROUNDS.find(x=>x.regionId===r.id)?.monsters.map(m=>m.emoji).join("")}</text>}{rs==="won"&&!ia&&<text x={r.cx} y={r.cy+14} textAnchor="middle" fontSize={10}>🛡️</text>}{rs==="lost"&&!ia&&<text x={r.cx} y={r.cy+14} textAnchor="middle" fontSize={10}>💀</text>}</g>;})}
    <circle cx={68} cy={195} r={atk==="la28"?8:5} fill={results.la28==="won"?T.grn:results.la28==="lost"?T.red:atk==="la28"?T.red:T.gold} opacity={.8}>{atk==="la28"&&<animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>}</circle>
    <text x={68} y={213} textAnchor="middle" fill={atk==="la28"?T.red:T.gold} fontSize={8} fontFamily="Cinzel" fontWeight={700}>LA28</text>
    {atk==="la28"&&<text x={68} y={183} textAnchor="middle" fontSize={16}>⚡</text>}
  </svg>);
}

// ═══════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════
function Start({go,howto,explore}){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:20,padding:20,textAlign:"center"}}>
  <div style={{fontSize:11,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>TEAM USA × DATA SCIENCE</div>
  <h1 style={{fontSize:44,fontFamily:T.hd,color:T.gold,margin:0,textShadow:`0 0 40px ${T.gold}33`}}>OLYMPUS RISING</h1>
  <p style={{fontSize:14,color:T.dim,fontFamily:T.bd,maxWidth:440,lineHeight:1.7,fontStyle:"italic"}}>Monsters attack America before LA28. Summon sport spirits — each with real event moves powered by 120 years of medal data. Study the stats. Pick the right move. Defend every region.</p>
  <USMap results={{}}/>
  <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}><Btn onClick={howto} color={T.blu}>How to Play</Btn><Btn onClick={explore} color={T.pur}>Explore Sports</Btn><Btn onClick={go}>Defend America</Btn></div>
</div>);}

function BodyQuiz({done}){
  const [unit,setUnit]=useState("imperial"); // imperial | metric
  const [ft,setFt]=useState("");const [inch,setInch]=useState("");const [cm,setCm]=useState("");
  const [lbs,setLbs]=useState("");const [kg,setKg]=useState("");
  const [results,setResults]=useState(null);

  const getH=()=>unit==="imperial"?(parseFloat(ft||0)*30.48+parseFloat(inch||0)*2.54):parseFloat(cm||0);
  const getW=()=>unit==="imperial"?(parseFloat(lbs||0)*0.4536):parseFloat(kg||0);

  const run=()=>{const h=getH(),w=getW();if(h>100&&w>20){setResults(bodyMatch(h,w));}};

  const IS={background:T.s2,border:`1px solid ${T.fnt}`,borderRadius:6,color:T.txt,fontFamily:T.bd,fontSize:16,padding:"8px 10px",width:70,textAlign:"center",outline:"none"};

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:20,padding:20,textAlign:"center"}}>
    <div style={{fontSize:11,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>BODY TYPE SCANNER</div>
    <h2 style={{fontSize:32,fontFamily:T.hd,color:T.gold,margin:0}}>Find Your Sport Match</h2>
    <p style={{fontSize:13,color:T.dim,fontFamily:T.bd,maxWidth:400,lineHeight:1.6,fontStyle:"italic"}}>
      Enter your height and weight. We'll compare you to the body types of 7,600+ Team USA Olympians across 39 sports.
    </p>

    {/* Unit toggle */}
    <div style={{display:"flex",gap:4,background:T.s1,borderRadius:8,padding:3}}>
      {["imperial","metric"].map(u=>(
        <button key={u} onClick={()=>setUnit(u)} style={{background:unit===u?T.gold+"22":"transparent",border:unit===u?`1px solid ${T.gold}`:"1px solid transparent",color:unit===u?T.gold:T.dim,fontFamily:T.hd,fontSize:11,letterSpacing:2,borderRadius:6,padding:"6px 16px",cursor:"pointer",textTransform:"uppercase"}}>{u==="imperial"?"FT / LB":"CM / KG"}</button>
      ))}
    </div>

    {/* Inputs */}
    <div style={{display:"flex",gap:16,alignItems:"flex-end",flexWrap:"wrap",justifyContent:"center"}}>
      {unit==="imperial"?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>HEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input value={ft} onChange={e=>setFt(e.target.value)} placeholder="5" style={IS} type="number" min="3" max="8"/>
            <span style={{color:T.dim,fontSize:13,fontFamily:T.bd}}>ft</span>
            <input value={inch} onChange={e=>setInch(e.target.value)} placeholder="10" style={IS} type="number" min="0" max="11"/>
            <span style={{color:T.dim,fontSize:13,fontFamily:T.bd}}>in</span>
          </div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>HEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input value={cm} onChange={e=>setCm(e.target.value)} placeholder="178" style={{...IS,width:90}} type="number" min="100" max="250"/>
            <span style={{color:T.dim,fontSize:13,fontFamily:T.bd}}>cm</span>
          </div>
        </div>
      )}
      {unit==="imperial"?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>WEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input value={lbs} onChange={e=>setLbs(e.target.value)} placeholder="160" style={{...IS,width:90}} type="number" min="50" max="500"/>
            <span style={{color:T.dim,fontSize:13,fontFamily:T.bd}}>lbs</span>
          </div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>WEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input value={kg} onChange={e=>setKg(e.target.value)} placeholder="73" style={{...IS,width:90}} type="number" min="20" max="250"/>
            <span style={{color:T.dim,fontSize:13,fontFamily:T.bd}}>kg</span>
          </div>
        </div>
      )}
    </div>

    <Btn onClick={run} color={T.gold}>Find My Sports</Btn>

    {/* Results */}
    {results&&(
      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:420,marginTop:8}}>
        <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:3,textAlign:"center"}}>YOUR TOP 5 SPORT MATCHES</div>
        {results.map((r,i)=>{
          const barCol=i===0?T.gold:i===1?"#c0c0c0":i===2?"#cd7f32":T.blu;
          return(
            <div key={r.sport} style={{background:T.s1,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,border:`1px solid ${i===0?T.gold+"44":T.fnt}`}}>
              <div style={{fontSize:28,minWidth:36,textAlign:"center"}}>{r.emoji}</div>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontFamily:T.hd,color:i===0?T.gold:T.txt,fontSize:14}}>{i===0?"🏆 ":""}{r.sport}</div>
                <div style={{fontFamily:T.bd,color:T.dim,fontSize:11,marginTop:2}}>
                  Avg: {Math.round(r.avgH)}cm / {Math.round(r.avgW)}kg · {r.n.toLocaleString()} athletes
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:50}}>
                <div style={{fontFamily:T.hd,fontSize:18,color:barCol}}>{r.pct}%</div>
                <div style={{width:40,height:4,borderRadius:2,background:T.s2,marginTop:3,overflow:"hidden"}}>
                  <div style={{width:`${r.pct}%`,height:"100%",background:barCol,borderRadius:2}}/>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{marginTop:8}}><Btn onClick={()=>done(results)}>Continue to Battle</Btn></div>
      </div>
    )}

    {!results&&<button onClick={()=>done(null)} style={{background:"none",border:"none",color:T.dim,fontFamily:T.bd,fontSize:12,cursor:"pointer",marginTop:8,textDecoration:"underline"}}>Skip →</button>}
  </div>);
}

function HowTo({back,go}){
  const B={background:T.s1,borderRadius:10,padding:14,width:"100%"};
  const H={fontFamily:T.hd,fontSize:14,color:T.gold,margin:"0 0 8px",letterSpacing:2};
  const P={fontFamily:T.bd,fontSize:12,color:T.txt,lineHeight:1.7,margin:0};
  const D={fontFamily:T.bd,fontSize:11,color:T.dim,lineHeight:1.6,margin:"4px 0 0"};
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:12,maxWidth:520,margin:"0 auto"}}>
    <div style={{fontSize:10,letterSpacing:6,color:T.gd,fontFamily:T.hd}}>HOW TO PLAY</div>
    <h2 style={{fontFamily:T.hd,color:T.gold,margin:0,fontSize:22}}>Defend America in 5 Rounds</h2>
    <div style={B}><h3 style={H}>🗺️ The Story</h3><p style={P}>Mythological monsters are draining America's Olympic spirit before LA28. You summon <span style={{color:T.gold}}>sport spirits</span> — each with real event moves — to fight back across the US map.</p></div>
    <div style={B}><h3 style={H}>🔄 Each Round</h3><p style={P}><span style={{color:T.gold}}>1. Map</span> — See which region is under attack and its signature sports.</p><p style={P}><span style={{color:T.gold}}>2. Scout</span> — Choose 1 spirit from 3. Each has unique moves from real Olympic events.</p><p style={P}><span style={{color:T.gold}}>3. Battle</span> — Pick a spirit and a move. The attack <span style={{color:T.blu}}>rolls against real medal rates</span> — 🥇 Gold = 30 dmg, 🥈 Silver = 20, 🥉 Bronze = 10, ❌ Miss = 0.</p><p style={P}><span style={{color:T.gold}}>4. Debrief</span> — AI explains what worked and teaches a data concept.</p></div>
    <div style={B}><h3 style={H}>🎲 The Medal Roll</h3><p style={P}>Each move has its own gold/silver/bronze probability from real data. A <span style={{color:medalColors.gold}}>4×100m Relay</span> might have 35% gold but 0% silver — huge hit or total miss. A <span style={{color:medalColors.silver}}>200m Backstroke</span> has 12% each — consistent but rarely spectacular.</p><p style={D}>You're learning probability by choosing which move to use!</p></div>
    <div style={B}><h3 style={H}>✨ Move Keywords</h3>
      <p style={P}>🤝 <span style={{color:T.gold}}>RELAY</span> — On 🥇 gold, damage doubles (team power)</p>
      <p style={P}>💥 <span style={{color:T.gold}}>EXPLOSIVE</span> — On 🥇 gold, deals 60 instead of 30</p>
      <p style={P}>🎯 <span style={{color:T.gold}}>PRECISION</span> — On 🥇 or 🥈, +10 bonus damage</p>
      <p style={P}>💚 <span style={{color:T.gold}}>ENDURANCE</span> — On any hit, heals your spirit 8 HP</p>
    </div>
    <div style={B}><h3 style={H}>🌟 Regional Affinity</h3><p style={P}>Cards matching the attacked region deal <span style={{color:T.grn}}>+50% damage</span>. Swimming dominates the Pacific. Wrestling owns the Heartland. Check the region tags!</p></div>
    <div style={{...B,borderColor:T.para+"33"}}><h3 style={{...H,color:T.para}}>⚡ Paralympic Mech Warriors</h3><p style={P}>Paralympic spirits have <span style={{color:T.para}}>ADAPT</span> — activate once per game to cancel a monster's attack entirely. Many Para moves have high gold rates, making them elite strikers <em>and</em> clutch defenders.</p></div>
    <div style={B}><h3 style={H}>👹 The Monsters</h3>
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr",gap:"4px 6px",marginTop:4}}>
        <span>🌊</span><p style={D}><strong>Scylla</strong> — Standard fight. Learn the ropes.</p>
        <span>🐂</span><p style={D}><strong>Minotaur</strong> — Targets your strongest spirit first.</p>
        <span>🦁</span><p style={D}><strong>Chimera</strong> — Weakness shifts each turn.</p>
        <span>🐺</span><p style={D}><strong>Cerberus</strong> — Blocks moves with &lt;25% total hit rate.</p>
        <span>⚡</span><p style={D}><strong>Typhon</strong> — Double damage. ADAPT saves lives.</p>
      </div>
    </div>
    <div style={{display:"flex",gap:12,marginTop:4}}><Btn onClick={back} color={T.dim}>Back</Btn><Btn onClick={go}>Start Game</Btn></div>
  </div>);
}

// ── Explorer Mode ──────────────────────────────────────────
const WINTER_SPORTS=new Set(["Alpine Skiing","Ice Hockey","Snowboarding","Figure Skating","Speed Skating","Freestyle Skiing","Para Alpine","Para Nordic"]);
const PARA_SPORTS=new Set(SPIRITS.filter(s=>s.para).map(s=>s.sport));

function Explorer({back}){
  const [sel,setSel]=useState(null); // selected sport id
  const [filter,setFilter]=useState("all"); // all|summer|winter|para
  const filtered=SPIRITS.filter(s=>{
    if(filter==="winter")return WINTER_SPORTS.has(s.sport);
    if(filter==="para")return s.para;
    if(filter==="summer")return !s.para&&!WINTER_SPORTS.has(s.sport);
    return true;
  });
  const spirit=sel?SPIRITS.find(s=>s.id===sel):null;
  const stats=spirit?sportStatsData[spirit.sport]:null;
  const body=spirit?SPORT_BODY_TYPES.find(b=>b.sport===spirit.sport):null;

  if(spirit&&stats) return <SportDetail spirit={spirit} stats={stats} body={body} back={()=>setSel(null)}/>;

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:14,maxWidth:600,margin:"0 auto"}}>
    <div style={{fontSize:11,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>SPORT EXPLORER</div>
    <h2 style={{fontSize:24,fontFamily:T.hd,color:T.gold,margin:0}}>Browse All Spirits</h2>
    <p style={{fontSize:12,color:T.dim,fontFamily:T.bd,fontStyle:"italic"}}>Study the stats. Know your sports. Win the trivia.</p>
    {/* Filter tabs */}
    <div style={{display:"flex",gap:4,background:T.s1,borderRadius:8,padding:3}}>
      {[["all","All ("+SPIRITS.length+")"],["summer","Summer"],["winter","Winter"],["para","Paralympic"]].map(([k,label])=>(
        <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?T.gold+"22":"transparent",border:filter===k?`1px solid ${T.gold}`:"1px solid transparent",color:filter===k?T.gold:T.dim,fontFamily:T.hd,fontSize:9,letterSpacing:1,borderRadius:5,padding:"5px 12px",cursor:"pointer"}}>{label}</button>
      ))}
    </div>
    {/* Sport grid */}
    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
      {filtered.map(s=>{
        const st=sportStatsData[s.sport];
        const medals=st?(st.totalMedals.gold+st.totalMedals.silver+st.totalMedals.bronze):0;
        return(<div key={s.id} onClick={()=>setSel(s.id)} style={{width:140,background:`linear-gradient(150deg,${T.s1},${T.s2})`,border:`1px solid ${T.fnt}`,borderRadius:10,padding:10,cursor:"pointer",transition:"all .2s",display:"flex",flexDirection:"column",gap:4}}>
          <div style={{fontSize:24,textAlign:"center"}}>{s.emoji}</div>
          <div style={{fontFamily:T.hd,fontSize:11,color:T.txt,textAlign:"center"}}>{s.sport}</div>
          <div style={{display:"flex",justifyContent:"center",gap:6,fontSize:9,fontFamily:T.bd}}>
            {medals>0&&<span style={{color:T.gold}}>🏅{medals}</span>}
            {st?.la28&&<span style={{color:T.grn}}>LA28</span>}
          </div>
          {s.para&&<div style={{fontSize:7,color:T.para,textAlign:"center",fontFamily:T.hd}}>PARALYMPIC</div>}
        </div>);
      })}
    </div>
    <Btn onClick={back} color={T.dim}>Back to Menu</Btn>
  </div>);
}

function SportDetail({spirit,stats,body,back}){
  const t=tier(spirit);
  const decadeData=Object.entries(stats.medalsByDecade||{}).map(([dec,v])=>({decade:dec+"s",gold:v[0],silver:v[1],bronze:v[2]}));
  const totalMedals=stats.totalMedals.gold+stats.totalMedals.silver+stats.totalMedals.bronze;
  const genderTotal=(stats.gender.Male||0)+(stats.gender.Female||0);
  const femalePct=genderTotal>0?Math.round((stats.gender.Female||0)/genderTotal*100):null;
  const B={background:T.s1,borderRadius:10,padding:14,width:"100%"};
  const H={fontFamily:T.hd,fontSize:13,color:T.gold,margin:"0 0 8px",letterSpacing:2};

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:12,maxWidth:540,margin:"0 auto"}}>
    {/* Header */}
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:48}}>{spirit.emoji}</div>
      <h2 style={{fontFamily:T.hd,fontSize:26,color:T.gold,margin:"4px 0"}}>{spirit.sport}</h2>
      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:9,background:t.c+"22",color:t.c,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>{t.n}</span>
        <span style={{fontSize:9,background:T.blu+"22",color:T.blu,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>{stats.season}</span>
        {stats.la28&&<span style={{fontSize:9,background:T.grn+"22",color:T.grn,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>{stats.isNew?"NEW AT LA28":"IN LA28"}</span>}
        {spirit.para&&<span style={{fontSize:9,background:T.para+"22",color:T.para,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>PARALYMPIC</span>}
      </div>
    </div>

    {/* Fun fact */}
    <div style={{...B,borderColor:T.gold+"33",border:`1px solid ${T.gold}33`}}>
      <p style={{fontFamily:T.bd,fontSize:13,color:T.txt,lineHeight:1.7,margin:0,fontStyle:"italic"}}>💡 {stats.funFact}</p>
    </div>

    {/* Medal summary */}
    <div style={B}>
      <div style={H}>🏅 MEDAL COUNT</div>
      <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:medalColors.gold}}>{stats.totalMedals.gold}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>🥇 Gold</div></div>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:medalColors.silver}}>{stats.totalMedals.silver}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>🥈 Silver</div></div>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:medalColors.bronze}}>{stats.totalMedals.bronze}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>🥉 Bronze</div></div>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:T.txt}}>{totalMedals}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Total</div></div>
      </div>
    </div>

    {/* Medal trend chart */}
    {decadeData.length>0&&<div style={B}>
      <div style={H}>📈 MEDALS BY DECADE</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={decadeData} margin={{top:5,right:5,bottom:5,left:-20}}>
          <XAxis dataKey="decade" tick={{fontSize:9,fill:T.dim,fontFamily:"Crimson Pro"}} axisLine={{stroke:T.fnt}} tickLine={false}/>
          <YAxis tick={{fontSize:9,fill:T.dim}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:T.s2,border:`1px solid ${T.fnt}`,borderRadius:6,fontFamily:"Crimson Pro",fontSize:11}} labelStyle={{color:T.gold,fontFamily:"Cinzel"}}/>
          <Bar dataKey="gold" stackId="a" fill={medalColors.gold} radius={[0,0,0,0]}/>
          <Bar dataKey="silver" stackId="a" fill={medalColors.silver}/>
          <Bar dataKey="bronze" stackId="a" fill={medalColors.bronze} radius={[2,2,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>}

    {/* Top events */}
    {stats.topEvents.length>0&&<div style={B}>
      <div style={H}>⚔️ TOP EVENTS (by gold rate)</div>
      {stats.topEvents.map((ev,i)=>(
        <div key={ev.name} style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:T.txt,fontFamily:T.bd}}>{i===0?"🏆 ":""}{ev.name}</span>
            <span style={{fontSize:10,color:T.dim,fontFamily:T.bd}}>{Math.min(100,Math.round((ev.gold+ev.silver+ev.bronze)*100))}% hit</span>
          </div>
          <MoveBar move={[ev.name,ev.gold,ev.silver,ev.bronze,null]}/>
        </div>
      ))}
    </div>}

    {/* Body profile */}
    {body&&<div style={B}>
      <div style={H}>📏 ATHLETE BODY PROFILE</div>
      <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
        <div><div style={{fontSize:20,fontFamily:T.hd,color:T.txt}}>{body.avgH}<span style={{fontSize:11,color:T.dim}}>cm</span></div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Avg Height</div></div>
        <div><div style={{fontSize:20,fontFamily:T.hd,color:T.txt}}>{body.avgW}<span style={{fontSize:11,color:T.dim}}>kg</span></div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Avg Weight</div></div>
        <div><div style={{fontSize:20,fontFamily:T.hd,color:T.txt}}>{body.n.toLocaleString()}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Athletes</div></div>
      </div>
    </div>}

    {/* Regional strongholds */}
    <div style={B}>
      <div style={H}>🗺️ REGIONAL STRONGHOLDS</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
        {spirit.regions.map(r=>{const rg=REGIONS.find(x=>x.id===r);return rg?<span key={r} style={{fontSize:10,background:rg.color+"22",color:rg.color,padding:"3px 10px",borderRadius:5,fontFamily:T.bd}}>{rg.name}</span>:null;})}
      </div>
    </div>

    {/* Gender split */}
    {femalePct!==null&&<div style={B}>
      <div style={H}>👥 GENDER PARTICIPATION</div>
      <div style={{display:"flex",height:16,borderRadius:4,overflow:"hidden",width:"100%"}}>
        <div style={{width:`${100-femalePct}%`,background:T.blu,transition:"width .3s"}}/>
        <div style={{width:`${femalePct}%`,background:T.pur,transition:"width .3s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.dim,fontFamily:T.bd,marginTop:4}}>
        <span style={{color:T.blu}}>♂ {100-femalePct}% Male</span>
        <span style={{color:T.pur}}>♀ {femalePct}% Female</span>
      </div>
    </div>}

    {/* Quick stats */}
    <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
      {stats.firstYear&&<div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:14,fontFamily:T.hd,color:T.txt}}>{stats.firstYear}</div><div style={{fontSize:8,color:T.dim,fontFamily:T.bd}}>First Olympics</div></div>}
      <div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:14,fontFamily:T.hd,color:T.txt}}>{stats.gamesCount}</div><div style={{fontSize:8,color:T.dim,fontFamily:T.bd}}>Games</div></div>
      <div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:14,fontFamily:T.hd,color:T.txt}}>{stats.eventCount}</div><div style={{fontSize:8,color:T.dim,fontFamily:T.bd}}>Events</div></div>
      <div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:14,fontFamily:T.hd,color:T.txt}}>{stats.totalAthletes.toLocaleString()}</div><div style={{fontSize:8,color:T.dim,fontFamily:T.bd}}>Athletes</div></div>
    </div>

    <Btn onClick={back} color={T.dim}>Back to All Sports</Btn>
  </div>);
}

function MapScr({round,rd,results,go}){
  const rg=REGIONS.find(r=>r.id===rd.regionId);
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:16,gap:12}}>
    <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:4}}>ROUND {round} OF 5</div>
    <USMap atk={rd.regionId} results={results}/>
    <div style={{background:T.s1,border:`1px solid ${T.red}33`,borderRadius:12,padding:14,maxWidth:400,width:"100%",textAlign:"center"}}>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:4}}>
        {rd.monsters.map(m=><span key={m.name} style={{fontSize:28}}>{m.emoji}</span>)}
      </div>
      <div style={{fontFamily:T.hd,fontSize:18,color:T.red}}>{rd.monsters.map(m=>m.name).join(" & ")}</div>
      {rd.monsters.map(m=><div key={m.name} style={{fontFamily:T.bd,fontSize:10,color:T.dim,fontStyle:"italic",margin:"2px 0"}}>{m.emoji} {m.name} ({m.hp} HP) — {m.desc}</div>)}
      <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center",marginTop:5}}>{rg.sports.slice(0,5).map(s=><span key={s} style={{fontSize:8,background:rg.color+"22",color:rg.color,padding:"1px 6px",borderRadius:3,fontFamily:T.bd}}>{s}</span>)}</div>
      <div style={{fontSize:10,color:T.grn,fontFamily:T.bd,marginTop:6}}>Draft a team of 3 spirits · Matching regions deal <strong>+50% damage</strong></div>
    </div>
    <Btn onClick={go}>Draft Your Team</Btn>
  </div>);
}

function Scout({opts,lockIn,round,rgn,bodyTop5=[]}){
  const [sel,setSel]=useState(new Set());
  const [exp,setExp]=useState(null);
  const [ins,setIns]=useState({});const [ld,setLd]=useState({});
  const rg=REGIONS.find(r=>r.id===rgn);
  const toggle=s=>{setSel(p=>{const n=new Set(p);if(n.has(s.id))n.delete(s.id);else if(n.size<3)n.add(s.id);return n;});};
  const explore=async s=>{if(exp===s.id){setExp(null);return;}setExp(s.id);if(!ins[s.id]){setLd(p=>({...p,[s.id]:true}));const best=s.moves.reduce((a,b)=>b[1]>a[1]?b:a);const aff=s.regions.includes(rgn)||rgn==="la28";const t=await gemini(`Oracle in Team USA card game. Spirit: "${s.sport}" (${s.para?"Paralympic":"Olympic"}) with ${s.moves.length} event moves. Best move: "${best[0]}" has ${Math.round(best[1]*100)}% gold rate. ${aff?"+50% affinity with "+rg?.name+".":""} 2 sentences for a 12-year-old: what the gold rate means in real life, one cool fact about this sport in Team USA history. Brief, exciting.`);setIns(p=>({...p,[s.id]:t||`${s.sport} has ${s.moves.length} moves. Best gold rate: ${Math.round(best[1]*100)}%. ${aff?"Strong here!":"A solid pick."}`}));setLd(p=>({...p,[s.id]:false}));}};
  const team=opts.filter(s=>sel.has(s.id));
  const syn=team.length===3?detectSynergies(team,rgn):null;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:16,gap:12}}>
    <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:4}}>ROUND {round} — DRAFT YOUR TEAM</div>
    <h2 style={{fontFamily:T.hd,color:T.gold,margin:0,fontSize:20}}>Pick 3 of 5 Spirits</h2>
    <p style={{fontFamily:T.bd,color:T.dim,fontSize:11}}>Defending <span style={{color:rg?.color,fontWeight:700}}>{rg?.name}</span> · Tap cards to draft · Tap Explore to study</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",alignItems:"flex-start"}}>
      {opts.map(s=>{const picked=sel.has(s.id);return(<div key={s.id} style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center"}}>
        <div onClick={()=>toggle(s)} style={{cursor:"pointer",opacity:!picked&&sel.size>=3?.4:1,transition:"all .2s"}}>
          <SpiritCard spirit={s} rgn={rgn} selected={picked} bodyMatch={bodyTop5.some(b=>b.sport===s.sport)}/>
        </div>
        <Btn small onClick={()=>explore(s)} color={exp===s.id?T.grn:T.blu}>{exp===s.id?"Close":"🔍 Explore"}</Btn>
        {exp===s.id&&<div style={{background:T.s1,border:`1px solid ${T.blu}22`,borderRadius:8,padding:10,width:200}}>
          <div style={{fontFamily:T.bd,fontSize:11,color:T.txt,lineHeight:1.6}}>{ld[s.id]?<span style={{color:T.dim}}>Oracle speaks...</span>:ins[s.id]}</div>
        </div>}
      </div>);})}
    </div>
    {/* Synergy preview */}
    {syn&&<div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
      {syn.rally&&<span style={{fontSize:9,background:T.grn+"22",color:T.grn,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>🏟️ REGIONAL RALLY +10%</span>}
      {syn.relayChain&&<span style={{fontSize:9,background:T.gold+"22",color:T.gold,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>🤝 RELAY CHAIN</span>}
      {syn.explosiveChain&&<span style={{fontSize:9,background:T.red+"22",color:T.red,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>💥 EXPLOSIVE CHAIN</span>}
      {syn.precisionChain&&<span style={{fontSize:9,background:T.blu+"22",color:T.blu,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>🎯 PRECISION CHAIN</span>}
      {syn.enduranceChain&&<span style={{fontSize:9,background:T.grn+"22",color:T.grn,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>💚 ENDURANCE CHAIN</span>}
      {syn.paraAlliance&&<span style={{fontSize:9,background:T.para+"22",color:T.para,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>⚡ PARA ALLIANCE</span>}
    </div>}
    <Btn onClick={()=>lockIn(team)} disabled={sel.size!==3} color={T.gold}>Lock In Team ({sel.size}/3)</Btn>
  </div>);
}

// ── Trivia fallback bank ──
const TRIVIA_BANK=[
  {cat:"team",q:"How many total Olympic gold medals has Team USA won across all Summer Games?",c:["Over 1,000","Over 500","Over 2,500","Over 300"],a:0},
  {cat:"team",q:"Which Summer Olympics did the USA first compete in?",c:["1896 Athens","1900 Paris","1904 St. Louis","1908 London"],a:0},
  {cat:"team",q:"In which sport has Team USA won the most Olympic medals overall?",c:["Track & Field","Swimming","Gymnastics","Basketball"],a:0},
  {cat:"water",q:"How many lanes does an Olympic swimming pool have?",c:["8","6","10","12"],a:0},
  {cat:"water",q:"What is the length of an Olympic swimming pool in meters?",c:["50 meters","25 meters","100 meters","75 meters"],a:0},
  {cat:"water",q:"In water polo, how long is each quarter?",c:["8 minutes","10 minutes","12 minutes","15 minutes"],a:0},
  {cat:"individual",q:"How many events make up a decathlon in Track & Field?",c:["10","8","12","7"],a:0},
  {cat:"individual",q:"What is a perfect score in Olympic gymnastics?",c:["10.0","100","9.9","15.0"],a:0},
  {cat:"individual",q:"In Olympic fencing, how many touches win a bout in direct elimination?",c:["15","10","5","21"],a:0},
  {cat:"individual",q:"What distance is the Olympic marathon?",c:["26.2 miles","25 miles","30 kilometers","20 miles"],a:0},
  {cat:"combat",q:"How many weight classes are there in Olympic boxing?",c:["13","8","10","16"],a:0},
  {cat:"combat",q:"Which martial art was added to the Olympics most recently?",c:["Karate (2020)","Taekwondo (2000)","Judo (1964)","Wrestling (1896)"],a:0},
  {cat:"winter",q:"How fast can Olympic bobsleds travel?",c:["Over 90 mph","Over 60 mph","Over 120 mph","Over 40 mph"],a:0},
  {cat:"winter",q:"How many players are on an ice hockey team on the ice at once?",c:["6","5","7","4"],a:0},
  {cat:"winter",q:"In figure skating, what is a 'triple axel'?",c:["3.5 rotation jump","3 rotation jump","A spin move","A footwork sequence"],a:0},
  {cat:"para",q:"When were the first Paralympic Games held?",c:["1960 Rome","1948 London","1976 Toronto","1988 Seoul"],a:0},
  {cat:"para",q:"What does the 'Para' in Paralympics originally refer to?",c:["Parallel (to Olympics)","Paraplegic","Paramount","Participation"],a:0},
  {cat:"para",q:"In wheelchair rugby, what shape is the ball?",c:["Round (volleyball)","Oval (rugby)","Round (basketball)","Pointed (football)"],a:0},
  {cat:"ball",q:"How many consecutive Olympic gold medals has the US women's basketball team won?",c:["8","5","6","10"],a:0},
  {cat:"ball",q:"What sport will debut at the LA28 Olympics as an American invention?",c:["Flag Football","Baseball","Lacrosse","Cricket"],a:0},
];
const SPORT_CATS={"Swimming":"water","Diving":"water","Water Polo":"water","Surfing":"water","Sailing":"water","Para Swimming":"water","Track & Field":"individual","Gymnastics":"individual","Fencing":"individual","Archery":"individual","Cycling":"individual","Triathlon":"individual","Modern Pentathlon":"individual","Table Tennis":"individual","Golf":"individual","Sport Climbing":"individual","Weightlifting":"individual","Speed Skating":"individual","Figure Skating":"individual","Freestyle Skiing":"individual","Skateboarding":"individual","Snowboarding":"individual","Alpine Skiing":"individual","Boxing":"combat","Wrestling":"combat","Judo":"combat","Taekwondo":"combat","Basketball":"ball","Volleyball":"ball","Baseball":"ball","Softball":"ball","Rugby Sevens":"ball","Flag Football":"ball","Ice Hockey":"winter","Sled Hockey":"winter","Para Alpine":"para","Para Nordic":"para","Para Track & Field":"para","Para Cycling":"para","Wheelchair Rugby":"para","Wheelchair Basketball":"para","Sitting Volleyball":"para","Goalball":"para","Para Archery":"para","Para Powerlifting":"para","Para Triathlon":"para","Wheelchair Tennis":"para"};

function Trivia({spirit,onComplete}){
  const [qData,setQData]=useState(null);
  const [sel,setSel]=useState(null);
  const [loading,setLoading]=useState(true);

  const getFallback=()=>{
    const cat=SPORT_CATS[spirit.sport]||"team";
    const pool=TRIVIA_BANK.filter(q=>q.cat===cat||q.cat==="team");
    return pool[Math.floor(Math.random()*pool.length)];
  };

  useEffect(()=>{
    let cancelled=false;
    const timeout=setTimeout(()=>{if(!cancelled&&!qData){const fb=getFallback();setQData(fb);setLoading(false);}},8000);
    (async()=>{
      const raw=await gemini(`You are a trivia generator for a Team USA Olympic education game. Generate ONE trivia question about the sport "${spirit.sport}".
RULES:
- NEVER mention any individual athlete by name
- Only ask about: sport rules, equipment, scoring, Team USA team-level achievements, Olympic history of this sport, or general facts
- Make it fun and educational for a 12-year-old
Return ONLY valid JSON, no other text: {"q":"the question","c":["choice A","choice B","choice C","choice D"],"a":0}
where "a" is the 0-based index of the correct answer.`);
      if(cancelled)return;clearTimeout(timeout);
      try{
        const j=JSON.parse(raw.replace(/```json\n?/g,"").replace(/```/g,"").trim());
        if(j.q&&j.c&&j.c.length===4&&typeof j.a==="number"){setQData(j);setLoading(false);return;}
      }catch{}
      const fb=getFallback();setQData(fb);setLoading(false);
    })();
    return()=>{cancelled=true;clearTimeout(timeout);};
  },[]);

  const correct=sel!==null&&sel===qData?.a;
  const wrong=sel!==null&&sel!==qData?.a;

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16,padding:20,textAlign:"center"}}>
    <div style={{fontSize:11,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>ORACLE'S TRIAL</div>
    <div style={{fontSize:28}}>{spirit.emoji}</div>
    <h2 style={{fontSize:22,fontFamily:T.hd,color:T.gold,margin:0}}>{spirit.sport}</h2>

    {loading?(
      <div style={{fontFamily:T.bd,color:T.dim,fontStyle:"italic",fontSize:14,marginTop:20}}>The Oracle prepares a trial...</div>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:440,marginTop:8}}>
        <p style={{fontFamily:T.bd,color:T.txt,fontSize:15,lineHeight:1.6}}>{qData.q}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {qData.c.map((choice,i)=>{
            const isCorrect=i===qData.a;const isSel=sel===i;
            const bg=sel===null?T.s1:isCorrect?T.grn+"22":isSel?T.red+"22":T.s1;
            const border=sel===null?T.fnt:isCorrect?T.grn:isSel?T.red:T.fnt;
            return(<button key={i} onClick={()=>{if(sel===null)setSel(i);}} style={{background:bg,border:`1px solid ${border}`,borderRadius:8,padding:"10px 14px",cursor:sel===null?"pointer":"default",textAlign:"left",fontFamily:T.bd,fontSize:13,color:isCorrect&&sel!==null?T.grn:isSel&&wrong?T.red:T.txt,transition:"all .2s"}}>
              <span style={{fontFamily:T.hd,color:T.gd,marginRight:8}}>{String.fromCharCode(65+i)}.</span>{choice}
              {sel!==null&&isCorrect&&" ✓"}
            </button>);
          })}
        </div>

        {sel!==null&&(
          <div style={{fontFamily:T.bd,fontSize:13,color:correct?T.grn:T.red,fontStyle:"italic",marginTop:4}}>
            {correct?"The Oracle approves! Knowledge is power.":"The Oracle shakes its head... but now you know!"}
          </div>
        )}

        {sel!==null&&<Btn onClick={onComplete}>Continue to Battle</Btn>}
      </div>
    )}

    <button onClick={onComplete} style={{background:"none",border:"none",color:T.dim,fontFamily:T.bd,fontSize:11,cursor:"pointer",textDecoration:"underline",marginTop:8}}>Skip trivia →</button>
  </div>);
}

function Battle({monsters:initMonsters,team,rgn,finish,round,bodyTop5=[]}){
  const syn=detectSynergies(team,rgn);
  const [ms,setMs]=useState(initMonsters.map(m=>({...m,maxHp:m.hp})));
  const [spirits,setSpirits]=useState(team.map(s=>({...s,hp:HP,sp:SP_MAX,au:false,ac:false})));
  const [activeIdx,setActiveIdx]=useState(0); // which spirit is acting (0,1,2)
  const [selMove,setSelMove]=useState(null);
  const [selTarget,setSelTarget]=useState(0); // which monster to target
  const [log,setLog]=useState([`${initMonsters.map(m=>m.emoji+" "+m.name).join(" & ")} attack${initMonsters.length>1?"":"s"} ${REGIONS.find(r=>r.id===rgn)?.name}!`]);
  const [ph,setPh]=useState("player"); // player | monster | done
  const [turn,setTurn]=useState(1);
  const [chiWeakness,setChiWeakness]=useState("gold"); // for Chimera
  const lr=useRef(null);
  useEffect(()=>{lr.current&&(lr.current.scrollTop=lr.current.scrollHeight);},[log]);

  // Find next living spirit with SP, or null
  const nextActive=(ns,fromIdx)=>{for(let i=fromIdx;i<ns.length;i++){if(ns[i].hp>0)return i;}return null;};
  const liveMonsters=ms.filter(m=>m.hp>0);

  const doAttack=()=>{
    if(selMove==null)return;
    const s=spirits[activeIdx];
    const isRest=selMove==="rest";
    const move=isRest?null:s.moves[selMove];
    const target=ms[selTarget];
    let nl=[],nm=[...ms],ns=spirits.map(x=>({...x}));

    if(isRest){
      ns[activeIdx].hp=Math.min(HP,ns[activeIdx].hp+5);
      nl.push(`${s.emoji} ${s.sport} rests and heals 5 HP.`);
    }else{
      ns[activeIdx].sp--;
      const anyBlock=target.special==="block_weak"&&totalRate(move)<.25;
      if(anyBlock){
        nl.push(`🚫 ${move[0]} blocked by ${target.name}! Hit rate too low.`);
      }else{
        const aff=s.regions.includes(rgn)||rgn==="la28";
        const bAff=bodyTop5.some(b=>b.sport===s.sport);
        const result=rollMove(move,aff,bAff,syn);
        // Chimera weakness bonus
        let chiBonus=0;
        if(target.special==="shift_weakness"&&result.tier===chiWeakness&&result.tier!=="miss"){chiBonus=Math.round(result.total*.5);nl.push(`🎯 Matched ${target.name}'s weakness! +${chiBonus} dmg`);}
        const emoji=result.tier==="gold"?"🥇":result.tier==="silver"?"🥈":result.tier==="bronze"?"🥉":"❌";
        if(result.tier==="miss"){
          nl.push(`${s.emoji} ${s.sport} → ${move[0]} → ${emoji} MISS!`);
        }else{
          const totalDmg=result.total+chiBonus;
          const ti=ms.findIndex(x=>x.name===target.name);
          nm[ti]={...nm[ti],hp:Math.max(0,nm[ti].hp-totalDmg)};
          nl.push(`${s.emoji} ${s.sport} → ${move[0]} → ${emoji} ${result.tier.toUpperCase()} ${totalDmg} dmg!${result.extra}`);
          if(nm[ti].hp<=0)nl.push(`🏆 ${nm[ti].name} defeated!`);
        }
        if(result.heal>0){ns[activeIdx].hp=Math.min(HP,ns[activeIdx].hp+result.heal);}
      }
    }

    // Advance to next spirit or start monster phase
    const nxt=nextActive(ns,activeIdx+1);
    setMs(nm);setSpirits(ns);setLog(p=>[...p,...nl]);setSelMove(null);

    if(nm.every(m=>m.hp<=0)){setLog(p=>[...p,"🏆 All monsters defeated! VICTORY!"]);setPh("done");setMs(nm);setSpirits(ns);return;}
    if(nxt!=null){setActiveIdx(nxt);setSelTarget(nm.findIndex(m=>m.hp>0));}
    else{
      // Monster phase
      let ml=[],ns2=ns.map(x=>({...x})),nm2=[...nm];
      for(let mi=0;mi<nm2.length;mi++){
        const mon=nm2[mi];if(mon.hp<=0)continue;
        // Regenerate
        if(mon.special==="regenerate"){const orig=initMonsters[mi].hp;const healed=Math.min(orig,mon.hp+10);const gain=healed-mon.hp;nm2[mi]={...nm2[mi],hp:healed};if(gain>0)ml.push(`🐍 ${mon.name} regenerates ${gain} HP!`);}
        // Attack
        const liveS=ns2.map((x,i)=>({...x,_i:i})).filter(x=>x.hp>0);
        if(!liveS.length)break;
        const dmg=12+round*6;
        if(mon.special==="aoe"){
          const aoeD=10+round*3;
          // Check ADAPT
          const adapted=syn.paraAlliance?ns2.find(x=>x.au&&!x.ac&&x.hp>0):ns2.find(x=>x.au&&!x.ac&&x.hp>0&&x.para);
          if(adapted){ml.push(`⚡ ${adapted.sport} ADAPT shields the team from ${mon.name}!`);ns2=ns2.map(x=>x.id===adapted.id?{...x,ac:true}:x);}
          else{liveS.forEach(x=>{ns2[x._i]={...ns2[x._i],hp:Math.max(0,ns2[x._i].hp-aoeD)};});ml.push(`${mon.emoji} ${mon.name} hits ALL spirits for ${aoeD} each!`);
          ns2.filter(x=>x.hp<=0).forEach(x=>{if(spirits.find(s=>s.id===x.id)?.hp>0)ml.push(`💀 ${x.sport} exhausted!`);});}
        }else{
          let target;
          if(mon.special==="hit_strongest")target=liveS.reduce((a,b)=>bestGold(a)>bestGold(b)?a:b);
          else if(mon.special==="hit_weakest")target=liveS.reduce((a,b)=>a.hp<b.hp?a:b);
          else target=liveS[Math.floor(Math.random()*liveS.length)];
          // Check ADAPT
          const adapted=syn.paraAlliance?ns2.find(x=>x.au&&!x.ac&&x.hp>0):ns2.find(x=>x.au&&!x.ac&&x.hp>0&&x.para);
          if(adapted){ml.push(`⚡ ${adapted.sport} ADAPT absorbs ${mon.name}'s blow!`);ns2=ns2.map(x=>x.id===adapted.id?{...x,ac:true}:x);}
          else{ns2[target._i]={...ns2[target._i],hp:Math.max(0,ns2[target._i].hp-dmg)};ml.push(`${mon.emoji} ${mon.name} hits ${target.sport} for ${dmg}!`);if(ns2[target._i].hp<=0)ml.push(`💀 ${target.sport} exhausted!`);}
        }
        // Chimera weakness shift
        if(mon.special==="shift_weakness"){const cycle=["gold","silver","bronze"];setChiWeakness(p=>cycle[(cycle.indexOf(p)+1)%3]);ml.push(`🔄 ${mon.name} shifts weakness to ${["gold","silver","bronze"][(["gold","silver","bronze"].indexOf(chiWeakness)+1)%3]}!`);}
      }
      setMs(nm2);setSpirits(ns2);setLog(p=>[...p,"─── Monster Phase ───",...ml]);
      if(ns2.every(x=>x.hp<=0)){setLog(p=>[...p,...ml,"💀 All spirits exhausted..."]);setPh("done");}
      else{setTurn(t=>t+1);const nxtS=nextActive(ns2,0);setActiveIdx(nxtS||0);setSelTarget(nm2.findIndex(m=>m.hp>0));setPh("player");}
    }
  };

  const active=spirits[activeIdx];
  const won=ms.every(m=>m.hp<=0);

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:12,gap:8,maxWidth:640,margin:"0 auto"}}>
    <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:4}}>ROUND {round} — BATTLE · TURN {turn}</div>
    {/* Monsters */}
    {ms.map((m,i)=>(<div key={m.name} style={{background:T.s1,border:`1px solid ${m.hp>0?T.red+"33":T.fnt}`,borderRadius:10,padding:8,width:"100%",opacity:m.hp<=0?.4:1,display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:22}}>{m.emoji}</span>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:T.hd,fontSize:13,color:m.hp>0?T.red:T.dim}}>{m.name}</span>
          <span style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>{Math.max(0,m.hp)}/{m.maxHp}</span>
        </div>
        <div style={{height:6,background:T.fnt,borderRadius:3,overflow:"hidden",marginTop:3}}><div style={{height:"100%",width:`${Math.max(0,(m.hp/m.maxHp)*100)}%`,background:`linear-gradient(90deg,${T.red},#f97316)`,transition:"width .4s",borderRadius:3}}/></div>
        <div style={{fontSize:8,color:T.dim,fontFamily:T.bd,marginTop:2}}>{m.desc}{m.special==="shift_weakness"?` (Weak to: ${chiWeakness})`:""}</div>
      </div>
    </div>))}
    {/* Log */}
    <div ref={lr} style={{background:T.s2,borderRadius:8,padding:6,width:"100%",maxHeight:100,overflowY:"auto",fontFamily:T.bd,fontSize:10,color:T.dim,lineHeight:1.7}}>
      {log.map((l,i)=><div key={i} style={{color:l.includes("🏆")?T.gold:l.includes("💀")?T.red:l.includes("🥇")?medalColors.gold:l.includes("🥈")?medalColors.silver:l.includes("🥉")?medalColors.bronze:l.includes("🌟")||l.includes("🏟️")?T.grn:l.includes("⚡")?T.para:l.startsWith("───")?T.fnt:T.dim}}>{l}</div>)}
    </div>
    {/* Spirits */}
    <div style={{fontSize:8,color:T.dim,fontFamily:T.hd,letterSpacing:3}}>
      {ph==="done"?(won?"VICTORY":"DEFEAT"):`${active?.sport||""}'s TURN — PICK A MOVE`}
    </div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
      {spirits.map((s,i)=>(<div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <div style={{opacity:ph!=="done"&&i!==activeIdx?.5:1,transition:"opacity .2s"}}>
          <SpiritCard spirit={s} compact selected={i===activeIdx} disabled={s.hp<=0||ph==="done"} showHp hp={s.hp} rgn={rgn}/>
        </div>
        <div style={{display:"flex",gap:2}}>{Array.from({length:SP_MAX},(_, j)=><span key={j} style={{fontSize:8,color:j<s.sp?T.gold:T.fnt}}>●</span>)}</div>
        {s.para&&!s.ac&&s.hp>0&&ph!=="done"&&<button onClick={()=>{if(!s.au)setSpirits(p=>p.map((x,j)=>j===i?{...x,au:true}:x));}} style={{fontSize:7,background:s.au?T.para+"22":T.s2,border:`1px solid ${s.au?T.para:T.fnt}`,color:s.au?T.para:T.fnt,borderRadius:4,padding:"1px 5px",cursor:"pointer",fontFamily:T.hd}}>{s.au?"ARMED":"⚡ ARM"}</button>}
      </div>))}
    </div>
    {/* Target picker (multi-monster) */}
    {ph==="player"&&liveMonsters.length>1&&(<div style={{display:"flex",gap:6,justifyContent:"center"}}>
      {ms.map((m,i)=>m.hp>0&&<button key={m.name} onClick={()=>setSelTarget(i)} style={{fontSize:9,fontFamily:T.hd,padding:"3px 10px",borderRadius:5,cursor:"pointer",background:selTarget===i?T.red+"22":"transparent",border:`1px solid ${selTarget===i?T.red:T.fnt}`,color:selTarget===i?T.red:T.dim}}>{m.emoji} {m.name} {m.hp}/{m.maxHp}</button>)}
    </div>)}
    {/* Move selector */}
    {ph==="player"&&active&&active.hp>0&&(<div style={{background:T.s1,borderRadius:10,padding:10,width:"100%",maxWidth:400}}>
      <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:2,marginBottom:6}}>MOVES — {active.sport} (SP: {active.sp}/{SP_MAX})</div>
      {active.sp>0?active.moves.map((mv,i)=>{const [name,g,s,b,kw]=mv;const target=ms[selTarget];const blocked=target?.special==="block_weak"&&totalRate(mv)<.25;
        return(<div key={i} onClick={()=>!blocked&&setSelMove(i)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,cursor:blocked?"not-allowed":"pointer",background:selMove===i?T.gold+"22":"transparent",border:`1px solid ${selMove===i?T.gold+"66":blocked?T.red+"33":"transparent"}`,marginBottom:3,opacity:blocked?.4:1,transition:"all .2s"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:T.txt,fontFamily:T.bd,fontWeight:600}}>{name}{kw?` ${kw==="RELAY"?"🤝":kw==="EXPLOSIVE"?"💥":kw==="ENDURANCE"?"💚":"🎯"}`:""}</span>
              <span style={{fontSize:10,color:T.dim,fontFamily:T.bd}}>{Math.round(totalRate(mv)*100)}% hit</span>
            </div>
            <MoveBar move={mv}/>
          </div>
          {blocked&&<span style={{fontSize:8,color:T.red,fontFamily:T.bd}}>BLOCKED</span>}
        </div>);
      }):(
        <div onClick={()=>setSelMove("rest")} style={{padding:"8px",borderRadius:6,cursor:"pointer",background:selMove==="rest"?T.grn+"22":"transparent",border:`1px solid ${selMove==="rest"?T.grn+"66":"transparent"}`,textAlign:"center"}}>
          <span style={{fontSize:11,color:T.grn,fontFamily:T.bd}}>💤 Rest (heal 5 HP)</span>
        </div>
      )}
      <div style={{textAlign:"center",marginTop:6}}><Btn small onClick={doAttack} disabled={selMove==null}>Attack!</Btn></div>
    </div>)}
    {ph==="done"&&<Btn onClick={()=>finish(won,spirits)}>Continue</Btn>}
  </div>);
}

function SimScreen({team,monsters,regionId,bodyTop5,onContinue}){
  const [result,setResult]=useState(null);
  const run=()=>{setResult(simulateBattle(team,monsters,1000,regionId,bodyTop5));};
  const syn=detectSynergies(team,regionId);
  const tips=["Monte Carlo simulations run 1,000 virtual battles to estimate your odds!","Expected value = probability × outcome, summed across all possibilities.","Real sports analysts use the same technique to predict medal counts.","The more simulations, the more accurate the prediction becomes."];
  const tip=tips[Math.floor(Math.random()*tips.length)];
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:14,maxWidth:500,margin:"0 auto",textAlign:"center"}}>
    <div style={{fontSize:11,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>ORACLE'S FORECAST</div>
    <h2 style={{fontSize:22,fontFamily:T.hd,color:T.gold,margin:0}}>Battle Simulation</h2>
    <div style={{display:"flex",gap:6,justifyContent:"center"}}>{team.map(s=><SpiritCard key={s.id} spirit={s} compact rgn={regionId}/>)}</div>
    <div style={{fontSize:11,color:T.dim,fontFamily:T.bd}}>vs {monsters.map(m=>m.emoji+" "+m.name).join(" & ")}</div>
    {/* Synergy badges */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
      {syn.rally&&<span style={{fontSize:8,background:T.grn+"22",color:T.grn,padding:"2px 6px",borderRadius:3,fontFamily:T.hd}}>🏟️ RALLY</span>}
      {syn.paraAlliance&&<span style={{fontSize:8,background:T.para+"22",color:T.para,padding:"2px 6px",borderRadius:3,fontFamily:T.hd}}>⚡ ALLIANCE</span>}
      {syn.relayChain&&<span style={{fontSize:8,background:T.gold+"22",color:T.gold,padding:"2px 6px",borderRadius:3,fontFamily:T.hd}}>🤝 RELAY</span>}
    </div>
    {!result&&<Btn onClick={run} color={T.gold}>Simulate 1,000 Battles</Btn>}
    {result&&(<div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:42,fontFamily:T.hd,color:result.winRate>=70?T.grn:result.winRate>=40?T.gold:T.red}}>{result.winRate}%</div>
      <div style={{fontSize:11,color:T.dim,fontFamily:T.bd}}>Win rate across {result.numSims} simulated battles</div>
      <div style={{display:"flex",justifyContent:"center",gap:16}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:16,fontFamily:T.hd,color:T.txt}}>{result.avgDmg}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Avg damage</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:16,fontFamily:T.hd,color:T.grn}}>{result.wins}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Wins</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:16,fontFamily:T.hd,color:T.red}}>{result.numSims-result.wins}</div><div style={{fontSize:9,color:T.dim,fontFamily:T.bd}}>Losses</div></div>
      </div>
      {/* Simple damage histogram */}
      <div style={{background:T.s1,borderRadius:8,padding:10}}>
        <div style={{fontSize:8,color:T.gd,fontFamily:T.hd,letterSpacing:2,marginBottom:6}}>DAMAGE DISTRIBUTION</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:1,height:60}}>
          {(()=>{const buckets=Array(20).fill(0);const mn=Math.min(...result.damages),mx=Math.max(...result.damages),rng=mx-mn||1;
            result.damages.forEach(d=>{const bi=Math.min(19,Math.floor((d-mn)/rng*20));buckets[bi]++;});
            const peak=Math.max(...buckets);
            return buckets.map((c,i)=><div key={i} style={{flex:1,background:T.gold,borderRadius:"2px 2px 0 0",height:`${(c/peak)*100}%`,minHeight:c>0?2:0,opacity:.6+.4*(c/peak)}}/>);
          })()}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:T.dim,fontFamily:T.bd,marginTop:2}}>
          <span>{Math.min(...result.damages)}</span><span>{Math.max(...result.damages)}</span>
        </div>
      </div>
      <p style={{fontSize:10,color:T.dim,fontFamily:T.bd,fontStyle:"italic",lineHeight:1.5}}>💡 {tip}</p>
    </div>)}
    <Btn onClick={onContinue}>{result?"Continue to Battle":"Skip Simulation"}</Btn>
  </div>);
}

function Debrief({monsters,won,cards,rgn,round,next}){
  const [txt,setTxt]=useState(null);const rg=REGIONS.find(r=>r.id===rgn);
  const mNames=monsters.map(m=>m.name).join(" & ");
  useEffect(()=>{const b=cards.reduce((a,c)=>bestGold(c)>bestGold(a)?c:a);gemini(`Coach in Team USA card game. Player's team of 3 spirits ${won?"beat":"lost to"} ${mNames} defending ${rg?.name} (${rg?.states}). Team: ${cards.map(c=>c.sport).join(", ")}. Best spirit: "${b?.sport}" (${b?.para?"Paralympic":"Olympic"}) with best gold: ${Math.round(bestGold(b)*100)}%. Write 3 bullet points for a kid: 1) ⚔️ How the team worked together 2) 🗺️ One real fact about Team USA in ${rg?.name} 3) 📊 One probability/data concept (expected value, Monte Carlo, sample size). Emoji. Brief.`).then(t=>setTxt(t||`⚔️ ${b?.sport} led the team.\n🗺️ ${rg?.name} produces many champions.\n📊 Higher gold rate = bigger hits but rarer!`));},[]);
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:14,maxWidth:460,margin:"0 auto",textAlign:"center"}}>
    <div style={{fontSize:36}}>{won?"🛡️":"💀"}</div>
    <h2 style={{fontFamily:T.hd,color:won?T.grn:T.red,margin:0,fontSize:20}}>{won?`${rg?.name} Defended!`:`${rg?.name} Falls`}</h2>
    <div style={{background:T.s1,borderRadius:10,padding:14,width:"100%",textAlign:"left"}}>
      <div style={{fontSize:9,color:T.gd,fontFamily:T.hd,letterSpacing:3,marginBottom:6}}>DEBRIEF</div>
      <div style={{fontFamily:T.bd,fontSize:12,color:T.txt,lineHeight:1.8,whiteSpace:"pre-line"}}>{txt||<span style={{color:T.dim}}>Coach reflecting...</span>}</div>
    </div>
    <Btn onClick={next}>{round<5?"Next Region":"See Results"}</Btn>
  </div>);
}

function End({results,restart}){
  const w=Object.values(results).filter(v=>v==="won").length;
  const rk=["Spirit Endures","Keeper in Training","Local Hero","Regional Champion","Coast to Coast","Guardian of All States"][w];
  const cl=[T.red,T.red,"#f97316",T.blu,T.pur,T.gold][w];
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16,padding:20,textAlign:"center"}}>
    <div style={{fontSize:10,color:T.gd,fontFamily:T.hd,letterSpacing:6}}>CAMPAIGN COMPLETE</div>
    <div style={{fontSize:40,fontFamily:T.hd,color:cl,textShadow:`0 0 30px ${cl}44`}}>{rk}</div>
    <div style={{fontFamily:T.bd,fontSize:14,color:T.txt}}>{w}/5 regions defended</div>
    <USMap results={results}/>
    <p style={{fontFamily:T.bd,fontSize:12,color:T.dim,maxWidth:360,lineHeight:1.6,fontStyle:"italic"}}>{w>=4?"America's spirit burns bright. LA28 will be legendary.":w>=2?"Key regions held. Explore more moves next time.":"Return to the Oracle. Study the medal rates and try again."}</p>
    <Btn onClick={restart}>Defend Again</Btn>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════

class ErrBound extends React.Component {
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err) return(
      <div style={{padding:40,color:"#ef4444",fontFamily:"monospace",background:"#06080c",minHeight:"100vh"}}>
        <h2>Error caught:</h2>
        <pre style={{whiteSpace:"pre-wrap",fontSize:12}}>{this.state.err.toString()}</pre>
        <pre style={{whiteSpace:"pre-wrap",fontSize:10,color:"#888",marginTop:10}}>{this.state.err.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

function Game(){
  const [ph,setPh]=useState("start");const [rnd,setRnd]=useState(1);const [team,setTeam]=useState([]);const [opts,setOpts]=useState([]);const [res,setRes]=useState({});const [lw,setLw]=useState(false);const [lc,setLc]=useState([]);const [bodyTop5,setBodyTop5]=useState([]);const [triviaSpirit,setTriviaSpirit]=useState(null);const used=useRef(new Set());
  const go=()=>{setRnd(1);setTeam([]);setRes({});setBodyTop5([]);used.current=new Set();setPh("quiz");};
  const startGame=(top5)=>{setBodyTop5(top5||[]);setPh("map");};
  const genScout=()=>{const rid=ROUNDS[rnd-1].regionId;const av=SPIRITS.filter(s=>!used.current.has(s.id));const wa=av.filter(s=>s.regions.includes(rid)||rid==="la28");const wo=av.filter(s=>!wa.includes(s));
    // Show 5 options: 3 with affinity (or as many as available) + fill with non-affinity
    const aff=shuffle(wa).slice(0,3);const wild=shuffle(wo).slice(0,5-aff.length);setOpts([...aff,...wild]);};
  const lockIn=(picked)=>{picked.forEach(s=>used.current.add(s.id));setTeam(picked);setTriviaSpirit(picked[0]);setPh("trivia");};
  const fin=(won,cards)=>{setRes(p=>({...p,[ROUNDS[rnd-1].regionId]:won?"won":"lost"}));setLw(won);setLc(cards);setPh("debrief");};
  const nxt=()=>{if(rnd>=5){setPh("end");return;}setRnd(r=>r+1);setTeam([]);setPh("map");};
  const rd=ROUNDS[rnd-1]||ROUNDS[0];
  return(<div style={{minHeight:"100vh",background:T.bg,color:T.txt,backgroundImage:`radial-gradient(ellipse 80% 40% at 50% 0%,#0d0a06 0%,transparent 50%)`}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:${T.bg}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.fnt};border-radius:3px}`}</style>
    {ph==="start"&&<Start go={go} howto={()=>setPh("howto")} explore={()=>setPh("explore")}/>}
    {ph==="explore"&&<Explorer back={()=>setPh("start")}/>}
    {ph==="quiz"&&<BodyQuiz done={startGame}/>}
    {ph==="howto"&&<HowTo back={()=>setPh("start")} go={go}/>}
    {ph==="map"&&<MapScr round={rnd} rd={rd} results={res} go={()=>{genScout();setPh("scout");}}/>}
    {ph==="scout"&&<Scout opts={opts} lockIn={lockIn} round={rnd} rgn={rd.regionId} bodyTop5={bodyTop5}/>}
    {ph==="trivia"&&<Trivia spirit={triviaSpirit} onComplete={()=>setPh("simulate")}/>}
    {ph==="simulate"&&<SimScreen team={team} monsters={rd.monsters} regionId={rd.regionId} bodyTop5={bodyTop5} onContinue={()=>setPh("battle")}/>}
    {ph==="battle"&&<Battle monsters={rd.monsters} team={team} rgn={rd.regionId} finish={fin} round={rnd} bodyTop5={bodyTop5}/>}
    {ph==="debrief"&&<Debrief monsters={rd.monsters} won={lw} cards={lc} rgn={rd.regionId} round={rnd} next={nxt}/>}
    {ph==="end"&&<End results={res} restart={()=>setPh("start")}/>}
  </div>);
}

export default function App(){
  return <ErrBound><Game/></ErrBound>;
}
