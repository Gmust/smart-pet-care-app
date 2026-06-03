import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { CatIcon } from "@/icons/pets";
import type { Option } from "@/shadecn/ui/select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadecn/ui/select";
import { palette } from "@/styles/palette";

import "@/styles/config";

const MOCK_PETS: Option[] = [
  { value: "miso", label: "Miso · Domestic" },
  { value: "luna", label: "Luna · British Shorthair" },
  { value: "biscuit", label: "Biscuit · Maine Coon" },
];

export function PetSwitcher() {
  return (
    <Select defaultValue={MOCK_PETS[0]}>
      <SelectTrigger style={styles.trigger}>
        <View style={styles.portrait}>
          <CatIcon width={20} height={20} color={palette.brand.textOnDark} />
        </View>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MOCK_PETS.map((pet) => (
          <SelectItem key={pet?.value} value={pet?.value ?? ""} label={pet?.label ?? ""} />
        ))}
      </SelectContent>
    </Select>
  );
}

const styles = StyleSheet.create((theme) => ({
  trigger: {
    paddingLeft: theme.spacing(1.5),
  },
  portrait: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primaryDefault,
  },
}));
