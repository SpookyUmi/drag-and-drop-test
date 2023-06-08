//TODO sorting elements in a list CHECK
//TODO display a bar in the droppable zone CHECK
//TODO DOM ids -> react props CHECK

// Design options:
// Drag indicator: show over top of everything, show to the side, animations?
// Drop target: outline, opacity, animations?
// Dragged item: Collapse to header only, summary of contents

import React from "react";
import { useState } from "react";

export type Action =
  | {
      type: "if_else";
      then: Action[];
      else: Action[];
    }
  | {
      type: "loop";
      do: Action[];
    }
  | {
      type: "delay";
    };

function getItem(actions: Action[], locationParts: string[]): Action {
  console.log("getItem", locationParts, "from", actions);
  // parsing first part to get an index
  const index = parseInt(locationParts[0], 10);
  const item = actions[index];

  if (locationParts.length === 1) {
    return item;
  }

  const nextActions = (
    item as ({ type: string } & Record<string, Action[]>) | undefined
  )?.[locationParts[1]];
  if (nextActions?.length) {
    return getItem(nextActions, locationParts.slice(2));
  } else {
    throw new Error(`Invalid location: ${locationParts}`);
  }
}

function removeItem(actions: Action[], locationParts: string[]): Action[] {
  // splitting the location so we isolate each step to go
  console.log("removeItem", locationParts, "from", actions);
  // parsing first part to get an index

  const index = parseInt(locationParts[0], 10);

  if (locationParts.length === 1) {
    return [...actions.slice(0, index), ...actions.slice(index + 1)];
  }

  const item = actions[index];

  const nextActions = (
    item as ({ type: string } & Record<string, Action[]>) | undefined
  )?.[locationParts[1]];
  if (nextActions) {
    const updatedAction: Action = {
      ...item,
      [locationParts[1]]: removeItem(nextActions, locationParts.slice(2)),
    };
    return [
      ...actions.slice(0, index),
      updatedAction,
      ...actions.slice(index + 1),
    ];
  } else {
    throw new Error(`Invalid location: ${locationParts}`);
  }
}

function addItem(
  actions: Action[],
  locationParts: string[],
  action: Action
): Action[] {
  // splitting the location so we isolate each step to go
  console.log("addItem", action, "to", actions, "at", locationParts);
  // parsing first part to get an index

  const index = parseInt(locationParts[0], 10);

  if (locationParts.length === 1) {
    return [...actions.slice(0, index), action, ...actions.slice(index)];
  }

  const item = actions[index];

  const nextActions = (
    item as ({ type: string } & Record<string, Action[]>) | undefined
  )?.[locationParts[1]];
  if (nextActions) {
    const updatedAction: Action = {
      ...item,
      [locationParts[1]]: addItem(nextActions, locationParts.slice(2), action),
    };
    return [
      ...actions.slice(0, index),
      updatedAction,
      ...actions.slice(index + 1),
    ];
  } else {
    throw new Error(`Invalid location: ${locationParts}`);
  }
}

function moveItem(
  actions: Action[],
  fromLocation: string,
  toLocation: string
): Action[] {
  console.log("actions", actions, "from", fromLocation, "to", toLocation);

  const fromLocationParts = fromLocation
    .split(".")
    .filter((e) => e !== "undefined"); // TODO: work out why `undefined` shows up first
  const toLocationParts = toLocation
    .split(".")
    .filter((e) => e !== "undefined");

  const actionMoved = getItem(actions, fromLocationParts);
  console.log("actionMoved", actionMoved);
  actions = removeItem(actions, fromLocationParts);

  // TODO: Update index of toLocationParts based on fromLocationParts, in case action has been removed from an index before an item being added to
  // e.g.
  // [15, else, 0] - delay moving to
  // [15, else, 1, then, 0] becomes [15, else, 0, then, 0]
  if (
    toLocationParts
      .join(".")
      .startsWith(
        fromLocationParts.slice(0, fromLocationParts.length - 1).join(".")
      )
  ) {
    const removedFromIndex = parseInt(
      fromLocationParts[fromLocationParts.length - 1]
    );
    const addingToIndex = parseInt(
      toLocationParts[fromLocationParts.length - 1]
    );
    if (removedFromIndex < addingToIndex) {
      toLocationParts[fromLocationParts.length - 1] = (
        addingToIndex - 1
      ).toString();
    }
  }

  console.log("actions after remove", actions);
  actions = addItem(actions, toLocationParts, actionMoved);
  console.log("actions after added", actions);
  return actions;
}

//droppable
export function ActionList({
  actions,
  updateActions,
  actionListLocation,
  allActions,
}: {
  actions: Action[];
  updateActions: (actions: Action[]) => void;
  actionListLocation: string;
  allActions: Action[];
}) {
  const afterLastActionLocation = `${actionListLocation}.${actions.length + 1}`;

  return (
    //@ts-ignore
    <section>
      {actions?.map((action, index) => {
        const actionLocation = `${actionListLocation}.${index}`;
        return (
          <React.Fragment key={actionLocation}>
            <DropZoneIndicator
              actionLocation={actionLocation}
              onDrop={(draggedActionLocation) => {
                updateActions(
                  moveItem(allActions, draggedActionLocation, actionLocation)
                );
              }}
            />
            <ActionItem
              actionLocation={actionLocation}
              action={action}
              allActions={allActions}
              updateActions={updateActions}
            />
          </React.Fragment>
        );
      })}
      <DropZoneIndicator
        actionLocation={afterLastActionLocation}
        onDrop={(draggedActionLocation) => {
          updateActions(
            moveItem(allActions, draggedActionLocation, afterLastActionLocation)
          );
        }}
      />
      <AddActionButtons
        location={(actionListLocation + "." + actions.length)
          ?.replace(/^undefined\./, "")
          .split(".")}
        addAction={(action, location) =>
          updateActions(addItem(allActions, location, action))
        }
      />
    </section>
  );
}

