# Role & Roll for Foundry VTT

Unofficial Foundry VTT system starter for Role & Roll.

This repository currently contains:

- A Foundry system manifest at `system.json`.
- A minimal `character` actor type with starting attributes, resources, equipment, statuses, and notes.
- A basic actor sheet with roll buttons for early testing.
- The existing standalone interactive sheet files (`index.html`, `style.css`, `dice.js`) as reference material for the Foundry conversion.

## Local Development

Foundry expects the system folder name to match the `id` in `system.json`.

1. Clone this repository into your Foundry user data systems folder:

   ```sh
   cd "<Foundry User Data>/Data/systems"
   git clone https://github.com/look2ed/rolenroll-foundry-vtt.git rolenroll
   ```

2. Restart Foundry VTT.
3. Create a new world and select **Role & Roll** as the game system.

## GitHub Release Manifest

After the repository exists on GitHub, releases can provide automatic Foundry installation by attaching a zip file and keeping these manifest fields current:

- `url`
- `manifest`
- `download`

The initial values in `system.json` assume this future repository URL:

```text
https://github.com/look2ed/rolenroll-foundry-vtt
```

## Next Conversion Steps

- Port the web sheet's full character data into the Foundry actor data model.
- Move the dice mechanics from `dice.js` into Foundry roll/chat workflows.
- Add item document types for reusable equipment, statuses, and skills.
- Package a release zip for Foundry's manifest installer.
