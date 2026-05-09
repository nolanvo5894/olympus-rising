import React, { useState, useRef, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import medalRatesData from "./datasets/medal_rates.json";
import sportStatsData from "./datasets/sport_stats.json";
import regionSportStrengthData from "./datasets/region_sport_strength.json";
import { geminiText, geminiImage, hasApiKey, GeminiKeyMissingError } from "./lib/gemini.js";
import { generateMonster, pickSpawnBasis, buildImagePrompt } from "./lib/monsterGen.js";
import { generateMonsterQueued } from "./lib/genQueue.js";
import { loadCampaign, saveCampaign, clearCampaign } from "./lib/storage.js";
import { matchSports, PERSONALITY_QUESTIONS, SPORT_BODY_TYPES } from "./lib/sportMatch.js";
import { SportAvatar } from "./lib/sportAvatar.jsx";
import { loadBakedMonster } from "./lib/bakedMonsters.js";

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
  {id:"la28",name:"LA28",states:"Los Angeles",sports:["ALL"],color:"#ffd400",cx:68,cy:195},
];

// ── Spirits (1 per sport, moves = events) ───────────────────
// Move: [name, event, gold%, silver%, bronze%, keyword|null]
// `name` is the in-game ability name; `event` is the real Olympic event the
// stats are sourced from (still used as the MEDAL_RATES lookup key).
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
    ["Aegean Surge","100m Freestyle",...r("Swimming","100m Freestyle"),null],
    ["Wingéd Tide","200m Butterfly",...r("Swimming","200m Butterfly"),null],
    ["Triton Procession","4×100m Medley Relay",...r("Swimming","4×100m Medley Relay"),"RELAY"],
    ["Long Crossing","10km Open Water",...r("Swimming","10km Open Water"),"ENDURANCE"],
    ["Reverse Current","200m Backstroke",...r("Swimming","200m Backstroke"),null],
  ]},
  {id:"track",sport:"Track & Field",emoji:"🏃",para:false,regions:["southwest","south","capital"],moves:[
    ["Hermes Burst","100m Sprint",...r("Track & Field","100m Sprint"),"EXPLOSIVE"],
    ["Leaping Stride","400m Hurdles",...r("Track & Field","400m Hurdles"),null],
    ["Olympian Chain","4×400m Relay",...r("Track & Field","4×400m Relay"),"RELAY"],
    ["Pheidippides' March","Marathon",...r("Track & Field","Marathon"),"ENDURANCE"],
    ["Atlas Heave","Shot Put",...r("Track & Field","Shot Put"),null],
  ]},
  {id:"gymnastics",sport:"Gymnastics",emoji:"🤸",para:false,regions:["southwest","south"],moves:[
    ["Polymath's Display","All-Around",...r("Gymnastics","All-Around"),null],
    ["Mortal Dance","Floor Exercise",...r("Gymnastics","Floor Exercise"),null],
    ["Sky-Vault","Vault",...r("Gymnastics","Vault"),null],
    ["Threadwalk","Balance Beam",...r("Gymnastics","Balance Beam"),null],
  ]},
  {id:"basketball",sport:"Basketball",emoji:"🏀",para:false,regions:["south","northeast","heartland"],moves:[
    ["Phalanx Court","Men's Tournament",...r("Basketball","Men's Tournament"),"RELAY"],
    ["Amazon Court","Women's Tournament",...r("Basketball","Women's Tournament"),"RELAY"],
  ]},
  {id:"wrestling",sport:"Wrestling",emoji:"🤼",para:false,regions:["heartland","southwest"],moves:[
    ["Lion's Grasp","Freestyle 74kg",...r("Wrestling","Freestyle 74kg"),null],
    ["Spartan Lock","Greco-Roman 67kg",...r("Wrestling","Greco-Roman 67kg"),null],
    ["Atalanta's Hold","Women's Freestyle 57kg",...r("Wrestling","Women's Freestyle 57kg"),null],
  ]},
  {id:"rowing",sport:"Rowing",emoji:"🚣",para:false,regions:["northeast","capital","heartland"],moves:[
    ["Argo's Eight","Men's Eight",...r("Rowing","Men's Eight"),"RELAY"],
    ["Lone Oar","Women's Single Sculls",...r("Rowing","Women's Single Sculls"),"ENDURANCE"],
    ["Twin Tide","Men's Coxless Pair",...r("Rowing","Men's Coxless Pair"),null],
  ]},
  {id:"shooting",sport:"Shooting",emoji:"🎯",para:false,regions:["mountain","heartland"],moves:[
    ["Apollo's Eye","Air Rifle 10m",...r("Shooting","Air Rifle 10m"),"PRECISION"],
    ["Skybreaker","Skeet",...r("Shooting","Skeet"),"PRECISION"],
    ["Lightning Hand","Rapid Fire Pistol",...r("Shooting","Rapid Fire Pistol"),"PRECISION"],
  ]},
  {id:"diving",sport:"Diving",emoji:"🤿",para:false,regions:["pacific","south"],moves:[
    ["Icarus Plunge","10m Platform",...r("Diving","10m Platform"),"PRECISION"],
    ["Naiad's Leap","3m Springboard",...r("Diving","3m Springboard"),"PRECISION"],
    ["Twin Plunge","Synchro 10m",...r("Diving","Synchro 10m"),null],
  ]},
  {id:"fencing",sport:"Fencing",emoji:"🤺",para:false,regions:["northeast","capital"],moves:[
    ["Foil's Whisper","Foil Individual",...r("Fencing","Foil Individual"),null],
    ["Blade Pact","Épée Team",...r("Fencing","Épée Team"),"RELAY"],
    ["Sabre Crescent","Sabre Individual",...r("Fencing","Sabre Individual"),null],
  ]},
  {id:"boxing",sport:"Boxing",emoji:"🥊",para:false,regions:["southwest","northeast"],moves:[
    ["Bronze Hook","Welterweight",...r("Boxing","Welterweight"),"EXPLOSIVE"],
    ["Featherjab","Lightweight",...r("Boxing","Lightweight"),null],
    ["Hephaestus Hammer","Heavyweight",...r("Boxing","Heavyweight"),"EXPLOSIVE"],
  ]},
  {id:"volleyball",sport:"Volleyball",emoji:"🏐",para:false,regions:["northeast","heartland"],moves:[
    ["Skyline Pact","Indoor Men's",...r("Volleyball","Indoor Men's"),"RELAY"],
    ["Nike's Spike","Indoor Women's",...r("Volleyball","Indoor Women's"),"RELAY"],
    ["Sandkiss","Beach Volleyball",...r("Volleyball","Beach Volleyball"),null],
  ]},
  {id:"waterpolo",sport:"Water Polo",emoji:"🤽",para:false,regions:["pacific","heartland"],moves:[
    ["Triton's Pact","Men's Tournament",...r("Water Polo","Men's Tournament"),"RELAY"],
    ["Nereid Volley","Women's Tournament",...r("Water Polo","Women's Tournament"),"RELAY"],
  ]},
  {id:"surfing",sport:"Surfing",emoji:"🏄",para:false,regions:["pacific"],moves:[
    ["Wave Carve","Shortboard Men's",...r("Surfing","Shortboard Men's"),null],
    ["Crescent Curl","Shortboard Women's",...r("Surfing","Shortboard Women's"),null],
  ]},
  {id:"skateboarding",sport:"Skateboarding",emoji:"🛹",para:false,regions:["pacific"],moves:[
    ["Streetborne","Street",...r("Skateboarding","Street"),null],
    ["Bowl Reign","Park",...r("Skateboarding","Park"),null],
  ]},
  {id:"alpine",sport:"Alpine Skiing",emoji:"⛷️",para:false,regions:["mountain"],moves:[
    ["Serpentine Run","Slalom",...r("Alpine Skiing","Slalom"),null],
    ["Titan's Edge","Giant Slalom",...r("Alpine Skiing","Giant Slalom"),null],
    ["Avalanche Drop","Downhill",...r("Alpine Skiing","Downhill"),"EXPLOSIVE"],
  ]},
  {id:"icehockey",sport:"Ice Hockey",emoji:"🏒",para:false,regions:["heartland","mountain","northeast"],moves:[
    ["Frostline","Men's Tournament",...r("Ice Hockey","Men's Tournament"),"RELAY"],
    ["Aurora Strike","Women's Tournament",...r("Ice Hockey","Women's Tournament"),"RELAY"],
  ]},
  {id:"snowboard",sport:"Snowboarding",emoji:"🏂",para:false,regions:["mountain","pacific"],moves:[
    ["Pipe Surge","Halfpipe",...r("Snowboarding","Halfpipe"),null],
    ["Sigil Trick","Slopestyle",...r("Snowboarding","Slopestyle"),null],
    ["Boreas Charge","Snowboard Cross",...r("Snowboarding","Snowboard Cross"),"EXPLOSIVE"],
  ]},
  {id:"golf",sport:"Golf",emoji:"⛳",para:false,regions:["capital","south"],moves:[
    ["Sun Arc","Men's Individual",...r("Golf","Men's Individual"),null],
    ["Crescent Drive","Women's Individual",...r("Golf","Women's Individual"),null],
  ]},
  {id:"tennis",sport:"Tennis",emoji:"🎾",para:false,regions:["northeast","capital","south"],moves:[
    ["Hero's Volley","Men's Singles",...r("Tennis","Men's Singles"),null],
    ["Atalanta's Volley","Women's Singles",...r("Tennis","Women's Singles"),null],
    ["Twin Crescent","Mixed Doubles",...r("Tennis","Mixed Doubles"),"RELAY"],
  ]},
  {id:"archery",sport:"Archery",emoji:"🏹",para:false,regions:["southwest","mountain"],moves:[
    ["Artemis' Eye","Individual Recurve",...r("Archery","Individual Recurve"),"PRECISION"],
    ["Hunter's Volley","Team Recurve",...r("Archery","Team Recurve"),"RELAY"],
    ["Truestrike","Individual Compound",...r("Archery","Individual Compound"),"PRECISION"],
  ]},
  {id:"cycling",sport:"Cycling",emoji:"🚴",para:false,regions:["mountain","pacific","capital"],moves:[
    ["Wheelburst","Track Sprint",...r("Cycling","Track Sprint"),"EXPLOSIVE"],
    ["Chariot Chain","Team Pursuit",...r("Cycling","Team Pursuit"),"RELAY"],
    ["Long Procession","Road Race",...r("Cycling","Road Race"),"ENDURANCE"],
    ["Spirit Sprint","BMX Racing",...r("Cycling","BMX Racing"),"EXPLOSIVE"],
    ["Mountain Crossing","Mountain Bike XC",...r("Cycling","Mountain Bike XC"),"ENDURANCE"],
  ]},
  {id:"sailing",sport:"Sailing",emoji:"⛵",para:false,regions:["pacific","northeast"],moves:[
    ["Skiff Skip","49er",...r("Sailing","49er"),null],
    ["Helmsman's Vigil","Laser/ILCA",...r("Sailing","Laser/ILCA"),"ENDURANCE"],
    ["Twin Hull Pact","Nacra 17 Mixed",...r("Sailing","Nacra 17 Mixed"),"RELAY"],
  ]},
  {id:"figureskating",sport:"Figure Skating",emoji:"⛸️",para:false,regions:["heartland","northeast"],moves:[
    ["Lone Aurora","Men's Singles",...r("Figure Skating","Men's Singles"),null],
    ["Crystal Pirouette","Women's Singles",...r("Figure Skating","Women's Singles"),null],
    ["Twin Glide","Ice Dance",...r("Figure Skating","Ice Dance"),"RELAY"],
    ["Dual Aria","Pairs",...r("Figure Skating","Pairs"),"RELAY"],
  ]},
  {id:"speedskating",sport:"Speed Skating",emoji:"⏱️",para:false,regions:["heartland","mountain"],moves:[
    ["Frost Burst","500m",...r("Speed Skating","500m"),"EXPLOSIVE"],
    ["Glacier Stride","1500m",...r("Speed Skating","1500m"),null],
    ["Boreas March","5000m",...r("Speed Skating","5000m"),"ENDURANCE"],
    ["Razor Edge","Short Track 1000m",...r("Speed Skating","Short Track 1000m"),null],
    ["Frost Phalanx","Short Track Relay",...r("Speed Skating","Short Track Relay"),"RELAY"],
  ]},
  {id:"judo",sport:"Judo",emoji:"🥋",para:false,regions:["northeast","southwest"],moves:[
    ["Spartan Throw","73kg",...r("Judo","73kg"),null],
    ["Athena's Hold","57kg Women's",...r("Judo","57kg Women's"),null],
    ["Titan Toss","100kg+",...r("Judo","100kg+"),"EXPLOSIVE"],
  ]},
  {id:"triathlon",sport:"Triathlon",emoji:"🏊‍♂️",para:false,regions:["pacific","capital"],moves:[
    ["Trial of Three","Individual",...r("Triathlon","Individual"),"ENDURANCE"],
    ["Three-Trial Pact","Mixed Relay",...r("Triathlon","Mixed Relay"),"RELAY"],
  ]},
  {id:"weightlifting",sport:"Weightlifting",emoji:"🏋️",para:false,regions:["southwest","south"],moves:[
    ["Bronze Lift","61kg",...r("Weightlifting","61kg"),null],
    ["Heroic Lift","81kg",...r("Weightlifting","81kg"),null],
    ["Atlas Press","109kg+",...r("Weightlifting","109kg+"),"EXPLOSIVE"],
  ]},
  {id:"baseball",sport:"Baseball",emoji:"⚾",para:false,regions:["south","northeast","southwest","pacific"],moves:[
    ["Thunder Lineup","Tournament",...r("Baseball","Tournament"),"RELAY"],
  ]},
  {id:"softball",sport:"Softball",emoji:"🥎",para:false,regions:["pacific","heartland","southwest"],moves:[
    ["Diamond Phalanx","Tournament",...r("Softball","Tournament"),"RELAY"],
  ]},
  {id:"rugby7s",sport:"Rugby Sevens",emoji:"🏉",para:false,regions:["pacific","southwest"],moves:[
    ["Spartan Surge","Men's Tournament",...r("Rugby Sevens","Men's Tournament"),"RELAY"],
    ["Amazonian Charge","Women's Tournament",...r("Rugby Sevens","Women's Tournament"),"RELAY"],
  ]},
  {id:"climbing",sport:"Sport Climbing",emoji:"🧗",para:false,regions:["mountain","pacific"],moves:[
    ["Vertical Pilgrimage","Lead",...r("Sport Climbing","Lead"),null],
    ["Stone Bound","Bouldering",...r("Sport Climbing","Bouldering"),"EXPLOSIVE"],
    ["Wallrush","Speed",...r("Sport Climbing","Speed"),"EXPLOSIVE"],
  ]},
  {id:"tabletennis",sport:"Table Tennis",emoji:"🏓",para:false,regions:["northeast","capital"],moves:[
    ["Featherstrike","Men's Singles",...r("Table Tennis","Men's Singles"),null],
    ["Quill Volley","Women's Singles",...r("Table Tennis","Women's Singles"),null],
    ["Triple Volley","Team Event",...r("Table Tennis","Team Event"),"RELAY"],
  ]},
  {id:"equestrian",sport:"Equestrian",emoji:"🐴",para:false,regions:["capital","heartland","south"],moves:[
    ["Centaur's Run","Eventing Individual",...r("Equestrian","Eventing Individual"),"ENDURANCE"],
    ["Cavalry Pact","Jumping Team",...r("Equestrian","Jumping Team"),"RELAY"],
    ["Royal Cadence","Dressage Individual",...r("Equestrian","Dressage Individual"),"PRECISION"],
  ]},
  {id:"freestyleski",sport:"Freestyle Skiing",emoji:"🎿",para:false,regions:["mountain"],moves:[
    ["Mogul Dance","Moguls",...r("Freestyle Skiing","Moguls"),null],
    ["Sky Tumble","Aerials",...r("Freestyle Skiing","Aerials"),"EXPLOSIVE"],
    ["Boreas Cross","Ski Cross",...r("Freestyle Skiing","Ski Cross"),"EXPLOSIVE"],
    ["Vortex Pipe","Halfpipe",...r("Freestyle Skiing","Halfpipe"),null],
  ]},
  {id:"canoe",sport:"Canoe / Kayak",emoji:"🛶",para:false,regions:["heartland","pacific","northeast"],moves:[
    ["Lone Paddle","Sprint K-1 1000m",...r("Canoe / Kayak","Sprint K-1 1000m"),"ENDURANCE"],
    ["Twin Stroke","Sprint C-2 500m",...r("Canoe / Kayak","Sprint C-2 500m"),"RELAY"],
    ["Rapids Twist","Slalom K-1",...r("Canoe / Kayak","Slalom K-1"),null],
  ]},
  {id:"taekwondo",sport:"Taekwondo",emoji:"🥋",para:false,regions:["southwest","south"],moves:[
    ["Tempest Kick","68kg",...r("Taekwondo","68kg"),null],
    ["Lightning Step","57kg Women's",...r("Taekwondo","57kg Women's"),"EXPLOSIVE"],
  ]},
  {id:"modernpentathlon",sport:"Modern Pentathlon",emoji:"🤺",para:false,regions:["capital","northeast"],moves:[
    ["Five Trials","Individual",...r("Modern Pentathlon","Individual"),"ENDURANCE"],
  ]},
  {id:"flagfootball",sport:"Flag Football",emoji:"🏈",para:false,regions:["south","heartland","southwest"],moves:[
    ["Banner Charge","Tournament",...r("Flag Football","Tournament"),"RELAY"],
  ]},
  // ── Paralympic Mech Warriors ──
  {id:"paraswim",sport:"Para Swimming",emoji:"🏊",para:true,regions:["south","pacific","capital"],moves:[
    ["Adaptive Surge","50m Freestyle S7",.20,.15,.10,null],
    ["Resolute Current","100m Backstroke S9",.18,.12,.08,null],
    ["Unbroken Chain","4×100m Relay",.30,.08,.05,"RELAY"],
    ["Steel Tide","200m IM SM8",.10,.10,.15,"ENDURANCE"],
  ]},
  {id:"paratrack",sport:"Para Track & Field",emoji:"🏃",para:true,regions:["south","southwest"],moves:[
    ["Iron Wheel Burst","100m T54 Wheelchair",.18,.10,.10,"EXPLOSIVE"],
    ["Adaptive Heave","Shot Put F46",.15,.12,.08,null],
    ["Unyielding Stride","1500m T13",.08,.08,.15,"ENDURANCE"],
    ["Unbreakable Leap","Long Jump T64",.12,.10,.10,null],
  ]},
  {id:"wchairrugby",sport:"Wheelchair Rugby",emoji:"🦽",para:true,regions:["south","heartland"],moves:[
    ["Iron Phalanx","Tournament",.45,.10,.08,"RELAY"],
  ]},
  {id:"sitvol",sport:"Sitting Volleyball",emoji:"🏐",para:true,regions:["south"],moves:[
    ["Resolute Spike","Women's Tournament",.40,.15,.05,"RELAY"],
    ["Steel Set","Men's Tournament",.10,.12,.15,null],
  ]},
  {id:"wchairbball",sport:"Wheelchair Basketball",emoji:"🏀",para:true,regions:["south","heartland"],moves:[
    ["Iron Court","Men's Tournament",.18,.15,.10,"RELAY"],
    ["Steel Court","Women's Tournament",.20,.12,.08,"RELAY"],
  ]},
  {id:"sledhockey",sport:"Sled Hockey",emoji:"🏒",para:true,regions:["heartland","northeast","mountain"],moves:[
    ["Frost Iron Charge","Tournament",.55,.10,.05,"RELAY"],
  ]},
  {id:"paralpine",sport:"Para Alpine",emoji:"⛷️",para:true,regions:["mountain"],moves:[
    ["Adaptive Edge","Giant Slalom Standing",.18,.12,.08,null],
    ["Steel Schuss","Super-G Sitting",.15,.10,.12,null],
    ["Truesight Run","Slalom VI",.10,.12,.10,"PRECISION"],
  ]},
  {id:"paranordic",sport:"Para Nordic",emoji:"🎿",para:true,regions:["mountain","heartland"],moves:[
    ["Adaptive Marksman","Biathlon Sprint",.20,.12,.08,"PRECISION"],
    ["Unyielding Trek","Cross-Country 10km",.18,.10,.10,"ENDURANCE"],
    ["Resolute Chain","Relay",.25,.10,.05,"RELAY"],
  ]},
  {id:"paracycling",sport:"Para Cycling",emoji:"🚴",para:true,regions:["mountain","capital"],moves:[
    ["Iron Cadence","Track Individual Pursuit",.20,.12,.08,null],
    ["Lone Wheel Vigil","Road Time Trial",.15,.10,.10,"ENDURANCE"],
    ["Twin Wheel Pact","Road Race Tandem",.18,.08,.08,"RELAY"],
  ]},
  {id:"paraarchery",sport:"Para Archery",emoji:"🏹",para:true,regions:["southwest","mountain"],moves:[
    ["Resolute Eye","W1 Individual",.15,.12,.10,"PRECISION"],
    ["Adaptive Arrow","Open Compound",.18,.10,.08,"PRECISION"],
    ["Phalanx of Aim","Team Recurve",.22,.08,.06,"RELAY"],
  ]},
  {id:"goalball",sport:"Goalball",emoji:"🔔",para:true,regions:["northeast","heartland"],moves:[
    ["Bell Pact","Men's Tournament",.15,.10,.12,"RELAY"],
    ["Echo Strike","Women's Tournament",.20,.12,.08,"RELAY"],
  ]},
  {id:"parapowerlifting",sport:"Para Powerlifting",emoji:"🏋️",para:true,regions:["south","southwest"],moves:[
    ["Adaptive Press","Up to 88kg",.18,.10,.12,"EXPLOSIVE"],
    ["Steel Press","Up to 65kg Women's",.15,.12,.10,"EXPLOSIVE"],
  ]},
  {id:"paratriathlon",sport:"Para Triathlon",emoji:"🏊‍♂️",para:true,regions:["pacific","capital"],moves:[
    ["Three-Trial Resolve","PTS5",.15,.10,.08,"ENDURANCE"],
    ["Bound Trial","PTVI",.12,.10,.12,"ENDURANCE"],
  ]},
  {id:"wchairtennis",sport:"Wheelchair Tennis",emoji:"🎾",para:true,regions:["south","northeast"],moves:[
    ["Iron Volley","Men's Singles",.10,.15,.10,null],
    ["Steel Volley","Women's Singles",.12,.12,.08,null],
    ["Adaptive Lance","Quad Singles",.18,.10,.08,"PRECISION"],
  ]},
];

