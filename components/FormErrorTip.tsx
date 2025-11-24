import { Text } from "react-native";

const FormErrorTip = ({ tip }: { tip: string }) => {
  return <Text style={{ color: "red" }}>{tip}</Text>;
};

export default FormErrorTip;
