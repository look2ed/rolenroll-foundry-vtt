const fields = foundry.data.fields;

const ATTRIBUTE_KEYS = [
  "strength",
  "dexterity",
  "toughness",
  "intellect",
  "aptitude",
  "sanity",
  "charm",
  "rhetoric",
  "ego"
];

const ATTRIBUTE_CODES = {
  str: "strength",
  dex: "dexterity",
  tou: "toughness",
  int: "intellect",
  apt: "aptitude",
  san: "sanity",
  cha: "charm",
  rhe: "rhetoric",
  ego: "ego"
};

const GENERAL_ABILITY_GROUPS = [
  {
    key: "academic",
    skills: [
      { key: "general-education", attr: "int" },
      { key: "search", attr: "apt" },
      { key: "history", attr: "int" },
      { key: "art", attr: "dex", altAttr: "int" },
      { key: "medicine", attr: "int" },
      { key: "herb", attr: "int" },
      { key: "first-aid", attr: "apt" },
      { key: "law", attr: "int" },
      { key: "electronic", attr: "int" },
      { key: "mechanical", attr: "int" },
      { key: "craft", attr: "dex" }
    ]
  },
  {
    key: "intuition-trained",
    skills: [
      { key: "occult", attr: "san" },
      { key: "perception", attr: "dex" },
      { key: "hide-seek", attr: "dex" },
      { key: "persuade", attr: "rhe" },
      { key: "consider", attr: "ego" },
      { key: "empathy", attr: "apt" },
      { key: "bet", attr: "rhe" },
      { key: "sense-of-lie", attr: "apt" },
      { key: "intimidate", attr: "cha" },
      { key: "survival", attr: "apt" }
    ]
  },
  {
    key: "physical",
    skills: [
      { key: "climb", attr: "str" },
      { key: "stealth", attr: "dex" },
      { key: "brawl", attr: "str", altAttr: "dex" },
      { key: "weapons", attr: "str" },
      { key: "sword-play", attr: "dex" },
      { key: "throwing", attr: "str" },
      { key: "shooting-weapon", attr: "dex" },
      { key: "reflex", attr: "dex" },
      { key: "larceny", attr: "dex" },
      { key: "athlete", attr: "str" }
    ]
  }
];

const GENERAL_SKILLS = GENERAL_ABILITY_GROUPS.flatMap((group) => group.skills);
const EXTRA_SKILL_SLOTS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve"
];
const EQUIPMENT_ENTRY_SLOTS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight"
];
const INVENTORY_ITEM_SLOTS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve"
];
const EQUIPMENT_LOCATIONS = ["left", "right", "wearing"];
const STATUS_SLOTS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve"
];
const STATUS_CATEGORIES = ["buff", "injuries", "flaw", "psychiatric"];
const STATUS_DURATION_KINDS = ["permanent", "temporary"];
const STATUS_DURATION_MODES = ["turns", "skill-check"];
const ROLENROLL_DICE_SYSTEM_ID = "rolenroll";
const registeredRolenrollDiceSystems = new Set();

const FALLBACK_LOCALIZATION = {
  "Cancel": "Cancel",
  "ROLENROLL.Action.Edit": "Edit",
  "ROLENROLL.Action.Roll": "Roll",
  "ROLENROLL.Action.RollD6": "Roll",
  "ROLENROLL.Action.Remove": "Remove",
  "ROLENROLL.Actor.Name": "Character Name",
  "ROLENROLL.Attribute.aptitude": "Aptitude",
  "ROLENROLL.Attribute.charm": "Charm",
  "ROLENROLL.Attribute.dexterity": "Dexterity",
  "ROLENROLL.Attribute.ego": "Ego",
  "ROLENROLL.Attribute.intellect": "Intellect",
  "ROLENROLL.Attribute.rhetoric": "Rhetoric",
  "ROLENROLL.Attribute.sanity": "Sanity",
  "ROLENROLL.Attribute.strength": "Strength",
  "ROLENROLL.Attribute.toughness": "Toughness",
  "ROLENROLL.AttributeCode.aptitude": "APT",
  "ROLENROLL.AttributeCode.charm": "CHA",
  "ROLENROLL.AttributeCode.dexterity": "DEX",
  "ROLENROLL.AttributeCode.ego": "EGO",
  "ROLENROLL.AttributeCode.intellect": "INT",
  "ROLENROLL.AttributeCode.rhetoric": "RHE",
  "ROLENROLL.AttributeCode.sanity": "SAN",
  "ROLENROLL.AttributeCode.strength": "STR",
  "ROLENROLL.AttributeCode.toughness": "TOU",
  "ROLENROLL.AbilityGroup.academic": "Academic",
  "ROLENROLL.AbilityGroup.intuition-trained": "Intuition & Trained",
  "ROLENROLL.AbilityGroup.physical": "Physical Skills",
  "ROLENROLL.ExtraSkill.Add": "+ Add Extra Skill",
  "ROLENROLL.ExtraSkill.Details": "Details",
  "ROLENROLL.ExtraSkill.Empty": "No extra skills yet.",
  "ROLENROLL.ExtraSkill.Edit": "Edit Extra Skill",
  "ROLENROLL.ExtraSkill.LinkedStats": "Linked Stats",
  "ROLENROLL.ExtraSkill.Name": "Extra Skill",
  "ROLENROLL.ExtraSkill.NoSlots": "No empty extra skill slots are available.",
  "ROLENROLL.ExtraSkill.Save": "Save Extra Skill",
  "ROLENROLL.ExtraSkill.Untitled": "Extra Skill Roll",
  "ROLENROLL.Inventory.AddGear": "+ Add Gear",
  "ROLENROLL.Inventory.AddItem": "+ Add Item",
  "ROLENROLL.Inventory.Details": "Details",
  "ROLENROLL.Inventory.Damage": "Damage",
  "ROLENROLL.Inventory.Charge": "Charge",
  "ROLENROLL.Inventory.Defense": "DEF",
  "ROLENROLL.Inventory.Equipment": "Equipment",
  "ROLENROLL.Inventory.EditGear": "Edit Gear",
  "ROLENROLL.Inventory.EditItem": "Edit Item",
  "ROLENROLL.Inventory.GearName": "Gear",
  "ROLENROLL.Inventory.ItemName": "Item",
  "ROLENROLL.Inventory.Items": "Inventory",
  "ROLENROLL.Inventory.Location": "Location",
  "ROLENROLL.Inventory.Location.left": "Left",
  "ROLENROLL.Inventory.Location.right": "Right",
  "ROLENROLL.Inventory.Location.wearing": "Wearing",
  "ROLENROLL.Inventory.NoEquipment": "No equipment yet.",
  "ROLENROLL.Inventory.NoEquipmentSlots": "No empty equipment slots are available.",
  "ROLENROLL.Inventory.NoItems": "No inventory items yet.",
  "ROLENROLL.Inventory.NoItemSlots": "No empty inventory item slots are available.",
  "ROLENROLL.Inventory.Quantity": "Qty",
  "ROLENROLL.Inventory.SaveGear": "Save Gear",
  "ROLENROLL.Inventory.SaveItem": "Save Item",
  "ROLENROLL.Inventory.Toughness": "TOU",
  "ROLENROLL.Inventory.UntitledItem": "Inventory Item",
  "ROLENROLL.Inventory.Use": "Use",
  "ROLENROLL.Inventory.UseEmpty": "{item} has no quantity left.",
  "ROLENROLL.Inventory.UsedItem": "Used {item}",
  "ROLENROLL.Profile.Age": "Age",
  "ROLENROLL.Profile.Background": "Character Background",
  "ROLENROLL.Profile.Exp": "EXP",
  "ROLENROLL.Profile.Gender": "Gender",
  "ROLENROLL.Profile.Level": "Lv.",
  "ROLENROLL.Profile.Race": "Race",
  "ROLENROLL.Profile.WillSource": "Source of Will Power",
  "ROLENROLL.Resource.Defense": "Defense",
  "ROLENROLL.Resource.Health": "Health",
  "ROLENROLL.Resource.Mental": "Mental",
  "ROLENROLL.Resource.Willpower": "Willpower",
  "ROLENROLL.Roll.Attribute": "{attribute} Roll",
  "ROLENROLL.Roll.AttributeSucceed": "+1 Succeed",
  "ROLENROLL.Roll.AddSpecialDie": "+ Add Special Die",
  "ROLENROLL.Roll.Base": "Base",
  "ROLENROLL.Roll.BoardDice": "Role & Roll Dice",
  "ROLENROLL.Roll.InvalidSpecialDice": "Invalid special dice token: \"{token}\". Use aX or nY, for example a1 or n2.",
  "ROLENROLL.Roll.InvalidSpecialDiceJson": "Invalid special dice data. Please remove and add the special dice again.",
  "ROLENROLL.Roll.Label": "Label",
  "ROLENROLL.Roll.Manual": "Manual Roll",
  "ROLENROLL.Roll.NoDice": "This roll needs at least 1 die.",
  "ROLENROLL.Roll.NoSpecialDice": "None",
  "ROLENROLL.Roll.Penalty": "Penalty",
  "ROLENROLL.Roll.RerollButton": "Reroll",
  "ROLENROLL.Roll.RerollPrompt": "Reroll {count} dice.",
  "ROLENROLL.Roll.RerollRound": "reroll {round}",
  "ROLENROLL.Roll.RerollTitle": "Reroll",
  "ROLENROLL.Roll.Rerolls": "R&R",
  "ROLENROLL.Roll.SpecialDice": "Special dice",
  "ROLENROLL.Roll.SpecialDie": "Special die",
  "ROLENROLL.Roll.SpecialDiceHint": "Use old roller syntax: a1-a4 for plus dice, n1-n4 for negative dice.",
  "ROLENROLL.Roll.Succeed": "Succeed",
  "ROLENROLL.Roll.SucceedPenalty": "Succeed / Penalty",
  "ROLENROLL.Roll.Tokens": "+/- dice",
  "ROLENROLL.Roll.TooManyDice": "RolEnRoll: Too many dice requested (max 50).",
  "ROLENROLL.Roll.TooManySpecialDice": "Number of special dice cannot be more than total dice.",
  "ROLENROLL.Roll.Total": "Total",
  "ROLENROLL.Roll.TotalDice": "Total dice",
  "ROLENROLL.Skill.art": "Art",
  "ROLENROLL.Skill.athlete": "Athlete",
  "ROLENROLL.Skill.bet": "Bet",
  "ROLENROLL.Skill.brawl": "Brawl",
  "ROLENROLL.Skill.climb": "Climb",
  "ROLENROLL.Skill.consider": "Consider",
  "ROLENROLL.Skill.craft": "Craft",
  "ROLENROLL.Skill.electronic": "Electronic",
  "ROLENROLL.Skill.empathy": "Empathy",
  "ROLENROLL.Skill.first-aid": "First Aid",
  "ROLENROLL.Skill.general-education": "General Education",
  "ROLENROLL.Skill.herb": "Herb",
  "ROLENROLL.Skill.hide-seek": "Hide & Seek",
  "ROLENROLL.Skill.history": "History",
  "ROLENROLL.Skill.intimidate": "Intimidate",
  "ROLENROLL.Skill.larceny": "Larceny",
  "ROLENROLL.Skill.law": "Law",
  "ROLENROLL.Skill.mechanical": "Mechanical",
  "ROLENROLL.Skill.medicine": "Medicine",
  "ROLENROLL.Skill.occult": "Occult",
  "ROLENROLL.Skill.perception": "Perception",
  "ROLENROLL.Skill.persuade": "Persuade",
  "ROLENROLL.Skill.reflex": "Reflex",
  "ROLENROLL.Skill.search": "Search",
  "ROLENROLL.Skill.sense-of-lie": "Sense of Lie",
  "ROLENROLL.Skill.shooting-weapon": "Shooting Weapon",
  "ROLENROLL.Skill.stealth": "Stealth",
  "ROLENROLL.Skill.survival": "Survival",
  "ROLENROLL.Skill.sword-play": "Sword Play",
  "ROLENROLL.Skill.throwing": "Throwing",
  "ROLENROLL.Skill.weapons": "Weapons",
  "ROLENROLL.Status.Add": "+ Add Status",
  "ROLENROLL.Status.Buffs": "Buffs",
  "ROLENROLL.Status.Category": "Category",
  "ROLENROLL.Status.Category.buff": "Buff",
  "ROLENROLL.Status.Category.flaw": "Flaw",
  "ROLENROLL.Status.Category.injuries": "Injuries & Disorders",
  "ROLENROLL.Status.Category.psychiatric": "Psychiatric Disorder",
  "ROLENROLL.Status.Debuffs": "Debuffs",
  "ROLENROLL.Status.Details": "Details",
  "ROLENROLL.Status.Duration": "Duration",
  "ROLENROLL.Status.Duration.permanent": "Permanent",
  "ROLENROLL.Status.Duration.skill-check": "Pass skill check",
  "ROLENROLL.Status.Duration.temporary": "Temporary",
  "ROLENROLL.Status.Duration.turns": "Turns",
  "ROLENROLL.Status.Duration.turnsText": "{turns} turn(s)",
  "ROLENROLL.Status.Edit": "Edit Status",
  "ROLENROLL.Status.Name": "Name",
  "ROLENROLL.Status.NoBuffs": "No buffs yet.",
  "ROLENROLL.Status.NoDebuffs": "No debuffs yet.",
  "ROLENROLL.Status.NoSlots": "No empty status slots are available.",
  "ROLENROLL.Status.Save": "Save Status",
  "ROLENROLL.Status.Turns": "Turns",
  "ROLENROLL.Status.TurnsLeft": "{turns} turn(s) left",
  "ROLENROLL.Status.Untitled": "Status",
  "ROLENROLL.Status.Until": "Until",
  "ROLENROLL.Tab.Attributes": "Attributes",
  "ROLENROLL.Tab.ExtraSkill": "Extra Skill",
  "ROLENROLL.Tab.GeneralAbility": "General Ability",
  "ROLENROLL.Tab.Inventory": "Inventory",
  "ROLENROLL.Tab.More": "More",
  "ROLENROLL.Tab.Status": "Status"
};