// ── Data-driven regional sport strengths (regenerated from CSV hometown data) ──
// For each sport: regions where it has ≥15% of its athletes OR is in the top 2.
// Region strongholds derived from data/team_usa_athletes_unified.csv —
// see scripts/compute_region_sport_strength.py to regenerate.
const REGION_SPORT_STRENGTH=regionSportStrengthData;
// Apply data-driven regions to all spirits
SPIRITS.forEach(s=>{if(REGION_SPORT_STRENGTH[s.sport])s.regions=REGION_SPORT_STRENGTH[s.sport];});

// ── Sport Body Types (avg height cm / weight kg, regenerated from CSV) ──
// Only includes sports that are in-game SPIRITS (Olympic only — body quiz
// doesn't apply to Paralympic sports). Counts reflect merged SPORT_MAP
// categories (e.g. Cycling includes Track/Road/BMX/MTB).
// SPORT_BODY_TYPES and matchSports moved to src/lib/sportMatch.js (Gemini-driven)

// ── Active region slots (endless mode: 1 monster per region, regenerated on defeat) ──
const ACTIVE_REGIONS=REGIONS.filter(r=>r.id!=="la28");

// ── Helpers ─────────────────────────────────────────────────
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
const HP=100; // flat HP for all spirits
const totalRate=m=>m[2]+m[3]+m[4];
const bestGold=s=>Math.max(...s.moves.map(m=>m[2]));
function rollMove(move,affinity,bodyAff,synergies={}){
  const [name,event,g,s,b,kw]=move;
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
  team.forEach(s=>s.moves.forEach(m=>{const kw=m[5];if(kw){kwCount[kw]=(kwCount[kw]||0)+1;}}));
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

const NIL_RULES=`RULES:
- NEVER mention any real athlete by name (no first name, last name, nickname, or initials).
- NEVER include biographical details that identify a real athlete (hometown, birth year, specific Olympics, specific medal counts tied to a person).
- You MAY discuss the sport itself, Team USA team-level achievements, sport history, rules, equipment, and aggregate stats.`;

async function gemini(p){try{return await geminiText(p);}catch(e){console.warn("[gemini text]",e);return"";}}

// ── Theme ───────────────────────────────────────────────────
const T={bg:"#0a0014",s1:"#1a0033",s2:"#260047",gold:"#ffd400",gd:"#22e0ff",red:"#ff3939",grn:"#caff00",blu:"#22e0ff",pur:"#ff2d95",para:"#22e0ff",txt:"#fbfbff",dim:"#9a7fc0",fnt:"#3a1a6a",hd:"'Press Start 2P','VT323',monospace",bd:"'VT323',monospace"};
const medalColors={gold:"#ffd400",silver:"#b8c4ff",bronze:"#ff8844",miss:"#3a1a6a"};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MoveBar({move}){
  const [name,event,g,s,b]=move;const miss=1-g-s-b;
  const data=[{n:"🥇",v:Math.round(g*100),f:medalColors.gold},{n:"🥈",v:Math.round(s*100),f:medalColors.silver},{n:"🥉",v:Math.round(b*100),f:medalColors.bronze},{n:"❌",v:Math.round(miss*100),f:medalColors.miss}];
  return(<div style={{display:"flex",height:14,borderRadius:4,overflow:"hidden",width:"100%"}}>
    {data.filter(d=>d.v>0).map((d,i)=><div key={i} title={`${d.n} ${d.v}%`} style={{width:`${d.v}%`,background:d.f,minWidth:d.v>3?undefined:2,transition:"width .3s"}}/>)}
  </div>);
}

function SpiritCard({spirit:s,compact,selected,onClick,disabled,showHp,hp:curHp,rgn,bodyMatch:bm}){
  const bc=s.para?T.para:T.gold;const aff=rgn&&(s.regions.includes(rgn)||rgn==="la28");
  return(<div onClick={disabled?undefined:onClick} style={{width:compact?130:230,minHeight:compact?undefined:280,height:compact?undefined:"100%",background:`linear-gradient(150deg,${T.s1},${T.s2})`,border:`2px solid ${selected?bc:bc+"44"}`,borderRadius:12,padding:compact?7:12,cursor:disabled?"default":"pointer",opacity:disabled?.3:1,transition:"all .25s",boxShadow:selected?`0 0 18px ${bc}55`:"none",position:"relative",display:"flex",flexDirection:"column",gap:compact?2:5}}>
    {aff&&!compact&&<div style={{position:"absolute",top:3,left:6,fontSize:16,background:T.grn+"22",color:T.grn,padding:"1px 5px",borderRadius:3,fontFamily:T.hd}}>+50%</div>}
    {bm&&!compact&&<div style={{position:"absolute",top:aff?18:3,left:6,fontSize:16,background:T.blu+"22",color:T.blu,padding:"1px 5px",borderRadius:3,fontFamily:T.hd}}>💪+15%</div>}
    <div style={{display:"flex",justifyContent:"center",marginTop:!compact&&(aff||bm)?(aff&&bm?30:16):0}}>
      <SportAvatar sport={s.sport} emoji={s.emoji} size={compact?60:96} radius={6}/>
    </div>
    <div style={{fontSize:compact?12:16,marginTop:compact?0:2,textAlign:"center"}}><span style={{fontFamily:T.hd,fontWeight:700,color:T.txt}}>{s.sport}</span></div>
    {!compact&&<div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{s.regions.map(r=>{const rg=REGIONS.find(x=>x.id===r);return rg?<span key={r} style={{fontSize:13,background:rg.color+"22",color:rg.color,padding:"1px 4px",borderRadius:3,fontFamily:T.bd}}>{rg.name}</span>:null;})}</div>}
    {!compact&&<div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:2,marginTop:3}}>MOVES</div>}
    {!compact&&s.moves.map((m,i)=>{const [name,event,g,sv,b,kw]=m;return(<div key={i} style={{marginBottom:5}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:18,color:T.txt,fontFamily:T.bd}}>{name}</span>
        <span style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>{Math.round(totalRate(m)*100)}%{kw?` ${kw==="RELAY"?"🤝":kw==="EXPLOSIVE"?"💥":kw==="ENDURANCE"?"💚":kw==="PRECISION"?"🎯":""}`:""}</span>
      </div>
      <div style={{fontSize:13,color:T.dim,fontFamily:T.bd,fontStyle:"italic",letterSpacing:.3,marginTop:1,marginBottom:2}}>{event}</div>
      <MoveBar move={m}/>
    </div>);})}
    {compact&&<div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>{s.moves.length} moves · best: {Math.round(bestGold(s)*100)}%🥇</div>}
    {s.para&&!compact&&<div style={{fontSize:16,color:T.para,background:T.para+"12",borderRadius:4,padding:"2px 5px",textAlign:"center",fontFamily:T.bd,marginTop:2}}>⚡ ADAPT — Cancel 1 attack</div>}
    {showHp&&<div style={{marginTop:"auto",paddingTop:3}}><div style={{height:4,background:T.fnt,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(0,(curHp/HP)*100)}%`,background:curHp>HP*.3?T.grn:T.red,borderRadius:2,transition:"width .4s"}}/></div><div style={{fontSize:16,color:T.dim,textAlign:"center"}}>{curHp}/{HP}</div></div>}
  </div>);
}

const Btn=({children,onClick,color=T.gold,disabled:d,small:s})=><button disabled={d} onClick={onClick} style={{background:"transparent",border:`2px solid ${d?T.fnt:color}`,color:d?T.fnt:color,fontFamily:T.hd,fontSize:s?10:12,padding:s?"4px 10px":"8px 20px",borderRadius:7,cursor:d?"default":"pointer",letterSpacing:2,textTransform:"uppercase"}}>{children}</button>;

// Card anchor table for the map overlay. lx/ly are in USMap viewBox coords;
// hAnch/vAnch describe which corner of the card sits at (lx, ly).
const MAP_VB={x:-78,y:-50,w:758,h:420};
const MAP_LP={
  pacific:  {lx:-70, ly:130, hAnch:"start",  vAnch:"middle"},
  mountain: {lx:115, ly:-22, hAnch:"middle", vAnch:"end"},
  southwest:{lx:185, ly:325, hAnch:"middle", vAnch:"start"},
  heartland:{lx:380, ly:-22, hAnch:"middle", vAnch:"end"},
  south:    {lx:445, ly:325, hAnch:"middle", vAnch:"start"},
  northeast:{lx:680, ly:35,  hAnch:"end",    vAnch:"middle"},
  capital:  {lx:680, ly:170, hAnch:"end",    vAnch:"middle"},
};
function mapLpStyle(lp){
  const tx=lp.hAnch==="end"?-100:lp.hAnch==="middle"?-50:0;
  const ty=lp.vAnch==="end"?-100:lp.vAnch==="middle"?-50:0;
  return{
    position:"absolute",
    left:`${(lp.lx-MAP_VB.x)/MAP_VB.w*100}%`,
    top:`${(lp.ly-MAP_VB.y)/MAP_VB.h*100}%`,
    transform:`translate(${tx}%,${ty}%)`,
  };
}

function USMap({atk,results={},slots={},compact,onPick,labels=true}){
  const rc={pacific:"#3b82f6",mountain:"#94a3b8",southwest:"#ef4444",heartland:"#eab308",south:"#22c55e",northeast:"#a855f7",capital:"#6366f1"};
  const LP=MAP_LP;
  return(<svg viewBox="-78 -50 758 420" preserveAspectRatio="xMidYMid meet" style={{maxWidth:compact?"min(540px,90vw)":"min(820px,82vw)",maxHeight:"100%",width:"100%",height:"auto",aspectRatio:"758 / 420",filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.6))",display:"block"}}>
    <defs>
      <filter id="ag" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="wg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="liveGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      {Object.entries(rc).map(([id,col])=>(<radialGradient key={id} id={`hl-${id}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={col} stopOpacity="0.35"/><stop offset="100%" stopColor={col} stopOpacity="0"/></radialGradient>))}
    </defs>
    {/* Soft region halos behind state paths */}
    {REGIONS.filter(r=>r.id!=="la28").map(r=>(<circle key={"halo-"+r.id} cx={r.cx} cy={r.cy+5} r={compact?38:48} fill={`url(#hl-${r.id})`} style={{pointerEvents:"none"}}/>))}
    {/* Pass 1: opaque-ish fills (no stroke) so they hide inner seams in pass 2 */}
    {ST.map(([ab,rg,d])=>{
      const ia=atk===rg,rs=results[rg],bc=rc[rg]||"#555";const hasMon=!!slots[rg];
      const fill=rs==="won"?T.grn+"66":rs==="lost"?T.red+"44":ia?T.red+"77":hasMon?bc+"66":bc+"33";
      return <path key={"f-"+ab} d={d} fill={fill} stroke="none" style={{transition:"all .5s",cursor:onPick&&slots[rg]?"pointer":"default"}} onClick={onPick&&slots[rg]?()=>onPick(rg):undefined}/>;
    })}
    {/* Pass 2: thick stroke per state with paint-order=stroke so each state's fill covers the inner half — leaves only the region perimeter visible */}
    {ST.map(([ab,rg,d])=>{
      const ia=atk===rg,rs=results[rg],bc=rc[rg]||"#555";const hasMon=!!slots[rg];
      const fill=rs==="won"?T.grn+"66":rs==="lost"?T.red+"44":ia?T.red+"77":hasMon?bc+"66":bc+"33";
      const stroke=rs==="won"?T.grn:rs==="lost"?T.red:ia?T.red:bc;
      const sw=ia?5:hasMon?4:3;
      return <path key={"s-"+ab} d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" filter={ia?"url(#ag)":rs==="won"?"url(#wg)":"none"} style={{paintOrder:"stroke",transition:"all .5s",cursor:onPick&&slots[rg]?"pointer":"default",pointerEvents:"none"}}/>;
    })}
    {REGIONS.filter(r=>r.id!=="la28").map(r=>{
      const lp=LP[r.id];if(!lp)return null;
      const rcCol=rc[r.id]||"#aaa";
      // Leader line from card anchor (lp) to region centroid (cx, cy).
      // The HTML overlay (rendered by MapScr) sits at (lp.lx, lp.ly).
      const ta=lp.hAnch==="end"?"end":lp.hAnch==="start"?"start":"middle";
      const db=lp.vAnch==="end"?"text-after-edge":lp.vAnch==="start"?"text-before-edge":"central";
      return <g key={r.id} style={{pointerEvents:"none"}}>
        <line x1={lp.lx} y1={lp.ly} x2={r.cx} y2={r.cy} stroke={rcCol} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.65}/>
        <circle cx={r.cx} cy={r.cy} r={3.5} fill={rcCol} opacity={0.9}/>
        {labels&&<text x={lp.lx} y={lp.ly} textAnchor={ta} dominantBaseline={db} fill={rcCol} fontFamily="Cinzel" fontWeight={900} fontSize={compact?13:16} letterSpacing="2" style={{textShadow:`0 0 8px ${rcCol}, 0 2px 4px #000`,paintOrder:"stroke",stroke:"#000",strokeWidth:0.6}}>{r.name.toUpperCase()}</text>}
      </g>;
    })}
  </svg>);
}

