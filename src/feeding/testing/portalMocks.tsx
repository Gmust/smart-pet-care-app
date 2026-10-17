/// <reference types="jest" />

// Stand-ins for the portal primitives, as plain View trees. Built with createElement because
// jest.mock factories reject JSX.
import { createElement } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type WithChildren = { children?: ReactNode };

const passthrough = (testID: string) => {
  const Passthrough = ({ children }: WithChildren) => createElement(View, { testID }, children);
  Passthrough.displayName = `Mock(${testID})`;
  return Passthrough;
};

export const drawerMock = () => ({
  Drawer: ({ open, children }: WithChildren & { open?: boolean }) =>
    open ? createElement(View, { testID: "drawer" }, children) : null,
  DrawerContent: passthrough("drawer-content"),
  DrawerHeader: passthrough("drawer-header"),
  DrawerTitle: passthrough("drawer-title"),
  DrawerFooter: passthrough("drawer-footer"),
  DrawerScrollView: passthrough("drawer-scroll"),
  DrawerCloseButton: () => null,
  useDrawerNativeActivity: () => () => undefined,
  useDrawerSetOpen: () => () => undefined,
  useDrawerClose: () => () => undefined,
  DRAWER_FOOTER_FADE_SPACING: 30,
});

export const dropdownMenuMock = () => ({
  DropdownMenu: ({ children }: WithChildren) => createElement(View, null, children),
  DropdownMenuTrigger: ({ children }: WithChildren) => children,
  DropdownMenuContent: ({ children }: WithChildren) => createElement(View, null, children),
  DropdownMenuItem: ({ children, onPress }: WithChildren & { onPress?: () => void }) =>
    createElement(Pressable, { onPress }, children),
});

export const dialogMock = () => {
  const plain = ({ children }: WithChildren) => createElement(View, null, children);
  return {
    Dialog: ({ open, children }: WithChildren & { open?: boolean }) =>
      open ? createElement(View, { testID: "dialog" }, children) : null,
    DialogContent: plain,
    DialogHeader: plain,
    DialogFooter: plain,
    DialogClose: ({ children }: WithChildren) => children,
    DialogTitle: ({ children }: WithChildren) => createElement(Text, null, children),
    DialogDescription: ({ children }: WithChildren) => createElement(Text, null, children),
  };
};
