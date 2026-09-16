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
        ]
      },
      special: {
        name:'Healing Tide', type:'Special Skill', desc:'Restores a portion of own HP.',
        icon:'Sprite/Mira/Healing_Tide_Special_Skill_Icon.webp',
        manaCost:30, damage:-150, cooldown:3,
        frames:[
          'Sprite/Mira/Mira_Healing_Tide_effect_frame_1.webp',
          'Sprite/Mira/Mira_Healing_Tide_effect_frame_2.webp',
          'Sprite/Mira/Mira_Healing_Tide_effect_frame_3.webp',
          'Sprite/Mira/Mira_Healing_Tide_effect_frame_4.webp',
          'Sprite/Mira/Mira_Healing_Tide_effect_frame_5.webp',
          'Sprite/Mira/Mira_Healing_Tide_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:"Ocean's Wrath", type:'Ultimate Skill', desc:'Summons a huge wave that damages the opponent.',
        icon:'Sprite/Mira/Ocean_Wrath_Ultimate_Skill_Icon.webp',
        manaCost:80, damage:310, cooldown:6,
        frames:[
          'Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_1.webp',
          'Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_2.webp',
          'Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_3.webp',
          'Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_4.webp',
          'Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_5.webp',
          'Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_6.webp'
        ]
      }
    }
  },
  orion: {
    id: 'orion', facesRight: false, name: 'Orion', title: 'Stormcaller',
    quote: '"The wind does not ask permission — and neither do I."',
    element: 'Wind', weapon: 'Dual Blades', fightingStyle: 'Swift / Agile', role: 'Damage Dealer',
    color: '#88ffcc', glowColor: 'rgba(136,255,204,0.6)', bgColor: '#001a0d',
    stats: { hp: 920, atk: 135, def: 75, spd: 130, crit: 22 },
    sprites: {
      idle:     'Sprite/Orion/idle.webp',
      walk:     'Sprite/Orion/walk.webp',
      run:      'Sprite/Orion/run.webp',
      sprint:   'Sprite/Orion/sprint.webp',
      attack:   'Sprite/Orion/attack.webp',
      portrait: 'Sprite/Orion/Orion_Portfait_Profile.webp',
      lifeBar:  'Sprite/Orion/Orion_hp_bar_ui.webp',
      manaBar:  'Sprite/Orion/Manabar.webp',
      namePlate:'Sprite/Orion/Level Badge Template.webp',
      backgrounds: [
        'Sprite/Orion/background1.webp',
        'Sprite/Orion/background2.webp',
        'Sprite/Orion/background3.webp'
      ]
    },
    skills: {
      basic: {
        name:'Wind Slash', type:'Basic Skill', desc:'A razor-fast dual-blade slash charged with wind.',
        icon:'Sprite/Orion/Wind_Slash_Basic_Skill_Icon.webp',
        manaCost:15, damage:90, cooldown:3,
        frames:[
          'Sprite/Orion/Orion_Wind_Slash_effect_frame_1.webp',
          'Sprite/Orion/Orion_Wind_Slash_effect_frame_2.webp',
          'Sprite/Orion/Orion_Wind_Slash_effect_frame_3.webp',
          'Sprite/Orion/Orion_Wind_Slash_effect_frame_4.webp',
          'Sprite/Orion/Orion_Wind_Slash_effect_frame_5.webp',
          'Sprite/Orion/Orion_Wind_Slash_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Gale Dash', type:'Special Skill', desc:'Dashes through the enemy at blinding speed, striking multiple times.',
        icon:'Sprite/Orion/Gale_Dash_Special_Skill_Icon.webp',
        manaCost:30, damage:175, cooldown:3,
        frames:[
          'Sprite/Orion/Orion_Gale_Dash_effect_frame_1.webp',
          'Sprite/Orion/Orion_Gale_Dash_effect_frame_2.webp',
          'Sprite/Orion/Orion_Gale_Dash_effect_frame_3.webp',
          'Sprite/Orion/Orion_Gale_Dash_effect_frame_4.webp',
          'Sprite/Orion/Orion_Gale_Dash_effect_frame_5.webp',
          'Sprite/Orion/Orion_Gale_Dash_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Tempest Dance', type:'Ultimate Skill', desc:'Launches a massive wind burst that launches the enemy skyward.',
        icon:'Sprite/Orion/Tempest_Dance_Ultimate_Skill_Icon.webp',
        manaCost:80, damage:340, cooldown:6,
        frames:[
          'Sprite/Orion/Orion_Tempest_Dance_effect_frame_1.webp',
          'Sprite/Orion/Orion_Tempest_Dance_effect_frame_2.webp',
          'Sprite/Orion/Orion_Tempest_Dance_effect_frame_3.webp',
          'Sprite/Orion/Orion_Tempest_Dance_effect_frame_4.webp',
          'Sprite/Orion/Orion_Tempest_Dance_effect_frame_5.webp',
          'Sprite/Orion/Orion_Tempest_Dance_effect_frame_6.webp'
        ]
      }
    }
  },
  brutus: {
    id: 'brutus', facesRight: false, name: 'Brutus', title: 'Iron Guardian',
    quote: '"My shield protects what matters. My axe delivers justice."',
    element: 'Metal', weapon: 'Shield & Axe', fightingStyle: 'Heavy / Defensive', role: 'Tank',
    color: '#c0c0c0', glowColor: 'rgba(192,192,192,0.6)', bgColor: '#111111',
    stats: { hp: 1300, atk: 120, def: 130, spd: 65, crit: 10 },
    sprites: {
      idle:     'Sprite/Brutus/idle.webp',
      walk:     'Sprite/Brutus/walk.webp',
      run:      'Sprite/Brutus/run.webp',
      sprint:   'Sprite/Brutus/sprint.webp',
      attack:   'Sprite/Brutus/attack.webp',
      portrait: 'Sprite/Brutus/Brutus_Portfait_Profile.webp',
      lifeBar:  'Sprite/Brutus/brutus_hp_bar_ui.webp',
      manaBar:  'Sprite/Brutus/Manabar.webp',
      namePlate:'Sprite/Brutus/level badge template.webp',
      backgrounds: [
        'Sprite/Brutus/background1.webp',
        'Sprite/Brutus/background2.webp',
        'Sprite/Brutus/background3.webp',
        'Sprite/Brutus/background4.webp'
      ]
    },
    skills: {
      basic: {
        name:'Iron Bash', type:'Basic Skill', desc:'Shield strike followed by an axe attack.',
        icon:'Sprite/Brutus/Iron_Bash_Basic_Skill_Icon.webp',
        manaCost:15, damage:90, cooldown:3,
        frames:[
          'Sprite/Brutus/Brutus_Iron_Bash_effect_frame_1.webp',
          'Sprite/Brutus/Brutus_Iron_Bash_effect_frame_2.webp',
          'Sprite/Brutus/Brutus_Iron_Bash_effect_frame_3.webp',
          'Sprite/Brutus/Brutus_Iron_Bash_effect_frame_4.webp',
          'Sprite/Brutus/Brutus_Iron_Bash_effect_frame_5.webp',
          'Sprite/Brutus/Brutus_Iron_Bash_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Steel Guard', type:'Special Skill', desc:'Raises a steel guard, reducing incoming damage by 60% for this turn.',
        icon:'Sprite/Brutus/Steel_Guard_Special_Skill_Icon.webp',
        manaCost:30, damage:0, cooldown:3,
        frames:[
          'Sprite/Brutus/Brutus_Steel_Guard_effect_frame_1.webp',
          'Sprite/Brutus/Brutus_Steel_Guard_effect_frame_2.webp',
          'Sprite/Brutus/Brutus_Steel_Guard_effect_frame_3.webp',
          'Sprite/Brutus/Brutus_Steel_Guard_effect_frame_4.webp',
          'Sprite/Brutus/Brutus_Steel_Guard_effect_frame_5.webp',
          'Sprite/Brutus/Brutus_Steel_Guard_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Titan Breaker', type:'Ultimate Skill', desc:'Charges forward and delivers a devastating strike.',
        icon:'Sprite/Brutus/Titan_Breaker_Ultimate_Skill_Icon.webp',
        manaCost:80, damage:340, cooldown:6,
        frames:[
          'Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_1.webp',
          'Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_2.webp',
          'Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_3.webp',
          'Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_4.webp',
          'Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_5.webp',
          'Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_6.webp'
        ]
      }
    }
  },
  elysia: {
    id: 'elysia', facesRight: false, name: 'Elysia', title: 'Celestial Mage',
    quote: '"The stars are not just lights, they are within us."',
    element: 'Arcane', weapon: 'Magic Staff', fightingStyle: 'Magic / Burst', role: 'Mage',
    color: '#ff88ff', glowColor: 'rgba(255,136,255,0.6)', bgColor: '#100010',
    stats: { hp: 850, atk: 150, def: 60, spd: 100, crit: 28 },
    sprites: {
      idle:     'Sprite/Elysia/idle.webp',
      walk:     'Sprite/Elysia/walk.webp',
      run:      'Sprite/Elysia/run.webp',
      sprint:   'Sprite/Elysia/sprint.webp',
      attack:   'Sprite/Elysia/attack.webp',
      portrait: 'Sprite/Elysia/Elysia_Portfait_Profile.webp',
      lifeBar:  'Sprite/Elysia/elysia_hp_bar_ui.webp',
      manaBar:  'Sprite/Elysia/Manabar Energy.webp',
      namePlate:'Sprite/Elysia/Level Badge Template.webp',
      backgrounds: [
        'Sprite/Elysia/background1.webp',
        'Sprite/Elysia/background2.webp',
        'Sprite/Elysia/background3.webp'
      ]
    },
    skills: {
      basic: {
        name:'Arcane Bolt', type:'Basic Skill', desc:'Fires magical energy at the opponent.',
        icon:'Sprite/Elysia/Arcane_Bolt_Basic_Skill_Icon.webp',
        manaCost:15, damage:100, cooldown:3,
        frames:[
          'Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_1.webp',
          'Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_2.webp',
          'Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_3.webp',
          'Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_4.webp',
          'Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_5.webp',
          'Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Mana Surge', type:'Special Skill', desc:'Increases attack power and restores some HP.',
        icon:'Sprite/Elysia/Mana_Surge_Special_Skill_Icon.webp',
        manaCost:30, damage:-100, cooldown:3,
        frames:[
          'Sprite/Elysia/Elysia_Mana_Surge_effect_frame_1.webp',
          'Sprite/Elysia/Elysia_Mana_Surge_effect_frame_2.webp',
          'Sprite/Elysia/Elysia_Mana_Surge_effect_frame_3.webp',
          'Sprite/Elysia/Elysia_Mana_Surge_effect_frame_4.webp',
          'Sprite/Elysia/Elysia_Mana_Surge_effect_frame_5.webp',
          'Sprite/Elysia/Elysia_Mana_Surge_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Celestial Judgment', type:'Ultimate Skill', desc:'Releases a powerful beam of cosmic energy.',
        icon:'Sprite/Elysia/Celestial_Judgment_Ultimate_Skill_Icon.webp',
        manaCost:80, damage:380, cooldown:6,
        frames:[
          'Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_1.webp',
          'Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_2.webp',
          'Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_3.webp',
          'Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_4.webp',
          'Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_5.webp',
          'Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_6.webp'
        ]
      }
    }
  },
};

// Ordered list for UI  (Chapter unlock order: 1→10)
const HERO_ORDER = ['aeron','lyra','kael','riven','selene','draven','mira','orion','brutus','elysia'];

// ── STORY ENEMY DATABASE ──────────────────────────────────────
// Monsters used in story stages (non-hero enemies)
const STORY_ENEMIES = {

  // ══════════════════════════════════════════════════════════
  // CHAPTER 1 — THE AWAKENING  (Fire enemies)
  // ══════════════════════════════════════════════════════════
  flame_imp: {
    id: 'flame_imp', facesRight: false,
    name: 'Flame Imp', title: 'Fire Minion',
    element: 'Fire', role: 'Monster',
    color: '#ff4500', glowColor: 'rgba(255,69,0,0.6)', bgColor: '#1a0800',
    stats: { hp: 420, atk: 75, def: 40, spd: 85, crit: 10 },
    sprites: {
      idle:   'StoryEnemies/Fire/Flame Imp/idle.webp',
      walk:   'StoryEnemies/Fire/Flame Imp/walk.webp',
      run:    'StoryEnemies/Fire/Flame Imp/run.webp',
      sprint: 'StoryEnemies/Fire/Flame Imp/sprint.webp',
      attack: 'StoryEnemies/Fire/Flame Imp/attack.webp',
      portrait: 'StoryEnemies/Fire/Flame Imp/idle.webp',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Flame Imp/1background.webp']
    },
    skills: {
      basic: {
        name: 'Flame Claw', type: 'Basic Skill', desc: 'Slashes with burning claws.',
        icon: '', manaCost: 0, damage: 75, cooldown: 0,
        frames: [
          'StoryEnemies/Fire/Flame Imp/Flame_Claw_Effect_Frame1.webp',
          'StoryEnemies/Fire/Flame Imp/Flame_Claw_Effect_Frame2.webp',
          'StoryEnemies/Fire/Flame Imp/Flame_Claw_Effect_Frame3.webp',
          'StoryEnemies/Fire/Flame Imp/Flame_Claw_Effect_Frame4.webp',
          'StoryEnemies/Fire/Flame Imp/Flame_Claw_Effect_Frame5.webp',
          'StoryEnemies/Fire/Flame Imp/Flame_Claw_Effect_Frame6.webp'
        ]
      },
      special:  { name: 'Ember Burst',  type: 'Special Skill',  desc: 'Releases a burst of embers.', icon: '', manaCost: 30, damage: 110, cooldown: 3, frames: [] },
      ultimate: { name: 'Inferno Rush', type: 'Ultimate Skill', desc: 'Charges with full body aflame.', icon: '', manaCost: 80, damage: 200, cooldown: 6, frames: [] }
    }
  },

  ash_wolf: {
    id: 'ash_wolf', facesRight: false,
    name: 'Ash Wolf', title: 'Fire Beast',
    element: 'Fire', role: 'Monster',
    color: '#ff6600', glowColor: 'rgba(255,102,0,0.6)', bgColor: '#1a0800',
    stats: { hp: 560, atk: 95, def: 55, spd: 100, crit: 12 },

    sprites: {
      idle:   'StoryEnemies/Fire/Ash Wolf/idle.webp',
      walk:   'StoryEnemies/Fire/Ash Wolf/walk.webp',
      sprint: 'StoryEnemies/Fire/Ash Wolf/sprint.webp',
      attack: 'StoryEnemies/Fire/Ash Wolf/attack.webp',
      portrait: 'StoryEnemies/Fire/Ash Wolf/idle.webp',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Ash Wolf/2background.webp']
    },
    skills: {
      basic: {
        name: 'Ash Bite', type: 'Basic Skill', desc: 'Lunges and bites with lava-infused jaws.',
        icon: '', manaCost: 0, damage: 95, cooldown: 0,
        frames: [
          'StoryEnemies/Fire/Ash Wolf/Basic Skill Effect Frame 1.webp',
          'StoryEnemies/Fire/Ash Wolf/Basic Skill Effect Frame 2.webp',
          'StoryEnemies/Fire/Ash Wolf/Basic Skill Effect Frame 3.webp',
          'StoryEnemies/Fire/Ash Wolf/Basic Skill Effect Frame 4.webp'
        ]
      },
      special:  { name: 'Lava Howl',   type: 'Special Skill',  desc: 'Releases a scorching howl that burns the enemy.', icon: '', manaCost: 30, damage: 130, cooldown: 3, frames: [] },
      ultimate: { name: 'Magma Frenzy', type: 'Ultimate Skill', desc: 'Unleashes a wild flurry of magma-coated strikes.', icon: '', manaCost: 80, damage: 240, cooldown: 6, frames: [] }
    }
  },

  cinder_golem: {
    id: 'cinder_golem', facesRight: true,
    name: 'Cinder Golem', title: 'Stone & Fire',
    element: 'Fire', role: 'Monster',
    color: '#ff7722', glowColor: 'rgba(255,119,34,0.6)', bgColor: '#1a0800',
    stats: { hp: 750, atk: 105, def: 90, spd: 55, crit: 8 },
    sprites: {
      idle:   'StoryEnemies/Fire/Cinder Golem/idle.png',
      walk:   'StoryEnemies/Fire/Cinder Golem/walk.png',
      run:    'StoryEnemies/Fire/Cinder Golem/run.png',
      sprint: 'StoryEnemies/Fire/Cinder Golem/sprint.png',
      attack: 'StoryEnemies/Fire/Cinder Golem/attack.png',
      portrait: 'StoryEnemies/Fire/Cinder Golem/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Cinder Golem/background.png']
    },
    skills: {
      basic:    { name: 'Rock Smash',     type: 'Basic Skill',   desc: 'Slams the ground with burning fists.', icon: '', manaCost: 0,  damage: 100, cooldown: 0, frames: [] },
      special:  { name: 'Magma Shield',   type: 'Special Skill', desc: 'Hardens body with molten rock, blocking damage.',  icon: '', manaCost: 30, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Eruption Slam',  type: 'Ultimate Skill',desc: 'Leaps and crashes down with explosive force.',  icon: '', manaCost: 80, damage: 260, cooldown: 6, frames: [] }
    }
  },

  magma_serpent: {
    id: 'magma_serpent', facesRight: false,
    name: 'Magma Serpent', title: 'Living Lava',
    element: 'Fire', role: 'Monster',
    color: '#ff3300', glowColor: 'rgba(255,51,0,0.6)', bgColor: '#200800',
    stats: { hp: 680, atk: 115, def: 65, spd: 110, crit: 15 },
    sprites: {
      idle:   'StoryEnemies/Fire/Magma Serpent/idle.png',
      walk:   'StoryEnemies/Fire/Magma Serpent/walk.png',
      run:    'StoryEnemies/Fire/Magma Serpent/run.png',
      sprint: 'StoryEnemies/Fire/Magma Serpent/sprint.png',
      attack: 'StoryEnemies/Fire/Magma Serpent/attack.png',
      portrait: 'StoryEnemies/Fire/Magma Serpent/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Magma Serpent/background.png']
    },
    skills: {
      basic:    { name: 'Lava Fang',    type: 'Basic Skill',   desc: 'Strikes with molten fangs.',      icon: '', manaCost: 0,  damage: 110, cooldown: 0, frames: [] },
      special:  { name: 'Scorch Coil',  type: 'Special Skill', desc: 'Wraps around and burns the foe.', icon: '', manaCost: 30, damage: 150, cooldown: 3, frames: [] },
      ultimate: { name: 'Inferno Tide', type: 'Ultimate Skill',desc: 'Releases a torrent of molten fire.',icon: '', manaCost: 80, damage: 280, cooldown: 6, frames: [] }
    }
  },

  inferno_lord: {
    id: 'inferno_lord', facesRight: true,
    name: 'Inferno Lord', title: 'Chapter 1 Boss',
    element: 'Fire', role: 'Boss',
    color: '#ff1100', glowColor: 'rgba(255,17,0,0.8)', bgColor: '#2a0400',
    stats: { hp: 1200, atk: 135, def: 80, spd: 90, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Fire/Inferno Lord/idle.png',
      walk:   'StoryEnemies/Fire/Inferno Lord/walk.png',
      run:    'StoryEnemies/Fire/Inferno Lord/run.png',
      sprint: 'StoryEnemies/Fire/Inferno Lord/sprint.png',
      attack: 'StoryEnemies/Fire/Inferno Lord/attack.png',
      portrait: 'StoryEnemies/Fire/Inferno Lord/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Inferno Lord/background.png']
    },
    skills: {
      basic:    { name: 'Hellfire Strike',  type: 'Basic Skill',   desc: 'A devastating blow wreathed in hellfire.',   icon: '', manaCost: 0,  damage: 130, cooldown: 0, frames: [] },
      special:  { name: 'Flame Dominion',   type: 'Special Skill', desc: 'Commands the flames to engulf the enemy.',   icon: '', manaCost: 30, damage: 200, cooldown: 3, frames: [] },
      ultimate: { name: 'Apocalypse Flame', type: 'Ultimate Skill',desc: 'Unleashes the full wrath of the inferno.',   icon: '', manaCost: 80, damage: 380, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 2 — THE SHATTERED REALM  (Lightning enemies)
  // ══════════════════════════════════════════════════════════
  storm_sprite: {
    id: 'storm_sprite', facesRight: true,
    name: 'Storm Sprite', title: 'Thunder Wisp',
    element: 'Lightning', role: 'Monster',
    color: '#ffe600', glowColor: 'rgba(255,230,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 460, atk: 85, def: 35, spd: 120, crit: 14 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Storm Sprite/idle.png',
      walk:   'StoryEnemies/Lightning/Storm Sprite/walk.png',
      run:    'StoryEnemies/Lightning/Storm Sprite/run.png',
      sprint: 'StoryEnemies/Lightning/Storm Sprite/sprint.png',
      attack: 'StoryEnemies/Lightning/Storm Sprite/attack.png',
      portrait: 'StoryEnemies/Lightning/Storm Sprite/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Storm Sprite/background.png']
    },
    skills: {
      basic:    { name: 'Spark Jab',     type: 'Basic Skill',   desc: 'Zaps the enemy with a quick bolt.',         icon: '', manaCost: 0,  damage: 80,  cooldown: 0, frames: [] },
      special:  { name: 'Volt Chain',    type: 'Special Skill', desc: 'Chains lightning between multiple hits.',   icon: '', manaCost: 30, damage: 120, cooldown: 3, frames: [] },
      ultimate: { name: 'Thunder Crash', type: 'Ultimate Skill',desc: 'Summons a massive bolt from above.',        icon: '', manaCost: 80, damage: 220, cooldown: 6, frames: [] }
    }
  },

  thunder_hawk: {
    id: 'thunder_hawk', facesRight: false,
    name: 'Thunder Hawk', title: 'Storm Predator',
    element: 'Lightning', role: 'Monster',
    color: '#ffdd00', glowColor: 'rgba(255,221,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 580, atk: 110, def: 50, spd: 130, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Thunder Hawk/idle.png',
      walk:   'StoryEnemies/Lightning/Thunder Hawk/walk.png',
      run:    'StoryEnemies/Lightning/Thunder Hawk/run.png',
      sprint: 'StoryEnemies/Lightning/Thunder Hawk/sprint.png',
      attack: 'StoryEnemies/Lightning/Thunder Hawk/attack.png',
      portrait: 'StoryEnemies/Lightning/Thunder Hawk/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Thunder Hawk/background.png']
    },
    skills: {
      basic:    { name: 'Talon Strike',  type: 'Basic Skill',   desc: 'Dives with electrified talons.',            icon: '', manaCost: 0,  damage: 100, cooldown: 0, frames: [] },
      special:  { name: 'Storm Dive',    type: 'Special Skill', desc: 'Plummets from the sky at lightning speed.', icon: '', manaCost: 30, damage: 145, cooldown: 3, frames: [] },
      ultimate: { name: 'Gale Screech',  type: 'Ultimate Skill',desc: 'Unleashes a deafening storm shriek.',       icon: '', manaCost: 80, damage: 250, cooldown: 6, frames: [] }
    }
  },

  volt_hound: {
    id: 'volt_hound', facesRight: true,
    name: 'Volt Hound', title: 'Electric Beast',
    element: 'Lightning', role: 'Monster',
    color: '#ffee44', glowColor: 'rgba(255,238,68,0.6)', bgColor: '#0d0d00',
    stats: { hp: 650, atk: 100, def: 60, spd: 115, crit: 16 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Volt Hound/idle.png',
      walk:   'StoryEnemies/Lightning/Volt Hound/walk.png',
      run:    'StoryEnemies/Lightning/Volt Hound/run.png',
      sprint: 'StoryEnemies/Lightning/Volt Hound/sprint.png',
      attack: 'StoryEnemies/Lightning/Volt Hound/attack.png',
      portrait: 'StoryEnemies/Lightning/Volt Hound/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Volt Hound/background.png']
    },
    skills: {
      basic:    { name: 'Static Bite',   type: 'Basic Skill',   desc: 'Bites and shocks simultaneously.',          icon: '', manaCost: 0,  damage: 95,  cooldown: 0, frames: [] },
      special:  { name: 'Volt Pounce',   type: 'Special Skill', desc: 'Leaps forward in a burst of electricity.',  icon: '', manaCost: 30, damage: 140, cooldown: 3, frames: [] },
      ultimate: { name: 'Thunder Maw',   type: 'Ultimate Skill',desc: 'Opens a magnetic jaw that crackles with power.', icon: '', manaCost: 80, damage: 255, cooldown: 6, frames: [] }
    }
  },

  storm_giant: {
    id: 'storm_giant', facesRight: false,
    name: 'Storm Giant', title: 'Thunder Colossus',
    element: 'Lightning', role: 'Monster',
    color: '#cccc00', glowColor: 'rgba(204,204,0,0.6)', bgColor: '#111100',
    stats: { hp: 900, atk: 120, def: 85, spd: 70, crit: 12 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Storm Giant/idle.png',
      walk:   'StoryEnemies/Lightning/Storm Giant/walk.png',
      run:    'StoryEnemies/Lightning/Storm Giant/run.png',
      sprint: 'StoryEnemies/Lightning/Storm Giant/sprint.png',
      attack: 'StoryEnemies/Lightning/Storm Giant/attack.png',
      portrait: 'StoryEnemies/Lightning/Storm Giant/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Storm Giant/background.png']
    },
    skills: {
      basic:    { name: 'Thunderclap',   type: 'Basic Skill',   desc: 'Claps hands together with thunderous force.', icon: '', manaCost: 0,  damage: 115, cooldown: 0, frames: [] },
      special:  { name: 'Stormfist',     type: 'Special Skill', desc: 'Drives a lightning-coated fist into the ground.', icon: '', manaCost: 30, damage: 165, cooldown: 3, frames: [] },
      ultimate: { name: 'Sky Collapse',  type: 'Ultimate Skill',desc: 'Pulls lightning from the clouds and slams it down.', icon: '', manaCost: 80, damage: 300, cooldown: 6, frames: [] }
    }
  },

  zeus_herald: {
    id: 'zeus_herald', facesRight: true,
    name: 'Zeus Herald', title: 'Chapter 2 Boss',
    element: 'Lightning', role: 'Boss',
    color: '#ffee00', glowColor: 'rgba(255,238,0,0.8)', bgColor: '#1a1a00',
    stats: { hp: 1300, atk: 145, def: 85, spd: 105, crit: 20 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Zeus Herald/idle.png',
      walk:   'StoryEnemies/Lightning/Zeus Herald/walk.png',
      run:    'StoryEnemies/Lightning/Zeus Herald/run.png',
      sprint: 'StoryEnemies/Lightning/Zeus Herald/sprint.png',
      attack: 'StoryEnemies/Lightning/Zeus Herald/attack.png',
      portrait: 'StoryEnemies/Lightning/Zeus Herald/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Zeus Herald/background.png']
    },
    skills: {
      basic:    { name: 'Bolt of Judgment', type: 'Basic Skill',   desc: 'Hurls a divine thunderbolt.',              icon: '', manaCost: 0,  damage: 140, cooldown: 0, frames: [] },
      special:  { name: 'Storm Domain',     type: 'Special Skill', desc: 'Charges the battlefield with electricity.', icon: '', manaCost: 30, damage: 210, cooldown: 3, frames: [] },
      ultimate: { name: 'Divine Thunder',   type: 'Ultimate Skill',desc: 'Calls down a pillar of divine lightning.',  icon: '', manaCost: 80, damage: 400, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 3 — SHADOWS AND STARS  (Dark / Shadow enemies)
  // ══════════════════════════════════════════════════════════
  shade_wraith: {
    id: 'shade_wraith', facesRight: false,
    name: 'Shade Wraith', title: 'Hollow Spirit',
    element: 'Dark', role: 'Monster',
    color: '#9932cc', glowColor: 'rgba(153,50,204,0.6)', bgColor: '#0a0010',
    stats: { hp: 480, atk: 90, def: 30, spd: 115, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Shade Wraith/idle.png',
      walk:   'StoryEnemies/Shadow/Shade Wraith/walk.png',
      run:    'StoryEnemies/Shadow/Shade Wraith/run.png',
      sprint: 'StoryEnemies/Shadow/Shade Wraith/sprint.png',
      attack: 'StoryEnemies/Shadow/Shade Wraith/attack.png',
      portrait: 'StoryEnemies/Shadow/Shade Wraith/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Shade Wraith/background.png']
    },
    skills: {
      basic:    { name: 'Shadow Touch',  type: 'Basic Skill',   desc: 'Drains life with a ghostly hand.',          icon: '', manaCost: 0,  damage: 85,  cooldown: 0, frames: [] },
      special:  { name: 'Void Slash',    type: 'Special Skill', desc: 'Tears through dimensions in a dark arc.',   icon: '', manaCost: 30, damage: 125, cooldown: 3, frames: [] },
      ultimate: { name: 'Soul Rend',     type: 'Ultimate Skill',desc: 'Rips the soul partially from the body.',    icon: '', manaCost: 80, damage: 230, cooldown: 6, frames: [] }
    }
  },

  dark_stalker: {
    id: 'dark_stalker', facesRight: true,
    name: 'Dark Stalker', title: 'Shadow Hunter',
    element: 'Dark', role: 'Monster',
    color: '#7700bb', glowColor: 'rgba(119,0,187,0.6)', bgColor: '#0a0010',
    stats: { hp: 600, atk: 115, def: 55, spd: 125, crit: 22 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Dark Stalker/idle.png',
      walk:   'StoryEnemies/Shadow/Dark Stalker/walk.png',
      run:    'StoryEnemies/Shadow/Dark Stalker/run.png',
      sprint: 'StoryEnemies/Shadow/Dark Stalker/sprint.png',
      attack: 'StoryEnemies/Shadow/Dark Stalker/attack.png',
      portrait: 'StoryEnemies/Shadow/Dark Stalker/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Dark Stalker/background.png']
    },
    skills: {
      basic:    { name: 'Shadowstep',    type: 'Basic Skill',   desc: 'Teleports behind and strikes.',             icon: '', manaCost: 0,  damage: 105, cooldown: 0, frames: [] },
      special:  { name: 'Umbra Strike',  type: 'Special Skill', desc: 'Materializes from darkness for a crit.',    icon: '', manaCost: 30, damage: 160, cooldown: 3, frames: [] },
      ultimate: { name: 'Dark Pursuit',  type: 'Ultimate Skill',desc: 'Relentlessly slashes from every angle.',    icon: '', manaCost: 80, damage: 270, cooldown: 6, frames: [] }
    }
  },

  void_knight: {
    id: 'void_knight', facesRight: false,
    name: 'Void Knight', title: 'Armor of Darkness',
    element: 'Dark', role: 'Monster',
    color: '#5500aa', glowColor: 'rgba(85,0,170,0.6)', bgColor: '#080018',
    stats: { hp: 800, atk: 110, def: 100, spd: 75, crit: 14 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Void Knight/idle.png',
      walk:   'StoryEnemies/Shadow/Void Knight/walk.png',
      run:    'StoryEnemies/Shadow/Void Knight/run.png',
      sprint: 'StoryEnemies/Shadow/Void Knight/sprint.png',
      attack: 'StoryEnemies/Shadow/Void Knight/attack.png',
      portrait: 'StoryEnemies/Shadow/Void Knight/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Void Knight/background.png']
    },
    skills: {
      basic:    { name: 'Dark Blade',    type: 'Basic Skill',   desc: 'Swings an obsidian sword.',                 icon: '', manaCost: 0,  damage: 105, cooldown: 0, frames: [] },
      special:  { name: 'Shadow Guard',  type: 'Special Skill', desc: 'Raises a void shield, nullifying damage.',  icon: '', manaCost: 30, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Abyss Cleave',  type: 'Ultimate Skill',desc: 'Slashes reality itself with dark energy.',  icon: '', manaCost: 80, damage: 290, cooldown: 6, frames: [] }
    }
  },

  nightmare_beast: {
    id: 'nightmare_beast', facesRight: true,
    name: 'Nightmare Beast', title: 'Fear Incarnate',
    element: 'Dark', role: 'Monster',
    color: '#aa0099', glowColor: 'rgba(170,0,153,0.6)', bgColor: '#100010',
    stats: { hp: 750, atk: 130, def: 70, spd: 105, crit: 20 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Nightmare Beast/idle.png',
      walk:   'StoryEnemies/Shadow/Nightmare Beast/walk.png',
      run:    'StoryEnemies/Shadow/Nightmare Beast/run.png',
      sprint: 'StoryEnemies/Shadow/Nightmare Beast/sprint.png',
      attack: 'StoryEnemies/Shadow/Nightmare Beast/attack.png',
      portrait: 'StoryEnemies/Shadow/Nightmare Beast/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Nightmare Beast/background.png']
    },
    skills: {
      basic:    { name: 'Terror Claw',   type: 'Basic Skill',   desc: 'Rakes with nightmare-infused claws.',       icon: '', manaCost: 0,  damage: 120, cooldown: 0, frames: [] },
      special:  { name: 'Dread Howl',    type: 'Special Skill', desc: 'Paralyzes with a blood-curdling screech.',  icon: '', manaCost: 30, damage: 170, cooldown: 3, frames: [] },
      ultimate: { name: 'Void Ravage',   type: 'Ultimate Skill',desc: 'Tears through dimensions with dark claws.', icon: '', manaCost: 80, damage: 310, cooldown: 6, frames: [] }
    }
  },

  shadow_emperor: {
    id: 'shadow_emperor', facesRight: false,
    name: 'Shadow Emperor', title: 'Chapter 3 Boss',
    element: 'Dark', role: 'Boss',
    color: '#cc00ff', glowColor: 'rgba(204,0,255,0.8)', bgColor: '#130020',
    stats: { hp: 1400, atk: 155, def: 90, spd: 110, crit: 22 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Shadow Emperor/idle.png',
      walk:   'StoryEnemies/Shadow/Shadow Emperor/walk.png',
      run:    'StoryEnemies/Shadow/Shadow Emperor/run.png',
      sprint: 'StoryEnemies/Shadow/Shadow Emperor/sprint.png',
      attack: 'StoryEnemies/Shadow/Shadow Emperor/attack.png',
      portrait: 'StoryEnemies/Shadow/Shadow Emperor/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Shadow Emperor/background.png']
    },
    skills: {
      basic:    { name: 'Eclipse Strike',  type: 'Basic Skill',   desc: 'Strikes with the power of an eclipse.',    icon: '', manaCost: 0,  damage: 145, cooldown: 0, frames: [] },
      special:  { name: 'Dark Dominion',   type: 'Special Skill', desc: 'Commands all shadows to converge.',        icon: '', manaCost: 30, damage: 220, cooldown: 3, frames: [] },
      ultimate: { name: 'Eternal Darkness',type: 'Ultimate Skill',desc: 'Plunges the world into absolute shadow.',   icon: '', manaCost: 80, damage: 420, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 4 — RISE OF THE IRON LEGION  (Metal enemies)
  // ══════════════════════════════════════════════════════════
  iron_grunt: {
    id: 'iron_grunt', facesRight: true,
    name: 'Iron Grunt', title: 'Steel Soldier',
    element: 'Metal', role: 'Monster',
    color: '#aaaaaa', glowColor: 'rgba(170,170,170,0.5)', bgColor: '#111111',
    stats: { hp: 550, atk: 90, def: 90, spd: 65, crit: 10 },
    sprites: {
      idle:   'StoryEnemies/Metal/Iron Grunt/idle.png',
      walk:   'StoryEnemies/Metal/Iron Grunt/walk.png',
      run:    'StoryEnemies/Metal/Iron Grunt/run.png',
      sprint: 'StoryEnemies/Metal/Iron Grunt/sprint.png',
      attack: 'StoryEnemies/Metal/Iron Grunt/attack.png',
      portrait: 'StoryEnemies/Metal/Iron Grunt/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Iron Grunt/background.png']
    },
    skills: {
      basic:    { name: 'Shield Bash',   type: 'Basic Skill',   desc: 'Rams with an iron shield.',                 icon: '', manaCost: 0,  damage: 85,  cooldown: 0, frames: [] },
      special:  { name: 'Steel Wall',    type: 'Special Skill', desc: 'Raises a steel barrier, halving damage.',   icon: '', manaCost: 30, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Iron Avalanche',type: 'Ultimate Skill',desc: 'Charges forward in full armor.',            icon: '', manaCost: 80, damage: 220, cooldown: 6, frames: [] }
    }
  },

  blade_automaton: {
    id: 'blade_automaton', facesRight: false,
    name: 'Blade Automaton', title: 'War Machine',
    element: 'Metal', role: 'Monster',
    color: '#cc9900', glowColor: 'rgba(204,153,0,0.6)', bgColor: '#111100',
    stats: { hp: 680, atk: 120, def: 80, spd: 80, crit: 13 },
    sprites: {
      idle:   'StoryEnemies/Metal/Blade Automaton/idle.png',
      walk:   'StoryEnemies/Metal/Blade Automaton/walk.png',
      run:    'StoryEnemies/Metal/Blade Automaton/run.png',
      sprint: 'StoryEnemies/Metal/Blade Automaton/sprint.png',
      attack: 'StoryEnemies/Metal/Blade Automaton/attack.png',
      portrait: 'StoryEnemies/Metal/Blade Automaton/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Blade Automaton/background.png']
    },
    skills: {
      basic:    { name: 'Spinning Blades', type: 'Basic Skill',   desc: 'Activates rotating saw arms.',             icon: '', manaCost: 0,  damage: 110, cooldown: 0, frames: [] },
      special:  { name: 'Gear Barrage',    type: 'Special Skill', desc: 'Fires a volley of razor-sharp gears.',     icon: '', manaCost: 30, damage: 155, cooldown: 3, frames: [] },
      ultimate: { name: 'Full Assault',    type: 'Ultimate Skill',desc: 'Overclocks all systems for total destruction.', icon: '', manaCost: 80, damage: 270, cooldown: 6, frames: [] }
    }
  },

  steel_colossus: {
    id: 'steel_colossus', facesRight: true,
    name: 'Steel Colossus', title: 'Iron Titan',
    element: 'Metal', role: 'Monster',
    color: '#bbbbbb', glowColor: 'rgba(187,187,187,0.6)', bgColor: '#111111',
    stats: { hp: 1000, atk: 115, def: 120, spd: 50, crit: 9 },
    sprites: {
      idle:   'StoryEnemies/Metal/Steel Colossus/idle.png',
      walk:   'StoryEnemies/Metal/Steel Colossus/walk.png',
      run:    'StoryEnemies/Metal/Steel Colossus/run.png',
      sprint: 'StoryEnemies/Metal/Steel Colossus/sprint.png',
      attack: 'StoryEnemies/Metal/Steel Colossus/attack.png',
      portrait: 'StoryEnemies/Metal/Steel Colossus/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Steel Colossus/background.png']
    },
    skills: {
      basic:    { name: 'Titan Fist',    type: 'Basic Skill',   desc: 'Crushes with a massive iron fist.',          icon: '', manaCost: 0,  damage: 115, cooldown: 0, frames: [] },
      special:  { name: 'Fortress Mode', type: 'Special Skill', desc: 'Locks down with maximum armor density.',     icon: '', manaCost: 30, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Colossus Stomp',type: 'Ultimate Skill',desc: 'Shakes the earth with a single step.',       icon: '', manaCost: 80, damage: 290, cooldown: 6, frames: [] }
    }
  },

  war_commander: {
    id: 'war_commander', facesRight: false,
    name: 'War Commander', title: 'Legion General',
    element: 'Metal', role: 'Monster',
    color: '#dd9900', glowColor: 'rgba(221,153,0,0.6)', bgColor: '#150f00',
    stats: { hp: 850, atk: 135, def: 100, spd: 80, crit: 15 },
    sprites: {
      idle:   'StoryEnemies/Metal/War Commander/idle.png',
      walk:   'StoryEnemies/Metal/War Commander/walk.png',
      run:    'StoryEnemies/Metal/War Commander/run.png',
      sprint: 'StoryEnemies/Metal/War Commander/sprint.png',
      attack: 'StoryEnemies/Metal/War Commander/attack.png',
      portrait: 'StoryEnemies/Metal/War Commander/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/War Commander/background.png']
    },
    skills: {
      basic:    { name: 'War Axe',       type: 'Basic Skill',   desc: 'Cleaves with a massive battle axe.',         icon: '', manaCost: 0,  damage: 125, cooldown: 0, frames: [] },
      special:  { name: 'Rally Charge',  type: 'Special Skill', desc: 'Charges with reinforced momentum.',          icon: '', manaCost: 30, damage: 175, cooldown: 3, frames: [] },
      ultimate: { name: 'Iron Dominance',type: 'Ultimate Skill',desc: 'Unleashes the full might of the Iron Legion.',icon: '', manaCost: 80, damage: 320, cooldown: 6, frames: [] }
    }
  },

  iron_overlord: {
    id: 'iron_overlord', facesRight: true,
    name: 'Iron Overlord', title: 'Chapter 4 Boss',
    element: 'Metal', role: 'Boss',
    color: '#ffbb00', glowColor: 'rgba(255,187,0,0.8)', bgColor: '#1a1000',
    stats: { hp: 1500, atk: 160, def: 130, spd: 75, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Metal/Iron Overlord/idle.png',
      walk:   'StoryEnemies/Metal/Iron Overlord/walk.png',
      run:    'StoryEnemies/Metal/Iron Overlord/run.png',
      sprint: 'StoryEnemies/Metal/Iron Overlord/sprint.png',
      attack: 'StoryEnemies/Metal/Iron Overlord/attack.png',
      portrait: 'StoryEnemies/Metal/Iron Overlord/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Iron Overlord/background.png']
    },
    skills: {
      basic:    { name: 'Judgment Hammer', type: 'Basic Skill',  desc: 'Brings down a hammer of absolute judgment.',  icon: '', manaCost: 0,  damage: 155, cooldown: 0, frames: [] },
      special:  { name: 'Legion Fortify',  type: 'Special Skill',desc: 'Reinforces iron plating to near-invincibility.',icon:'', manaCost: 30, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'World Crusher',   type: 'Ultimate Skill',desc: 'Brings the full might of the Iron Legion down.',icon:'', manaCost: 80, damage: 440, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 5 — THE FINAL RECKONING  (Mixed / Final Bosses)
  // ══════════════════════════════════════════════════════════
  void_sentinel: {
    id: 'void_sentinel', facesRight: false,
    name: 'Void Sentinel', title: 'Gatekeeper',
    element: 'Dark', role: 'Monster',
    color: '#8800cc', glowColor: 'rgba(136,0,204,0.6)', bgColor: '#0e0018',
    stats: { hp: 700, atk: 125, def: 80, spd: 90, crit: 16 },
    sprites: {
      idle:   'StoryEnemies/Final/Void Sentinel/idle.png',
      walk:   'StoryEnemies/Final/Void Sentinel/walk.png',
      run:    'StoryEnemies/Final/Void Sentinel/run.png',
      sprint: 'StoryEnemies/Final/Void Sentinel/sprint.png',
      attack: 'StoryEnemies/Final/Void Sentinel/attack.png',
      portrait: 'StoryEnemies/Final/Void Sentinel/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Void Sentinel/background.png']
    },
    skills: {
      basic:    { name: 'Void Lance',    type: 'Basic Skill',   desc: 'Hurls a spear of pure void energy.',         icon: '', manaCost: 0,  damage: 120, cooldown: 0, frames: [] },
      special:  { name: 'Gate Seal',     type: 'Special Skill', desc: 'Seals the enemy\'s power temporarily.',      icon: '', manaCost: 30, damage: 160, cooldown: 3, frames: [] },
      ultimate: { name: 'Void Collapse', type: 'Ultimate Skill',desc: 'Implodes a pocket of void energy on the foe.',icon:'', manaCost: 80, damage: 300, cooldown: 6, frames: [] }
    }
  },

  chaos_dragon: {
    id: 'chaos_dragon', facesRight: true,
    name: 'Chaos Dragon', title: 'Harbinger of Ruin',
    element: 'Fire', role: 'Monster',
    color: '#ff2200', glowColor: 'rgba(255,34,0,0.7)', bgColor: '#1a0500',
    stats: { hp: 900, atk: 150, def: 90, spd: 100, crit: 20 },
    sprites: {
      idle:   'StoryEnemies/Final/Chaos Dragon/idle.png',
      walk:   'StoryEnemies/Final/Chaos Dragon/walk.png',
      run:    'StoryEnemies/Final/Chaos Dragon/run.png',
      sprint: 'StoryEnemies/Final/Chaos Dragon/sprint.png',
      attack: 'StoryEnemies/Final/Chaos Dragon/attack.png',
      portrait: 'StoryEnemies/Final/Chaos Dragon/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Chaos Dragon/background.png']
    },
    skills: {
      basic:    { name: 'Dragon Claw',   type: 'Basic Skill',   desc: 'Rakes with massive chaos-touched claws.',    icon: '', manaCost: 0,  damage: 140, cooldown: 0, frames: [] },
      special:  { name: 'Chaos Breath',  type: 'Special Skill', desc: 'Breathes swirling flames of pure entropy.',  icon: '', manaCost: 30, damage: 200, cooldown: 3, frames: [] },
      ultimate: { name: 'Dragon\'s Wrath',type:'Ultimate Skill',desc: 'Unleashes total draconic destruction.',      icon: '', manaCost: 80, damage: 360, cooldown: 6, frames: [] }
    }
  },

  phantom_warlord: {
    id: 'phantom_warlord', facesRight: false,
    name: 'Phantom Warlord', title: 'Fallen Champion',
    element: 'Dark', role: 'Monster',
    color: '#bb44ff', glowColor: 'rgba(187,68,255,0.7)', bgColor: '#100015',
    stats: { hp: 1000, atk: 145, def: 95, spd: 105, crit: 22 },
    sprites: {
      idle:   'StoryEnemies/Final/Phantom Warlord/idle.png',
      walk:   'StoryEnemies/Final/Phantom Warlord/walk.png',
      run:    'StoryEnemies/Final/Phantom Warlord/run.png',
      sprint: 'StoryEnemies/Final/Phantom Warlord/sprint.png',
      attack: 'StoryEnemies/Final/Phantom Warlord/attack.png',
      portrait: 'StoryEnemies/Final/Phantom Warlord/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Phantom Warlord/background.png']
    },
    skills: {
      basic:    { name: 'Phantom Slash', type: 'Basic Skill',   desc: 'A ghostly strike that bypasses defenses.',   icon: '', manaCost: 0,  damage: 135, cooldown: 0, frames: [] },
      special:  { name: 'Spectral Surge',type: 'Special Skill', desc: 'Charges with spectral energy.',              icon: '', manaCost: 30, damage: 195, cooldown: 3, frames: [] },
      ultimate: { name: 'Warlord\'s Rage',type:'Ultimate Skill',desc: 'Unleashes the full fury of a fallen champion.',icon:'', manaCost: 80, damage: 350, cooldown: 6, frames: [] }
    }
  },

  genesis_titan: {
    id: 'genesis_titan', facesRight: true,
    name: 'Genesis Titan', title: 'World Ender',
    element: 'Arcane', role: 'Boss',
    color: '#ff88ff', glowColor: 'rgba(255,136,255,0.8)', bgColor: '#150020',
    stats: { hp: 1600, atk: 165, def: 110, spd: 95, crit: 24 },
    sprites: {
      idle:   'StoryEnemies/Final/Genesis Titan/idle.png',
      walk:   'StoryEnemies/Final/Genesis Titan/walk.png',
      run:    'StoryEnemies/Final/Genesis Titan/run.png',
      sprint: 'StoryEnemies/Final/Genesis Titan/sprint.png',
      attack: 'StoryEnemies/Final/Genesis Titan/attack.png',
      portrait: 'StoryEnemies/Final/Genesis Titan/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Genesis Titan/background.png']
    },
    skills: {
      basic:    { name: 'Cosmic Slam',    type: 'Basic Skill',   desc: 'Crashes down with the weight of the cosmos.', icon:'', manaCost: 0,  damage: 150, cooldown: 0, frames: [] },
      special:  { name: 'Star Collapse',  type: 'Special Skill', desc: 'Implodes a star onto the enemy.',             icon:'', manaCost: 30, damage: 220, cooldown: 3, frames: [] },
      ultimate: { name: 'Genesis Burst',  type: 'Ultimate Skill',desc: 'Detonates primordial energy across reality.',  icon:'', manaCost: 80, damage: 460, cooldown: 6, frames: [] }
    }
  },

  tenfold_sovereign: {
    id: 'tenfold_sovereign', facesRight: false,
    name: 'Tenfold Sovereign', title: 'FINAL BOSS',
    element: 'Arcane', role: 'Final Boss',
    color: '#ffcc00', glowColor: 'rgba(255,204,0,0.9)', bgColor: '#100020',
    stats: { hp: 2000, atk: 180, def: 120, spd: 110, crit: 26 },
    sprites: {
      idle:   'StoryEnemies/Final/Tenfold Sovereign/idle.png',
      walk:   'StoryEnemies/Final/Tenfold Sovereign/walk.png',
      run:    'StoryEnemies/Final/Tenfold Sovereign/run.png',
      sprint: 'StoryEnemies/Final/Tenfold Sovereign/sprint.png',
      attack: 'StoryEnemies/Final/Tenfold Sovereign/attack.png',
      portrait: 'StoryEnemies/Final/Tenfold Sovereign/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Tenfold Sovereign/background.png']
    },
    skills: {
      basic:    { name: 'Sovereign Strike',   type: 'Basic Skill',   desc: 'An unstoppable blow from the sovereign.',     icon:'', manaCost: 0,  damage: 170, cooldown: 0, frames: [] },
      special:  { name: 'Tenfold Judgement',  type: 'Special Skill', desc: 'Calls down ten simultaneous blasts.',          icon:'', manaCost: 30, damage: 240, cooldown: 3, frames: [] },
      ultimate: { name: 'Absolute Dominion',  type: 'Ultimate Skill',desc: 'The final, world-ending move of the sovereign.',icon:'', manaCost: 80, damage: 500, cooldown: 6, frames: [] }
    }
  },
};