// ═══════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════
function StartMap(){
  // null = probing, true = png available, false = use svg fallback
  const [hasPng,setHasPng]=useState(null);
  useEffect(()=>{
    let cancelled=false;
    fetch("/usa-map.png",{method:"HEAD",cache:"no-cache"})
      .then(r=>{
        const ct=r.headers.get("content-type")||"";
        if(!cancelled) setHasPng(r.ok&&ct.startsWith("image/"));
      })
      .catch(()=>{if(!cancelled) setHasPng(false);});
    return()=>{cancelled=true;};
  },[]);
  if(hasPng) return <img src="/usa-map.png" alt="USA regions" style={{maxWidth:"min(860px,88vw)",maxHeight:"100%",objectFit:"contain",filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.6))",display:"block"}}/>;
  return <USMap results={{}}/>;
}

function Start({go,howto,explore}){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"calc(100vh - 28px)",gap:10,padding:"10px 20px 14px",textAlign:"center",overflow:"hidden",boxSizing:"border-box"}}>
  <div style={{fontSize:13,letterSpacing:6,color:T.gd,fontFamily:T.hd,textShadow:`0 0 8px ${T.blu}`,marginTop:18}}>TEAM USA × ROLE PLAY GAME</div>
  <h1 style={{fontSize:42,fontFamily:T.hd,color:T.gold,margin:0,textShadow:`3px 3px 0 ${T.red}, 0 0 30px ${T.gold}66`,letterSpacing:3,lineHeight:1}}>OLYMPUS RISING</h1>
  <p style={{fontSize:"clamp(18px, 1.7vw, 28px)",color:T.txt,fontFamily:T.bd,lineHeight:1.3,fontStyle:"italic",margin:0,whiteSpace:"nowrap"}}>Monsters attack America before LA28. Summon the spirits of <span style={{color:T.gold,fontWeight:700,fontStyle:"normal"}}>Team USA sports</span> to <span style={{color:T.pur,fontWeight:700,fontStyle:"normal"}}>defend every region</span>.</p>
  <div style={{flex:"1 1 0",minHeight:0,width:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><StartMap/></div>
  <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
    {[{l:"How to Play",fn:howto,c:T.blu},{l:"Explore Sports",fn:explore,c:T.pur},{l:"Defend America",fn:go,c:T.gold,glow:true}].map(b=>(<button key={b.l} onClick={b.fn} style={{background:b.glow?`${b.c}1a`:"transparent",border:`2px solid ${b.c}`,color:b.c,fontFamily:T.hd,fontSize:11,padding:"10px 0",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",width:240,boxShadow:`0 0 10px ${b.c}55`,animation:b.glow?"defendGlow 1.6s ease-in-out infinite":undefined,textShadow:b.glow?`0 0 8px ${b.c}`:undefined}}>{b.l}</button>))}
  </div>
</div>);}

async function compressImageFile(file, maxEdge = 1024, quality = 0.85){
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const base64 = dataUrl.split(",")[1] || "";
    return { dataUrl, base64, mimeType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const RANK_LABELS = ["1st", "2nd", "3rd", "4th", "5th"];

function BodyQuiz({done}){
  const [unit,setUnit]=useState("imperial");
  const [ft,setFt]=useState("");const [inch,setInch]=useState("");const [cm,setCm]=useState("");
  const [lbs,setLbs]=useState("");const [kg,setKg]=useState("");
  const [photo,setPhoto]=useState(null); // {dataUrl, base64, mimeType} or null
  const [photoErr,setPhotoErr]=useState(null);
  const [personality,setPersonality]=useState({}); // {questionId: choiceText}
  const [results,setResults]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  const getH=()=>unit==="imperial"?(parseFloat(ft||0)*30.48+parseFloat(inch||0)*2.54):parseFloat(cm||0);
  const getW=()=>unit==="imperial"?(parseFloat(lbs||0)*0.4536):parseFloat(kg||0);
  const heightOk=()=>{const h=getH();return h>100&&h<260;};
  const weightOk=()=>{const w=getW();return w>20&&w<300;};
  const personalityComplete=PERSONALITY_QUESTIONS.every(q=>personality[q.id]);
  const canSubmit=heightOk()&&weightOk()&&personalityComplete&&!loading;

  const onPickPhoto=async(e)=>{
    const file=e.target.files?.[0];e.target.value="";if(!file)return;
    setPhotoErr(null);
    try{const result=await compressImageFile(file);setPhoto(result);}
    catch(err){console.error(err);setPhotoErr("Couldn't read that image. Try a JPEG or PNG.");}
  };

  const run=async()=>{
    setError(null);setLoading(true);
    try{
      const ranked=await matchSports({
        heightCm:getH(),weightKg:getW(),personality,
        photoBase64:photo?.base64,photoMimeType:photo?.mimeType,
      });
      if(!ranked.length)throw new Error("Empty ranking returned.");
      setResults(ranked);
    }catch(err){console.error(err);setError(err.message||"Sport matching failed.");}
    finally{setLoading(false);}
  };

  const IS={background:T.s2,border:`1px solid ${T.fnt}`,borderRadius:6,color:T.txt,fontFamily:T.bd,fontSize:21,padding:"8px 10px",width:70,textAlign:"center",outline:"none"};
  const sectionLabel={fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:3};
  const sectionBox={background:T.s1,border:`1px solid ${T.fnt}`,borderRadius:10,padding:14,width:"100%",maxWidth:520};

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:16}}>
    <div style={{fontSize:19,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>THE DELPHIC LENS</div>
    <h2 style={{fontSize:30,fontFamily:T.hd,color:T.gold,margin:0,textAlign:"center"}}>Sport Affinity Scanner</h2>
    <p style={{fontSize:22,color:T.dim,fontFamily:T.bd,maxWidth:480,lineHeight:1.6,fontStyle:"italic",textAlign:"center"}}>
      Enter your height + weight, optionally upload a photo, and answer 5 quick scenarios. Gemini ranks the 5 sports that fit you best out of 39 Team USA Olympic sports.
    </p>

    {/* ── Section 1: body ── */}
    <div style={sectionBox}>
      <div style={{...sectionLabel,marginBottom:10,textAlign:"center"}}>1. BODY</div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:4,background:T.s2,borderRadius:8,padding:3}}>
          {["imperial","metric"].map(u=>(<button key={u} onClick={()=>setUnit(u)} style={{background:unit===u?T.gold+"22":"transparent",border:unit===u?`1px solid ${T.gold}`:"1px solid transparent",color:unit===u?T.gold:T.dim,fontFamily:T.hd,fontSize:19,letterSpacing:2,borderRadius:6,padding:"6px 16px",cursor:"pointer",textTransform:"uppercase"}}>{u==="imperial"?"FT / LB":"CM / KG"}</button>))}
        </div>
      </div>
      <div style={{display:"flex",gap:16,alignItems:"flex-end",flexWrap:"wrap",justifyContent:"center"}}>
        {unit==="imperial"?(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>HEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input value={ft} onChange={e=>setFt(e.target.value)} placeholder="5" style={IS} type="number" min="3" max="8"/><span style={{color:T.dim,fontSize:22}}>ft</span>
            <input value={inch} onChange={e=>setInch(e.target.value)} placeholder="10" style={IS} type="number" min="0" max="11"/><span style={{color:T.dim,fontSize:22}}>in</span>
          </div>
        </div>):(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>HEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input value={cm} onChange={e=>setCm(e.target.value)} placeholder="178" style={{...IS,width:90}} type="number" min="100" max="250"/><span style={{color:T.dim,fontSize:22}}>cm</span>
          </div>
        </div>)}
        {unit==="imperial"?(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>WEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><input value={lbs} onChange={e=>setLbs(e.target.value)} placeholder="160" style={{...IS,width:90}} type="number" min="50" max="500"/><span style={{color:T.dim,fontSize:22}}>lbs</span></div>
        </div>):(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:2}}>WEIGHT</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><input value={kg} onChange={e=>setKg(e.target.value)} placeholder="73" style={{...IS,width:90}} type="number" min="20" max="250"/><span style={{color:T.dim,fontSize:22}}>kg</span></div>
        </div>)}
      </div>
    </div>

    {/* ── Section 2: photo (optional) ── */}
    <div style={sectionBox}>
      <div style={{...sectionLabel,marginBottom:10,textAlign:"center"}}>2. PHOTO <span style={{color:T.dim}}>(optional)</span></div>
      <div style={{display:"flex",gap:14,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
        {photo?(<>
          <img src={photo.dataUrl} alt="you" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`1px solid ${T.gold}55`}}/>
          <button onClick={()=>setPhoto(null)} style={{background:"transparent",border:`1px solid ${T.dim}`,color:T.dim,fontFamily:T.hd,fontSize:18,padding:"5px 10px",borderRadius:5,cursor:"pointer",letterSpacing:2,textTransform:"uppercase"}}>Remove</button>
        </>):(<label style={{cursor:"pointer",border:`1px dashed ${T.fnt}`,borderRadius:8,padding:"14px 22px",color:T.dim,fontFamily:T.bd,fontSize:20}}>
          <input type="file" accept="image/*" onChange={onPickPhoto} style={{display:"none"}}/>
          + Upload a photo of yourself
        </label>)}
      </div>
      {photoErr&&<div style={{color:T.red,fontSize:19,fontFamily:T.bd,textAlign:"center",marginTop:6}}>{photoErr}</div>}
      <p style={{fontSize:18,color:T.dim,fontFamily:T.bd,fontStyle:"italic",textAlign:"center",lineHeight:1.5,marginTop:8}}>Photo is sent to Gemini for analysis and not stored anywhere.</p>
    </div>

    {/* ── Section 3: personality ── */}
    <div style={sectionBox}>
      <div style={{...sectionLabel,marginBottom:10,textAlign:"center"}}>3. QUICK VIBE CHECK</div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {PERSONALITY_QUESTIONS.map((q)=>(<div key={q.id}>
          <div style={{fontFamily:T.hd,fontSize:22,color:T.txt,marginBottom:6}}>{q.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {q.choices.map((c)=>{const sel=personality[q.id]===c;return(<button key={c} onClick={()=>setPersonality(p=>({...p,[q.id]:c}))} style={{textAlign:"left",background:sel?T.gold+"18":T.s2,border:`1px solid ${sel?T.gold:T.fnt}`,color:sel?T.gold:T.txt,fontFamily:T.bd,fontSize:20,padding:"8px 12px",borderRadius:6,cursor:"pointer",lineHeight:1.4}}>{c}</button>);})}
          </div>
        </div>))}
      </div>
    </div>

    {/* ── Submit ── */}
    {!results&&(<>
      <Btn onClick={run} disabled={!canSubmit} color={T.gold}>{loading?"Reading the auras…":"Find My Sports"}</Btn>
      {error&&<div style={{color:T.red,fontFamily:T.bd,fontSize:20,maxWidth:480,textAlign:"center"}}>{error}</div>}
      <button onClick={()=>done(null)} style={{background:"none",border:"none",color:T.dim,fontFamily:T.bd,fontSize:20,cursor:"pointer",textDecoration:"underline"}}>Skip →</button>
    </>)}

    {/* ── Results ── */}
    {results&&(
      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:520}}>
        <div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:3,textAlign:"center"}}>YOUR TOP 5 SPORT MATCHES</div>
        {results.map((r,i)=>{const isFirst=i===0;return(
          <div key={r.sport} style={{background:T.s1,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,border:`1px solid ${isFirst?T.gold+"66":T.fnt}`,boxShadow:isFirst?`0 0 18px ${T.gold}22`:"none"}}>
            <div style={{minWidth:48,textAlign:"center"}}>
              <div style={{fontFamily:T.hd,fontSize:24,color:isFirst?T.gold:T.txt}}>{RANK_LABELS[i]||`${i+1}th`}</div>
            </div>
            <SportAvatar sport={r.sport} emoji={r.emoji} size={isFirst?72:56} radius={8}/>
            <div style={{flex:1,textAlign:"left"}}>
              <div style={{fontFamily:T.hd,color:isFirst?T.gold:T.txt,fontSize:24}}>{isFirst?"🏆 ":""}{r.sport}</div>
              <div style={{fontFamily:T.bd,color:T.dim,fontSize:19,marginTop:2}}>Avg: {Math.round(r.avgH)}cm / {Math.round(r.avgW)}kg · {r.n.toLocaleString()} athletes</div>
            </div>
          </div>
        );})}
        <div style={{marginTop:8,display:"flex",justifyContent:"center"}}><Btn onClick={()=>done(results)}>Continue to Battle</Btn></div>
      </div>
    )}
  </div>);
}

