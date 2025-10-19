import BouncyCheckbox from "react-native-bouncy-checkbox";

interface CheckboxProps {
  size?: number;
  text?: string;
  fillColor?: string;
  onPress: (checked: boolean) => void;
}

const Checkbox = ({ 
  size = 20, 
  text, 
  fillColor,
  onPress 
}: CheckboxProps) => {
  return (
    <BouncyCheckbox 
      size={size} 
      text={text} 
      fillColor={fillColor}
      onPress={onPress}
    />
  )
};

export default Checkbox;