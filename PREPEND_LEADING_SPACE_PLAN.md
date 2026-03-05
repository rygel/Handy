# Implementation Plan: Prepend Leading Space Feature

## Overview

Add functionality to prepend a blank space before the transcribed text, complementing the existing `append_trailing_space` feature.

## Current Implementation

### Backend (Rust)

- **Setting**: `append_trailing_space` in `src-tauri/src/settings.rs:349`
- **Usage**: `src-tauri/src/clipboard.rs:597-601` - adds space after text
- **Command**: `change_append_trailing_space_setting()` in `src-tauri/src/shortcut/mod.rs:1036-1041`
- **Exposed**: `src-tauri/src/lib.rs:295`

### Frontend (React/TypeScript)

- **Component**: `src/components/settings/AppendTrailingSpace.tsx` (exists but not used in UI)
- **Translation**: `src/i18n/locales/en/translation.json:451-454`

---

## Implementation Plan

### Phase 1: Backend Changes (Rust)

#### 1.1 Add Setting to AppSettings Struct

**File**: `src-tauri/src/settings.rs`

**Location**: In the `AppSettings` struct (around line 349)

**Change**: Add new field after `append_trailing_space`:

```rust
#[serde(default)]
pub prepend_leading_space: bool,
```

**Location**: In `get_default_settings()` function (around line 719)

**Change**: Add to AppSettings initialization:

```rust
prepend_leading_space: false,
```

#### 1.2 Add Tauri Command Handler

**File**: `src-tauri/src/shortcut/mod.rs`

**Location**: After `change_append_trailing_space_setting()` function (around line 1041)

**Add**:

```rust
#[tauri::command]
#[specta::specta]
pub fn change_prepend_leading_space_setting(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut settings = settings::get_settings(&app);
    settings.prepend_leading_space = enabled;
    settings::write_settings(&app, settings);
    Ok(())
}
```

#### 1.3 Expose Command

**File**: `src-tauri/src/lib.rs`

**Location**: In the Tauri command builder (around line 295)

**Change**: Add to the command list:

```rust
change_prepend_leading_space_setting,
```

#### 1.4 Implement Prepend Logic

**File**: `src-tauri/src/clipboard.rs`

**Location**: In the `paste()` function (around line 590-601)

**Current code**:

```rust
// Append trailing space if setting is enabled
let text = if settings.append_trailing_space {
    format!("{} ", text)
} else {
    text
};
```

**Replace with**:

```rust
// Prepend leading space if setting is enabled
let text = if settings.prepend_leading_space {
    format!(" {}", text)
} else {
    text
};

// Append trailing space if setting is enabled
let text = if settings.append_trailing_space {
    format!("{} ", text)
} else {
    text
};
```

**Note**: The prepend logic must come BEFORE append logic so the transformation order is:

```
original_text → prepend space (if enabled) → append space (if enabled) → final text
```

---

### Phase 2: Frontend Changes (React/TypeScript)

#### 2.1 Create PrependLeadingSpace Component

**File**: `src/components/settings/PrependLeadingSpace.tsx`

**Create new file** (similar to `AppendTrailingSpace.tsx`):

```typescript
import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useSettings } from "../../hooks/useSettings";

interface PrependLeadingSpaceProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const PrependLeadingSpace: React.FC<PrependLeadingSpaceProps> =
  React.memo(({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    const enabled = getSetting("prepend_leading_space") ?? false;

    return (
      <ToggleSwitch
        checked={enabled}
        onChange={(enabled) => updateSetting("prepend_leading_space", enabled)}
        isUpdating={isUpdating("prepend_leading_space")}
        label={t("settings.debug.prependLeadingSpace.label")}
        description={t("settings.debug.prependLeadingSpace.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
      />
    );
  });
```

#### 2.2 Add to Debug Settings UI

**File**: `src/components/settings/debug/DebugSettings.tsx`

**Location**: In the import section (around line 1-13)

**Add import**:

```typescript
import { PrependLeadingSpace } from "../PrependLeadingSpace";
```

**Location**: In the JSX (around line 20-42, in the DebugSettingsGroup)

**Add component** (after PasteDelay line 31):

```typescript
<PrependLeadingSpace descriptionMode="tooltip" grouped={true} />
```

---

### Phase 3: Translation Updates

#### 3.1 Add English Translations

**File**: `src/i18n/locales/en/translation.json`

**Location**: In `settings.debug` section (around line 451-454, after appendTrailingSpace)

**Add**:

```json
"prependLeadingSpace": {
  "label": "Prepend Leading Space",
  "description": "Add a space before pasted transcription"
}
```

#### 3.2 Add Translations for Other Languages

**Files**: `src/i18n/locales/{language-code}/translation.json`

**Languages to update**:

- `ar` (Arabic)
- `cs` (Czech)
- `de` (German)
- `es` (Spanish)
- `fr` (French)
- `it` (Italian)
- `ja` (Japanese)
- `ko` (Korean)
- `pl` (Polish)
- `pt` (Portuguese)
- `ru` (Russian)
- `tr` (Turkish)
- `uk` (Ukrainian)
- `vi` (Vietnamese)
- `zh` (Chinese Simplified)
- `zh-TW` (Chinese Traditional)

For each language file, add the appropriate translation in the `settings.debug` section.

---

## Testing Checklist

### Backend Tests

- [ ] Setting is correctly initialized to `false`
- [ ] Setting persists across app restarts
- [ ] `change_prepend_leading_space_setting` command works correctly
- [ ] Text prepending happens before appending
- [ ] Both prepend and append can be enabled simultaneously
- [ ] Both prepend and append can be disabled independently

### Frontend Tests

- [ ] Component renders correctly in Debug settings
- [ ] Toggle switch reflects current setting state
- [ ] Toggle switch updates setting when clicked
- [ ] Setting changes persist after page refresh
- [ ] Setting changes persist after app restart

### Integration Tests

- [ ] Prepend leading space adds space before text
- [ ] Append trailing space adds space after text
- [ ] Both prepend and append work together (space on both sides)
- [ ] Neither prepend nor append affects the original text
- [ ] Text with only prepend enabled: `" Hello world"`
- [ ] Text with only append enabled: `"Hello world "`
- [ ] Text with both enabled: `" Hello world "`

---

## Files to Modify

### Backend (4 files)

1. `src-tauri/src/settings.rs` - Add setting field and default
2. `src-tauri/src/shortcut/mod.rs` - Add command handler
3. `src-tauri/src/lib.rs` - Expose command
4. `src-tauri/src/clipboard.rs` - Implement prepend logic

### Frontend (3 files)

1. `src/components/settings/PrependLeadingSpace.tsx` - Create new component
2. `src/components/settings/debug/DebugSettings.tsx` - Add component to UI
3. `src/i18n/locales/en/translation.json` - Add translations

### Optional: Additional Translations (15 files)

All other language files in `src/i18n/locales/`

---

## Order of Operations

1. **Backend first** - Add setting, command, and logic in Rust
2. **Frontend component** - Create the React component
3. **Frontend integration** - Add component to UI
4. **Translations** - Add English translations first, then other languages
5. **Testing** - Verify functionality end-to-end

---

## Notes

- The prepend logic must be placed BEFORE the append logic in `clipboard.rs`
- Both settings are independent and can be enabled/disabled separately
- The default behavior for both is `false` (disabled)
- The naming convention follows the existing pattern: `prepend_leading_space` vs `append_trailing_space`
