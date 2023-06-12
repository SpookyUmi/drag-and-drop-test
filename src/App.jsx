import React, { useState } from "react";
import { ActionList } from "./actions";
import "./App.scss";

export default function App() {
  const [actions, setActions] = useState([]);
  const [design, setDesign] = useState("DesignOne");

  return (
    <div className={design}>
      {/* <section className="DesignOptions">
        <p>Drag & drop design options</p>
        <button onClick={() => setDesign("DesignOne")}>One</button>
        <button onClick={() => setDesign("DesignTwo")}>Two</button>
        <button onClick={() => setDesign("DesignThree")}>Three</button>
      </section> */}
      <ActionList
        allActions={actions}
        actions={actions}
        updateActions={setActions}
      />
    </div>
  );
}