function HowTo({back,go}){
  const Card={background:"rgba(0,0,0,0.45)",border:`2px solid ${T.fnt}`,padding:18,width:"100%",boxSizing:"border-box"};
  const H={fontFamily:T.hd,fontSize:18,color:T.gold,margin:"0 0 10px",letterSpacing:2,textShadow:`0 0 8px ${T.gold}55`};
  const P={fontFamily:T.bd,fontSize:20,color:T.txt,lineHeight:1.55,margin:"0 0 8px"};
  const Strong=({c=T.gold,children})=><span style={{color:c,fontWeight:700}}>{children}</span>;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"22px 28px 60px",gap:18,maxWidth:1180,margin:"0 auto"}}>
    {/* Header */}
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:14,letterSpacing:6,color:T.blu,fontFamily:T.hd,textShadow:`0 0 8px ${T.blu}`}}>★ HOW TO PLAY ★</div>
      <h1 style={{fontFamily:T.hd,color:T.gold,margin:"8px 0 0",fontSize:38,letterSpacing:3,textShadow:`3px 3px 0 ${T.red}, 0 0 24px ${T.gold}66`,lineHeight:1.1}}>OLYMPUS RISING</h1>
    </div>

    {/* General Overview */}
    <div style={{...Card,borderColor:T.gold+"66"}}>
      <h2 style={{...H,fontSize:22,color:T.gold,marginBottom:14}}>📖 GENERAL OVERVIEW</h2>
      <p style={P}>Olympus Rising is designed as an exciting and educational experience where players defend America while learning about the <Strong>athletes, regions, sports, and shared milestones</Strong> that shaped Olympic and Paralympic history.</p>
      <p style={P}>Monsters are attacking <Strong c={T.red}>7 regions across the USA map</Strong>, draining America's Olympic and Paralympic spirit before LA28. To fight back, you summon <Strong>sport spirits</Strong>, each based on a real Olympic or Paralympic sport.</p>
      <p style={P}>Each spirit has combat moves inspired by real events. A <Strong c={T.blu}>Swimming Spirit</Strong> might use 100m Freestyle, 200m Backstroke, or 4×100m Relay. A <Strong c={T.pur}>Track & Field Spirit</Strong> might use 100m Sprint, 400m Hurdles, or Long Jump.</p>
      <p style={P}>Before the campaign begins, you take a short <Strong c={T.grn}>Sport Affinity Test</Strong>. The game finds your Top 5 sports, and spirits from those sports gain a <Strong c={T.blu}>+15% stat boost</Strong>.</p>
      <p style={{...P,margin:0}}>Spirits also grow stronger in regions where their sport has deep history, based on athlete origins, medals, and hometown support. The right spirit in the right region can hit much harder.</p>
    </div>

    {/* Gameplay header */}
    <div style={{textAlign:"center",marginTop:6}}>
      <div style={{fontSize:13,letterSpacing:6,color:T.pur,fontFamily:T.hd,textShadow:`0 0 8px ${T.pur}`}}>★ GAMEPLAY ★</div>
      <h2 style={{fontFamily:T.hd,color:T.txt,margin:"8px 0 0",fontSize:24,letterSpacing:2}}>Eight Steps to Defend America</h2>
    </div>

    {/* 8-step grid, 2 columns on desktop */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(440px, 1fr))",gap:16,width:"100%"}}>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>1.</span> 🗺️ CHOOSE A REGION</h3>
        <p style={{...P,margin:0}}>Pick one of the <Strong c={T.red}>7 regions</Strong> under attack. Each region has one monster slot, and when a monster falls, another eventually rises.</p>
      </div>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>2.</span> 🎯 SCOUT YOUR TEAM</h3>
        <p style={{...P,margin:0}}>Choose <Strong>3 sport spirits from 5</Strong>. Balance personal affinity, regional bonuses, sport moves, and monster weaknesses.</p>
      </div>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>3.</span> 🔮 MEET THE ORACLE</h3>
        <p style={P}>Before each battle, the Oracle asks a trivia question about the sport itself — <Strong>rules, equipment, scoring, Team USA team milestones, and Olympic or Paralympic sport history</Strong>.</p>
        <p style={{...P,margin:0}}>Answer correctly to earn a <Strong c={T.grn}>battle boost</Strong> and pick up a real fact along the way.</p>
      </div>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>4.</span> 👹 READ THE MONSTER</h3>
        <p style={{...P,margin:0}}>Each monster is AI-generated with a unique name, portrait, lore, stats, and ability. Some <Strong>target your strongest</Strong> spirit, some <Strong>pick off your weakest</Strong>, some <Strong>hit the whole team</Strong>, some <Strong>regenerate</Strong> each turn, and some <Strong c={T.red}>block any move under 25%</Strong>.</p>
      </div>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>5.</span> 📊 CHECK THE SIMULATION</h3>
        <p style={{...P,margin:0}}>A <Strong c={T.blu}>Monte Carlo simulation</Strong> estimates your win odds before combat begins, helping you understand the risk behind your choices.</p>
      </div>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>6.</span> ⚔️ BATTLE WITH SPORT MOVES</h3>
        <p style={P}>Choose a spirit, then pick one of their moves. Each move rolls against medal-style probabilities:</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,margin:"8px 0",fontFamily:T.bd,fontSize:18}}>
          <div><span style={{color:medalColors.gold}}>🥇 Gold</span> = <Strong c={medalColors.gold}>30 damage</Strong></div>
          <div><span style={{color:medalColors.silver}}>🥈 Silver</span> = <Strong c={medalColors.silver}>20 damage</Strong></div>
          <div><span style={{color:medalColors.bronze}}>🥉 Bronze</span> = <Strong c={medalColors.bronze}>10 damage</Strong></div>
          <div><span style={{color:T.dim}}>❌ Miss</span> = <Strong c={T.dim}>0 damage</Strong></div>
        </div>
        <p style={P}>Some moves are steady. Others are risky but explosive. A <Strong>4×100m Relay</Strong>, for example, might have a big gold chance but no silver chance.</p>
        <p style={{...P,margin:0}}>Each spirit has <Strong c={T.gold}>3 SP</Strong> — three attacks before they need to recover. When SP runs out, or when every move is blocked by the monster's ability, a <Strong c={T.grn}>💤 REST</Strong> option appears: spend the turn to gain <Strong c={T.grn}>+5 HP and +1 SP</Strong>. Tap a teammate's number badge to swap who's active mid-fight.</p>
      </div>

      <div style={Card}>
        <h3 style={H}><span style={{color:T.pur}}>7.</span> ✨ USE SPECIAL KEYWORDS</h3>
        <p style={P}>🤝 <Strong>RELAY</Strong> — Gold damage doubles</p>
        <p style={P}>💥 <Strong>EXPLOSIVE</Strong> — Gold deals 60 damage</p>
        <p style={P}>🎯 <Strong>PRECISION</Strong> — Gold or Silver adds +10 damage</p>
        <p style={{...P,margin:0}}>💚 <Strong c={T.grn}>ENDURANCE</Strong> — Any hit heals 8 HP</p>
      </div>

      <div style={{...Card,borderColor:T.para+"66"}}>
        <h3 style={{...H,color:T.para,textShadow:`0 0 8px ${T.para}55`}}><span style={{color:T.pur}}>8.</span> ⚡ PARALYMPIC POWERS</h3>
        <p style={P}>Paralympic spirits have <Strong c={T.para}>ADAPT</Strong>, a once-per-game ability that <Strong c={T.para}>cancels a monster attack</Strong>.</p>
        <p style={{...P,margin:0}}>Many Para moves also have strong medal odds, making them powerful attackers <em>and</em> clutch defenders.</p>
      </div>

    </div>

    {/* Closing line */}
    <div style={{...Card,borderColor:T.gold+"55",textAlign:"center",marginTop:8}}>
      <p style={{...P,margin:0,fontSize:20}}>There is <Strong c={T.red}>no final round</Strong>. As your campaign continues, your kill count and win streak grow, monsters return stronger, and each battle reveals more about the <Strong>athletes, regions, rivalries, and milestones</Strong> that shaped America's Olympic and Paralympic story.</p>
    </div>

    {/* Buttons — match the 2-col card grid above (same minmax, same gap, centered in each column) */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(440px, 1fr))",gap:16,marginTop:12,width:"100%"}}>
      <div style={{display:"flex",justifyContent:"center"}}>
        <button onClick={back} style={{background:"transparent",border:`2px solid ${T.dim}`,color:T.dim,fontFamily:T.hd,fontSize:12,padding:"12px 0",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",width:280}}>← Back</button>
      </div>
      <div style={{display:"flex",justifyContent:"center"}}>
        <button onClick={go} style={{background:"transparent",border:`2px solid ${T.gold}`,color:T.gold,fontFamily:T.hd,fontSize:12,padding:"12px 0",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",width:280,boxShadow:`0 0 12px ${T.gold}66`}}>★ Start Game ★</button>
      </div>
    </div>
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
    <div style={{width:"100%",display:"flex",justifyContent:"flex-start"}}>
      <button onClick={back} style={{background:"transparent",border:`2px solid ${T.dim}`,color:T.dim,fontFamily:T.hd,fontSize:11,padding:"8px 14px",cursor:"pointer",letterSpacing:2,textTransform:"uppercase"}}>← Back to Menu</button>
    </div>
    <div style={{fontSize:19,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>SPORT EXPLORER</div>
    <h2 style={{fontSize:24,fontFamily:T.hd,color:T.gold,margin:0}}>Browse All Spirits</h2>
    <p style={{fontSize:20,color:T.dim,fontFamily:T.bd,fontStyle:"italic"}}>Study the stats. Know your sports. Win the trivia.</p>
    {/* Filter tabs */}
    <div style={{display:"flex",gap:4,background:T.s1,borderRadius:8,padding:3}}>
      {[["all","All ("+SPIRITS.length+")"],["summer","Summer"],["winter","Winter"],["para","Paralympic"]].map(([k,label])=>(
        <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?T.gold+"22":"transparent",border:filter===k?`1px solid ${T.gold}`:"1px solid transparent",color:filter===k?T.gold:T.dim,fontFamily:T.hd,fontSize:17,letterSpacing:1,borderRadius:5,padding:"5px 12px",cursor:"pointer"}}>{label}</button>
      ))}
    </div>
    {/* Sport grid */}
    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
      {filtered.map(s=>{
        const st=sportStatsData[s.sport];
        const medals=st?(st.totalMedals.gold+st.totalMedals.silver+st.totalMedals.bronze):0;
        return(<div key={s.id} onClick={()=>setSel(s.id)} style={{width:150,background:`linear-gradient(150deg,${T.s1},${T.s2})`,border:`1px solid ${T.fnt}`,borderRadius:10,padding:10,cursor:"pointer",transition:"all .2s",display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
          <SportAvatar sport={s.sport} emoji={s.emoji} size={120} radius={8}/>
          <div style={{fontFamily:T.hd,fontSize:11,color:T.txt,textAlign:"center",lineHeight:1.4,overflowWrap:"break-word",width:"100%",minHeight:32,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.sport}</div>
          <div style={{display:"flex",justifyContent:"center",gap:6,fontSize:17,fontFamily:T.bd}}>
            {medals>0&&<span style={{color:T.gold}}>🏅{medals}</span>}
            {st?.la28&&<span style={{color:T.grn}}>LA28</span>}
          </div>
          {s.para&&<div style={{fontSize:14,color:T.para,textAlign:"center",fontFamily:T.hd,letterSpacing:1}}>PARALYMPIC</div>}
        </div>);
      })}
    </div>
  </div>);
}

function SportDetail({spirit,stats,body,back}){
  const decadeData=Object.entries(stats.medalsByDecade||{}).map(([dec,v])=>({decade:dec+"s",gold:v[0],silver:v[1],bronze:v[2]}));
  const totalMedals=stats.totalMedals.gold+stats.totalMedals.silver+stats.totalMedals.bronze;
  const genderTotal=(stats.gender.Male||0)+(stats.gender.Female||0);
  const femalePct=genderTotal>0?Math.round((stats.gender.Female||0)/genderTotal*100):null;
  const B={background:T.s1,borderRadius:10,padding:14,width:"100%"};
  const H={fontFamily:T.hd,fontSize:22,color:T.gold,margin:"0 0 8px",letterSpacing:2};

  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:12,maxWidth:540,margin:"0 auto"}}>
    <div style={{width:"100%",display:"flex",justifyContent:"flex-start"}}>
      <button onClick={back} style={{background:"transparent",border:`2px solid ${T.dim}`,color:T.dim,fontFamily:T.hd,fontSize:11,padding:"8px 14px",cursor:"pointer",letterSpacing:2,textTransform:"uppercase"}}>← Back to All Sports</button>
    </div>
    {/* Header */}
    <div style={{textAlign:"center"}}>
      <SportAvatar sport={spirit.sport} emoji={spirit.emoji} size={160} radius={14} style={{margin:"0 auto",boxShadow:`0 0 20px ${T.gold}55`,border:`2px solid ${T.gold}66`}}/>
      <h2 style={{fontFamily:T.hd,fontSize:26,color:T.gold,margin:"10px 0 4px"}}>{spirit.sport}</h2>
      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:17,background:T.blu+"22",color:T.blu,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>{stats.season}</span>
        {stats.la28&&<span style={{fontSize:17,background:T.grn+"22",color:T.grn,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>{stats.isNew?"NEW AT LA28":"IN LA28"}</span>}
        {spirit.para&&<span style={{fontSize:17,background:T.para+"22",color:T.para,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>PARALYMPIC</span>}
      </div>
    </div>

    {/* Fun fact */}
    <div style={{...B,borderColor:T.gold+"33",border:`1px solid ${T.gold}33`}}>
      <p style={{fontFamily:T.bd,fontSize:22,color:T.txt,lineHeight:1.7,margin:0,fontStyle:"italic"}}>💡 {stats.funFact}</p>
    </div>

    {/* Medal summary */}
    <div style={B}>
      <div style={H}>🏅 MEDAL COUNT</div>
      <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:medalColors.gold}}>{stats.totalMedals.gold}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>🥇 Gold</div></div>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:medalColors.silver}}>{stats.totalMedals.silver}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>🥈 Silver</div></div>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:medalColors.bronze}}>{stats.totalMedals.bronze}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>🥉 Bronze</div></div>
        <div><div style={{fontSize:24,fontFamily:T.hd,color:T.txt}}>{totalMedals}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Total</div></div>
      </div>
    </div>

    {/* Medal trend chart */}
    {decadeData.length>0&&<div style={B}>
      <div style={H}>📈 MEDALS BY DECADE</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={decadeData} margin={{top:5,right:5,bottom:5,left:-20}}>
          <XAxis dataKey="decade" tick={{fontSize:17,fill:T.dim,fontFamily:"Crimson Pro"}} axisLine={{stroke:T.fnt}} tickLine={false}/>
          <YAxis tick={{fontSize:17,fill:T.dim}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:T.s2,border:`1px solid ${T.fnt}`,borderRadius:6,fontFamily:"Crimson Pro",fontSize:19}} labelStyle={{color:T.gold,fontFamily:"Cinzel"}}/>
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
            <span style={{fontSize:19,color:T.txt,fontFamily:T.bd}}>{i===0?"🏆 ":""}{ev.name}</span>
            <span style={{fontSize:18,color:T.dim,fontFamily:T.bd}}>{Math.min(100,Math.round((ev.gold+ev.silver+ev.bronze)*100))}% hit</span>
          </div>
          <MoveBar move={[ev.name,ev.gold,ev.silver,ev.bronze,null]}/>
        </div>
      ))}
    </div>}

    {/* Body profile */}
    {body&&<div style={B}>
      <div style={H}>📏 ATHLETE BODY PROFILE</div>
      <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
        <div><div style={{fontSize:20,fontFamily:T.hd,color:T.txt}}>{body.avgH}<span style={{fontSize:19,color:T.dim}}>cm</span></div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Avg Height</div></div>
        <div><div style={{fontSize:20,fontFamily:T.hd,color:T.txt}}>{body.avgW}<span style={{fontSize:19,color:T.dim}}>kg</span></div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Avg Weight</div></div>
        <div><div style={{fontSize:20,fontFamily:T.hd,color:T.txt}}>{body.n.toLocaleString()}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Athletes</div></div>
      </div>
    </div>}

    {/* Regional strongholds */}
    <div style={B}>
      <div style={H}>🗺️ REGIONAL STRONGHOLDS</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
        {spirit.regions.map(r=>{const rg=REGIONS.find(x=>x.id===r);return rg?<span key={r} style={{fontSize:18,background:rg.color+"22",color:rg.color,padding:"3px 10px",borderRadius:5,fontFamily:T.bd}}>{rg.name}</span>:null;})}
      </div>
    </div>

    {/* Gender split */}
    {femalePct!==null&&<div style={B}>
      <div style={H}>👥 GENDER PARTICIPATION</div>
      <div style={{display:"flex",height:16,borderRadius:4,overflow:"hidden",width:"100%"}}>
        <div style={{width:`${100-femalePct}%`,background:T.blu,transition:"width .3s"}}/>
        <div style={{width:`${femalePct}%`,background:T.pur,transition:"width .3s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:18,color:T.dim,fontFamily:T.bd,marginTop:4}}>
        <span style={{color:T.blu}}>♂ {100-femalePct}% Male</span>
        <span style={{color:T.pur}}>♀ {femalePct}% Female</span>
      </div>
    </div>}

    {/* Quick stats */}
    <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
      {stats.firstYear&&<div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:24,fontFamily:T.hd,color:T.txt}}>{stats.firstYear}</div><div style={{fontSize:16,color:T.dim,fontFamily:T.bd}}>First Olympics</div></div>}
      <div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:24,fontFamily:T.hd,color:T.txt}}>{stats.gamesCount}</div><div style={{fontSize:16,color:T.dim,fontFamily:T.bd}}>Games</div></div>
      <div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:24,fontFamily:T.hd,color:T.txt}}>{stats.eventCount}</div><div style={{fontSize:16,color:T.dim,fontFamily:T.bd}}>Events</div></div>
      <div style={{background:T.s2,borderRadius:6,padding:"6px 12px",textAlign:"center"}}><div style={{fontSize:24,fontFamily:T.hd,color:T.txt}}>{stats.totalAthletes.toLocaleString()}</div><div style={{fontSize:16,color:T.dim,fontFamily:T.bd}}>Athletes</div></div>
    </div>
  </div>);
}

