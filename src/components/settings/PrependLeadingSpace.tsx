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
