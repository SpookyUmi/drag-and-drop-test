import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableContainer, { Container } from "./container";
import SortableItem, { Item } from "./sortable_item";

const wrapperStyle = {
  background: "#202226",
  padding: "50px 10px",
  borderRadius: 8,
  margin: 50,
};

export default function App() {
  const [data, setData] = useState({
    items: [],
  });
  console.log("data", data.items);
  const [activeId, setActiveId] = useState();

  const highContainers = data.items.filter((el) => el.type === "highContainer");
  const containers = data.items.filter((el) => el.type === "container");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div>
      <div>
        <button style={{ margin: 5 }} onClick={addItem(true, true)}>
          Add Higher Container
        </button>
        {highContainers.length ? (
          <button style={{ margin: 5 }} onClick={addItem(true)}>
            Add Container
          </button>
        ) : null}
        {highContainers.length && containers.length ? (
          <button style={{ margin: 5 }} onClick={addItem()}>
            Add Item
          </button>
        ) : null}
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        strategy={closestCorners}
      >
        <SortableContext
          id="root"
          items={getItemIds()}
          strategy={verticalListSortingStrategy}
        >
          <div style={wrapperStyle}>
            {getItems().map((item) => {
              if (item.container) {
                return (
                  <SortableContainer
                    key={item.id}
                    id={item.id}
                    getItems={getItems}
                    row={item.row}
                  />
                );
              }

              return (
                <SortableItem key={item.id} id={item.id}>
                  <Item id={item.id} />
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay>{getDragOverlay()}</DragOverlay>
      </DndContext>
    </div>
  );

  function addItem(container, row) {
    const type = container ? (row ? "highContainer" : "container") : "item";
    return () => {
      setData((prev) => ({
        items: [
          ...prev.items,
          {
            type,
            id: prev.items.length + 1,
            container,
            row,
            parent:
              (type === "item" && containers[0].id) ||
              (type === "container" && highContainers[0].id),
          },
        ],
      }));
    };
  }

  function isContainer(id) {
    const item = data.items.find((item) => item.id === id);

    return !item ? false : item.container;
  }

  function isRow(id) {
    const item = data.items.find((item) => item.id === id);

    return !item ? false : item.row;
  }

  function getItems(parent) {
    return data.items.filter((item) => {
      if (!parent) {
        return !item.parent;
      }

      return item.parent === parent;
    });
  }

  function getItemIds(parent) {
    return getItems(parent).map((item) => item.id);
  }

  function findParent(id) {
    const item = data.items.find((item) => item.id === id);
    return !item ? false : item.parent;
  }

  function getDragOverlay() {
    if (!activeId) {
      return null;
    }

    if (isContainer(activeId)) {
      const item = data.items.find((i) => i.id === activeId);

      return (
        <Container
          row={item.row}
          style={{ backgroundColor: item.row ? "#5D41A3" : "#3C424D" }}
        ></Container>
      );
    }

    return <Item id={activeId} />;
  }

  function handleDragStart(event) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    const { id: activeId } = active;
    let overId;
    const activeIsRow = isRow(activeId);
    const activeIsContainer = isContainer(activeId);

    if (over) {
      overId = over.id;
    } else {
      // containers and items can't be dropped in the main parent
      if (activeIsContainer && !activeIsRow) return;
      if (!activeIsContainer && !activeIsRow) return;
    }

    const overParent = findParent(overId);
    const overIsContainer = isContainer(overId);

    if (overIsContainer) {
      const overIsRow = isRow(overId);

      // only containers to be added to highContainers
      if (overIsRow) {
        if (activeIsRow) return;
        if (!activeIsContainer) return;
      } else if (activeIsContainer) {
        return;
      }
    }

    setData((prev) => {
      const activeIndex = prev.items.findIndex((item) => item.id === activeId);
      const overIndex = prev.items.findIndex((item) => item.id === overId);
      let newIndex = overIndex;

      const draggingRect = active.rect;
      const overRect = over?.rect;

      const isBelowLastItem =
        overIndex === prev.items.length - 1 &&
        overRect &&
        draggingRect.top > overRect.top;

      const modifier = isBelowLastItem ? 1 : 0;

      newIndex =
        overIndex >= 0 ? overIndex + modifier : prev.items.length + modifier;

      let nextParent;

      if (overId) {
        nextParent = overIsContainer ? overId : overParent;
      }

      prev.items[activeIndex].parent = nextParent;
      const nextItems = arrayMove(prev.items, activeIndex, newIndex);

      return {
        items: nextItems,
      };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const { id } = active;
    let overId;
    if (over) {
      overId = over.id;
    }

    const activeIndex = data.items.findIndex((item) => item.id === id);
    const overIndex = data.items.findIndex((item) => item.id === overId);

    let newIndex = overIndex >= 0 ? overIndex : 0;

    if (activeIndex !== overIndex) {
      setData((prev) => ({
        items: arrayMove(prev.items, activeIndex, newIndex),
      }));
    }

    setActiveId(null);
  }
}
