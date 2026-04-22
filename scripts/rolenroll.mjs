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
      throw new Error(game.i18n.localize("ROLENROLL.Roll.InvalidSpecialDiceJson"));
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

    throw new Error(game.i18n.format("ROLENROLL.Roll.InvalidSpecialDice", { token }));
  }

  return configs;
}

async function showDiceOnBoard(roll, speaker) {
  if (game.dice3d?.showForRoll) {
    await game.dice3d.showForRoll(roll, game.user, true, null, false);
    return;
  }

  await roll.toMessage({
    speaker,
    flavor: game.i18n.localize("ROLENROLL.Roll.BoardDice"),
    flags: {
      core: {
        canPopout: false
      }
    }
  });
}

function getRollValues(roll) {
  return roll.dice.flatMap((die) => die.results.map((result) => result.result));
}

function confirmReroll(count) {
  return new Promise((resolve) => {
    new Dialog({
      title: game.i18n.localize("ROLENROLL.Roll.RerollTitle"),
      content: `<p>${game.i18n.format("ROLENROLL.Roll.RerollPrompt", { count })}</p>`,
      buttons: {
        reroll: {
          label: game.i18n.localize("ROLENROLL.Roll.RerollButton"),
          callback: () => resolve(true)
        }
      },
      close: () => resolve(true),
      default: "reroll"
    }).render(true);
  });
}

