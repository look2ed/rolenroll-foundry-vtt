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
const EXTRA_SKILL_SLOTS = ["one", "two", "three", "four", "five", "six"];

function clamp(value, min, max) {
  const number = Number(value ?? 0);
  const safeNumber = Number.isNaN(number) ? 0 : number;
  return Math.max(min, Math.min(max, safeNumber));
}

function buildDieFaces(config = {}) {
  const kind = config.kind ?? "normal";
  const faces = ["1", "", "", "", "", "R"];

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

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function parseSpecialDice(specialDice) {
  const configs = [];
  const tokens = String(specialDice || "")
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

function rollRolenrollPool(dice) {
  const rounds = [];
  let current = dice.map((config) => ({ config }));
  let safety = 0;

  while (current.length > 0 && safety < 100) {
    safety++;

    const thisRound = [];
    const next = [];

    for (const { config } of current) {
      const roll = rollD6();
      const face = faceForRoll(config, roll);
      thisRound.push({ config, roll, face });

      if (face === "R") next.push({ config: { ...config } });
    }

    rounds.push(thisRound);
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
            name: new fields.StringField({ required: true, initial: "" }),
            points: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 6 }),
            attribute: new fields.StringField({ required: true, initial: "strength" }),
            bonus: new fields.BooleanField({ required: true, initial: false }),
            profession: new fields.BooleanField({ required: true, initial: false }),
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
        })
      }),
      defense: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      roll: new fields.SchemaField({
        success: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        penalty: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        specialDice: new fields.StringField({ required: true, initial: "" })
      }),
      equipment: new fields.StringField({ required: true, initial: "" }),
      statuses: new fields.StringField({ required: true, initial: "" }),
      notes: new fields.HTMLField({ required: true, initial: "" })
    };
  }
}

class RolenrollActor extends Actor {}
class RolenrollItem extends Item {}

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
      key,
      label: `${game.i18n.localize(`ROLENROLL.Attribute.${key}`)} (${game.i18n.localize(`ROLENROLL.AttributeCode.${key}`)})`
    }));
    context.extraSkillSlots = EXTRA_SKILL_SLOTS.map((slot) => {
      const extraSkill = this.actor.system.extraSkills?.[slot] ?? {};
      const selectedAttribute = extraSkill.attribute || "strength";
      return {
        slot,
        name: extraSkill.name ?? "",
        points: Number(extraSkill.points ?? 0) || 0,
        bonus: Boolean(extraSkill.bonus),
        profession: Boolean(extraSkill.profession),
        details: extraSkill.details ?? "",
        dots: buildDots(Number(extraSkill.points ?? 0) || 0),
        attributeOptions: context.attributeOptions.map((option) => ({
          ...option,
          selected: option.key === selectedAttribute
        }))
      };
    });
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
    await this.actor.update({ [`system.extraSkills.${slot}.points`]: Math.max(0, value) });
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
    const skill = GENERAL_SKILLS.find((entry) => entry.key === skillKey);
    if (!skill) return;

    const skillDice = Number(this.actor.system.skills?.[skillKey] ?? 0) || 0;
    const chosenAttribute = getChosenAttribute(this.actor, skill);
    const attributeDice = getAttributeValue(this.actor, chosenAttribute);
    const totalDice = skillDice + attributeDice;

    if (totalDice <= 0) {
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;
    const skillSuccess = this.actor.system.skillBonuses?.[skillKey] ? 1 : 0;
    const attributeSuccess = this.actor.system.attributeBonuses?.[chosenAttribute] ? 1 : 0;

    this.#openRollDialog({
      label: game.i18n.localize(`ROLENROLL.Skill.${skillKey}`),
      totalDice,
      specialDice: this.actor.system.roll?.specialDice ?? "",
      success: Math.max(0, globalSuccess + skillSuccess + attributeSuccess),
      penalty: Math.max(0, Number(this.actor.system.roll?.penalty ?? 0) || 0)
    });
  }

  async #onExtraSkillRoll(event) {
    event.preventDefault();

    const slot = event.currentTarget.dataset.rollExtraSkill;
    const extraSkill = this.actor.system.extraSkills?.[slot];
    if (!EXTRA_SKILL_SLOTS.includes(slot) || !extraSkill) return;

    const skillDice = Number(extraSkill.points ?? 0) || 0;
    const attribute = ATTRIBUTE_KEYS.includes(extraSkill.attribute) ? extraSkill.attribute : "strength";
    const attributeDice = getAttributeValue(this.actor, attribute);
    const totalDice = skillDice + attributeDice;

    if (totalDice <= 0) {
      ui.notifications.warn(game.i18n.localize("ROLENROLL.Roll.NoDice"));
      return;
    }

    const globalSuccess = Number(this.actor.system.roll?.success ?? 0) || 0;
    const skillSuccess = extraSkill.bonus ? 1 : 0;
    const professionSuccess = extraSkill.profession ? 1 : 0;
    const attributeSuccess = this.actor.system.attributeBonuses?.[attribute] ? 1 : 0;
    const label = extraSkill.name?.trim() || game.i18n.localize("ROLENROLL.ExtraSkill.Untitled");

    this.#openRollDialog({
      label,
      totalDice,
      specialDice: this.actor.system.roll?.specialDice ?? "",
      success: Math.max(0, globalSuccess + skillSuccess + professionSuccess + attributeSuccess),
      penalty: Math.max(0, Number(this.actor.system.roll?.penalty ?? 0) || 0)
    });
  }

  #openRollDialog({ label, totalDice, specialDice = "", success = 0, penalty = 0 }) {
    const content = `
      <form class="rolenroll-roll-dialog">
        <div class="form-group">
          <label>${game.i18n.localize("ROLENROLL.Roll.TotalDice")}</label>
          <input type="number" name="totalDice" min="1" max="50" value="${totalDice}">
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("ROLENROLL.Roll.SpecialDice")}</label>
          <input type="text" name="specialDice" value="${escapeHtml(specialDice)}" placeholder="a1, n2">
          <p class="notes">${game.i18n.localize("ROLENROLL.Roll.SpecialDiceHint")}</p>
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

    const result = rollRolenrollPool(dice);
    const content = buildRollMessage({ label, totalDice, specialDice, success, penalty, result });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content
    });
  }
}

Hooks.once("init", () => {
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