//draggable
export function ActionItem({
  action,
  updateActions,
  actionLocation,
  allActions,
}: {
  actionLocation: string;
  action: Action;
  updateActions: (actions: Action[]) => void;
  allActions: Action[];
}) {
  const style = {
    flex: 1,
    position: "relative",
    transition: "all 0.3s ease-in-out",
    overflow: "hidden",
  } as React.CSSProperties;

  let handleStyle = {
    position: "absolute",
    fontSize: 36,
    color: "white",
    cursor: "grab",
    right: 40,
    top: 0,
  } as React.CSSProperties;

  //@ts-ignore
  function handleDragStart(ev) {
    //ev.preventDefault();
    ev.dataTransfer.setData("actionLocation", ev.target.dataset.actionLocation);
    const item = ev.target;
    setTimeout(() => item.classList.add("dragging"), 10);
  }

  //@ts-ignore
  function handleDragEnd(ev) {
    //ev.preventDefault();
    const item = ev.target;
    item.classList.remove("dragging");
  }

  switch (action.type) {
    case "delay":
      return (
        <section
          data-action-location={actionLocation}
          className="action Container"
          style={{ ...style, border: "3px solid #318AA3" }}
          draggable="true"
          //@ts-ignore
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={handleStyle}>...</div>
          <header className="header" style={{ backgroundColor: "#318AA3" }}>
            Delay
          </header>
        </section>
      );
    case "if_else":
      return (
        <section
          data-action-location={actionLocation}
          className="action Container"
          style={{ ...style, border: "3px solid #5D41A2" }}
          draggable="true"
          //@ts-ignore
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={handleStyle}>...</div>
          <header className="header" style={{ backgroundColor: "#5D41A2" }}>
            If/Then/Otherwise
          </header>
          <h3>Then</h3>
          <ActionList
            actionListLocation={`${actionLocation}.then`}
            allActions={allActions}
            actions={action.then}
            updateActions={updateActions}
          />
          <h3>Otherwise</h3>
          <ActionList
            actionListLocation={`${actionLocation}.else`}
            allActions={allActions}
            actions={action.else}
            updateActions={updateActions}
          />
        </section>
      );
    case "loop":
      return (
        <section
          data-action-location={actionLocation}
          className="action Container"
          style={{ ...style, border: "3px solid #3954A3" }}
          draggable="true"
          //@ts-ignore
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={handleStyle}>...</div>
          <header className="header" style={{ backgroundColor: "#3954A3" }}>
            Loop
          </header>
          <ActionList
            actionListLocation={`${actionLocation}.do`}
            allActions={allActions}
            actions={action.do}
            updateActions={updateActions}
          />
        </section>
      );
  }
}

export function AddActionButtons({
  location,
  addAction,
}: {
  location: string[];
  addAction: (action: Action, location: string[]) => void;
}) {
  return (
    <div>
      <button
        style={{ margin: 5 }}
        onClick={() => {
          addAction({ type: "if_else", then: [], else: [] }, location);
        }}
      >
        Add If, Then, Otherwise
      </button>
      <button
        style={{ margin: 5 }}
        onClick={() => {
          addAction({ type: "loop", do: [] }, location);
        }}
      >
        Add Loop
      </button>
      <button
        style={{ margin: 5 }}
        onClick={() => {
          addAction({ type: "delay" }, location);
        }}
      >
        Add Delay
      </button>
    </div>
  );
}

export function DropZoneIndicator({
  actionLocation,
  onDrop: onDropCallback,
}: {
  actionLocation: string;
  onDrop: (draggedLocation: string) => void;
}) {
  const [visible, setVisible] = useState<boolean>(false);

  function dragOver(ev: React.DragEvent<HTMLElement>) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  function onDrop(ev: React.DragEvent<HTMLElement>) {
    ev.preventDefault();
    ev.stopPropagation();

    const draggedActionLocation = ev.dataTransfer.getData("actionLocation");

    draggedActionLocation && onDropCallback(draggedActionLocation);
    setVisible(false);
  }

  return (
    <span
      onDrop={onDrop}
      onDragOver={dragOver}
      onDragEnter={() => setVisible(true)}
      onDragLeave={() => setVisible(false)}
      className={`drop-zone-indicator ${visible ? 'visible' : ''}`}
      data-action-location={actionLocation}
      // style={{
      //   display: "block",
      //   opacity: visible ? 1 : 0, // must be visible and rendered for drag drop to work
      //   margin: visible ? "5px auto" : "0 auto",
      //   width: "100%",
      //   height: visible ? 130 : 20,
      //   backgroundColor: "rgba(123, 80, 252, 0.5)",
      //   transition: "height 0.3s ease-in-out",
      // }}
    />
  );
}