function MapScr({slots,hud,onPick,onReset}){
  const liveCount=Object.values(slots).filter(Boolean).length;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",gap:18}}>
    <div style={{fontSize:22,color:T.blu,fontFamily:T.hd,letterSpacing:5,textShadow:`0 0 8px ${T.blu}`}}>★ ENDLESS DEFENSE — TAP A REGION TO ENGAGE ★</div>
    {/* HUD */}
    <div style={{display:"flex",gap:24,background:"rgba(0,0,0,0.55)",border:`2px solid ${T.pur}`,padding:"10px 22px",fontFamily:T.bd,fontSize:22,color:T.txt,boxShadow:`0 0 14px ${T.pur}66`}}>
      <span>⚔ Kills <span style={{color:T.gold,fontWeight:700,fontFamily:T.hd,fontSize:21,marginLeft:6,textShadow:`0 0 6px ${T.gold}`}}>{hud.kills}</span></span>
      <span>🔥 Streak <span style={{color:hud.streak>=3?T.gold:T.txt,fontWeight:700,fontFamily:T.hd,fontSize:21,marginLeft:6,textShadow:hud.streak>=3?`0 0 6px ${T.gold}`:"none"}}>{hud.streak}</span></span>
      <span>🛡 Held <span style={{color:T.grn,fontWeight:700,fontFamily:T.hd,fontSize:21,marginLeft:6,textShadow:`0 0 6px ${T.grn}`}}>{liveCount}/{ACTIVE_REGIONS.length}</span></span>
    </div>
    {/* Map + slot card overlay. Outer container has padding so cards anchored
        at the top/bottom edges of the SVG can extend into that space. Inner
        container locks the same aspect-ratio as the SVG viewBox so the
        percentage anchors line up exactly with what USMap renders. */}
    <div style={{position:"relative",width:"100%",maxWidth:980,padding:"70px 8px",boxSizing:"border-box"}}>
      <div style={{position:"relative",width:"100%",maxWidth:820,aspectRatio:"758 / 420",margin:"0 auto"}}>
        <USMap slots={slots} onPick={onPick} labels={false}/>
        {ACTIVE_REGIONS.map(rg=>{
          const lp=MAP_LP[rg.id];if(!lp)return null;
          const m=slots[rg.id];const live=!!m;
          return(<div key={rg.id} onClick={live?()=>onPick(rg.id):undefined} style={{...mapLpStyle(lp),width:200,background:"rgba(0,0,0,0.92)",border:`2px solid ${live?rg.color:T.fnt}`,padding:6,cursor:live?"pointer":"default",opacity:live?1:.6,display:"flex",gap:8,alignItems:"center",boxShadow:live?`0 0 10px ${rg.color}66`:"none",pointerEvents:live?"auto":"none"}}>
            {m?(m.imageDataUrl?<img src={m.imageDataUrl} alt={m.name} style={{width:54,height:54,objectFit:"cover",flexShrink:0,border:`2px solid ${rg.color}88`}}/>:<div style={{width:54,height:54,background:T.s2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:28,border:`2px solid ${rg.color}66`,position:"relative"}}>{m.emoji}{m.imageStatus==="loading"&&<div style={{position:"absolute",bottom:0,right:1,fontSize:13,color:T.gold,animation:"blink 1s infinite"}}>✨</div>}</div>):<div style={{width:54,height:54,background:T.s2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20,color:T.dim,fontFamily:T.bd,fontStyle:"italic",border:`2px dashed ${T.fnt}`}}>…</div>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:rg.color,fontFamily:T.hd,letterSpacing:1.5,textShadow:`0 0 4px ${rg.color}`}}>{rg.name.toUpperCase()}</div>
              <div style={{fontFamily:T.bd,fontSize:14,color:live?T.txt:T.dim,overflowWrap:"break-word",lineHeight:1.2,marginTop:2}}>{m?m.name:"Summoning…"}</div>
              {m&&<div style={{fontSize:12,color:T.dim,fontFamily:T.bd,marginTop:2}}>{m.hp} HP{m.level>1?` · Lv ${m.level}`:""}</div>}
            </div>
          </div>);
        })}
      </div>
    </div>
    <Btn onClick={onReset} color={T.red}>Reset Campaign</Btn>
  </div>);
}

