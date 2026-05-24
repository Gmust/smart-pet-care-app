import type { Icon } from "../icons";
import { UtensilsCrossedIcon } from "./UtensilsCrossedIcon";
import { UtensilsIcon } from "./UtensilsIcon";

type UtensilsIcons = {
  Default: Icon;
  Crossed: Icon;
};

const Utensils: UtensilsIcons = {
  Default: UtensilsIcon,
  Crossed: UtensilsCrossedIcon,
};

export { UtensilsCrossedIcon, UtensilsIcon };
export default Utensils;
