import { useState, useEffect, useRef } from "react";

// ─── PALETTES / CONSTANTS ─────────────────────────────────
const PALETTES = [
  {acc:'#8b7ab8',glow:'rgba(139,122,184,0.18)',bg:'#0e0c14',border:'#3d3260'},  // steel violet
  {acc:'#b06830',glow:'rgba(176,104,48,0.18)', bg:'#130d08',border:'#5a3018'},  // burnished copper
  {acc:'#4a8e65',glow:'rgba(74,142,101,0.18)', bg:'#080f0b',border:'#244838'},  // oxidized green
  {acc:'#4a7aaa',glow:'rgba(74,122,170,0.18)', bg:'#080e14',border:'#1e3a58'},  // cold steel blue
  {acc:'#a88820',glow:'rgba(168,136,32,0.18)', bg:'#100e04',border:'#5a4a10'},  // aged gold
  {acc:'#2e8a7e',glow:'rgba(46,138,126,0.18)', bg:'#060f0e',border:'#143e38'},  // dark teal
];
const COUNTER_TYPES = ['+1/+1','-1/-1','Loyalty','Charge','Poison','+2/+2','Oil','Shield','Lore'];

// ─── PRE-EMBEDDED DEMO CARDS ──────────────────────────────
// These are real Scryfall IDs so images load from their CDN.
// Card data is embedded so the game works even if fetch fails.
const DEMO_DATA = [
  {name:'Sol Ring',manaCost:'{1}',cmc:1,typeLine:'Artifact',oracle:'Tap: Add {C}{C}.',power:null,tough:null,rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/0/b/0bd02b38-bc69-4b6e-b1f7-c66b95f61bf5.jpg'},
  {name:'Lightning Bolt',manaCost:'{R}',cmc:1,typeLine:'Instant',oracle:'Lightning Bolt deals 3 damage to any target.',power:null,tough:null,rarity:'common',set:'M11',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/e/3/e3285602-4f0f-4998-a5c0-a81e2be8de58.jpg'},
  {name:'Counterspell',manaCost:'{U}{U}',cmc:2,typeLine:'Instant',oracle:'Counter target spell.',power:null,tough:null,rarity:'common',set:'7ED',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/8/e/8e2e3abe-4940-4444-ab73-9e3b3f23e88b.jpg'},
  {name:'Dark Ritual',manaCost:'{B}',cmc:1,typeLine:'Instant',oracle:'Add {B}{B}{B}.',power:null,tough:null,rarity:'common',set:'A25',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/e/a/ea94a237-94a1-4b63-a52f-9a0d82489a70.jpg'},
  {name:'Giant Growth',manaCost:'{G}',cmc:1,typeLine:'Instant',oracle:'Target creature gets +3/+3 until end of turn.',power:null,tough:null,rarity:'common',set:'M14',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/c/6/c69c5e9a-8e31-4e24-a3e5-b61985bf29e5.jpg'},
  {name:'Llanowar Elves',manaCost:'{G}',cmc:1,typeLine:'Creature — Elf Druid',oracle:'Tap: Add {G}.',power:'1',tough:'1',rarity:'common',set:'M19',isLegendary:false,isCreature:true,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/3/6/36833fe7-1f4a-4b4f-abb2-8e38be6da1e5.jpg'},
  {name:'Swords to Plowshares',manaCost:'{W}',cmc:1,typeLine:'Instant',oracle:'Exile target creature. Its controller gains life equal to its power.',power:null,tough:null,rarity:'uncommon',set:'A25',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/6/f/6fad7162-e1af-4ffc-bf14-f50e76a84e62.jpg'},
  {name:'Brainstorm',manaCost:'{U}',cmc:1,typeLine:'Instant',oracle:'Draw three cards, then put two cards from your hand on top of your library in any order.',power:null,tough:null,rarity:'common',set:'CNS',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/f/7/f74a2573-3a49-4826-a1bd-f1df84d38fb9.jpg'},
  {name:'Doom Blade',manaCost:'{1}{B}',cmc:2,typeLine:'Instant',oracle:'Destroy target nonblack creature.',power:null,tough:null,rarity:'common',set:'M14',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/8/f/8f7cfc88-a98d-4b65-9a1d-7fb3f75ce0e7.jpg'},
  {name:'Command Tower',manaCost:'',cmc:0,typeLine:'Land',oracle:'Tap: Add one mana of any color in your commander\'s color identity.',power:null,tough:null,rarity:'common',set:'CLB',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:true,img:'https://cards.scryfall.io/normal/front/4/2/42232ea6-e31d-46a6-9f94-b2ad2416d79b.jpg'},
  {name:'Arcane Signet',manaCost:'{2}',cmc:2,typeLine:'Artifact',oracle:'Tap: Add one mana of any color in your commander\'s color identity.',power:null,tough:null,rarity:'common',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/0/9/09bb1a87-3f40-4d54-9785-0a52a49437cf.jpg'},
  {name:'Mind Stone',manaCost:'{2}',cmc:2,typeLine:'Artifact',oracle:'Tap: Add {C}. {1}, Tap, Sacrifice Mind Stone: Draw a card.',power:null,tough:null,rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/4/3/43ac02c7-67ac-4b9b-9f85-ec1d10461e3a.jpg'},
  {name:'Thought Vessel',manaCost:'{2}',cmc:2,typeLine:'Artifact',oracle:'You have no maximum hand size. Tap: Add {C}.',power:null,tough:null,rarity:'common',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/9/0/90878a14-d2e5-44ba-ba05-56f7e2990a98.jpg'},
  {name:'Swiftfoot Boots',manaCost:'{2}',cmc:2,typeLine:'Artifact — Equipment',oracle:'Equipped creature has hexproof and haste. Equip {1}.',power:null,tough:null,rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/1/f/1f6d1bce-99b1-43c1-b3c9-e6f6e3c4c2d1.jpg'},
  {name:'Lightning Greaves',manaCost:'{2}',cmc:2,typeLine:'Artifact — Equipment',oracle:'Equipped creature has haste and shroud. Equip {0}.',power:null,tough:null,rarity:'uncommon',set:'2XM',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/e/9/e9f23edd-56e2-4570-a1de-1f04d05e2afe.jpg'},
  {name:'Reliquary Tower',manaCost:'',cmc:0,typeLine:'Land',oracle:'You have no maximum hand size. Tap: Add {C}.',power:null,tough:null,rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:true,img:'https://cards.scryfall.io/normal/front/0/e/0ef4ab62-d9ac-4625-ad18-25babde7aa46.jpg'},
  {name:'Wrath of God',manaCost:'{2}{W}{W}',cmc:4,typeLine:'Sorcery',oracle:'Destroy all creatures. They can\'t be regenerated.',power:null,tough:null,rarity:'rare',set:'A25',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/d/b/db10e8bb-2d1e-4b5c-b2ff-acfdbd32ecb0.jpg'},
  {name:'Cyclonic Rift',manaCost:'{1}{U}',cmc:2,typeLine:'Instant',oracle:'Return target nonland permanent you don\'t control to its owner\'s hand. Overload {6}{U}.',power:null,tough:null,rarity:'rare',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/1/b/1b0d6060-fb0e-4dc8-bc0a-f5ef0e9f04da.jpg'},
  {name:'Chaos Warp',manaCost:'{2}{R}',cmc:3,typeLine:'Instant',oracle:'The owner of target permanent shuffles it into their library, then reveals the top card of their library. If it\'s a permanent card, they put it onto the battlefield.',power:null,tough:null,rarity:'rare',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/4/8/48a669b6-ab09-4499-97fa-b9f3b5a9d6ca.jpg'},
  {name:'Blasphemous Act',manaCost:'{8}{R}',cmc:9,typeLine:'Sorcery',oracle:'This spell costs {1} less to cast for each creature on the battlefield. Blasphemous Act deals 13 damage to each creature.',power:null,tough:null,rarity:'rare',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/1/0/10e5a71a-c1bc-4826-a4f0-98a86e7c6c81.jpg'},
  {name:'Murder',manaCost:'{1}{B}{B}',cmc:3,typeLine:'Instant',oracle:'Destroy target creature.',power:null,tough:null,rarity:'common',set:'M21',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/0/a/0a9e7dbc-b764-4b37-8ed4-a8f5dab9f6ac.jpg'},
  {name:'Naturalize',manaCost:'{1}{G}',cmc:2,typeLine:'Instant',oracle:'Destroy target artifact or enchantment.',power:null,tough:null,rarity:'common',set:'M14',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/6/9/694f01bf-f5ec-4375-a5e3-e29b7e54fe25.jpg'},
  {name:'Negate',manaCost:'{1}{U}',cmc:2,typeLine:'Instant',oracle:'Counter target noncreature spell.',power:null,tough:null,rarity:'common',set:'M20',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/8/6/86b1ff45-f7e2-4d18-9d7d-2fb9c1dbc573.jpg'},
  {name:'Swan Song',manaCost:'{U}',cmc:1,typeLine:'Instant',oracle:'Counter target enchantment, instant, or sorcery spell. Its controller creates a 2/2 blue Bird creature token with flying.',power:null,tough:null,rarity:'rare',set:'THS',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/b/6/b6f37385-4878-4b6a-8a15-dac872ab0dec.jpg'},
  {name:'Eternal Witness',manaCost:'{1}{G}{G}',cmc:3,typeLine:'Creature — Human Shaman',oracle:'When Eternal Witness enters the battlefield, you may return target card from your graveyard to your hand.',power:'2',tough:'1',rarity:'uncommon',set:'5DN',isLegendary:false,isCreature:true,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/e/a/eada5a11-5bb4-4900-a462-93a0ee5e748a.jpg'},
  {name:'Solemn Simulacrum',manaCost:'{4}',cmc:4,typeLine:'Artifact Creature — Golem',oracle:'When Solemn Simulacrum enters the battlefield, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle. When Solemn Simulacrum dies, you may draw a card.',power:'2',tough:'2',rarity:'rare',set:'CMR',isLegendary:false,isCreature:true,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/9/e/9e64dd5e-7b54-4d58-9c25-43b3ef09e0cb.jpg'},
  {name:'Burnished Hart',manaCost:'{3}',cmc:3,typeLine:'Artifact Creature — Elk',oracle:'{3}, Sacrifice Burnished Hart: Search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.',power:'2',tough:'2',rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:true,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/0/2/02bc76fb-f372-4c94-b03c-e5c764f28819.jpg'},
  {name:'Mulldrifter',manaCost:'{4}{U}',cmc:5,typeLine:'Creature — Elemental',oracle:'Flying. When Mulldrifter enters the battlefield, draw two cards. Evoke {2}{U}.',power:'2',tough:'2',rarity:'common',set:'CMR',isLegendary:false,isCreature:true,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/5/a/5a9c8cfd-acde-45e2-a7c9-78e9da63e60a.jpg'},
  {name:'Thran Dynamo',manaCost:'{4}',cmc:4,typeLine:'Artifact',oracle:'Tap: Add {C}{C}{C}.',power:null,tough:null,rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/c/5/c5d6be47-9d11-4dfe-a456-2ca7a9ce5f52.jpg'},
  {name:'Cultivate',manaCost:'{2}{G}',cmc:3,typeLine:'Sorcery',oracle:'Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.',power:null,tough:null,rarity:'common',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/9/9/99f79746-dc4d-4b86-8f48-aa4b69fa04a4.jpg'},
  {name:'Farseek',manaCost:'{1}{G}',cmc:2,typeLine:'Sorcery',oracle:'Search your library for a Plains, Island, Swamp, Mountain, or Forest card, put it onto the battlefield tapped, then shuffle.',power:null,tough:null,rarity:'common',set:'M13',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/4/d/4ddce7b8-29dc-40e1-9cd3-00ea6e1de46b.jpg'},
  {name:'Path to Exile',manaCost:'{W}',cmc:1,typeLine:'Instant',oracle:'Exile target creature. Its controller may search their library for a basic land card, put that card onto the battlefield tapped, then shuffle.',power:null,tough:null,rarity:'uncommon',set:'MMA',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/5/e/5e4a7b9a-3db7-4c1f-a6da-9c41b71568c0.jpg'},
  {name:'Beast Within',manaCost:'{2}{G}',cmc:3,typeLine:'Instant',oracle:'Destroy target permanent. Its controller creates a 3/3 green Beast creature token.',power:null,tough:null,rarity:'uncommon',set:'CMR',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/8/3/83e08546-e643-4916-a53a-4dc0bc204c13.jpg'},
  {name:'Rampant Growth',manaCost:'{1}{G}',cmc:2,typeLine:'Sorcery',oracle:'Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.',power:null,tough:null,rarity:'common',set:'M12',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/a/1/a19caf81-9a38-469b-a5f2-f2f0adcca523.jpg'},
  {name:'Disenchant',manaCost:'{1}{W}',cmc:2,typeLine:'Instant',oracle:'Destroy target artifact or enchantment.',power:null,tough:null,rarity:'common',set:'A25',isLegendary:false,isCreature:false,isPlaneswalker:false,isLand:false,img:'https://cards.scryfall.io/normal/front/e/3/e3f3fc2c-2f95-4d03-8143-2db1b5ab1daa.jpg'},
];

// Build lookup by lowercase name
const DEMO_CACHE = {};
DEMO_DATA.forEach(function(d) { DEMO_CACHE[d.name.toLowerCase()] = d; });

// ─── SCRYFALL FETCH (for custom decks) ────────────────────
const sfCache = {};

async function fetchScryfall(names, onProgress) {
  const unique = [];
  const seen = {};
  names.forEach(function(n) {
    const k = n.trim().toLowerCase();
    if (k && !seen[k] && !(k in sfCache) && !(k in DEMO_CACHE)) {
      seen[k] = true;
      unique.push(n.trim());
    }
  });

  if (unique.length === 0) {
    onProgress && onProgress(names.length, names.length, '');
    return;
  }

  const CHUNK = 75;
  let done = 0;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const chunk = unique.slice(i, i + CHUNK);
    onProgress && onProgress(done, unique.length, chunk[0]);
    try {
      const res = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({identifiers: chunk.map(function(n){return {name:n};})}),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      (json.data || []).forEach(function(d) {
        const cf = d.card_faces;
        const mdfc = !!(cf && cf[0] && cf[0].image_uris);
        const card = {
          name: d.name,
          manaCost: d.mana_cost || (cf && cf[0] ? cf[0].mana_cost : '') || '',
          cmc: d.cmc || 0,
          typeLine: d.type_line || '',
          oracle: d.oracle_text || (cf ? cf.map(function(f){return f.oracle_text||'';}).join(' | ') : ''),
          power: d.power || (cf && cf[0] ? cf[0].power : null),
          tough: d.toughness || (cf && cf[0] ? cf[0].toughness : null),
          loyalty: d.loyalty || null,
          rarity: d.rarity || 'common',
          set: (d.set || '???').toUpperCase(),
          isLegendary: (d.type_line||'').indexOf('Legendary') !== -1,
          isCreature: (d.type_line||'').indexOf('Creature') !== -1,
          isPlaneswalker: (d.type_line||'').indexOf('Planeswalker') !== -1,
          isLand: (d.type_line||'').indexOf('Land') !== -1,
          mdfc: mdfc,
          img: (d.image_uris && d.image_uris.normal) || (cf && cf[0] && cf[0].image_uris ? cf[0].image_uris.normal : null),
          imgBack: mdfc ? (cf[1] && cf[1].image_uris ? cf[1].image_uris.normal : null) : null,
          backName: mdfc && cf[1] ? cf[1].name : null,
          backType: mdfc && cf[1] ? cf[1].type_line : null,
          backPower: mdfc && cf[1] ? cf[1].power : null,
          backTough: mdfc && cf[1] ? cf[1].toughness : null,
        };
        sfCache[d.name.toLowerCase()] = card;
        chunk.forEach(function(sn) {
          const slo = sn.toLowerCase();
          if (!(slo in sfCache) && d.name.toLowerCase().indexOf(slo) !== -1) {
            sfCache[slo] = card;
          }
        });
      });
      (json.not_found || []).forEach(function(nf) {
        if (nf.name) sfCache[nf.name.toLowerCase()] = null;
      });
    } catch(err) {
      console.warn('Scryfall fetch failed:', err.message);
      chunk.forEach(function(n) { sfCache[n.toLowerCase()] = null; });
    }
    done += chunk.length;
    if (i + CHUNK < unique.length) await new Promise(function(r){setTimeout(r,110);});
  }
  onProgress && onProgress(done, unique.length, '');
}

function lookupCard(name) {
  const k = name.trim().toLowerCase();
  return DEMO_CACHE[k] || sfCache[k] || null;
}

// ─── DECK PARSER ──────────────────────────────────────────
function parseDeck(text) {
  if (!text || !text.trim()) return [];
  const cards = [];
  let section = 'main';
  text.split('\n').forEach(function(raw) {
    const line = raw.trim();
    if (!line || line[0]==='/' || line[0]==='#') return;
    const lo = line.toLowerCase();
    if (lo==='commander'||lo==='commanders') { section='commander'; return; }
    if (lo==='deck'||lo==='main'||lo==='mainboard') { section='main'; return; }
    if (lo==='sideboard'||lo==='side'||lo==='maybeboard') { section='side'; return; }
    if (section==='side') return;
    const m = line.match(/^(\d+)\s*[xX]?\s+(.+?)(?:\s+\([\w\d-]+\)[\s\d]*)?$/);
    if (m) {
      const qty = parseInt(m[1], 10);
      const name = m[2].trim().split(' // ')[0].trim();
      if (name) for (let q=0;q<qty;q++) cards.push({name:name,section:section});
    }
  });
  return cards;
}

// ─── HELPERS ──────────────────────────────────────────────
function mkInst(data) {
  return Object.assign({}, data, {
    iid: crypto.randomUUID(),
    tapped:false, showBack:false, faceDown:false, summonSick:false,
    counters:{}, x:5+Math.random()*55, y:5+Math.random()*55, z:1,
  });
}
function shuffle(arr) {
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}
const rarityCol = function(r){return {common:'#7a8090',uncommon:'#9aacb8',rare:'#b89040',mythic:'#c06828'}[r]||'#7a8090';};

// ─── MANA PRODUCTION PARSER ───────────────────────────────
// Parses oracle text for "Add {X}" patterns and returns a mana map.
function parseManaProduction(card) {
  if(!card||!card.oracle) return {};
  const result={};
  const addRe=/[Aa]dd\s+((?:\{[^}]+\}\s*)+)/g;
  let m;
  while((m=addRe.exec(card.oracle))!==null){
    const symRe=/\{([WUBRGC])\}/g; let s;
    while((s=symRe.exec(m[1]))!==null){
      const c=s[1]; result[c]=(result[c]||0)+1;
    }
  }
  // "any color" with no explicit symbols → colorless placeholder
  if(Object.keys(result).length===0&&/any color/i.test(card.oracle)&&/[Aa]dd/i.test(card.oracle)){
    result['C']=1;
  }
  return result;
}

// ─── MANA SYMBOLS ─────────────────────────────────────────
const MC = {W:'#f3f0e0',U:'#1a6bb5',B:'#26262a',R:'#d7360f',G:'#186a45',C:'#8b94a0',X:'#9b59b6'};
function ManaSymbols({cost,size}) {
  size=size||13; if(!cost) return null;
  const syms=[]; const re=/\{([^}]+)\}/g; let m;
  while((m=re.exec(cost))!==null) syms.push(m[1]);
  return (
    <span style={{display:'inline-flex',gap:1,flexWrap:'wrap',alignItems:'center'}}>
      {syms.map(function(s,i){
        const isNum=/^\d+$/.test(s);
        const bg=isNum?'#8a90a0':(MC[s]||MC[s[0]]||'#8a90a0');
        return <span key={i} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,borderRadius:'50%',background:bg,border:'1px solid rgba(0,0,0,0.4)',fontSize:size*0.6,fontWeight:800,color:s==='W'?'#252830':'#fff',lineHeight:1,minWidth:size}}>{(isNum||s==='X'||s==='Y'||s==='Z')?s:''}</span>;
      })}
    </span>
  );
}

// ─── CARD IMAGE (with onError fallback) ──────────────────
function CardImg({src,alt,style,fallStyle,fallText}) {
  const [err,setErr]=useState(false);
  const fs=fallStyle||{width:'100%',height:'100%',background:'linear-gradient(135deg,#252830,#1e2028)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'#e2e8f0',textAlign:'center',padding:4,lineHeight:1.3,fontWeight:600,borderRadius:3};
  if(!src||err) return <div style={fs}>{fallText||alt||'?'}</div>;
  return <img src={src} alt={alt} draggable={false} onError={function(){setErr(true);}} style={style}/>;
}

// ─── CARD BACK ────────────────────────────────────────────
function CardBack({w,h}) {
  w=w||'100%'; h=h||'100%';
  return <div style={{width:w,height:h,borderRadius:4,background:'linear-gradient(135deg,#1a237e,#283593)',border:'2px solid #3949ab',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:18,opacity:0.3}}>🂠</span></div>;
}

// ─── CARD TOKEN ───────────────────────────────────────────
function CardToken({card,scale,onMD,onRC,onME,onML}) {
  const sc=scale||1;
  const W=Math.round(56*sc), H=Math.round(78*sc);
  const img=(card.showBack&&card.imgBack)?card.imgBack:card.img;
  const counters=Object.entries(card.counters||{}).filter(function(e){return e[1]>0;});
  return (
    <div onMouseDown={onMD} onContextMenu={onRC} onMouseEnter={onME} onMouseLeave={onML}
      style={{position:'absolute',left:card.x+'%',top:card.y+'%',width:W,height:H,borderRadius:4,cursor:'grab',zIndex:card.z,transform:'rotate('+(card.tapped?90:0)+'deg)',transition:'transform 0.15s',border:'2px solid '+(card.tapped?'#c8960a':'rgba(255,255,255,0.15)'),boxShadow:card.tapped?'0 0 8px rgba(251,191,36,0.5)':'0 2px 8px rgba(0,0,0,0.6)',userSelect:'none',overflow:'visible'}}>
      {card.faceDown?<CardBack w={W} h={H}/>:
       <CardImg src={img} alt={card.name}
         style={{width:'100%',height:'100%',borderRadius:3,objectFit:'cover',display:'block'}}
         fallStyle={{width:'100%',height:'100%',borderRadius:3,background:'linear-gradient(135deg,#252830,#1e2028)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:3}}
         fallText={<><div style={{fontSize:Math.round(7*sc),color:'#e2e8f0',fontWeight:700,textAlign:'center',lineHeight:1.2,marginBottom:2}}>{card.name}</div><div style={{fontSize:Math.round(6*sc),color:'#a8b0c0',textAlign:'center'}}>{card.typeLine}</div>{card.power!=null&&<div style={{fontSize:Math.round(8*sc),color:'#c8960a',marginTop:2,fontWeight:700}}>{card.power}/{card.tough}</div>}</>}
       />}
      {counters.length>0&&<div style={{position:'absolute',bottom:-8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:2,zIndex:10}}>
        {counters.map(function(e){const t=e[0],v=e[1];return <span key={t} style={{background:'#1e2028',border:'1px solid #3d4358',borderRadius:8,padding:'1px 4px',fontSize:8,fontWeight:700,color:t==='+1/+1'?'#4ade80':t==='-1/-1'?'#f87171':'#c8960a'}}>{t}×{v}</span>;})}
      </div>}
      {card.summonSick&&card.isCreature&&!card.tapped&&<div style={{position:'absolute',top:-6,right:-6,width:12,height:12,borderRadius:'50%',background:'#ef4444',fontSize:7,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',zIndex:10}}>💤</div>}
    </div>
  );
}

// ─── CARD ZOOM ────────────────────────────────────────────
function CardZoom({card}) {
  if(!card||card.faceDown) return null;
  const ub=card.showBack&&card.imgBack;
  const img=ub?card.imgBack:card.img;
  const name=ub?(card.backName||card.name):card.name;
  const type=ub?(card.backType||card.typeLine):card.typeLine;
  const pw=ub?card.backPower:card.power;
  const tg=ub?card.backTough:card.tough;
  return (
    <div style={{position:'fixed',right:12,top:'50%',transform:'translateY(-50%)',zIndex:8000,pointerEvents:'none',display:'flex',flexDirection:'column',gap:8}}>
      <div style={{width:180,height:252,borderRadius:8,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.8)',border:'1px solid #3d4358'}}>
        <CardImg src={img} alt={name}
          style={{width:'100%',height:'100%',objectFit:'cover'}}
          fallStyle={{width:'100%',height:'100%',background:'#252830',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}
          fallText={<span style={{color:'#e2e8f0',fontSize:12,textAlign:'center',fontWeight:700}}>{name}</span>}/>
      </div>
      <div style={{background:'#1e2028ee',border:'1px solid #252830',borderRadius:6,padding:'8px 10px',width:180}}>
        <div style={{fontSize:12,fontWeight:700,color:'#e2e8f0',marginBottom:2}}>{name}</div>
        <div style={{fontSize:10,color:'#8a90a0',marginBottom:5}}>{type}</div>
        {card.manaCost&&<div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}><ManaSymbols cost={card.manaCost} size={12}/><span style={{fontSize:9,color:'#565c70'}}>CMC {card.cmc}</span></div>}
        {card.oracle&&<div style={{fontSize:9,color:'#a8b0c0',lineHeight:1.4,maxHeight:80,overflow:'hidden',borderTop:'1px solid #252830',paddingTop:4,marginTop:4}}>{card.oracle}</div>}
        <div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
          {pw!=null&&<span style={{fontSize:12,fontWeight:700,color:'#c8960a'}}>{pw}/{tg}</span>}
          {card.loyalty!=null&&<span style={{fontSize:12,fontWeight:700,color:'#60a5fa'}}>🛡{card.loyalty}</span>}
          <span style={{fontSize:9,color:rarityCol(card.rarity),marginLeft:'auto'}}>{card.set}</span>
        </div>
        {Object.entries(card.counters||{}).filter(function(e){return e[1]>0;}).length>0&&
          <div style={{marginTop:5,display:'flex',gap:3,flexWrap:'wrap'}}>
            {Object.entries(card.counters).filter(function(e){return e[1]>0;}).map(function(e){const t=e[0],v=e[1];return <span key={t} style={{fontSize:9,background:'#252830',borderRadius:4,padding:'1px 5px',color:t==='+1/+1'?'#4ade80':t==='-1/-1'?'#f87171':'#a78bfa',fontWeight:700}}>{t}×{v}</span>;})}
          </div>}
      </div>
    </div>
  );
}

// ─── CONTEXT MENU ─────────────────────────────────────────
function CtxMenu({x,y,card,zone,pal,onAct}) {
  const isBF=zone==='battlefield', isH=zone==='hand', isC=zone==='command';
  const items=[
    isBF?{l:(card&&card.tapped)?'↩ Untap':'↪ Tap',a:'tap',c:'#c8960a'}:null,
    !isBF?{l:'⚔ Play to Battlefield',a:'toBF',c:'#4ade80'}:null,
    isBF?{l:'✋ Return to Hand',a:'toHand'}:null,
    (isBF||isH)?{l:'💀 Graveyard',a:'toGrave',c:'#f87171'}:null,
    (isBF||isH)?{l:'✦ Exile',a:'toExile',c:'#a78bfa'}:null,
    !isC?{l:'📚 Top of Library',a:'toLib',c:'#60a5fa'}:null,
    (card&&card.mdfc&&isBF)?{l:'🔄 Transform',a:'flip',c:'#60a5fa'}:null,
    (isBF||isH)?{l:'👁 Toggle Face Down',a:'fd'}:null,
    isBF?{l:'🔢 Counters',a:'ctr',c:'#a78bfa'}:null,
    isBF?{l:'📋 Duplicate',a:'dup'}:null,
  ].filter(Boolean);
  const mw=210,mh=items.length*32+52;
  const px=Math.min(x,(window.innerWidth||1200)-mw-8);
  const py=Math.min(y,(window.innerHeight||800)-mh-8);
  return (
    <div onMouseDown={function(e){e.stopPropagation();}} onClick={function(e){e.stopPropagation();}}
      style={{position:'fixed',left:px,top:py,width:mw,background:'#17191e',border:'1px solid '+pal.border,borderRadius:8,zIndex:9999,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}}>
      {card&&<div style={{padding:'8px 12px',background:'#0a0f1a',borderBottom:'1px solid #252830'}}>
        <div style={{fontSize:12,fontWeight:700,color:pal.acc}}>{card.faceDown?'Face-down Card':card.name}</div>
        {!card.faceDown&&<div style={{fontSize:10,color:'#8a90a0',marginTop:1}}>{card.typeLine}</div>}
      </div>}
      {items.map(function(item,i){return (
        <button key={i} onClick={function(){onAct(item.a);}}
          onMouseEnter={function(e){e.currentTarget.style.background='#252830';}}
          onMouseLeave={function(e){e.currentTarget.style.background='transparent';}}
          style={{display:'block',width:'100%',textAlign:'left',padding:'7px 14px',background:'transparent',border:'none',borderBottom:i<items.length-1?'1px solid #25283055':'none',color:item.c||'#d1d5db',fontSize:12,cursor:'pointer'}}>
          {item.l}
        </button>
      );})}
    </div>
  );
}

// ─── ZONE VIEWER ──────────────────────────────────────────
function ZoneViewer({player,zone,onClose,onMove,onHover,onHL,onRC,onScry,onMill}) {
  const [q,setQ]=useState('');
  const [millN,setMillN]=useState('');
  const [scryN,setScryN]=useState('');
  const [showScryInput,setShowScryInput]=useState(false);
  const [showMillInput,setShowMillInput]=useState(false);
  const [revealed,setRevealed]=useState(new Set());
  function revealCard(iid){setRevealed(function(prev){const s=new Set(prev);s.add(iid);return s;});}
  const [bannerVisible,setBannerVisible]=useState(true);
  useEffect(function(){
    if(!zone||zone!=='library') return;
    setBannerVisible(true);
    const t=setTimeout(function(){setBannerVisible(false);},3000);
    return function(){clearTimeout(t);};
  },[zone]);
  const cards=player[zone]||[];
  const shown=q?cards.filter(function(c){return c.name&&c.name.toLowerCase().indexOf(q.toLowerCase())!==-1;}):cards;
  const pal=player.pal;
  const lbl={graveyard:'Graveyard',exile:'Exile',library:'Library',hand:'Hand',command:'Command Zone'};
  const isLib=zone==='library';
  function doScry(){const n=Math.max(1,Math.min(20,parseInt(scryN)||1));onScry(n);setShowScryInput(false);setScryN('');}
  function doMill(){const n=Math.max(1,Math.min(cards.length||1,parseInt(millN)||1));onMill(n);setShowMillInput(false);setMillN('');}
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#17191e',border:'1px solid '+pal.border,borderRadius:10,width:'min(760px,94vw)',maxHeight:'82vh',display:'flex',flexDirection:'column',boxShadow:'0 8px 40px rgba(0,0,0,0.8)'}} onClick={function(e){e.stopPropagation();}}>
        <div style={{padding:'10px 16px',borderBottom:'1px solid '+pal.border+'44',display:'flex',alignItems:'center',gap:12,background:'rgba(0,0,0,0.4)',borderRadius:'10px 10px 0 0',flexWrap:'wrap'}}>
          <span style={{fontSize:14,fontWeight:700,color:pal.acc}}>{player.name} — {lbl[zone]||zone}</span>
          <span style={{fontSize:12,color:'#8a90a0'}}>({cards.length})</span>
          {/* Library-specific action buttons */}
          {isLib&&<div style={{display:'flex',gap:6,alignItems:'center'}}>
            {showScryInput
              ?<><input autoFocus value={scryN} onChange={function(e){setScryN(e.target.value);}} onKeyDown={function(e){if(e.key==='Enter')doScry();if(e.key==='Escape')setShowScryInput(false);}} placeholder="1–20" style={{width:50,background:'#252830',border:'1px solid '+pal.border,borderRadius:4,color:'#e2e8f0',fontSize:12,padding:'3px 6px',outline:'none'}}/><button onClick={doScry} style={{background:pal.acc,border:'none',borderRadius:4,color:'#000',fontSize:11,fontWeight:700,padding:'3px 8px',cursor:'pointer'}}>Go</button><button onClick={function(){setShowScryInput(false);}} style={{background:'transparent',border:'1px solid #3d4358',borderRadius:4,color:'#8a90a0',fontSize:11,padding:'3px 6px',cursor:'pointer'}}>✕</button></>
              :<button onClick={function(){setShowScryInput(true);setShowMillInput(false);}} style={{background:'#a78bfa22',border:'1px solid #a78bfa55',borderRadius:4,color:'#a78bfa',fontSize:11,fontWeight:600,padding:'3px 8px',cursor:'pointer'}}>🔮 Scry N</button>
            }
            {showMillInput
              ?<><input autoFocus value={millN} onChange={function(e){setMillN(e.target.value);}} onKeyDown={function(e){if(e.key==='Enter')doMill();if(e.key==='Escape')setShowMillInput(false);}} placeholder={'1–'+cards.length} style={{width:50,background:'#252830',border:'1px solid '+pal.border,borderRadius:4,color:'#e2e8f0',fontSize:12,padding:'3px 6px',outline:'none'}}/><button onClick={doMill} style={{background:'#f87171',border:'none',borderRadius:4,color:'#fff',fontSize:11,fontWeight:700,padding:'3px 8px',cursor:'pointer'}}>Go</button><button onClick={function(){setShowMillInput(false);}} style={{background:'transparent',border:'1px solid #3d4358',borderRadius:4,color:'#8a90a0',fontSize:11,padding:'3px 6px',cursor:'pointer'}}>✕</button></>
              :<button onClick={function(){setShowMillInput(true);setShowScryInput(false);}} style={{background:'#f8717122',border:'1px solid #f8717155',borderRadius:4,color:'#f87171',fontSize:11,fontWeight:600,padding:'3px 8px',cursor:'pointer'}}>💀 Mill N</button>
            }
          </div>}
          <input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Search..." style={{marginLeft:'auto',background:'#252830',border:'1px solid #3d4358',borderRadius:4,padding:'3px 8px',color:'#e2e8f0',fontSize:12,outline:'none',width:140}}/>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid #3d4358',borderRadius:4,color:'#a8b0c0',fontSize:12,padding:'3px 8px',cursor:'pointer'}}>✕</button>
        </div>
        {/* Library visible-to-all warning */}
        {isLib&&<div style={{background:'rgba(113,63,18,0.25)',borderBottom:'1px solid #c8960a44',padding:'6px 16px',fontSize:11,color:'#c8960a',fontWeight:600,textAlign:'center',opacity:bannerVisible?1:0,transition:'opacity 0.8s ease',pointerEvents:'none'}}>⚠️ Library contents are visible to all players at this table</div>}
        <div style={{overflowY:'auto',padding:12,display:'flex',flexWrap:'wrap',gap:10}}>
          {shown.length===0&&<div style={{color:'#565c70',fontSize:13,textAlign:'center',width:'100%',padding:32}}>{cards.length===0?(lbl[zone]||zone)+' is empty':'No matches'}</div>}
          {shown.map(function(c){
            const faceDown=isLib&&!revealed.has(c.iid);
            return (
            <div key={c.iid} style={{display:'flex',flexDirection:'column',gap:4,alignItems:'center'}}>
              <div style={{width:82,height:115,borderRadius:4,overflow:'hidden',cursor:'pointer',border:'1px solid '+pal.border}} onContextMenu={function(e){e.preventDefault();if(!faceDown)onRC(e,c);}} onMouseEnter={function(){if(!faceDown)onHover(c);}} onMouseLeave={onHL}>
                {faceDown
                  ?<CardBack w={82} h={115}/>
                  :<CardImg src={c.img} alt={c.name}
                    style={{width:'100%',height:'100%',objectFit:'cover'}}
                    fallStyle={{width:'100%',height:'100%',background:'#252830',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'#e2e8f0',textAlign:'center',padding:4,lineHeight:1.3}}/>
                }
              </div>
              <div style={{display:'flex',gap:2,flexWrap:'wrap',justifyContent:'center'}}>
                {faceDown&&<button onClick={function(){revealCard(c.iid);}} style={{background:'#c8960a22',border:'1px solid #c8960a55',borderRadius:3,color:'#c8960a',fontSize:8,padding:'2px 4px',cursor:'pointer'}}>👁 Reveal</button>}
                {!faceDown&&zone!=='battlefield'&&<button onClick={function(){onMove(c.iid,'battlefield');}} style={{background:'#4ade8022',border:'1px solid #4ade8055',borderRadius:3,color:'#4ade80',fontSize:8,padding:'2px 4px',cursor:'pointer'}}>⚔BF</button>}
                {!faceDown&&zone!=='hand'&&<button onClick={function(){onMove(c.iid,'hand');}} style={{background:'#e2e8f022',border:'1px solid #e2e8f055',borderRadius:3,color:'#e2e8f0',fontSize:8,padding:'2px 4px',cursor:'pointer'}}>✋</button>}
                {!faceDown&&zone!=='graveyard'&&<button onClick={function(){onMove(c.iid,'graveyard');}} style={{background:'#f8717122',border:'1px solid #f8717155',borderRadius:3,color:'#f87171',fontSize:8,padding:'2px 4px',cursor:'pointer'}}>💀</button>}
                {!faceDown&&zone!=='exile'&&<button onClick={function(){onMove(c.iid,'exile');}} style={{background:'#a78bfa22',border:'1px solid #a78bfa55',borderRadius:3,color:'#a78bfa',fontSize:8,padding:'2px 4px',cursor:'pointer'}}>✦</button>}
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ─── COUNTER MODAL ────────────────────────────────────────
function CounterModal({card,pal,onAdd,onClose}) {
  if(!card) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#17191e',border:'1px solid '+pal.border,borderRadius:10,padding:20,width:300}} onClick={function(e){e.stopPropagation();}}>
        <div style={{fontSize:14,fontWeight:700,color:pal.acc,marginBottom:14}}>{card.name}</div>
        {COUNTER_TYPES.map(function(type){
          const val=(card.counters&&card.counters[type])||0;
          const col=type==='+1/+1'?'#4ade80':type==='-1/-1'?'#f87171':type==='Loyalty'?'#60a5fa':type==='Poison'?'#a78bfa':'#c8960a';
          return (
            <div key={type} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{flex:1,fontSize:12,color:col,fontWeight:600}}>{type}</span>
              <button onClick={function(){onAdd(type,-1);}} style={{background:col+'22',border:'1px solid '+col+'55',borderRadius:4,color:col,fontSize:14,fontWeight:700,padding:'2px 8px',cursor:'pointer'}}>−</button>
              <span style={{fontSize:15,fontWeight:700,color:'#e2e8f0',minWidth:28,textAlign:'center'}}>{val}</span>
              <button onClick={function(){onAdd(type,1);}} style={{background:col+'22',border:'1px solid '+col+'55',borderRadius:4,color:col,fontSize:14,fontWeight:700,padding:'2px 8px',cursor:'pointer'}}>+</button>
            </div>
          );
        })}
        <button onClick={onClose} style={{marginTop:12,width:'100%',padding:'8px 0',background:'#252830',border:'1px solid #3d4358',borderRadius:6,color:'#a8b0c0',fontSize:12,cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
}

// ─── CMD DAMAGE ───────────────────────────────────────────
function CmdDmgModal({player,allPlayers,onDmg,onClose}) {
  const pal=player.pal;
  const others=allPlayers.filter(function(p){return p.pid!==player.pid;});
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#17191e',border:'1px solid '+pal.border,borderRadius:10,padding:20,width:340}} onClick={function(e){e.stopPropagation();}}>
        <div style={{fontSize:14,fontWeight:700,color:pal.acc,marginBottom:4}}>{player.name}</div>
        <div style={{fontSize:11,color:'#8a90a0',marginBottom:14}}>Commander damage received from:</div>
        {others.map(function(op){
          const dmg=(player.cmdDmg&&player.cmdDmg[op.pid])||0;
          return (
            <div key={op.pid} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#252830',borderRadius:6,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:op.pal.acc}}/>
              <span style={{flex:1,fontSize:12,color:op.pal.acc,fontWeight:600}}>{op.name}</span>
              <button onClick={function(){onDmg(op.pid,-1);}} style={{background:'#4ade8022',border:'1px solid #4ade8055',borderRadius:4,color:'#4ade80',fontSize:14,fontWeight:700,padding:'2px 8px',cursor:'pointer'}}>−</button>
              <span style={{fontSize:16,fontWeight:900,minWidth:32,textAlign:'center',color:dmg>=21?'#ef4444':dmg>=10?'#c8960a':'#e2e8f0'}}>{dmg}</span>
              <button onClick={function(){onDmg(op.pid,1);}} style={{background:'#f8717122',border:'1px solid #f8717155',borderRadius:4,color:'#f87171',fontSize:14,fontWeight:700,padding:'2px 8px',cursor:'pointer'}}>+</button>
              {dmg>=21&&<span style={{fontSize:11,color:'#ef4444',fontWeight:700}}>LETHAL</span>}
            </div>
          );
        })}
        <div style={{fontSize:10,color:'#565c70',textAlign:'center',marginTop:8}}>21+ commander damage = elimination</div>
        <button onClick={onClose} style={{marginTop:12,width:'100%',padding:'8px 0',background:'#252830',border:'1px solid #3d4358',borderRadius:6,color:'#a8b0c0',fontSize:12,cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
}

// ─── GAME LOG (docked sidebar) ────────────────────────────
function GameLog({entries,open,onToggle}) {
  const logRef=useRef(null);
  useEffect(function(){if(logRef.current)logRef.current.scrollTop=0;},[entries.length]);
  return (
    <div style={{width:open?230:28,minWidth:open?230:28,transition:'width 0.2s ease,min-width 0.2s ease',background:'#17191e',borderLeft:'1px solid #2e3240',display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0,position:'relative',zIndex:2}}>
      {/* Tab / header */}
      <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderBottom:'1px solid #2e3240',cursor:'pointer',background:'rgba(0,0,0,0.3)',userSelect:'none',flexShrink:0}}>
        {open
          ?<><span style={{fontSize:12,fontWeight:700,color:'#c8960a',flex:1}}>📜 Game Log</span><span style={{fontSize:11,color:'#565c70'}}>◀</span></>
          :<span style={{writingMode:'vertical-rl',textOrientation:'mixed',transform:'rotate(180deg)',fontSize:10,fontWeight:700,color:'#c8960a',letterSpacing:1}}>📜 LOG</span>
        }
      </div>
      {/* Entries */}
      {open&&<div ref={logRef} style={{overflowY:'auto',padding:'6px 10px',flex:1}}>
        {entries.length===0&&<div style={{color:'#3d4358',fontSize:11,textAlign:'center',padding:'20px 0'}}>No events yet</div>}
        {entries.map(function(e,i){
          const col=e[0]==='🔄'?'#c8960a':e[0]==='💀'?'#d94040':e[0]==='🃏'?'#4a8e65':e[0]==='⚡'?'#4a7aaa':'#565c70';
          return <div key={i} style={{fontSize:10,color:col,padding:'3px 0',borderBottom:'1px solid #1e2028',lineHeight:1.4}}>{e}</div>;
        })}
      </div>}
    </div>
  );
}

// ─── PLAYER MAT ───────────────────────────────────────────
function PlayerMat({player,isActive,isMain,isLocal,zoom,pan,onPan,onResetView,cardScale,onDraw,onDeal7,onUntap,onShuffle,onLife,onCardMD,onCardRC,onHover,onHL,onZone,onHandCardMD,isHandDragOver,matRef,onScry,onMill,outerScrollRef,onZoomWithScroll}) {
  const {name,pal,life,poison,library,hand,battlefield,graveyard,exile,command}=player;
  const [handOpen,setHO]=useState(false);
  const [hoverIdx,setHoverIdx]=useState(-1);
  const [isPanning,setIsPanning]=useState(false);
  const panStart=useRef(null);
  const [spaceDown,setSpaceDown]=useState(false);

  useEffect(function(){
    function kd(e){if(e.code==='Space'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();setSpaceDown(true);}}
    function ku(e){if(e.code==='Space')setSpaceDown(false);}
    window.addEventListener('keydown',kd);
    window.addEventListener('keyup',ku);
    return function(){window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);};
  },[]);
  function handScale(idx){
    if(hoverIdx<0) return 1;
    const d=Math.abs(idx-hoverIdx);
    return d===0?1.65:d===1?1.25:d===2?1.08:1;
  }
  const [libAction,setLibAction]=useState(null); // 'scry'|'mill'
  const [libN,setLibN]=useState('');
  const [handH,setHandH]=useState(160);
  const resizingHand=useRef(null);

  return (
    <div style={{flex:1,borderRadius:8,position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at center,'+pal.bg+'dd 0%,#0a0b0e 100%)',border:'2px solid '+(isActive?pal.acc:pal.border+'55'),boxShadow:isActive?'0 0 18px '+pal.glow+',inset 0 0 30px '+pal.glow:'none',transition:'box-shadow 0.3s,border-color 0.3s',minHeight:isMain?180:110}}>
      {isActive&&<div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,'+pal.glow+' 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>}

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',borderBottom:'1px solid '+pal.border+'33',position:'relative',zIndex:2,flexWrap:'wrap'}}>
        <div style={{width:9,height:9,borderRadius:'50%',background:pal.acc,boxShadow:'0 0 6px '+pal.acc,flexShrink:0}}/>
        <span style={{fontSize:13,fontWeight:800,color:pal.acc,flex:'1 1 auto',minWidth:40,letterSpacing:0.3}}>{name}{isActive?' ⚡':''}</span>

        {/* Life total */}
        <div style={{display:'flex',alignItems:'center',gap:3}}>
          <button onClick={function(){onLife(-1);}} style={{background:'transparent',border:'1px solid #ef444466',borderRadius:3,color:'#ef4444',fontSize:13,fontWeight:700,padding:'2px 7px',cursor:'pointer'}}>−</button>
          <span style={{fontSize:isMain?20:16,fontWeight:900,minWidth:36,textAlign:'center',color:life<=10?'#ef4444':life<=20?'#c8960a':'#e2e8f0'}}>♥{life}</span>
          <button onClick={function(){onLife(1);}} style={{background:'transparent',border:'1px solid #4ade8066',borderRadius:3,color:'#4ade80',fontSize:13,fontWeight:700,padding:'2px 7px',cursor:'pointer'}}>+</button>
        </div>
        {poison>0&&<span style={{fontSize:12,color:'#a78bfa',fontWeight:700}}>☠{poison}</span>}

        {/* Zone badges */}
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          {/* Library badge with inline scry/mill mini-controls */}
          <button onClick={function(){onZone('library');}} style={{background:'transparent',border:'1px solid #4a7aaa44',borderRadius:12,color:'#4a7aaa',fontSize:11,fontWeight:700,padding:'2px 8px',cursor:'pointer',opacity:library.length===0?0.4:1}}>📚{library.length}</button>
          {libAction===null
            ?<>
              <button onClick={function(){setLibAction('scry');setLibN('');}} title="Scry N" style={{background:'transparent',border:'1px solid #a78bfa44',borderRadius:3,color:'#8b7ab8',fontSize:10,padding:'2px 4px',cursor:'pointer'}}>🔮</button>
              <button onClick={function(){setLibAction('mill');setLibN('');}} title="Mill N" style={{background:'transparent',border:'1px solid #f8717144',borderRadius:3,color:'#d94040',fontSize:10,padding:'2px 4px',cursor:'pointer'}}>💀</button>
            </>
            :<div style={{display:'flex',alignItems:'center',gap:3}}>
              <span style={{fontSize:10,color:'#8a90a0'}}>{libAction==='scry'?'🔮':'💀'}</span>
              <input autoFocus value={libN} onChange={function(e){setLibN(e.target.value.replace(/\D/g,''));}} onKeyDown={function(e){
                if(e.key==='Enter'){const n=Math.max(1,parseInt(libN)||1);if(libAction==='scry')onScry(n);else onMill(n);setLibAction(null);}
                if(e.key==='Escape')setLibAction(null);
              }} placeholder="N" style={{width:32,background:'#252830',border:'1px solid #3d4358',borderRadius:3,color:'#e8eaf0',fontSize:10,padding:'2px 4px',outline:'none'}}/>
              <button onClick={function(){const n=Math.max(1,parseInt(libN)||1);if(libAction==='scry')onScry(n);else onMill(n);setLibAction(null);}} style={{background:'#4a7aaa',border:'none',borderRadius:3,color:'#fff',fontSize:9,padding:'2px 5px',cursor:'pointer'}}>Go</button>
              <button onClick={function(){setLibAction(null);}} style={{background:'transparent',border:'none',color:'#565c70',fontSize:10,cursor:'pointer',padding:'0 2px'}}>✕</button>
            </div>
          }
          {/* Remaining zone badges */}
          {[{z:'hand',i:'✋',c:'#e8eaf0',n:hand.length},{z:'graveyard',i:'💀',c:'#d94040',n:graveyard.length},{z:'exile',i:'✦',c:'#8b7ab8',n:exile.length},{z:'command',i:'👑',c:'#c8960a',n:command.length}].map(function(z){
            return <button key={z.z} onClick={function(){onZone(z.z);}} style={{background:'transparent',border:'1px solid '+z.c+'44',borderRadius:12,color:z.c,fontSize:11,fontWeight:700,padding:'2px 8px',cursor:'pointer',opacity:z.n===0?0.4:1}}>{z.i}{z.n}</button>;
          })}
        </div>

        {/* Action buttons — only enabled for the local player */}
        <div style={{display:'flex',gap:4,flexWrap:'wrap',opacity:isLocal?1:0.38,pointerEvents:isLocal?'auto':'none'}}>
          <button onClick={function(){onDraw();setHO(true);}} style={{background:pal.acc+'15',border:'1px solid '+pal.border,borderRadius:4,color:pal.acc,fontSize:11,fontWeight:600,padding:'4px 8px',cursor:'pointer'}}>Draw 1</button>
          {hand.length===0&&library.length>0&&<button onClick={function(){onDeal7();setHO(true);}} style={{background:'rgba(200,150,10,0.1)',border:'1px solid #c8960a44',borderRadius:4,color:'#c8960a',fontSize:11,fontWeight:700,padding:'4px 9px',cursor:'pointer'}}>Deal 7 ★</button>}
          <button onClick={onUntap} style={{background:pal.acc+'15',border:'1px solid '+pal.border,borderRadius:4,color:pal.acc,fontSize:11,fontWeight:600,padding:'4px 8px',cursor:'pointer'}}>Untap</button>
          <button onClick={onShuffle} style={{background:pal.acc+'15',border:'1px solid '+pal.border,borderRadius:4,color:pal.acc,fontSize:11,fontWeight:600,padding:'4px 8px',cursor:'pointer'}}>Shuffle</button>
          <button onClick={function(){setHO(function(o){return !o;});}} style={{background:handOpen?pal.acc+'30':pal.acc+'15',border:'1px solid '+pal.border,borderRadius:4,color:pal.acc,fontSize:11,fontWeight:600,padding:'4px 8px',cursor:'pointer'}}>Hand({hand.length}){handOpen?'▲':'▼'}</button>

          {/* View controls: zoom% display + reset */}
          <button onClick={onResetView} title="Reset view (zoom + pan)" style={{background:'rgba(0,0,0,0.45)',border:'1px solid #3d4358',borderRadius:4,color:'#8a90a0',fontSize:11,cursor:'pointer',padding:'3px 7px',lineHeight:1,flexShrink:0}}>↺ {Math.round(zoom*100)}%</button>
        </div>
      </div>

      {/* Battlefield — CSS transform canvas (pan + zoom) */}
      <div
        ref={outerScrollRef}
        style={{flex:1,overflow:'hidden',zIndex:1,position:'relative',background:pal.bg,cursor:isPanning?'grabbing':spaceDown?'grab':'default'}}
        onWheel={function(e){
          e.preventDefault();
          const el=outerScrollRef&&outerScrollRef.current;
          const rect=el?el.getBoundingClientRect():{left:0,top:0};
          const mx=e.clientX-rect.left;
          const my=e.clientY-rect.top;
          const delta=e.deltaY>0?-0.1:0.1;
          const newZoom=Math.max(0.15,Math.min(4.0,zoom+delta));
          onZoomWithScroll(newZoom,mx,my);
        }}
        onMouseDown={function(e){
          if(e.button===1||(e.button===0&&spaceDown)){
            e.preventDefault();
            setIsPanning(true);
            panStart.current={mx:e.clientX,my:e.clientY,px:pan.x,py:pan.y};
          }
        }}
        onMouseMove={function(e){
          if(isPanning&&panStart.current){
            const dx=e.clientX-panStart.current.mx;
            const dy=e.clientY-panStart.current.my;
            onPan({x:panStart.current.px+dx,y:panStart.current.py+dy});
          }
        }}
        onMouseUp={function(){setIsPanning(false);panStart.current=null;}}
        onMouseLeave={function(){setIsPanning(false);panStart.current=null;}}
      >
        <div
          ref={matRef}
          data-bfpid={player.pid}
          style={{
            position:'absolute',
            top:0,left:0,
            width:'100%',height:'100%',
            transform:'translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')',
            transformOrigin:'0 0',
            background:isHandDragOver?pal.glow+'55':'transparent',
            backgroundImage:player.playmat?'url('+player.playmat+')':'none',
            backgroundSize:player.playmatFit==='contain'?'contain':player.playmatFit==='repeat'?'auto':player.playmatFit==='center'?'auto':'cover',
            backgroundRepeat:player.playmatFit==='repeat'?'repeat':'no-repeat',
            backgroundPosition:'center',
          }}
        >
          {battlefield.map(function(card){
            return <CardToken key={card.iid} card={card} scale={cardScale} onMD={function(e){onCardMD(e,card.iid);}} onRC={function(e){onCardRC(e,card.iid,'battlefield');}} onME={function(){onHover(card);}} onML={onHL}/>;
          })}
          {battlefield.length===0&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6,pointerEvents:'none'}}>
              <span style={{color:isHandDragOver?pal.acc:'#252830',fontSize:isHandDragOver?13:11,fontWeight:isHandDragOver?700:400,transition:'color 0.12s'}}>
                {isHandDragOver?'⬇ Drop to play on battlefield':'Battlefield — drag cards from hand, or right-click to play'}
              </span>
              {!isHandDragOver&&<span style={{color:'#1e2230',fontSize:11}}>Scroll to zoom · Space+drag or middle-click to pan</span>}
            </div>
          )}
          {/* Drop hint overlay when hand-dragging over non-empty battlefield */}
          {isHandDragOver&&battlefield.length>0&&(
            <div style={{position:'absolute',inset:0,border:'2px dashed '+pal.acc,borderRadius:6,pointerEvents:'none',background:pal.glow+'22',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:10}}>
              <span style={{color:pal.acc,fontSize:11,fontWeight:700,background:'rgba(0,0,0,0.6)',padding:'2px 8px',borderRadius:4}}>⬇ Release to play here</span>
            </div>
          )}
        </div>
      </div>

      {/* Command zone */}
      {command.length>0&&<div style={{position:'absolute',right:4,bottom:handOpen?98:4,display:'flex',flexDirection:'column',gap:2,zIndex:3}}>
        {command.map(function(c){return (
          <div key={c.iid} style={{width:38,height:53,borderRadius:3,overflow:'hidden',cursor:'pointer',border:'2px solid '+pal.acc,boxShadow:'0 0 8px '+pal.glow}} onContextMenu={function(e){onCardRC(e,c.iid,'command');}} onMouseEnter={function(){onHover(c);}} onMouseLeave={onHL}>
            <CardImg src={c.img} alt={c.name}
              style={{width:'100%',height:'100%',objectFit:'cover'}}
              fallStyle={{width:'100%',height:'100%',background:'#252830',display:'flex',alignItems:'center',justifyContent:'center',fontSize:6,color:'#e2e8f0',textAlign:'center',padding:2}}/>
          </div>
        );})}
      </div>}

      {/* Hand tray — dock-style hover zoom, resizable */}
      {handOpen&&<div style={{position:'relative',zIndex:4,display:'flex',flexDirection:'column',flexShrink:0}}>
        {/* Drag handle */}
        <div
          style={{height:5,cursor:'ns-resize',background:'transparent',borderTop:'2px solid '+pal.acc+'33',flexShrink:0}}
          onMouseDown={function(e){
            e.preventDefault();
            const startY=e.clientY;
            const startH=handH;
            function onM(ev){const delta=startY-ev.clientY;setHandH(Math.max(80,Math.min(400,startH+delta)));}
            function onU(){window.removeEventListener('mousemove',onM);window.removeEventListener('mouseup',onU);}
            window.addEventListener('mousemove',onM);
            window.addEventListener('mouseup',onU);
          }}
        />
        <div style={{height:handH+'px',background:'linear-gradient(to top,rgba(0,0,0,0.95),rgba(0,0,0,0.7))',paddingTop:52,paddingBottom:10,paddingLeft:8,paddingRight:8,display:'flex',gap:8,overflowX:'auto',overflowY:'visible',alignItems:'flex-end',position:'relative'}}>
        {/* Hand label */}
        <div style={{position:'absolute',top:8,left:10,fontSize:10,fontWeight:600,color:pal.acc+'88',userSelect:'none',letterSpacing:1}}>HAND ({hand.length})</div>
        {!isLocal&&hand.length>0
          ?hand.map(function(_,i){return <div key={i} style={{flexShrink:0,width:70,height:98,borderRadius:4}}><CardBack w={70} h={98}/></div>;})
          :hand.length===0
          ?<span style={{color:'#565c70',fontSize:11,alignSelf:'center',flex:1,textAlign:'center'}}>Hand empty — click Draw 1 or Deal 7 ★</span>
          :hand.map(function(c,idx){
            const sc=handScale(idx);
            return (
              <div key={c.iid} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3,transformOrigin:'bottom center',transform:'scale('+sc+')',transition:'transform 0.14s ease',zIndex:hoverIdx===idx?20:hoverIdx>=0&&Math.abs(idx-hoverIdx)===1?10:1,position:'relative'}}>
                <div
                  style={{width:70,height:98,borderRadius:4,overflow:'hidden',cursor:'grab',border:'2px solid '+(hoverIdx===idx?pal.acc:pal.border+'88'),userSelect:'none',boxShadow:hoverIdx===idx?'0 0 16px '+pal.glow+', 0 4px 12px rgba(0,0,0,0.6)':'0 2px 8px rgba(0,0,0,0.5)',transition:'border-color 0.1s, box-shadow 0.1s'}}
                  onMouseDown={function(e){onHandCardMD(e,c.iid);}}
                  onContextMenu={function(e){onCardRC(e,c.iid,'hand');}}
                  onMouseEnter={function(){setHoverIdx(idx);onHover(c);}}
                  onMouseLeave={function(){setHoverIdx(-1);onHL();}}
                >
                  <CardImg src={c.img} alt={c.name}
                    style={{width:'100%',height:'100%',objectFit:'cover'}}
                    fallStyle={{width:'100%',height:'100%',background:'linear-gradient(135deg,#1e2028,#111318)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'#e8eaf0',textAlign:'center',padding:4,lineHeight:1.3,fontWeight:600}}/>
                </div>
                <div style={{fontSize:9,color:hoverIdx===idx?pal.acc:'#565c70',maxWidth:70,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'center',fontWeight:hoverIdx===idx?600:400,transition:'color 0.1s'}}>{c.name}</div>
              </div>
            );
          })}
        </div>
      </div>}
    </div>
  );
}

// ─── TURN BAR ─────────────────────────────────────────────
function TurnBar({players,turn,round,onPassTurn,onSettings,onLog,logOpen}) {
  const cur=players[turn]||players[0];
  const pal=cur.pal;
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 14px',background:'rgba(10,11,15,0.96)',borderBottom:'1px solid #2a2e40',zIndex:10,flexWrap:'wrap',flexShrink:0}}>
      <div style={{fontSize:16,fontWeight:900,color:'#c8960a',letterSpacing:-1,marginRight:4}}>⚔ SPELLBOUND</div>
      <div style={{width:1,height:20,background:'#2a2e40',flexShrink:0}}/>
      {/* Active player indicator */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:pal.acc+'18',border:'1px solid '+pal.acc+'55',borderRadius:20,transition:'all 0.3s'}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:pal.acc,boxShadow:'0 0 6px '+pal.acc}}/>
        <span style={{fontSize:12,fontWeight:700,color:pal.acc}}>{cur.name}</span>
        <span style={{fontSize:10,color:pal.acc+'88',fontWeight:500}}>Round {round}</span>
      </div>
      {/* Pass turn button */}
      <button onClick={onPassTurn} style={{padding:'5px 14px',background:'linear-gradient(135deg,'+pal.acc+'33,'+pal.acc+'18)',border:'1px solid '+pal.acc+'66',borderRadius:16,color:pal.acc,fontSize:11,fontWeight:700,cursor:'pointer',letterSpacing:0.5,transition:'all 0.2s'}}>
        Pass Turn →
      </button>
      <div style={{flex:1}}/>
      {/* Life totals mini display */}
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        {players.map(function(p){
          return (
            <div key={p.pid} title={p.name} style={{display:'flex',alignItems:'center',gap:3,padding:'2px 8px',background:p.pid===turn?p.pal.acc+'22':'rgba(255,255,255,0.04)',border:'1px solid '+(p.pid===turn?p.pal.acc+'55':'#2a2e40'),borderRadius:12,transition:'all 0.2s'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:p.pal.acc}}/>
              <span style={{fontSize:11,fontWeight:p.pid===turn?700:400,color:p.pid===turn?p.pal.acc:'#8a90a0'}}>{p.life}</span>
            </div>
          );
        })}
      </div>
      <div style={{width:1,height:20,background:'#2a2e40',flexShrink:0}}/>
      <button onClick={onSettings} style={{background:'transparent',border:'1px solid #2a2e40',borderRadius:6,color:'#8a90a0',fontSize:11,padding:'4px 9px',cursor:'pointer'}}>⚙</button>
      <button onClick={onLog} style={{background:logOpen?'#252830':'transparent',border:'1px solid #2a2e40',borderRadius:6,color:logOpen?'#c8960a':'#8a90a0',fontSize:11,padding:'4px 9px',cursor:'pointer'}}>📜</button>
    </div>
  );
}

// ─── TOAST NOTIFICATION ───────────────────────────────────
function Toast({msg,color,onDone}) {
  const [visible,setVisible]=useState(true);
  useEffect(function(){
    const t1=setTimeout(function(){setVisible(false);},1200);
    const t2=setTimeout(onDone,1700);
    return function(){clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return (
    <div style={{
      position:'fixed',bottom:22,right:22,
      background:'rgba(14,15,20,0.92)',
      backdropFilter:'blur(10px)',
      border:'1px solid '+(color||'#c8960a')+'66',
      borderRadius:8,padding:'8px 14px',
      zIndex:9900,color:color||'#c8960a',
      fontSize:11,fontWeight:600,
      boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
      pointerEvents:'none',
      whiteSpace:'nowrap',
      opacity:visible?1:0,
      transform:visible?'translateY(0)':'translateY(8px)',
      transition:'opacity 0.4s ease, transform 0.4s ease',
      maxWidth:280,
    }}>
      {msg}
    </div>
  );
}

// ─── SCRY MODAL ───────────────────────────────────────────
function ScryModal({pid,cards,pal,onConfirm,onClose}) {
  const [decisions,setDec]=useState({});
  const allDone=cards.length>0&&cards.every(function(c){return decisions[c.iid]==='top'||decisions[c.iid]==='bottom';});
  function dec(iid,loc){setDec(function(prev){return Object.assign({},prev,{[iid]:loc});});}
  function confirm(){
    const top=cards.filter(function(c){return decisions[c.iid]==='top';});
    const bot=cards.filter(function(c){return decisions[c.iid]==='bottom';});
    onConfirm(top,bot);
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#17191e',border:'1px solid '+pal.border,borderRadius:10,padding:20,maxWidth:'90vw',boxShadow:'0 8px 40px rgba(0,0,0,0.9)'}} onClick={function(e){e.stopPropagation();}}>
        <div style={{fontSize:15,fontWeight:700,color:pal.acc,marginBottom:4}}>🔮 Scry {cards.length}</div>
        <div style={{fontSize:11,color:'#8a90a0',marginBottom:16}}>Choose where to put each card — Top or Bottom of library</div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginBottom:18}}>
          {cards.map(function(c){
            const d=decisions[c.iid];
            return (
              <div key={c.iid} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                <div style={{width:82,height:115,borderRadius:4,overflow:'hidden',border:'2px solid '+(d==='top'?'#4ade80':d==='bottom'?'#f87171':pal.border),boxShadow:d?'0 0 10px '+(d==='top'?'rgba(74,222,128,0.4)':'rgba(248,113,113,0.4)'):'none',transition:'border-color 0.15s'}}>
                  <CardImg src={c.img} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}} fallStyle={{width:'100%',height:'100%',background:'#252830',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'#e2e8f0',textAlign:'center',padding:4}}/>
                </div>
                <div style={{fontSize:10,color:'#a8b0c0',textAlign:'center',maxWidth:82,lineHeight:1.3,fontWeight:600}}>{c.name}</div>
                <div style={{display:'flex',gap:4}}>
                  <button onClick={function(){dec(c.iid,'top');}} style={{background:d==='top'?'#4ade80':'#4ade8022',border:'1px solid '+(d==='top'?'#4ade80':'#4ade8055'),borderRadius:4,color:d==='top'?'#000':'#4ade80',fontSize:11,fontWeight:700,padding:'3px 8px',cursor:'pointer'}}>▲ Top</button>
                  <button onClick={function(){dec(c.iid,'bottom');}} style={{background:d==='bottom'?'#f87171':'#f8717122',border:'1px solid '+(d==='bottom'?'#f87171':'#f8717155'),borderRadius:4,color:d==='bottom'?'#fff':'#f87171',fontSize:11,fontWeight:700,padding:'3px 8px',cursor:'pointer'}}>▼ Bot</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'center'}}>
          <button onClick={confirm} disabled={!allDone} style={{background:allDone?pal.acc:'#3d4358',border:'none',borderRadius:6,color:allDone?'#000':'#8a90a0',fontSize:13,fontWeight:700,padding:'9px 24px',cursor:allDone?'pointer':'not-allowed',transition:'background 0.15s'}}>✓ Confirm</button>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid #3d4358',borderRadius:6,color:'#a8b0c0',fontSize:12,padding:'9px 16px',cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── DICE / COIN MODAL ────────────────────────────────────
function DiceModal({mode,onRoll,onFlip,onLog,onClose}) {
  const [result,setResult]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [customSides,setCustomSides]=useState('');
  const PRESETS=[4,6,8,10,12,20,100];

  function doRoll(sides){
    setRolling(true);setResult(null);
    setTimeout(function(){
      const r=onRoll(sides);
      setResult({type:'dice',sides:sides,value:r,max:sides});
      setRolling(false);
    },400);
  }
  function doCoin(){
    setRolling(true);setResult(null);
    setTimeout(function(){
      const r=onFlip();
      setResult({type:'coin',value:r});
      setRolling(false);
    },400);
  }
  const isCoin=mode==='coin';
  const accent=isCoin?'#c8960a':'#a78bfa';
  const isNat=result&&result.type==='dice'&&(result.value===result.max||result.value===1);
  const natColor=result&&result.value===result.max?'#4ade80':'#f87171';
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#17191e',border:'1px solid '+accent+'55',borderRadius:10,padding:24,width:340,boxShadow:'0 8px 40px rgba(0,0,0,0.9)'}} onClick={function(e){e.stopPropagation();}}>
        <div style={{fontSize:15,fontWeight:700,color:accent,marginBottom:20,textAlign:'center'}}>{isCoin?'🪙 Flip a Coin':'🎲 Roll Dice'}</div>

        {/* Result display */}
        <div style={{textAlign:'center',minHeight:90,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
          {rolling
            ?<span style={{fontSize:48,animation:'spin 0.3s linear infinite'}}>{isCoin?'🪙':'🎲'}</span>
            :result
              ?<div>
                <div style={{fontSize:isCoin?40:56,fontWeight:900,color:isCoin?(result.value==='Heads'?'#c8960a':'#a8b0c0'):(isNat?natColor:'#e2e8f0'),lineHeight:1,textShadow:isCoin?'none':'0 0 20px '+(isNat?natColor:'rgba(255,255,255,0.2)')}}>
                  {isCoin?result.value:result.value}
                </div>
                {!isCoin&&result.max&&<div style={{fontSize:11,color:'#565c70',marginTop:4}}>d{result.max}{isNat?(' — '+(result.value===result.max?'NATURAL MAX!':'NATURAL 1!')):''}  </div>}
              </div>
              :<span style={{color:'#3d4358',fontSize:36}}>{isCoin?'🪙':'🎲'}</span>
          }
        </div>

        {isCoin
          ?<button onClick={doCoin} disabled={rolling} style={{width:'100%',padding:'12px 0',background:accent,border:'none',borderRadius:6,color:'#000',fontSize:14,fontWeight:700,cursor:'pointer'}}>Flip!</button>
          :<div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:10}}>
              {PRESETS.map(function(s){return <button key={s} onClick={function(){doRoll(s);}} disabled={rolling} style={{background:'#a78bfa22',border:'1px solid #a78bfa55',borderRadius:5,color:'#a78bfa',fontSize:13,fontWeight:700,padding:'6px 10px',cursor:'pointer',minWidth:42}}>d{s}</button>;})}
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <input value={customSides} onChange={function(e){setCustomSides(e.target.value.replace(/\D/g,''));}} placeholder="Custom sides..." style={{flex:1,background:'#252830',border:'1px solid #3d4358',borderRadius:4,color:'#e2e8f0',fontSize:12,padding:'6px 10px',outline:'none'}}/>
              <button onClick={function(){const s=parseInt(customSides);if(s>=2)doRoll(s);}} disabled={rolling||!parseInt(customSides)||parseInt(customSides)<2} style={{background:'#a78bfa',border:'none',borderRadius:5,color:'#000',fontSize:12,fontWeight:700,padding:'6px 12px',cursor:'pointer'}}>Roll</button>
            </div>
          </div>
        }
        <button onClick={onClose} style={{marginTop:14,width:'100%',padding:'8px 0',background:'transparent',border:'1px solid #3d4358',borderRadius:6,color:'#8a90a0',fontSize:12,cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
}

// ─── UI SETTINGS MODAL ────────────────────────────────────
function UISettingsModal({settings,onChange,players,onPlaymat,onClose}) {
  const [s,setS]=useState(settings);
  function upd(key,val){const ns=Object.assign({},s,{[key]:val});setS(ns);onChange(ns);}
  const row={display:'flex',alignItems:'center',gap:8,marginBottom:14};
  const lbl={fontSize:11,color:'#a8b0c0',marginBottom:5};
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9800,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#17191e',border:'1px solid #3d4358',borderRadius:10,padding:24,width:340,boxShadow:'0 8px 40px rgba(0,0,0,0.8)'}} onClick={function(e){e.stopPropagation();}}>
        <div style={{fontSize:15,fontWeight:700,color:'#c8960a',marginBottom:20}}>⚙ UI Settings</div>

        {/* UI Scale */}
        <div style={{marginBottom:16}}>
          <div style={lbl}>UI Scale: <strong style={{color:'#e2e8f0'}}>{Math.round((s.uiScale||1)*100)}%</strong></div>
          <input type="range" min={70} max={150} step={5} value={Math.round((s.uiScale||1)*100)}
            onChange={function(e){upd('uiScale',parseInt(e.target.value)/100);}}
            style={{width:'100%',accentColor:'#c8960a'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#565c70',marginTop:2}}><span>70%</span><span>100%</span><span>150%</span></div>
        </div>

        {/* Card Scale */}
        <div style={{marginBottom:16}}>
          <div style={lbl}>Card Scale: <strong style={{color:'#e2e8f0'}}>{Math.round(s.cardScale*100)}%</strong></div>
          <input type="range" min={50} max={200} step={5} value={Math.round(s.cardScale*100)}
            onChange={function(e){upd('cardScale',parseInt(e.target.value)/100);}}
            style={{width:'100%',accentColor:'#c8960a'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#565c70',marginTop:2}}><span>50%</span><span>100%</span><span>200%</span></div>
        </div>

        {/* Default Zoom */}
        <div style={{marginBottom:16}}>
          <div style={lbl}>Default Battlefield Zoom: <strong style={{color:'#e2e8f0'}}>{Math.round(s.defaultZoom*100)}%</strong></div>
          <input type="range" min={30} max={300} step={5} value={Math.round(s.defaultZoom*100)}
            onChange={function(e){upd('defaultZoom',parseInt(e.target.value)/100);}}
            style={{width:'100%',accentColor:'#c8960a'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#565c70',marginTop:2}}><span>30%</span><span>100%</span><span>300%</span></div>
        </div>

        {/* Toggles */}
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {[
            ['showZoomPanel','🔍 Show card zoom preview on hover'],
          ].map(function(pair){
            const key=pair[0],label=pair[1];
            return (
              <label key={key} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'7px 10px',background:'#252830',borderRadius:6,border:'1px solid #3d4358'}}>
                <input type="checkbox" checked={!!s[key]} onChange={function(e){upd(key,e.target.checked);}} style={{accentColor:'#c8960a',width:14,height:14}}/>
                <span style={{fontSize:12,color:'#e2e8f0'}}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* Per-player playmat URLs */}
        {players&&players.length>0&&<div style={{marginBottom:16}}>
          <div style={lbl}>🖼 Playmat Images (per player)</div>
          {players.map(function(p){return (
            <div key={p.pid} style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:p.pal.acc,flexShrink:0}}/>
              <span style={{fontSize:10,color:p.pal.acc,minWidth:60,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
              <input value={p.playmat||''} onChange={function(e){onPlaymat&&onPlaymat(p.pid,'url',e.target.value);}} placeholder="Image URL..." style={{flex:1,background:'#252830',border:'1px solid #3d4358',borderRadius:4,color:'#a8b0c0',fontSize:11,padding:'4px 6px',outline:'none'}}/>
              <select value={p.playmatFit||'cover'} onChange={function(e){onPlaymat&&onPlaymat(p.pid,'fit',e.target.value);}} style={{background:'#252830',border:'1px solid #3d4358',borderRadius:4,color:'#a8b0c0',fontSize:11,padding:'3px 4px',outline:'none'}}>
                <option value="cover">Stretch</option>
                <option value="contain">Fit</option>
                <option value="repeat">Tile</option>
                <option value="center">Center</option>
              </select>
            </div>
          );})}
        </div>}

        <button onClick={onClose} style={{width:'100%',padding:'9px 0',background:'#3d4358',border:'none',borderRadius:6,color:'#e2e8f0',fontSize:12,cursor:'pointer',fontWeight:600}}>Close</button>
      </div>
    </div>
  );
}

// ─── COMMANDER SELECT SCREEN ──────────────────────────────
function CommanderSelectScreen({game,cmdSelections,setCmdSelections,cmdReady,setCmdReady,onBegin}) {
  const allReady=game.players.every(function(p){return cmdReady[p.pid];});
  function toggleCard(pid,iid){
    setCmdSelections(function(prev){
      const cur=(prev[pid]||[]).slice();
      const idx=cur.indexOf(iid);
      if(idx!==-1){cur.splice(idx,1);}
      else if(cur.length<2){cur.push(iid);}
      return Object.assign({},prev,{[pid]:cur});
    });
    setCmdReady(function(prev){return Object.assign({},prev,{[pid]:false});});
  }
  function setReady(pid){setCmdReady(function(prev){return Object.assign({},prev,{[pid]:true});});}
  return (
    <div style={{minHeight:'100vh',background:'radial-gradient(ellipse at 50% 30%,#0d0a1e 0%,#0a0b0e 100%)',color:'#e2e8f0',display:'flex',flexDirection:'column',alignItems:'center',padding:'28px 16px',overflowY:'auto'}}>
      <div style={{fontSize:26,fontWeight:900,background:'linear-gradient(90deg,#c8960a,#8a6008)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:2,marginBottom:6}}>⚔ COMMANDER SELECTION</div>
      <div style={{fontSize:13,color:'#8a90a0',marginBottom:24}}>Each player selects up to 2 legendary commanders. Click "✓ Ready" when done.</div>
      <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:1200}}>
        {game.players.map(function(p){
          const pal=p.pal;
          const eligible=[...p.library,...p.command].filter(function(c){return c.isLegendary&&(c.isCreature||c.isPlaneswalker);});
          const sel=cmdSelections[p.pid]||[];
          const ready=cmdReady[p.pid];
          return (
            <div key={p.pid} style={{flex:'1 1 220px',maxWidth:280,background:pal.bg,border:'2px solid '+(ready?pal.acc:pal.border),borderRadius:10,overflow:'hidden',display:'flex',flexDirection:'column',transition:'border-color 0.2s',backdropFilter:'blur(20px)'}}>
              <div style={{padding:'12px 14px',background:'rgba(0,0,0,0.5)',borderBottom:'1px solid '+pal.border}}>
                <div style={{fontSize:14,fontWeight:800,color:pal.acc,marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:11,color:'#8a90a0'}}>{eligible.length} eligible commander{eligible.length!==1?'s':''} · {sel.length}/2 selected</div>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:10,display:'flex',flexWrap:'wrap',gap:8,maxHeight:340}}>
                {eligible.length===0&&<div style={{color:'#565c70',fontSize:12,padding:8,width:'100%',textAlign:'center'}}>No legendary creatures or planeswalkers found.</div>}
                {eligible.map(function(c){
                  const isSel=sel.includes(c.iid);
                  return (
                    <div key={c.iid} onClick={function(){if(!ready)toggleCard(p.pid,c.iid);}} style={{width:70,cursor:ready?'default':'pointer',opacity:ready&&!isSel?0.45:1,transition:'opacity 0.15s,transform 0.15s',transform:isSel?'scale(1.06)':'scale(1)'}}>
                      <div style={{width:70,height:98,borderRadius:4,overflow:'hidden',border:'2px solid '+(isSel?pal.acc:pal.border),boxShadow:isSel?'0 0 10px '+pal.glow:'none',transition:'border-color 0.15s,box-shadow 0.15s'}}>
                        <CardImg src={c.img} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}} fallStyle={{width:'100%',height:'100%',background:'#252830',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'#e2e8f0',textAlign:'center',padding:3,lineHeight:1.3}}/>
                      </div>
                      <div style={{fontSize:8,color:isSel?pal.acc:'#8a90a0',marginTop:2,textAlign:'center',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:70}}>{c.name}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{padding:'8px 12px',borderTop:'1px solid '+pal.border}}>
                {ready
                  ?<div style={{textAlign:'center',color:pal.acc,fontSize:12,fontWeight:700}}>✓ Ready!</div>
                  :<button onClick={function(){setReady(p.pid);}} style={{width:'100%',padding:'7px 0',background:pal.acc+'22',border:'1px solid '+pal.acc,borderRadius:6,color:pal.acc,fontSize:12,fontWeight:700,cursor:'pointer'}}>✓ Ready</button>
                }
              </div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:28,display:'flex',gap:16,alignItems:'center'}}>
        <div style={{fontSize:12,color:'#565c70'}}>
          {game.players.filter(function(p){return cmdReady[p.pid];}).length} / {game.players.length} ready
        </div>
        <button onClick={onBegin} disabled={!allReady} style={{padding:'12px 36px',background:allReady?'linear-gradient(90deg,#c8960a,#8a6008)':'#252830',border:allReady?'none':'1px solid #3d4358',borderRadius:8,color:allReady?'#000':'#565c70',fontSize:15,fontWeight:900,cursor:allReady?'pointer':'default',letterSpacing:1,boxShadow:allReady?'0 4px 18px rgba(251,191,36,0.25)':'none',transition:'all 0.2s'}}>
          ⚔ BEGIN!
        </button>
      </div>
    </div>
  );
}

// ─── SETUP SCREEN ─────────────────────────────────────────
function SetupScreen({nPlayers,setNP,setups,setSU,onStart}) {
  return (
    <div style={{minHeight:'100vh',background:'radial-gradient(ellipse at 50% 30%,#0d0a1e 0%,#0a0b0e 100%)',color:'#e2e8f0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'32px 16px',overflowY:'auto'}}>
      <div style={{textAlign:'center',marginBottom:36}}>
        <div style={{fontSize:52,fontWeight:900,letterSpacing:-3,background:'linear-gradient(135deg,#c8960a,#8a6008)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>⚔ SPELLBOUND</div>
        <div style={{fontSize:11,color:'#565c70',letterSpacing:4,marginTop:4}}>MTG COMMANDER ONLINE</div>
        <div style={{fontSize:11,color:'#3d4358',marginTop:8}}>35 demo cards pre-loaded · Paste Moxfield/MTGO decks for custom play · 2–6 players</div>
      </div>
      <div style={{background:'#1e2028',border:'1px solid #252830',borderRadius:12,padding:24,width:'100%',maxWidth:780}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:'#8a90a0',letterSpacing:2,marginBottom:8}}>NUMBER OF PLAYERS</div>
          <div style={{display:'flex',gap:8}}>
            {[2,3,4,5,6].map(function(n){return <button key={n} onClick={function(){setNP(n);}} style={{flex:1,padding:'10px 0',borderRadius:8,cursor:'pointer',border:'2px solid '+(nPlayers===n?'#c8960a':'#252830'),background:nPlayers===n?'rgba(251,191,36,0.1)':'transparent',color:nPlayers===n?'#c8960a':'#3d4358',fontSize:20,fontWeight:900}}>{n}</button>;  })}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,marginBottom:20}}>
          {setups.slice(0,nPlayers).map(function(p,i){
            const pal=PALETTES[i%PALETTES.length];
            const count=parseDeck(p.deck).length;
            return (
              <div key={i} style={{background:'#17191e',borderRadius:8,padding:12,border:'1px solid '+pal.acc+'33'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:pal.acc,flexShrink:0}}/>
                  <input value={p.name} onChange={function(e){const s=setups.slice();s[i]=Object.assign({},s[i],{name:e.target.value});setSU(s);}} style={{background:'transparent',border:'none',outline:'none',color:pal.acc,fontSize:13,fontWeight:700,flex:1,minWidth:0}} placeholder={'Player '+(i+1)}/>
                </div>
                <textarea value={p.deck} onChange={function(e){const s=setups.slice();s[i]=Object.assign({},s[i],{deck:e.target.value});setSU(s);}}
                  placeholder={"Paste deck:\n1 Sol Ring\n1 Command Tower\n...\nCommander\n1 Atraxa, Praetors' Voice"}
                  style={{width:'100%',height:90,background:'#0a0f1a',border:'1px solid '+pal.border+'44',borderRadius:6,color:'#a8b0c0',fontSize:10,padding:8,resize:'vertical',outline:'none',fontFamily:'monospace',boxSizing:'border-box'}}/>
                <div style={{fontSize:10,marginTop:4,color:count>0?pal.acc:'#3d4358'}}>{count>0?'✓ '+count+' cards detected':'Leave blank → 35 demo cards loaded'}</div>
                <input value={p.playmat||''} onChange={function(e){const s=setups.slice();s[i]=Object.assign({},s[i],{playmat:e.target.value});setSU(s);}} placeholder="Playmat image URL (optional)..." style={{marginTop:6,width:'100%',background:'#0a0f1a',border:'1px solid '+pal.border+'33',borderRadius:4,color:'#8a90a0',fontSize:9,padding:'4px 6px',outline:'none',boxSizing:'border-box'}}/>
              </div>
            );
          })}
        </div>
        <button onClick={onStart} style={{width:'100%',padding:'14px 0',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#d97706,#b45309)',color:'#fff',fontSize:16,fontWeight:700,letterSpacing:1,boxShadow:'0 0 24px rgba(217,119,6,0.4)'}}>⚔ BEGIN GAME</button>
        <div style={{textAlign:'center',marginTop:10,fontSize:11,color:'#3d4358'}}>Demo cards always available · Custom deck art via Scryfall · Images © Wizards of the Coast</div>
      </div>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────
function LoadingScreen({done,total,current}) {
  const pct=total>0?Math.round(done/total*100):0;
  return (
    <div style={{minHeight:'100vh',background:'#0a0b0e',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#e2e8f0'}}>
      <div style={{fontSize:36,fontWeight:900,color:'#c8960a',letterSpacing:-2,marginBottom:8}}>⚔ SPELLBOUND</div>
      <div style={{fontSize:11,color:'#565c70',letterSpacing:3,marginBottom:40}}>LOADING CARD DATA</div>
      <div style={{width:400,maxWidth:'80vw'}}>
        <div style={{background:'#252830',borderRadius:8,overflow:'hidden',marginBottom:8,height:10}}>
          <div style={{height:'100%',background:'linear-gradient(90deg,#d97706,#c8960a)',width:pct+'%',transition:'width 0.3s',borderRadius:8}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#565c70',marginBottom:14}}>
          <span>Fetching via Scryfall...</span><span>{done}/{total} ({pct}%)</span>
        </div>
        {current&&<div style={{textAlign:'center',fontSize:12,color:'#a78bfa',background:'#25283088',borderRadius:6,padding:'6px 12px'}}>{current}</div>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState('setup');
  const [nPlayers,setNP]=useState(4);
  const [setups,setSU]=useState(Array.from({length:6},function(_,i){return {name:'Player '+(i+1),deck:''};  }));
  const [ld,setLD]=useState({done:0,total:0,current:''});
  const [game,setGame]=useState(null);
  const [hover,setHover]=useState(null);
  const [ctx,setCtx]=useState(null);
  const [zv,setZV]=useState(null);
  const [ctr,setCtr]=useState(null);
  const [dmg,setDmg]=useState(null);
  const [logOpen,setLog]=useState(true);
  // UI settings
  const [uiSettings,setUISettings]=useState({cardScale:1,defaultZoom:1,autoMana:true,showZoomPanel:true,uiScale:1.1});
  const [settingsOpen,setSettingsOpen]=useState(false);
  // Per-player battlefield zoom
  const [zooms,setZooms]=useState({});
  // Per-player battlefield pan (for CSS transform canvas)
  const [pans,setPans]=useState({});
  function getPan(pid){return pans[pid]||{x:0,y:0};}
  function setPan(pid,pan){setPans(function(prev){return Object.assign({},prev,{[pid]:pan});});}
  // Hand-drag-to-battlefield ghost
  const [handGhost,setHandGhost]=useState(null);
  const [handDragOver,setHandDragOver]=useState(null);
  const handDragRef=useRef(null);
  // Pass-the-laptop: who is currently "holding" the screen
  const [localPid,setLocalPid]=useState(0);
  // Commander selection state
  const [cmdSelections,setCmdSelections]=useState({}); // { [pid]: [iid,...] }
  const [cmdReady,setCmdReady]=useState({});           // { [pid]: bool }
  // Toast notification
  const [toast,setToast]=useState(null);
  // Scry modal
  const [scry,setScry]=useState(null);
  // Dice/coin modal
  const [diceModal,setDiceModal]=useState(null);

  const matRefs=useRef({});
  const dragRef=useRef(null);
  const outerRefs=useRef({});          // { [pid]: { current: DOMNode } }

  function getZoom(pid){return zooms[pid]!=null?zooms[pid]:uiSettings.defaultZoom;}
  function setZoom(pid,z){setZooms(function(prev){return Object.assign({},prev,{[pid]:Math.max(0.15,Math.min(4.0,z))});});}

  // Cursor-anchored zoom using pure pan math (CSS transform approach)
  function zoomAtCursor(pid,newZoom,mx,my){
    const oldZoom=getZoom(pid);
    const pan=getPan(pid);
    // World point under cursor (before zoom)
    const wx=(mx-pan.x)/oldZoom;
    const wy=(my-pan.y)/oldZoom;
    // New pan to keep that world point under cursor
    const newPanX=mx-wx*newZoom;
    const newPanY=my-wy*newZoom;
    setZoom(pid,newZoom);
    setPan(pid,{x:newPanX,y:newPanY});
  }

  useEffect(function(){
    function h(){setCtx(null);}
    window.addEventListener('mousedown',h);
    return function(){window.removeEventListener('mousedown',h);};
  },[]);

  // ── START ─────────────────────────────────────────────
  async function startGame() {
    const active=setups.slice(0,nPlayers);
    setScreen('loading');

    // Collect names that need Scryfall (not in demo cache)
    const customNames=[];
    active.forEach(function(p){
      if(p.deck.trim()){
        parseDeck(p.deck).forEach(function(e){
          if(!DEMO_CACHE[e.name.toLowerCase()]) customNames.push(e.name);
        });
      }
    });

    if(customNames.length>0){
      setLD({done:0,total:customNames.length,current:'Connecting to Scryfall...'});
      await fetchScryfall(customNames,function(done,total,current){
        setLD({done:done,total:Math.max(total,1),current:current||'Processing...'});
      });
    }

    setLD({done:1,total:1,current:'Building game...'});

    const players=active.map(function(pd,idx){
      const isDemo=!pd.deck.trim();
      const entries=isDemo
        ?DEMO_DATA.map(function(d){return {name:d.name,section:'main'};})
        :parseDeck(pd.deck);

      const commanders=[], library=[];
      let missed=0;

      entries.forEach(function(e){
        const cd=lookupCard(e.name);
        if(!cd){missed++;return;}
        const inst=mkInst(cd);
        if(e.section==='commander') commanders.push(inst);
        else library.push(inst);
      });

      console.log(pd.name+': lib='+library.length+' cmd='+commanders.length+' missed='+missed);

      return {
        pid:idx,name:pd.name,pal:PALETTES[idx%PALETTES.length],
        life:40,poison:0,cmdDmg:{},
        library:shuffle(library),hand:[],battlefield:[],
        graveyard:[],exile:[],command:commanders,
        manaPool:{W:0,U:0,B:0,R:0,G:0,C:0},
        maxZ:10,isDemo:isDemo,missed:missed,
        playmat:pd.playmat||'',
        playmatFit:pd.playmatFit||'cover',
      };
    });

    const tot=players.reduce(function(s,p){return s+p.library.length+p.command.length;},0);
    const mis=players.reduce(function(s,p){return s+p.missed;},0);

    setGame({
      players:players,turn:0,round:1,
      log:[
        '✅ '+tot+' cards ready'+(mis>0?' · '+mis+' not found':'')+' — select commanders to begin!',
      ],
    });
    // Reset commander selection state
    const initSel={};const initReady={};
    players.forEach(function(p){initSel[p.pid]=[];initReady[p.pid]=false;});
    setCmdSelections(initSel);
    setCmdReady(initReady);
    setScreen('commander-select');
  }

  // ── COMMANDER FINALIZE ────────────────────────────────
  function finalizeCommanderSelect(){
    mut(function(g){
      g.players.forEach(function(p){
        const selected=cmdSelections[p.pid]||[];
        // Remove selected cards from current library, add to command zone
        selected.forEach(function(iid){
          // Search all zones (library and existing command)
          ['library'].forEach(function(z){
            const idx=p[z].findIndex(function(c){return c.iid===iid;});
            if(idx!==-1) p.command.push(p[z].splice(idx,1)[0]);
          });
        });
        p.library=shuffle(p.library);
      });
      const firstPid=Math.floor(Math.random()*g.players.length);
      g.turn=firstPid;
      g.log=['⚔ '+g.players[firstPid].name+' goes first (randomly selected)!'];
    });
    setScreen('game');
  }

  // ── MUTATE ────────────────────────────────────────────
  function mut(fn){
    setGame(function(prev){
      const next=Object.assign({},prev,{
        log:prev.log.slice(),
        players:prev.players.map(function(p){
          return Object.assign({},p,{
            library:p.library.slice(),hand:p.hand.slice(),
            battlefield:p.battlefield.slice(),graveyard:p.graveyard.slice(),
            exile:p.exile.slice(),command:p.command.slice(),
            cmdDmg:Object.assign({},p.cmdDmg),
            manaPool:Object.assign({W:0,U:0,B:0,R:0,G:0,C:0},p.manaPool),
          });
        }),
      });
      fn(next);
      return next;
    });
  }

  // ── ZONE MOVE ─────────────────────────────────────────
  function moveCard(fromPid,iid,toZone,toPid,dropX,dropY){
    if(toPid===undefined||toPid===null) toPid=fromPid;
    mut(function(g){
      const fp=g.players[fromPid];
      let card=null,fz=null;
      ['hand','battlefield','graveyard','exile','command','library'].forEach(function(z){
        if(card) return;
        const idx=fp[z].findIndex(function(c){return c.iid===iid;});
        if(idx!==-1){card=Object.assign({},fp[z][idx]);fp[z].splice(idx,1);fz=z;}
      });
      if(!card) return;
      card.iid=crypto.randomUUID();
      card.tapped=false;
      card.summonSick=toZone==='battlefield';
      card.z=++g.players[toPid].maxZ;
      if(toZone==='battlefield'){
        card.x=dropX!=null?dropX:5+Math.random()*55;
        card.y=dropY!=null?dropY:5+Math.random()*55;
      }
      g.players[toPid][toZone]=g.players[toPid][toZone].concat([card]);
      g.log=[(fp.name+': '+(card.faceDown?'Card':card.name)+' → '+toZone)].concat(g.log.slice(0,99));
    });
    if(toZone==='battlefield'){
      let cname='a card';
      ['hand','graveyard','exile','command','library'].forEach(function(z){const f=game.players[fromPid][z].find(function(c){return c.iid===iid;});if(f&&f.name)cname=f.name;});
      setToast('🃏 '+game.players[fromPid].name+' plays '+cname);
    }
    setCtx(null);
  }

  // ── DRAW ──────────────────────────────────────────────
  function drawCards(pid,n){
    n=n||1;
    mut(function(g){
      const p=g.players[pid];
      if(p.library.length===0){g.log=['💀 '+p.name+': library empty!'].concat(g.log.slice(0,99));return;}
      const cnt=Math.min(n,p.library.length);
      const drawn=p.library.splice(0,cnt).map(function(c){return Object.assign({},c,{iid:crypto.randomUUID()});});
      p.hand=p.hand.concat(drawn);
      g.log=[(p.name+' drew '+cnt+' — hand:'+p.hand.length+' lib:'+p.library.length)].concat(g.log.slice(0,99));
    });
    setToast('🂠 '+game.players[pid].name+' draws '+(n===1?'a card':n+' cards'));
  }

  function dealOpening(pid){
    mut(function(g){
      const p=g.players[pid];
      const ret=p.hand.map(function(c){return Object.assign({},c,{iid:crypto.randomUUID()});});
      p.library=shuffle(p.library.concat(ret));
      const cnt=Math.min(7,p.library.length);
      p.hand=p.library.splice(0,cnt).map(function(c){return Object.assign({},c,{iid:crypto.randomUUID()});});
      g.log=['🂠 '+p.name+' drew opening hand ('+cnt+' cards)'].concat(g.log.slice(0,99));
    });
  }

  function untapAll(pid){mut(function(g){g.players[pid].battlefield=g.players[pid].battlefield.map(function(c){return Object.assign({},c,{tapped:false});});g.log=['↩ '+g.players[pid].name+' untapped all'].concat(g.log.slice(0,99));});}
  function shuffleLib(pid){mut(function(g){g.players[pid].library=shuffle(g.players[pid].library);g.log=['🔀 '+g.players[pid].name+' shuffled'].concat(g.log.slice(0,99));});}
  function changeLife(pid,d){
    mut(function(g){g.players[pid].life=Math.max(-99,g.players[pid].life+d);});
    const newLife=Math.max(-99,(game.players[pid].life||40)+d);
    const pname=game.players[pid].name;
    if(newLife<=0) setToast('💀 '+pname+' is at '+newLife+' life!');
    else if(newLife<=10&&(game.players[pid].life||40)>10) setToast('⚠️ '+pname+' is at '+newLife+' life!');
  }

  function tapCard(pid,iid){
    mut(function(g){
      const p=g.players[pid];
      p.battlefield=p.battlefield.map(function(c){
        if(c.iid!==iid) return c;
        const nowTapped=!c.tapped;
        // Auto-add mana when tapping (not untapping), if setting enabled
        if(nowTapped&&uiSettings.autoMana){
          const prod=parseManaProduction(c);
          const total=Object.values(prod).reduce(function(s,v){return s+v;},0);
          if(total>0){
            const pool=Object.assign({W:0,U:0,B:0,R:0,G:0,C:0},p.manaPool);
            Object.entries(prod).forEach(function(e){pool[e[0]]=(pool[e[0]]||0)+e[1];});
            p.manaPool=pool;
            const manaStr=Object.entries(prod).filter(function(e){return e[1]>0;}).map(function(e){return '{'+e[0]+'}×'+e[1];}).join(' ');
            g.log=['💎 '+p.name+': +'+manaStr+' from '+c.name].concat(g.log.slice(0,99));
          }
        }
        return Object.assign({},c,{tapped:nowTapped});
      });
    });
    setCtx(null);
  }

  // ── PASS TURN ─────────────────────────────────────────
  function passTheTurn(){
    const nextPid=(game.turn+1)%game.players.length;
    const nextName=game.players[nextPid].name;
    mut(function(g){
      if(nextPid===0) g.round++;
      g.turn=nextPid;
      const np=g.players[nextPid];
      np.battlefield=np.battlefield.map(function(c){return Object.assign({},c,{tapped:false,summonSick:false});});
      g.log=['🔄 '+np.name+"'s turn — Round "+g.round].concat(g.log.slice(0,99));
    });
    setToast('🔄 '+nextName+"'s turn");
  }

  // ── DRAG ──────────────────────────────────────────────
  function onCardMD(e,pid,iid){
    if(e.button!==0) return;
    e.preventDefault();e.stopPropagation();
    if(!game) return;
    const card=game.players[pid].battlefield.find(function(c){return c.iid===iid;});
    if(!card) return;
    mut(function(g){const mz=++g.players[pid].maxZ;g.players[pid].battlefield=g.players[pid].battlefield.map(function(c){return c.iid===iid?Object.assign({},c,{z:mz}):c;});});
    const sx=e.clientX,sy=e.clientY,scx=card.x,scy=card.y;
    dragRef.current=true;
    function onM(ev){
      if(!dragRef.current) return;
      const rect=matRefs.current[pid]&&matRefs.current[pid].getBoundingClientRect();
      if(!rect) return;
      const nx=Math.max(0,Math.min(90,scx+(ev.clientX-sx)/rect.width*100));
      const ny=Math.max(0,Math.min(88,scy+(ev.clientY-sy)/rect.height*100));
      setGame(function(prev){
        return {
          ...prev,
          players: prev.players.map(function(pl,i){
            if(i!==pid) return pl;
            return {
              ...pl,
              battlefield: pl.battlefield.map(function(c){
                return c.iid!==iid ? c : {...c, x:nx, y:ny};
              })
            };
          })
        };
      });
    }
    function onU(){dragRef.current=null;window.removeEventListener('mousemove',onM);window.removeEventListener('mouseup',onU);}
    window.addEventListener('mousemove',onM);
    window.addEventListener('mouseup',onU);
  }

  // ── CTX ACTION ────────────────────────────────────────
  function doCtx(act){
    if(!ctx) return;
    const pid=ctx.pid,iid=ctx.iid;
    if(act==='tap'){tapCard(pid,iid);return;}
    if(act==='toBF'){moveCard(pid,iid,'battlefield');return;}
    if(act==='toHand'){moveCard(pid,iid,'hand');return;}
    if(act==='toGrave'){moveCard(pid,iid,'graveyard');return;}
    if(act==='toExile'){moveCard(pid,iid,'exile');return;}
    if(act==='toLib'){moveCard(pid,iid,'library');return;}
    if(act==='flip'){mut(function(g){g.players[pid].battlefield=g.players[pid].battlefield.map(function(c){return c.iid===iid?Object.assign({},c,{showBack:!c.showBack}):c;});});setCtx(null);return;}
    if(act==='fd'){mut(function(g){['battlefield','hand'].forEach(function(z){g.players[pid][z]=g.players[pid][z].map(function(c){return c.iid===iid?Object.assign({},c,{faceDown:!c.faceDown}):c;});});});setCtx(null);return;}
    if(act==='ctr'){setCtr({pid:pid,iid:iid});setCtx(null);return;}
    if(act==='dup'){mut(function(g){const c=g.players[pid].battlefield.find(function(c){return c.iid===iid;});if(c)g.players[pid].battlefield=g.players[pid].battlefield.concat([Object.assign({},c,{iid:crypto.randomUUID(),x:c.x+4,y:c.y+4,z:++g.players[pid].maxZ})]);});setCtx(null);return;}
    setCtx(null);
  }

  function addCtr(type,delta){
    if(!ctr) return;
    const pid=ctr.pid,iid=ctr.iid;
    mut(function(g){g.players[pid].battlefield=g.players[pid].battlefield.map(function(c){if(c.iid!==iid)return c;const nc=Object.assign({},c.counters);const nv=Math.max(0,(nc[type]||0)+delta);if(nv===0)delete nc[type];else nc[type]=nv;return Object.assign({},c,{counters:nc});});});
  }

  function addCmdDmg(toPid,fromPid,delta){
    mut(function(g){const cur=(g.players[toPid].cmdDmg[fromPid]||0);const nv=Math.max(0,cur+delta);g.players[toPid].cmdDmg[fromPid]=nv;g.players[toPid].life=Math.max(-99,g.players[toPid].life-delta);if(delta!==0)g.log=['⚔ '+g.players[fromPid].name+' → '+g.players[toPid].name+': '+nv+' cmd dmg'].concat(g.log.slice(0,99));});
  }

  // ── MANA ──────────────────────────────────────────────
  function spendMana(pid,color){
    mut(function(g){
      const pool=Object.assign({W:0,U:0,B:0,R:0,G:0,C:0},g.players[pid].manaPool);
      if((pool[color]||0)>0){pool[color]--;g.players[pid].manaPool=pool;}
    });
  }
  function clearMana(pid){
    mut(function(g){g.players[pid].manaPool={W:0,U:0,B:0,R:0,G:0,C:0};});
  }

  // ── ZONE OPEN (library shows toast) ───────────────────
  function openZone(pid,zone){
    if(zone==='library'&&game){
      const pname=game.players[pid].name;
      mut(function(g){g.log=['👁 '+pname+' opened their library — visible to all!'].concat(g.log.slice(0,99));});
      setToast('👁 '+pname+' is searching their library');
    }
    setZV({pid:pid,zone:zone});
  }

  // ── SCRY ──────────────────────────────────────────────
  function openScry(pid,n){
    if(!game||game.players[pid].library.length===0) return;
    const cnt=Math.min(n,game.players[pid].library.length);
    mut(function(g){g.log=['🔮 '+g.players[pid].name+' is scryin\' '+cnt+'…'].concat(g.log.slice(0,99));});
    setZV(null);
    setScry({pid:pid,n:cnt});
  }
  function confirmScry(pid,topCards,bottomCards){
    const n=scry?scry.n:0;
    mut(function(g){
      const p=g.players[pid];
      p.library=topCards.concat(p.library.slice(n)).concat(bottomCards);
      g.log=['🔮 '+p.name+' scryed '+n+' ('+topCards.length+' top, '+bottomCards.length+' bottom)'].concat(g.log.slice(0,99));
    });
    setScry(null);
  }

  // ── MILL ──────────────────────────────────────────────
  function millCards(pid,n){
    mut(function(g){
      const p=g.players[pid];
      const milled=p.library.splice(0,Math.min(n,p.library.length));
      p.graveyard=p.graveyard.concat(milled);
      g.log=['💀 '+p.name+' milled '+milled.length+' card'+(milled.length!==1?'s':'')].concat(g.log.slice(0,99));
    });
  }

  // ── DICE / COIN ───────────────────────────────────────
  function rollDice(sides){
    const result=Math.floor(Math.random()*sides)+1;
    mut(function(g){g.log=['🎲 d'+sides+' → '+result+(result===sides?' 🎉 MAX!':result===1?' 💀 NAT 1':'')].concat(g.log.slice(0,99));});
    return result;
  }
  function flipCoin(){
    const result=Math.random()<0.5?'Heads':'Tails';
    mut(function(g){g.log=['🪙 Coin flip → '+result].concat(g.log.slice(0,99));});
    return result;
  }

  // ── HAND DRAG TO BATTLEFIELD ──────────────────────────
  function onHandCardMD(e,pid,iid){
    if(e.button!==0) return;
    e.preventDefault();e.stopPropagation();
    if(!game) return;
    const card=game.players[pid].hand.find(function(c){return c.iid===iid;});
    if(!card) return;
    handDragRef.current={pid,iid};
    setHandGhost({card,x:e.clientX,y:e.clientY});

    function findBFPid(el){
      let t=el;
      while(t){
        if(t.dataset&&t.dataset.bfpid!=null) return parseInt(t.dataset.bfpid);
        t=t.parentElement;
      }
      return null;
    }

    function onM(ev){
      setHandGhost(function(prev){return prev?{card:prev.card,x:ev.clientX,y:ev.clientY}:null;});
      const el=document.elementFromPoint(ev.clientX,ev.clientY);
      setHandDragOver(el?findBFPid(el):null);
    }
    function onU(ev){
      window.removeEventListener('mousemove',onM);
      window.removeEventListener('mouseup',onU);
      const hd=handDragRef.current;
      if(hd){
        const el=document.elementFromPoint(ev.clientX,ev.clientY);
        const dropPid=el?findBFPid(el):null;
        if(dropPid!==null){
          // Calculate drop position relative to the inner bf canvas
          const bfEl=document.querySelector('[data-bfpid="'+dropPid+'"]');
          let dropX=10+Math.random()*40,dropY=10+Math.random()*40;
          if(bfEl){
            const rect=bfEl.getBoundingClientRect();
            dropX=Math.max(2,Math.min(90,(ev.clientX-rect.left)/rect.width*100));
            dropY=Math.max(2,Math.min(88,(ev.clientY-rect.top)/rect.height*100));
          }
          moveCard(hd.pid,hd.iid,'battlefield',dropPid,dropX,dropY);
        }
      }
      handDragRef.current=null;
      setHandGhost(null);
      setHandDragOver(null);
    }
    window.addEventListener('mousemove',onM);
    window.addEventListener('mouseup',onU);
  }

  function findCard(pid,iid){
    if(!game) return null;
    const zones=['hand','battlefield','graveyard','exile','command','library'];
    for(let i=0;i<zones.length;i++){const c=game.players[pid][zones[i]].find(function(c){return c.iid===iid;});if(c)return c;}
    return null;
  }

  // ── RENDER ────────────────────────────────────────────
  if(screen==='setup') return <SetupScreen nPlayers={nPlayers} setNP={setNP} setups={setups} setSU={setSU} onStart={startGame}/>;
  if(screen==='loading') return <LoadingScreen done={ld.done} total={ld.total} current={ld.current}/>;
  if(screen==='commander-select'&&game) return <CommanderSelectScreen game={game} cmdSelections={cmdSelections} setCmdSelections={setCmdSelections} cmdReady={cmdReady} setCmdReady={setCmdReady} onBegin={finalizeCommanderSelect}/>;
  if(!game) return null;

  const {players,turn,round}=game;
  const ctxCard=ctx?findCard(ctx.pid,ctx.iid):null;
  const ctrCard=ctr?players[ctr.pid].battlefield.find(function(c){return c.iid===ctr.iid;}):null;

  function makePlayerMatProps(p,isMain){
    return {
      key:p.pid,player:p,isActive:turn===p.pid,isMain:isMain,isLocal:localPid===p.pid,
      zoom:getZoom(p.pid),
      pan:getPan(p.pid),
      onPan:function(newPan){setPan(p.pid,newPan);},
      onResetView:function(){setZoom(p.pid,uiSettings.defaultZoom);setPan(p.pid,{x:0,y:0});},
      cardScale:uiSettings.cardScale,
      onDraw:function(){drawCards(p.pid);},
      onDeal7:function(){dealOpening(p.pid);},
      onUntap:function(){untapAll(p.pid);},
      onShuffle:function(){shuffleLib(p.pid);},
      onLife:function(d){changeLife(p.pid,d);},
      onCardMD:function(e,iid){onCardMD(e,p.pid,iid);},
      onCardRC:function(e,iid,zone){e.preventDefault();e.stopPropagation();setCtx({x:e.clientX,y:e.clientY,pid:p.pid,iid:iid,zone:zone});},
      onHover:function(c){setHover(c);},onHL:function(){setHover(null);},
      onZone:function(zone){openZone(p.pid,zone);},
      onHandCardMD:function(e,iid){onHandCardMD(e,p.pid,iid);},
      isHandDragOver:handDragOver===p.pid,
      matRef:function(el){matRefs.current[p.pid]=el;},
      onScry:function(n){openScry(p.pid,n);},
      onMill:function(n){millCards(p.pid,n);},
      outerScrollRef:(function(){if(!outerRefs.current[p.pid])outerRefs.current[p.pid]={current:null};return outerRefs.current[p.pid];}()),
      onZoomWithScroll:function(newZoom,mx,my){zoomAtCursor(p.pid,newZoom,mx,my);},
    };
  }

  return (
    <div onMouseDown={function(){setCtx(null);}} style={{height:(100/(uiSettings.uiScale||1))+'vh',width:(100/(uiSettings.uiScale||1))+'%',overflow:'hidden',background:'#0a0b0e',display:'flex',flexDirection:'column',userSelect:'none',transform:'scale('+(uiSettings.uiScale||1)+')',transformOrigin:'top left'}}>
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
      <TurnBar players={players} turn={turn} round={round} onPassTurn={passTheTurn} logOpen={logOpen}
        onLog={function(){setLog(function(o){return !o;});}}
        onSettings={function(){setSettingsOpen(true);}}/>

      {/* Main content row: player mats + docked log */}
      <div style={{flex:1,display:'flex',flexDirection:'row',overflow:'hidden',minHeight:0}}>
        {/* Player mats column */}
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:4,padding:4,overflow:'hidden',minHeight:0}}>
          {players.length>1&&(
            <div style={{display:'flex',gap:4,flex:players.length===2?1:0.65,minHeight:0}}>
              {players.slice(1).map(function(p){return <PlayerMat {...makePlayerMatProps(p,false)}/>;  })}
            </div>
          )}
          <div style={{display:'flex',flex:1,minHeight:0}}>
            <PlayerMat {...makePlayerMatProps(players[0],true)}/>
          </div>
        </div>
        {/* Docked game log sidebar */}
        <GameLog entries={game.log} open={logOpen} onToggle={function(){setLog(function(o){return !o;});}}/>
      </div>

      {ctx&&<div onMouseDown={function(e){e.stopPropagation();}}><CtxMenu x={ctx.x} y={ctx.y} card={ctxCard} zone={ctx.zone} pal={players[ctx.pid].pal} onAct={doCtx}/></div>}
      {hover&&uiSettings.showZoomPanel&&<CardZoom card={hover}/>}
      {zv&&<ZoneViewer player={players[zv.pid]} zone={zv.zone} onClose={function(){setZV(null);}} onMove={function(iid,z){moveCard(zv.pid,iid,z);}} onHover={function(c){setHover(c);}} onHL={function(){setHover(null);}} onRC={function(e,c){e.preventDefault();e.stopPropagation();setCtx({x:e.clientX,y:e.clientY,pid:zv.pid,iid:c.iid,zone:zv.zone});}} onScry={function(n){openScry(zv.pid,n);}} onMill={function(n){millCards(zv.pid,n);setZV(null);}}/>}
      {ctr&&ctrCard&&<CounterModal card={ctrCard} pal={players[ctr.pid].pal} onAdd={addCtr} onClose={function(){setCtr(null);}}/>}
      {dmg!==null&&<CmdDmgModal player={players[dmg]} allPlayers={players} onDmg={function(fp,d){addCmdDmg(dmg,fp,d);}} onClose={function(){setDmg(null);}}/>}
      {settingsOpen&&<UISettingsModal settings={uiSettings} onChange={setUISettings} players={players} onPlaymat={function(pid,field,val){mut(function(g){if(field==='url')g.players[pid].playmat=val;else if(field==='fit')g.players[pid].playmatFit=val;});}} onClose={function(){setSettingsOpen(false);}}/>}
      {toast&&<Toast msg={toast} onDone={function(){setToast(null);}}/>}
      {scry&&<ScryModal pid={scry.pid} n={scry.n} cards={game.players[scry.pid].library.slice(0,scry.n)} pal={game.players[scry.pid].pal} onConfirm={function(top,bot){confirmScry(scry.pid,top,bot);}} onClose={function(){setScry(null);}}/>}
      {diceModal&&<DiceModal mode={diceModal} onRoll={rollDice} onFlip={flipCoin} onLog={function(msg){mut(function(g){g.log=[msg].concat(g.log.slice(0,99));});}} onClose={function(){setDiceModal(null);}}/>}

      {/* Hand-drag ghost card follows the cursor */}
      {handGhost&&(
        <div style={{position:'fixed',left:handGhost.x-28,top:handGhost.y-39,width:56,height:78,borderRadius:4,zIndex:10000,pointerEvents:'none',opacity:0.88,transform:'rotate(-4deg) scale(1.05)',boxShadow:'0 8px 28px rgba(0,0,0,0.85)',border:'2px solid #c8960a'}}>
          <CardImg src={handGhost.card.img} alt={handGhost.card.name}
            style={{width:'100%',height:'100%',borderRadius:3,objectFit:'cover',display:'block'}}
            fallStyle={{width:'100%',height:'100%',borderRadius:3,background:'#252830',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'#e2e8f0',textAlign:'center',padding:3}}/>
        </div>
      )}

      <div style={{display:'flex',gap:4,padding:'4px 10px',background:'rgba(10,11,14,0.85)',borderTop:'1px solid #1e2230',flexWrap:'wrap',alignItems:'center'}}>
        {/* Commander damage buttons */}
        {players.map(function(p){return <button key={p.pid} onClick={function(){setDmg(p.pid);}} style={{background:p.pal.acc+'15',border:'1px solid '+p.pal.border,borderRadius:4,color:p.pal.acc,fontSize:10,padding:'3px 8px',cursor:'pointer',fontWeight:600}}>⚔ {p.name.slice(0,10)} cmd</button>;})}
        <div style={{width:1,height:18,background:'#2e3240',margin:'0 2px',flexShrink:0}}/>
        {/* Pass control buttons */}
        <span style={{fontSize:10,color:'#565c70',fontWeight:600}}>🎮</span>
        {players.map(function(p){return (
          <button key={'pass'+p.pid} onClick={function(){setLocalPid(p.pid);setToast('🎮 '+p.name+' now has control');}} style={{background:localPid===p.pid?p.pal.acc+'30':'transparent',border:'1px solid '+(localPid===p.pid?p.pal.acc:p.pal.border+'55'),borderRadius:4,color:localPid===p.pid?p.pal.acc:'#565c70',fontSize:10,padding:'3px 7px',cursor:'pointer',fontWeight:localPid===p.pid?700:400}}>{p.name.slice(0,8)}</button>
        );})}
        <div style={{width:1,height:18,background:'#2e3240',margin:'0 2px',flexShrink:0}}/>
        <button onClick={function(){setDiceModal('dice');}} title="Roll Dice" style={{background:'#8b7ab822',border:'1px solid #8b7ab855',borderRadius:4,color:'#8b7ab8',fontSize:12,fontWeight:700,padding:'3px 10px',cursor:'pointer'}}>🎲 Dice</button>
        <button onClick={function(){setDiceModal('coin');}} title="Flip Coin" style={{background:'#c8960a22',border:'1px solid #c8960a55',borderRadius:4,color:'#c8960a',fontSize:12,fontWeight:700,padding:'3px 10px',cursor:'pointer'}}>🪙 Coin</button>
        <button onClick={function(){setScreen('setup');}} style={{background:'transparent',border:'1px solid #2e3240',borderRadius:4,color:'#3d4358',fontSize:10,padding:'3px 8px',cursor:'pointer',marginLeft:'auto'}}>↩ New Game</button>
      </div>
    </div>
  );
}