function localize(key, data = {}) {
  const translated = game.i18n?.localize?.(key);
  const template = translated && translated !== key ? translated : FALLBACK_LOCALIZATION[key] ?? key;
  return String(template).replace(/\{([^}]+)\}/g, (match, name) => data[name] ?? match);
}

function clamp(value, min, max) {
  const number = Number(value ?? 0);
  const safeNumber = Number.isNaN(number) ? 0 : number;
  return Math.max(min, Math.min(max, safeNumber));
}

function buildDieFaces(config = {}) {
  const kind = config.kind ?? "normal";
  const faces = ["1", "", "", "", "", "R"];

  if (kind === "custom" && Array.isArray(config.faces)) {
    const customFaces = config.faces.slice(0, 6).map((face) => {
      if (face === "1" || face === "R" || face === "+" || face === "-") return face;
      return "";
    });
    while (customFaces.length < 6) customFaces.push("");
    customFaces[0] = "1";
    customFaces[5] = "R";
    return customFaces;
  }

  if (kind === "adv") {
    const plusCount = clamp(config.plusCount ?? 1, 1, 4);
    for (let i = 0; i < plusCount; i++) faces[1 + i] = "+";
  } else if (kind === "neg") {
    const minusCount = clamp(config.minusCount ?? 1, 1, 4);
    for (let i = 0; i < minusCount; i++) faces[1 + i] = "-";
  }

  return faces;
}

function faceForRoll(config, value) {
  const faces = buildDieFaces(config);
  return faces[clamp(value, 1, 6) - 1];
}

function scoreFaces(faces) {
  let basePoints = 0;
  let plusCount = 0;
  let minusCount = 0;
  let rerollCount = 0;

  for (const face of faces) {
    if (face === "1") {
      basePoints++;
    } else if (face === "R") {
      basePoints++;
      rerollCount++;
    } else if (face === "+") {
      plusCount++;
    } else if (face === "-") {
      minusCount++;
    }
  }

  let total = 0;
  if (basePoints > 0) total = Math.max(0, basePoints + plusCount - minusCount);

  return { basePoints, plusCount, minusCount, rerollCount, total };
}

function parseSpecialDice(specialDice) {
  const configs = [];
  const trimmed = String(specialDice || "").trim();
  if (!trimmed) return configs;

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) throw new Error("Expected an array");

      return parsed.map((entry) => {
        if (entry?.kind === "custom" && Array.isArray(entry.faces)) {
          return { kind: "custom", faces: buildDieFaces(entry) };
        }
        if (entry?.kind === "adv") return { kind: "adv", plusCount: entry.plusCount };
        if (entry?.kind === "neg") return { kind: "neg", minusCount: entry.minusCount };
        return { kind: "normal" };
      });
    } catch (error) {
      throw new Error(localize("ROLENROLL.Roll.InvalidSpecialDiceJson"));
    }
  }

  const tokens = trimmed
    .split(/[, ]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    let match = token.match(/^a(\d+)$/i);
    if (match) {
      configs.push({ kind: "adv", plusCount: parseInt(match[1], 10) });
      continue;
    }

    match = token.match(/^n(\d+)$/i);
    if (match) {
      configs.push({ kind: "neg", minusCount: parseInt(match[1], 10) });
      continue;
    }

    throw new Error(localize("ROLENROLL.Roll.InvalidSpecialDice", { token }));
  }

  return configs;
}

function getRolenrollFaceLabel(face) {
  if (face === "1") return "●";
  if (face === "R") return "R";
  if (face === "+") return "+";
  if (face === "-") return "-";
  return "";
}

function getRolenrollDiceAppearance(face) {
  if (face === "+") {
    return {
      background: "#e6f3df",
      foreground: "#315322",
      outline: "#f7fff3",
      edge: "#598345"
    };
  }

  if (face === "-") {
    return {
      background: "#f5dfdc",
      foreground: "#71352e",
      outline: "#fff6f4",
      edge: "#9a5047"
    };
  }

  if (face === "1" || face === "R") {
    return {
      background: "#dcebea",
      foreground: "#173a3f",
      outline: "#f7ffff",
      edge: "#23545a"
    };
  }

  return {
    background: "#fffdf7",
    foreground: "#fffdf7",
    outline: "#fffdf7",
    edge: "#a9a291"
  };
}

function getRolenrollDieLabels(config) {
  return buildDieFaces(config).map(getRolenrollFaceLabel);
}

function getRolenrollResultDisplayLabels(face) {
  const label = getRolenrollFaceLabel(face);
  return Array.from({ length: 6 }, () => label);
}

function getRolenrollLabelSlug(label) {
  if (label === "●") return "dot";
  if (label === "R") return "reroll";
  if (label === "+") return "plus";
  if (label === "-") return "minus";
  return "blank";
}

function getRolenrollDiceSystemId(labels) {
  const slug = labels.map(getRolenrollLabelSlug).join("-");
  return `${ROLENROLL_DICE_SYSTEM_ID}-${slug}`;
}

function ensureRolenrollDicePreset(labels, dice3d = game.dice3d) {
  if (!dice3d?.addSystem || !dice3d?.addDicePreset) return null;

  const system = getRolenrollDiceSystemId(labels);
  if (registeredRolenrollDiceSystems.has(system)) return system;

  try {
    dice3d.addSystem({ id: system, name: "Role & Roll" }, "default");
    dice3d.addDicePreset({
      type: "d6",
      labels,
      system,
      font: "Arial Black",
      fontScale: 1.15
    }, "d6");
    registeredRolenrollDiceSystems.add(system);
    return system;
  } catch (error) {
    console.warn("RolEnRoll | Dice So Nice preset registration failed.", error);
    return null;
  }
}