async function rollRolenrollPool(dice, speaker) {
  const rounds = [];
  let current = dice.map((config) => ({ config }));
  let safety = 0;

  while (current.length > 0 && safety < 100) {
    safety++;

    const thisRound = [];
    const next = [];

    const roll = await new Roll(`${current.length}d6`).evaluate();
    await showDiceOnBoard(roll, speaker);
    const values = getRollValues(roll);

    for (const [index, { config }] of current.entries()) {
      const value = values[index] ?? 1;
      const face = faceForRoll(config, value);
      thisRound.push({ config, roll: value, face });

      if (face === "R") next.push({ config: { ...config } });
    }

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
    const labelHtml = index === 0 ? "" : `<em>${game.i18n.format("ROLENROLL.Roll.RerollRound", { round: index })}</em>`;
    const diceHtml = round.map((roll) => faceToDieHtml(roll.face)).join("");
    return `<div class="role-roll-dice-row">${labelHtml}${diceHtml}</div>`;
  }).join("");
  const diceTotal = result.scoring.total;
  const finalTotal = Math.max(0, diceTotal + success - penalty);
  const specialText = specialDice ? escapeHtml(specialDice) : game.i18n.localize("ROLENROLL.Roll.NoSpecialDice");

  return `
    <div class="role-roll-chat">
      <div class="role-roll-header"><strong>${escapeHtml(label)}</strong></div>
      ${diceRows}
      <dl class="role-roll-summary">
        <div><dt>${game.i18n.localize("ROLENROLL.Roll.TotalDice")}</dt><dd>${totalDice}</dd></div>
        <div><dt>${game.i18n.localize("ROLENROLL.Roll.SpecialDice")}</dt><dd>${specialText}</dd></div>
        <div><dt>${game.i18n.localize("ROLENROLL.Roll.Base")}</dt><dd>${result.baseScore}</dd></div>
        <div><dt>${game.i18n.localize("ROLENROLL.Roll.Rerolls")}</dt><dd>${result.rerollCount} (+${result.rerollPoints})</dd></div>
        <div><dt>${game.i18n.localize("ROLENROLL.Roll.Tokens")}</dt><dd>+${result.plusTokens} / -${result.minusTokens}</dd></div>
        <div><dt>${game.i18n.localize("ROLENROLL.Roll.SucceedPenalty")}</dt><dd>+${success} / -${penalty}</dd></div>
        <div class="role-roll-total"><dt>${game.i18n.localize("ROLENROLL.Roll.Total")}</dt><dd>${finalTotal}</dd></div>
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
  if (index === 0 || face === "1") return ".";
  if (face === "R") return "R";
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
    ? specialDiceFaces.map((faces) => `
      <div class="special-die-card">
        <div class="special-die-card-faces">
          ${faces.map((face, index) => `<span class="special-die-face ${getSpecialFaceClass(face)}">${getSpecialFaceDisplay(face, index)}</span>`).join("")}
        </div>
      </div>
    `).join("")
    : `<p class="special-dice-empty">${game.i18n.localize("ROLENROLL.Roll.NoSpecialDice")}</p>`;
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

function isEntryActive(entry) {
  return Boolean(entry?.active || entry?.name || entry?.details);
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
  if (durationKind !== "temporary") return game.i18n.localize("ROLENROLL.Status.Duration.permanent");

  const durationMode = getStatusDurationMode(entry.durationMode);
  if (durationMode === "skill-check") return game.i18n.localize("ROLENROLL.Status.Duration.skill-check");

  return game.i18n.format("ROLENROLL.Status.Duration.turnsText", {
    turns: Math.max(0, Number(entry.durationTurns ?? 0) || 0)
  });
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
    ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
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
    ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.TooManySpecialDice"));
    return;
  }

  const dice = [...specialConfigs];
  for (let i = specialConfigs.length; i < totalDice; i++) dice.push({ kind: "normal" });

  if (dice.length > 50) {
    ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.TooManyDice"));
    return;
  }

  const speaker = actor
    ? ChatMessage.getSpeaker({ actor })
    : ChatMessage.getSpeaker();
  const result = await rollRolenrollPool(dice, speaker);
  const content = buildRollMessage({ label, totalDice, specialDice, success, penalty, result });

  await ChatMessage.create({ speaker, content });
}

function openManualRoll() {
  const content = `
    <form class="rolenroll-roll-dialog">
      <div class="form-group">
        <label>${game.i18n.localize("ROLENROLL.Roll.Label")}</label>
        <input type="text" name="label" value="${game.i18n.localize("ROLENROLL.Roll.Manual")}" autofocus>
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("ROLENROLL.Roll.TotalDice")}</label>
        <input type="number" name="totalDice" min="1" max="50" value="5">
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("ROLENROLL.Roll.SpecialDice")}</label>
        <input type="text" name="specialDice" value="" placeholder="a1, n2">
        <p class="notes">${game.i18n.localize("ROLENROLL.Roll.SpecialDiceHint")}</p>
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("ROLENROLL.Roll.Succeed")}</label>
        <input type="number" name="success" min="0" value="0">
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("ROLENROLL.Roll.Penalty")}</label>
        <input type="number" name="penalty" min="0" value="0">
      </div>
    </form>
  `;

  new Dialog({
    title: game.i18n.localize("ROLENROLL.Roll.Manual"),
    content,
    buttons: {
      roll: {
        label: game.i18n.localize("ROLENROLL.Action.Roll"),
        callback: async (html) => {
          const form = html[0]?.querySelector("form");
          const formData = new FormData(form);
          await performPoolRoll({
            label: String(formData.get("label") || game.i18n.localize("ROLENROLL.Roll.Manual")),
            totalDice: parseInt(formData.get("totalDice") ?? "0", 10),
            specialDice: String(formData.get("specialDice") ?? "").trim(),
            success: Math.max(0, Number(formData.get("success") ?? 0) || 0),
            penalty: Math.max(0, Number(formData.get("penalty") ?? 0) || 0)
          });
        }
      },
      cancel: {
        label: game.i18n.localize("Cancel")
      }
    },
    default: "roll"
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
    const specialDiceFaces = parseSpecialDiceFaces(this.actor.system.roll?.specialDice);
    context.specialDice = specialDiceFaces.map((faces, dieIndex) => ({
      dieIndex,
      faces: faces.map((face, faceIndex) => ({
        faceIndex,
        display: getSpecialFaceDisplay(face, faceIndex),
        className: getSpecialFaceClass(face),
        locked: faceIndex === 0 || faceIndex === 5
      }))
    }));
    context.attributes = ATTRIBUTE_KEYS.map((key) => {
      const value = Number(this.actor.system.attributes?.[key] ?? 0);
      return {
        key,
        label: game.i18n.localize(`ROLENROLL.Attribute.${key}`),
        code: game.i18n.localize(`ROLENROLL.AttributeCode.${key}`),
        value,
        bonus: Boolean(this.actor.system.attributeBonuses?.[key]),
        dots: buildDots(value)
      };
    });
    context.generalAbilityGroups = GENERAL_ABILITY_GROUPS.map((group) => ({
      key: group.key,
      label: game.i18n.localize(`ROLENROLL.AbilityGroup.${group.key}`),
      skills: group.skills.map((skill) => {
        const value = Number(this.actor.system.skills?.[skill.key] ?? 0);
        const attrKeys = [skill.attr, skill.altAttr].filter(Boolean);
        return {
          ...skill,
          label: game.i18n.localize(`ROLENROLL.Skill.${skill.key}`),
          tag: attrKeys.map((key) => game.i18n.localize(`ROLENROLL.AttributeCode.${ATTRIBUTE_CODES[key] ?? key}`)).join(" / "),
          value,
          bonus: Boolean(this.actor.system.skillBonuses?.[skill.key]),
          dots: buildDots(value)
        };
      })
    }));
    context.attributeOptions = ATTRIBUTE_KEYS.map((key) => ({
      key: `attribute:${key}`,
      label: `${game.i18n.localize(`ROLENROLL.Attribute.${key}`)} (${game.i18n.localize(`ROLENROLL.AttributeCode.${key}`)})`
    }));
    context.generalAbilityOptions = GENERAL_SKILLS.map((skill) => ({
      key: `skill:${skill.key}`,
      label: game.i18n.localize(`ROLENROLL.Skill.${skill.key}`)
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
        details: entry.details ?? "",
        locationOptions: EQUIPMENT_LOCATIONS.map((key) => ({
          key,
          label: game.i18n.localize(`ROLENROLL.Inventory.Location.${key}`),
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
        categoryLabel: game.i18n.localize(`ROLENROLL.Status.Category.${category}`),
        durationKind,
        durationMode,
        durationTurns: Math.max(0, Number(entry.durationTurns ?? 1) || 0),
        durationText: getStatusDurationText({ ...entry, category, durationKind, durationMode }),
        details: entry.details ?? "",
        categoryOptions: STATUS_CATEGORIES.map((key) => ({
          key,
          label: game.i18n.localize(`ROLENROLL.Status.Category.${key}`),
          selected: key === category
        })),
        durationKindOptions: STATUS_DURATION_KINDS.map((key) => ({
          key,
          label: game.i18n.localize(`ROLENROLL.Status.Duration.${key}`),
          selected: key === durationKind
        })),
        durationModeOptions: STATUS_DURATION_MODES.map((key) => ({
          key,
          label: game.i18n.localize(`ROLENROLL.Status.Duration.${key}`),
          selected: key === durationMode
        }))
      };
    }).filter((entry) => entry.active);
    context.statusBuffs = statusEntries.filter((entry) => entry.category === "buff");
    context.statusDebuffs = statusEntries.filter((entry) => entry.category !== "buff");
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
    html.find("[data-remove-extra-skill]").on("click", this.#onRemoveExtraSkill.bind(this));
    html.find("[data-extra-skill-dependency]").on("change", this.#onExtraSkillDependency.bind(this));
    html.find("[data-add-special-die]").on("click", this.#onAddSpecialDie.bind(this));
    html.find("[data-remove-special-die]").on("click", this.#onRemoveSpecialDie.bind(this));
    html.find("[data-special-die-face]").on("click", this.#onSpecialDieFace.bind(this));
    html.find("[data-add-equipment]").on("click", this.#onAddEquipment.bind(this));
    html.find("[data-remove-equipment]").on("click", this.#onRemoveEquipment.bind(this));
    html.find("[data-add-inventory-item]").on("click", this.#onAddInventoryItem.bind(this));
    html.find("[data-remove-inventory-item]").on("click", this.#onRemoveInventoryItem.bind(this));
    html.find("[data-use-inventory-item]").on("click", this.#onUseInventoryItem.bind(this));
    html.find("[data-add-status]").on("click", this.#onAddStatus.bind(this));
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
      ui.notifications.warn(game.i18n.localize("ROLENROLL.ExtraSkill.NoSlots"));
      return;
    }

    await this.actor.update({ [`system.extraSkills.${slot}.active`]: true });
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

  async #onAddSpecialDie(event) {
    event.preventDefault();

    const diceFaces = parseSpecialDiceFaces(this.actor.system.roll?.specialDice);
    diceFaces.push(["1", "", "", "", "", "R"]);
    await this.actor.update({ "system.roll.specialDice": buildSpecialDiceValue(diceFaces) });
  }

  async #onRemoveSpecialDie(event) {
    event.preventDefault();

    const dieIndex = Number(event.currentTarget.dataset.removeSpecialDie ?? -1);
    const diceFaces = parseSpecialDiceFaces(this.actor.system.roll?.specialDice);
    if (!Number.isInteger(dieIndex) || dieIndex < 0 || dieIndex >= diceFaces.length) return;

    diceFaces.splice(dieIndex, 1);
    await this.actor.update({ "system.roll.specialDice": buildSpecialDiceValue(diceFaces) });
  }

  async #onSpecialDieFace(event) {
    event.preventDefault();

    const [dieIndexText, faceIndexText] = String(event.currentTarget.dataset.specialDieFace || "").split(":");
    const dieIndex = Number(dieIndexText);
    const faceIndex = Number(faceIndexText);
    if (!Number.isInteger(dieIndex) || !Number.isInteger(faceIndex) || faceIndex < 1 || faceIndex > 4) return;

    const diceFaces = parseSpecialDiceFaces(this.actor.system.roll?.specialDice);
    if (!diceFaces[dieIndex]) return;

    const current = diceFaces[dieIndex][faceIndex] || "";
    diceFaces[dieIndex][faceIndex] = current === "" ? "+" : current === "+" ? "-" : "";
    await this.actor.update({ "system.roll.specialDice": buildSpecialDiceValue(diceFaces) });
  }

  async #onAddEquipment(event) {
    event.preventDefault();

    const slot = EQUIPMENT_ENTRY_SLOTS.find((key) => !isEntryActive(this.actor.system.equipmentEntries?.[key]));
    if (!slot) {
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Inventory.NoEquipmentSlots"));
      return;
    }

    await this.actor.update({ [`system.equipmentEntries.${slot}.active`]: true });
  }

  async #onRemoveEquipment(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.removeEquipment;
    if (!EQUIPMENT_ENTRY_SLOTS.includes(slot)) return;

    await this.actor.update({
      [`system.equipmentEntries.${slot}.active`]: false,
      [`system.equipmentEntries.${slot}.name`]: "",
      [`system.equipmentEntries.${slot}.location`]: "wearing",
      [`system.equipmentEntries.${slot}.details`]: ""
    });
  }

  async #onAddInventoryItem(event) {
    event.preventDefault();

    const slot = INVENTORY_ITEM_SLOTS.find((key) => !isEntryActive(this.actor.system.inventoryItems?.[key]));
    if (!slot) {
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Inventory.NoItemSlots"));
      return;
    }

    await this.actor.update({ [`system.inventoryItems.${slot}.active`]: true });
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

    const name = item.name?.trim() || game.i18n.localize("ROLENROLL.Inventory.UntitledItem");
    const details = item.details?.trim();
    const quantity = Number(item.quantity ?? 0) || 0;
    const content = `
      <div class="role-roll-chat">
        <div class="role-roll-header"><strong>${escapeHtml(game.i18n.format("ROLENROLL.Inventory.UsedItem", { item: name }))}</strong></div>
        <dl class="role-roll-summary">
          <div><dt>${game.i18n.localize("ROLENROLL.Inventory.Quantity")}</dt><dd>${quantity}</dd></div>
        </dl>
        ${details ? `<p>${escapeHtml(details).replace(/\n/g, "<br>")}</p>` : ""}
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content
    });
  }

  async #onAddStatus(event) {
    event.preventDefault();

    const slot = STATUS_SLOTS.find((key) => !isEntryActive(this.actor.system.statusEffects?.[key]));
    if (!slot) {
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Status.NoSlots"));
      return;
    }

    await this.actor.update({
      [`system.statusEffects.${slot}.active`]: true,
      [`system.statusEffects.${slot}.category`]: "buff",
      [`system.statusEffects.${slot}.durationKind`]: "permanent",
      [`system.statusEffects.${slot}.durationMode`]: "turns",
      [`system.statusEffects.${slot}.durationTurns`]: 1
    });
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
    const label = game.i18n.localize(`ROLENROLL.Attribute.${attribute}`);
    const totalDice = Number(this.actor.system.attributes?.[attribute] ?? 0);

    if (!Number.isFinite(totalDice) || totalDice <= 0) {
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
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
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;

    this.#openRollDialog({
      label: game.i18n.localize(`ROLENROLL.Skill.${skillKey}`),
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
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;
    const skillSuccess = extraSkill.bonus ? 1 : 0;
    const label = extraSkill.name?.trim() || game.i18n.localize("ROLENROLL.ExtraSkill.Untitled");

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

    const content = `
      <form class="rolenroll-roll-dialog">
        <div class="form-group">
          <label>${game.i18n.localize("ROLENROLL.Roll.TotalDice")}</label>
          <input type="number" name="totalDice" min="1" max="50" value="${totalDice}">
        </div>
        <div class="form-group special-dice-builder">
          <label>${game.i18n.localize("ROLENROLL.Roll.SpecialDice")}</label>
          <input type="hidden" name="specialDice" value="${escapeHtml(specialDice)}">
          <div class="special-dice-list">${buildSpecialDicePreviewHtml(specialDice)}</div>
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("ROLENROLL.Roll.Succeed")}</label>
          <input type="number" name="success" min="0" value="${success}">
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("ROLENROLL.Roll.Penalty")}</label>
          <input type="number" name="penalty" min="0" value="${penalty}">
        </div>
      </form>
    `;

    new Dialog({
      title: game.i18n.format("ROLENROLL.Roll.Attribute", { attribute: label }),
      content,
      buttons: {
        roll: {
          label: game.i18n.localize("ROLENROLL.Action.Roll"),
          callback: (html) => this.#performPoolRoll(label, html)
        },
        cancel: {
          label: game.i18n.localize("Cancel")
        }
      },
      default: "roll"
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
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    await performPoolRoll({ label, totalDice, specialDice, success, penalty, actor: this.actor });
  }
}

Hooks.once("init", () => {
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

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  if (game.macros.getName("Role & Roll Manual Roller")) return;

  await Macro.create({
    name: "Role & Roll Manual Roller",
    type: "script",
    scope: "global",
    img: "icons/svg/dice-target.svg",
    command: "game.rolenroll.openManualRoll();"
  });
});
