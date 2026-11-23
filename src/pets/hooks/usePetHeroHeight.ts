import { useWindowDimensions } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { PET_PHOTO_ASPECT_RATIO } from "../constants";

// The hero's frame is the photo's crop frame, measured from the page width. `aspectRatio` in the
// style left the width and the height to disagree once the sibling scroll view took its share.
export const usePetHeroHeight = () => {
  const { width } = useWindowDimensions();
  const { theme } = useUnistyles();

  return (width - 2 * theme.spacing(4)) / PET_PHOTO_ASPECT_RATIO;
};
