import React from "react";
import UIContext from "../contexts/UIContext";
import { useUI } from "../hooks/UseUI";

const UIProvider = ({ children }) => {
  const ui = useUI();
  return <UIContext value={ui}>{children}</UIContext>;
};

export default UIProvider;
