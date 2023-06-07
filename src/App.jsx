import React, { useState } from "react";
import { ActionList } from "./actions";
import "./App.scss";

export default function App() {
  const [actions, setActions] = useState([]);
  console.log("actions? in App", actions);

  return (
      <ActionList
        allActions={actions}
        actions={actions}
        updateActions={setActions}
      />
  );
}