function Scout({opts,lockIn,round,rgn,bodyTop5=[]}){
  const [sel,setSel]=useState(new Set());
  const [exp,setExp]=useState(null);
  const [ins,setIns]=useState({});const [ld,setLd]=useState({});
  const rg=REGIONS.find(r=>r.id===rgn);
  const toggle=s=>{setSel(p=>{const n=new Set(p);if(n.has(s.id))n.delete(s.id);else if(n.size<3)n.add(s.id);return n;});};
  const explore=async s=>{if(exp===s.id){setExp(null);return;}setExp(s.id);if(!ins[s.id]){setLd(p=>({...p,[s.id]:true}));const best=s.moves.reduce((a,b)=>b[2]>a[2]?b:a);const aff=s.regions.includes(rgn)||rgn==="la28";const t=await gemini(`Oracle in Team USA card game. Spirit: "${s.sport}" (${s.para?"Paralympic":"Olympic"}) with ${s.moves.length} event moves. Best move: "${best[1]}" (in-game name: "${best[0]}") has ${Math.round(best[2]*100)}% gold rate. ${aff?"+50% affinity with "+rg?.name+".":""} 2 sentences for a 12-year-old: what the gold rate means in real life, one cool fact about the sport itself in Team USA history. Brief, exciting.\n${NIL_RULES}`);setIns(p=>({...p,[s.id]:t||`${s.sport} has ${s.moves.length} moves. Best gold rate: ${Math.round(best[2]*100)}%. ${aff?"Strong here!":"A solid pick."}`}));setLd(p=>({...p,[s.id]:false}));}};
  const team=opts.filter(s=>sel.has(s.id));
  const syn=team.length===3?detectSynergies(team,rgn):null;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:16,gap:12}}>
    <div style={{fontSize:17,color:T.gd,fontFamily:T.hd,letterSpacing:4}}>DEFENDING — DRAFT YOUR TEAM</div>
    <h2 style={{fontFamily:T.hd,color:T.gold,margin:0,fontSize:20}}>Pick 3 of 5 Spirits</h2>
    <p style={{fontFamily:T.bd,color:T.dim,fontSize:19}}>Defending <span style={{color:rg?.color,fontWeight:700}}>{rg?.name}</span> · Tap cards to draft · Tap Explore to study</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",alignItems:"stretch"}}>
      {opts.map(s=>{const picked=sel.has(s.id);return(<div key={s.id} style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center"}}>
        <div onClick={()=>toggle(s)} style={{cursor:"pointer",opacity:!picked&&sel.size>=3?.4:1,transition:"all .2s",flex:1,display:"flex"}}>
          <SpiritCard spirit={s} rgn={rgn} selected={picked} bodyMatch={bodyTop5.some(b=>b.sport===s.sport)}/>
        </div>
        <Btn small onClick={()=>explore(s)} color={exp===s.id?T.grn:T.blu}>{exp===s.id?"Close":"🔍 Explore"}</Btn>
        {exp===s.id&&<div style={{background:T.s1,border:`1px solid ${T.blu}22`,borderRadius:8,padding:10,width:230}}>
          <div style={{fontFamily:T.bd,fontSize:19,color:T.txt,lineHeight:1.6}}>{ld[s.id]?<span style={{color:T.dim}}>Oracle speaks...</span>:ins[s.id]}</div>
        </div>}
      </div>);})}
    </div>
    {/* Synergy preview */}
    {syn&&<div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
      {syn.rally&&<span style={{fontSize:17,background:T.grn+"22",color:T.grn,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>🏟️ REGIONAL RALLY +10%</span>}
      {syn.relayChain&&<span style={{fontSize:17,background:T.gold+"22",color:T.gold,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>🤝 RELAY CHAIN</span>}
      {syn.explosiveChain&&<span style={{fontSize:17,background:T.red+"22",color:T.red,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>💥 EXPLOSIVE CHAIN</span>}
      {syn.precisionChain&&<span style={{fontSize:17,background:T.blu+"22",color:T.blu,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>🎯 PRECISION CHAIN</span>}
      {syn.enduranceChain&&<span style={{fontSize:17,background:T.grn+"22",color:T.grn,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>💚 ENDURANCE CHAIN</span>}
      {syn.paraAlliance&&<span style={{fontSize:17,background:T.para+"22",color:T.para,padding:"2px 8px",borderRadius:4,fontFamily:T.hd}}>⚡ PARA ALLIANCE</span>}
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
${NIL_RULES}
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
    <div style={{fontSize:19,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>THE ORACLE RITE</div>
    <SportAvatar sport={spirit.sport} emoji={spirit.emoji} size={120} radius={10} style={{boxShadow:`0 0 16px ${T.gold}55`,border:`2px solid ${T.gold}66`}}/>
    <h2 style={{fontSize:22,fontFamily:T.hd,color:T.gold,margin:0}}>{spirit.sport}</h2>

    {loading?(
      <div style={{fontFamily:T.bd,color:T.dim,fontStyle:"italic",fontSize:24,marginTop:20}}>The Oracle prepares a trial...</div>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:440,marginTop:8}}>
        <p style={{fontFamily:T.bd,color:T.txt,fontSize:20,lineHeight:1.6}}>{qData.q}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {qData.c.map((choice,i)=>{
            const isCorrect=i===qData.a;const isSel=sel===i;
            const bg=sel===null?T.s1:isCorrect?T.grn+"22":isSel?T.red+"22":T.s1;
            const border=sel===null?T.fnt:isCorrect?T.grn:isSel?T.red:T.fnt;
            return(<button key={i} onClick={()=>{if(sel===null)setSel(i);}} style={{background:bg,border:`1px solid ${border}`,borderRadius:8,padding:"10px 14px",cursor:sel===null?"pointer":"default",textAlign:"left",fontFamily:T.bd,fontSize:22,color:isCorrect&&sel!==null?T.grn:isSel&&wrong?T.red:T.txt,transition:"all .2s"}}>
              <span style={{fontFamily:T.hd,color:T.gd,marginRight:8}}>{String.fromCharCode(65+i)}.</span>{choice}
              {sel!==null&&isCorrect&&" ✓"}
            </button>);
          })}
        </div>

        {sel!==null&&(
          <div style={{fontFamily:T.bd,fontSize:22,color:correct?T.grn:T.red,fontStyle:"italic",marginTop:4}}>
            {correct?"The Oracle approves! Knowledge is power.":"The Oracle shakes its head... but now you know!"}
          </div>
        )}

        {sel!==null&&<Btn onClick={onComplete}>Continue to Battle</Btn>}
      </div>
    )}

    <button onClick={onComplete} style={{background:"none",border:"none",color:T.dim,fontFamily:T.bd,fontSize:19,cursor:"pointer",textDecoration:"underline",marginTop:8}}>Skip trivia →</button>
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
  const [fx,setFx]=useState(null); // {type:'gold'|'silver'|'bronze'|'miss'|'block', dmg, side:'mon'|'spirit', t}
  const lr=useRef(null);
  useEffect(()=>{lr.current&&(lr.current.scrollTop=lr.current.scrollHeight);},[log]);
  useEffect(()=>{if(turn>1)window.dispatchEvent(new CustomEvent("arc-announce",{detail:{text:`ROUND ${turn}`,sub:"FIGHT!",color:T.gold,dur:1100}}));},[turn]);
  useEffect(()=>{if(!fx)return;const id=setTimeout(()=>setFx(null),900);return()=>clearTimeout(id);},[fx]);

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
      ns[activeIdx].sp=Math.min(SP_MAX,ns[activeIdx].sp+1);
      nl.push(`${s.emoji} ${s.sport} rests — +5 HP, +1 SP.`);
    }else{
      ns[activeIdx].sp--;
      const anyBlock=target.special==="block_weak"&&totalRate(move)<.25;
      if(anyBlock){
        nl.push(`🚫 ${move[0]} blocked by ${target.name}! Hit rate too low.`);
        setFx({type:"block",dmg:0,side:"mon",t:Date.now()});
      }else{
        const aff=s.regions.includes(rgn)||rgn==="la28";
        const bAff=bodyTop5.some(b=>b.sport===s.sport);
        const result=rollMove(move,aff,bAff,syn);
        const emoji=result.tier==="gold"?"🥇":result.tier==="silver"?"🥈":result.tier==="bronze"?"🥉":"❌";
        if(result.tier==="miss"){
          nl.push(`${s.emoji} ${s.sport} → ${move[0]} → ${emoji} MISS!`);
          setFx({type:"miss",dmg:0,side:"mon",t:Date.now()});
        }else{
          const totalDmg=result.total;
          const ti=ms.findIndex(x=>x.name===target.name);
          nm[ti]={...nm[ti],hp:Math.max(0,nm[ti].hp-totalDmg)};
          nl.push(`${s.emoji} ${s.sport} → ${move[0]} → ${emoji} ${result.tier.toUpperCase()} ${totalDmg} dmg!${result.extra}`);
          if(nm[ti].hp<=0)nl.push(`🏆 ${nm[ti].name} defeated!`);
          setFx({type:result.tier,dmg:totalDmg,side:"mon",t:Date.now()});
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
        const dmg=20+round*9;
        if(mon.special==="aoe"){
          const aoeD=15+round*5;
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
      }
      setMs(nm2);setSpirits(ns2);setLog(p=>[...p,"─── Monster Phase ───",...ml]);
      if(ns2.every(x=>x.hp<=0)){setLog(p=>[...p,...ml,"💀 All spirits exhausted..."]);setPh("done");}
      else{setTurn(t=>t+1);const nxtS=nextActive(ns2,0);setActiveIdx(nxtS||0);setSelTarget(nm2.findIndex(m=>m.hp>0));setPh("player");}
    }
  };

  const active=spirits[activeIdx];
  const won=ms.every(m=>m.hp<=0);
  const target=ms[selTarget]||ms[0];
  const teamHp=spirits.reduce((a,s)=>a+Math.max(0,s.hp),0);
  const teamMax=spirits.length*HP;
  const sparkColor=fx?(fx.type==="gold"?T.gold:fx.type==="silver"?medalColors.silver:fx.type==="bronze"?medalColors.bronze:fx.type==="miss"?T.dim:T.red):null;

  // Pixel HP segmented bar (matches arcade mockup)
  const PixelBar=({hp,max,color,height=14,segments=20})=>{const filled=Math.round((Math.max(0,hp)/max)*segments);return(<div style={{display:"flex",gap:1,height,background:"#000",padding:2,border:`2px solid ${T.txt}`}}>{Array.from({length:segments}).map((_,i)=>{const lit=i<filled;const danger=lit&&filled<=4?T.red:color;return<div key={i} style={{flex:1,background:lit?danger:T.s1,boxShadow:lit?`0 0 5px ${danger}`:"none"}}/>;})}</div>);};

  return(<div style={{padding:"24px 14px 8px",maxWidth:1280,margin:"0 auto"}}>
    {/* ───── TOP HUD: TEAM HP | VS | MONSTER HP ───── */}
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 180px minmax(0,1fr)",gap:14,marginBottom:8,alignItems:"start"}}>
      {/* TEAM HP block */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:T.hd,fontSize:19,color:T.gold,letterSpacing:2,textShadow:`0 0 6px ${T.gold}`}}>P1 · TEAM USA</span>
          <span style={{fontFamily:T.hd,fontSize:18,color:T.txt}}>{teamHp}/{teamMax}</span>
        </div>
        <PixelBar hp={teamHp} max={teamMax} color={T.grn} height={20}/>
        {active&&<div style={{marginTop:8,padding:8,background:T.gold+"22",border:`2px solid ${T.gold}`,boxShadow:`0 0 10px ${T.gold}88`,position:"relative",display:"flex",alignItems:"center",gap:10}}>
          <span style={{position:"absolute",top:-10,left:6,background:T.gold,color:T.bg,fontFamily:T.hd,fontSize:14,letterSpacing:1,padding:"2px 6px",animation:"blink 1s infinite"}}>P1</span>
          <SportAvatar sport={active.sport} emoji={active.emoji} size={42} radius={4}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8,fontFamily:T.hd,fontSize:17,letterSpacing:1,color:T.gold,whiteSpace:"nowrap",overflow:"hidden"}}>
              <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{active.sport.toUpperCase()}</span>
              <span style={{fontSize:15,color:T.dim,letterSpacing:1}}>HP {active.hp}/{HP}</span>
            </div>
            <div style={{marginTop:4}}><PixelBar hp={active.hp} max={HP} color={active.hp>HP*.4?T.grn:T.red} height={7} segments={20}/></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4,gap:8}}>
              <span style={{display:"flex",gap:3}}>{spirits.map((s,i)=>(<button key={s.id} onClick={()=>{if(s.hp>0&&ph==="player")setActiveIdx(i);}} title={s.sport} style={{width:18,height:18,padding:0,background:i===activeIdx?T.gold:s.hp<=0?T.fnt:"transparent",border:`1px solid ${i===activeIdx?T.gold:s.hp<=0?T.fnt:T.pur}`,color:i===activeIdx?T.bg:s.hp<=0?T.bg:T.txt,fontFamily:T.hd,fontSize:11,cursor:s.hp>0&&ph==="player"&&i!==activeIdx?"pointer":"default",opacity:s.hp<=0?.4:1}}>{i+1}</button>))}</span>
              <span style={{display:"flex",gap:2,alignItems:"center"}}><span style={{fontFamily:T.hd,fontSize:13,color:T.dim,marginRight:4}}>SP</span>{Array.from({length:SP_MAX},(_,j)=><span key={j} style={{width:6,height:6,background:j<active.sp?T.gold:T.fnt,boxShadow:j<active.sp?`0 0 3px ${T.gold}`:"none"}}/>)}</span>
              {active.para&&!active.ac&&active.hp>0&&ph!=="done"&&<button onClick={()=>{if(!active.au)setSpirits(p=>p.map((x,j)=>j===activeIdx?{...x,au:true}:x));}} style={{fontSize:13,background:active.au?T.para+"33":"transparent",border:`1px solid ${active.au?T.para:T.fnt}`,color:active.au?T.para:T.dim,padding:"2px 8px",cursor:"pointer",fontFamily:T.hd,letterSpacing:1}}>{active.au?"⚡ARMED":"⚡ARM"}</button>}
            </div>
          </div>
        </div>}
      </div>

      {/* VS center */}
      <div style={{textAlign:"center",padding:"2px 0"}}>
        <div style={{fontFamily:T.hd,fontSize:15,letterSpacing:3,color:T.blu,textShadow:`0 0 6px ${T.blu}`}}>ROUND {turn}</div>
        <div style={{fontFamily:T.hd,fontSize:30,color:T.gold,textShadow:`3px 3px 0 ${T.red}, 0 0 22px ${T.gold}`,animation:"pulse 1.6s infinite",margin:"2px 0"}}>VS</div>
        <div style={{fontFamily:T.hd,fontSize:14,letterSpacing:3,color:T.pur,textShadow:`0 0 6px ${T.pur}`,animation:"blink .8s infinite"}}>{ph==="done"?(won?"WIN!":"K.O."):"FIGHT!"}</div>
      </div>

      {/* MONSTER HP block */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:T.hd,fontSize:18,color:T.txt}}>{Math.max(0,target.hp)}/{target.maxHp}</span>
          <span style={{fontFamily:T.hd,fontSize:19,color:T.red,letterSpacing:2,textShadow:`0 0 6px ${T.red}`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(target.name||"BOSS").toUpperCase()}</span>
        </div>
        <PixelBar hp={target.hp} max={target.maxHp} color={T.red} height={20}/>
        {ms.length>1&&<div style={{display:"flex",gap:6,marginTop:8}}>
          {ms.map((m,i)=>(<div key={m.name||i} onClick={()=>m.hp>0&&ph==="player"&&setSelTarget(i)} style={{flex:1,padding:6,background:i===selTarget?T.red+"22":"rgba(0,0,0,0.45)",border:`2px solid ${i===selTarget?T.red:m.hp<=0?T.fnt:T.pur}`,cursor:m.hp>0&&ph==="player"?"pointer":"default",opacity:m.hp<=0?.35:1,boxShadow:i===selTarget?`0 0 10px ${T.red}88`:"none",position:"relative"}}>
            {i===selTarget&&<span style={{position:"absolute",top:-10,right:4,background:T.red,color:T.bg,fontFamily:T.hd,fontSize:16,letterSpacing:1,padding:"2px 5px",animation:"blink 1s infinite"}}>LOCK</span>}
            <div style={{fontFamily:T.hd,fontSize:16,letterSpacing:1,color:i===selTarget?T.red:T.txt,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.emoji||"👹"} {(m.name||"").toUpperCase().slice(0,12)}</div>
            <PixelBar hp={m.hp} max={m.maxHp} color={T.red} height={7} segments={12}/>
            <div style={{fontFamily:T.hd,fontSize:16,color:T.dim,marginTop:3}}>HP {Math.max(0,m.hp)}</div>
          </div>))}
        </div>}
        {target.special&&<div style={{marginTop:8,padding:"6px 8px",background:"rgba(255,57,57,0.08)",border:`2px solid ${T.red}`,fontFamily:T.bd,fontSize:24,color:T.txt}}>
          <span style={{color:T.red,fontFamily:T.hd,fontSize:16,letterSpacing:1.5,textShadow:`0 0 4px ${T.red}`}}>⚠ ABILITY:</span>{" "}
          <span style={{color:T.gold}}>{target.special==="regenerate"?"REGEN":target.special==="aoe"?"ALL-STRIKE":target.special==="block_weak"?"AEGIS BLOCK":target.special==="hit_strongest"?"TARGET ALPHA":target.special==="hit_weakest"?"PICK OFF":target.special.toUpperCase()}</span>
        </div>}
      </div>
    </div>

    {/* ───── CENTER STAGE: PORTRAITS + HIT-SPARKS ───── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,marginBottom:8,minHeight:200,position:"relative",border:`2px solid ${T.fnt}`,background:"#000",backgroundImage:`repeating-linear-gradient(0deg, ${T.blu}11 0 1px, transparent 1px 40px),repeating-linear-gradient(90deg, ${T.blu}11 0 1px, transparent 1px 40px)`}}>
      {/* SPIRIT side */}
      <div style={{padding:10,textAlign:"center",background:`radial-gradient(circle at 50% 60%, ${T.blu}33 0%, transparent 70%)`,borderRight:`2px dashed ${T.gold}`,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {active?<SportAvatar sport={active.sport} emoji={active.emoji} size={140} radius={12} style={{filter:`drop-shadow(0 0 22px ${T.blu}) drop-shadow(0 8px 4px rgba(0,0,0,0.6))`,animation:"pulse 1.6s infinite",border:`3px solid ${T.blu}66`}}/>:<div style={{fontSize:120,lineHeight:1,filter:`drop-shadow(0 0 22px ${T.blu})`}}>⚔</div>}
        <div style={{fontFamily:T.hd,fontSize:18,color:T.gold,letterSpacing:2,marginTop:6,textShadow:`0 0 8px ${T.gold}`}}>{active?.sport?.toUpperCase()||"—"}</div>
        {ph==="player"&&selMove!=null&&selMove!=="rest"&&active?.moves?.[selMove]&&<div style={{textAlign:"center",marginTop:4}}>
          <div style={{fontFamily:T.hd,fontSize:17,color:T.pur,letterSpacing:2,textShadow:`0 0 6px ${T.pur}`,animation:"blink .9s infinite"}}>{active.moves[selMove][0].toUpperCase()}</div>
          <div style={{fontFamily:T.bd,fontSize:19,color:T.txt,letterSpacing:1,marginTop:4,fontStyle:"italic"}}>{active.moves[selMove][1]}</div>
        </div>}
      </div>

      {/* MONSTER side */}
      <div style={{padding:10,textAlign:"center",background:`radial-gradient(circle at 50% 60%, ${T.red}33 0%, transparent 70%)`,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {target.imageDataUrl
          ? <img src={target.imageDataUrl} alt={target.name} style={{maxWidth:"80%",maxHeight:140,objectFit:"contain",filter:`drop-shadow(0 0 18px ${T.red})`,animation:"pulse 2s infinite"}}/>
          : <div style={{fontSize:120,lineHeight:1,filter:`drop-shadow(0 0 22px ${T.red})`,animation:"pulse 2s infinite"}}>{target.emoji||"👹"}</div>}
        <div style={{fontFamily:T.hd,fontSize:18,color:T.red,letterSpacing:2,marginTop:6,textShadow:`0 0 8px ${T.red}`}}>{(target.name||"BOSS").toUpperCase()}</div>
        {target.imageStatus==="loading"&&<div style={{position:"absolute",top:8,right:8,fontFamily:T.hd,fontSize:16,color:T.gold,background:"rgba(0,0,0,0.65)",padding:"3px 8px",letterSpacing:2,animation:"blink 1s infinite"}}>✨ RENDERING</div>}

        {/* Hit-spark FX */}
        {fx&&fx.side==="mon"&&<>
          <div key={fx.t} style={{position:"absolute",left:"50%",top:"36%",transform:"translate(-50%,-50%)",fontFamily:T.hd,fontSize:fx.type==="gold"?44:fx.type==="silver"?36:fx.type==="bronze"?30:fx.type==="miss"?22:30,color:sparkColor,textShadow:`3px 3px 0 ${T.red}, 0 0 22px ${sparkColor}`,letterSpacing:3,animation:"announceIn .35s ease-out, hitSpark .9s ease-out forwards",pointerEvents:"none",zIndex:5}}>{fx.type==="miss"?"MISS!":fx.type==="block"?"BLOCK!":`-${fx.dmg}`}</div>
          {fx.type==="gold"&&<div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",fontFamily:T.hd,fontSize:24,letterSpacing:4,color:T.gold,textShadow:`0 0 10px ${T.gold}`,marginTop:30,animation:"blink .25s 4"}}>★ SUPER! ★</div>}
        </>}
      </div>
    </div>

    {/* ───── BOTTOM: MOVES + LOG ───── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,alignItems:"stretch"}}>
      {/* MOVES */}
      <div style={{background:"#000",border:`3px solid ${T.blu}`,padding:8,boxShadow:`0 0 14px ${T.blu}55`}}>
        <div style={{fontFamily:T.hd,fontSize:15,letterSpacing:3,color:T.blu,marginBottom:6,textShadow:`0 0 6px ${T.blu}`}}>★ {ph==="done"?(won?"VICTORY":"K.O."):active?(active.sport+" — SELECT MOVE").toUpperCase():"—"} ★</div>
        {ph==="player"&&active&&active.hp>0&&active.sp>0&&active.moves.map((mv,i)=>{const [name,event,g,sv,b,kw]=mv;const blocked=target?.special==="block_weak"&&totalRate(mv)<.25;return(<div key={i} onClick={()=>!blocked&&setSelMove(i)} style={{display:"grid",gridTemplateColumns:"28px 1fr",gap:8,alignItems:"center",padding:"4px 6px",marginBottom:2,background:selMove===i?T.gold+"22":"transparent",border:`2px solid ${selMove===i?T.gold:blocked?T.red+"55":"transparent"}`,cursor:blocked?"not-allowed":"pointer",opacity:blocked?.4:1,transition:"all .15s"}}>
          <div style={{fontFamily:T.hd,fontSize:17,color:T.bg,background:selMove===i?T.gold:T.grn,width:26,height:22,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:selMove===i?`0 0 8px ${T.gold}`:"none"}}>{i+1}</div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontFamily:T.hd,fontSize:14,letterSpacing:1,color:T.txt}}>{name.toUpperCase()}{kw?` ${kw==="RELAY"?"🤝":kw==="EXPLOSIVE"?"💥":kw==="ENDURANCE"?"💚":"🎯"}`:""}</span>
              <span style={{fontFamily:T.bd,fontSize:20,color:Math.round(totalRate(mv)*100)>50?T.grn:Math.round(totalRate(mv)*100)>30?T.blu:T.dim}}>{Math.round(totalRate(mv)*100)}%</span>
            </div>
            <div style={{fontFamily:T.bd,fontSize:18,color:T.txt,fontStyle:"italic",letterSpacing:.5,marginTop:1}}>{event}</div>
            <div style={{marginTop:2}}><MoveBar move={mv}/></div>
            {blocked&&<div style={{fontFamily:T.hd,fontSize:14,color:T.red,letterSpacing:2,marginTop:1}}>BLOCKED</div>}
          </div>
        </div>);})}
        {ph==="player"&&active&&active.hp>0&&(active.sp<=0||(target?.special==="block_weak"&&active.moves.every(m=>totalRate(m)<.25)))&&<div onClick={()=>setSelMove("rest")} style={{padding:"10px",cursor:"pointer",background:selMove==="rest"?T.grn+"22":"transparent",border:`2px solid ${selMove==="rest"?T.grn:T.fnt}`,textAlign:"center",fontFamily:T.hd,fontSize:18,color:T.grn,letterSpacing:2}}>💤 REST · +5 HP, +1 SP</div>}
        {ph==="player"&&active&&active.hp>0&&<button onClick={doAttack} disabled={selMove==null} style={{width:"100%",marginTop:8,fontFamily:T.hd,fontSize:19,letterSpacing:3,padding:"12px",background:selMove==null?"transparent":T.gold,color:selMove==null?T.dim:T.bg,border:`3px solid ${selMove==null?T.fnt:T.gold}`,cursor:selMove==null?"default":"pointer",boxShadow:selMove==null?"none":`0 0 16px ${T.gold}, 4px 4px 0 ${T.red}`,fontWeight:700}}>{selMove==null?"PICK A MOVE":"★ STRIKE! ★"}</button>}
        {ph==="done"&&<button onClick={()=>finish(won,spirits)} style={{width:"100%",marginTop:8,fontFamily:T.hd,fontSize:19,letterSpacing:3,padding:"12px",background:won?T.grn:T.pur,color:T.bg,border:`3px solid ${won?T.grn:T.pur}`,cursor:"pointer",boxShadow:`0 0 14px ${won?T.grn:T.pur}, 4px 4px 0 ${T.red}`,fontWeight:700}}>{won?"★ CONTINUE ★":"INSERT COIN →"}</button>}
      </div>

      {/* BATTLE LOG */}
      <div style={{background:"#000",border:`3px solid ${T.pur}`,padding:12,boxShadow:`0 0 14px ${T.pur}55`,display:"flex",flexDirection:"column"}}>
        <div style={{fontFamily:T.hd,fontSize:17,letterSpacing:3,color:T.pur,marginBottom:10,textShadow:`0 0 6px ${T.pur}`}}>★ BATTLE LOG ★</div>
        <div ref={lr} style={{flex:1,maxHeight:300,overflowY:"auto",fontFamily:T.bd,fontSize:20,color:T.txt,lineHeight:1.45}}>
          {log.map((l,i)=><div key={i} style={{padding:"2px 0",color:l.includes("🏆")?T.gold:l.includes("💀")?T.red:l.includes("🥇")?medalColors.gold:l.includes("🥈")?medalColors.silver:l.includes("🥉")?medalColors.bronze:l.includes("🌟")||l.includes("🏟️")?T.grn:l.includes("⚡")?T.para:l.startsWith("───")?T.pur:T.txt}}>{l.startsWith("───")?<span style={{fontFamily:T.hd,fontSize:17,letterSpacing:3,color:T.pur}}>━━━ MONSTER PHASE ━━━</span>:l}</div>)}
        </div>
      </div>
    </div>

    {/* Score footer */}
    <div style={{marginTop:14,display:"flex",justifyContent:"space-between",fontFamily:T.hd,fontSize:17,letterSpacing:3,color:T.txt,opacity:.85}}>
      <span style={{color:T.gold,textShadow:`0 0 5px ${T.gold}`}}>SCORE {String((round-1)*1000+turn*100+(teamMax-teamHp+(target.maxHp-target.hp))*5).padStart(8,"0")}</span>
      <span style={{color:T.pur,textShadow:`0 0 5px ${T.pur}`}}>STAGE {round}</span>
      <span style={{color:T.blu,textShadow:`0 0 5px ${T.blu}`}}>TURN {turn}</span>
    </div>
  </div>);
}

function SimScreen({team,monsters,regionId,bodyTop5,onContinue}){
  const [result,setResult]=useState(null);
  const run=()=>{setResult(simulateBattle(team,monsters,1000,regionId,bodyTop5));};
  const syn=detectSynergies(team,regionId);
  const tips=["Monte Carlo simulations run 1,000 virtual battles to estimate your odds!","Expected value = probability × outcome, summed across all possibilities.","Real sports analysts use the same technique to predict medal counts.","The more simulations, the more accurate the prediction becomes."];
  const tip=tips[Math.floor(Math.random()*tips.length)];
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:14,maxWidth:500,margin:"0 auto",textAlign:"center"}}>
    <div style={{fontSize:19,letterSpacing:8,color:T.gd,fontFamily:T.hd}}>THE ORACLE FORECAST</div>
    <h2 style={{fontSize:22,fontFamily:T.hd,color:T.gold,margin:0}}>Battle Simulation</h2>
    <div style={{display:"flex",gap:6,justifyContent:"center"}}>{team.map(s=><SpiritCard key={s.id} spirit={s} compact rgn={regionId}/>)}</div>
    <div style={{fontSize:19,color:T.dim,fontFamily:T.bd}}>vs {monsters.map(m=>m.emoji+" "+m.name).join(" & ")}</div>
    {/* Synergy badges */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
      {syn.rally&&<span style={{fontSize:16,background:T.grn+"22",color:T.grn,padding:"2px 6px",borderRadius:3,fontFamily:T.hd}}>🏟️ RALLY</span>}
      {syn.paraAlliance&&<span style={{fontSize:16,background:T.para+"22",color:T.para,padding:"2px 6px",borderRadius:3,fontFamily:T.hd}}>⚡ ALLIANCE</span>}
      {syn.relayChain&&<span style={{fontSize:16,background:T.gold+"22",color:T.gold,padding:"2px 6px",borderRadius:3,fontFamily:T.hd}}>🤝 RELAY</span>}
    </div>
    {!result&&<Btn onClick={run} color={T.gold}>Simulate 1,000 Battles</Btn>}
    {result&&(<div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:42,fontFamily:T.hd,color:result.winRate>=70?T.grn:result.winRate>=40?T.gold:T.red}}>{result.winRate}%</div>
      <div style={{fontSize:19,color:T.dim,fontFamily:T.bd}}>Win rate across {result.numSims} simulated battles</div>
      <div style={{display:"flex",justifyContent:"center",gap:16}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:21,fontFamily:T.hd,color:T.txt}}>{result.avgDmg}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Avg damage</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:21,fontFamily:T.hd,color:T.grn}}>{result.wins}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Wins</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:21,fontFamily:T.hd,color:T.red}}>{result.numSims-result.wins}</div><div style={{fontSize:17,color:T.dim,fontFamily:T.bd}}>Losses</div></div>
      </div>
      {/* Simple damage histogram */}
      <div style={{background:T.s1,borderRadius:8,padding:10}}>
        <div style={{fontSize:16,color:T.gd,fontFamily:T.hd,letterSpacing:2,marginBottom:6}}>DAMAGE DISTRIBUTION</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:1,height:60}}>
          {(()=>{const buckets=Array(20).fill(0);const mn=Math.min(...result.damages),mx=Math.max(...result.damages),rng=mx-mn||1;
            result.damages.forEach(d=>{const bi=Math.min(19,Math.floor((d-mn)/rng*20));buckets[bi]++;});
            const peak=Math.max(...buckets);
            return buckets.map((c,i)=><div key={i} style={{flex:1,background:T.gold,borderRadius:"2px 2px 0 0",height:`${(c/peak)*100}%`,minHeight:c>0?2:0,opacity:.6+.4*(c/peak)}}/>);
          })()}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:16,color:T.dim,fontFamily:T.bd,marginTop:2}}>
          <span>{Math.min(...result.damages)}</span><span>{Math.max(...result.damages)}</span>
        </div>
      </div>
      <p style={{fontSize:18,color:T.dim,fontFamily:T.bd,fontStyle:"italic",lineHeight:1.5}}>💡 {tip}</p>
    </div>)}
    <Btn onClick={onContinue}>{result?"Continue to Battle":"Skip Simulation"}</Btn>
  </div>);
}