function registerRolenrollDicePresets(dice3d) {
  if (!dice3d?.addSystem || !dice3d?.addDicePreset) return;

  const middleFaces = ["", "+", "-"];
  const combinations = [];

  for (const face of ["1", "R", "+", "-", ""]) {
    combinations.push(getRolenrollResultDisplayLabels(face));
  }

  for (const faceTwo of middleFaces) {
    for (const faceThree of middleFaces) {
      for (const faceFour of middleFaces) {
        for (const faceFive of middleFaces) {
          combinations.push(["●", faceTwo, faceThree, faceFour, faceFive, "R"]);
        }
      }
    }
  }

  for (const labels of combinations) ensureRolenrollDicePreset(labels, dice3d);
}

function showDiceSoNiceOnly(round) {
  if (!game.dice3d?.show) return;

  const dice = round.map((die) => {
    const labels = getRolenrollResultDisplayLabels(die.face);
    const system = ensureRolenrollDicePreset(labels);
    return {
      result: die.roll,
      resultLabel: getRolenrollFaceLabel(die.face),
      labels,
      type: "d6",
      ...(system ? { system } : {}),
      vectors: [],
      options: {
        appearance: {
          ...getRolenrollDiceAppearance(die.face),
          ...(system ? { system } : {})
        }
      }
    };
  });

  try {
    Promise.resolve(game.dice3d.show({ throws: [{ dice }] }, game.user, false, null, false))
      .catch((error) => {
        console.warn("RolEnRoll | Dice So Nice animation failed.", error);
      });
  } catch (error) {
    console.warn("RolEnRoll | Dice So Nice animation failed.", error);
  }
}

function getRollValues(roll) {
  return roll.dice.flatMap((die) => die.results.map((result) => result.result));
}

function confirmReroll(count) {
  return new Promise((resolve) => {
    new Dialog({
      title: localize("ROLENROLL.Roll.RerollTitle"),
      content: `<p>${localize("ROLENROLL.Roll.RerollPrompt", { count })}</p>`,
      buttons: {
        reroll: {
          label: localize("ROLENROLL.Roll.RerollButton"),
          callback: () => resolve(true)
        }
      },
      close: () => resolve(true),
      default: "reroll"
    }).render(true);
  });
}

async function rollRolenrollPool(dice) {
  const rounds = [];
  let current = dice.map((config) => ({ config }));
  let safety = 0;

  while (current.length > 0 && safety < 100) {
    safety++;

    const thisRound = [];
    const next = [];

    const roll = await new Roll(`${current.length}d6`).evaluate();
    const values = getRollValues(roll);

    for (const [index, { config }] of current.entries()) {
      const value = values[index] ?? 1;
      const face = faceForRoll(config, value);
      thisRound.push({ config, roll: value, face });

      if (face === "R") next.push({ config: { ...config } });
    }

    showDiceSoNiceOnly(thisRound);
    rounds.push(thisRound);

    if (next.length > 0) await confirmReroll(next.length);
    current = next;
  }

  const baseFaces = rounds[0]?.map((result) => result.face) ?? [];
  const rerollFaces = rounds.slice(1).flat().map((result) => result.face);
  const allFaces = baseFaces.concat(rerollFaces);
  const scoring = scoreFaces(allFaces);

  return {
    rounds,
    scoring,
    baseScore: baseFaces.reduce((sum, face) => sum + (face === "1" || face === "R" ? 1 : 0), 0),
    rerollPoints: rerollFaces.reduce((sum, face) => sum + (face === "1" || face === "R" ? 1 : 0), 0),
    plusTokens: allFaces.filter((face) => face === "+").length,
    minusTokens: allFaces.filter((face) => face === "-").length,
    rerollCount: allFaces.filter((face) => face === "R").length
  };
}

function faceToDieHtml(face) {
  if (face === "1") return '<span class="role-roll-die role-roll-face-point">&bull;</span>';
  if (face === "R") return '<span class="role-roll-die role-roll-face-reroll">&#9415;</span>';
  if (face === "+") return '<span class="role-roll-die role-roll-face-plus">+</span>';
  if (face === "-") return '<span class="role-roll-die role-roll-face-minus">&minus;</span>';
  return '<span class="role-roll-die role-roll-face-blank">&nbsp;</span>';
}

function formatSpecialDiceSummary(specialDice) {
  let configs;
  try {
    configs = parseSpecialDice(specialDice);
  } catch (error) {
    return escapeHtml(specialDice);
  }

  const labels = configs.map((config) => {
    const faces = buildDieFaces(config);
    const plusCount = faces.filter((face) => face === "+").length;
    const minusCount = faces.filter((face) => face === "-").length;
    const parts = [];
    if (plusCount) parts.push(`+${plusCount}`);
    if (minusCount) parts.push(`-${minusCount}`);
    return parts.length ? parts.join(" / ") : localize("ROLENROLL.Roll.SpecialDie");
  });

  return labels.length ? labels.map(escapeHtml).join(", ") : localize("ROLENROLL.Roll.NoSpecialDice");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildRollMessage({ label, totalDice, specialDice, success, penalty, result }) {
  const diceRows = result.rounds.map((round, index) => {
    const labelHtml = index === 0 ? "" : `<em>${localize("ROLENROLL.Roll.RerollRound", { round: index })}</em>`;
    const diceHtml = round.map((roll) => faceToDieHtml(roll.face)).join("");
    return `<div class="role-roll-dice-row">${labelHtml}${diceHtml}</div>`;
  }).join("");
  const diceTotal = result.scoring.total;
  const finalTotal = Math.max(0, diceTotal + success - penalty);
  const specialText = specialDice ? formatSpecialDiceSummary(specialDice) : localize("ROLENROLL.Roll.NoSpecialDice");

  return `
    <div class="role-roll-chat">
      <div class="role-roll-header"><strong>${escapeHtml(label)}</strong></div>
      ${diceRows}
      <dl class="role-roll-summary">
        <div><dt>${localize("ROLENROLL.Roll.TotalDice")}</dt><dd>${totalDice}</dd></div>
        <div><dt>${localize("ROLENROLL.Roll.SpecialDice")}</dt><dd>${specialText}</dd></div>
        <div><dt>${localize("ROLENROLL.Roll.Base")}</dt><dd>${result.baseScore}</dd></div>
        <div><dt>${localize("ROLENROLL.Roll.Rerolls")}</dt><dd>${result.rerollCount} (+${result.rerollPoints})</dd></div>
        <div><dt>${localize("ROLENROLL.Roll.Tokens")}</dt><dd>+${result.plusTokens} / -${result.minusTokens}</dd></div>
        <div><dt>${localize("ROLENROLL.Roll.SucceedPenalty")}</dt><dd>+${success} / -${penalty}</dd></div>
        <div class="role-roll-total"><dt>${localize("ROLENROLL.Roll.Total")}</dt><dd>${finalTotal}</dd></div>
      </dl>
    </div>
  `;
}

function buildDots(value, max = 6) {
  return Array.from({ length: max }, (_, index) => ({
    value: index + 1,
    active: index < value
  }));
}

function parseSpecialDiceFaces(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || !trimmed.startsWith("[")) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => buildDieFaces(entry))
      .filter((faces) => faces.length === 6);
  } catch (error) {
    return [];
  }
}

function buildSpecialDiceValue(diceFaces) {
  return diceFaces.length
    ? JSON.stringify(diceFaces.map((faces) => ({ kind: "custom", faces: buildDieFaces({ kind: "custom", faces }) })))
    : "";
}

function getSpecialFaceDisplay(face, index) {
  if (index === 0 || face === "1") return "•";
  if (face === "R") return "Ⓡ";
  if (face === "+") return "+";
  if (face === "-") return "-";
  return "";
}

function getSpecialFaceClass(face) {
  if (face === "1") return "is-point";
  if (face === "R") return "is-reroll";
  if (face === "+") return "is-plus";
  if (face === "-") return "is-minus";
  return "is-blank";
}

function buildSpecialDicePreviewHtml(specialDice) {
  const specialDiceFaces = parseSpecialDiceFaces(specialDice);
  return specialDiceFaces.length
    ? specialDiceFaces.map((faces, dieIndex) => `
      <div class="special-die-card">
        <div class="special-die-card-faces">
          ${faces.map((face, faceIndex) => `
            <button
              type="button"
              class="special-die-face ${getSpecialFaceClass(face)}"
              data-roll-special-die-face="${dieIndex}:${faceIndex}"
              ${faceIndex === 0 || faceIndex === 5 ? "disabled" : ""}
            >${getSpecialFaceDisplay(face, faceIndex)}</button>
          `).join("")}
        </div>
        <button type="button" data-roll-remove-special-die="${dieIndex}">${localize("ROLENROLL.Action.Remove")}</button>
      </div>
    `).join("")
    : `<p class="special-dice-empty">${localize("ROLENROLL.Roll.NoSpecialDice")}</p>`;
}

function renderRollSpecialDiceBuilder(form, specialDiceValue) {
  const input = form.querySelector('[name="specialDice"]');
  const list = form.querySelector("[data-roll-special-dice-list]");
  if (input) input.value = specialDiceValue;
  if (list) list.innerHTML = buildSpecialDicePreviewHtml(specialDiceValue);
}

