import { memo } from "react";
import {  Menu } from "semantic-ui-react";
export const MenuItem = memo(
  ({ onClick, name, active, title, disabled, children }) => (
    <Menu.Item
      onClick={onClick}
      name={name}
      active={active}
      title={title}
      disabled={disabled}
    >
      {children}
    </Menu.Item>
  )
);