function Debrief({monsters,won,cards,rgn,round,next}){
  const [txt,setTxt]=useState(null);const rg=REGIONS.find(r=>r.id===rgn);
  useEffect(()=>{gemini(`In one or two short sentences, share a real, interesting historical fact about Team USA Olympic or Paralympic competition tied to the ${rg?.name} region (${rg?.states}). Focus on team-level achievements, sport milestones, host cities, training hubs, or regional sport culture. ${NIL_RULES}\nNo introductions or framing — just the fact.`).then(t=>setTxt(t||`${rg?.name} has produced champions across many decades of Olympic and Paralympic competition.`));},[]);
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:24,gap:18,maxWidth:680,margin:"0 auto",textAlign:"center"}}>
    <div style={{fontSize:48}}>{won?"🛡️":"💀"}</div>
    <h2 style={{fontFamily:T.hd,color:won?T.grn:T.red,margin:0,fontSize:24,letterSpacing:3,textShadow:`0 0 12px ${won?T.grn:T.red}66`}}>{won?`${rg?.name} Defended!`:`${rg?.name} Falls`}</h2>
    <div style={{background:"rgba(0,0,0,0.45)",border:`2px solid ${T.gold}66`,padding:20,width:"100%",textAlign:"left",boxShadow:`0 0 16px ${T.gold}22`}}>
      <div style={{fontSize:13,color:T.gold,fontFamily:T.hd,letterSpacing:3,marginBottom:10,textShadow:`0 0 8px ${T.gold}55`}}>🗺️ DID YOU KNOW</div>
      <div style={{fontFamily:T.bd,fontSize:21,color:T.txt,lineHeight:1.55}}>{txt||<span style={{color:T.dim,fontStyle:"italic"}}>Consulting the archives…</span>}</div>
    </div>
    <Btn onClick={next}>Back to Map</Btn>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// GAME ENGINE (endless mode)
// ═══════════════════════════════════════════════════════════════

class ErrBound extends React.Component {
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err) return(
      <div style={{padding:40,color:"#ef4444",fontFamily:"monospace",background:"#06080c",minHeight:"100vh"}}>
        <h2>Error caught:</h2>
        <pre style={{whiteSpace:"pre-wrap",fontSize:20}}>{this.state.err.toString()}</pre>
        <pre style={{whiteSpace:"pre-wrap",fontSize:18,color:"#888",marginTop:10}}>{this.state.err.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

function KeyMissingScreen(){
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16,padding:30,textAlign:"center"}}>
    <div style={{fontSize:36}}>🔑</div>
    <h2 style={{fontFamily:T.hd,color:T.gold,margin:0}}>Gemini API Key Required</h2>
    <p style={{fontFamily:T.bd,color:T.dim,maxWidth:480,lineHeight:1.6}}>
      This game generates monsters with the Gemini API. Add a key to <code style={{color:T.gold,background:T.s2,padding:"1px 5px",borderRadius:3}}>.env.local</code> at the project root and restart the dev server:
    </p>
    <pre style={{background:T.s1,border:`1px solid ${T.fnt}`,borderRadius:6,padding:14,fontFamily:"monospace",fontSize:20,color:T.txt,textAlign:"left"}}>{`# .env.local
VITE_GEMINI_API_KEY=your-key-here`}</pre>
    <p style={{fontFamily:T.bd,color:T.dim,fontSize:19}}>Get a key at <span style={{color:T.blu}}>aistudio.google.com/apikey</span></p>
  </div>);
}

