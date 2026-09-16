// ============================================================
// TENFOLD LEGENDS — game.js
// Shared hero data, sprite paths, API helpers, game state
// ============================================================

// ── SAFE STORAGE WRAPPERS ─────────────────────────────────────
// MIT App Inventor WebViewer (and some Android WebViews) throw a
// SecurityError when code touches localStorage / sessionStorage.
// These wrappers silently fall back to an in-memory Map so the
// game never crashes with "storage is unavailable".
(function() {
  // Persistent fallback for MIT App Inventor WebViewer.
  // Uses window.name only when browser storage is unavailable.
  const FALLBACK_PREFIX = 'TENFOLD_PERSIST:';
  let fallbackData = {};

  function loadFallback() {
    try {
      const raw = String(window.name || '');
      if (raw.startsWith(FALLBACK_PREFIX)) {
        const parsed = JSON.parse(decodeURIComponent(raw.slice(FALLBACK_PREFIX.length)));
        if (parsed && typeof parsed === 'object') fallbackData = parsed;
      }
    } catch (_) {}
  }
  function saveFallback() {
    try {
      window.name = FALLBACK_PREFIX + encodeURIComponent(JSON.stringify(fallbackData));
    } catch (_) {}
  }
  loadFallback();

  function makeFallbackStore(bucket) {
    if (!fallbackData[bucket] || typeof fallbackData[bucket] !== 'object') fallbackData[bucket] = {};
    const data = fallbackData[bucket];
    return {
      getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
      setItem(k, v) { data[k] = String(v); saveFallback(); },
      removeItem(k) { delete data[k]; saveFallback(); },
      clear() { Object.keys(data).forEach(k => delete data[k]); saveFallback(); }
    };
  }

  function getNative(name) {
    try { return window[name]; } catch (_) { return null; }
  }
  function storageOk(store) {
    try {
      const TEST = '__tfl_test__';
      store.setItem(TEST, '1');
      store.removeItem(TEST);
      return true;
    } catch (_) { return false; }
  }

  const nativeLocal = getNative('localStorage');
  const nativeSession = getNative('sessionStorage');
  window.safeLocalStorage = nativeLocal && storageOk(nativeLocal)
    ? nativeLocal : makeFallbackStore('local');
  window.safeSessionStorage = nativeSession && storageOk(nativeSession)
    ? nativeSession : makeFallbackStore('session');
})();

// ── APPS SCRIPT WEB APP URL ───────────────────────────────────
// After deploying Code.gs as a Web App, paste the URL here:
const API_URL = 'https://script.google.com/macros/s/AKfycbzsePzbkciToeJwjmIFOJH8glRUQnlc4p6Z5hQnouApgnDSO21ge5KCrpxp_q_TZKrP/exec';

