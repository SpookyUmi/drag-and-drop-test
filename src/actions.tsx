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

//droppable
export function ActionList({
  actions,
  updateActions,
  id
}: {
  actions: Action[];
  updateActions: (actions: Action[]) => void;
  id: string;
}) {
  //@ts-ignore
  const initSortableList = (e, drop) => {
    e.preventDefault();
    //const draggingItem = document.querySelector(".dragging") as HTMLElement;
    const draggingItem = drop
      ? (document.querySelector(".dragging") as HTMLElement)
      : (document.getElementById("dragbar") as HTMLElement);
    if (draggingItem && !drop) draggingItem.style.display = "block";
    const actionList = document.getElementById(id);
    // Getting all items except currently dragging and making array of them
    let siblings = [
      ...(actionList?.querySelectorAll(
        ":not(.dragging)"
      ) as NodeListOf<Element>),
    ] as HTMLElement[];
    // Finding the sibling after which the dragging item should be placed
    let nextSibling = siblings.find((sibling) => {
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    // Inserting the dragging item before the found sibling
    actionList?.insertBefore(draggingItem as HTMLElement, nextSibling as HTMLElement);
  };

  //@ts-ignore
  function drop(ev) {
    initSortableList(ev, true);
    ev.preventDefault();
    ev.stopPropagation();
    const dragBar = document.getElementById("dragbar");
    if (dragBar) dragBar.style.display = "none";
    const data = ev.dataTransfer.getData("dragElement");
    //ev.target.appendChild(document.getElementById(data));
  }

  //@ts-ignore
  function dragEnter(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    // const dragBar = document.getElementById("dragbar");
    // if (dragBar) dragBar.style.display = "block";
    // ev.target.appendChild(dragBar);
  }

  //@ts-ignore
  function dragOver(ev) {
    initSortableList(ev, false);
    ev.preventDefault();
    ev.stopPropagation();
  }

  //@ts-ignore
  function handleDragLeave(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    // const dragBar = document.getElementById(dragBarId as string);
    // if (dragBar) dragBar.style.display = "none";
  }

  return (
    //@ts-ignore
    <section
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
          updateAction={(action) =>
            updateActions([
              ...actions.slice(0, index),
              action,
              ...actions.slice(index + 1),
            ])
          }
        />
      ))}
      <AddActionButtons
        addAction={(newAction) => updateActions([...actions, newAction])}
      />
    </section>
  );
}

//draggable
export function ActionItem({
  action,
  updateAction,
  id
}: {
  id: string;
  action: Action;
  updateAction: (actions: Action) => void;
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
  // function drag(ev) {
  //   ev.dataTransfer.setData("dragElement", ev.target.id);
  // }

  //@ts-ignore
  function handleDragStart(ev) {
    //ev.preventDefault();
    ev.dataTransfer.setData("dragElement", ev.target.id);
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
          id={`${id}.delay`}
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
          id={`${id}.if_else`}
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
            actions={action.then}
            updateActions={(actions) =>
              updateAction({ ...action, then: actions })
            }
          />
          <h3>Otherwise</h3>
          <ActionList
            id={`${id}.else`}
            actions={action.else}
            updateActions={(actions) =>
              updateAction({ ...action, else: actions })
            }
          />
        </section>
      );
    case "loop":
      return (
        <section
          id={`${id}.loop`}
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
            actions={action.do}
            updateActions={(actions) =>
              updateAction({ ...action, do: actions })
            }
          />
        </section>
      );
  }
}

export function AddActionButtons({
  addAction,
}: {
  addAction: (action: Action) => void;
}) {
  return (
    <div>
      <button
        style={{ margin: 5 }}
        onClick={() => {
          addAction({ type: "if_else", then: [], else: [] });
        }}
      >
        Add If, Then, Otherwise
      </button>
      <button
        style={{ margin: 5 }}
        onClick={() => {
          addAction({ type: "loop", do: [] });
        }}
      >
        Add Loop
      </button>
      <button
        style={{ margin: 5 }}
        onClick={() => {
          addAction({ type: "delay" });
        }}
      >
        Add Delay
      </button>
    </div>
  );
}
