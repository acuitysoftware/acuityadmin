import React from "react";
import AdminPagePlaceholder from "../AdminPagePlaceholder";

// Homepage-specific block management: add/remove/reorder/edit/enable
// the content blocks that make up the homepage.
export default function HomeSettings() {
  return (
    <AdminPagePlaceholder
      title="Home Settings"
      description="Add, remove, reorder, edit and enable/disable the homepage's content blocks."
    />
  );
}
