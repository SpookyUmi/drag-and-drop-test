import React, { useState } from "react";
import { ActionList } from "./actions";
import "./App.scss";

export default function App() {
  const [actions, setActions] = useState([]);
  console.log("actions? in App", actions);

  return (
    <section>
      <span
        id="dragbar"
        style={{
          display: "none",
          margin: "0 auto",
          width: "80%",
          height: 15,
          backgroundColor: "fuchsia",
          borderRadius: 50,
        }}
      />
      <ActionList
        allActions={actions}
        actions={actions}
        updateActions={setActions}
      />
    </section>
  );
}