// ── HERO DATABASE ─────────────────────────────────────────────
const HEROES = {
  aeron: {
    id: 'aeron',
    facesRight: true,   // sprite default faces RIGHT
    name: 'Aeron',
    title: 'Flameborn',
    quote: '"Flames do not just burn, they forge legends."',
    element: 'Fire',
    weapon: 'Greatsword',
    fightingStyle: 'Aggressive / Heavy Damage',
    role: 'Damage Dealer',
    color: '#ff4500',
    glowColor: 'rgba(255,69,0,0.6)',
    bgColor: '#1a0800',
    // Base stats (Lv 1)
    stats: { hp: 1000, atk: 120, def: 80, spd: 90, crit: 15 },
    // Sprite paths
    sprites: {
      idle:    'Sprite/Aeron/idle.webp',
      walk:    'Sprite/Aeron/walk.webp',
      run:     'Sprite/Aeron/run.webp',
      sprint:  'Sprite/Aeron/sprint.webp',
      attack:  'Sprite/Aeron/attack.webp',
      portrait:'Sprite/Aeron/aeron_hero_profile_portrait.webp',
      lifeBar: 'Sprite/Aeron/aeron_life_bar_ui.webp',
      manaBar: 'Sprite/Aeron/ManaEnergy Bar.webp',
      namePlate:'Sprite/Aeron/Level Badge  Nameplate.webp',
      backgrounds: [
        'Sprite/Aeron/1background.webp',
        'Sprite/Aeron/2background.webp',
        'Sprite/Aeron/3background.webp',
        'Sprite/Aeron/4background.webp'
      ]
    },
    skills: {
      basic: {
        name: 'Flame Slash',
        type: 'Basic Skill',
        desc: 'Fast sword slash that deals fire damage.',
        icon: 'Sprite/Aeron/FlameSlash_basic_skill_icon.webp',
        manaCost: 15,
        damage: 80,
        cooldown: 3,
        frames: [
          'Sprite/Aeron/flame_slash_frame_1_transparent.webp',
          'Sprite/Aeron/flame_slash_frame_2_transparent.webp',
          'Sprite/Aeron/flame_slash_frame_3_transparent.webp',
          'Sprite/Aeron/flame_slash_frame_4_transparent.webp',
          'Sprite/Aeron/flame_slash_frame_5_transparent.webp',
          'Sprite/Aeron/flame_slash_frame_6_transparent.webp'
        ]
      },
      special: {
        name: 'Inferno Burst',
        type: 'Special Skill',
        desc: 'Releases a wave of fire toward the enemy.',
        icon: 'Sprite/Aeron/infernoBurst_special_skill_icon.webp',
        manaCost: 30,
        damage: 160,
        cooldown: 3,
        frames: [
          'Sprite/Aeron/inferno_burst_frame_1_transparent.webp',
          'Sprite/Aeron/inferno_burst_frame_2_transparent.webp',
          'Sprite/Aeron/inferno_burst_frame_3_transparent.webp',
          'Sprite/Aeron/inferno_burst_frame_4_transparent.webp',
          'Sprite/Aeron/inferno_burst_frame_5_transparent.webp',
          'Sprite/Aeron/inferno_burst_frame_6_transparent.webp'
        ]
      },
      ultimate: {
        name: 'Phoenix Reign',
        type: 'Ultimate Skill',
        desc: 'Surrounds himself with flames and performs a powerful burning attack.',
        icon: 'Sprite/Aeron/PhoenixReign_ultimate_skill_icon.webp',
        manaCost: 80,
        damage: 300,
        cooldown: 6,
        frames: [
          'Sprite/Aeron/Phoenix_Reign_frame_1_transparent.webp',
          'Sprite/Aeron/Phoenix_Reign_frame_2_transparent.webp',
          'Sprite/Aeron/Phoenix_Reign_frame_3_transparent.webp',
          'Sprite/Aeron/Phoenix_Reign_frame_4_transparent.webp',
          'Sprite/Aeron/Phoenix_Reign_frame_5_transparent.webp',
          'Sprite/Aeron/Phoenix_Reign_frame_6_transparent.webp'
        ]
      }
    }
  },

  lyra: {
    id: 'lyra',
    facesRight: false,  // sprite default faces LEFT
    name: 'Lyra',
    title: 'Frostblade',
    quote: '"The cold is not my weakness, it is my strength."',
    element: 'Ice',
    weapon: 'Dual Blades',
    fightingStyle: 'Fast & Agile',
    role: 'Damage Dealer',
    color: '#00cfff',
    glowColor: 'rgba(0,207,255,0.6)',
    bgColor: '#00101a',
    stats: { hp: 1000, atk: 120, def: 89, spd: 100, crit: 15 },
    sprites: {
      idle:    'Sprite/Lyra/Idle.webp',
      walk:    'Sprite/Lyra/walk.webp',
      run:     'Sprite/Lyra/Run.webp',
      sprint:  'Sprite/Lyra/Run.webp',
      attack:  'Sprite/Lyra/attack.webp',
      portrait:'Sprite/Lyra/Lyra_Frostblade_Profile.webp',
      lifeBar: 'Sprite/Lyra/Lyra_life_bar_ui.webp',
      manaBar: 'Sprite/Lyra/ManaEnergy Bar.webp',
      namePlate:'Sprite/Lyra/Level Badge  Nameplate.webp',
      backgrounds: [
        'Sprite/Lyra/background1.webp',
        'Sprite/Lyra/background2.webp',
        'Sprite/Lyra/background3.webp'
      ]
    },
    skills: {
      basic: {
        name: 'Frost Cut',
        type: 'Basic Skill',
        desc: 'Two quick ice-infused strikes.',
        icon: 'Sprite/Lyra/Frost_Cut_Skill_Icon.webp',
        manaCost: 15,
        damage: 80,
        cooldown: 3,
        frames: [
          'Sprite/Lyra/frost_cut_frame_1_transparent.webp',
          'Sprite/Lyra/frost_cut_frame_2_transparent.webp',
          'Sprite/Lyra/frost_cut_frame_3_transparent.webp',
          'Sprite/Lyra/frost_cut_frame_4_transparent.webp',
          'Sprite/Lyra/frost_cut_frame_5_transparent.webp',
          'Sprite/Lyra/frost_cut_frame_6_transparent.webp'
        ]
      },
      special: {
        name: 'Frozen Prison',
        type: 'Special Skill',
        desc: 'Freezes the enemy temporarily.',
        icon: 'Sprite/Lyra/Frozen_Prison_Skill_Icon.webp',
        manaCost: 30,
        damage: 120,
        cooldown: 3,
        frames: [
          'Sprite/Lyra/frozen_prison_frame_1_transparent.webp',
          'Sprite/Lyra/frozen_prison_frame_2_transparent.webp',
          'Sprite/Lyra/frozen_prison_frame_3_transparent.webp',
          'Sprite/Lyra/frozen_prison_frame_4_transparent.webp',
          'Sprite/Lyra/frozen_prison_frame_5_transparent.webp',
          'Sprite/Lyra/frozen_prison_frame_6_transparent.webp'
        ]
      },
      ultimate: {
        name: 'Absolute Zero',
        type: 'Ultimate Skill',
        desc: 'Creates a massive ice explosion that heavily damages the enemy.',
        icon: 'Sprite/Lyra/Absolute_Zero.webp',
        manaCost: 80,
        damage: 300,
        cooldown: 6,
        frames: [
          'Sprite/Lyra/absolute_zero_frame_1_transparent.webp',
          'Sprite/Lyra/absolute_zero_frame_2_transparent.webp',
          'Sprite/Lyra/absolute_zero_frame_3_transparent.webp',
          'Sprite/Lyra/absolute_zero_frame_4_transparent.webp',
          'Sprite/Lyra/absolute_zero_frame_5_transparent.webp',
          'Sprite/Lyra/absolute_zero_frame_6_transparent.webp'
        ]
      }
    }
  },

  // ── Heroes 3-10: no sprites yet, placeholder data ─────────
  kael: {
    id: 'kael', facesRight: true, name: 'Kael', title: 'Storm Hunter',
    quote: '"Lightning is not just a force... it\'s my weapon, my will, and my path."',
    element: 'Lightning', weapon: 'Spear', fightingStyle: 'Speed & Precision', role: 'Damage Dealer',
    color: '#ffe600', glowColor: 'rgba(255,230,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 950, atk: 130, def: 70, spd: 120, crit: 20 },
    sprites: {
      idle:     'Sprite/Kael/idle.webp',
      walk:     'Sprite/Kael/walk.webp',
      run:      'Sprite/Kael/run.webp',
      sprint:   'Sprite/Kael/Sprint.webp',
      attack:   'Sprite/Kael/attack.webp',
      portrait: 'Sprite/Kael/Kael_Portfait_Profile.webp',
      lifeBar:  'Sprite/Kael/kael_life_bar_ui.webp',
      manaBar:  'Sprite/Kael/ManaEnergy Bar.webp',
      namePlate:'Sprite/Kael/Level Badge Nameplate.webp',
      backgrounds: [
        'Sprite/Kael/background1.webp',
        'Sprite/Kael/background2.webp'
      ]
    },
    skills: {
      basic: {
        name:'Thunder Thrust', type:'Basic Skill', desc:'Lightning-powered spear attack.',
        icon:'Sprite/Kael/Thunder_Thrust_Skill_Icon.webp',
        manaCost:15, damage:90, cooldown:3,
        frames:[
          'Sprite/Kael/kael_thunder_thrust_effect_frame_1.webp',
          'Sprite/Kael/kael_thunder_thrust_effect_frame_2.webp',
          'Sprite/Kael/kael_thunder_thrust_effect_frame_3.webp',
          'Sprite/Kael/kael_thunder_thrust_effect_frame_4.webp',
          'Sprite/Kael/kael_thunder_thrust_effect_frame_5.webp',
          'Sprite/Kael/kael_thunder_thrust_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Lightning Rush', type:'Special Skill', desc:'Dashes through the enemy with multiple strikes.',
        icon:'Sprite/Kael/Lighting_Rush_Skill_Icon.webp',
        manaCost:30, damage:180, cooldown:3,
        frames:[
          'Sprite/Kael/lightning_rush_effect_only_frame_1.webp',
          'Sprite/Kael/lightning_rush_effect_only_frame_2.webp',
          'Sprite/Kael/lightning_rush_effect_only_frame_3.webp',
          'Sprite/Kael/lightning_rush_effect_only_frame_4.webp',
          'Sprite/Kael/lightning_rush_effect_only_frame_5.webp',
          'Sprite/Kael/lightning_rush_effect_only_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Storm Judgment', type:'Ultimate Skill', desc:'Summons several lightning strikes from the sky.',
        icon:'Sprite/Kael/Storm_Judgment_Skill_Icon.webp',
        manaCost:80, damage:320, cooldown:6,
        frames:[
          'Sprite/Kael/storm_judgment_transparent_frame_1.webp',
          'Sprite/Kael/storm_judgment_transparent_frame_2.webp',
          'Sprite/Kael/storm_judgment_transparent_frame_3.webp',
          'Sprite/Kael/storm_judgment_transparent_frame_4.webp',
          'Sprite/Kael/storm_judgment_transparent_frame_5.webp',
          'Sprite/Kael/storm_judgment_transparent_frame_6.webp'
        ]
      }
    }
  },
  riven: {
    id: 'riven', facesRight: false, name: 'Riven', title: 'Earthbreaker',
    quote: '"The earth does not yield to the weak."',
    element: 'Earth', weapon: 'War Hammer', fightingStyle: 'Slow & Heavy', role: 'Damage Dealer',
    color: '#a0522d', glowColor: 'rgba(160,82,45,0.6)', bgColor: '#0d0800',
    stats: { hp: 1200, atk: 110, def: 100, spd: 60, crit: 10 },
    sprites: {
      idle:     'Sprite/Riven/idle.webp',
      walk:     'Sprite/Riven/walk.webp',
      run:      'Sprite/Riven/run.webp',
      sprint:   'Sprite/Riven/sprint.webp',
      attack:   'Sprite/Riven/attack.webp',
      portrait: 'Sprite/Riven/Riven_Portfait_Profile.webp',
      lifeBar:  'Sprite/Riven/Riven_life_bar_ui.webp',
      manaBar:  'Sprite/Riven/ManaEnergy Bar.webp',
      namePlate:'Sprite/Riven/Level Badge Template.webp',
      backgrounds: [
        'Sprite/Riven/background1.webp',
        'Sprite/Riven/background2.webp'
      ]
    },
    skills: {
      basic: {
        name:'Stone Smash', type:'Basic Skill', desc:'Heavy hammer attack.',
        icon:'Sprite/Riven/Stone_Smash_Basic_Skill_Icon.webp',
        manaCost:15, damage:100, cooldown:3,
        frames:[
          'Sprite/Riven/Riven_Stone_Smash_effect_frame_1.webp',
          'Sprite/Riven/Riven_Stone_Smash_effect_frame_2.webp',
          'Sprite/Riven/Riven_Stone_Smash_effect_frame_3.webp',
          'Sprite/Riven/Riven_Stone_Smash_effect_frame_5.webp',
          'Sprite/Riven/Riven_Stone_Smash_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Earth Wall', type:'Special Skill', desc:'Creates a barrier that reduces incoming damage.',
        icon:'Sprite/Riven/Earth_Wall_Special_Skill_Icon.webp',
        manaCost:30, damage:0, cooldown:3,
        frames:[
          'Sprite/Riven/Riven_Earth_Wall_effect_frame_1.webp',
          'Sprite/Riven/Riven_Earth_Wall_effect_frame_2.webp',
          'Sprite/Riven/Riven_Earth_Wall_effect_frame_3.webp',
          'Sprite/Riven/Riven_Earth_Wall_effect_frame_4.webp',
          'Sprite/Riven/Riven_Earth_Wall_effect_frame_5.webp',
          'Sprite/Riven/Riven_Earth_Wall_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Mountain Collapse', type:'Ultimate Skill', desc:'Smashes the ground, creating a massive shockwave.',
        icon:'Sprite/Riven/Mountain_Collapse_Ultimate_Skill_Icon.webp',
        manaCost:80, damage:350, cooldown:6,
        frames:[
          'Sprite/Riven/Riven_Mountain_Collapse_effect_frame_1.webp',
          'Sprite/Riven/Riven_Mountain_Collapse_effect_frame_2.webp',
          'Sprite/Riven/Riven_Mountain_Collapse_effect_frame_3.webp',
          'Sprite/Riven/Riven_Mountain_Collapse_effect_frame_4.webp',
          'Sprite/Riven/Riven_Mountain_Collapse_effect_frame_5.webp',
          'Sprite/Riven/Riven_Mountain_Collapse_effect_frame_6.webp'
        ]
      }
    }
  },
  selene: {
    id: 'selene', facesRight: true, name: 'Selene', title: 'Moon Archer',
    quote: '"The moon guides my arrow, and the stars light my path."',
    element: 'Light', weapon: 'Bow', fightingStyle: 'Ranged & Precise', role: 'Damage Dealer',
    color: '#c8a8ff', glowColor: 'rgba(200,168,255,0.6)', bgColor: '#0a0014',
    stats: { hp: 900, atk: 140, def: 60, spd: 110, crit: 25 },
    sprites: {
      idle:     'Sprite/Selene/idle.webp',
      walk:     'Sprite/Selene/walk.webp',
      run:      'Sprite/Selene/run.webp',
      sprint:   'Sprite/Selene/sprint.webp',
      attack:   'Sprite/Selene/attack.webp',
      portrait: 'Sprite/Selene/Selene_Portfait_Profile.webp',
      lifeBar:  'Sprite/Selene/selene_life_bar_ui.webp',
      manaBar:  'Sprite/Selene/ManaEnergy Bar.webp',
      namePlate:'Sprite/Selene/Level Badge  Nameplate.webp',
      backgrounds: [
        'Sprite/Selene/background1.webp',
        'Sprite/Selene/background2.webp',
        'Sprite/Selene/background3.webp'
      ]
    },
    skills: {
      basic: {
        name:'Lunar Arrow', type:'Basic Skill', desc:'Shoots a fast energy arrow.',
        icon:'Sprite/Selene/Lunar__Arrow_Basic_Skill_Icon.webp',
        manaCost:15, damage:95, cooldown:3,
        frames:[
          'Sprite/Selene/Selene_Lunar_Arrow_effect_frame_1.webp',
          'Sprite/Selene/Selene_Lunar_Arrow_effect_frame_2.webp',
          'Sprite/Selene/Selene_Lunar_Arrow_effect_frame_3.webp',
          'Sprite/Selene/Selene_Lunar_Arrow_effect_frame_4.webp',
          'Sprite/Selene/Selene_Lunar_Arrow_effect_frame_5.webp',
          'Sprite/Selene/Selene_Lunar_Arrow_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Moon Rain', type:'Special Skill', desc:'Fires multiple arrows from above.',
        icon:'Sprite/Selene/Moon_Rain_Special_Skill_Icon.webp',
        manaCost:30, damage:190, cooldown:3,
        frames:[
          'Sprite/Selene/Selene_Moon_Rain_effect_frame_1.webp',
          'Sprite/Selene/Selene_Moon_Rain_effect_frame_2.webp',
          'Sprite/Selene/Selene_Moon_Rain_effect_frame_3.webp',
          'Sprite/Selene/Selene_Moon_Rain_effect_frame_4.webp',
          'Sprite/Selene/Selene_Moon_Rain_effect_frame_5.webp',
          'Sprite/Selene/Selene_Moon_Rain_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Moonfall', type:'Ultimate Skill', desc:'Launches a giant light arrow that deals massive damage.',
        icon:'Sprite/Selene/Moon_Fall_Ultimate_Skill_Icon.webp',
        manaCost:80, damage:330, cooldown:6,
        frames:[
          'Sprite/Selene/Selene_Moon_Fall_effect_frame_1.webp',
          'Sprite/Selene/Selena_Moon_Fall_effect_frame_2.webp',
          'Sprite/Selene/Selena_Moon_Fall_effect_frame_3.webp',
          'Sprite/Selene/Selena_Moon_Fall_effect_frame_4.webp',
          'Sprite/Selene/Selena_Moon_Fall_effect_frame_5.webp',
          'Sprite/Selene/Selena_Moon_Fall_effect_frame_6.webp'
        ]
      }
    }
  },
  draven: {
    id: 'draven', facesRight: false, name: 'Draven', title: 'Shadow Fang',
    quote: '"The shadows are my home, and the night is my weapon."',
    element: 'Dark', weapon: 'Twin Daggers', fightingStyle: 'Stealth / Agile', role: 'Assassin',
    color: '#9932cc', glowColor: 'rgba(153,50,204,0.6)', bgColor: '#0a0010',
    stats: { hp: 850, atk: 160, def: 70, spd: 130, crit: 28 },
    sprites: {
      idle:     'Sprite/Draven/idle.webp',
      walk:     'Sprite/Draven/walk.webp',
      run:      'Sprite/Draven/run.webp',
      sprint:   'Sprite/Draven/sprint.webp',
      attack:   'Sprite/Draven/attack.webp',
      portrait: 'Sprite/Draven/Draven_Portfait_Profile.webp',
      lifeBar:  'Sprite/Draven/Draven_life_bar_ui.webp',
      manaBar:  'Sprite/Draven/ManaEnergy Bar.webp',
      namePlate:'Sprite/Draven/Level Badge Template.webp',
      backgrounds: [
        'Sprite/Draven/background1.webp',
        'Sprite/Draven/background2.webp',
        'Sprite/Draven/background3.webp',
        'Sprite/Draven/background4.webp',
        'Sprite/Draven/background5.webp'
      ]
    },
    skills: {
      basic: {
        name:'Shadow Strike', type:'Basic Skill', desc:'Quick attack from behind the enemy.',
        icon:'Sprite/Draven/Shadow_Strike_Basic_Skill_Icon.webp',
        manaCost:15, damage:105, cooldown:3,
        frames:[
          'Sprite/Draven/Draven_Shadow_Strike_effect_frame_1.webp',
          'Sprite/Draven/Draven_Shadow_Strike_effect_frame_2.webp',
          'Sprite/Draven/Draven_Shadow_Strike_effect_frame_3.webp',
          'Sprite/Draven/Draven_Shadow_Strike_effect_frame_4.webp',
          'Sprite/Draven/Draven_Shadow_Strike_effect_frame_5.webp',
          'Sprite/Draven/Draven_Shadow_Strike_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Dark Step', type:'Special Skill', desc:'Becomes invisible briefly and performs a critical strike.',
        icon:'Sprite/Draven/Dark_Step_Special_Skill_Icon.webp',
        manaCost:30, damage:200, cooldown:3,
        frames:[
          'Sprite/Draven/Draven_Dark_Step_effect_frame_1.webp',
          'Sprite/Draven/Draven_Dark_Step_effect_frame_2.webp',
          'Sprite/Draven/Draven_Dark_Step_effect_frame_3.webp',
          'Sprite/Draven/Draven_Dark_Step_effect_frame_4.webp',
          'Sprite/Draven/Draven_Dark_Step_effect_frame_5.webp',
          'Sprite/Draven/Draven_Dark_Step_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Nightmare Execution', type:'Ultimate Skill', desc:'Rapidly attacks the enemy from multiple directions.',
        icon:'Sprite/Draven/Nightmare_Execution_ultimate_Skill_Icon.webp',
        manaCost:80, damage:360, cooldown:6,
        frames:[
          'Sprite/Draven/Draven_Nightmare_Execution_effect_frame_1.webp',
          'Sprite/Draven/Draven_Nightmare_Execution_effect_frame_2.webp',
          'Sprite/Draven/Draven_Nightmare_Execution_effect_frame_3.webp',
          'Sprite/Draven/Draven_Nightmare_Execution_effect_frame_4.webp',
          'Sprite/Draven/Draven_Nightmare_Execution_effect_frame_5.webp',
          'Sprite/Draven/Draven_Nightmare_Execution_effect_frame_6.webp'
        ]
      }
    }
  },
  mira: {
    id: 'mira', facesRight: false, name: 'Mira', title: 'Tidecaller',
    quote: '"The ocean never forgets, and neither do I."',
    element: 'Water', weapon: 'Trident', fightingStyle: 'Magic / Control', role: 'Support / Damage',
    color: '#00bfff', glowColor: 'rgba(0,191,255,0.6)', bgColor: '#000d1a',
    stats: { hp: 920, atk: 130, def: 85, spd: 95, crit: 15 },
    sprites: {
      idle:     'Sprite/Mira/idle.webp',
      walk:     'Sprite/Mira/walk.webp',
      run:      'Sprite/Mira/run.webp',
      sprint:   'Sprite/Mira/sprint.webp',
      attack:   'Sprite/Mira/attack.webp',
      portrait: 'Sprite/Mira/Mira_Profile_Portfait.webp',
      lifeBar:  'Sprite/Mira/mira_hp_bar_ui.webp',
      manaBar:  'Sprite/Mira/ManaEnergy Bar.webp',
      namePlate:'Sprite/Mira/Level Badge Template.webp',
      backgrounds: [
        'Sprite/Mira/background1.webp',
        'Sprite/Mira/background2.webp',
        'Sprite/Mira/background3.webp',
        'Sprite/Mira/background4.webp',
        'Sprite/Mira/background5.webp'
      ]
    },
    skills: {
      basic: {
        name:'Water Pierce', type:'Basic Skill', desc:'Thrusts the trident with water energy.',
        icon:'Sprite/Mira/WaterPierce_Basic_Skill_Icon.webp',
        manaCost:15, damage:85, cooldown:3,
        frames:[
          'Sprite/Mira/Mira_Water_Pierce_effect_frame_1.webp',
          'Sprite/Mira/Mira_Water_Pierce_effect_frame2.webp',
          'Sprite/Mira/Mira_Water_Pierce_effect_frame_3.webp',
          'Sprite/Mira/Mira_Water_Pierce_effect_frame_4.webp',
          'Sprite/Mira/Mira_Water_Pierce_effect_frame_5.webp',
          'Sprite/Mira/Mira_Water_Pierce_effect_frame_6.webp'
    
