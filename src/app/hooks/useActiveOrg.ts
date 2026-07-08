import { useContext } from "react";
import { ActiveOrgContext } from "../context/ActiveOrgContext";

export function useActiveOrg() {
  const context = useContext(ActiveOrgContext);

  if (!context) {
    throw new Error("useActiveOrg must be used within ActiveOrgProvider");
  }

  return context;
}