// ── GAME STATE ────────────────────────────────────────────────
const Game = {
  user: null,
  selectedHero: null,
  storyChapter: 1,
  storyStage: 1,
  _readSession() {
    // 1st: try safeLocalStorage (survives MIT App Inventor WebViewer page navigation)
    try {
      const raw = safeLocalStorage.getItem('TENFOLD_SESSION');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },
  _writeSession() {
    try {
      const data = JSON.stringify({user:this.user, selectedHero:this.selectedHero});
      safeLocalStorage.setItem('TENFOLD_SESSION', data);
    } catch (e) {}
  },
  login(data) { this.user = data; this._writeSession(); },
  isAdmin() { return !!(this.user && this.user.isAdmin); },
  logout() { this.user=null; this.selectedHero=null; safeLocalStorage.removeItem('TENFOLD_SESSION'); window.location.href='index.html'; },
  loadUser() {
    if (this.user) return this.user;
    const saved=this._readSession();
    if (saved && saved.user) { this.user=saved.user; this.selectedHero=saved.selectedHero||null; }
    return this.user;
  },
  requireLogin() {
    if (!this.loadUser()) { window.location.href='index.html'; return false; }
    return true;
  },
  selectHero(id) { this.selectedHero=id; this.loadUser(); this._writeSession(); },
  getSelectedHero() {
    if (this.selectedHero) return this.selectedHero;
    const saved=this._readSession();
    if (saved && saved.selectedHero) { this.selectedHero=saved.selectedHero; return this.selectedHero; }
    return null;
  },

  // Fetch the authoritative TotalScore directly from Google Sheets.
  // This prevents a stale local/session score from remaining visible.
  async syncScore() {
    this.loadUser();
    if (!this.user || !this.user.userID) return null;

    try {
      const res = await apiCall({ action: 'getScore', userID: this.user.userID }, 6500);
      if (res && res.success && res.totalScore !== undefined) {
        const score = Math.max(0, parseInt(res.totalScore, 10) || 0);
        this.user.totalScore = score;
        this._writeSession();
        try {
          safeLocalStorage.setItem('tenfold_score_cache_' + this.user.userID, String(score));
          safeLocalStorage.setItem('tenfold_score_cache', String(score));
        } catch (_) {}
        return score;
      }
    } catch (_) {}
    return null;
  }
};

// ── API HELPER ────────────────────────────────────────────────
function apiCall(params, timeoutMs = 6500) {
  return new Promise((resolve) => {
    if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      resolve({ success: false, message: 'API not configured.' });
      return;
    }

    // MIT App Inventor WebViewer can block normal fetch/CORS requests.
    // JSONP uses a normal <script> request and works in WebViewer.
    const callbackName = '__tfl_jsonp_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    const url = new URL(API_URL);

    Object.entries(params || {}).forEach(([k, v]) => {
      url.searchParams.append(k, v == null ? '' : String(v));
    });
    url.searchParams.set('callback', callbackName);

    let finished = false;
    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
    };
    const finish = (result) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result && typeof result === 'object'
        ? result
        : { success: false, message: 'Invalid server response.' });
    };

    window[callbackName] = finish;
    script.async = true;

    try {
      script.src = url.toString();
    } catch (err) {
      finish({
        success: false,
        message: 'Invalid Apps Script Web App URL.'
      });
      return;
    }
    script.onerror = () => finish({
      success: false,
      message: 'Cannot connect to Google Sheets. Check your Apps Script Web App deployment and internet connection.'
    });

    // Never leave the MIT App Inventor WebViewer waiting forever.
    setTimeout(() => {
      if (!finished) finish({
        success: false,
        timeout: true,
        message: 'Connection timed out. Make sure the Apps Script Web App is deployed as Anyone.'
      });
    }, timeoutMs);

    document.head.appendChild(script);
  });
}

