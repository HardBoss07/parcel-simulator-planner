# General Infos for Factory (based off tier 5)

## Base Layout

**Dimensions:**
20, 40 (height, width)


**Blocked Area / Cutout**
10x10 Cutout from bottom Right Corner extruding inside the factory

## Inputs (Trucks coming in)
1. -1, 3
2. -1, 18

## Outputs (Types going out)
1. 3, -1 (Road, Train)
2. 21, 3 (Invalid Submissions)
3. 21, 18 (Plane)
4. 21, 28 (Ship)

## Belts
- Straight Conveyor Belt
- Corner Conveyor Belt (90°)
- Joiner Conveyor Belt (takes and joins 1 other belt)
- Multi Joiner Conveyor (takes and joins 2 other belts)
- Smart Splitter Conveyor (splits parcels into 3 steams with priority of empty routes)
- Pauser Conveyor (Pauses the flow of parcels)
- Unloader Conveyor (unloads parcels from storage rack)
- Loader Conveyor (loads parcels on to storage rack)
- Bridger Conveyor (3 tiles big, bridges over 1 other belt)
- Cargo Diverter (directs parcels to different exits based on cargo type)
- Contents Inspection Diverter (seperates parcels based off 'Inspection Required' Sticker)
- Approve Sticker Conveyor (applies 'approve' sticker)
- Deny Sticker Conveyor (applies 'deny' sticker)
- Launcher Conveyor (lauches parcels)

## Scanner / Checkers
- Sticker Checker:
  - 1 Input
  - Straight: No Sticker
  - L: Invalid Sticker
  - R: Valid Sticker
- Weight Scanner:
  - 1 Input
  - L: Invalid Weight
  - R: Valid Weight
- Serial Number Scanner:
  - 1 Input
  - L: Invalid Serial Number
  - R: Valid Serial Number
- Country Scanner:
  - 1 Input
  - L: Invalid Country / Flag
  - R: Valid Country / Flag
- Cargo Type Scanner:
  - 1 Input
  - L: Invalid Cargo Type
  - R: Valid Cargo Type
- Stamp Scanner:
  - 1 Input
  - L: Invalid Stamp
  - R: Valid Stamp
- Contents Prohibited Scanner:
  - 1 Input
  - L: Invalid Contents
  - R: Valid Contents