function activateRollSpecialDiceBuilder(form, getSpecialDiceValue, setSpecialDiceValue) {
  form.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-roll-add-special-die]");
    const removeButton = event.target.closest("[data-roll-remove-special-die]");
    const faceButton = event.target.closest("[data-roll-special-die-face]");

    if (addButton) {
      event.preventDefault();
      const diceFaces = parseSpecialDiceFaces(getSpecialDiceValue());
      diceFaces.push(["1", "", "", "", "", "R"]);
      const nextSpecialDiceValue = buildSpecialDiceValue(diceFaces);
      setSpecialDiceValue(nextSpecialDiceValue);
      renderRollSpecialDiceBuilder(form, nextSpecialDiceValue);
      return;
    }

    if (removeButton) {
      event.preventDefault();
      const dieIndex = Number(removeButton.dataset.rollRemoveSpecialDie ?? -1);
      const diceFaces = parseSpecialDiceFaces(getSpecialDiceValue());
      if (!Number.isInteger(dieIndex) || dieIndex < 0 || dieIndex >= diceFaces.length) return;

      diceFaces.splice(dieIndex, 1);
      const nextSpecialDiceValue = buildSpecialDiceValue(diceFaces);
      setSpecialDiceValue(nextSpecialDiceValue);
      renderRollSpecialDiceBuilder(form, nextSpecialDiceValue);
      return;
    }

    if (faceButton) {
      event.preventDefault();
      const [dieIndexText, faceIndexText] = String(faceButton.dataset.rollSpecialDieFace || "").split(":");
      const dieIndex = Number(dieIndexText);
      const faceIndex = Number(faceIndexText);
      if (!Number.isInteger(dieIndex) || !Number.isInteger(faceIndex) || faceIndex < 1 || faceIndex > 4) return;

      const diceFaces = parseSpecialDiceFaces(getSpecialDiceValue());
      if (!diceFaces[dieIndex]) return;

      const current = diceFaces[dieIndex][faceIndex] || "";
      diceFaces[dieIndex][faceIndex] = current === "" ? "+" : current === "+" ? "-" : "";
      const nextSpecialDiceValue = buildSpecialDiceValue(diceFaces);
      setSpecialDiceValue(nextSpecialDiceValue);
      renderRollSpecialDiceBuilder(form, nextSpecialDiceValue);
    }
  });
}

function getAttributeValue(actor, codeOrKey) {
  const key = ATTRIBUTE_CODES[codeOrKey] ?? codeOrKey;
  return Number(actor.system.attributes?.[key] ?? 0) || 0;
}

function getChosenAttribute(actor, skill) {
  const primaryKey = ATTRIBUTE_CODES[skill.attr] ?? skill.attr;
  const altKey = ATTRIBUTE_CODES[skill.altAttr] ?? skill.altAttr;
  if (!altKey) return primaryKey;

  const primary = getAttributeValue(actor, primaryKey);
  const alt = getAttributeValue(actor, altKey);
  return alt > primary ? altKey : primaryKey;
}

function getSkillRollParts(actor, skillKey) {
  const skill = GENERAL_SKILLS.find((entry) => entry.key === skillKey);
  if (!skill) return { dice: 0, successKeys: [] };

  const skillDice = Number(actor.system.skills?.[skillKey] ?? 0) || 0;
  const chosenAttribute = getChosenAttribute(actor, skill);
  const attributeDice = getAttributeValue(actor, chosenAttribute);
  const successKeys = [];
  if (actor.system.skillBonuses?.[skillKey]) successKeys.push(`skill:${skillKey}`);
  if (actor.system.attributeBonuses?.[chosenAttribute]) successKeys.push(`attribute:${chosenAttribute}`);

  return {
    dice: skillDice + attributeDice,
    successKeys
  };
}

function parseDependencyIds(value) {
  return String(value || "")
    .split(",")
    .map((dependency) => dependency.trim())
    .filter(Boolean);
}

function buildDependencyValue(ids) {
  return Array.from(new Set(ids.filter(Boolean))).join(",");
}

function getDependencyLabel(dependencyId) {
  if (dependencyId.startsWith("attribute:")) {
    const key = dependencyId.slice("attribute:".length);
    return localize(`ROLENROLL.Attribute.${key}`);
  }

  if (dependencyId.startsWith("skill:")) {
    const key = dependencyId.slice("skill:".length);
    return localize(`ROLENROLL.Skill.${key}`);
  }

  return dependencyId;
}

function isEntryActive(entry) {
  return Boolean(
    entry?.active ||
    entry?.name ||
    entry?.details ||
    entry?.damage ||
    entry?.charge ||
    entry?.defense ||
    entry?.toughness
  );
}

function getStatusCategory(value) {
  return STATUS_CATEGORIES.includes(value) ? value : "buff";
}

function getStatusDurationKind(value) {
  return STATUS_DURATION_KINDS.includes(value) ? value : "permanent";
}

function getStatusDurationMode(value) {
  return STATUS_DURATION_MODES.includes(value) ? value : "turns";
}

function getStatusDurationText(entry) {
  const durationKind = getStatusDurationKind(entry.durationKind);
  if (durationKind !== "temporary") return localize("ROLENROLL.Status.Duration.permanent");

  const durationMode = getStatusDurationMode(entry.durationMode);
  if (durationMode === "skill-check") return localize("ROLENROLL.Status.Duration.skill-check");

  return localize("ROLENROLL.Status.Duration.turnsText", {
    turns: Math.max(0, Number(entry.durationTurns ?? 0) || 0)
  });
}

function isTurnStatus(entry) {
  return getStatusDurationMode(entry.durationMode) === "turns";
}

function getDependencyRollParts(actor, dependencyIds) {
  const successKeys = new Set();
  let dice = 0;

  for (const dependencyId of dependencyIds) {
    if (dependencyId.startsWith("attribute:")) {
      const attribute = dependencyId.slice("attribute:".length);
      if (!ATTRIBUTE_KEYS.includes(attribute)) continue;

      dice += getAttributeValue(actor, attribute);
      if (actor.system.attributeBonuses?.[attribute]) successKeys.add(`attribute:${attribute}`);
      continue;
    }

    if (dependencyId.startsWith("skill:")) {
      const skillKey = dependencyId.slice("skill:".length);
      const parts = getSkillRollParts(actor, skillKey);
      dice += parts.dice;
      parts.successKeys.forEach((key) => successKeys.add(key));
    }
  }

  return {
    dice,
    success: successKeys.size
  };
}

class RolenrollCharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new fields.SchemaField({
        strength: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        dexterity: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        toughness: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        intellect: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        aptitude: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        sanity: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        charm: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        rhetoric: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        ego: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        intelligence: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 }),
        charisma: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 6 })
      }),
      profile: new fields.SchemaField({
        level: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        exp: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        expMax: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        gender: new fields.StringField({ required: true, initial: "" }),
        age: new fields.StringField({ required: true, initial: "" }),
        race: new fields.StringField({ required: true, initial: "" }),
        willSource: new fields.StringField({ required: true, initial: "" }),
        background: new fields.StringField({ required: true, initial: "" })
      }),
      attributeBonuses: new fields.SchemaField({
        strength: new fields.BooleanField({ required: true, initial: false }),
        dexterity: new fields.BooleanField({ required: true, initial: false }),
        toughness: new fields.BooleanField({ required: true, initial: false }),
        intellect: new fields.BooleanField({ required: true, initial: false }),
        aptitude: new fields.BooleanField({ required: true, initial: false }),
        sanity: new fields.BooleanField({ required: true, initial: false }),
        charm: new fields.BooleanField({ required: true, initial: false }),
        rhetoric: new fields.BooleanField({ required: true, initial: false }),
        ego: new fields.BooleanField({ required: true, initial: false })
      }),
      skills: new fields.SchemaField(Object.fromEntries(
        GENERAL_SKILLS.map((skill) => [
          skill.key,
          new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 6 })
        ])
      )),
      skillBonuses: new fields.SchemaField(Object.fromEntries(
        GENERAL_SKILLS.map((skill) => [
          skill.key,
          new fields.BooleanField({ required: true, initial: false })
        ])
      )),
      extraSkills: new fields.SchemaField(Object.fromEntries(
        EXTRA_SKILL_SLOTS.map((slot) => [
          slot,
          new fields.SchemaField({
            active: new fields.BooleanField({ required: true, initial: false }),
            name: new fields.StringField({ required: true, initial: "" }),
            points: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 6 }),
            dependencies: new fields.StringField({ required: true, initial: "" }),
            attribute: new fields.StringField({ required: true, initial: "strength" }),
            bonus: new fields.BooleanField({ required: true, initial: false }),
            details: new fields.StringField({ required: true, initial: "" })
          })
        ])
      )),
      resources: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 }),
          max: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 })
        }),
        willpower: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 8, min: 0 }),
          max: new fields.NumberField({ required: true, integer: true, initial: 8, min: 0 })
        }),
        mental: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 12, min: 0 }),
          max: new fields.NumberField({ required: true, integer: true, initial: 12, min: 1, max: 18 })
        })
      }),
      defense: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      roll: new fields.SchemaField({
        success: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        penalty: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        specialDice: new fields.StringField({ required: true, initial: "" })
      }),
      equipment: new fields.StringField({ required: true, initial: "" }),
      equipmentEntries: new fields.SchemaField(Object.fromEntries(
        EQUIPMENT_ENTRY_SLOTS.map((slot) => [
          slot,
          new fields.SchemaField({
            active: new fields.BooleanField({ required: true, initial: false }),
            name: new fields.StringField({ required: true, initial: "" }),
            location: new fields.StringField({ required: true, initial: "wearing", choices: EQUIPMENT_LOCATIONS }),
            damage: new fields.StringField({ required: true, initial: "" }),
            charge: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
            defense: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
            toughness: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
            details: new fields.StringField({ required: true, initial: "" })
          })
        ])
      )),
      inventoryItems: new fields.SchemaField(Object.fromEntries(
        INVENTORY_ITEM_SLOTS.map((slot) => [
          slot,
          new fields.SchemaField({
            active: new fields.BooleanField({ required: true, initial: false }),
            name: new fields.StringField({ required: true, initial: "" }),
            quantity: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
            details: new fields.StringField({ required: true, initial: "" })
          })
        ])
      )),
      statusEffects: new fields.SchemaField(Object.fromEntries(
        STATUS_SLOTS.map((slot) => [
          slot,
          new fields.SchemaField({
            active: new fields.BooleanField({ required: true, initial: false }),
            name: new fields.StringField({ required: true, initial: "" }),
            category: new fields.StringField({ required: true, initial: "buff", choices: STATUS_CATEGORIES }),
            durationKind: new fields.StringField({ required: true, initial: "permanent", choices: STATUS_DURATION_KINDS }),
            durationMode: new fields.StringField({ required: true, initial: "turns", choices: STATUS_DURATION_MODES }),
            durationTurns: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
            details: new fields.StringField({ required: true, initial: "" })
          })
        ])
      )),
      statuses: new fields.StringField({ required: true, initial: "" }),
      notes: new fields.HTMLField({ required: true, initial: "" })
    };
  }
}