function Game(){
  const [ph,setPh]=useState("start");
  const [team,setTeam]=useState([]);
  const [opts,setOpts]=useState([]);
  const [bodyTop5,setBodyTop5]=useState([]);
  const [triviaSpirit,setTriviaSpirit]=useState(null);
  const [slots,setSlots]=useState(()=>Object.fromEntries(ACTIVE_REGIONS.map(r=>[r.id,null])));
  const [nextSlots,setNextSlots]=useState(()=>Object.fromEntries(ACTIVE_REGIONS.map(r=>[r.id,null])));
  const generatingNext=useRef(new Set());
  const [defeated,setDefeated]=useState([]);
  const [hud,setHud]=useState({kills:0,streak:0});
  const [currentRegion,setCurrentRegion]=useState(null);
  const [lastWon,setLastWon]=useState(false);
  const [lastCards,setLastCards]=useState([]);
  const used=useRef(new Set());
  const initialized=useRef(false);
  const [announce,setAnnounce]=useState(null);
  const [audioOn,setAudioOn]=useState(false);
  const audioRef=useRef(null);
  useEffect(()=>{
    const h=(e)=>{const d=e.detail||{};const stamp=Date.now()+Math.random();setAnnounce({text:d.text||"",sub:d.sub||"",color:d.color||T.gold,t:stamp});setTimeout(()=>setAnnounce(a=>(a&&a.t===stamp)?null:a),(d.dur||1600));};
    window.addEventListener("arc-announce",h);return()=>window.removeEventListener("arc-announce",h);
  },[]);
  useEffect(()=>{
    if(ph==="battle")window.dispatchEvent(new CustomEvent("arc-announce",{detail:{text:"FIGHT!",sub:"ROUND 1",color:T.pur,dur:1500}}));
    if(ph==="debrief"&&lastWon)window.dispatchEvent(new CustomEvent("arc-announce",{detail:{text:"VICTORY!",sub:"YOU WIN",color:T.gold,dur:1800}}));
    if(ph==="debrief"&&!lastWon)window.dispatchEvent(new CustomEvent("arc-announce",{detail:{text:"GAME OVER",sub:"INSERT COIN",color:T.red,dur:1800}}));
  },[ph,lastWon]);
  useEffect(()=>{
    if(audioOn){
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const masterGain=ctx.createGain();masterGain.gain.value=.06;masterGain.connect(ctx.destination);
      const note=(f,t,d,wave="square",vol=1)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type=wave;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(masterGain);o.start(t);o.stop(t+d+.02);};
      // Greek/myth flavored minor-key arcade loop, A minor
      const A=440,Bb=466.16,C5=523.25,D5=587.33,E5=659.25,F5=698.46,G5=783.99,A5=880,E4=329.63,A3=220,C4=261.63,D4=293.66,F4=349.23,G4=392;
      const lead=[E5,A5,G5,E5, F5,E5,D5,C5, D5,F5,E5,D5, C5,A,Bb,C5];
      const bass=[A3,A3,E4,E4, F4,F4,C4,C4, D4,D4,A3,A3, E4,E4,A3,A3];
      const stepDur=.22;let step=0;let nextTime=ctx.currentTime+.05;
      const tick=()=>{if(!audioRef.current)return;const t=nextTime;note(lead[step%lead.length],t,stepDur*.85,"square",.7);note(bass[step%bass.length],t,stepDur*.95,"triangle",1.2);if(step%4===2)note(110,t,.05,"square",.4);step++;nextTime+=stepDur;const lookahead=Math.max(0,(nextTime-ctx.currentTime-.05)*1000);audioRef.current.id=setTimeout(tick,lookahead);};
      audioRef.current={ctx,id:0};tick();
      return ()=>{if(audioRef.current){clearTimeout(audioRef.current.id);try{audioRef.current.ctx.close();}catch(e){}audioRef.current=null;}};
    }
  },[audioOn]);

  // Hydrate from localStorage on first mount.
  // Drop any slot whose monster never finished its image — those are orphans
  // from a session where Gemini was still generating when the tab closed.
  // Leaving them in would force a slow retrySlotImage on the next load
  // instead of letting the baked asset path take over.
  useEffect(()=>{
    if(initialized.current)return;initialized.current=true;
    const saved=loadCampaign();
    if(saved){
      const usable=m=>m&&m.imageDataUrl&&m.imageStatus==="ready"?m:null;
      const safeSlots=Object.fromEntries(ACTIVE_REGIONS.map(r=>[r.id,usable(saved.slots?.[r.id])]));
      const safeNext=Object.fromEntries(ACTIVE_REGIONS.map(r=>[r.id,usable(saved.nextSlots?.[r.id])]));
      setSlots(safeSlots);
      setNextSlots(safeNext);
      setDefeated(saved.defeated||[]);
      setHud(saved.hud||{kills:0,streak:0});
    }
  },[]);

  // Persist whenever campaign-relevant state changes
  useEffect(()=>{
    saveCampaign({slots,nextSlots,defeated,hud});
  },[slots,nextSlots,defeated,hud]);

  // Debug exposure (verification)
  useEffect(()=>{window.__debug_nextSlots=nextSlots;window.__debug_slots=slots;},[slots,nextSlots]);

  const regenSlot=useCallback((regionId,basis=null)=>{
    const region=ACTIVE_REGIONS.find(r=>r.id===regionId);
    if(!region)return;
    generateMonsterQueued(region,{
      basis,
      onTextReady:(partial)=>{setSlots(p=>({...p,[regionId]:partial}));},
    },"high").then(monster=>{
      setSlots(p=>({...p,[regionId]:monster}));
    }).catch(e=>{
      console.error("[regenSlot]",e);
      setSlots(p=>({...p,[regionId]:null}));
    });
  },[]);

  // Background pre-gen for the "next" monster of a region. Low priority,
  // no onTextReady (we only swap in fully-imaged results).
  const regenNextSlot=useCallback((regionId,basis=null)=>{
    if(generatingNext.current.has(regionId))return;
    const region=ACTIVE_REGIONS.find(r=>r.id===regionId);
    if(!region)return;
    generatingNext.current.add(regionId);
    generateMonsterQueued(region,{basis},"normal").then(monster=>{
      setNextSlots(p=>({...p,[regionId]:monster}));
    }).catch(e=>{
      console.error("[regenNextSlot]",e);
    }).finally(()=>{
      generatingNext.current.delete(regionId);
    });
  },[]);

  // Retry just the image for a slot whose monster exists but lost/never got an image.
  // Cheaper than a full regen — keeps name/lore/stats stable.
  const retrySlotImage=useCallback((regionId,monster)=>{
    setSlots(p=>p[regionId]?.id===monster.id?{...p,[regionId]:{...p[regionId],imageStatus:"loading"}}:p);
    geminiImage(buildImagePrompt(monster)).then(url=>{
      setSlots(p=>p[regionId]?.id===monster.id?{...p,[regionId]:{...p[regionId],imageDataUrl:url,imageStatus:"ready"}}:p);
    }).catch(e=>{
      console.error("[retry image]",e);
      setSlots(p=>p[regionId]?.id===monster.id?{...p,[regionId]:{...p[regionId],imageStatus:"failed"}}:p);
    });
  },[]);

  const ensureAllSlots=useCallback(()=>{
    // Phase 1: try the pre-baked region monsters first (instant, no API call).
    // Fall back to live Gemini generation only when an asset is missing AND
    // the player has already defeated this region's debut monster (so it's a
    // genuine replacement, not a fresh game).
    ACTIVE_REGIONS.forEach(r=>{
      const cur=slots[r.id];
      if(!cur){
        const haveDefeatedHere=defeated.some(d=>d.regionId===r.id);
        loadBakedMonster(r.id).then(baked=>{
          if(baked&&!haveDefeatedHere){
            setSlots(p=>p[r.id]?p:{...p,[r.id]:baked});
          }else{
            regenSlot(r.id,pickSpawnBasis(defeated));
          }
        });
      }else if(!cur.imageDataUrl){
        retrySlotImage(r.id,cur);
      }
    });
    // Phase 2: background pre-gen for the next-queue (queue handles concurrency)
    ACTIVE_REGIONS.forEach(r=>{
      if(!nextSlots[r.id]){
        regenNextSlot(r.id,pickSpawnBasis(defeated));
      }
    });
  },[slots,nextSlots,defeated,regenSlot,regenNextSlot,retrySlotImage]);

  // Keep the next-queue topped up whenever a slot changes (e.g. after a victory swap).
  useEffect(()=>{
    if(!initialized.current)return;
    ACTIVE_REGIONS.forEach(r=>{
      if(slots[r.id]&&!nextSlots[r.id]&&!generatingNext.current.has(r.id)){
        regenNextSlot(r.id,pickSpawnBasis(defeated));
      }
    });
  },[slots,nextSlots,defeated,regenNextSlot]);

  const go=()=>{setTeam([]);setBodyTop5([]);used.current=new Set();setPh("quiz");};
  const startGame=(top5)=>{setBodyTop5(top5||[]);ensureAllSlots();setPh("map");};

  const pickRegion=(regionId)=>{
    if(!slots[regionId])return;
    setCurrentRegion(regionId);
    const av=SPIRITS.filter(s=>!used.current.has(s.id));
    const wa=av.filter(s=>s.regions.includes(regionId));
    const wo=av.filter(s=>!wa.includes(s));
    const aff=shuffle(wa).slice(0,3);
    const wild=shuffle(wo).slice(0,5-aff.length);
    setOpts([...aff,...wild]);
    setPh("scout");
  };

  const lockIn=(picked)=>{picked.forEach(s=>used.current.add(s.id));setTeam(picked);setTriviaSpirit(picked[0]);setPh("trivia");};

  const fin=(won,cards)=>{
    const regionId=currentRegion;
    const monster=slots[regionId];
    setLastWon(won);setLastCards(cards);
    if(won&&monster){
      const trimmedMonster={...monster,imageDataUrl:null};
      const newDefeated=[...defeated,trimmedMonster].slice(-20);
      setDefeated(newDefeated);
      setHud(h=>({kills:h.kills+1,streak:h.streak+1}));
      const queued=nextSlots[regionId];
      if(queued){
        // Hot path: instant swap from pre-gen queue, then refill in background
        setSlots(p=>({...p,[regionId]:queued}));
        setNextSlots(p=>({...p,[regionId]:null}));
        regenNextSlot(regionId,pickSpawnBasis(newDefeated));
      }else{
        // Cold fallback: queue wasn't ready, fall back to old foreground summon
        setSlots(p=>({...p,[regionId]:null}));
        regenSlot(regionId,pickSpawnBasis(newDefeated));
      }
    }else{
      setHud(h=>({...h,streak:0}));
    }
    setPh("debrief");
  };

  const nxt=()=>{setTeam([]);setCurrentRegion(null);setPh("map");};

  const reset=()=>{
    clearCampaign();
    setDefeated([]);
    setHud({kills:0,streak:0});
    used.current=new Set();
    generatingNext.current=new Set();
    const cleared=Object.fromEntries(ACTIVE_REGIONS.map(r=>[r.id,null]));
    setSlots(cleared);
    setNextSlots(cleared);
    ACTIVE_REGIONS.forEach(r=>regenSlot(r.id,null));
    // nextSlots will be refilled by the topped-up effect once slots arrive
  };

  const battleMonsters=currentRegion&&slots[currentRegion]?[slots[currentRegion]]:[];

  return(<div style={{minHeight:"100vh",background:T.bg,color:T.txt,backgroundImage:`radial-gradient(ellipse 80% 40% at 50% 0%,#2a004f 0%,transparent 55%),radial-gradient(ellipse 60% 30% at 50% 100%,#1a0033 0%,transparent 60%)`,position:"relative"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:${T.bg};color:${T.txt};font-family:${T.bd}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.pur};border-radius:0}::-webkit-scrollbar-track{background:${T.s1}}*{border-radius:0 !important}@keyframes flicker{0%,99%{opacity:1}50%{opacity:.96}}@keyframes blink{50%{opacity:.35}}@keyframes scrollx{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes pulse{50%{transform:scale(1.06)}}@keyframes shake{0%,100%{transform:translate(0,0)}25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-2px)}75%{transform:translate(-2px,-3px)}}@keyframes announceIn{0%{opacity:0;transform:scale(.4) translateY(-30px)}30%{opacity:1;transform:scale(1.1)}55%{transform:scale(1)}100%{opacity:1;transform:scale(1)}}@keyframes announceOut{0%{opacity:1}100%{opacity:0;transform:scale(1.6)}}@keyframes hitSpark{0%{opacity:1;transform:scale(.4) rotate(0deg)}100%{opacity:0;transform:scale(2.4) rotate(180deg)}}@keyframes defendGlow{0%,100%{box-shadow:0 0 10px ${T.gold}66,0 0 18px ${T.gold}33;border-color:${T.gold}}50%{box-shadow:0 0 22px ${T.gold},0 0 40px ${T.gold}aa,0 0 60px ${T.gold}55;border-color:#fff8c4}}body::after{content:"";position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 2px,rgba(0,0,0,0.28) 2px 3px);z-index:9998;mix-blend-mode:multiply}body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,0.45) 100%);z-index:9999}h1,h2,h3{font-family:${T.hd};letter-spacing:2px}button{font-family:${T.hd}}`}</style>
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:50,background:"#000",borderTop:`2px solid ${T.blu}`,borderBottom:`2px solid ${T.pur}`,padding:"6px 0",fontFamily:T.hd,fontSize:17,letterSpacing:3,color:T.pur,overflow:"hidden",whiteSpace:"nowrap",pointerEvents:"none"}}><div style={{display:"inline-block",animation:"scrollx 28s linear infinite",color:T.pur,textShadow:`0 0 6px ${T.pur}`}}>★ OLYMPUS RISING ★ DEFEND AMERICA ★ GO FOR GOLD ★ OLYMPUS RISING ★ DEFEND AMERICA ★ GO FOR GOLD ★ OLYMPUS RISING ★ DEFEND AMERICA ★ GO FOR GOLD ★</div></div>
    <div style={{height:28}}/>
    <button onClick={()=>setAudioOn(v=>!v)} style={{position:"fixed",bottom:14,right:14,zIndex:60,fontFamily:T.hd,fontSize:8,letterSpacing:1.5,padding:"4px 7px",background:audioOn?T.grn+"22":"transparent",border:`1px solid ${audioOn?T.grn:T.pur}`,color:audioOn?T.grn:T.pur,cursor:"pointer",opacity:0.7,boxShadow:audioOn?`0 0 6px ${T.grn}66`:"none"}}>{audioOn?"♪ ON":"♪ OFF"}</button>
    {announce&&<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",background:"radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 60%)",animation:"announceIn .35s ease-out"}}><div style={{textAlign:"center"}}><div style={{fontFamily:T.hd,fontSize:24,letterSpacing:6,color:T.cyan||T.blu,marginBottom:14,textShadow:`0 0 10px ${T.blu}`}}>{announce.sub}</div><div style={{fontFamily:T.hd,fontSize:88,letterSpacing:6,color:announce.color,textShadow:`4px 4px 0 ${T.red}, 8px 8px 0 ${T.s1}, 0 0 40px ${announce.color}`,animation:"pulse .8s ease-in-out infinite"}}>{announce.text}</div></div></div>}
    {ph==="start"&&<Start go={go} howto={()=>setPh("howto")} explore={()=>setPh("explore")}/>}
    {ph==="explore"&&<Explorer back={()=>setPh("start")}/>}
    {ph==="quiz"&&<BodyQuiz done={startGame}/>}
    {ph==="howto"&&<HowTo back={()=>setPh("start")} go={go}/>}
    {ph==="map"&&<MapScr slots={slots} hud={hud} onPick={pickRegion} onReset={reset}/>}
    {ph==="scout"&&currentRegion&&<Scout opts={opts} lockIn={lockIn} rgn={currentRegion} bodyTop5={bodyTop5}/>}
    {ph==="trivia"&&<Trivia spirit={triviaSpirit} onComplete={()=>setPh("simulate")}/>}
    {ph==="simulate"&&currentRegion&&<SimScreen team={team} monsters={battleMonsters} regionId={currentRegion} bodyTop5={bodyTop5} onContinue={()=>setPh("battle")}/>}
    {ph==="battle"&&currentRegion&&<Battle monsters={battleMonsters} team={team} rgn={currentRegion} finish={fin} round={Math.max(1,Math.floor(hud.kills/3)+1)} bodyTop5={bodyTop5}/>}
    {ph==="debrief"&&currentRegion&&<Debrief monsters={[lastWon?defeated[defeated.length-1]:slots[currentRegion]].filter(Boolean)} won={lastWon} cards={lastCards} rgn={currentRegion} next={nxt}/>}
  </div>);
}

export default function App(){
  if(!hasApiKey()){
    return <ErrBound><div style={{minHeight:"100vh",background:T.bg,color:T.txt}}><KeyMissingScreen/></div></ErrBound>;
  }
  return <ErrBound><Game/></ErrBound>;
}