// ── STAT SCALING ──────────────────────────────────────────────
function getScaledStats(heroId, level = 1) {
  const entity = HEROES[heroId] || STORY_ENEMIES[heroId];
  const base = entity.stats;
  const mult = 1 + (level - 1) * 0.08;
  return {
    hp:   Math.floor(base.hp   * mult),
    atk:  Math.floor(base.atk  * mult),
    def:  Math.floor(base.def  * mult),
    spd:  Math.floor(base.spd  * mult),
    crit: Math.min(base.crit + (level - 1), 50)
  };
}

// ── ELEMENT COLOR MAP ─────────────────────────────────────────
const ELEMENT_COLORS = {
  Fire:      '#ff4500',
  Ice:       '#00cfff',
  Lightning: '#ffe600',
  Earth:     '#a0522d',
  Light:     '#c8a8ff',
  Dark:      '#9932cc',
  Water:     '#00bfff',
  Metal:     '#c0c0c0',
  Arcane:    '#ff88ff',
  Wind:      '#88ffcc'
};

// ── ELEMENT ICONS ─────────────────────────────────────────────
const ELEMENT_ICONS = {
  Fire:'🔥', Ice:'❄️', Lightning:'⚡', Earth:'🌍',
  Light:'✨', Dark:'🌑', Water:'💧', Metal:'⚙️',
  Arcane:'🔮', Wind:'🌪️'
};

// ── UTILITY ───────────────────────────────────────────────────
function formatNumber(n) {
  // TotalScore is an exact integer from Google Sheets.
  // NEVER abbreviate 1850 as 1.9K. Every score UI uses this formatter.
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return String(Math.trunc(v));
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Auto-load user on every page
Game.loadUser();