class RolenrollActor extends Actor {}
class RolenrollItem extends Item {}

async function performPoolRoll({ label, totalDice, specialDice = "", success = 0, penalty = 0, actor = null }) {
  if (!Number.isFinite(totalDice) || totalDice <= 0) {
    ui.notifications.warn(localize("ROLENROLL.Roll.NoDice"));
    return;
  }

  let specialConfigs;
  try {
    specialConfigs = parseSpecialDice(specialDice);
  } catch (error) {
    ui.notifications.error(error.message);
    return;
  }

  if (specialConfigs.length > totalDice) {
    ui.notifications.warn(localize("ROLENROLL.Roll.TooManySpecialDice"));
    return;
  }

  const dice = [...specialConfigs];
  for (let i = specialConfigs.length; i < totalDice; i++) dice.push({ kind: "normal" });

  if (dice.length > 50) {
    ui.notifications.warn(localize("ROLENROLL.Roll.TooManyDice"));
    return;
  }

  const speaker = actor
    ? ChatMessage.getSpeaker({ actor })
    : ChatMessage.getSpeaker();
  let result;
  try {
    result = await rollRolenrollPool(dice);
  } catch (error) {
    console.error("RolEnRoll | Roll failed.", error);
    ui.notifications.error(error.message ?? String(error));
    return;
  }
  const content = buildRollMessage({ label, totalDice, specialDice, success, penalty, result });

  await ChatMessage.create({ speaker, content });
}

function openManualRoll() {
  let specialDiceValue = "";

  const content = `
    <form class="rolenroll-roll-dialog">
      <div class="form-group">
        <label>${localize("ROLENROLL.Roll.Label")}</label>
        <input type="text" name="label" value="${localize("ROLENROLL.Roll.Manual")}" autofocus>
      </div>
      <div class="form-group">
        <label>${localize("ROLENROLL.Roll.TotalDice")}</label>
        <input type="number" name="totalDice" min="1" max="50" value="5">
      </div>
      <div class="form-group special-dice-builder">
        <div class="special-dice-builder-header">
          <span>${localize("ROLENROLL.Roll.SpecialDice")}</span>
          <button type="button" data-roll-add-special-die>${localize("ROLENROLL.Roll.AddSpecialDie")}</button>
        </div>
        <input type="hidden" name="specialDice" value="">
        <div class="special-dice-list" data-roll-special-dice-list>${buildSpecialDicePreviewHtml("")}</div>
      </div>
      <div class="form-group">
        <label>${localize("ROLENROLL.Roll.Succeed")}</label>
        <input type="number" name="success" min="0" value="0">
      </div>
      <div class="form-group">
        <label>${localize("ROLENROLL.Roll.Penalty")}</label>
        <input type="number" name="penalty" min="0" value="0">
      </div>
    </form>
  `;

  new Dialog({
    title: localize("ROLENROLL.Roll.Manual"),
    content,
    buttons: {
      roll: {
        label: localize("ROLENROLL.Action.Roll"),
        callback: async (html) => {
          const form = html[0]?.querySelector("form");
          const formData = new FormData(form);
          await performPoolRoll({
            label: String(formData.get("label") || localize("ROLENROLL.Roll.Manual")),
            totalDice: parseInt(formData.get("totalDice") ?? "0", 10),
            specialDice: String(formData.get("specialDice") ?? "").trim(),
            success: Math.max(0, Number(formData.get("success") ?? 0) || 0),
            penalty: Math.max(0, Number(formData.get("penalty") ?? 0) || 0)
          });
        }
      },
      cancel: {
        label: localize("Cancel")
      }
    },
    default: "roll",
    render: (html) => {
      const form = html[0]?.querySelector("form");
      if (!form) return;

      activateRollSpecialDiceBuilder(
        form,
        () => specialDiceValue,
        (nextSpecialDiceValue) => {
          specialDiceValue = nextSpecialDiceValue;
        }
      );
    }
  }).render(true);
}

class RolenrollActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["rolenroll", "sheet", "actor"],
      template: "systems/rolenroll/templates/actor/character-sheet.hbs",
      width: 760,
      height: 760,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "attributes"
        }
      ]
    });
  }

  getData(options = {}) {
    const context = super.getData(options);
    context.system = this.actor.system;
    context.attributes = ATTRIBUTE_KEYS.map((key) => {
      const value = Number(this.actor.system.attributes?.[key] ?? 0);
      return {
        key,
        label: localize(`ROLENROLL.Attribute.${key}`),
        code: localize(`ROLENROLL.AttributeCode.${key}`),
        value,
        bonus: Boolean(this.actor.system.attributeBonuses?.[key]),
        dots: buildDots(value)
      };
    });
    context.generalAbilityGroups = GENERAL_ABILITY_GROUPS.map((group) => ({
      key: group.key,
      label: localize(`ROLENROLL.AbilityGroup.${group.key}`),
      skills: group.skills.map((skill) => {
        const value = Number(this.actor.system.skills?.[skill.key] ?? 0);
        const attrKeys = [skill.attr, skill.altAttr].filter(Boolean);
        return {
          ...skill,
          label: localize(`ROLENROLL.Skill.${skill.key}`),
          tag: attrKeys.map((key) => localize(`ROLENROLL.AttributeCode.${ATTRIBUTE_CODES[key] ?? key}`)).join(" / "),
          value,
          bonus: Boolean(this.actor.system.skillBonuses?.[skill.key]),
          dots: buildDots(value)
        };
      })
    }));
    context.attributeOptions = ATTRIBUTE_KEYS.map((key) => ({
      key: `attribute:${key}`,
      label: `${localize(`ROLENROLL.Attribute.${key}`)} (${localize(`ROLENROLL.AttributeCode.${key}`)})`
    }));
    context.generalAbilityOptions = GENERAL_SKILLS.map((skill) => ({
      key: `skill:${skill.key}`,
      label: localize(`ROLENROLL.Skill.${skill.key}`)
    }));
    const allDependencyOptions = context.attributeOptions.concat(context.generalAbilityOptions);
    context.extraSkillSlots = EXTRA_SKILL_SLOTS.map((slot) => {
      const extraSkill = this.actor.system.extraSkills?.[slot] ?? {};
      const dependencies = parseDependencyIds(extraSkill.dependencies);
      const active = Boolean(extraSkill.active || extraSkill.name || extraSkill.points || extraSkill.details || dependencies.length);
      return {
        slot,
        active,
        name: extraSkill.name ?? "",
        points: Number(extraSkill.points ?? 0) || 0,
        bonus: Boolean(extraSkill.bonus),
        details: extraSkill.details ?? "",
        dependencies: buildDependencyValue(dependencies),
        dependencyLabels: dependencies.map(getDependencyLabel),
        dots: buildDots(Number(extraSkill.points ?? 0) || 0),
        dependencyOptions: allDependencyOptions.map((option) => ({
          ...option,
          checked: dependencies.includes(option.key)
        }))
      };
    }).filter((extraSkill) => extraSkill.active);
    context.canAddExtraSkill = context.extraSkillSlots.length < EXTRA_SKILL_SLOTS.length;
    context.equipmentSlots = EQUIPMENT_ENTRY_SLOTS.map((slot) => {
      const entry = this.actor.system.equipmentEntries?.[slot] ?? {};
      const location = EQUIPMENT_LOCATIONS.includes(entry.location) ? entry.location : "wearing";
      return {
        slot,
        active: isEntryActive(entry),
        name: entry.name ?? "",
        location,
        locationLabel: localize(`ROLENROLL.Inventory.Location.${location}`),
        damage: entry.damage ?? "",
        charge: Number(entry.charge ?? 0) || 0,
        defense: Number(entry.defense ?? 0) || 0,
        toughness: Number(entry.toughness ?? 0) || 0,
        details: entry.details ?? "",
        locationOptions: EQUIPMENT_LOCATIONS.map((key) => ({
          key,
          label: localize(`ROLENROLL.Inventory.Location.${key}`),
          selected: key === location
        }))
      };
    }).filter((entry) => entry.active);
    context.canAddEquipment = context.equipmentSlots.length < EQUIPMENT_ENTRY_SLOTS.length;
    context.inventoryItems = INVENTORY_ITEM_SLOTS.map((slot) => {
      const item = this.actor.system.inventoryItems?.[slot] ?? {};
      return {
        slot,
        active: isEntryActive(item),
        name: item.name ?? "",
        quantity: Number(item.quantity ?? 1) || 0,
        details: item.details ?? ""
      };
    }).filter((item) => item.active);
    context.canAddInventoryItem = context.inventoryItems.length < INVENTORY_ITEM_SLOTS.length;
    const statusEntries = STATUS_SLOTS.map((slot) => {
      const entry = this.actor.system.statusEffects?.[slot] ?? {};
      const category = getStatusCategory(entry.category);
      const durationKind = getStatusDurationKind(entry.durationKind);
      const durationMode = getStatusDurationMode(entry.durationMode);
      return {
        slot,
        active: isEntryActive(entry),
        name: entry.name ?? "",
        category,
        categoryLabel: localize(`ROLENROLL.Status.Category.${category}`),
        durationKind,
        durationMode,
        durationTurns: Math.max(0, Number(entry.durationTurns ?? 1) || 0),
        durationText: getStatusDurationText({ ...entry, category, durationKind, durationMode }),
        isTurnStatus: isTurnStatus({ ...entry, durationKind, durationMode }),
        details: entry.details ?? "",
        categoryOptions: STATUS_CATEGORIES.map((key) => ({
          key,
          label: localize(`ROLENROLL.Status.Category.${key}`),
          selected: key === category
        })),
        durationKindOptions: STATUS_DURATION_KINDS.map((key) => ({
          key,
          label: localize(`ROLENROLL.Status.Duration.${key}`),
          selected: key === durationKind
        })),
        durationModeOptions: STATUS_DURATION_MODES.map((key) => ({
          key,
          label: localize(`ROLENROLL.Status.Duration.${key}`),
          selected: key === durationMode
        }))
      };
    }).filter((entry) => entry.active);
    context.statusBuffs = statusEntries.filter((entry) => entry.category === "buff");
    context.statusDebuffs = statusEntries.filter((entry) => entry.category !== "buff");
    context.headerStatuses = statusEntries;
    context.canAddStatus = statusEntries.length < STATUS_SLOTS.length;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-roll-attribute]").on("click", this.#onAttributeRoll.bind(this));
    html.find("[data-attribute-dot]").on("click", this.#onAttributeDot.bind(this));
    html.find("[data-skill-dot]").on("click", this.#onSkillDot.bind(this));
    html.find("[data-roll-skill]").on("click", this.#onSkillRoll.bind(this));
    html.find("[data-extra-skill-dot]").on("click", this.#onExtraSkillDot.bind(this));
    html.find("[data-roll-extra-skill]").on("click", this.#onExtraSkillRoll.bind(this));
    html.find("[data-add-extra-skill]").on("click", this.#onAddExtraSkill.bind(this));
    html.find("[data-edit-extra-skill]").on("click", this.#onEditExtraSkill.bind(this));
    html.find("[data-remove-extra-skill]").on("click", this.#onRemoveExtraSkill.bind(this));
    html.find("[data-extra-skill-dependency]").on("change", this.#onExtraSkillDependency.bind(this));
    html.find("[data-add-equipment]").on("click", this.#onAddEquipment.bind(this));
    html.find("[data-edit-equipment]").on("click", this.#onEditEquipment.bind(this));
    html.find("[data-adjust-equipment-charge]").on("click", this.#onAdjustEquipmentCharge.bind(this));
    html.find("[data-remove-equipment]").on("click", this.#onRemoveEquipment.bind(this));
    html.find("[data-add-inventory-item]").on("click", this.#onAddInventoryItem.bind(this));
    html.find("[data-edit-inventory-item]").on("click", this.#onEditInventoryItem.bind(this));
    html.find("[data-remove-inventory-item]").on("click", this.#onRemoveInventoryItem.bind(this));
    html.find("[data-use-inventory-item]").on("click", this.#onUseInventoryItem.bind(this));
    html.find("[data-add-status]").on("click", this.#onAddStatus.bind(this));
    html.find("[data-edit-status]").on("click", this.#onEditStatus.bind(this));
    html.find("[data-adjust-status-turns]").on("click", this.#onAdjustStatusTurns.bind(this));
    html.find("[data-remove-status]").on("click", this.#onRemoveStatus.bind(this));
  }

  async #onAttributeDot(event) {
    event.preventDefault();

    const attribute = event.currentTarget.dataset.attributeDot;
    const value = Number(event.currentTarget.dataset.value ?? 0);
    if (!ATTRIBUTE_KEYS.includes(attribute) || !Number.isFinite(value)) return;

    await this.actor.update({ [`system.attributes.${attribute}`]: value });
  }

  async #onSkillDot(event) {
    event.preventDefault();

    const skill = event.currentTarget.dataset.skillDot;
    const clickedValue = Number(event.currentTarget.dataset.value ?? 0);
    if (!GENERAL_SKILLS.some((entry) => entry.key === skill) || !Number.isFinite(clickedValue)) return;

    const currentValue = Number(this.actor.system.skills?.[skill] ?? 0);
    const value = currentValue === clickedValue ? clickedValue - 1 : clickedValue;
    await this.actor.update({ [`system.skills.${skill}`]: Math.max(0, value) });
  }

  async #onExtraSkillDot(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.extraSkillDot;
    const clickedValue = Number(event.currentTarget.dataset.value ?? 0);
    if (!EXTRA_SKILL_SLOTS.includes(slot) || !Number.isFinite(clickedValue)) return;

    const currentValue = Number(this.actor.system.extraSkills?.[slot]?.points ?? 0);
    const value = currentValue === clickedValue ? clickedValue - 1 : clickedValue;
    await this.actor.update({
      [`system.extraSkills.${slot}.active`]: true,
      [`system.extraSkills.${slot}.points`]: Math.max(0, value)
    });
  }

  async #onAddExtraSkill(event) {
    event.preventDefault();

    const slot = EXTRA_SKILL_SLOTS.find((key) => {
      const extraSkill = this.actor.system.extraSkills?.[key] ?? {};
      return !extraSkill.active && !extraSkill.name && !extraSkill.points && !extraSkill.details && !extraSkill.dependencies;
    });

    if (!slot) {
      ui.notifications.warn(localize("ROLENROLL.ExtraSkill.NoSlots"));
      return;
    }

    await this.actor.update({ [`system.extraSkills.${slot}.active`]: true });
    this.#openExtraSkillDialog(slot);
  }

  #onEditExtraSkill(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.editExtraSkill;
    if (!EXTRA_SKILL_SLOTS.includes(slot)) return;

    this.#openExtraSkillDialog(slot);
  }

  #openExtraSkillDialog(slot) {
    const extraSkill = this.actor.system.extraSkills?.[slot] ?? {};
    const dependencies = parseDependencyIds(extraSkill.dependencies);
    const attributeOptions = ATTRIBUTE_KEYS.map((key) => `
      <option value="attribute:${key}" ${dependencies.includes(`attribute:${key}`) ? "selected" : ""}>
        ${escapeHtml(`${localize(`ROLENROLL.Attribute.${key}`)} (${localize(`ROLENROLL.AttributeCode.${key}`)})`)}
      </option>
    `).join("");
    const generalAbilityOptions = GENERAL_SKILLS.map((skill) => `
      <option value="skill:${skill.key}" ${dependencies.includes(`skill:${skill.key}`) ? "selected" : ""}>
        ${escapeHtml(localize(`ROLENROLL.Skill.${skill.key}`))}
      </option>
    `).join("");

    const content = `
      <form class="rolenroll-extra-skill-dialog">
        <div class="form-group">
          <label>${localize("ROLENROLL.ExtraSkill.Name")}</label>
          <input type="text" name="name" value="${escapeHtml(extraSkill.name ?? "")}" autofocus>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Roll.TotalDice")}</label>
          <input type="number" name="points" value="${Number(extraSkill.points ?? 0) || 0}" min="0" max="6">
        </div>
        <div class="form-group">
          <label class="stat-bonus">
            <input type="checkbox" name="bonus" ${extraSkill.bonus ? "checked" : ""}>
            <span>${localize("ROLENROLL.Roll.AttributeSucceed")}</span>
          </label>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.ExtraSkill.LinkedStats")}</label>
          <select class="dependency-select" name="dependencies" multiple size="10">
            <optgroup label="${escapeHtml(localize("ROLENROLL.Tab.Attributes"))}">
              ${attributeOptions}
            </optgroup>
            <optgroup label="${escapeHtml(localize("ROLENROLL.Tab.GeneralAbility"))}">
              ${generalAbilityOptions}
            </optgroup>
          </select>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.ExtraSkill.Details")}</label>
          <textarea name="details">${escapeHtml(extraSkill.details ?? "")}</textarea>
        </div>
      </form>
    `;

    new Dialog({
      title: localize("ROLENROLL.ExtraSkill.Edit"),
      content,
      buttons: {
        save: {
          label: localize("ROLENROLL.ExtraSkill.Save"),
          callback: async (html) => {
            const form = html[0]?.querySelector("form");
            const formData = new FormData(form);
            await this.actor.update({
              [`system.extraSkills.${slot}.active`]: true,
              [`system.extraSkills.${slot}.name`]: String(formData.get("name") ?? "").trim(),
              [`system.extraSkills.${slot}.points`]: clamp(Number(formData.get("points") ?? 0) || 0, 0, 6),
              [`system.extraSkills.${slot}.dependencies`]: buildDependencyValue(formData.getAll("dependencies").map(String)),
              [`system.extraSkills.${slot}.bonus`]: formData.has("bonus"),
              [`system.extraSkills.${slot}.details`]: String(formData.get("details") ?? "").trim()
            });
          }
        },
        cancel: {
          label: localize("Cancel")
        }
      },
      default: "save"
    }).render(true);
  }

  async #onRemoveExtraSkill(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.removeExtraSkill;
    if (!EXTRA_SKILL_SLOTS.includes(slot)) return;

    await this.actor.update({
      [`system.extraSkills.${slot}.active`]: false,
      [`system.extraSkills.${slot}.name`]: "",
      [`system.extraSkills.${slot}.points`]: 0,
      [`system.extraSkills.${slot}.dependencies`]: "",
      [`system.extraSkills.${slot}.attribute`]: "strength",
      [`system.extraSkills.${slot}.bonus`]: false,
      [`system.extraSkills.${slot}.details`]: ""
    });
  }

  async #onExtraSkillDependency(event) {
    const slot = event.currentTarget.dataset.extraSkillDependency;
    if (!EXTRA_SKILL_SLOTS.includes(slot)) return;

    const container = event.currentTarget.closest("[data-extra-skill-row]");
    if (!container) return;

    const dependencies = Array.from(container.querySelectorAll(`[data-extra-skill-dependency="${slot}"]:checked`))
      .map((input) => input.value);

    await this.actor.update({
      [`system.extraSkills.${slot}.active`]: true,
      [`system.extraSkills.${slot}.dependencies`]: buildDependencyValue(dependencies)
    });
  }

  async #onAddEquipment(event) {
    event.preventDefault();

    const slot = EQUIPMENT_ENTRY_SLOTS.find((key) => !isEntryActive(this.actor.system.equipmentEntries?.[key]));
    if (!slot) {
      ui.notifications.warn(localize("ROLENROLL.Inventory.NoEquipmentSlots"));
      return;
    }

    await this.actor.update({ [`system.equipmentEntries.${slot}.active`]: true });
    this.#openEquipmentDialog(slot);
  }

  #onEditEquipment(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.editEquipment;
    if (!EQUIPMENT_ENTRY_SLOTS.includes(slot)) return;

    this.#openEquipmentDialog(slot);
  }

  async #onAdjustEquipmentCharge(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.adjustEquipmentCharge;
    const delta = Number(event.currentTarget.dataset.delta ?? 0);
    if (!EQUIPMENT_ENTRY_SLOTS.includes(slot) || !Number.isFinite(delta)) return;

    const entry = this.actor.system.equipmentEntries?.[slot];
    if (!entry || !isEntryActive(entry)) return;

    const currentCharge = Math.max(0, Number(entry.charge ?? 0) || 0);
    await this.actor.update({
      [`system.equipmentEntries.${slot}.charge`]: Math.max(0, currentCharge + delta)
    });
  }

  #openEquipmentDialog(slot) {
    const entry = this.actor.system.equipmentEntries?.[slot] ?? {};
    const location = EQUIPMENT_LOCATIONS.includes(entry.location) ? entry.location : "wearing";
    const locationOptions = EQUIPMENT_LOCATIONS.map((key) => `
      <option value="${key}" ${key === location ? "selected" : ""}>${localize(`ROLENROLL.Inventory.Location.${key}`)}</option>
    `).join("");

    const content = `
      <form class="rolenroll-equipment-dialog">
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.GearName")}</label>
          <input type="text" name="name" value="${escapeHtml(entry.name ?? "")}" autofocus>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Location")}</label>
          <select name="location">${locationOptions}</select>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Damage")}</label>
          <input type="text" name="damage" value="${escapeHtml(entry.damage ?? "")}">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Charge")}</label>
          <input type="number" name="charge" value="${Number(entry.charge ?? 0) || 0}" min="0">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Defense")}</label>
          <input type="number" name="defense" value="${Number(entry.defense ?? 0) || 0}" min="0">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Toughness")}</label>
          <input type="number" name="toughness" value="${Number(entry.toughness ?? 0) || 0}" min="0">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Details")}</label>
          <textarea name="details">${escapeHtml(entry.details ?? "")}</textarea>
        </div>
      </form>
    `;

    new Dialog({
      title: localize("ROLENROLL.Inventory.EditGear"),
      content,
      buttons: {
        save: {
          label: localize("ROLENROLL.Inventory.SaveGear"),
          callback: async (html) => {
            const form = html[0]?.querySelector("form");
            const formData = new FormData(form);
            await this.actor.update({
              [`system.equipmentEntries.${slot}.active`]: true,
              [`system.equipmentEntries.${slot}.name`]: String(formData.get("name") ?? "").trim(),
              [`system.equipmentEntries.${slot}.location`]: String(formData.get("location") ?? "wearing"),
              [`system.equipmentEntries.${slot}.damage`]: String(formData.get("damage") ?? "").trim(),
              [`system.equipmentEntries.${slot}.charge`]: Math.max(0, Number(formData.get("charge") ?? 0) || 0),
              [`system.equipmentEntries.${slot}.defense`]: Math.max(0, Number(formData.get("defense") ?? 0) || 0),
              [`system.equipmentEntries.${slot}.toughness`]: Math.max(0, Number(formData.get("toughness") ?? 0) || 0),
              [`system.equipmentEntries.${slot}.details`]: String(formData.get("details") ?? "").trim()
            });
          }
        },
        cancel: {
          label: localize("Cancel")
        }
      },
      default: "save"
    }).render(true);
  }

  async #onRemoveEquipment(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.removeEquipment;
    if (!EQUIPMENT_ENTRY_SLOTS.includes(slot)) return;

    await this.actor.update({
      [`system.equipmentEntries.${slot}.active`]: false,
      [`system.equipmentEntries.${slot}.name`]: "",
      [`system.equipmentEntries.${slot}.location`]: "wearing",
      [`system.equipmentEntries.${slot}.damage`]: "",
      [`system.equipmentEntries.${slot}.charge`]: 0,
      [`system.equipmentEntries.${slot}.defense`]: 0,
      [`system.equipmentEntries.${slot}.toughness`]: 0,
      [`system.equipmentEntries.${slot}.details`]: ""
    });
  }

  async #onAddInventoryItem(event) {
    event.preventDefault();

    const slot = INVENTORY_ITEM_SLOTS.find((key) => !isEntryActive(this.actor.system.inventoryItems?.[key]));
    if (!slot) {
      ui.notifications.warn(localize("ROLENROLL.Inventory.NoItemSlots"));
      return;
    }

    await this.actor.update({ [`system.inventoryItems.${slot}.active`]: true });
    this.#openInventoryItemDialog(slot);
  }

  #onEditInventoryItem(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.editInventoryItem;
    if (!INVENTORY_ITEM_SLOTS.includes(slot)) return;

    this.#openInventoryItemDialog(slot);
  }

  #openInventoryItemDialog(slot) {
    const item = this.actor.system.inventoryItems?.[slot] ?? {};
    const content = `
      <form class="rolenroll-inventory-item-dialog">
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.ItemName")}</label>
          <input type="text" name="name" value="${escapeHtml(item.name ?? "")}" autofocus>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Quantity")}</label>
          <input type="number" name="quantity" value="${Number(item.quantity ?? 1) || 0}" min="0">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Inventory.Details")}</label>
          <textarea name="details">${escapeHtml(item.details ?? "")}</textarea>
        </div>
      </form>
    `;

    new Dialog({
      title: localize("ROLENROLL.Inventory.EditItem"),
      content,
      buttons: {
        save: {
          label: localize("ROLENROLL.Inventory.SaveItem"),
          callback: async (html) => {
            const form = html[0]?.querySelector("form");
            const formData = new FormData(form);
            await this.actor.update({
              [`system.inventoryItems.${slot}.active`]: true,
              [`system.inventoryItems.${slot}.name`]: String(formData.get("name") ?? "").trim(),
              [`system.inventoryItems.${slot}.quantity`]: Math.max(0, Number(formData.get("quantity") ?? 0) || 0),
              [`system.inventoryItems.${slot}.details`]: String(formData.get("details") ?? "").trim()
            });
          }
        },
        cancel: {
          label: localize("Cancel")
        }
      },
      default: "save"
    }).render(true);
  }

  async #onRemoveInventoryItem(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.removeInventoryItem;
    if (!INVENTORY_ITEM_SLOTS.includes(slot)) return;

    await this.actor.update({
      [`system.inventoryItems.${slot}.active`]: false,
      [`system.inventoryItems.${slot}.name`]: "",
      [`system.inventoryItems.${slot}.quantity`]: 1,
      [`system.inventoryItems.${slot}.details`]: ""
    });
  }

  async #onUseInventoryItem(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.useInventoryItem;
    const item = this.actor.system.inventoryItems?.[slot];
    if (!INVENTORY_ITEM_SLOTS.includes(slot) || !item) return;

    const name = item.name?.trim() || localize("ROLENROLL.Inventory.UntitledItem");
    const details = item.details?.trim();
    const quantity = Number(item.quantity ?? 0) || 0;
    if (quantity <= 0) {
      ui.notifications.warn(localize("ROLENROLL.Inventory.UseEmpty", { item: name }));
      return;
    }

    const nextQuantity = Math.max(0, quantity - 1);
    const content = `
      <div class="role-roll-chat">
        <div class="role-roll-header"><strong>${escapeHtml(localize("ROLENROLL.Inventory.UsedItem", { item: name }))}</strong></div>
        <dl class="role-roll-summary">
          <div><dt>${localize("ROLENROLL.Inventory.Quantity")}</dt><dd>${quantity} -> ${nextQuantity}</dd></div>
        </dl>
        ${details ? `<p>${escapeHtml(details).replace(/\n/g, "<br>")}</p>` : ""}
      </div>
    `;

    await this.actor.update({ [`system.inventoryItems.${slot}.quantity`]: nextQuantity });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content
    });
  }

  async #onAddStatus(event) {
    event.preventDefault();

    const slot = STATUS_SLOTS.find((key) => !isEntryActive(this.actor.system.statusEffects?.[key]));
    if (!slot) {
      ui.notifications.warn(localize("ROLENROLL.Status.NoSlots"));
      return;
    }

    await this.actor.update({
      [`system.statusEffects.${slot}.active`]: true,
      [`system.statusEffects.${slot}.category`]: "buff",
      [`system.statusEffects.${slot}.durationKind`]: "permanent",
      [`system.statusEffects.${slot}.durationMode`]: "turns",
      [`system.statusEffects.${slot}.durationTurns`]: 1
    });
    this.#openStatusDialog(slot);
  }

  #onEditStatus(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.editStatus;
    if (!STATUS_SLOTS.includes(slot)) return;

    this.#openStatusDialog(slot);
  }

  async #onAdjustStatusTurns(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.adjustStatusTurns;
    const delta = Number(event.currentTarget.dataset.delta ?? 0);
    if (!STATUS_SLOTS.includes(slot) || !Number.isFinite(delta)) return;

    const entry = this.actor.system.statusEffects?.[slot];
    if (!entry || !isTurnStatus(entry)) return;

    const currentTurns = Math.max(0, Number(entry.durationTurns ?? 0) || 0);
    await this.actor.update({
      [`system.statusEffects.${slot}.durationTurns`]: Math.max(0, currentTurns + delta)
    });
  }

  #openStatusDialog(slot) {
    const entry = this.actor.system.statusEffects?.[slot] ?? {};
    const category = getStatusCategory(entry.category);
    const durationKind = getStatusDurationKind(entry.durationKind);
    const durationMode = getStatusDurationMode(entry.durationMode);
    const categoryOptions = STATUS_CATEGORIES.map((key) => `
      <option value="${key}" ${key === category ? "selected" : ""}>${localize(`ROLENROLL.Status.Category.${key}`)}</option>
    `).join("");
    const durationKindOptions = STATUS_DURATION_KINDS.map((key) => `
      <option value="${key}" ${key === durationKind ? "selected" : ""}>${localize(`ROLENROLL.Status.Duration.${key}`)}</option>
    `).join("");
    const durationModeOptions = STATUS_DURATION_MODES.map((key) => `
      <option value="${key}" ${key === durationMode ? "selected" : ""}>${localize(`ROLENROLL.Status.Duration.${key}`)}</option>
    `).join("");
    const content = `
      <form class="rolenroll-status-dialog">
        <div class="form-group">
          <label>${localize("ROLENROLL.Status.Name")}</label>
          <input type="text" name="name" value="${escapeHtml(entry.name ?? "")}" autofocus>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Status.Category")}</label>
          <select name="category">${categoryOptions}</select>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Status.Duration")}</label>
          <select name="durationKind">${durationKindOptions}</select>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Status.Until")}</label>
          <select name="durationMode">${durationModeOptions}</select>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Status.Turns")}</label>
          <input type="number" name="durationTurns" value="${Math.max(0, Number(entry.durationTurns ?? 1) || 0)}" min="0">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Status.Details")}</label>
          <textarea name="details">${escapeHtml(entry.details ?? "")}</textarea>
        </div>
      </form>
    `;

    new Dialog({
      title: localize("ROLENROLL.Status.Edit"),
      content,
      buttons: {
        save: {
          label: localize("ROLENROLL.Status.Save"),
          callback: async (html) => {
            const form = html[0]?.querySelector("form");
            const formData = new FormData(form);
            await this.actor.update({
              [`system.statusEffects.${slot}.active`]: true,
              [`system.statusEffects.${slot}.name`]: String(formData.get("name") ?? "").trim(),
              [`system.statusEffects.${slot}.category`]: getStatusCategory(String(formData.get("category") ?? "buff")),
              [`system.statusEffects.${slot}.durationKind`]: getStatusDurationKind(String(formData.get("durationKind") ?? "permanent")),
              [`system.statusEffects.${slot}.durationMode`]: getStatusDurationMode(String(formData.get("durationMode") ?? "turns")),
              [`system.statusEffects.${slot}.durationTurns`]: Math.max(0, Number(formData.get("durationTurns") ?? 0) || 0),
              [`system.statusEffects.${slot}.details`]: String(formData.get("details") ?? "").trim()
            });
          }
        },
        cancel: {
          label: localize("Cancel")
        }
      },
      default: "save"
    }).render(true);
  }

  async #onRemoveStatus(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.removeStatus;
    if (!STATUS_SLOTS.includes(slot)) return;

    await this.actor.update({
      [`system.statusEffects.${slot}.active`]: false,
      [`system.statusEffects.${slot}.name`]: "",
      [`system.statusEffects.${slot}.category`]: "buff",
      [`system.statusEffects.${slot}.durationKind`]: "permanent",
      [`system.statusEffects.${slot}.durationMode`]: "turns",
      [`system.statusEffects.${slot}.durationTurns`]: 1,
      [`system.statusEffects.${slot}.details`]: ""
    });
  }

  async #onAttributeRoll(event) {
    event.preventDefault();

    const attribute = event.currentTarget.dataset.rollAttribute;
    const label = localize(`ROLENROLL.Attribute.${attribute}`);
    const totalDice = Number(this.actor.system.attributes?.[attribute] ?? 0);

    if (!Number.isFinite(totalDice) || totalDice <= 0) {
      ui.notifications.warn(localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;
    const attributeSuccess = this.actor.system.attributeBonuses?.[attribute] ? 1 : 0;

    this.#openRollDialog({
      label,
      totalDice,
      specialDice: this.actor.system.roll?.specialDice ?? "",
      success: Math.max(0, globalSuccess + attributeSuccess),
      penalty: Math.max(0, Number(this.actor.system.roll?.penalty ?? 0) || 0)
    });
  }

  async #onSkillRoll(event) {
    event.preventDefault();

    const skillKey = event.currentTarget.dataset.rollSkill;
    const parts = getSkillRollParts(this.actor, skillKey);
    const totalDice = parts.dice;

    if (totalDice <= 0) {
      ui.notifications.warn(localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;

    this.#openRollDialog({
      label: localize(`ROLENROLL.Skill.${skillKey}`),
      totalDice,
      specialDice: this.actor.system.roll?.specialDice ?? "",
      success: Math.max(0, globalSuccess + parts.successKeys.length),
      penalty: Math.max(0, Number(this.actor.system.roll?.penalty ?? 0) || 0)
    });
  }

  async #onExtraSkillRoll(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.rollExtraSkill;
    const extraSkill = this.actor.system.extraSkills?.[slot];
    if (!EXTRA_SKILL_SLOTS.includes(slot) || !extraSkill) return;

    const skillDice = Number(extraSkill.points ?? 0) || 0;
    const dependencyParts = getDependencyRollParts(this.actor, parseDependencyIds(extraSkill.dependencies));
    const totalDice = skillDice + dependencyParts.dice;

    if (totalDice <= 0) {
      ui.notifications.warn(localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;
    const skillSuccess = extraSkill.bonus ? 1 : 0;
    const label = extraSkill.name?.trim() || localize("ROLENROLL.ExtraSkill.Untitled");

    this.#openRollDialog({
      label,
      totalDice,
      specialDice: this.actor.system.roll?.specialDice ?? "",
      success: Math.max(0, globalSuccess + skillSuccess + dependencyParts.success),
      penalty: Math.max(0, Number(this.actor.system.roll?.penalty ?? 0) || 0)
    });
  }

  #openRollDialog({ label, totalDice, specialDice = "", success = 0, penalty = 0 }) {
    void this.close();
    let specialDiceValue = specialDice;

    const content = `
      <form class="rolenroll-roll-dialog">
        <div class="form-group">
          <label>${localize("ROLENROLL.Roll.TotalDice")}</label>
          <input type="number" name="totalDice" min="1" max="50" value="${totalDice}">
        </div>
        <div class="form-group special-dice-builder">
          <div class="special-dice-builder-header">
            <span>${localize("ROLENROLL.Roll.SpecialDice")}</span>
            <button type="button" data-roll-add-special-die>${localize("ROLENROLL.Roll.AddSpecialDie")}</button>
          </div>
          <input type="hidden" name="specialDice" value="${escapeHtml(specialDice)}">
          <div class="special-dice-list" data-roll-special-dice-list>${buildSpecialDicePreviewHtml(specialDice)}</div>
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Roll.Succeed")}</label>
          <input type="number" name="success" min="0" value="${success}">
        </div>
        <div class="form-group">
          <label>${localize("ROLENROLL.Roll.Penalty")}</label>
          <input type="number" name="penalty" min="0" value="${penalty}">
        </div>
      </form>
    `;

    new Dialog({
      title: localize("ROLENROLL.Roll.Attribute", { attribute: label }),
      content,
      buttons: {
        roll: {
          label: localize("ROLENROLL.Action.Roll"),
          callback: (html) => this.#performPoolRoll(label, html)
        },
        cancel: {
          label: localize("Cancel")
        }
      },
      default: "roll",
      render: (html) => {
        const form = html[0]?.querySelector("form");
        if (!form) return;

        activateRollSpecialDiceBuilder(
          form,
          () => specialDiceValue,
          (nextSpecialDiceValue) => {
            specialDiceValue = nextSpecialDiceValue;
          }
        );
      }
    }).render(true);
  }

  async #performPoolRoll(label, html) {
    const form = html[0]?.querySelector("form");
    const formData = new FormData(form);
    const totalDice = parseInt(formData.get("totalDice") ?? "0", 10);
    const specialDice = String(formData.get("specialDice") ?? "").trim();
    const success = Math.max(0, Number(formData.get("success") ?? 0) || 0);
    const penalty = Math.max(0, Number(formData.get("penalty") ?? 0) || 0);

    if (!Number.isFinite(totalDice) || totalDice <= 0) {
      ui.notifications.warn(localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    await performPoolRoll({ label, totalDice, specialDice, success, penalty, actor: this.actor });
    await this.actor.update({ "system.roll.specialDice": specialDice });
  }
}

Hooks.once("init", () => {
  Handlebars.registerHelper("rolenrollLocalize", (key, options) => localize(key, options?.hash ?? {}));

  game.rolenroll = {
    openManualRoll,
    rollPool: performPoolRoll
  };

  CONFIG.Actor.documentClass = RolenrollActor;
  CONFIG.Item.documentClass = RolenrollItem;

  CONFIG.Actor.dataModels = {
    character: RolenrollCharacterData
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("rolenroll", RolenrollActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "ROLENROLL.Sheet.Character"
  });
});

Hooks.once("diceSoNiceReady", registerRolenrollDicePresets);
Hooks.once("DiceSoNiceReady", registerRolenrollDicePresets);

Hooks.once("ready", async () => {
  let macro = game.macros.getName("Role & Roll Manual Roller");

  if (!macro && game.user.isGM) {
    macro = await Macro.create({
      name: "Role & Roll Manual Roller",
      type: "script",
      scope: "global",
      img: "icons/svg/dice-target.svg",
      command: "game.rolenroll.openManualRoll();"
    });
  }

  if (macro && game.user.assignHotbarMacro) {
    await game.user.assignHotbarMacro(macro, 10);
  }
});
