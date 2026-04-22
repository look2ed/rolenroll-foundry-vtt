const fields = foundry.data.fields;

class RolenrollCharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new fields.SchemaField({
        strength: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        dexterity: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        intelligence: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        charisma: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 })
      }),
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
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-roll-attribute]").on("click", this.#onAttributeRoll.bind(this));
  }

  async #onAttributeRoll(event) {
    event.preventDefault();

    const attribute = event.currentTarget.dataset.rollAttribute;
    const label = game.i18n.localize(`ROLENROLL.Attribute.${attribute}`);
    const value = Number(this.actor.system.attributes?.[attribute] ?? 0);
    const roll = await new Roll("1d20 + @attribute", { attribute: value }).evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: game.i18n.format("ROLENROLL.Roll.Attribute", { attribute: label })
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
