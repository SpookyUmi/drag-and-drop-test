import React, { CSSProperties } from "react";
import "./Sortable.css";

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties["cursor"];
}

export function Action({ active, className, cursor, style, ...props }: ActionProps) {
  return (
    <button
      {...props}
      className={`Action ${className}`}
      tabIndex={0}
      style={
        {
          ...style,
          cursor,
          "--fill": active?.fill,
          "--background": active?.background,
        } as CSSProperties
      }
    />
  );
}
