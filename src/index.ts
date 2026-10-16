import "./styles/config";
import "./api/config";
// Last: expo-router evaluates route files (and their StyleSheet.create calls) as soon
// as it loads, so StyleSheet.configure above must already have run.
import "expo-router/entry";
