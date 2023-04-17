import React, { useState } from "react";
import { createRange } from "./utilities";
import "./App.css";
import { SortableTree } from "./SortableTree";

function getMockItems() {
  return createRange(50, (index) => ({ id: index + 1 }));
}

export default function App() {
  const [items, setItems] = useState(getMockItems);

  return (
    <SortableTree collapsible indicator removable />
  );
}
