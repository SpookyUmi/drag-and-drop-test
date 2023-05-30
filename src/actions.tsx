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

      console.log("getItem", locationParts, 'from', actions);
      // parsing first part to get an index
      const index = parseInt(locationParts[0], 10);
      const item = actions[index];

      if (locationParts.length === 1) {
        return item;
      }

        const nextActions = (item as {type: string} & Record<string, Action[]> | undefined )?.[locationParts[1]];
        if (nextActions?.length) {
          return getItem(nextActions, locationParts.slice(2));
        } else {
          throw new Error(`Invalid location: ${locationParts}`);
        }
    }

    function removeItem(actions: Action[], locationParts: string[]): Action[] {
      // splitting the location so we isolate each step to go
      console.log("removeItem", locationParts, 'from', actions);
      // parsing first part to get an index

      const index = parseInt(locationParts[0], 10);

      if (locationParts.length === 1) {
        return [...actions.slice(0, index), ...actions.slice(index+1)];
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
        return [...actions.slice(0, index), updatedAction, ...actions.slice(index+1)]
      } else {
        throw new Error(`Invalid location: ${locationParts}`);
      }

    }

    function addItem(actions: Action[], locationParts: string[], action: Action): Action[] {
      // splitting the location so we isolate each step to go
      console.log("addItem",action, "to", actions, "at", locationParts,);
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
        return [...actions.slice(0, index), updatedAction, ...actions.slice(index+1)]
      } else {
        throw new Error(`Invalid location: ${locationParts}`);
      }
    }

function moveItem(actions: Action[], fromLocation: string, toLocation: string): Action[] {
  console.log('actions', actions, 'from', fromLocation, 'to', toLocation);

  const fromLocationParts =  fromLocation
  .split(".")
  .filter((e) => e !== "undefined"); // TODO: work out why `undefined` shows up first
  const toLocationParts =  (toLocation + ".0") // FIXME: assume we're adding to the beginning rather than to a specific index in the list
  .split(".")
  .filter((e) => e !== "undefined");


  const actionMoved = getItem(actions, fromLocationParts);
  console.log('actionMoved', actionMoved);
  actions = removeItem(actions,  fromLocationParts);

  // TODO: Update index of toLocationParts based on fromLocationParts, in case action has been removed from an index before an item being added to
  // e.g.
  // [15, else, 0] - delay moving to
  // [15, else, 1, then, 0] becomes [15, else, 0, then, 0]
  if (toLocationParts.join('.').startsWith(fromLocationParts.slice(0, fromLocationParts.length - 1).join('.'))) {
    const removedFromIndex = parseInt(fromLocationParts[fromLocationParts.length - 1]);
    const addingToIndex = parseInt(toLocationParts[fromLocationParts.length - 1]);
    if (removedFromIndex < addingToIndex) {
      toLocationParts[fromLocationParts.length - 1] = (addingToIndex - 1).toString();
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
  id,
  allActions,
}: {
  actions: Action[];
  updateActions: (actions: Action[]) => void;
  id: string;
  allActions: Action[];
}) {
  //@ts-ignore
  const initSortableList = (e, drop) => {
    e.preventDefault();
    //const draggingItem = document.querySelector(".dragging") as HTMLElement;
    // const draggingItem = document.getElementById("dragbar") as HTMLElement;
    // if (draggingItem && !drop) draggingItem.style.display = "block";
    // const actionList = document.getElementById(id);
    // let siblings = [
    //   ...(actionList?.querySelectorAll(
    //     ":not(.dragging)"
    //   ) as NodeListOf<Element> | undefined) ?? [],
    // ] as HTMLElement[];
    // // Finding the sibling after which the dragging item should be placed
    // let nextSibling = siblings.find((sibling) => {
    //   return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    // });
    // Inserting the dragging item before the found sibling
    // Handle data moves
    // Work with ids
    //actionList?.insertBefore(draggingItem as HTMLElement, nextSibling as HTMLElement);

    // - Remove item from "actions" using old ID
    // - Then add item to "actions" using new ID
  };


  function drop(ev: React.DragEvent<HTMLElement>) {
    //initSortableList(ev, true);
    ev.preventDefault();
    ev.stopPropagation();
    // const dragBar = document.getElementById("dragbar");
    // if (dragBar) dragBar.style.display = "none";
    const fromLocationId = ev.dataTransfer.getData("dragElementId");
    if (!allActions) return;
    console.log('drop', ev.currentTarget);
    const newActions = moveItem(allActions, fromLocationId, ev.currentTarget.id || 'undefined'); // FIXME: top level container needs to be called "undefined"
    console.log('new actions', newActions);
    updateActions(newActions);
    //ev.target.appendChild(document.getElementById(data));
  }

  //@ts-ignore
  function dragEnter(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    //const dragBar = document.getElementById("dragbar");
    //if (dragBar) dragBar.style.display = "block";
    //ev.target.appendChild(dragBar);
  }

  //@ts-ignore
  function dragOver(ev) {
    //initSortableList(ev, false);
    // const fromLocationId = ev.dataTransfer.getData("dragElementId");
    // const newActions = moveItem(
    //   allActions,
    //   fromLocationId,
    //   ev.currentTarget.id || "undefined"
    // );
    // console.log("new actions", newActions);
    // updateActions(newActions);
    ev.preventDefault();
    ev.stopPropagation();
  }

  //@ts-ignore
  function handleDragLeave(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  return (
    //@ts-ignore
    <section
    //handle event bubbling: onDropCapture ?
      onDrop={drop}
      onDragEnter={dragEnter}
      onDragOver={dragOver}
      onDragLeave={handleDragLeave}
      id={id}
    >
      {actions?.map((action, index) => (
        <ActionItem
          id={`${id}.${index}`}
          key={`${id}.${index}`}
          action={action}
          allActions={allActions}
          updateActions={updateActions}
        />
      ))}
      <AddActionButtons
        location={(id + '.' + actions.length)?.replace(/^undefined\./, '').split('.')}
        addAction={(action, location) => updateActions(addItem(allActions, location, action))}
      />
    </section>
  );
}

//draggable
export function ActionItem({
  action,
  updateActions,
  id,
  allActions,
}: {
  id: string;
  action: Action;
  updateActions: (actions: Action[]) => void;
  allActions: Action[];
}) {
  const style = {
    flex: 1,
    position: "relative",
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
    ev.dataTransfer.setData("dragElementId", ev.target.id);
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
        id={id}
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
        id={id}
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
            id={`${id}.then`}
            allActions={allActions}
            actions={action.then}
            updateActions={updateActions
            }
          />
          <h3>Otherwise</h3>
          <ActionList
            id={`${id}.else`}
            allActions={allActions}
            actions={action.else}
            updateActions={updateActions
            }
          />
        </section>
      );
    case "loop":
      return (
        <section
          id={id}
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
            id={`${id}.do`}
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
  location: string[],
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
